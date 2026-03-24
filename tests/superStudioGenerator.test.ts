import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the dependencies
vi.mock('../src/services/geminiClient.js', () => ({
  generateWithSchema: vi.fn(),
}));

vi.mock('../src/utils/AppError', () => ({
  AppError: class AppError extends Error {
    constructor(
      public userMessage: string,
      public code: string,
      public httpStatus: number,
      public details?: unknown,
      public isRetryable?: boolean
    ) {
      super(userMessage);
      this.name = 'AppError';
    }
  },
}));

import { generateSuperStudioContent } from '../src/services/generators/superStudioGenerator';
import { generateWithSchema } from '../src/services/geminiClient.js';

describe('superStudioGenerator - Defensive Coding Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('okuma-anlama template', () => {
    it('should handle valid AI response correctly', async () => {
      const mockResponse = {
        title: 'Test Okuma Metni',
        text: 'Bu bir test metnidir.',
        questions: [
          { question: 'Soru 1?', answer: 'Cevap 1' },
          { question: 'Soru 2?', answer: 'Cevap 2' },
        ],
        pedagogicalNote: 'Test pedagojik notu',
      };

      vi.mocked(generateWithSchema).mockResolvedValueOnce(mockResponse);

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: null,
      });

      expect(result).toHaveLength(1);
      expect(result[0].templateId).toBe('okuma-anlama');
      expect(result[0].pages[0].content).toContain('Bu bir test metnidir.');
      expect(result[0].pages[0].content).toContain('Soru 1?');
      expect(result[0].pages[0].pedagogicalNote).toBe('Test pedagojik notu');
    });

    it('should handle missing questions array gracefully', async () => {
      const mockResponse = {
        title: 'Test Okuma Metni',
        text: 'Bu bir test metnidir.',
        // questions eksik!
        pedagogicalNote: 'Test pedagojik notu',
      };

      vi.mocked(generateWithSchema).mockResolvedValueOnce(mockResponse);

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: null,
      });

      expect(result).toHaveLength(1);
      expect(result[0].pages[0].content).toContain('Bu bir test metnidir.');
      expect(result[0].pages[0].content).toContain('[Sorular üretilemedi');
    });

    it('should handle empty questions array gracefully', async () => {
      const mockResponse = {
        title: 'Test Okuma Metni',
        text: 'Bu bir test metnidir.',
        questions: [], // boş array
        pedagogicalNote: 'Test pedagojik notu',
      };

      vi.mocked(generateWithSchema).mockResolvedValueOnce(mockResponse);

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: null,
      });

      expect(result).toHaveLength(1);
      expect(result[0].pages[0].content).toContain('[Sorular üretilemedi');
    });

    it('should handle malformed question objects gracefully', async () => {
      const mockResponse = {
        title: 'Test Okuma Metni',
        text: 'Bu bir test metnidir.',
        questions: [
          { question: 'Soru 1?' }, // answer eksik
          { answer: 'Cevap 2' }, // question eksik
          {}, // her ikisi de eksik
        ],
        pedagogicalNote: 'Test pedagojik notu',
      };

      vi.mocked(generateWithSchema).mockResolvedValueOnce(mockResponse);

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: null,
      });

      expect(result).toHaveLength(1);
      const content = result[0].pages[0].content;
      expect(content).toContain('[Cevap eksik]');
      expect(content).toContain('[Soru metni eksik]');
    });
  });

  describe('dilbilgisi template', () => {
    it('should handle valid AI response correctly', async () => {
      const mockResponse = {
        title: 'İsimler',
        topic: 'İsim Çeşitleri',
        rules: ['Kural 1', 'Kural 2'],
        exercises: [
          { question: 'Alıştırma 1?', answer: 'Cevap 1' },
          { question: 'Alıştırma 2?', answer: 'Cevap 2' },
        ],
        pedagogicalNote: 'Test pedagojik notu',
      };

      vi.mocked(generateWithSchema).mockResolvedValueOnce(mockResponse);

      const result = await generateSuperStudioContent({
        templates: ['dilbilgisi'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: null,
      });

      expect(result).toHaveLength(1);
      expect(result[0].pages[0].content).toContain('İsim Çeşitleri');
      expect(result[0].pages[0].content).toContain('Kural 1');
      expect(result[0].pages[0].content).toContain('Alıştırma 1?');
    });

    it('should handle missing rules and exercises arrays gracefully', async () => {
      const mockResponse = {
        title: 'İsimler',
        topic: 'İsim Çeşitleri',
        // rules ve exercises eksik!
        pedagogicalNote: 'Test pedagojik notu',
      };

      vi.mocked(generateWithSchema).mockResolvedValueOnce(mockResponse);

      const result = await generateSuperStudioContent({
        templates: ['dilbilgisi'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: null,
      });

      expect(result).toHaveLength(1);
      const content = result[0].pages[0].content;
      expect(content).toContain('[Kurallar üretilemedi]');
      expect(content).toContain('[Alıştırmalar üretilemedi]');
    });
  });

  describe('mantik-muhakeme template', () => {
    it('should handle valid AI response correctly', async () => {
      const mockResponse = {
        title: 'Mantık Problemleri',
        problems: [
          { question: 'Problem 1?', hint: 'İpucu 1', answer: 'Cevap 1' },
          { question: 'Problem 2?', answer: 'Cevap 2' }, // hint opsiyonel
        ],
        pedagogicalNote: 'Test pedagojik notu',
      };

      vi.mocked(generateWithSchema).mockResolvedValueOnce(mockResponse);

      const result = await generateSuperStudioContent({
        templates: ['mantik-muhakeme'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: null,
      });

      expect(result).toHaveLength(1);
      expect(result[0].pages[0].content).toContain('Problem 1?');
      expect(result[0].pages[0].content).toContain('İpucu 1');
      expect(result[0].pages[0].content).toContain('Problem 2?');
    });

    it('should handle missing problems array gracefully', async () => {
      const mockResponse = {
        title: 'Mantık Problemleri',
        // problems eksik!
        pedagogicalNote: 'Test pedagojik notu',
      };

      vi.mocked(generateWithSchema).mockResolvedValueOnce(mockResponse);

      const result = await generateSuperStudioContent({
        templates: ['mantik-muhakeme'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: null,
      });

      expect(result).toHaveLength(1);
      expect(result[0].pages[0].content).toContain('[Problemler üretilemedi');
    });
  });

  describe('Error handling', () => {
    it('should provide fallback pedagogicalNote when missing', async () => {
      const mockResponse = {
        title: 'Test',
        text: 'Test metin',
        questions: [{ question: 'Q?', answer: 'A' }],
        // pedagogicalNote eksik!
      };

      vi.mocked(generateWithSchema).mockResolvedValueOnce(mockResponse);

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: null,
      });

      expect(result).toHaveLength(1);
      expect(result[0].pages[0].pedagogicalNote).toContain('üretildi');
    });

    it('should handle completely invalid AI response', async () => {
      vi.mocked(generateWithSchema).mockResolvedValueOnce(null);

      await expect(
        generateSuperStudioContent({
          templates: ['okuma-anlama'],
          settings: {},
          mode: 'ai',
          grade: '5. Sınıf',
          difficulty: 'Orta',
          studentId: null,
        })
      ).rejects.toThrow('AI yanıtı boş döndü');
    });
  });

  describe('Fast mode', () => {
    it('should generate mock content without AI calls', async () => {
      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama', 'dilbilgisi'],
        settings: {},
        mode: 'fast',
        grade: '5. Sınıf',
        difficulty: 'Orta',
        studentId: null,
      });

      expect(result).toHaveLength(2);
      expect(result[0].templateId).toBe('okuma-anlama');
      expect(result[1].templateId).toBe('dilbilgisi');
      expect(result[0].pages[0].content).toContain('HIZLI MOD');
      expect(generateWithSchema).not.toHaveBeenCalled();
    });
  });
});
