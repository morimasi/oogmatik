// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  AppError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  toAppError,
} from '../utils/AppError.js';
import { validateGenerateActivityRequest } from '../utils/schemas.js';
import { RateLimiter } from '../services/rateLimiter.js';
import { retryWithBackoff, logError } from '../utils/errorHandler.js';
import {
  validatePromptSecurity,
  sanitizePromptInput,
  quickThreatCheck,
  DEFAULT_MAX_LENGTH,
} from '../utils/promptSecurity.js';
import { corsMiddleware } from '../utils/cors.js';

// Types are imported from @vercel/node above

const MASTER_MODEL = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun (Oogmatik) kıdemli eğitim mimarı ve pedagoji uzmanısın. [MINIMAL_DEPLOY: 2024_03_18_v4]
MİSYON: 4-8. sınıf seviyesinde, MEB 2024-2025 müfredatıyla %100 uyumlu, LGS/PISA standartlarında "Premium" içerik üretmek.
PEDAGOJİK DNA:
1. Disleksi hassasiyeti: Cümleler net, yönergeler adım adım ve görselleştirilebilir olmalı.
2. Analitik Derinlik: Sadece bilgi sorma; öğrenciye çıkarım yaptır, veriyi yorumlat (LGS Mantığı).
3. Scaffolding: Zor konularda soru başında mutlaka kısa hatırlatıcı kurallar (bilgi notları) sağla.
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
    const { prompt, schema, image, mimeType, userId, systemInstruction, model } = req.body;

    // 1. Basic Validation
    const validation = validateGenerateActivityRequest(req.body);
    if (!validation.valid) {
      return handleError(res, new ValidationError(
        Object.values(validation.errors).join(', '),
        validation.errors
      ));
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

    // 6. Success
    res.setHeader('X-Oogmatik-Deploy', '2024-03-18-v4-MINIMAL');
    res.setHeader('X-Prompt-Security', 'validated');
    return res.status(200).json(JSON.parse(result.text));
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
