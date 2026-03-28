import { describe, it, expect } from 'vitest';
import { ExamActivitySchema, ExamLayoutSchema, ExamQuestionSchema } from '../src/utils/schemas';

describe('Exam Schemas', () => {
  it('should validate ExamLayoutSchema correctly', () => {
    const validLayout = {
      grid: { cols: 2, gap: 10, padding: 20, borderStyle: 'solid' },
      visibility: {
        showTitle: true,
        showUnit: false,
        showStudentName: true,
        showObjective: true,
        showDate: false,
      },
    };
    expect(ExamLayoutSchema.safeParse(validLayout).success).toBe(true);
  });

  it('should validate ExamQuestionSchema for multiple-choice correctly', () => {
    const validQuestion = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'multiple-choice',
      questionText: 'What is 2+2?',
      bloomLevel: 'Bilgi',
      realLifeConnection: 'Counting apples',
      solutionKey: 'C',
      options: { A: '1', B: '3', C: '4', D: '5' },
      correctOption: 'C',
    };
    expect(ExamQuestionSchema.safeParse(validQuestion).success).toBe(true);
  });

  it('should reject ExamActivitySchema if pedagogicalNote is missing', () => {
    const invalidActivity = {
      title: 'Math Test',
      questions: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'true-false',
          questionText: 'The earth is flat.',
          bloomLevel: 'Kavrama',
          realLifeConnection: 'Geography',
          solutionKey: 'False',
          isTrue: false,
        },
      ],
    };
    const result = ExamActivitySchema.safeParse(invalidActivity);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((e) => e.path.includes('pedagogicalNote'))).toBe(true);
    }
  });

  it('should validate ExamActivitySchema when pedagogicalNote is provided', () => {
    const validActivity = {
      title: 'Math Test',
      pedagogicalNote: 'This test evaluates basic understanding.',
      questions: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'true-false',
          questionText: 'The earth is flat.',
          bloomLevel: 'Kavrama',
          realLifeConnection: 'Geography',
          solutionKey: 'False',
          isTrue: false,
        },
      ],
    };
    expect(ExamActivitySchema.safeParse(validActivity).success).toBe(true);
  });
});
