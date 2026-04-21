import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type GeographyProfileAIResult = {
  title: string;
  features: { name: string; value: string; description: string }[];
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
  const socialTerms = ['coğrafya', 'iklim', 'nüfus', 'bölge'];
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_GEOGRAPHY_PROFILE_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'COĞRAFYA PROFİLİ',
    params,
    '1. Bölgenin coğrafi özelliklerini listele\n2. İklim, nüfus ve ekonomik verileri göster\n3. Görsel harita unsurları ekle'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      features: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            value: { type: 'STRING' },
            description: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as GeographyProfileAIResult;
  return {
    title: result.title || `${params.topic} - Coğrafya Profili`,
    content: {
      steps: (result.features || []).map((feature, i) => ({
        stepNumber: i + 1,
        label: feature.name,
        description: `${feature.value} - ${feature.description}`,
        isCheckpoint: i === 0,
        scaffoldHint: `${feature.name}: ${feature.value}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Coğrafi veri okuma', 'Bölge analizi', 'Çevre bilinci'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_GEOGRAPHY_PROFILE_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const features = [
    { name: 'Yüzölçümü', value: '783.562 km²', description: "Türkiye'nin toplam yüzölçümü." },
    { name: 'Nüfus', value: '85 milyon', description: "Türkiye'nin toplam nüfusu." },
    {
      name: 'İklim',
      value: 'Karasal, Akdeniz, Karadeniz',
      description: 'Çeşitli iklim tipleri görülür.',
    },
    {
      name: 'Coğrafi Bölgeler',
      value: '7 bölge',
      description: 'Marmara, Ege, Akdeniz, Karadeniz, İç Anadolu, Doğu Anadolu, Güneydoğu Anadolu.',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    social:
      'Coğrafya profili infografiği, disleksi desteğine ihtiyacı olan öğrenciler için bölgesel coğrafi özellikleri yapılandırılmış olarak anlamalarını sağlayan temel bir sosyal bilgiler aracıdır. İklim, nüfus, yüzölçümü ve ekonomik verilerin görsel olarak düzenlenmesi, soyut coğrafi kavramları somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve görsel düzenleme ile coğrafi verileri daha kolay karşılaştırır ve çevre bilinci geliştirirler.',
    math: 'Coğrafi verileri (nüfus yoğunluğu, alan hesaplama) işlemek, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi coğrafya ile bağdaştırır.',
    language:
      'Coğrafi terimleri öğrenmek, disleksi desteğine ihtiyacı olan öğrenciler için kelime dağarcığını genişletir.',
    science:
      'Coğrafi özellikler doğal bilimlerle doğrudan ilişkilidir. Disleksi desteğine ihtiyacı olan öğrenciler için iklim ve jeoloji kavramlarını anlamada yardımcı olur.',
    general:
      'Coğrafya profili infografiği, disleksi desteğine ihtiyacı olan öğrenciler için coğrafi okuryazarlık geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Coğrafya Profili`,
    content: {
      steps: features.map((feature, i) => ({
        stepNumber: i + 1,
        label: feature.name,
        description: `${feature.value} - ${feature.description}`,
        isCheckpoint: i === 0,
        scaffoldHint: `${feature.name}: ${feature.value}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Coğrafi veri okuma', 'Bölge analizi', 'Çevre bilinci'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_GEOGRAPHY_PROFILE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_GEOGRAPHY_PROFILE,
  aiGenerator: generateInfographic_GEOGRAPHY_PROFILE_AI,
  offlineGenerator: generateInfographic_GEOGRAPHY_PROFILE_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'region',
        type: 'string',
        label: 'Bölge',
        defaultValue: 'Türkiye',
        description: 'Hangi bölgenin coğrafya profili gösterilsin?',
      },
      {
        name: 'showData',
        type: 'boolean',
        label: 'Verileri Göster',
        defaultValue: true,
        description: 'Sayısal coğrafi veriler gösterilsin mi?',
      },
    ],
  },
};
