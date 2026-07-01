import type { SubTestResult } from '../../../types';
import type { EvaluationCategory, ScreeningResult } from '../../../types/screening';

interface ProfessionalAssessmentContext {
  studentName: string;
  age: number;
  grade: string;
  strengths?: string[];
  concerns?: string[];
  supportContext?: string;
}

interface ProfessionalReportInput extends Partial<ScreeningResult> {
  subTests?: SubTestResult[];
  categoryScores?: ScreeningResult['categoryScores'];
}

export interface TestVariation {
  title: string;
  description: string;
  guidance: string;
  difficultyHint: string;
}

export interface AdaptiveAssessmentConfig {
  trialCount: number;
  guidance: string;
  difficultyHint: string;
  pacingLabel: string;
}

export const buildStudentProfileContext = (context: ProfessionalAssessmentContext): string => {
  const sections = [
    `Öğrenci: ${context.studentName}`,
    `Yaş: ${context.age}`,
    `Sınıf: ${context.grade}`,
    `Güçlü Yönler: ${context.strengths?.join(', ') || 'belirtilmemiş'}`,
    `İzlenmesi Önerilen Alanlar: ${context.concerns?.join(', ') || 'belirtilmemiş'}`,
    `Destek Bağlamı: ${context.supportContext || 'sessiz ve düzenli çalışma ortamı'}`,
  ];

  return sections.join('\n');
};

export const buildProfessionalAssessmentPrompt = (
  report: ProfessionalReportInput,
  context: ProfessionalAssessmentContext
): string => {
  const profile = buildStudentProfileContext(context);
  const subTests = (report.subTests ?? []).map((test) => `${test.name}: skor ${test.score}, doğruluk ${test.accuracy}`).join('\n');
  const categories = Object.entries(report.categoryScores ?? {}).map(([key, value]) => `${key}: ${value?.score ?? 0}`).join('\n');

  return `
Profesyonel değerlendirme raporu oluştur.
Bu rapor, özel eğitim ve pedagojik değerlendirme odaklıdır.

ÖĞRENCİ PROFİLİ:
${profile}

UYGULANAN ALT TESTLER:
${subTests || 'Alt test verisi yok.'}

KATEGORİ SKORLARI:
${categories || 'Kategori skoru yok.'}

ZORUNLU İÇERİK:
- Derinlemesine güçlü yönler ve gelişim alanları analiz et.
- Öğrencinin yaşına ve sınıf düzeyine uygun, gerçekçi ve empatik bir değerlendirme yaz.
- Her alan için en az 3 somut destek önerisi ver.
- Sonuçları BEP hedefleriyle uyumlu, ölçülebilir, öğretmen/veli odaklı şekilde sun.
- Riskli alanlarda dikkat edilmesi gereken noktaları açıkla.
- Başarı gösterdiği alanları vurgula.
`;
};

export const getAssessmentTestVariation = (
  domain: string,
  context: Pick<ProfessionalAssessmentContext, 'studentName' | 'age' | 'grade' | 'concerns'>
): TestVariation => {
  const concernText = context.concerns?.join(', ') || 'genel bilişsel destek';

  const map: Record<string, TestVariation> = {
    processing_speed: {
      title: `İşlem Hızı · ${context.studentName}`,
      description: `${context.studentName} için hızlı tepki ve akıcılık odaklı premium bir test sürümü.`,
      guidance: `Bu bölümde ${concernText} alanına odaklanarak kısa ve net yönergeler ver.`,
      difficultyHint: 'Başlangıçta kolay, sonra orta seviyeye çık.',
    },
    selective_attention: {
      title: `Seçici Dikkat · ${context.studentName}`,
      description: `${context.studentName} için dikkat kontrolü ve odaklanma yeteneğini değerlendiren varyasyon.`,
      guidance: 'Dikkat dağıtıcı unsurları azaltıp net bir odak süreci sun.',
      difficultyHint: 'Dikkat süresini kademeli artır.',
    },
    default: {
      title: `Premium Değerlendirme · ${context.studentName}`,
      description: `${context.studentName} için kişiselleştirilmiş ve pedagojik olarak dengeli bir test akışı.`,
      guidance: 'Öğrencinin yaş ve sınıf düzeyine uygun sade yönergeler kullan.',
      difficultyHint: 'Zorluk seviyesini hafif ve kontrollü tut.',
    },
  };

  return map[domain] ?? map.default;
};

export const getAdaptiveAssessmentConfig = (
  domain: string,
  context: Pick<ProfessionalAssessmentContext, 'studentName' | 'age' | 'grade' | 'concerns'>
): AdaptiveAssessmentConfig => {
  const concernText = context.concerns?.join(', ') || 'genel bilişsel destek';
  const isYoungerLearner = context.age <= 8;
  const baseGuidance = isYoungerLearner
    ? `Bu bölümde ${context.studentName} için kısa ve net yönergeler kullan; her adımı sakin bir cümleyle ver.`
    : `Bu bölümde ${context.studentName} için ${concernText} alanına odaklanarak net ve yapılandırılmış yönergeler ver.`;

  const map: Record<string, AdaptiveAssessmentConfig> = {
    processing_speed: {
      trialCount: isYoungerLearner ? 12 : 20,
      guidance: `${baseGuidance} Öğrencinin dikkatini korumak için 1-2 örnek deneme yap.` ,
      difficultyHint: isYoungerLearner ? 'Başlangıçta kolay tut, sonra hafifçe zorlaştır.' : 'Başlangıçta orta seviye, sonra zorluğa çık.',
      pacingLabel: isYoungerLearner ? 'yavaş ve destekleyici' : 'dengeli ve odaklı',
    },
    selective_attention: {
      trialCount: isYoungerLearner ? 10 : 16,
      guidance: `${baseGuidance} Dikkat dağıtıcı unsurları azaltıp kısa bir odak süreci sun.`,
      difficultyHint: 'Dikkat süresini kademeli artır.',
      pacingLabel: isYoungerLearner ? 'kısa ve tekrarlı' : 'sabit ve kontrollü',
    },
    default: {
      trialCount: isYoungerLearner ? 10 : 14,
      guidance: `${baseGuidance} Öğrencinin yaş ve sınıf düzeyine uygun sade bir akış sun.`,
      difficultyHint: 'Zorluk seviyesini hafif ve kontrollü tut.',
      pacingLabel: 'yumuşak ve destekleyici',
    },
  };

  return map[domain] ?? map.default;
};

export const buildProfessionalAssessmentReport = (
  report: ProfessionalReportInput,
  context: ProfessionalAssessmentContext
): { summary: string; recommendations: string[]; cautions: string[]; strengths: string[]; bePGoals: string[] } => {
  const summary = buildProfessionalAssessmentPrompt(report, context);
  const strengths = context.strengths ?? [];
  const concerns = context.concerns ?? [];
  const recommendations = concerns.map((concern) => `${concern} alanında haftalık kısa ve tekrarlı destek planı hazırla.`);
  const cautions = concerns.length > 0
    ? concerns.map((concern) => `${concern} alanında aceleci değerlendirme yerine düzenli gözlem ve tekrar kullan.`)
    : ['Dikkat edilmesi gereken alanlar için öğretmen ve veli gözlemlerini birleştir.'];
  const bePGoals = concerns.length > 0
    ? concerns.map((concern) => `${concern} alanında 4 haftalık süreçte %80 hedef başarı için haftalık 3 kısa oturum planla.`)
    : ['BEP hedeflerini kısa, ölçülebilir ve öğretim odaklı tanımla.'];

  return {
    summary,
    recommendations,
    cautions,
    strengths,
    bePGoals,
  };
};
