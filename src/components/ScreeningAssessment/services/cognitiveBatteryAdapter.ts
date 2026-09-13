import type { SubTestResult } from '../../../types';
import type { ScreeningResult, EvaluationCategory } from '../../../types/screening';

const DOMAIN_CATEGORY_MAPPING: Record<string, { category: EvaluationCategory; weight: number }[]> = {
  visual_spatial_memory: [
    { category: 'motor_spatial', weight: 0.7 },
    { category: 'reading', weight: 0.3 },
  ],
  selective_attention: [
    { category: 'attention', weight: 0.8 },
    { category: 'reading', weight: 0.2 },
  ],
  processing_speed: [
    { category: 'reading', weight: 0.5 },
    { category: 'attention', weight: 0.3 },
    { category: 'writing', weight: 0.2 },
  ],
  logical_reasoning: [
    { category: 'math', weight: 0.7 },
    { category: 'language', weight: 0.3 },
  ],
  phonological_loop: [
    { category: 'reading', weight: 0.6 },
    { category: 'language', weight: 0.4 },
  ],
  visual_search: [
    { category: 'motor_spatial', weight: 0.5 },
    { category: 'attention', weight: 0.5 },
  ],
  working_memory: [
    { category: 'attention', weight: 0.4 },
    { category: 'math', weight: 0.3 },
    { category: 'reading', weight: 0.3 },
  ],
  planning: [
    { category: 'motor_spatial', weight: 0.5 },
    { category: 'math', weight: 0.5 },
  ],
  auditory_processing: [
    { category: 'language', weight: 0.6 },
    { category: 'reading', weight: 0.4 },
  ],
  visual_motor_integration: [
    { category: 'writing', weight: 0.6 },
    { category: 'motor_spatial', weight: 0.4 },
  ],
  verbal_comprehension: [
    { category: 'language', weight: 0.7 },
    { category: 'reading', weight: 0.3 },
  ],
};

const CATEGORY_NAMES: Record<EvaluationCategory, string> = {
  reading: 'Okuma & Fonolojik Süreçler',
  writing: 'Yazma & Motor Koordinasyon',
  language: 'Dil & Sözel Anlama',
  motor_spatial: 'Görsel & Uzamsal Beceriler',
  attention: 'Dikkat & Çalışma Belleği',
  math: 'Matematik & Mantıksal Akıl Yürütme',
};

function calculateRiskLevel(scorePercent: number): { riskLevel: 'low' | 'moderate' | 'high'; riskLabel: string } {
  if (scorePercent >= 75) {
    return { riskLevel: 'low', riskLabel: 'Düşük Risk' };
  }
  if (scorePercent >= 50) {
    return { riskLevel: 'moderate', riskLabel: 'Orta Risk' };
  }
  return { riskLevel: 'high', riskLabel: 'Yüksek Risk' };
}

export function convertSubTestsToScreeningResult(
  subTestResults: SubTestResult[],
  studentMeta: {
    studentName: string;
    studentId?: string | null;
    age: number;
    grade: string;
    concerns?: string[];
  }
): ScreeningResult {
  const categoryAccumulator: Record<
    EvaluationCategory,
    { totalWeightedScore: number; totalWeight: number; findings: string[] }
  > = {
    reading: { totalWeightedScore: 0, totalWeight: 0, findings: [] },
    writing: { totalWeightedScore: 0, totalWeight: 0, findings: [] },
    language: { totalWeightedScore: 0, totalWeight: 0, findings: [] },
    motor_spatial: { totalWeightedScore: 0, totalWeight: 0, findings: [] },
    attention: { totalWeightedScore: 0, totalWeight: 0, findings: [] },
    math: { totalWeightedScore: 0, totalWeight: 0, findings: [] },
  };

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  subTestResults.forEach((test) => {
    const mappings = DOMAIN_CATEGORY_MAPPING[test.testId] || [];
    const testScore = Math.max(0, Math.min(100, test.score));

    if (testScore >= 75) {
      strengths.push(`${test.name} (Doğruluk: %${test.accuracy})`);
    } else if (testScore < 50 && test.status !== 'skipped') {
      weaknesses.push(`${test.name} (Destek ihtiyacı: %${testScore})`);
    }

    mappings.forEach(({ category, weight }) => {
      categoryAccumulator[category].totalWeightedScore += testScore * weight;
      categoryAccumulator[category].totalWeight += weight;

      if (testScore < 50 && test.status !== 'skipped') {
        categoryAccumulator[category].findings.push(
          `${test.name} performansında zorlanma tespit edildi (Skor: %${testScore})`
        );
      }
    });
  });

  const categoryScores = {} as ScreeningResult['categoryScores'];
  let totalScoreSum = 0;
  let categoryCount = 0;

  (Object.keys(categoryAccumulator) as EvaluationCategory[]).forEach((cat) => {
    const acc = categoryAccumulator[cat];
    const finalScore =
      acc.totalWeight > 0 ? Math.round(acc.totalWeightedScore / acc.totalWeight) : 70;

    const { riskLevel, riskLabel } = calculateRiskLevel(finalScore);

    categoryScores[cat] = {
      score: finalScore,
      rawScore: Math.round((finalScore / 100) * 20),
      maxScore: 20,
      riskLevel,
      riskLabel,
      findings: acc.findings.length > 0 ? acc.findings : [`${CATEGORY_NAMES[cat]} alanında genel gelişim normal seyretmektedir.`],
      color: riskLevel === 'high' ? 'red' : riskLevel === 'moderate' ? 'yellow' : 'green',
    };

    totalScoreSum += finalScore;
    categoryCount++;
  });

  const overallScore = Math.round(totalScoreSum / Math.max(1, categoryCount));
  const overallRisk: 'low' | 'medium' | 'high' =
    overallScore < 50 ? 'high' : overallScore < 70 ? 'medium' : 'low';

  const recommendations: string[] = [];
  if (categoryScores.reading.riskLevel === 'high' || categoryScores.reading.riskLevel === 'moderate') {
    recommendations.push('Fonolojik farkındalık ve heceleme hızlandırma egzersizleri');
  }
  if (categoryScores.attention.riskLevel === 'high' || categoryScores.attention.riskLevel === 'moderate') {
    recommendations.push('Stroop ve odaklanma destekli çalışma blokları');
  }
  if (categoryScores.writing.riskLevel === 'high' || categoryScores.writing.riskLevel === 'moderate') {
    recommendations.push('Görsel-motor entegrasyon ve harf yönü çalışmaları');
  }
  if (categoryScores.math.riskLevel === 'high') {
    recommendations.push('Somutlaştırılmış sayı doğrusu ve mantıksal problem basamaklama');
  }
  if (recommendations.length === 0) {
    recommendations.push('Bilişsel zenginleştirme ve serbest okuma pekiştirmeleri');
  }

  const detailedResults = {
    reading: categoryScores.reading?.score ?? 70,
    writing: categoryScores.writing?.score ?? 70,
    attention: categoryScores.attention?.score ?? 70,
    memory: categoryScores.attention?.score ?? 70,
    visual: categoryScores.motor_spatial?.score ?? 70,
    auditory: categoryScores.language?.score ?? 70,
  };

  return {
    id: `interaktif_${Date.now()}`,
    studentId: studentMeta.studentId || '',
    studentName: studentMeta.studentName,
    age: studentMeta.age,
    grade: studentMeta.grade,
    date: new Date(),
    totalScore: overallScore,
    overallScore,
    riskLevel: overallRisk,
    status: 'completed',
    categoryScores,
    detailedResults,
    recommendations,
    strengths: strengths.length > 0 ? strengths : ['Gelişime açık genel bilişsel profil'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Belirgin bir zorluk gözlenmedi'],
    aiAnalysis: `${studentMeta.studentName} için uygulanan 11 aşamalı interaktif bilişsel test bataryası tamamlanmıştır. Genel başarı puanı %${overallScore} olarak hesaplanmıştır.`,
    generatedAt: new Date().toISOString(),
    respondentRole: 'teacher',
  };
}
