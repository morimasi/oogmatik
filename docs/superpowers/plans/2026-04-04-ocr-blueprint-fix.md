# OCR Blueprint Fix + Generate-Variations Endpoint Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two OCR failures: (1) `Blueprint boş döndü` error caused by missing `responseMimeType`/`responseSchema` in the Gemini API call inside `ocrService.ts`, and (2) 404 on `POST /api/ocr/generate-variations` because the endpoint was never created.

**Architecture:** Fix 1 modifies `callGeminiWithImage()` to pass `generationConfig` with `responseMimeType: 'application/json'` and `responseSchema` so Gemini reliably returns structured JSON. Fix 2 creates a self-contained Vercel serverless handler at `api/ocr/generate-variations.ts` that calls Gemini directly (no external imports from src/) to produce worksheet variations from an OCR blueprint.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

## File Map

| Action   | Path                                       | Responsibility                                       |
|----------|--------------------------------------------|------------------------------------------------------|
| Modify   | `src/services/ocrService.ts`               | Pass schema + responseMimeType to Gemini REST call   |
| Create   | `api/ocr/generate-variations.ts`           | POST handler: blueprint → N worksheet variations     |
| Create   | `tests/ocrService.test.ts`                 | Unit tests for blueprint validation logic            |
| Create   | `tests/ocr-generate-variations.test.ts`    | Unit tests for the new endpoint's input validation   |

---

## Task 1: Fix `callGeminiWithImage` in `ocrService.ts`

**Root Cause:** The `_schema` variable (lines 202-228) is defined inside `processImage` but **never passed** to `callGeminiWithImage`. The Gemini REST call has no `generationConfig`, so the model returns free-text markdown. The JSON repair engine parses it, but the resulting object often has an empty `worksheetBlueprint` field, triggering `validateBlueprint()` → "Blueprint boş döndü." AppError.

**Files:**
- Modify: `src/services/ocrService.ts`

- [ ] **Step 1: Understand the existing signature**

  Read `src/services/ocrService.ts` lines 17-97 (`callGeminiWithImage`) and lines 179-261 (`processImage`). Confirm:
  - `callGeminiWithImage(base64Image, prompt)` — two params, no schema
  - `_schema` is defined after the prompt but never used
  - The `fetch` body has only `contents`, no `generationConfig`

- [ ] **Step 2: Update `callGeminiWithImage` signature to accept optional schema**

  In `src/services/ocrService.ts`, change:

  ```typescript
  const callGeminiWithImage = async (
      base64Image: string,
      prompt: string
  ): Promise<unknown> => {
  ```

  to:

  ```typescript
  const callGeminiWithImage = async (
      base64Image: string,
      prompt: string,
      schema?: Record<string, unknown>
  ): Promise<unknown> => {
  ```

- [ ] **Step 3: Add `generationConfig` to the Gemini request body**

  Inside `callGeminiWithImage`, change the `fetch` call's body from:

  ```typescript
  body: JSON.stringify({
      contents: [{
          role: 'user',
          parts: [
              { inlineData: { mimeType, data: imageData } },
              { text: prompt }
          ]
      }]
  })
  ```

  to:

  ```typescript
  body: JSON.stringify({
      contents: [{
          role: 'user',
          parts: [
              { inlineData: { mimeType, data: imageData } },
              { text: prompt }
          ]
      }],
      ...(schema ? {
          generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: schema
          }
      } : {})
  })
  ```

- [ ] **Step 4: Pass `_schema` when calling `callGeminiWithImage` in `processImage`**

  In `processImage`, rename `_schema` to `schema` (remove the underscore prefix — it's now used) and pass it to the call:

  Change:
  ```typescript
  const result = await callGeminiWithImage(base64Image, prompt) as OCRBlueprint;
  ```

  to:
  ```typescript
  const result = await callGeminiWithImage(base64Image, prompt, schema) as OCRBlueprint;
  ```

  Also rename `const _schema = {` → `const schema = {`.

- [ ] **Step 5: Update the prompt to explicitly request JSON**

  The prompt in `processImage` does not mention JSON output. With `responseMimeType: 'application/json'` set, Gemini enforces the schema automatically — but add a clear JSON instruction at the end for robustness:

  At the end of the `prompt` template literal (after the last line), append:

  ```
  ÇIKTI FORMAT: Yukarıdaki analiz sonucunu JSON formatında döndür.
  worksheetBlueprint alanı MUTLAKA doldurulmalıdır (boş bırakılamaz).
  ```

- [ ] **Step 6: Build to confirm no TypeScript errors**

  ```bash
  npm run build
  ```

  Expected: Build succeeds with no new errors in `ocrService.ts`.

- [ ] **Step 7: Commit**

  ```bash
  git add src/services/ocrService.ts
  git commit -m "fix(ocr): pass responseSchema to Gemini to prevent empty blueprint"
  ```

---

## Task 2: Write tests for `ocrService.ts` validation logic

**Files:**
- Create: `tests/ocrService.test.ts`

- [ ] **Step 1: Write the test file**

  ```typescript
  // tests/ocrService.test.ts
  import { describe, it, expect, vi, beforeEach } from 'vitest';

  // We test the validateBlueprint logic indirectly by mocking fetch and
  // observing that processImage rejects when Gemini returns an empty blueprint.

  // Mock fetch globally
  const mockFetch = vi.fn();
  vi.stubGlobal('fetch', mockFetch);

  // Mock process.env
  vi.stubEnv('API_KEY', 'test-key');

  describe('ocrService.processImage', () => {
    beforeEach(() => {
      mockFetch.mockReset();
    });

    const makeGeminiResponse = (blueprintText: string) => ({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: JSON.stringify({
              title: 'Test',
              detectedType: 'MATH_WORKSHEET',
              worksheetBlueprint: blueprintText,
            }) }]
          }
        }]
      })
    });

    it('rejects with "Blueprint boş döndü" when worksheetBlueprint is empty', async () => {
      mockFetch.mockResolvedValue(makeGeminiResponse(''));

      const { ocrService } = await import('../src/services/ocrService');
      ocrService.clearCache();

      const base64 = 'data:image/jpeg;base64,' + 'A'.repeat(500);
      await expect(ocrService.processImage(base64)).rejects.toThrow('Blueprint boş döndü');
    });

    it('resolves with quality "high" for a rich blueprint', async () => {
      const richBlueprint = 'soru 1: cevap A, bölüm grid tablo hücre liste madde column block. '.repeat(10);
      mockFetch.mockResolvedValue(makeGeminiResponse(richBlueprint));

      const { ocrService } = await import('../src/services/ocrService');
      ocrService.clearCache();

      const base64 = 'data:image/jpeg;base64,' + 'B'.repeat(500);
      const result = await ocrService.processImage(base64);
      expect(result.quality).toBe('high');
      expect(result.structuredData.worksheetBlueprint).toBe(richBlueprint);
    });

    it('resolves with quality "low" and warning when blueprint is shorter than min length', async () => {
      mockFetch.mockResolvedValue(makeGeminiResponse('kısa'));

      const { ocrService } = await import('../src/services/ocrService');
      ocrService.clearCache();

      const base64 = 'data:image/jpeg;base64,' + 'C'.repeat(500);
      const result = await ocrService.processImage(base64);
      expect(result.quality).toBe('low');
      expect(result.warnings).toBeDefined();
    });

    it('includes responseSchema in the Gemini request body', async () => {
      const richBlueprint = 'soru cevap bölüm grid tablo column block hücre liste madde. '.repeat(5);
      mockFetch.mockResolvedValue(makeGeminiResponse(richBlueprint));

      const { ocrService } = await import('../src/services/ocrService');
      ocrService.clearCache();

      const base64 = 'data:image/jpeg;base64,' + 'D'.repeat(500);
      await ocrService.processImage(base64);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.generationConfig).toBeDefined();
      expect(requestBody.generationConfig.responseMimeType).toBe('application/json');
      expect(requestBody.generationConfig.responseSchema).toBeDefined();
    });
  });
  ```

- [ ] **Step 2: Run the tests**

  ```bash
  npm run test:run -- tests/ocrService.test.ts
  ```

  Expected: The first 3 tests pass (validation logic unchanged). The 4th test (`includes responseSchema`) should now pass after Task 1's fix.

- [ ] **Step 3: Commit**

  ```bash
  git add tests/ocrService.test.ts
  git commit -m "test(ocr): add ocrService blueprint validation and schema injection tests"
  ```

---

## Task 3: Create `api/ocr/generate-variations.ts`

**Root Cause:** `OCRScanner.tsx` `handleGenerateVariations()` calls `POST /api/ocr/generate-variations` (line 771) which returns 404 because the file `api/ocr/generate-variations.ts` does not exist.

**Expected request body:**
```typescript
{
  blueprint: {                // OCRBlueprint from ocrService
    title: string;
    detectedType: string;
    worksheetBlueprint: string;
    layoutHints?: { columns: number; hasImages: boolean; questionCount: number };
  };
  count: number;              // 1–10
  userId: string;
  config: {
    targetProfile: string;    // 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed'
    ageGroup: string;         // '5-7' | '8-10' | '11-13' | '14+'
    difficultyLevel: string;  // 'Kolay' | 'Orta' | 'Zor'
    preserveLayout: boolean;
    preserveStructure: boolean;
  };
}
```

**Expected response:**
```typescript
{
  success: true;
  data: {
    variations: SingleWorksheetData[];   // WorksheetData items, rendered by <Worksheet>
    metadata: {
      requestedCount: number;
      successfulCount: number;
      quality: 'high' | 'medium' | 'low';
      warnings?: string[];
      processingTimeMs: number;
    };
  };
  timestamp: string;  // ISO 8601
}
```

**Files:**
- Create: `api/ocr/generate-variations.ts`

- [ ] **Step 1: Create the `api/ocr/` directory**

  ```bash
  mkdir -p api/ocr
  ```

- [ ] **Step 2: Write `api/ocr/generate-variations.ts`**

  Key design decisions (follow the Oogmatik rules):
  - **Self-contained handler** — NO imports from `../../src/utils/cors.js` or `../../src/utils/logger.js` (per memory note: these caused 500s in production)
  - **Inline CORS** — follow `api/ai/generate-image.ts` pattern
  - **Inline JSON repair** — copy the 3-strategy `balanceBraces`/`tryRepairJson` pattern from `api/generate.ts`
  - **Rate limiting** — simple sliding window, inline, no external dep
  - **`pedagogicalNote` REQUIRED** — in the Gemini prompt and response schema
  - **Batch via single Gemini call** — ask Gemini to return all N variations as a JSON array in one request (efficient, avoids N round-trips)
  - **No `any` types** — use `unknown` + type guard

  ```typescript
  // api/ocr/generate-variations.ts
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
    question?: string;
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
5. Tanı koyucu dil KULLANMA: "disleksisi var" değil, "disleksi desteğine ihtiyacı var" gibi dolaylı ifade.
6. pedagogicalNote alanı ZORUNLU: Öğretmene bu aktivitenin pedagojik katkısını açıkla.

ÇIKTI: ${count} elemanlı JSON dizisi. Her eleman aşağıdaki yapıda olmalı:
- title: Varyasyon başlığı (string)
- type: Aktivite türü ("OCR_VARIATION")
- instruction: Öğrenciye yönelik yönerge (string)
- items: Soru/madde dizisi (array of objects with "text" and optional "answer" fields)
- pedagogicalNote: Öğretmene pedagojik açıklama (string, ZORUNLU, min 20 karakter)
- difficulty: "${config.difficultyLevel}"
- ageGroup: "${config.ageGroup}"
- profile: "${config.targetProfile}"
`;

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
    const text = (candidates?.[0]?.['content'] as Record<string, unknown>)?.['parts'];
    const parts = text as Array<Record<string, unknown>> | undefined;
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
    // Inline CORS (no import from cors.js — avoids Vercel bundling issues)
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
      const effectiveUserId = userId || (req.headers['x-user-id'] as string) || 'anonymous';

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
  ```

- [ ] **Step 3: Build to confirm no TypeScript errors**

  ```bash
  npm run build
  ```

  Expected: Build succeeds. No errors in `api/ocr/generate-variations.ts`.

- [ ] **Step 4: Commit**

  ```bash
  git add api/ocr/generate-variations.ts
  git commit -m "feat(api): add POST /api/ocr/generate-variations endpoint"
  ```

---

## Task 4: Write tests for the generate-variations input validation

**Files:**
- Create: `tests/ocr-generate-variations.test.ts`

- [ ] **Step 1: Write the test file**

  ```typescript
  // tests/ocr-generate-variations.test.ts
  import { describe, it, expect, vi, beforeEach } from 'vitest';

  // We test the validation logic (isValidRequestBody, checkRateLimit)
  // by exercising the handler with mock VercelRequest/Response.

  const mockFetch = vi.fn();
  vi.stubGlobal('fetch', mockFetch);
  vi.stubEnv('API_KEY', 'test-api-key');

  // Import handler dynamically after env stub
  const importHandler = async () => {
    const mod = await import('../api/ocr/generate-variations');
    return mod.default;
  };

  const makeReq = (body: unknown, method = 'POST') => ({
    method,
    headers: { 'content-type': 'application/json' },
    body,
  });

  const makeRes = () => {
    const res: Record<string, unknown> = { headers: {} };
    res['status'] = (code: number) => { res['statusCode'] = code; return res; };
    res['json'] = (data: unknown) => { res['body'] = data; return res; };
    res['end'] = () => res;
    res['setHeader'] = (_k: string, _v: string) => res;
    return res as unknown as import('@vercel/node').VercelResponse;
  };

  describe('POST /api/ocr/generate-variations — input validation', () => {
    beforeEach(() => mockFetch.mockReset());

    it('returns 405 for non-POST requests', async () => {
      const handler = await importHandler();
      const res = makeRes();
      await handler(makeReq({}, 'GET') as unknown as import('@vercel/node').VercelRequest, res);
      expect((res as unknown as Record<string, unknown>)['statusCode']).toBe(405);
    });

    it('returns 400 when blueprint is missing', async () => {
      const handler = await importHandler();
      const res = makeRes();
      await handler(makeReq({ count: 3, config: {} }) as unknown as import('@vercel/node').VercelRequest, res);
      expect((res as unknown as Record<string, unknown>)['statusCode']).toBe(400);
    });

    it('returns 400 when count is out of range (0)', async () => {
      const handler = await importHandler();
      const res = makeRes();
      await handler(makeReq({
        blueprint: { worksheetBlueprint: 'test blueprint', title: 'T', detectedType: 'OTHER' },
        count: 0,
        config: { targetProfile: 'dyslexia', ageGroup: '8-10', difficultyLevel: 'Kolay' },
      }) as unknown as import('@vercel/node').VercelRequest, res);
      expect((res as unknown as Record<string, unknown>)['statusCode']).toBe(400);
    });

    it('returns 400 when count exceeds 10', async () => {
      const handler = await importHandler();
      const res = makeRes();
      await handler(makeReq({
        blueprint: { worksheetBlueprint: 'test blueprint', title: 'T', detectedType: 'OTHER' },
        count: 11,
        config: { targetProfile: 'dyslexia', ageGroup: '8-10', difficultyLevel: 'Kolay' },
      }) as unknown as import('@vercel/node').VercelRequest, res);
      expect((res as unknown as Record<string, unknown>)['statusCode']).toBe(400);
    });

    it('calls Gemini and returns 200 with variations on valid input', async () => {
      const sampleVariation = {
        title: 'Test Varyasyon',
        type: 'OCR_VARIATION',
        instruction: 'Aşağıdaki soruları cevaplayın.',
        items: [{ text: 'Soru 1', answer: '5' }],
        pedagogicalNote: 'Bu aktivite çocuğun sayı algısını güçlendirir.',
        difficulty: 'Kolay',
        ageGroup: '8-10',
        profile: 'dyslexia',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: { parts: [{ text: JSON.stringify([sampleVariation]) }] }
          }]
        }),
      });

      const handler = await importHandler();
      const res = makeRes();
      await handler(makeReq({
        blueprint: { worksheetBlueprint: 'soru cevap bölüm grid tablo', title: 'Matematik', detectedType: 'MATH_WORKSHEET' },
        count: 1,
        userId: 'test-user-unique-456',
        config: { targetProfile: 'dyslexia', ageGroup: '8-10', difficultyLevel: 'Kolay', preserveLayout: true, preserveStructure: true },
      }) as unknown as import('@vercel/node').VercelRequest, res);

      const body = (res as unknown as Record<string, unknown>)['body'] as Record<string, unknown>;
      expect((res as unknown as Record<string, unknown>)['statusCode']).toBe(200);
      expect(body['success']).toBe(true);
      expect((body['data'] as Record<string, unknown>)['variations']).toHaveLength(1);
      expect(((body['data'] as Record<string, unknown>)['metadata'] as Record<string, unknown>)['successfulCount']).toBe(1);
    });
  });
  ```

- [ ] **Step 2: Run the tests**

  ```bash
  npm run test:run -- tests/ocr-generate-variations.test.ts
  ```

  Expected: All 5 tests pass.

- [ ] **Step 3: Run all tests to confirm no regressions**

  ```bash
  npm run test:run
  ```

  Expected: All tests pass (or only pre-existing failures).

- [ ] **Step 4: Commit**

  ```bash
  git add tests/ocr-generate-variations.test.ts
  git commit -m "test(api): add generate-variations input validation tests"
  ```

---

## Oogmatik Checklist (Final Verification)

```
□ pedagogicalNote: schema marks it required, validator filters out items without it
□ AppError standard: inline error responses use { success, error: { message, code }, timestamp } format
□ any type: eliminated — unknown + type guards (isValidRequestBody, isValidVariation)
□ Rate limiting: checkRateLimit() inline sliding window (5 req/min per userId)
□ Lexend font: unchanged (no UI changes)
□ console.log: none in production paths (only console.error in catch)
□ Tanı koyucu dil: profileLabels map uses indirect language ("disleksi desteğine ihtiyacı var")
□ KVKK: userId only used for rate-limiting, never logged or returned
□ Tests: ocrService.test.ts + ocr-generate-variations.test.ts
```
