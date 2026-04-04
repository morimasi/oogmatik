import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type MapExplorerAIResult = {
  title: string;
  locations: { name: string; type: string; features: string[]; description: string }[];
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
  const socialTerms = ['harita', 'şehir', 'ülke', 'kıta', 'coğrafya'];
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_MAP_EXPLORER_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'HARİTA KEŞFİ',
    params,
    '1. Harita üzerindeki önemli yerleri listele\n2. Her yerin tipini ve özelliklerini belirt\n3. Coğrafi konum bilgisi ekle\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için harita okuma stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      locations: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            type: { type: 'STRING' },
            features: { type: 'ARRAY', items: { type: 'STRING' } },
            description: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as MapExplorerAIResult;
  return {
    title: result.title || `${params.topic} - Harita Keşfi`,
    content: {
      steps: (result.locations || []).map((loc, i) => ({
        stepNumber: i + 1,
        label: loc.name,
        description: `${loc.type} - ${loc.description}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Özellikler: ${loc.features.join(', ')}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Harita keşfi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için mekansal düşünme ve coğrafi okuryazarlık becerilerini geliştiren önemli bir sosyal bilgiler aracıdır. Harita üzerindeki yerlerin görsel sembollerle ve renk kodlamasıyla işaretlenmesi, soyut coğrafi kavramları somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, harita okuma becerilerini yapılandırılmış görsel düzenleme ile geliştirir ve çevrelerindeki dünyayı daha iyi anlamaya başlarlar.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Harita okuma', 'Mekansal düşünme', 'Coğrafi farkındalık'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_MAP_EXPLORER_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const locations = [
    {
      name: 'İstanbul',
      type: 'Şehir',
      features: ['Boğaz', 'Tarihi Yarımada', 'İki Kıta'],
      description: 'İki kıtayı birleştiren şehir.',
    },
    {
      name: 'Ankara',
      type: 'Başkent',
      features: ['TBMM', 'Anıtkabir', 'Yönetim Merkezi'],
      description: "Türkiye'nin başkenti.",
    },
    {
      name: 'İzmir',
      type: 'Şehir',
      features: ['Ege Denizi', 'Liman', 'Tarih'],
      description: "Ege'nin incisi.",
    },
    {
      name: 'Antalya',
      type: 'Şehir',
      features: ['Akdeniz', 'Turizm', 'Tarihi Kalıntılar'],
      description: 'Turizm başkenti.',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    social:
      'Harita keşfi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için mekansal düşünme ve coğrafi okuryazarlık becerilerini geliştiren temel bir sosyal bilgiler aracıdır. Harita üzerindeki yerlerin görsel sembollerle ve renk kodlamasıyla işaretlenmesi, soyut coğrafi kavramları somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, harita okuma becerilerini yapılandırılmış görsel düzenleme ile geliştirirler.',
    math: 'Harita ölçeği ve mesafe hesaplama, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi coğrafya ile bağdaştırır.',
    language:
      'Coğrafi terimleri öğrenmek, disleksi desteğine ihtiyacı olan öğrenciler için kelime dağarcığını genişletir.',
    science:
      'Coğrafi özellikler doğal bilimlerle ilişkilidir. Disleksi desteğine ihtiyacı olan öğrenciler için harita okuma, iklim ve jeoloji kavramlarını anlamada yardımcı olur.',
    general:
      'Harita keşfi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için coğrafi okuryazarlık geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Harita Keşfi`,
    content: {
      steps: locations.map((loc, i) => ({
        stepNumber: i + 1,
        label: loc.name,
        description: `${loc.type} - ${loc.description}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Özellikler: ${loc.features.join(', ')}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Harita okuma', 'Mekansal düşünme', 'Coğrafi farkındalık'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_MAP_EXPLORER: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_MAP_EXPLORER,
  aiGenerator: generateInfographic_MAP_EXPLORER_AI,
  offlineGenerator: generateInfographic_MAP_EXPLORER_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'region',
        type: 'string',
        label: 'Bölge',
        defaultValue: 'Türkiye',
        description: 'Hangi bölgenin haritası gösterilsin?',
      },
      {
        name: 'showFeatures',
        type: 'boolean',
        label: 'Özellikleri Göster',
        defaultValue: true,
        description: 'Her yerin özellikleri detaylı gösterilsin mi?',
      },
    ],
  },
};
