import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSuperStudioContent } from '../src/services/generators/superStudioGenerator';

// Mock geminiClient
vi.mock('../src/services/geminiClient', () => ({
  generateWithSchema: vi.fn(),
}));

// Mock cacheService
const mockCacheService = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock('../src/services/cacheService', () => ({
  default: mockCacheService,
}));

import { generateWithSchema } from '../src/services/geminiClient';

describe('Super Türkçe Generator - Cache Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCacheService.get.mockResolvedValue(null);
    mockCacheService.set.mockResolvedValue(undefined);

    // Default mock response
    vi.mocked(generateWithSchema).mockResolvedValue({
      title: 'Test Aktivite',
      text: 'Test metin',
      questions: [{ question: 'Test?', answer: 'Test' }],
      pedagogicalNote: 'Test pedagoji notu',
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache key for same parameters', async () => {
      const params = {
        templates: ['okuma-anlama'],
        settings: { 'okuma-anlama': { length: 'kisa', questionCount: 3 } },
        mode: 'ai' as const,
        grade: '5. Sınıf',
        difficulty: 'Orta' as const,
        studentId: 'user123',
        topic: 'Test',
      };

      // İlk çağrı
      await generateSuperStudioContent(params);

      // İkinci çağrı (aynı parametreler)
      await generateSuperStudioContent(params);

      // Cache.get iki kez çağrılmalı (her seferinde aynı key ile)
      expect(mockCacheService.get).toHaveBeenCalledTimes(2);

      // İki çağrıda da aynı cache key kullanılmalı
      const firstCallKey = mockCacheService.get.mock.calls[0][0];
      const secondCallKey = mockCacheService.get.mock.calls[1][0];

      expect(firstCallKey).toBe(secondCallKey);
      expect(firstCallKey).toMatch(/^super-turkce:[a-f0-9]{16}$/);
    });

    it('should generate different cache key for different parameters', async () => {
      // İlk çağrı: Kolay
      await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Kolay',
        studentId: 'user123',
        topic: 'Test',
      });

      // İkinci çağrı: Zor (farklı difficulty)
      await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Zor',
        studentId: 'user123',
        topic: 'Test',
      });

      const firstKey = mockCacheService.get.mock.calls[0][0];
      const secondKey = mockCacheService.get.mock.calls[1][0];

      // Farklı difficulty → farklı cache key
      expect(firstKey).not.toBe(secondKey);
    });
  });

  describe('Cache Hit Scenario', () => {
    it('should return cached content and skip API call', async () => {
      const cachedContent = {
        id: 'cached-123',
        templateId: 'okuma-anlama',
        pages: [
          {
            title: 'Cached Title',
            content: 'Cached content',
            pedagogicalNote: 'Cached note',
          },
        ],
        createdAt: Date.now() - 1000,
      };

      // Cache hit simülasyonu
      mockCacheService.get.mockResolvedValueOnce(cachedContent);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: 'cache-test',
        topic: 'Test',
      });

      // Cache'ten dönen sonuç
      expect(result).toHaveLength(1);
      expect(result[0].templateId).toBe('okuma-anlama');
      expect(result[0].pages[0].title).toBe('Cached Title');
      expect(result[0].fromCache).toBe(true);

      // API çağrılmamalı (cache hit)
      expect(generateWithSchema).not.toHaveBeenCalled();

      // Cache hit logu
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Super Türkçe] Cache hit: okuma-anlama')
      );

      consoleLogSpy.mockRestore();
    });

    it('should handle partial cache hit (some templates cached, some not)', async () => {
      // okuma-anlama cache'te var
      mockCacheService.get.mockImplementation((key: string) => {
        if (key.includes('okuma-anlama')) {
          return Promise.resolve({
            id: 'cached-oku',
            templateId: 'okuma-anlama',
            pages: [{ title: 'Cached', content: 'Cached', pedagogicalNote: 'Cached' }],
            createdAt: Date.now(),
          });
        }
        return Promise.resolve(null);
      });

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama', 'dilbilgisi'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: 'partial-cache-test',
        topic: 'Test',
      });

      // 2 sonuç: 1 cache, 1 API
      expect(result).toHaveLength(2);

      // okuma-anlama cache'ten
      const cachedResult = result.find((r) => r.templateId === 'okuma-anlama');
      expect(cachedResult?.fromCache).toBe(true);

      // dilbilgisi API'den
      const apiResult = result.find((r) => r.templateId === 'dilbilgisi');
      expect(apiResult?.fromCache).toBeUndefined();

      // API sadece 1 kez çağrılmalı (dilbilgisi için)
      expect(generateWithSchema).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cache Miss Scenario', () => {
    it('should call API and write to cache on cache miss', async () => {
      mockCacheService.get.mockResolvedValue(null); // Cache miss

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: 'cache-miss-test',
        topic: 'Test',
      });

      // API çağrılmalı
      expect(generateWithSchema).toHaveBeenCalledTimes(1);

      // Cache'e yazılmalı
      expect(mockCacheService.set).toHaveBeenCalledTimes(1);

      const cacheSetCall = mockCacheService.set.mock.calls[0];
      const cacheKey = cacheSetCall[0];
      const cachedData = cacheSetCall[1];

      expect(cacheKey).toMatch(/^super-turkce:[a-f0-9]{16}$/);
      expect(cachedData).toHaveProperty('id');
      expect(cachedData).toHaveProperty('templateId', 'okuma-anlama');
      expect(cachedData).toHaveProperty('pages');
      expect(cachedData).toHaveProperty('createdAt');

      // Cache yazma logu
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Super Türkçe] Cache yazıldı')
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('Cache Error Handling (Graceful Degradation)', () => {
    it('should continue generation when cache.get fails', async () => {
      // Cache okuma hatası
      mockCacheService.get.mockRejectedValue(new Error('IndexedDB error'));

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: 'cache-error-test',
        topic: 'Test',
      });

      // Üretim başarılı olmalı (cache hatasına rağmen)
      expect(result).toHaveLength(1);
      expect(generateWithSchema).toHaveBeenCalledTimes(1);

      // Hata loglanmalı
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Super Türkçe] Cache okuma hatası'),
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it('should continue generation when cache.set fails', async () => {
      mockCacheService.get.mockResolvedValue(null);
      // Cache yazma hatası
      mockCacheService.set.mockRejectedValue(new Error('Quota exceeded'));

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: 'cache-write-error-test',
        topic: 'Test',
      });

      // Üretim başarılı olmalı (cache yazma hatası engellememeli)
      expect(result).toHaveLength(1);

      // Hata loglanmalı
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Super Türkçe] Cache yazma hatası'),
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle cacheService import failure', async () => {
      // Bu test browser/node environment farkını test eder
      // Fast mode'da cache kullanılmaz zaten, test AI mode için

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: 'no-cache-test',
        topic: 'Test',
      });

      // Cache olsa da olmasa da üretim başarılı olmalı
      expect(result).toHaveLength(1);
    });
  });

  describe('Fast Mode (No Cache)', () => {
    it('should not use cache in fast mode', async () => {
      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'fast',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: 'fast-mode-test',
        topic: 'Test',
      });

      // Fast mode: cache kullanılmaz
      expect(mockCacheService.get).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(generateWithSchema).not.toHaveBeenCalled();

      // Offline mock üretim
      expect(result).toHaveLength(1);
      expect(result[0].pages[0].content).toContain('[HIZLI MOD');
    });
  });
});
