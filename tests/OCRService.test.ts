/**
 * OCR Service Tests
 *
 * processImage'ın yapısal çıktı (schema) kullanımını ve
 * eksik worksheetBlueprint alanı için fallback davranışını test eder.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.mock('../src/utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeGeminiResponse = (jsonPayload: Record<string, unknown>) =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(jsonPayload) }],
            },
          },
        ],
      }),
  });

const BASE64_STUB = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ocrService.processImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // process.env için API key
    process.env.GEMINI_API_KEY = 'test-key';
  });

  it('worksheetBlueprint dolu geldiğinde doğrudan kullanır', async () => {
    mockFetch.mockImplementation(() =>
      makeGeminiResponse({
        title: 'Test Sayfası',
        detectedType: 'MATH_WORKSHEET',
        worksheetBlueprint: 'Sütunlar: 2, Bloklar: 5 soru bloğu içeriyor.',
      })
    );

    const { ocrService } = await import('../src/services/ocrService');
    ocrService.clearCache();

    const result = await ocrService.processImage(BASE64_STUB);

    expect(result.rawText).toBe('Sütunlar: 2, Bloklar: 5 soru bloğu içeriyor.');
    expect(result.generatedTemplate).toBe('Sütunlar: 2, Bloklar: 5 soru bloğu içeriyor.');
    expect(result.structuredData?.worksheetBlueprint).toBe('Sütunlar: 2, Bloklar: 5 soru bloğu içeriyor.');
  });

  it('worksheetBlueprint eksik ama description varsa fallback yapar', async () => {
    mockFetch.mockImplementation(() =>
      makeGeminiResponse({
        title: 'Test',
        detectedType: 'OTHER',
        description: 'Bu sayfada matematik soruları ve tablo yapısı bulunmaktadır. Sütunlar: 1.',
      })
    );

    const { ocrService } = await import('../src/services/ocrService');
    ocrService.clearCache();

    const result = await ocrService.processImage(BASE64_STUB);

    expect(result.rawText).toBeTruthy();
    expect(result.rawText).toContain('matematik');
  });

  it('Gemini API çağrısında schema parametresi iletildiğini doğrular (structured output)', async () => {
    mockFetch.mockImplementation(() =>
      makeGeminiResponse({
        title: 'Yapısal Çıktı Testi',
        detectedType: 'FILL_IN_THE_BLANK',
        worksheetBlueprint: 'Blueprint içeriği burada. Soru blokları ve grid yapısı mevcut.',
      })
    );

    const { ocrService } = await import('../src/services/ocrService');
    ocrService.clearCache();

    await ocrService.processImage(BASE64_STUB);

    expect(mockFetch).toHaveBeenCalledOnce();
    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1].body);

    // generationConfig.responseMimeType ile structured output talep edilmeli
    expect(requestBody.generationConfig?.responseMimeType).toBe('application/json');
    expect(requestBody.generationConfig?.responseSchema).toBeDefined();
    expect(requestBody.generationConfig?.responseSchema?.required).toContain('worksheetBlueprint');
  });

  it('hem worksheetBlueprint hem fallback alanlar boşsa AppError fırlatır', async () => {
    mockFetch.mockImplementation(() =>
      makeGeminiResponse({
        title: 'Boş',
        detectedType: 'OTHER',
        worksheetBlueprint: '',
      })
    );

    const { ocrService } = await import('../src/services/ocrService');
    ocrService.clearCache();

    await expect(ocrService.processImage(BASE64_STUB)).rejects.toThrow('Blueprint boş döndü.');
  });
});
