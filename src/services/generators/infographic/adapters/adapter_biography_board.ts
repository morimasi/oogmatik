import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type BiographyBoardAIResult = {
  title: string;
  lifeEvents: { date: string; event: string; impact: string }[];
  achievements: string[];
  pedagogicalNote: string;
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
  const socialTerms = ['kişi', 'lider', 'bilim insanı', 'sanatçı', 'tarih'];
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_BIOGRAPHY_BOARD_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'BİYOGRAFİ PANOSU',
    params,
    '1. Kişinin yaşam olaylarını kronolojik sırayla listele\n2. Başarılarını belirt\n3. Etkilerini açıkla\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için biyografi öğrenme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      lifeEvents: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            date: { type: 'STRING' },
            event: { type: 'STRING' },
            impact: { type: 'STRING' },
          },
        },
      },
      achievements: { type: 'ARRAY', items: { type: 'STRING' } },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as BiographyBoardAIResult;
  return {
    title: result.title || `${params.topic} - Biyografi Panosu`,
    content: {
      timeline: (result.lifeEvents || []).map((event) => ({
        date: event.date,
        title: event.event,
        description: event.impact,
        isKeyEvent: true,
      })),
      steps: (result.lifeEvents || []).map((event, i) => ({
        stepNumber: i + 1,
        label: `${event.date}: ${event.event}`,
        description: event.impact,
        isCheckpoint: i === 0,
        scaffoldHint: `Etki: ${event.impact}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Biyografi panosu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için önemli kişilerin yaşam hikayelerini görsel ve kronolojik olarak anlamalarını sağlayan önemli bir sosyal bilgiler aracıdır. Yaşam olaylarının zaman çizelgesi üzerinde sıralanması ve başarılarının vurgulanması, soyut tarihsel kişilikleri somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, görsel düzenleme ve renk kodlaması ile biyografik bilgileri daha kolay öğrenir ve rol modellerinden ilham alarak kişisel gelişimlerini desteklerler.',
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Biyografi okuma', 'Kronolojik düşünme', 'Rol model tanıma'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_BIOGRAPHY_BOARD_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const lifeEvents = [
    { date: '1881', event: 'Doğum', impact: "Selanik'te dünyaya geldi." },
    { date: '1905', event: 'Askeri Eğitim', impact: "Harp Okulu'ndan mezun oldu." },
    { date: '1915', event: 'Çanakkale Zaferi', impact: "Anafartalar'da büyük zafer kazandı." },
    { date: '1923', event: 'Cumhuriyet', impact: "Türkiye Cumhuriyeti'ni kurdu." },
  ];
  const achievements = [
    "Cumhuriyet'in kurucusu",
    'Bağımsızlık mücadelesinin lideri',
    'Eğitim reformcusu',
  ];

  const categoryDescriptions: Record<string, string> = {
    social:
      'Biyografi panosu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için önemli kişilerin yaşam hikayelerini görsel ve kronolojik olarak anlamalarını sağlayan temel bir sosyal bilgiler aracıdır. Yaşam olaylarının zaman çizelgesi üzerinde sıralanması ve başarılarının vurgulanması, soyut tarihsel kişilikleri somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, görsel düzenleme ve renk kodlaması ile biyografik bilgileri daha kolay öğrenirler.',
    math: 'Yaşam olayları arasındaki süreleri hesaplamak, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi tarih ile bağdaştırır.',
    language:
      'Biyografi okumak, disleksi desteğine ihtiyacı olan öğrenciler için anlatım becerisini ve kelime dağarcığını geliştirir.',
    science:
      'Bilim insanlarının biyografileri, disleksi desteğine ihtiyacı olan öğrenciler için bilimsel keşifleri bağlamsal olarak anlamalarını sağlar.',
    general:
      'Biyografi panosu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için rol modellerini tanımada önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Biyografi Panosu`,
    content: {
      timeline: lifeEvents.map((event) => ({
        date: event.date,
        title: event.event,
        description: event.impact,
        isKeyEvent: true,
      })),
      steps: lifeEvents.map((event, i) => ({
        stepNumber: i + 1,
        label: `${event.date}: ${event.event}`,
        description: event.impact,
        isCheckpoint: i === 0,
        scaffoldHint: `Etki: ${event.impact}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Biyografi okuma', 'Kronolojik düşünme', 'Rol model tanıma'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_BIOGRAPHY_BOARD: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_BIOGRAPHY_BOARD,
  aiGenerator: generateInfographic_BIOGRAPHY_BOARD_AI,
  offlineGenerator: generateInfographic_BIOGRAPHY_BOARD_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'personName',
        type: 'string',
        label: 'Kişi Adı',
        defaultValue: 'Mustafa Kemal Atatürk',
        description: 'Kimin biyografisi gösterilsin?',
      },
      {
        name: 'showAchievements',
        type: 'boolean',
        label: 'Başarıları Göster',
        defaultValue: true,
        description: 'Kişinin başarıları ayrı bölümde gösterilsin mi?',
      },
    ],
  },
};
