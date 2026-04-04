import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type GeometryExplorerAIResult = {
  title: string;
  shapes: { name: string; sides: number; angles: number; properties: string[] }[];
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
  const mathTerms = ['şekil', 'geometri', 'üçgen', 'kare', 'daire', 'açı', 'kenar'];
  if (mathTerms.some((term) => topic.toLowerCase().includes(term))) return 'math' as const;
  return 'general' as const;
}

export async function generateInfographic_GEOMETRY_EXPLORER_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ŞEKİL ÖZELLİKLERİ',
    params,
    '1. Geometrik şekilleri listele\n2. Her şeklin kenar, açı ve özelliklerini belirt\n3. Görsel sembollerle destekle\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için geometrik kavramları öğrenme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      shapes: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            sides: { type: 'NUMBER' },
            angles: { type: 'NUMBER' },
            properties: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as GeometryExplorerAIResult;
  return {
    title: result.title || `${params.topic} - Şekil Özellikleri`,
    content: {
      steps: (result.shapes || []).map((shape, i) => ({
        stepNumber: i + 1,
        label: shape.name,
        description: `${shape.sides} kenar, ${shape.angles} açı. ${shape.properties.join(', ')}`,
        isCheckpoint: shape.sides === 4,
        scaffoldHint: `Kenar sayısı: ${shape.sides}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Geometrik şekil keşfi, disleksi desteğine ihtiyacı olan öğrenciler için uzamsal düşünme becerilerini geliştiren önemli bir etkinlik alanıdır. Şekillerin kenar sayısı, açı özellikleri ve görsel karakteristikleri somut olarak incelendiğinde, soyut geometrik kavramlar somutlaşır. Disleksi desteğine ihtiyacı olan öğrenciler, görsel-uzamsal zekalarını kullanarak geometrik ilişkileri daha kolay kavrarlar. Bu yaklaşım, aynı zamanda görsel algı ve ayırt edicilik becerilerini de destekler.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Geometrik şekil tanıma', 'Uzamsal düşünme', 'Özellik karşılaştırma'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_GEOMETRY_EXPLORER_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);

  const shapes = [
    {
      name: 'Üçgen',
      sides: 3,
      angles: 3,
      properties: ['3 kenar', '3 açı', 'İç açılar toplamı 180°'],
    },
    {
      name: 'Kare',
      sides: 4,
      angles: 4,
      properties: ['4 eşit kenar', '4 dik açı', 'Köşegenler eşit'],
    },
    {
      name: 'Dikdörtgen',
      sides: 4,
      angles: 4,
      properties: ['Karşılıklı kenarlar eşit', '4 dik açı'],
    },
    {
      name: 'Daire',
      sides: 0,
      angles: 0,
      properties: ['Köşesiz', 'Sürekli eğri', 'Merkezden eşit uzaklık'],
    },
    {
      name: 'Beşgen',
      sides: 5,
      angles: 5,
      properties: ['5 kenar', '5 açı', 'İç açılar toplamı 540°'],
    },
    {
      name: 'Altıgen',
      sides: 6,
      angles: 6,
      properties: ['6 kenar', '6 açı', 'İç açılar toplamı 720°'],
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    math: 'Geometrik şekil keşfi, disleksi desteğine ihtiyacı olan öğrenciler için uzamsal düşünme ve şekil ayırt edicilik becerilerini geliştiren temel bir matematik etkinliğidir. Her şeklin kendine özgü özelliklerini görsel olarak incelemek, soyut kavramları somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, görsel-uzamsal zekalarını kullanarak geometrik ilişkileri daha kolay kavrarlar ve bu beceri günlük yaşamda da fayda sağlar.',
    science:
      'Fen bilimlerinde geometrik şekiller doğada sıkça görülür. Disleksi desteğine ihtiyacı olan öğrenciler için şekil özelliklerini görsel olarak keşfetmek, doğadaki matematiksel düzeni anlamalarına yardımcı olur.',
    language:
      'Geometrik kavramların doğru kullanımı dil gelişimini destekler. Disleksi desteğine ihtiyacı olan öğrenciler için şekil isimleri ve özellikleri ile kelime dağarcığı genişletilir.',
    social:
      'Mimarlık ve sanatta geometrik şekiller önemli rol oynar. Disleksi desteğine ihtiyacı olan öğrenciler için şekil özelliklerini tanımak, çevrelerindeki yapıları anlamalarına yardımcı olur.',
    general:
      'Geometrik şekil keşfi, disleksi desteğine ihtiyacı olan öğrenciler için temel matematik ve uzamsal düşünme becerilerini geliştiren önemli bir öğrenme alanıdır.',
  };

  return {
    title: `${params.topic} - Şekil Özellikleri`,
    content: {
      steps: shapes.map((shape, i) => ({
        stepNumber: i + 1,
        label: shape.name,
        description: `${shape.sides} kenar, ${shape.angles} açı. ${shape.properties.join(', ')}`,
        isCheckpoint: shape.sides === 4,
        scaffoldHint: `Kenar sayısı: ${shape.sides}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Geometrik şekil tanıma', 'Uzamsal düşünme', 'Özellik karşılaştırma'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_GEOMETRY_EXPLORER: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_GEOMETRY_EXPLORER,
  aiGenerator: generateInfographic_GEOMETRY_EXPLORER_AI,
  offlineGenerator: generateInfographic_GEOMETRY_EXPLORER_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'shapeTypes',
        type: 'number',
        label: 'Şekil Sayısı',
        defaultValue: 6,
        description: 'Kaç farklı geometrik şekil gösterilsin?',
      },
      {
        name: 'showProperties',
        type: 'boolean',
        label: 'Özellikleri Göster',
        defaultValue: true,
        description: 'Her şeklin özellikleri detaylı gösterilsin mi?',
      },
    ],
  },
};
