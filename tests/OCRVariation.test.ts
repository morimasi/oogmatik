/**
 * OCR Variation Service Tests
 *
 * Test suite for blueprint variation generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VariationRequest, VariationResult } from '@/services/ocrVariationService';

// Mock geminiClient
vi.mock('../services/geminiClient', () => ({
  analyzeImage: vi.fn(),
}));

// Mock errorHandler
vi.mock('../utils/errorHandler', () => ({
  retryWithBackoff: vi.fn((fn) => fn()),
  logError: vi.fn(),
}));

import { generateVariations, validateVariationQuality } from '@/services/ocrVariationService';
import { analyzeImage } from '@/services/geminiClient';

describe('OCR Variation Service - Request Validation', () => {
  it('should reject request without blueprint', async () => {
    const request = {
      blueprint: null as any,
      count: 3,
      userId: 'test-user',
    };

    await expect(generateVariations(request)).rejects.toThrow('Blueprint verisi eksik');
  });

  it('should reject request with count < 1', async () => {
    const request = {
      blueprint: {
        structuredData: { worksheetBlueprint: 'test' },
        title: 'Test',
        quality: 'high' as const,
      } as any,
      count: 0,
      userId: 'test-user',
    };

    await expect(generateVariations(request)).rejects.toThrow('1-10 arasında');
  });

  it('should reject request with count > 10', async () => {
    const request = {
      blueprint: {
        structuredData: { worksheetBlueprint: 'test' },
        title: 'Test',
        quality: 'high' as const,
      } as any,
      count: 15,
      userId: 'test-user',
    };

    await expect(generateVariations(request)).rejects.toThrow('1-10 arasında');
  });

  it('should reject request with low quality blueprint', async () => {
    const request = {
      blueprint: {
        structuredData: { worksheetBlueprint: 'test' },
        title: 'Test',
        quality: 'low' as const,
      } as any,
      count: 3,
      userId: 'test-user',
    };

    await expect(generateVariations(request)).rejects.toThrow('çok düşük');
  });

  it('should reject request without userId', async () => {
    const request = {
      blueprint: {
        structuredData: { worksheetBlueprint: 'test' },
        title: 'Test',
        quality: 'high' as const,
      } as any,
      count: 3,
      userId: '',
    };

    await expect(generateVariations(request)).rejects.toThrow('Kullanıcı ID');
  });
});

describe('OCR Variation Service - Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate requested number of variations', async () => {
    const mockVariations = [
      {
        title: 'Matematik Çalışması 1',
        type: 'MATH_STUDIO',
        content: '<div>3 + 4 = ?</div>',
        pedagogicalNote: 'Bu aktivite toplama işlemini pekiştirmek için tasarlanmıştır. Disleksi destek.',
        difficultyLevel: 'Kolay',
        targetSkills: ['Toplama', 'Sayı algısı'],
      },
      {
        title: 'Matematik Çalışması 2',
        type: 'MATH_STUDIO',
        content: '<div>5 + 2 = ?</div>',
        pedagogicalNote: 'Bu aktivite toplama işlemini pekiştirmek için tasarlanmıştır. Disleksi destek.',
        difficultyLevel: 'Kolay',
        targetSkills: ['Toplama', 'Sayı algısı'],
      },
    ];

    vi.mocked(analyzeImage).mockResolvedValue({
      variations: mockVariations,
    } as any);

    const request: VariationRequest = {
      blueprint: {
        structuredData: {
          worksheetBlueprint: '2 sütun, 10 soru, toplama işlemleri',
          title: 'Toplama Çalışması',
          detectedType: 'MATH_WORKSHEET',
          layoutHints: { columns: 2, hasImages: false, questionCount: 10 },
        },
        title: 'Toplama',
        quality: 'high',
        rawText: 'test',
      } as any,
      count: 2,
      userId: 'test-user',
    };

    const result = await generateVariations(request);

    expect(result.variations).toHaveLength(2);
    expect(result.metadata.requestedCount).toBe(2);
    expect(result.metadata.successfulCount).toBe(2);
  });

  it('should validate pedagogicalNote in each variation', async () => {
    const mockVariations = [
      {
        title: 'Test 1',
        type: 'MATH_STUDIO',
        content: '<div>Test</div>',
        pedagogicalNote: 'Short', // TOO SHORT - should generate warning
        difficultyLevel: 'Kolay',
        targetSkills: ['Test'],
      },
    ];

    vi.mocked(analyzeImage).mockResolvedValue({
      variations: mockVariations,
    } as any);

    const request: VariationRequest = {
      blueprint: {
        structuredData: {
          worksheetBlueprint: 'test',
          title: 'Test',
          detectedType: 'OTHER',
        },
        title: 'Test',
        quality: 'high',
        rawText: 'test',
      } as any,
      count: 1,
      userId: 'test-user',
    };

    const result = await generateVariations(request);

    expect(result.metadata.warnings).toBeDefined();
    expect(result.metadata.warnings?.some(w => w.includes('Pedagojik not'))).toBe(true);
  });

  it('should add metadata to each variation', async () => {
    const mockVariations = [
      {
        title: 'Test',
        type: 'MATH_STUDIO',
        content: '<div>Test</div>',
        pedagogicalNote: 'This is a valid pedagogical note with sufficient length to pass validation.',
        difficultyLevel: 'Kolay',
        targetSkills: ['Test'],
      },
    ];

    vi.mocked(analyzeImage).mockResolvedValue({
      variations: mockVariations,
    } as any);

    const request: VariationRequest = {
      blueprint: {
        structuredData: {
          worksheetBlueprint: 'test',
          title: 'Blueprint Title',
          detectedType: 'OTHER',
        },
        title: 'Blueprint Title',
        quality: 'high',
        rawText: 'test',
      } as any,
      count: 1,
      userId: 'test-user',
    };

    const result = await generateVariations(request);

    expect(result.variations[0]).toHaveProperty('id');
    expect(result.variations[0]).toHaveProperty('createdAt');
    expect(result.variations[0]).toHaveProperty('source', 'ocr_variation');
    expect(result.variations[0]).toHaveProperty('metadata');
    expect(result.variations[0].metadata).toHaveProperty('originalBlueprint', 'Blueprint Title');
  });

  it('should calculate quality score correctly', async () => {
    const mockVariations = Array.from({ length: 3 }, (_, i) => ({
      title: `Test ${i + 1}`,
      type: 'MATH_STUDIO',
      content: '<div>Test content with sufficient length for validation and quality assessment to exceed the 100 character minimum requirement.</div>',
      pedagogicalNote: 'This is a complete pedagogical note that meets the minimum character requirement for quality validation.',
      difficultyLevel: 'Kolay',
      targetSkills: ['Skill 1', 'Skill 2'],
    }));

    vi.mocked(analyzeImage).mockResolvedValue({
      variations: mockVariations,
    } as any);

    const request: VariationRequest = {
      blueprint: {
        structuredData: {
          worksheetBlueprint: 'test',
          title: 'Test',
          detectedType: 'OTHER',
        },
        title: 'Test',
        quality: 'high',
        rawText: 'test',
      } as any,
      count: 3,
      userId: 'test-user',
    };

    const result = await generateVariations(request);

    expect(result.metadata.quality).toBe('high');
    expect(result.metadata.warnings).toBeUndefined();
  });
});

describe('OCR Variation Service - Quality Validation', () => {
  it('should give full score (100) for perfect variation', () => {
    const variation = {
      title: 'Perfect Activity',
      type: 'MATH_STUDIO',
      content: '<div>This is a complete activity with sufficient content length to meet the 100 character minimum requirement for quality validation scoring system.</div>',
      pedagogicalNote:
        'This pedagogical note is comprehensive and provides clear guidance to teachers about the educational objectives.',
      difficultyLevel: 'Orta',
      targetSkills: ['Skill 1', 'Skill 2', 'Skill 3'],
    } as any;

    const score = validateVariationQuality(variation);
    expect(score).toBe(100);
  });

  it('should deduct 30 points for missing pedagogicalNote', () => {
    const variation = {
      title: 'Test',
      type: 'MATH_STUDIO',
      content: '<div>Content</div>',
      pedagogicalNote: '',
      difficultyLevel: 'Kolay',
      targetSkills: ['Test'],
    } as any;

    const score = validateVariationQuality(variation);
    expect(score).toBeLessThanOrEqual(70);
  });

  it('should deduct 25 points for short content', () => {
    const variation = {
      title: 'Test',
      type: 'MATH_STUDIO',
      content: '<div>x</div>',
      pedagogicalNote: 'This is a valid pedagogical note with sufficient length.',
      difficultyLevel: 'Kolay',
      targetSkills: ['Test'],
    } as any;

    const score = validateVariationQuality(variation);
    expect(score).toBeLessThanOrEqual(75);
  });

  it('should deduct 20 points for missing targetSkills', () => {
    const variation = {
      title: 'Test',
      type: 'MATH_STUDIO',
      content: '<div>This is content with sufficient length for validation</div>',
      pedagogicalNote: 'This is a valid pedagogical note with sufficient length.',
      difficultyLevel: 'Kolay',
      targetSkills: [],
    } as any;

    const score = validateVariationQuality(variation);
    expect(score).toBeLessThanOrEqual(80);
  });

  it('should deduct 15 points for short title', () => {
    const variation = {
      title: 'X',
      type: 'MATH_STUDIO',
      content: '<div>This is content with sufficient length for validation</div>',
      pedagogicalNote: 'This is a valid pedagogical note with sufficient length.',
      difficultyLevel: 'Kolay',
      targetSkills: ['Test'],
    } as any;

    const score = validateVariationQuality(variation);
    expect(score).toBeLessThanOrEqual(85);
  });

  it('should deduct 10 points for invalid difficultyLevel', () => {
    const variation = {
      title: 'Test Activity',
      type: 'MATH_STUDIO',
      content: '<div>This is content with sufficient length for validation</div>',
      pedagogicalNote: 'This is a valid pedagogical note with sufficient length.',
      difficultyLevel: 'Invalid',
      targetSkills: ['Test'],
    } as any;

    const score = validateVariationQuality(variation);
    expect(score).toBeLessThanOrEqual(90);
  });

  it('should never return negative score', () => {
    const variation = {
      title: '',
      type: 'MATH_STUDIO',
      content: '',
      pedagogicalNote: '',
      difficultyLevel: 'Invalid',
      targetSkills: [],
    } as any;

    const score = validateVariationQuality(variation);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

// NOTE: The mock for `analyzeImage` from '@/services/geminiClient' may not fully
// intercept calls when the service uses a direct Gemini REST API internally.
// These tests verify the service's data-passing contract (grafikVeri passthrough,
// type normalisation) using the same mocking pattern as the existing suite above.
describe('OCR Variation Service - Visual Data (grafikVeri)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass through grafikVeri from AI response', async () => {
    const mockGrafikVeri = {
      tip: 'sutun_grafigi',
      baslik: 'Haftalık Okuma Süresi',
      veri: [
        { etiket: 'Pazartesi', deger: 30 },
        { etiket: 'Salı', deger: 45 },
        { etiket: 'Çarşamba', deger: 25 },
      ],
    };

    const mockVariations = [
      {
        title: 'Grafik Okuma Aktivitesi',
        type: 'OCR_CONTENT',
        content: '<div>Tablodaki verileri inceleyiniz.</div>',
        pedagogicalNote:
          'Bu aktivite grafik okuma ve veri yorumlama becerilerini destekler. Disleksi uyumlu tasarım ile sunulmuştur.',
        difficultyLevel: 'Orta',
        targetSkills: ['Grafik okuma', 'Veri yorumlama'],
        grafikVeri: mockGrafikVeri,
      },
    ];

    vi.mocked(analyzeImage).mockResolvedValue({
      variations: mockVariations,
    } as any);

    const request: VariationRequest = {
      blueprint: {
        structuredData: {
          worksheetBlueprint: 'Sutun grafiği içeren matematik çalışması',
          title: 'Grafik Okuma',
          detectedType: 'MATH_WORKSHEET',
          layoutHints: { columns: 1, hasImages: true, questionCount: 5 },
          visualDescriptors: [
            { tipi: 'sutun_grafigi', aciklama: 'Haftalık okuma süresi grafiği' },
          ],
        },
        title: 'Grafik Okuma',
        quality: 'high',
        rawText: 'test',
      } as any,
      count: 1,
      userId: 'test-user',
    };

    const result = await generateVariations(request);

    expect(result.variations).toHaveLength(1);
    expect(result.variations[0].grafikVeri).toBeDefined();
    expect((result.variations[0] as any).grafikVeri?.tip).toBe('sutun_grafigi');
  });

  it('should set type to OCR_CONTENT regardless of AI response type', async () => {
    const mockVariations = [
      {
        title: 'Test Aktivitesi',
        type: 'MATH_STUDIO', // AI returns wrong type
        content: '<div>Bu bir test aktivitesidir ve yeterli uzunluktaki içerik burada yer almaktadır.</div>',
        pedagogicalNote:
          'Bu aktivite öğrencinin matematik becerilerini ölçmek için tasarlanmıştır. Disleksi uyumlu formatta sunulmuştur.',
        difficultyLevel: 'Kolay',
        targetSkills: ['Matematik', 'Problem çözme'],
        grafikVeri: null,
      },
    ];

    vi.mocked(analyzeImage).mockResolvedValue({
      variations: mockVariations,
    } as any);

    const request: VariationRequest = {
      blueprint: {
        structuredData: {
          worksheetBlueprint: 'test blueprint',
          title: 'Test',
          detectedType: 'MATH_WORKSHEET',
        },
        title: 'Test',
        quality: 'high',
        rawText: 'test',
      } as any,
      count: 1,
      userId: 'test-user',
    };

    const result = await generateVariations(request);

    expect(result.variations[0].type).toBe('OCR_CONTENT');
  });

  it('should handle null grafikVeri gracefully', async () => {
    const mockVariations = [
      {
        title: 'Metin Aktivitesi',
        type: 'OCR_CONTENT',
        content: '<div>Bu aktivite metin içeriklidir ve görsel içermez. Yeterli uzunlukta içerik.</div>',
        pedagogicalNote:
          'Bu aktivite metin anlama ve okuma akıcılığı becerilerini destekler. Disleksi uyumlu tasarım.',
        difficultyLevel: 'Kolay',
        targetSkills: ['Okuma', 'Anlama'],
        grafikVeri: null,
      },
    ];

    vi.mocked(analyzeImage).mockResolvedValue({
      variations: mockVariations,
    } as any);

    const request: VariationRequest = {
      blueprint: {
        structuredData: {
          worksheetBlueprint: 'test',
          title: 'Metin',
          detectedType: 'READING_COMPREHENSION',
          layoutHints: { columns: 1, hasImages: false, questionCount: 3 },
        },
        title: 'Metin',
        quality: 'high',
        rawText: 'test',
      } as any,
      count: 1,
      userId: 'test-user',
    };

    const result = await generateVariations(request);

    // Should not throw, grafikVeri should be null
    expect(result.variations).toHaveLength(1);
    expect((result.variations[0] as any).grafikVeri).toBeNull();
  });
});
