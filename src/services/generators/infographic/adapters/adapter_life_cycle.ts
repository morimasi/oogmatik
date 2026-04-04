import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type LifeCycleAIResult = {
  title: string;
  stages: { name: string; description: string; duration: string }[];
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
  const scienceTerms = ['bitki', 'hayvan', 'kelebek', 'kurbağa', 'yumurta'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  return 'general' as const;
}

export async function generateInfographic_LIFE_CYCLE_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'YAŞAM DÖNGÜSÜ',
    params,
    '1. Canlının yaşam döngüsü aşamalarını belirle\n2. Her aşamayı açıkla ve süresini belirt\n3. Döngüsel bağlantıları göster\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için yaşam döngüsü öğrenme stratejileri (min 100 kelime)'
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
            duration: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as LifeCycleAIResult;
  return {
    title: result.title || `${params.topic} - Yaşam Döngüsü`,
    content: {
      scienceData: {
        topic: params.topic,
        stages: (result.stages || []).map((s) => s.name),
        properties: Object.fromEntries((result.stages || []).map((s) => [s.name, s.description])),
      },
      steps: (result.stages || []).map((stage, i) => ({
        stepNumber: i + 1,
        label: `Aşama ${i + 1}: ${stage.name}`,
        description: stage.description,
        isCheckpoint: i === 0 || i === (result.stages || []).length - 1,
        scaffoldHint: `Süre: ${stage.duration}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Yaşam döngüsü infografiği, disleksi desteğine ihtiyacı olan öğrenciler için biyolojik süreçleri görsel ve sıralı olarak anlamalarını sağlayan önemli bir fen bilimleri aracıdır. Döngüsel yapının görsel temsili, soyut biyolojik kavramları somutlaştırır ve disleksi desteğine ihtiyacı olan öğrencilerin yaşam süreçlerini bütünsel olarak kavramalarına yardımcı olur. Her aşamanın görsel sembollerle desteklenmesi, bilgiyi kalıcı hale getirir ve bilimsel düşünce becerilerini geliştirir.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Yaşam döngüsü anlama', 'Sıralı düşünme', 'Biyolojik süreçleri takip'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_LIFE_CYCLE_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const stages = [
    {
      name: 'Yumurta',
      description: 'Canlının yaşam döngüsü yumurta ile başlar.',
      duration: '1-2 hafta',
    },
    {
      name: 'Larva/Yavru',
      description: 'Yumurtadan çıkan canlı büyümeye başlar.',
      duration: '2-4 hafta',
    },
    {
      name: 'Pupa/Gelişme',
      description: 'Canlı gelişim sürecine girer, dönüşüm yaşanır.',
      duration: '1-3 hafta',
    },
    {
      name: 'Yetişkin',
      description: 'Canlı yetişkin formuna ulaşır ve üreyebilir.',
      duration: 'Birkaç ay-yıl',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Yaşam döngüsü infografiği, disleksi desteğine ihtiyacı olan öğrenciler için biyolojik süreçleri görsel ve sıralı olarak anlamalarını sağlayan temel bir fen bilimleri aracıdır. Döngüsel yapının görsel temsili, soyut biyolojik kavramları somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, her aşamayı görsel sembollerle takip ederek yaşam süreçlerini bütünsel olarak kavrarlar ve bu bilgi bilimsel düşünce becerilerini geliştirir.',
    math: 'Yaşam döngüsündeki süreleri hesaplamak, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi biyoloji ile bağdaştırır.',
    language:
      'Yaşam döngüsü aşamalarını anlatmak, disleksi desteğine ihtiyacı olan öğrenciler için sıralı anlatım becerisini geliştirir.',
    social:
      'Yaşam döngüsü kavramı insan yaşamı ile de ilişkilidir. Disleksi desteğine ihtiyacı olan öğrenciler için yaşam evrelerini anlamak, empati becerisini destekler.',
    general:
      'Yaşam döngüsü infografiği, disleksi desteğine ihtiyacı olan öğrenciler için doğal süreçleri anlamada önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Yaşam Döngüsü`,
    content: {
      scienceData: {
        topic: params.topic,
        stages: stages.map((s) => s.name),
        properties: Object.fromEntries(stages.map((s) => [s.name, s.description])),
      },
      steps: stages.map((stage, i) => ({
        stepNumber: i + 1,
        label: `Aşama ${i + 1}: ${stage.name}`,
        description: stage.description,
        isCheckpoint: i === 0 || i === stages.length - 1,
        scaffoldHint: `Süre: ${stage.duration}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Yaşam döngüsü anlama', 'Sıralı düşünme', 'Biyolojik süreçleri takip'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_LIFE_CYCLE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_LIFE_CYCLE,
  aiGenerator: generateInfographic_LIFE_CYCLE_AI,
  offlineGenerator: generateInfographic_LIFE_CYCLE_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'organism',
        type: 'string',
        label: 'Canlı Türü',
        defaultValue: 'Kelebek',
        description: 'Hangi canlının yaşam döngüsü gösterilsin?',
      },
      {
        name: 'showDuration',
        type: 'boolean',
        label: 'Süreleri Göster',
        defaultValue: true,
        description: 'Her aşamanın süresi gösterilsin mi?',
      },
    ],
  },
};
