// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  AppError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  toAppError,
} from '../src/utils/AppError.js';
import { validateGenerateActivityRequest } from '../src/utils/schemas.js';
import { RateLimiter } from '../src/services/rateLimiter.js';
import { retryWithBackoff, logError } from '../src/utils/errorHandler.js';
import {
  validatePromptSecurity,
  sanitizePromptInput,
  quickThreatCheck,
  DEFAULT_MAX_LENGTH,
} from '../src/utils/promptSecurity.js';
import { corsMiddleware } from '../src/utils/cors.js';

// ============================================================
// JSON ONARIM MOTORU (api/generate.ts — server-side)
// geminiClient.ts ile aynı 3-katmanlı strateji
// ============================================================

const balanceBraces = (str: string): string => {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if ((ch === '}' || ch === ']') && stack.length > 0) stack.pop();
  }
  if (inString) str += '"';
  while (stack.length > 0) str += stack.pop();
  return str;
};

const tryRepairJson = (jsonStr: string): unknown => {
  if (!jsonStr) throw new Error('AI yanit bos.');

  let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  // Markdown code block temizle
  cleaned = cleaned
    .replace(/^```json[\s\S]*?\n/, '')
    .replace(/^```\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim();

  // JSON baslangicini bul
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIndex = -1;
  if (firstBrace !== -1 && firstBracket !== -1) startIndex = Math.min(firstBrace, firstBracket);
  else if (firstBrace !== -1) startIndex = firstBrace;
  else if (firstBracket !== -1) startIndex = firstBracket;
  if (startIndex > 0) cleaned = cleaned.substring(startIndex);

  // Strateji 1: Direkt parse
  try { return JSON.parse(cleaned); } catch { /* devam */ }

  // Strateji 2: Eksik parantezleri tamamla
  try { return JSON.parse(balanceBraces(cleaned)); } catch { /* devam */ }

  // Strateji 3: Son virgule kadar kes, tamamla
  try {
    const lastComma = cleaned.lastIndexOf(',');
    if (lastComma > 0) return JSON.parse(balanceBraces(cleaned.substring(0, lastComma)));
  } catch { /* devam */ }

  throw new Error('JSON parse tamamen basarisiz. Ham: ' + cleaned.substring(0, 200));
};

// Types are imported from @vercel/node above

const MASTER_MODEL = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun (Oogmatik) kıdemli eğitim mimarı ve pedagoji uzmanısın. [MINIMAL_DEPLOY: 2024_03_18_v4]
MİSYON: 4-8. sınıf seviyesinde, MEB 2024-2025 müfredatıyla %100 uyumlu, LGS/PISA standartlarında "Premium" içerik üretmek.
PEDAGOJİK DNA:
1. Disleksi hassasiyeti: Cümleler net, yönergeler adım adım ve görselleştirilebilir olmalı.
2. Analitik Derinlik: Sadece bilgi sorma; öğrenciye çıkarım yaptır, veriyi yorumlat (LGS Mantığı).
3. Scaffolding: Zor konularda soru başında mutlaka kısa hatırlatıcı kurallar (bilgi notları) sağla.
4. KESİN KURAL: Çıktı JSON objesinde mutlaka 'pedagogicalNote' alanını bulundur ve aktivitenin çocuğa pedagojik katkısını öğretmene/veliye açıkla.
KURAL: Yanıtın SADECE geçerli bir JSON olmalıdır. Üretimden önce içeriğin pedagojik güvenliğini ve müfredat kazanımını 10 katmanlı bir süzgeçten geçir.
`;

const rateLimiter = new RateLimiter();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Security - Origin validation (NO WILDCARD!)
  // Muhendislik Direktoru Bora Demir: Wildcard (*) YASAK
  if (!corsMiddleware(req, res)) {
    // CORS failed or OPTIONS handled
    return;
  }

  if (req.method !== 'POST') {
    return handleError(res, new AppError('Sadece POST kabul edilir.', 'METHOD_NOT_ALLOWED', 405));
  }

  try {
    // 1. Basic Validation
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { prompt, schema, image, mimeType, userId, systemInstruction, model } = body;

    const validation = validateGenerateActivityRequest(body);
    if (!validation.valid) {
      logError(new ValidationError("Generate Payload Validation Warning/Error: " + JSON.stringify(validation.errors)));
      // Sadece prompt eksik veya hatali ise uretimi durdur, activityType vs. eksikse tolere et
      if (validation.errors.prompt || !prompt) {
        return handleError(res, new ValidationError(
          validation.errors.prompt || 'Prompt (Talimat) eksik veya geçersiz.',
          validation.errors
        ));
      }
    }

    // 2. Prompt Injection Security Check
    // AI Direktoru Selin Arslan: Her prompt AI'a gonderilmeden once guvenlik kontrolunden gecmeli
    const actualUserId = userId || (req.headers['x-user-id'] as string) || 'anonymous';
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      'unknown';

    // Quick threat check for fast rejection of obvious attacks
    if (quickThreatCheck(prompt)) {
      logError(new ValidationError('Prompt injection attempt detected (quick check)', {
        userId: actualUserId,
        ip: clientIp,
        prompt: prompt?.substring(0, 100),
      }));
    }

    // Full security validation
    const securityResult = validatePromptSecurity(prompt, {
      maxLength: DEFAULT_MAX_LENGTH,
      enableLogging: true,
      blockOnThreat: true,
      threatThreshold: 'medium',
    }, {
      userId: actualUserId,
      ipAddress: clientIp,
    });

    if (!securityResult.isSafe) {
      const threatCategories = [...new Set(securityResult.threats.map(t => t.category))];
      logError(new ValidationError('Prompt injection blocked', {
        userId: actualUserId,
        ip: clientIp,
        threatCount: securityResult.threats.length,
        categories: threatCategories,
      }));

      return handleError(res, new ValidationError(
        'Guvenlik kontrolunden gecemeyen ifadeler tespit edildi. Lutfen talebinizi yeniden duzenleyin.',
        {
          code: 'PROMPT_INJECTION_DETECTED',
          threatCount: securityResult.threats.length,
        }
      ));
    }

    // Use sanitized prompt for AI call
    const sanitizedPrompt = securityResult.sanitizedInput;

    // 3. Rate Limiting
    const userTier = (req.headers['x-user-tier'] as string) || 'free';
    try {
      await rateLimiter.enforceLimit(actualUserId, userTier as any, 'apiGeneration');
    } catch (error) {
      if (error instanceof RateLimitError) return handleError(res, error);
      throw error;
    }

    // 4. API Key (Server-side only - NO VITE_ prefix!)
    // Muhendislik Direktoru Bora Demir: VITE_ prefix browser'a expose eder!
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new InternalServerError('API Key bulunamadi (Sunucu Yapilandirma Hatasi).');
    }

    // 5. AI Call with Direct REST API (No SDK)
    const result = await retryWithBackoff(
      async () => {
        let selectedModel = model || MASTER_MODEL;
        // Eski onbelleklenmis verilerden gelebilecek kullanim disi modelleri engelle
        if (selectedModel.includes('gemini-2.0') || selectedModel.includes('gemini-1.5') || selectedModel.includes('gemini-3')) {
          selectedModel = MASTER_MODEL;
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

        const contents = [
          {
            role: 'user',
            parts: [] as any[],
          },
        ];

        // Image support
        if (image) {
          contents[0].parts.push({
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ''),
            },
          });
        }

        // Insert system instruction into the user prompt to maintain AI behavior
        // IMPORTANT: Use sanitizedPrompt instead of raw prompt
        const combinedPrompt = `[SISTEM TALIMATI BASLANGICI]\n${systemInstruction || SYSTEM_INSTRUCTION}\n[SISTEM TALIMATI BITISI]\n\n[KULLANICI ISTEGI]:\n${sanitizedPrompt}`;

        // Text prompt
        contents[0].parts.push({ text: combinedPrompt });

        // CRITICAL: We remove generationConfig and systemInstruction COMPLETELY
        // to ensure NO SNAKE_CASE fields are ever sent to Google API from this proxy.
        // Google will use the prompt-embedded instructions.
        const requestBody: Record<string, unknown> = {
          contents
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new InternalServerError(
            `Gemini API Hatasi: ${errJson.error?.message || response.statusText}`
          );
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new InternalServerError('AI yaniti bos donderdi.');
        }

        return { text };
      },
      { maxRetries: 2 }
    );

    // 6. Success — JSON Repair Engine ile parse et
    res.setHeader('X-Oogmatik-Deploy', '2024-03-18-v4-MINIMAL');
    res.setHeader('X-Prompt-Security', 'validated');
    try {
      const parsed = tryRepairJson(result.text);
      return res.status(200).json(parsed);
    } catch {
      // Gemini düz metin döndürdüyse (SVG gibi) string olarak dön
      return res.status(200).json({ text: result.text });
    }
  } catch (error: unknown) {
    return handleError(res, toAppError(error));
  }
}

function handleError(res: VercelResponse, error: AppError) {
  logError(error);
  return res.status(error.httpStatus).json({
    error: { message: error.userMessage, code: error.code },
  });
}
