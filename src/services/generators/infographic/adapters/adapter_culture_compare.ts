import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type CultureCompareAIResult = {
  title: string;
  cultures: { name: string; traditions: string[]; food: string[]; values: string[] }[];
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
  const socialTerms = ['kültür', 'gelenek', 'toplum', 'bayram'];
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_CULTURE_COMPARE_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'KÜLTÜR KARŞILAŞTIRMA',
    params,
    '1. Karşılaştırılacak kültürleri belirle\n2. Her kültürün gelenek, yemek ve değerlerini listele\n3. Ortak ve farklı yönleri göster\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için kültürler arası farkındalık öğrenme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      cultures: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            traditions: { type: 'ARRAY', items: { type: 'STRING' } },
            food: { type: 'ARRAY', items: { type: 'STRING' } },
            values: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as CultureCompareAIResult;
  return {
    title: result.title || `${params.topic} - Kültür Karşılaştırma`,
    content: {
      comparisons:
        result.cultures.length >= 2
          ? {
              leftTitle: result.cultures[0]?.name || 'Kültür A',
              rightTitle: result.cultures[1]?.name || 'Kültür B',
              leftItems: result.cultures[0]?.traditions || [],
              rightItems: result.cultures[1]?.traditions || [],
              commonGround: ['Aile bağları', 'Misafirperverlik'],
            }
          : undefined,
      steps: (result.cultures || []).flatMap((culture, i) =>
        culture.traditions.map((tradition, j) => ({
          stepNumber: i * 10 + j + 1,
          label: `${culture.name} - ${tradition}`,
          description: `Yemekler: ${culture.food.join(', ')}. Değerler: ${culture.values.join(', ')}`,
          isCheckpoint: j === 0,
          scaffoldHint: `Kültür: ${culture.name}`,
        }))
      ),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Kültür karşılaştırma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için farklı kültürleri tanıma ve saygı duyma becerilerini geliştiren önemli bir sosyal bilgiler aracıdır. Her kültürün gelenekleri, yemekleri ve değerleri görsel olarak karşılaştırıldığında, kültürel çeşitlilik somutlaşır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve görsel düzenleme ile kültürler arası benzerlik ve farklılıkları daha kolay kavrar ve çok kültürlü farkındalık geliştirirler.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kültürel farkındalık', 'Karşılaştırma yapma', 'Empati geliştirme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_CULTURE_COMPARE_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const cultures = [
    {
      name: 'Türk',
      traditions: ['Ramazan Bayramı', 'Kına Gecesi', 'Misafirperverlik'],
      food: ['Baklava', 'Kebap', 'Lahmacun'],
      values: ['Aile bağları', 'Saygı', 'Dayanışma'],
    },
    {
      name: 'Japon',
      traditions: ['Çay Seremonisi', 'Hanami', 'Yeni Yıl Kutlaması'],
      food: ['Sushi', 'Ramen', 'Tempura'],
      values: ['Disiplin', 'Uyum', 'Saygı'],
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    social:
      'Kültür karşılaştırma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için farklı kültürleri tanıma ve saygı duyma becerilerini geliştiren temel bir sosyal bilgiler aracıdır. Her kültürün gelenekleri, yemekleri ve değerleri görsel olarak karşılaştırıldığında, kültürel çeşitlilik somutlaşır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve görsel düzenleme ile kültürler arası benzerlik ve farklılıkları daha kolay kavrarlar.',
    math: 'Kültürel nüfus verilerini karşılaştırmak, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi sosyal bilimler ile bağdaştırır.',
    language:
      'Farklı kültürlerin dillerini keşfetmek, disleksi desteğine ihtiyacı olan öğrenciler için dilbilimsel farkındalık geliştirir.',
    science:
      'Kültürel tarım ve yemek gelenekleri bilim ile ilişkilidir. Disleksi desteğine ihtiyacı olan öğrenciler için kültürel mutfak bilgisi, beslenme bilimini destekler.',
    general:
      'Kültür karşılaştırma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için kültürel farkındalık geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Kültür Karşılaştırma`,
    content: {
      comparisons: {
        leftTitle: cultures[0].name,
        rightTitle: cultures[1].name,
        leftItems: cultures[0].traditions,
        rightItems: cultures[1].traditions,
        commonGround: ['Aile bağları', 'Saygı'],
      },
      steps: cultures.flatMap((culture, i) =>
        culture.traditions.map((tradition, j) => ({
          stepNumber: i * 10 + j + 1,
          label: `${culture.name} - ${tradition}`,
          description: `Yemekler: ${culture.food.join(', ')}. Değerler: ${culture.values.join(', ')}`,
          isCheckpoint: j === 0,
          scaffoldHint: `Kültür: ${culture.name}`,
        }))
      ),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kültürel farkındalık', 'Karşılaştırma yapma', 'Empati geliştirme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_CULTURE_COMPARE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_CULTURE_COMPARE,
  aiGenerator: generateInfographic_CULTURE_COMPARE_AI,
  offlineGenerator: generateInfographic_CULTURE_COMPARE_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'cultureCount',
        type: 'number',
        label: 'Kültür Sayısı',
        defaultValue: 2,
        description: 'Kaç kültür karşılaştırılsın?',
      },
      {
        name: 'showFood',
        type: 'boolean',
        label: 'Yemekleri Göster',
        defaultValue: true,
        description: 'Kültürel yemekler gösterilsin mi?',
      },
    ],
  },
};
