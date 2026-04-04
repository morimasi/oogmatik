import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type MeasurementGuideAIResult = {
  title: string;
  units: { name: string; symbol: string; conversion: string; examples: string[] }[];
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
  const scienceTerms = ['sıcaklık', 'basınç', 'hız', 'kütle'];
  const mathTerms = ['uzunluk', 'alan', 'hacim', 'metre', 'litre'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  if (mathTerms.some((term) => topic.toLowerCase().includes(term))) return 'math' as const;
  return 'general' as const;
}

export async function generateInfographic_MEASUREMENT_GUIDE_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ÖLÇÜ BİRİMLERİ',
    params,
    '1. Ölçü birimlerini kategorize et\n2. Her birimin sembolü ve dönüşümünü göster\n3. Günlük yaşam örnekleri ekle\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için ölçü birimleri öğrenme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      units: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            symbol: { type: 'STRING' },
            conversion: { type: 'STRING' },
            examples: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as MeasurementGuideAIResult;
  return {
    title: result.title || `${params.topic} - Ölçü Birimleri`,
    content: {
      steps: (result.units || []).map((unit, i) => ({
        stepNumber: i + 1,
        label: `${unit.name} (${unit.symbol})`,
        description: `${unit.conversion}. Örnekler: ${unit.examples.join(', ')}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Sembol: ${unit.symbol}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Ölçü birimleri rehberi, disleksi desteğine ihtiyacı olan öğrenciler için günlük yaşamda karşılaştıkları ölçüm kavramlarını somutlaştırarak anlamayı kolaylaştırır. Her birimin sembolü, dönüşüm oranı ve somut örnekleri ile birlikte sunulması, soyut ölçü kavramlarını somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, görsel düzenleme ve renk kodlaması ile birimler arası ilişkileri daha kolay kavrarlar. Bu yapı, aynı zamanda pratik yaşam becerilerini de destekler.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Ölçü birimi tanıma', 'Dönüşüm yapma', 'Pratik ölçme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_MEASUREMENT_GUIDE_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const units = [
    { name: 'Metre', symbol: 'm', conversion: '1 m = 100 cm', examples: ['Oda boyu', 'Bahçe'] },
    { name: 'Litre', symbol: 'L', conversion: '1 L = 1000 mL', examples: ['Su şişesi', 'Süt'] },
    { name: 'Kilogram', symbol: 'kg', conversion: '1 kg = 1000 g', examples: ['Un', 'Şeker'] },
    {
      name: 'Santimetre',
      symbol: 'cm',
      conversion: '1 cm = 10 mm',
      examples: ['Kalem boyu', 'Defter'],
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    math: 'Ölçü birimleri, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi günlük yaşama bağlayan önemli bir konudur. Her birimin sembolü ve dönüşümü görsel olarak sunulduğunda, soyut sayısal ilişkiler somutlaşır. Disleksi desteğine ihtiyacı olan öğrenciler, pratik örnekler ile ölçü birimlerini daha kolay öğrenirler.',
    science:
      'Bilimsel ölçümlerde birimler temel öneme sahiptir. Disleksi desteğine ihtiyacı olan öğrenciler için ölçü birimleri rehberi, deney sonuçlarını doğru yorumlamada yardımcı olur.',
    language:
      'Ölçü birimlerinin doğru kullanımı dil gelişimini destekler. Disleksi desteğine ihtiyacı olan öğrenciler için birim isimleri ve sembolleri ile kelime dağarcığı genişletilir.',
    social:
      'Günlük yaşamda ölçü birimleri alışveriş ve mutfakta sıkça kullanılır. Disleksi desteğine ihtiyacı olan öğrenciler için pratik örnekler ile birimler somutlaştırılır.',
    general:
      'Ölçü birimleri rehberi, disleksi desteğine ihtiyacı olan öğrenciler için temel matematik ve yaşam becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Ölçü Birimleri`,
    content: {
      steps: units.map((unit, i) => ({
        stepNumber: i + 1,
        label: `${unit.name} (${unit.symbol})`,
        description: `${unit.conversion}. Örnekler: ${unit.examples.join(', ')}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Sembol: ${unit.symbol}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Ölçü birimi tanıma', 'Dönüşüm yapma', 'Pratik ölçme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_MEASUREMENT_GUIDE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_MEASUREMENT_GUIDE,
  aiGenerator: generateInfographic_MEASUREMENT_GUIDE_AI,
  offlineGenerator: generateInfographic_MEASUREMENT_GUIDE_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'unitTypes',
        type: 'number',
        label: 'Birim Sayısı',
        defaultValue: 4,
        description: 'Kaç ölçü birimi gösterilsin?',
      },
      {
        name: 'showConversions',
        type: 'boolean',
        label: 'Dönüşümleri Göster',
        defaultValue: true,
        description: 'Birim dönüşümleri gösterilsin mi?',
      },
    ],
  },
};
