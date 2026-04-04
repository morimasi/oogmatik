// tests/ocrService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock process.env
vi.stubEnv('API_KEY', 'test-key');

// Mock logger to avoid import side effects
vi.mock('../src/utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const makeGeminiResponse = (blueprintText: string) => ({
  ok: true,
  json: async () => ({
    candidates: [{
      content: {
        parts: [{
          text: JSON.stringify({
            title: 'Test Çalışma Sayfası',
            detectedType: 'MATH_WORKSHEET',
            worksheetBlueprint: blueprintText,
          }),
        }],
      },
    }],
  }),
});

describe('ocrService.processImage', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.resetModules();
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
    expect(result.warnings!.length).toBeGreaterThan(0);
  });

  it('includes responseSchema and responseMimeType in the Gemini request body', async () => {
    const richBlueprint = 'soru cevap bölüm grid tablo column block hücre liste madde. '.repeat(5);
    mockFetch.mockResolvedValue(makeGeminiResponse(richBlueprint));

    const { ocrService } = await import('../src/services/ocrService');
    ocrService.clearCache();

    const base64 = 'data:image/jpeg;base64,' + 'D'.repeat(500);
    await ocrService.processImage(base64);

    expect(mockFetch).toHaveBeenCalledOnce();
    const callArgs = mockFetch.mock.calls[0] as [string, RequestInit];
    const requestBody = JSON.parse(callArgs[1].body as string) as Record<string, unknown>;
    expect(requestBody['generationConfig']).toBeDefined();
    const gc = requestBody['generationConfig'] as Record<string, unknown>;
    expect(gc['responseMimeType']).toBe('application/json');
    expect(gc['responseSchema']).toBeDefined();
  });

  it('returns cached result on second call with same image', async () => {
    const richBlueprint = 'soru cevap bölüm grid tablo hücre liste madde column block. '.repeat(5);
    mockFetch.mockResolvedValue(makeGeminiResponse(richBlueprint));

    const { ocrService } = await import('../src/services/ocrService');
    ocrService.clearCache();

    const base64 = 'data:image/jpeg;base64,' + 'E'.repeat(500);
    await ocrService.processImage(base64);
    await ocrService.processImage(base64);

    // Gemini called only once — second call served from cache
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
