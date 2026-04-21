import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type FoodChainAIResult = {
  title: string;
  levels: { level: number; organism: string; role: string; description: string }[];
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
  const scienceTerms = ['besin', 'enerji', 'avcı', 'otçul', 'bitki'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  return 'general' as const;
}

export async function generateInfographic_FOOD_CHAIN_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'BESİN ZİNCİRİ',
    params,
    '1. Besin zinciri seviyelerini belirle\n2. Her seviyedeki canlıları ve rollerini açıkla\n3. Enerji akışını göster'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      levels: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            level: { type: 'NUMBER' },
            organism: { type: 'STRING' },
            role: { type: 'STRING' },
            description: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as FoodChainAIResult;
  return {
    title: result.title || `${params.topic} - Besin Zinciri`,
    content: {
      scienceData: {
        topic: params.topic,
        stages: (result.levels || []).map((l) => l.organism),
        relationships: (result.levels || [])
          .map((l, i, arr) => ({
            from: l.organism,
            to: arr[i + 1]?.organism || 'Ayrıştırıcılar',
            label: 'Enerji aktarımı',
          }))
          .filter((_, i, arr) => i < arr.length),
      },
      steps: (result.levels || []).map((level, i) => ({
        stepNumber: i + 1,
        label: `Seviye ${level.level}: ${level.organism}`,
        description: `${level.role} - ${level.description}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Rol: ${level.role}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Besin zinciri anlama', 'Enerji akışı', 'Ekosistem ilişkileri'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_FOOD_CHAIN_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const levels = [
    {
      level: 1,
      organism: 'Çimen',
      role: 'Üretici',
      description: 'Güneş enerjisini kullanarak besin üretir.',
    },
    {
      level: 2,
      organism: 'Çekirge',
      role: 'Birincil Tüketici',
      description: 'Bitkilerle beslenen otçul canlı.',
    },
    {
      level: 3,
      organism: 'Kurbağa',
      role: 'İkincil Tüketici',
      description: 'Böceklerle beslenen etçil canlı.',
    },
    {
      level: 4,
      organism: 'Yılan',
      role: 'Üçüncül Tüketici',
      description: 'Küçük hayvanlarla beslenen etçil canlı.',
    },
    {
      level: 5,
      organism: 'Kartal',
      role: 'Avcı',
      description: 'Besin zincirinin en üstündeki avcı.',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Besin zinciri infografiği, disleksi desteğine ihtiyacı olan öğrenciler için ekosistemdeki enerji akışını görsel ve sıralı olarak anlamalarını sağlayan temel bir fen bilimleri aracıdır. Her seviyenin canlısı ve rolü görsel sembollerle desteklendiğinde, soyut ekolojik kavramlar somutlaşır. Disleksi desteğine ihtiyacı olan öğrenciler, besin zincirindeki enerji transferini adım adım takip ederek doğadaki yaşam ilişkilerini bütünsel olarak kavrarlar ve çevre bilinci geliştirirler.',
    math: 'Besin zincirindeki enerji miktarlarını hesaplamak, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi biyoloji ile bağdaştırır.',
    language:
      'Besin zinciri aşamalarını anlatmak, disleksi desteğine ihtiyacı olan öğrenciler için sıralı anlatım ve bilimsel kelime dağarcığını geliştirir.',
    social:
      'Besin zinciri kavramı insan beslenmesi ve tarım ile ilişkilidir. Disleksi desteğine ihtiyacı olan öğrenciler için gıda üretim süreçlerini anlamada yardımcı olur.',
    general:
      'Besin zinciri infografiği, disleksi desteğine ihtiyacı olan öğrenciler için doğal yaşam ilişkilerini anlamada önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Besin Zinciri`,
    content: {
      scienceData: {
        topic: params.topic,
        stages: levels.map((l) => l.organism),
        relationships: levels
          .map((l, i) => ({
            from: l.organism,
            to: levels[i + 1]?.organism || 'Ayrıştırıcılar',
            label: 'Enerji aktarımı',
          }))
          .slice(0, -1),
      },
      steps: levels.map((level, i) => ({
        stepNumber: i + 1,
        label: `Seviye ${level.level}: ${level.organism}`,
        description: `${level.role} - ${level.description}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Rol: ${level.role}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Besin zinciri anlama', 'Enerji akışı', 'Ekosistem ilişkileri'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_FOOD_CHAIN: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_FOOD_CHAIN,
  aiGenerator: generateInfographic_FOOD_CHAIN_AI,
  offlineGenerator: generateInfographic_FOOD_CHAIN_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'ecosystem',
        type: 'string',
        label: 'Ekosistem Türü',
        defaultValue: 'Orman',
        description: 'Hangi ekosistemin besin zinciri gösterilsin?',
      },
      {
        name: 'showEnergy',
        type: 'boolean',
        label: 'Enerji Akışını Göster',
        defaultValue: true,
        description: 'Enerji transfer oranları gösterilsin mi?',
      },
    ],
  },
};
