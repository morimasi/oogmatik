import { describe, it, expect } from 'vitest';
import { textPassageSchema, questionSchema, learningSessionSchema } from './schemas';

describe('Polymorphic JSON Schemas (Zod)', () => {
  it('should validate a correct TextPassage object', () => {
    const validText = {
      id: 'text-123',
      title: 'Kırmızı Başlıklı Kız',
      content: 'Bir varmış bir yokmuş...',
      metadata: {
        gradeLevel: 2,
        difficulty: 'KOLAY',
        theme: 'HIKAYE',
        wordCount: 150,
        readabilityScore: 80.5,
        estimatedReadingTimeMs: 120000,
      },
      learningOutcomes: ['T.2.3.4'],
    };

    const result = textPassageSchema.safeParse(validText);
    expect(result.success).toBe(true);
  });

  it('should invalidate an incorrect TextPassage object (missing title)', () => {
    const invalidText = {
      id: 'text-123',
      content: 'Bir varmış bir yokmuş...',
      metadata: {
        gradeLevel: 2,
        difficulty: 'KOLAY',
        theme: 'HIKAYE',
        wordCount: 150,
        readabilityScore: 80.5,
        estimatedReadingTimeMs: 120000,
      },
      learningOutcomes: ['T.2.3.4'],
    };

    const result = textPassageSchema.safeParse(invalidText);
    expect(result.success).toBe(false);
  });

  it('should validate a correct MCQ Question object', () => {
    const validMCQ = {
      id: 'q-1',
      textId: 'text-123',
      type: 'MCQ',
      instruction: 'Aşağıdakilerden hangisi doğrudur?',
      difficulty: 'ORTA',
      targetSkill: 'ANA_FIKIR',
      learningOutcomes: ['T.2.3.1'],
      feedback: {
        correct: 'Tebrikler!',
        incorrect: 'Metne tekrar göz atabilirsin.',
      },
      options: [
        { id: 'opt-1', text: 'Seçenek A', isCorrect: true },
        { id: 'opt-2', text: 'Seçenek B', isCorrect: false },
      ],
    };

    const result = questionSchema.safeParse(validMCQ);
    expect(result.success).toBe(true);
  });

  it('should validate a correct FillBlank Question object', () => {
    const validFillBlank = {
      id: 'q-2',
      textId: 'text-123',
      type: 'FILL_BLANK',
      instruction: 'Boşlukları doldurunuz.',
      difficulty: 'ZOR',
      targetSkill: 'SOZ_VARLIGI',
      learningOutcomes: ['T.2.4.1'],
      feedback: {
        correct: 'Harika!',
        incorrect: 'İpucu: Kelime havuzuna bak.',
      },
      template: 'Ali {blank_1} gitti.',
      blanks: [{ id: 'blank_1', correctValue: 'okula', acceptedValues: ['Okula', 'okula'] }],
    };

    const result = questionSchema.safeParse(validFillBlank);
    expect(result.success).toBe(true);
  });

  it('should validate a LearningSession object', () => {
    const validSession = {
      sessionId: 'sess-123',
      userId: 'user-456',
      moduleType: 'TEXT_STUDIO',
      startTime: new Date('2026-03-14T10:00:00Z'),
      endTime: new Date('2026-03-14T10:10:00Z'),
      interactions: [
        {
          questionId: 'q-1',
          timeSpentMs: 5000,
          attempts: 1,
          isCorrect: true,
          givenAnswer: 'opt-1',
          hintsUsed: 0,
        },
      ],
      telemetry: {
        frustrationClicks: 0,
        idleTimeMs: 1200,
        readingRulerUsed: true,
      },
      score: 100,
    };

    const result = learningSessionSchema.safeParse(validSession);
    expect(result.success).toBe(true);
  });
});
