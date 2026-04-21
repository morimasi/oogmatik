import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type StudyPlanAIResult = {
  title: string;
  plan: { day: string; subject: string; duration: string; method: string }[];
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

export async function generateInfographic_STUDY_PLAN_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ÇALIŞMA PLANI',
    params,
    '1. Haftalık çalışma planı oluştur\n2. Her gün için konu, süre ve çalışma yöntemini belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      plan: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            day: { type: 'STRING' },
            subject: { type: 'STRING' },
            duration: { type: 'STRING' },
            method: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as StudyPlanAIResult;
  return {
    title: result.title || `${params.topic} - Çalışma Planı`,
    content: {
      steps: (result.plan || []).map((item, i) => ({
        stepNumber: i + 1,
        label: `${item.day}: ${item.subject}`,
        description: item.method,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Süre: ${item.duration}`,
      })),
      strategicContent: {
        strategyName: 'Haftalık Çalışma Planı',
        steps: (result.plan || []).map((p) => `${p.day}: ${p.subject}`),
        useWhen: 'Haftalık ders programı oluştururken',
        benefits: ['Düzenli tekrar', 'Konu dağılımı dengesi', 'Mola planlaması'],
      },
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Planlama', 'Zaman yönetimi', 'Düzenli tekrar', 'Öz düzenleme'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_STUDY_PLAN_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const plan = [
    { day: 'Pazartesi', subject: params.topic, duration: '30 dk', method: 'Okuma + Not alma' },
    { day: 'Salı', subject: params.topic, duration: '25 dk', method: 'Alıştırma çözme' },
    { day: 'Çarşamba', subject: 'Tekrar', duration: '20 dk', method: 'Flashcard ile tekrar' },
    { day: 'Perşembe', subject: params.topic, duration: '30 dk', method: 'Deneme/Test çözümü' },
    { day: 'Cuma', subject: 'Genel Değerlendirme', duration: '20 dk', method: 'Özet' },
  ];

  return {
    title: `${params.topic} - Çalışma Planı`,
    content: {
      steps: plan.map((item, i) => ({
        stepNumber: i + 1,
        label: `${item.day}: ${item.subject}`,
        description: item.method,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Süre: ${item.duration}`,
      })),
      strategicContent: {
        strategyName: 'Haftalık Çalışma Planı',
        steps: plan.map((p) => `${p.day}: ${p.subject}`),
        useWhen: 'Haftalık ders programı oluştururken',
        benefits: ['Düzenli tekrar', 'Konu dağılımı dengesi', 'Mola planlaması'],
      },
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Planlama', 'Zaman yönetimi', 'Düzenli tekrar', 'Öz düzenleme'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_STUDY_PLAN: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_STUDY_PLAN,
  aiGenerator: generateInfographic_STUDY_PLAN_AI,
  offlineGenerator: generateInfographic_STUDY_PLAN_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'weekCount',
        type: 'number',
        label: 'Hafta Sayısı',
        defaultValue: 1,
        description: 'Kaç haftalık çalışma planı oluşturulsun?',
      },
      {
        name: 'dailyMinutes',
        type: 'number',
        label: 'Günlük Çalışma (dakika)',
        defaultValue: 30,
        description: 'Günlük toplam çalışma süresi',
      },
    ],
  },
};
