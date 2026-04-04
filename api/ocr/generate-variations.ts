// @ts-ignore
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MASTER_MODEL = 'gemini-2.5-flash';

// ─── Inline JSON Repair (same 3-strategy as api/generate.ts) ──────────────
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
  while (stack.length > 0) str += stack.pop()!;
  return str;
};

const tryRepairJson = (jsonStr: string): unknown => {
  if (!jsonStr) throw new Error('AI yanıt boş.');
  let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
    .replace(/^```json[\s\S]*?\n/, '')
    .replace(/^```\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim();
  const fb = cleaned.indexOf('{'), fl = cleaned.indexOf('[');
  let si = -1;
  if (fb !== -1 && fl !== -1) si = Math.min(fb, fl);
  else if (fb !== -1) si = fb;
  else if (fl !== -1) si = fl;
  if (si > 0) cleaned = cleaned.substring(si);
  try { return JSON.parse(cleaned); } catch { /* devam */ }
  try { return JSON.parse(balanceBraces(cleaned)); } catch { /* devam */ }
  try {
    const lc = cleaned.lastIndexOf(',');
    if (lc > 0) return JSON.parse(balanceBraces(cleaned.substring(0, lc)));
  } catch { /* devam */ }
  throw new Error('JSON parse başarısız. Ham: ' + cleaned.substring(0, 200));
};

// ─── Inline Rate Limiter ─────────────────────────────────────────────────
const requestLog = new Map<string, number[]>();
const RATE_LIMIT = { windowMs: 60_000, max: 5 };

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const times = (requestLog.get(userId) ?? []).filter(t => now - t < RATE_LIMIT.windowMs);
  if (times.length >= RATE_LIMIT.max) return false;
  times.push(now);
  requestLog.set(userId, times);
  return true;
};

// ─── Type Guards ─────────────────────────────────────────────────────────
interface OCRBlueprint {
  title: string;
  detectedType: string;
  worksheetBlueprint: string;
  layoutHints?: { columns: number; hasImages: boolean; questionCount: number };
}

interface VariationConfig {
  targetProfile: string;
  ageGroup: string;
  difficultyLevel: string;
  preserveLayout: boolean;
  preserveStructure: boolean;
}

interface RequestBody {
  blueprint: OCRBlueprint;
  count: number;
  userId: string;
  config: VariationConfig;
}

const isValidRequestBody = (body: unknown): body is RequestBody => {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  if (typeof b['blueprint'] !== 'object' || b['blueprint'] === null) return false;
  const bp = b['blueprint'] as Record<string, unknown>;
  if (typeof bp['worksheetBlueprint'] !== 'string' || !bp['worksheetBlueprint']) return false;
  if (typeof b['count'] !== 'number' || b['count'] < 1 || b['count'] > 10) return false;
  if (typeof b['config'] !== 'object' || b['config'] === null) return false;
  return true;
};

interface VariationItem {
  text?: string;
  answer?: string;
  options?: string[];
  [key: string]: unknown;
}

interface SingleVariation {
  title: string;
  type: string;
  instruction: string;
  items: VariationItem[];
  pedagogicalNote: string;
  difficulty: string;
  ageGroup: string;
  profile: string;
  id?: string;
}

const isValidVariation = (v: unknown): v is SingleVariation => {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['title'] === 'string' &&
    typeof obj['instruction'] === 'string' &&
    Array.isArray(obj['items']) &&
    typeof obj['pedagogicalNote'] === 'string' &&
    obj['pedagogicalNote'].length > 0
  );
};

// ─── Gemini Call ──────────────────────────────────────────────────────────
const generateVariationsWithGemini = async (
  blueprint: OCRBlueprint,
  count: number,
  config: VariationConfig,
  apiKey: string
): Promise<SingleVariation[]> => {
  const profileLabels: Record<string, string> = {
    dyslexia: 'disleksi desteğine ihtiyacı var',
    dyscalculia: 'diskalkuli desteğine ihtiyacı var',
    adhd: 'DEHB desteğine ihtiyacı var',
    mixed: 'karma özel öğrenme desteğine ihtiyacı var',
  };
  const profileLabel = profileLabels[config.targetProfile] ?? 'özel öğrenme desteğine ihtiyacı var';

  const prompt = `
[VARYASYON ÜRETIM MOTORU - OOGMATIK]
Aşağıdaki çalışma sayfası blueprint'ini kullanarak ${count} adet farklı varyasyon üret.

KAYNAK BLUEPRINT:
Başlık: ${blueprint.title}
Tür: ${blueprint.detectedType}
Mimari DNA:
${blueprint.worksheetBlueprint}

ÖĞRENCİ PROFİLİ:
- Profil: ${profileLabel}
- Yaş grubu: ${config.ageGroup}
- Zorluk seviyesi: ${config.difficultyLevel}
- Yerleşim korunacak mı: ${config.preserveLayout ? 'Evet' : 'Hayır'}

VARYASYON KURALLARI:
1. Her varyasyonun yapısı (soru tipi, format, bölüm sayısı) AYNI olmalı.
2. Sadece içerik (sorular, sayılar, kelimeler, metinler) farklı olmalı.
3. İlk soru/madde mutlaka kolay olmalı (başarı mimarisi — güven inşası).
4. Türkçe içerik üret.
5. Tanı koyucu dil KULLANMA: "disleksisi var" değil dolaylı ifade kullan.
6. pedagogicalNote alanı ZORUNLU: Öğretmene bu aktivitenin pedagojik katkısını açıkla.

ÇIKTI: ${count} elemanlı JSON dizisi.`;

  const responseSchema = {
    type: 'ARRAY',
    items: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING' },
        type: { type: 'STRING' },
        instruction: { type: 'STRING' },
        items: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              text: { type: 'STRING' },
              answer: { type: 'STRING' },
              options: { type: 'ARRAY', items: { type: 'STRING' } },
            },
            required: ['text'],
          },
        },
        pedagogicalNote: { type: 'STRING' },
        difficulty: { type: 'STRING' },
        ageGroup: { type: 'STRING' },
        profile: { type: 'STRING' },
      },
      required: ['title', 'type', 'instruction', 'items', 'pedagogicalNote'],
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MASTER_MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({})) as Record<string, unknown>;
    const errMsg = (errJson?.['error'] as Record<string, unknown>)?.['message'];
    throw new Error(`Gemini API Hatası: ${typeof errMsg === 'string' ? errMsg : response.statusText}`);
  }

  const data = await response.json() as Record<string, unknown>;
  const candidates = data?.['candidates'] as Array<Record<string, unknown>> | undefined;
  const parts = ((candidates?.[0]?.['content'] as Record<string, unknown>)?.['parts']) as Array<Record<string, unknown>> | undefined;
  const rawText = parts?.[0]?.['text'];

  if (typeof rawText !== 'string' || !rawText) {
    throw new Error('Gemini boş yanıt döndürdü (varyasyon).');
  }

  const parsed = tryRepairJson(rawText);
  const arr = Array.isArray(parsed) ? parsed : (parsed as Record<string, unknown>)?.['variations'];
  if (!Array.isArray(arr)) throw new Error('Geçersiz varyasyon formatı (dizi bekleniyor).');

  return arr as SingleVariation[];
};

// ─── Handler ──────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Inline CORS — no import from cors.js to avoid Vercel subdirectory bundling issues
  const requestOrigin = req.headers.origin as string | undefined;
  if (requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Sadece POST destekleniyor.', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString(),
    });
  }

  const startTime = Date.now();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!isValidRequestBody(body)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Geçersiz istek. blueprint.worksheetBlueprint, count (1-10) ve config zorunludur.',
          code: 'VALIDATION_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const { blueprint, count, userId, config } = body;
    const effectiveUserId = (userId as string) || (req.headers['x-user-id'] as string) || 'anonymous';

    // Rate limiting
    if (!checkRateLimit(effectiveUserId)) {
      return res.status(429).json({
        success: false,
        error: {
          message: 'Çok hızlı istek gönderdiniz. 60 saniye sonra tekrar deneyiniz.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // API Key
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: { message: 'Sunucu yapılandırma hatası (API Key).', code: 'CONFIGURATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    // Generate variations
    const rawVariations = await generateVariationsWithGemini(blueprint, count, config, apiKey);

    // Filter valid variations and add IDs
    const warnings: string[] = [];
    const variations = rawVariations
      .filter((v, i) => {
        if (!isValidVariation(v)) {
          warnings.push(`Varyasyon ${i + 1} geçersiz format, atlandı.`);
          return false;
        }
        return true;
      })
      .map((v, i) => ({ ...v, id: `ocr-variation-${Date.now()}-${i}` }));

    if (variations.length === 0) {
      return res.status(500).json({
        success: false,
        error: { message: 'Hiçbir geçerli varyasyon üretilemedi. Lütfen tekrar deneyin.', code: 'NO_VALID_VARIATIONS' },
        timestamp: new Date().toISOString(),
      });
    }

    const quality: 'high' | 'medium' | 'low' =
      variations.length === count ? 'high'
      : variations.length >= count / 2 ? 'medium'
      : 'low';

    return res.status(200).json({
      success: true,
      data: {
        variations,
        metadata: {
          requestedCount: count,
          successfulCount: variations.length,
          quality,
          warnings: warnings.length > 0 ? warnings : undefined,
          processingTimeMs: Date.now() - startTime,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen sunucu hatası.';
    console.error('[OCR Variations] Hata:', message);
    return res.status(500).json({
      success: false,
      error: { message: 'Varyasyon üretimi başarısız oldu. Lütfen tekrar deneyin.', code: 'INTERNAL_ERROR' },
      timestamp: new Date().toISOString(),
    });
  }
}
