import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type StatesMatterAIResult = {
  title: string;
  states: { name: string; properties: string[]; examples: string[]; transition: string }[];
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

export async function generateInfographic_STATES_MATTER_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'MADDENİN HALLERİ',
    params,
    '1. Maddenin hallerini listele (katı, sıvı, gaz)\n2. Her halin özelliklerini ve örneklerini göster\n3. Hal değişimlerini açıkla'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      states: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            properties: { type: 'ARRAY', items: { type: 'STRING' } },
            examples: { type: 'ARRAY', items: { type: 'STRING' } },
            transition: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as StatesMatterAIResult;
  return {
    title: result.title || `${params.topic} - Maddenin Halleri`,
    content: {
      scienceData: {
        topic: params.topic,
        components: (result.states || []).map((s: unknown) => s.name),
        properties: Object.fromEntries(
          (result.states || []).map((s: unknown) => [s.name, s.properties.join(', ')])
        ),
      },
      steps: (result.states || []).map((state, i) => ({
        stepNumber: i + 1,
        label: state.name,
        description: state.properties.join('. '),
        isCheckpoint: i === 0,
        scaffoldHint: `Örnekler: ${state.examples.join(', ')}. Geçiş: ${state.transition}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Madde hallerini tanıma',
      'Hal değişimlerini anlama',
      'Günlük yaşamla ilişkilendirme',
    ],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_STATES_MATTER_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const states = [
    {
      name: 'Katı',
      properties: ['Belirli şekli var', 'Belirli hacmi var', 'Sıkıştırılamaz'],
      examples: ['Buz', 'Taş', 'Demir'],
      transition: 'Erime → Sıvı',
    },
    {
      name: 'Sıvı',
      properties: ['Bulunduğu kabın şeklini alır', 'Belirli hacmi var', 'Akışkandır'],
      examples: ['Su', 'Süt', 'Zeytinyağı'],
      transition: 'Donma → Katı / Buharlaşma → Gaz',
    },
    {
      name: 'Gaz',
      properties: ['Belirli şekli yok', 'Belirli hacmi yok', 'Sıkıştırılabilir'],
      examples: ['Hava', 'Su buharı', 'Oksijen'],
      transition: 'Yoğuşma → Sıvı',
    },
  ];

  return {
    title: `${params.topic} - Maddenin Halleri`,
    content: {
      scienceData: {
        topic: params.topic,
        components: states.map((s: unknown) => s.name),
        properties: Object.fromEntries(
          states.map((s: unknown) => [s.name, s.properties.join(', ')])
        ),
      },
      steps: states.map((state, i) => ({
        stepNumber: i + 1,
        label: state.name,
        description: state.properties.join('. '),
        isCheckpoint: i === 0,
        scaffoldHint: `Örnekler: ${state.examples.join(', ')}. Geçiş: ${state.transition}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Madde hallerini tanıma',
      'Hal değişimlerini anlama',
      'Günlük yaşamla ilişkilendirme',
    ],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_STATES_MATTER: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_STATES_MATTER,
  aiGenerator: generateInfographic_STATES_MATTER_AI,
  offlineGenerator: generateInfographic_STATES_MATTER_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'showTransitions',
        type: 'boolean',
        label: 'Hal Değişimlerini Göster',
        defaultValue: true,
        description: 'Hal değişim okları gösterilsin mi?',
      },
      {
        name: 'plasmaState',
        type: 'boolean',
        label: 'Plazma Halini Ekle',
        defaultValue: false,
        description: 'Plazma hali de gösterilsin mi?',
      },
    ],
  },
};
