import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type SolarSystemAIResult = {
  title: string;
  planets: { name: string; order: number; size: string; distance: string; fact: string }[];
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

function detectCategory(_topic: string): 'science' | 'math' | 'language' | 'social' | 'general' {
  return 'science' as const;
}

export async function generateInfographic_SOLAR_SYSTEM_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'GÜNEŞ SİSTEMİ',
    params,
    '1. Güneş sistemindeki gezegenleri sırala\n2. Her gezegenin özelliklerini belirt\n3. İlginç bilgiler ekle'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      planets: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            order: { type: 'NUMBER' },
            size: { type: 'STRING' },
            distance: { type: 'STRING' },
            fact: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as SolarSystemAIResult;
  return {
    title: result.title || `${params.topic} - Güneş Sistemi`,
    content: {
      scienceData: {
        topic: params.topic,
        components: (result.planets || []).map((p) => p.name),
        properties: Object.fromEntries((result.planets || []).map((p) => [p.name, p.fact])),
      },
      steps: (result.planets || []).map((planet, i) => ({
        stepNumber: i + 1,
        label: `${planet.order}. Gezegen: ${planet.name}`,
        description: `Boyut: ${planet.size}. Güneşe uzaklık: ${planet.distance}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Bilgi: ${planet.fact}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Gezegen tanıma', 'Sıralı düşünme', 'Uzay kavramları'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SOLAR_SYSTEM_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const planets = [
    {
      name: 'Merkür',
      order: 1,
      size: 'En küçük',
      distance: '58 milyon km',
      fact: "Güneş'e en yakın gezegen.",
    },
    {
      name: 'Venüs',
      order: 2,
      size: 'Dünya boyutunda',
      distance: '108 milyon km',
      fact: 'En sıcak gezegendir.',
    },
    {
      name: 'Dünya',
      order: 3,
      size: 'Orta',
      distance: '150 milyon km',
      fact: 'Yaşam barındıran tek gezegen.',
    },
    {
      name: 'Mars',
      order: 4,
      size: "Dünya'dan küçük",
      distance: '228 milyon km',
      fact: 'Kızıl gezegen olarak bilinir.',
    },
    {
      name: 'Jüpiter',
      order: 5,
      size: 'En büyük',
      distance: '778 milyon km',
      fact: 'Güneş sisteminin en büyük gezegeni.',
    },
  ];

  return {
    title: `${params.topic} - Güneş Sistemi`,
    content: {
      scienceData: {
        topic: params.topic,
        components: planets.map((p) => p.name),
        properties: Object.fromEntries(planets.map((p) => [p.name, p.fact])),
      },
      steps: planets.map((planet, i) => ({
        stepNumber: i + 1,
        label: `${planet.order}. Gezegen: ${planet.name}`,
        description: `Boyut: ${planet.size}. Güneşe uzaklık: ${planet.distance}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Bilgi: ${planet.fact}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Gezegen tanıma', 'Sıralı düşünme', 'Uzay kavramları'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SOLAR_SYSTEM: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SOLAR_SYSTEM,
  aiGenerator: generateInfographic_SOLAR_SYSTEM_AI,
  offlineGenerator: generateInfographic_SOLAR_SYSTEM_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'showDistances',
        type: 'boolean',
        label: 'Mesafeleri Göster',
        defaultValue: true,
        description: 'Güneşe olan mesafeler gösterilsin mi?',
      },
      {
        name: 'includeDwarf',
        type: 'boolean',
        label: 'Cüce Gezegenleri Ekle',
        defaultValue: false,
        description: 'Plüton gibi cüce gezegenler de gösterilsin mi?',
      },
    ],
  },
};
