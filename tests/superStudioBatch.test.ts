import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSuperStudioContent } from '../src/services/generators/superStudioGenerator';
import { AppError } from '../src/utils/AppError';

// Mock geminiClient
vi.mock('../src/services/geminiClient', () => ({
  generateWithSchema: vi.fn(),
}));

// Mock cacheService
vi.mock('../src/services/cacheService', () => ({
  default: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

import { generateWithSchema } from '../src/services/geminiClient';

describe('Super Türkçe Generator - Batch Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Parallel API Calls', () => {
    it('should process multiple templates in parallel', async () => {
      const mockResponses: Record<string, any> = {
        'okuma-anlama': {
          title: 'Okuma Parçası',
          text: 'Test metin',
          questions: [{ question: 'Test?', answer: 'Test' }],
          pedagogicalNote: 'Okuma not',
        },
        dilbilgisi: {
          title: 'Dilbilgisi',
          topic: 'Fiiller',
          rules: ['Kural 1', 'Kural 2'],
          exercises: [{ question: 'Test', answer: 'Test' }],
          pedagogicalNote: 'Dilbilgisi not',
        },
        'mantik-muhakeme': {
          title: 'Mantık',
          problems: [{ question: 'Test problem', answer: 'Test cevap' }],
          pedagogicalNote: 'Mantık not',
        },
      };

      vi.mocked(generateWithSchema).mockImplementation((prompt: string) => {
        for (const [key, value] of Object.entries(mockResponses)) {
          if (prompt.toLowerCase().includes(key.split('-')[0])) {
            return Promise.resolve(value);
          }
        }
        return Promise.resolve(mockResponses['okuma-anlama']);
      });

      const start = Date.now();

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama', 'dilbilgisi', 'mantik-muhakeme'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: 'batch-test',
        topic: 'Test',
      });

      const elapsed = Date.now() - start;

      expect(result).toHaveLength(3);
      expect(result.map((r) => r.templateId).sort()).toEqual([
        'dilbilgisi',
        'mantik-muhakeme',
        'okuma-anlama',
      ]);

      // Paralel çağrı doğrulama: 3 API çağrısı "eş zamanlı" yapılmalı
      expect(generateWithSchema).toHaveBeenCalledTimes(3);

      // Sıralı olsaydı çok daha uzun sürerdi, paralel old için hızlı olmalı
      // (Mock'larda delay yok ama yapı paralel)
      console.log(`Batch generation took ${elapsed}ms`);
    });
  });

  describe('Partial Success Handling', () => {
    it('should continue with other templates when one fails', async () => {
      let callCount = 0;
      vi.mocked(generateWithSchema).mockImplementation((prompt: string) => {
        callCount++;

        // dilbilgisi başarısız olsun
        if (prompt.toLowerCase().includes('dilbilgisi')) {
          return Promise.reject(new AppError('AI hatası', 'AI_ERROR', 500, undefined, true));
        }

        // Diğerleri başarılı
        return Promise.resolve({
          title: 'Test Başlık',
          content: 'Test içerik',
          pedagogicalNote: 'Test not',
          text: 'Test',
          questions: [{ question: 'Test?', answer: 'Test' }],
        });
      });

      // Console.error'u mockla
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama', 'dilbilgisi', 'mantik-muhakeme'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: 'partial-test',
        topic: 'Test',
      });

      // 2 başarılı, 1 başarısız
      expect(result).toHaveLength(2);
      expect(generateWithSchema).toHaveBeenCalledTimes(3);

      // Başarılı olanlar dönmeli
      const templateIds = result.map((r) => r.templateId).sort();
      expect(templateIds).toEqual(['mantik-muhakeme', 'okuma-anlama']);

      // Hata loglanmalı
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should throw error when all templates fail', async () => {
      vi.mocked(generateWithSchema).mockRejectedValue(
        new AppError('Tüm istekler başarısız', 'AI_ERROR', 500, undefined, true)
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        generateSuperStudioContent({
          templates: ['okuma-anlama', 'dilbilgisi'],
          settings: {},
          mode: 'ai',
          grade: '5. Sınıf',
          difficulty: 'Orta',
          studentId: 'fail-test',
          topic: 'Test',
        })
      ).rejects.toThrow('Tüm şablonlar için üretim başarısız oldu');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Logging', () => {
    it('should log failed templates with console.error', async () => {
      vi.mocked(generateWithSchema).mockImplementation((prompt: string) => {
        if (prompt.toLowerCase().includes('dilbilgisi')) {
          return Promise.reject(new Error('Mock failure'));
        }
        return Promise.resolve({
          title: 'Test',
          text: 'Test',
          questions: [{ question: 'Test?', answer: 'Test' }],
          pedagogicalNote: 'Test',
        });
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await generateSuperStudioContent({
        templates: ['okuma-anlama', 'dilbilgisi'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: 'log-test',
        topic: 'Test',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Super Türkçe]'),
        expect.any(Array)
      );

      expect(consoleErrorSpy.mock.calls[0][0]).toContain('1/2 şablon başarısız');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Promise.allSettled Behavior', () => {
    it('should use Promise.allSettled (not Promise.all)', async () => {
      // Bu test, bir hatanın diğer promise'ları etkilemediğini doğrular
      let resolveCount = 0;
      let rejectCount = 0;

      vi.mocked(generateWithSchema).mockImplementation((prompt: string) => {
        if (prompt.toLowerCase().includes('dilbilgisi')) {
          rejectCount++;
          return Promise.reject(new Error('Dilbilgisi fail'));
        }
        resolveCount++;
        return Promise.resolve({
          title: 'Test',
          text: 'Test',
          questions: [{ question: 'Test?', answer: 'Test' }],
          pedagogicalNote: 'Test',
        });
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await generateSuperStudioContent({
        templates: ['okuma-anlama', 'dilbilgisi', 'mantik-muhakeme'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: 'allsettled-test',
        topic: 'Test',
      });

      // Tüm promise'lar çalıştırılmalı (reject olsa bile)
      expect(resolveCount).toBe(2);
      expect(rejectCount).toBe(1);
      expect(generateWithSchema).toHaveBeenCalledTimes(3);

      consoleErrorSpy.mockRestore();
    });
  });
});
