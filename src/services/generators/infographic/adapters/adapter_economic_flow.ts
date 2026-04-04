import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type EconomicFlowAIResult = {
  title: string;
  stages: { name: string; description: string; participants: string[] }[];
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
  const socialTerms = ['ekonomi', 'ticaret', 'para', 'alışveriş'];
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_ECONOMIC_FLOW_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'EKONOMİK AKIŞ',
    params,
    '1. Ekonomik sürecin aşamalarını belirle\n2. Her aşamadaki aktörleri listele\n3. Para ve mal akışını göster\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için ekonomik kavramları öğrenme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      stages: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            description: { type: 'STRING' },
            participants: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as EconomicFlowAIResult;
  return {
    title: result.title || `${params.topic} - Ekonomik Akış`,
    content: {
      steps: (result.stages || []).map((stage, i) => ({
        stepNumber: i + 1,
        label: stage.name,
        description: stage.description,
        isCheckpoint: i === 0,
        scaffoldHint: `Aktörler: ${stage.participants.join(', ')}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Ekonomik akış infografiği, disleksi desteğine ihtiyacı olan öğrenciler için temel ekonomi kavramlarını görsel ve sıralı olarak anlamalarını sağlayan önemli bir sosyal bilgiler aracıdır. Üretim, dağıtım ve tüketim süreçlerinin görsel akış şeması ile gösterilmesi, soyut ekonomik kavramları somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve görsel düzenleme ile ekonomik ilişkileri daha kolay kavrar ve finansal okuryazarlık becerilerini geliştirirler.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Ekonomik süreçleri anlama', 'Finansal okuryazarlık', 'Ticaret ilişkileri'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_ECONOMIC_FLOW_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const stages = [
    {
      name: 'Üretim',
      description: 'Ham maddeler işlenerek ürün haline getirilir.',
      participants: ['Fabrikalar', 'Çiftçiler', 'İşçiler'],
    },
    {
      name: 'Dağıtım',
      description: 'Ürünler mağaza ve pazarlara ulaştırılır.',
      participants: ['Kamyoncular', 'Depolar', 'Lojistik'],
    },
    {
      name: 'Satış',
      description: 'Ürünler müşterilere satılır.',
      participants: ['Satıcılar', 'Mağazalar', 'Pazarlar'],
    },
    {
      name: 'Tüketim',
      description: 'Ürünler müşteriler tarafından kullanılır.',
      participants: ['Alışveriş yapanlar', 'Aileler'],
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    social:
      'Ekonomik akış infografiği, disleksi desteğine ihtiyacı olan öğrenciler için temel ekonomi kavramlarını görsel ve sıralı olarak anlamalarını sağlayan temel bir sosyal bilgiler aracıdır. Üretim, dağıtım ve tüketim süreçlerinin görsel akış şeması ile gösterilmesi, soyut ekonomik kavramları somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve görsel düzenleme ile ekonomik ilişkileri daha kolay kavrar ve finansal okuryazarlık becerilerini geliştirirler.',
    math: 'Ekonomik hesaplamalar (fiyat, indirim, kar) disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi günlük yaşam ile bağdaştırır.',
    language:
      'Ekonomik terimleri öğrenmek, disleksi desteğine ihtiyacı olan öğrenciler için finansal kelime dağarcığını geliştirir.',
    science:
      'Üretim süreçlerinde teknoloji ve bilim önemli rol oynar. Disleksi desteğine ihtiyacı olan öğrenciler için ekonomik akış, teknolojik gelişmeleri anlamada yardımcı olur.',
    general:
      'Ekonomik akış infografiği, disleksi desteğine ihtiyacı olan öğrenciler için finansal okuryazarlık geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Ekonomik Akış`,
    content: {
      steps: stages.map((stage, i) => ({
        stepNumber: i + 1,
        label: stage.name,
        description: stage.description,
        isCheckpoint: i === 0,
        scaffoldHint: `Aktörler: ${stage.participants.join(', ')}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Ekonomik süreçleri anlama', 'Finansal okuryazarlık', 'Ticaret ilişkileri'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_ECONOMIC_FLOW: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_ECONOMIC_FLOW,
  aiGenerator: generateInfographic_ECONOMIC_FLOW_AI,
  offlineGenerator: generateInfographic_ECONOMIC_FLOW_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'flowType',
        type: 'string',
        label: 'Akış Türü',
        defaultValue: 'Üretim-Tüketim',
        description: 'Hangi ekonomik akış gösterilsin?',
      },
      {
        name: 'showParticipants',
        type: 'boolean',
        label: 'Aktörleri Göster',
        defaultValue: true,
        description: 'Her aşamadaki aktörler gösterilsin mi?',
      },
    ],
  },
};
