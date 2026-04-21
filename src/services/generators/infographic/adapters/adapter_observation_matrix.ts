import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type ObservationMatrixAIResult = {
  title: string;
  observations: { behavior: string; context: string; frequency: string; notes: string }[];
};

function buildAIPrompt(
  activityName: string,
  params: UltraCustomizationParams,
  rules: string
): string {
  return `Sen ${params.ageGroup} yaş grubu, ${params.difficulty} zorluk seviyesinde, ${params.profile} profili için ${activityName} infografiği oluşturan bir pedagoji uzmanısın.
KONU: ${params.topic}
ÖZEL PARAMETRELER: ${JSON.stringify(params.activityParams, null, 2)}
KURALLAR:
${rules}
JSON ÇIKTI:`;
}

function detectCategory(topic: string): 'science' | 'math' | 'language' | 'social' | 'general' {
  const scienceTerms = ['deney', 'gözlem', 'doğa', 'bitki', 'hayvan', 'fen'];
  const mathTerms = ['matematik', 'hesap', 'sayı', 'işlem', 'problem'];
  const languageTerms = ['okuma', 'yazma', 'hikaye', 'kelime', 'dil'];
  const socialTerms = ['toplum', 'tarih', 'coğrafya', 'kültür'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  if (mathTerms.some((term) => topic.toLowerCase().includes(term))) return 'math' as const;
  if (languageTerms.some((term) => topic.toLowerCase().includes(term))) return 'language' as const;
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_OBSERVATION_MATRIX_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'GÖZLEM MATRİSİ',
    params,
    '1. Gözlem kriterlerini ve değerlendirme matrisini oluştur\n2. Her davranış için bağlam, sıklık ve notlar belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      observations: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            behavior: { type: 'STRING' },
            context: { type: 'STRING' },
            frequency: { type: 'STRING' },
            notes: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as ObservationMatrixAIResult;
  return {
    title: result.title || `${params.topic} - Gözlem Matrisi`,
    content: {
      steps: (result.observations || []).map((o, i) => ({
        stepNumber: i + 1,
        label: o.behavior,
        description: `Bağlam: ${o.context}`,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Sıklık: ${o.frequency} | Not: ${o.notes}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Gözlem', 'Veri toplama', 'Değerlendirme', 'Belgeleme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_OBSERVATION_MATRIX_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const observations = [
    {
      behavior: 'Okuma akıcılığı',
      context: 'Sesli okuma sırasında',
      frequency: 'Her ders',
      notes: 'Heceleme desteği gerekli',
    },
    {
      behavior: 'Yazma hızı',
      context: 'Yazma görevlerinde',
      frequency: 'Her ders',
      notes: 'Ek süre sağlanmalı',
    },
    {
      behavior: 'Dikkat süresi',
      context: 'Bağımsız çalışma sırasında',
      frequency: 'Günlük',
      notes: '15 dakika odaklanabiliyor',
    },
    {
      behavior: 'Sosyal etkileşim',
      context: 'Grup çalışmalarında',
      frequency: 'Haftada 3',
      notes: 'Aktif katılım gösteriyor',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Gözlem matrisi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri dersindeki öğrenme davranışlarını sistematik olarak gözlemlemede yardımcı olur. Deney yapma ve gözlem kaydetme becerilerini izlemek, disleksi desteğine ihtiyacı olan öğrencilerin fen bilimleri öğrenme süreçlerini bireyselleştirmeyi sağlar.',
    math: 'Gözlem matrisi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik dersindeki problem çözme ve işlem becerilerini gözlemlemede rehberlik eder. Matematiksel düşünce süreçlerini izlemek, disleksi desteğine ihtiyacı olan öğrencilerin matematik öğrenme ihtiyaçlarını belirlemeyi kolaylaştırır.',
    language:
      'Gözlem matrisi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma becerilerini sistematik olarak gözlemlemede temel bir araçtır. Okuma akıcılığı, yazma hızı ve kelime tanıma gibi dil becerilerini izlemek, disleksi desteğine ihtiyacı olan öğrencilerin dil gelişimini veriye dayalı olarak takip etmeyi sağlar.',
    social:
      'Gözlem matrisi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler dersindeki katılım ve tartışma becerilerini gözlemlemede destek sağlar. Grup tartışmalarına katılım ve fikir ifade etme davranışlarını izlemek, disleksi desteğine ihtiyacı olan öğrencilerin sosyal öğrenme süreçlerini değerlendirir.',
    general:
      'Gözlem matrisi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için öğrenme davranışlarını ve akademik performansı sistematik olarak gözlemleme ve kaydetme aracıdır. Disleksi desteğine ihtiyacı olan öğrencilerin öğrenme süreçlerindeki güçlü ve zorlu alanları, yapılandırılmış gözlem matrisleri ile nesnel olarak belirlenebilir. Gözlem verileri, disleksi desteğine ihtiyacı olan öğrencilerin BEP hedeflerinin güncellenmesinde ve öğretim stratejilerinin uyarlanmasında kritik rol oynar. Düzenli gözlem kayıtları, disleksi desteğine ihtiyacı olan öğrencilerin gelişimini belgeleyerek veli-öğretmen-uzman iş birliğini güçlendirir ve eğitim kararlarının veriye dayalı alınmasını sağlar.',
  };

  return {
    title: `${params.topic} - Gözlem Matrisi`,
    content: {
      steps: observations.map((o, i) => ({
        stepNumber: i + 1,
        label: o.behavior,
        description: `Bağlam: ${o.context}`,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Sıklık: ${o.frequency} | Not: ${o.notes}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Gözlem', 'Veri toplama', 'Değerlendirme', 'Belgeleme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_OBSERVATION_MATRIX: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_OBSERVATION_MATRIX,
  aiGenerator: generateInfographic_OBSERVATION_MATRIX_AI,
  offlineGenerator: generateInfographic_OBSERVATION_MATRIX_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'observationPeriod',
        type: 'enum',
        label: 'Gözlem Dönemi',
        defaultValue: 'haftalik',
        options: ['gunluk', 'haftalik', 'aylik'],
        description: 'Gözlem ne sıklıkla yapılsın?',
      },
      {
        name: 'showNotes',
        type: 'boolean',
        label: 'Detaylı Notlar',
        defaultValue: true,
        description: 'Her gözlem için detaylı not alanı gösterilsin mi?',
      },
    ],
  },
};
