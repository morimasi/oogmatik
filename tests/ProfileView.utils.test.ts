import { describe, it, expect } from 'vitest';

// Bu dosya ProfileView.tsx içindeki useMemo hesaplama mantığını test eder.
// Fonksiyonlar bileşen içinde tanımlandığından, mantığı doğrudan burada çoğaltıyoruz.

// --- computeMonthlyNewStudents ---
function computeMonthlyNewStudents(students: { id: string; createdAt?: string }[]): number {
  const now = new Date();
  return students.filter((s) => {
    if (!s.createdAt) return false;
    const created = new Date(s.createdAt);
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  }).length;
}

// --- computeAvgAssessmentScore ---
function computeAvgAssessmentScore(
  assessments: { report: { scores: { attention?: number } } }[]
): number {
  if (assessments.length === 0) return 0;
  const total = assessments.reduce(
    (sum, a) => sum + (a.report.scores.attention || 0),
    0
  );
  return Math.round(total / assessments.length);
}

// --- computePlanProgress (sıfıra bölme koruması) ---
function computePlanProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

describe('computeMonthlyNewStudents', () => {
  it('bu ay eklenen öğrenci sayısını döner', () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 5).toISOString();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString();
    const students = [
      { id: '1', createdAt: thisMonth },
      { id: '2', createdAt: thisMonth },
      { id: '3', createdAt: lastMonth },
    ];
    expect(computeMonthlyNewStudents(students)).toBe(2);
  });

  it('bu ay öğrenci yoksa 0 döner', () => {
    const lastMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      5
    ).toISOString();
    expect(computeMonthlyNewStudents([{ id: '1', createdAt: lastMonth }])).toBe(0);
  });

  it('createdAt eksik öğrencileri sayım dışında bırakır', () => {
    expect(computeMonthlyNewStudents([{ id: '1' }])).toBe(0);
  });

  it('boş liste için 0 döner', () => {
    expect(computeMonthlyNewStudents([])).toBe(0);
  });
});

describe('computeAvgAssessmentScore', () => {
  it('değerlendirmelerin ortalama dikkat skorunu hesaplar', () => {
    const assessments = [
      { report: { scores: { attention: 80 } } },
      { report: { scores: { attention: 60 } } },
    ];
    expect(computeAvgAssessmentScore(assessments)).toBe(70);
  });

  it('değerlendirme yoksa 0 döner', () => {
    expect(computeAvgAssessmentScore([])).toBe(0);
  });

  it('attention skoru olmayanlarda 0 kullanır', () => {
    const assessments = [
      { report: { scores: { attention: 90 } } },
      { report: { scores: {} } },
    ];
    expect(computeAvgAssessmentScore(assessments)).toBe(45);
  });

  it('tek değerlendirme ile doğru skoru döner', () => {
    expect(computeAvgAssessmentScore([{ report: { scores: { attention: 73 } } }])).toBe(73);
  });
});

describe('computePlanProgress (division by zero protection)', () => {
  it('tamamlanan gün oranını doğru hesaplar', () => {
    expect(computePlanProgress(7, 10)).toBe(70);
    expect(computePlanProgress(10, 10)).toBe(100);
    expect(computePlanProgress(0, 10)).toBe(0);
  });

  it('schedule boşsa 0 döner (sıfıra bölme koruması)', () => {
    expect(computePlanProgress(0, 0)).toBe(0);
  });
});
