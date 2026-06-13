import { describe, it, expect } from 'vitest';
import { scoringEngine } from '../src/utils/scoringEngine';
import { SCREENING_QUESTIONS } from '../src/data/screeningQuestions';
import type { ScreeningProfile } from '../src/types/screening';

describe('scoringEngine', () => {
  const profile: ScreeningProfile = {
    studentName: 'Test Öğrenci',
    age: 10,
    grade: '4',
    studentId: 'student-123',
    respondent: 'teacher',
  };

  it('uses profile metadata in result', () => {
    const result = scoringEngine.calculate({}, profile);
    expect(result.studentName).toBe('Test Öğrenci');
    expect(result.age).toBe(10);
    expect(result.grade).toBe('4');
    expect(result.studentId).toBe('student-123');
    expect(result.respondentRole).toBe('teacher');
  });

  it('maps high symptom scores to high risk level', () => {
    const highRiskAnswers: Record<string, number> = {};
    SCREENING_QUESTIONS.forEach((q) => {
      if (q.formType === 'both' || q.formType === profile.respondent) {
        highRiskAnswers[q.id] = 4;
      }
    });
    const result = scoringEngine.calculate(highRiskAnswers, profile);
    expect(result.overallScore).toBeGreaterThanOrEqual(65);
    expect(['medium', 'high']).toContain(result.riskLevel);
  });
});
