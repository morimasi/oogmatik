// tests/ocr-generate-variations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.stubEnv('API_KEY', 'test-api-key');

type MockRes = {
  statusCode?: number;
  body?: unknown;
  headers: Record<string, string>;
  status: (code: number) => MockRes;
  json: (data: unknown) => MockRes;
  end: () => MockRes;
  setHeader: (k: string, v: string) => MockRes;
};

const makeRes = (): MockRes => {
  const res: MockRes = {
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    end() { return this; },
    setHeader(_k, _v) { return this; },
  };
  return res;
};

type MockReq = {
  method: string;
  headers: Record<string, string>;
  body: unknown;
};

const makeReq = (body: unknown, method = 'POST'): MockReq => ({
  method,
  headers: { 'content-type': 'application/json' },
  body,
});

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

const validBody = {
  blueprint: {
    worksheetBlueprint: 'soru cevap bölüm grid tablo column block hücre liste madde',
    title: 'Matematik Çalışma Kağıdı',
    detectedType: 'MATH_WORKSHEET',
  },
  count: 1,
  userId: 'test-user-unique-999',
  config: {
    targetProfile: 'dyslexia',
    ageGroup: '8-10',
    difficultyLevel: 'Kolay',
    preserveLayout: true,
    preserveStructure: true,
  },
};

describe('POST /api/ocr/generate-variations — input validation', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.resetModules();
  });

  it('returns 405 for non-POST requests', async () => {
    const { default: handler } = await import('../api/ocr/generate-variations');
    const res = makeRes();
    await handler(makeReq({}, 'GET') as never, res as never);
    expect(res.statusCode).toBe(405);
    expect((res.body as Record<string, unknown>)['success']).toBe(false);
  });

  it('returns 400 when blueprint is missing', async () => {
    const { default: handler } = await import('../api/ocr/generate-variations');
    const res = makeRes();
    await handler(makeReq({ count: 3, config: {} }) as never, res as never);
    expect(res.statusCode).toBe(400);
    expect((res.body as Record<string, unknown>)['success']).toBe(false);
  });

  it('returns 400 when worksheetBlueprint is empty string', async () => {
    const { default: handler } = await import('../api/ocr/generate-variations');
    const res = makeRes();
    await handler(makeReq({
      blueprint: { worksheetBlueprint: '', title: 'T', detectedType: 'OTHER' },
      count: 1,
      config: { targetProfile: 'dyslexia', ageGroup: '8-10', difficultyLevel: 'Kolay' },
    }) as never, res as never);
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when count is 0', async () => {
    const { default: handler } = await import('../api/ocr/generate-variations');
    const res = makeRes();
    await handler(makeReq({
      ...validBody,
      count: 0,
    }) as never, res as never);
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when count exceeds 10', async () => {
    const { default: handler } = await import('../api/ocr/generate-variations');
    const res = makeRes();
    await handler(makeReq({
      ...validBody,
      count: 11,
    }) as never, res as never);
    expect(res.statusCode).toBe(400);
  });

  it('calls Gemini and returns 200 with variations on valid input', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{
          content: { parts: [{ text: JSON.stringify([sampleVariation]) }] },
        }],
      }),
    });

    const { default: handler } = await import('../api/ocr/generate-variations');
    const res = makeRes();
    await handler(makeReq(validBody) as never, res as never);

    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body['success']).toBe(true);
    const data = body['data'] as Record<string, unknown>;
    expect(Array.isArray(data['variations'])).toBe(true);
    expect((data['variations'] as unknown[]).length).toBe(1);
    const meta = data['metadata'] as Record<string, unknown>;
    expect(meta['successfulCount']).toBe(1);
    expect(meta['quality']).toBe('high');
  });

  it('includes responseMimeType and responseSchema in Gemini request', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{
          content: { parts: [{ text: JSON.stringify([sampleVariation]) }] },
        }],
      }),
    });

    const { default: handler } = await import('../api/ocr/generate-variations');
    const res = makeRes();
    await handler(makeReq({ ...validBody, userId: 'unique-schema-check-user' }) as never, res as never);

    expect(mockFetch).toHaveBeenCalledOnce();
    const callArgs = mockFetch.mock.calls[0] as [string, RequestInit];
    const requestBody = JSON.parse(callArgs[1].body as string) as Record<string, unknown>;
    const gc = requestBody['generationConfig'] as Record<string, unknown>;
    expect(gc['responseMimeType']).toBe('application/json');
    expect(gc['responseSchema']).toBeDefined();
  });

  it('filters out variations missing pedagogicalNote', async () => {
    const badVariation = { ...sampleVariation, pedagogicalNote: '' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{
          content: { parts: [{ text: JSON.stringify([badVariation, sampleVariation]) }] },
        }],
      }),
    });

    const { default: handler } = await import('../api/ocr/generate-variations');
    const res = makeRes();
    await handler(makeReq({ ...validBody, count: 2, userId: 'filter-test-user' }) as never, res as never);

    expect(res.statusCode).toBe(200);
    const data = (res.body as Record<string, unknown>)['data'] as Record<string, unknown>;
    // Only 1 valid variation out of 2
    expect((data['variations'] as unknown[]).length).toBe(1);
    const meta = data['metadata'] as Record<string, unknown>;
    expect(meta['warnings']).toBeDefined();
  });
});
