import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateExamQuestions, ExamParams } from '../src/services/generators/examGenerator';
import * as geminiClient from '../src/services/geminiClient';
import { AppError } from '../src/utils/AppError';

vi.mock('../src/services/geminiClient', () => ({
  generateWithSchema: vi.fn(),
}));

describe('generateExamQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate questions without chunking for <= 10 questions', async () => {
    const mockResponse = {
      pedagogicalNote: 'Öğrenciler için destekleyici bir sınav.',
      questions: [
        {
          id: '1',
          type: 'multiple-choice',
          questionText: 'Test sorusu 1',
          bloomLevel: 'Bilgi',
          realLifeConnection: 'Hayat 1',
          solutionKey: 'Çözüm 1',
          options: { A: '1', B: '2', C: '3', D: '4' },
          correctOption: 'A',
        },
      ],
    };

    vi.mocked(geminiClient.generateWithSchema).mockResolvedValueOnce(mockResponse);

    const params: ExamParams = {
      gradeLevel: 5,
      unit: 'Sözcükte Anlam',
      difficulty: 'Kolay',
      questionCount: 1,
      types: ['multiple-choice'],
    };

    const result = await generateExamQuestions(params);

    expect(geminiClient.generateWithSchema).toHaveBeenCalledTimes(1);
    expect(result.pedagogicalNote).toBe('Öğrenciler için destekleyici bir sınav.');
    expect(result.questions).toHaveLength(1);
    expect(result.title).toBe('5. Sınıf Sözcükte Anlam Sınavı');
  });

  it('should chunk requests for > 10 questions', async () => {
    const mockResponse1 = {
      pedagogicalNote: 'Chunk 1 note.',
      questions: Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `q1-${i}`,
          type: 'multiple-choice',
          questionText: `Test sorusu 1-${i}`,
          bloomLevel: 'Bilgi',
          realLifeConnection: 'Hayat',
          solutionKey: 'Çözüm',
          options: { A: '1', B: '2', C: '3', D: '4' },
          correctOption: 'A',
        })),
    };

    const mockResponse2 = {
      pedagogicalNote: 'Chunk 2 note.',
      questions: Array(5)
        .fill(null)
        .map((_, i) => ({
          id: `q2-${i}`,
          type: 'multiple-choice',
          questionText: `Test sorusu 2-${i}`,
          bloomLevel: 'Bilgi',
          realLifeConnection: 'Hayat',
          solutionKey: 'Çözüm',
          options: { A: '1', B: '2', C: '3', D: '4' },
          correctOption: 'A',
        })),
    };

    vi.mocked(geminiClient.generateWithSchema)
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const params: ExamParams = {
      gradeLevel: 6,
      unit: 'Cümlede Anlam',
      difficulty: 'Orta',
      questionCount: 15,
      types: ['multiple-choice'],
    };

    const result = await generateExamQuestions(params);

    expect(geminiClient.generateWithSchema).toHaveBeenCalledTimes(2);
    expect(result.questions).toHaveLength(15);
    expect(result.pedagogicalNote).toBe('Chunk 1 note.');
  });

  it('should include pedagogicalNote and proper schema elements', async () => {
    const params: ExamParams = {
      gradeLevel: 4,
      unit: 'Paragrafta Anlam',
      difficulty: 'Zor',
      questionCount: 2,
      types: ['true-false', 'fill-in-blanks'],
    };

    const mockResponse = {
      pedagogicalNote: 'ZPD uyumlu destek.',
      questions: [
        {
          id: '1',
          type: 'true-false',
          questionText: 'Doğru mu?',
          bloomLevel: 'Kavrama',
          realLifeConnection: 'Bağlantı',
          solutionKey: 'Doğru',
          isTrue: true,
        },
        {
          id: '2',
          type: 'fill-in-blanks',
          questionText: 'Boşluk ___',
          bloomLevel: 'Kavrama',
          realLifeConnection: 'Bağlantı',
          solutionKey: 'doldur',
          blankedText: 'Boşluk ___',
          correctWords: ['doldur'],
        },
      ],
    };

    vi.mocked(geminiClient.generateWithSchema).mockResolvedValueOnce(mockResponse);

    const result = await generateExamQuestions(params);
    expect(result.pedagogicalNote).toBeDefined();
    expect(result.questions).toHaveLength(2);

    const callArg = vi.mocked(geminiClient.generateWithSchema).mock.calls[0][0] as string;
    expect(callArg).toContain('tanı');
    expect(callArg).toContain('disleksi');
    expect(callArg).toContain('pedagogicalNote');
    expect(callArg).toContain('Bloom taksonomisine');
  });

  it('should throw AppError on failure', async () => {
    vi.mocked(geminiClient.generateWithSchema).mockRejectedValueOnce(new Error('Network error'));

    const params: ExamParams = {
      gradeLevel: 4,
      unit: 'Test',
      difficulty: 'Kolay',
      questionCount: 1,
      types: ['multiple-choice'],
    };

    await expect(generateExamQuestions(params)).rejects.toThrow(AppError);
  });
});
