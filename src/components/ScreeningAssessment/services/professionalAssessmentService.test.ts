import { describe, expect, it } from 'vitest';
import {
  buildProfessionalAssessmentPrompt,
  buildStudentProfileContext,
  getAssessmentTestVariation,
} from './professionalAssessmentService';

describe('professionalAssessmentService', () => {
  it('builds a rich student profile context for AI analysis', () => {
    const context = buildStudentProfileContext({
      studentName: 'Ela',
      age: 8,
      grade: '3. Sınıf',
      strengths: ['dikkat', 'yaratıcılık'],
      concerns: ['okuma akıcılığı', 'süreç hızı'],
    });

    expect(context).toContain('Ela');
    expect(context).toContain('3. Sınıf');
    expect(context).toContain('okuma akıcılığı');
  });

  it('creates a student-aware prompt for the final professional report', () => {
    const prompt = buildProfessionalAssessmentPrompt({
      studentName: 'Ela',
      age: 8,
      grade: '3. Sınıf',
      subTests: [
        { testId: 'processing_speed', name: 'İşlem Hızı', score: 62, rawScore: 12, totalItems: 20, avgReactionTime: 2200, accuracy: 0.8, status: 'completed', timestamp: 1 },
      ],
      categoryScores: {
        attention: { score: 55, rawScore: 10, maxScore: 20, riskLevel: 'moderate', riskLabel: 'Orta', findings: ['Dikkat sürekliliği zayıf'], color: 'amber' },
        reading: { score: 72, rawScore: 10, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek', findings: ['Okuma hızı düşük'], color: 'rose' },
        writing: { score: 24, rawScore: 8, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek', findings: ['Yazım hataları sık'], color: 'rose' },
        math: { score: 50, rawScore: 10, maxScore: 20, riskLevel: 'moderate', riskLabel: 'Orta', findings: ['Süreç hataları'], color: 'amber' },
        language: { score: 68, rawScore: 10, maxScore: 20, riskLevel: 'high', riskLabel: 'Yüksek', findings: ['Sözel akıcılık sınırlı'], color: 'rose' },
        motor_spatial: { score: 45, rawScore: 10, maxScore: 20, riskLevel: 'moderate', riskLabel: 'Orta', findings: ['Organizasyon zayıf'], color: 'amber' },
      },
    } as never, {
      studentName: 'Ela',
      age: 8,
      grade: '3. Sınıf',
      strengths: ['dikkat'],
      concerns: ['okuma akıcılığı'],
      supportContext: 'sessiz çalışma alanı',
    });

    expect(prompt).toContain('Profesyonel değerlendirme');
    expect(prompt).toContain('Ela');
    expect(prompt).toContain('BEP');
  });

  it('returns a domain-specific variation for premium test delivery', () => {
    const variation = getAssessmentTestVariation('processing_speed', {
      studentName: 'Ela',
      age: 8,
      grade: '3. Sınıf',
      concerns: ['dikkat'],
    });

    expect(variation.title).toContain('İşlem Hızı');
    expect(variation.description).toContain('Ela');
  });
});
