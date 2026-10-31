/**
 * Bilişsel Profil Servisi — BEP Modülü
 *
 * AdvancedStudent içinde gerçekten bulunan verilerden (notlar, devamsızlık,
 * ödev/katılım oranları, davranış puanı) BİLİŞSEL GÖSTERGE özeti üretir.
 *
 * ÖNEMLİ: Bu çıktı klinik bir değerlendirme değildir. Tanı koymaz, tanı yerine
 * kullanılamaz. Yalnızca var olan okul verilerinden türetilmiş gözlemsel
 * göstergelerdir ve öğretmene planlama desteği sunar (MEB 573 KHK, KVKK Md. 6).
 */

import { AdvancedStudent, GradeEntry } from '../types/student-advanced';

export interface CognitiveIndicator {
  key: string;
  label: string;
  /** 0-100 arası gözlemsel gösterge değeri */
  value: number;
  description: string;
}

export interface CognitiveProfileSummary {
  studentId: string;
  generatedAt: string;
  /** Özetin dayandığı verinin doluluk oranı (0-100). */
  dataCompleteness: number;
  indicators: CognitiveIndicator[];
  radarData: { label: string; value: number }[];
  strengths: string[];
  areasForImprovement: string[];
  recommendedInterventions: string[];
  /** Çıktının klinik tanı olmadığını belgeleyen sabit işaret. */
  observationalOnly: true;
}

const clamp = (value: number): number => Math.min(100, Math.max(0, Math.round(value)));

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

const round1 = (value: number): number => Math.round(value * 10) / 10;

/** GradeEntry listesinden ağırlıklı yüzdelik ortalama üretir. */
export const gradePercent = (entry: GradeEntry): number => {
  if (!Number.isFinite(entry.maxScore) || entry.maxScore <= 0) return 0;
  return clamp((entry.score / entry.maxScore) * 100);
};

/** Ders bazında ağırlıklı ortalamalar. */
export const subjectAveragesFromGrades = (grades: GradeEntry[]): Record<string, number> => {
  const buckets = new Map<string, { weighted: number; weight: number }>();

  grades.forEach((entry) => {
    const weight = Number.isFinite(entry.weight) && entry.weight > 0 ? entry.weight : 1;
    const current = buckets.get(entry.subject) ?? { weighted: 0, weight: 0 };
    buckets.set(entry.subject, {
      weighted: current.weighted + gradePercent(entry) * weight,
      weight: current.weight + weight,
    });
  });

  const result: Record<string, number> = {};
  buckets.forEach((bucket, subject) => {
    result[subject] = bucket.weight > 0 ? round1(bucket.weighted / bucket.weight) : 0;
  });
  return result;
};

const standardDeviation = (values: number[]): number => {
  if (values.length < 2) return 0;
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
};

interface IndicatorInput {
  student: AdvancedStudent;
}

const buildIndicators = ({ student }: IndicatorInput): CognitiveIndicator[] => {
  const grades = student.academic?.grades ?? [];
  const metrics = student.academic?.metrics;
  const subjectAverages = subjectAveragesFromGrades(grades);
  const subjectValues = Object.values(subjectAverages);

  const academicAverage = subjectValues.length > 0 ? average(subjectValues) : clamp(metrics?.gpa ?? 0);
  const consistency = subjectValues.length > 1 ? clamp(100 - standardDeviation(subjectValues) * 2) : 50;

  const attendanceRate = student.attendance?.stats?.attendanceRate ?? metrics?.attendanceRate ?? 100;
  const homeworkRate = metrics?.homeworkCompletionRate ?? 0;
  const participationRate = metrics?.participationRate ?? 0;

  const behaviorScore = student.behavior?.score ?? 0;
  const selfRegulation = clamp(50 + behaviorScore / 2);

  const expectedProgress = grades.length > 0 ? average(grades.map(gradePercent)) : 0;
  const performanceGap = subjectValues.length > 1 ? clamp(100 - Math.abs(average(subjectValues) - expectedProgress)) : 50;

  return [
    {
      key: 'academic_processing',
      label: 'Akademik İşlemleme',
      value: clamp(academicAverage),
      description: 'Ders notlarındaki ağırlıklı ortalama başarı yüzdesi.',
    },
    {
      key: 'consistency',
      label: 'Alanlar Arası Tutarlılık',
      value: consistency,
      description: 'Dersler arasındaki başarı farkının tersi; yüksek değer dengeli profili gösterir.',
    },
    {
      key: 'sustained_attention',
      label: 'Sürdürülebilir Katılım',
      value: clamp(attendanceRate),
      description: 'Okula/devamsızlık kayıtlarına dayalı katılım oranı.',
    },
    {
      key: 'executive_function',
      label: 'Görev Tamamlama',
      value: clamp(homeworkRate),
      description: 'Ödev tamamlama oranı; yürütücü işlev göstergesi olarak izlenir.',
    },
    {
      key: 'classroom_engagement',
      label: 'Derse Katılım',
      value: clamp(participationRate),
      description: 'Ders içi katılım oranı.',
    },
    {
      key: 'self_regulation',
      label: 'Öz Düzenleme',
      value: selfRegulation,
      description: 'Davranış puanından türetilen denge göstergesi (50 nötr kabul edilir).',
    },
    {
      key: 'performance_balance',
      label: 'Performans Dengesi',
      value: performanceGap,
      description: 'Beklenen ve gerçekleşen performans arasındaki uyum.',
    },
  ];
};

const completenessOf = (student: AdvancedStudent): number => {
  const checks = [
    (student.academic?.grades?.length ?? 0) > 0,
    (student.attendance?.records?.length ?? 0) > 0,
    Boolean(student.academic?.metrics),
    (student.iep?.goals?.length ?? 0) > 0,
    Boolean(student.aiProfile),
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
};

const STRENGTH_THRESHOLD = 70;
const IMPROVEMENT_THRESHOLD = 50;

const INTERVENTION_MAP: Record<string, string> = {
  academic_processing: 'Kısa ve sık tekrar eden çalışma oturumları planlayın; her oturum tek bir kazanıma odaklansın.',
  consistency: 'Güçlü alandaki başarıyı zayıf alana taşıyın: aynı yöntemi farklı ders içeriğiyle uygulayın.',
  sustained_attention: 'Devamsızlık nedenlerini veli ile birlikte değerlendirin; derse girişte kısa hazırlık rutini kurun.',
  executive_function: 'Ödevleri 3 adımlı kontrol listesine bölün ve günlük tamamlama takibi yapın.',
  classroom_engagement: 'Söz hakkı için düşük riskli roller verin (görev dağıtıcı, süre tutucu).',
  self_regulation: 'Öz düzenleme için görsel zamanlayıcı ve mola kartı kullanın.',
  performance_balance: 'Değerlendirme biçimini çeşitlendirin: sözlü, yazılı ve ürün dosyası birlikte kullanılsın.',
};

/**
 * Öğrencinin mevcut okul verilerinden bilişsel gösterge özeti üretir.
 * Klinik değerlendirme değildir; tanı amacıyla kullanılamaz.
 */
export const buildCognitiveProfile = (student: AdvancedStudent): CognitiveProfileSummary => {
  const indicators = buildIndicators({ student });

  const strengths = indicators
    .filter((indicator) => indicator.value >= STRENGTH_THRESHOLD)
    .map((indicator) => `${indicator.label} güçlü görünüyor (%${indicator.value}).`);

  const weakIndicators = indicators.filter((indicator) => indicator.value < IMPROVEMENT_THRESHOLD);

  const areasForImprovement = weakIndicators.map(
    (indicator) => `${indicator.label} için ek desteğe ihtiyaç olabilir (%${indicator.value}).`
  );

  const recommendedInterventions = weakIndicators.map(
    (indicator) => INTERVENTION_MAP[indicator.key] ?? `${indicator.label} için bireysel destek planlayın.`
  );

  return {
    studentId: student.id,
    generatedAt: new Date().toISOString(),
    dataCompleteness: completenessOf(student),
    indicators,
    radarData: indicators.map((indicator) => ({ label: indicator.label, value: indicator.value })),
    strengths:
      strengths.length > 0 ? strengths : ['Henüz güçlü alan tanımlanabilecek yeterli veri yok.'],
    areasForImprovement,
    recommendedInterventions:
      recommendedInterventions.length > 0
        ? recommendedInterventions
        : ['Tüm göstergeler dengeli; mevcut öğretim yaklaşımını sürdürün.'],
    observationalOnly: true,
  };
};

/**
 * Özet metnini tek paragraf hâlinde döndürür (raporlarda kullanılır).
 */
export const summarizeCognitiveProfile = (summary: CognitiveProfileSummary): string => {
  const strongest = [...summary.indicators].sort((a, b) => b.value - a.value)[0];
  const weakest = [...summary.indicators].sort((a, b) => a.value - b.value)[0];
  return (
    `Gözlemsel göstergelere göre en güçlü alan "${strongest.label}" (%${strongest.value}), ` +
    `en fazla destek gerektiren alan "${weakest.label}" (%${weakest.value}). ` +
    `Veri doluluğu %${summary.dataCompleteness}. Bu özet tanı amacı taşımaz.`
  );
};
