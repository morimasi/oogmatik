import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type RolePlayScenarioAIResult = {
  title: string;
  characters: { name: string; role: string; traits: string[] }[];
  scenes: { scene: string; dialogue: string; outcome: string }[];
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
  const socialTerms = 'toplum,arkadaşlık,aile,okul,sınıf'.split(',');
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_ROLE_PLAY_SCENARIO_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ROL YAPMA SENARYOSU',
    params,
    '1. Senaryo karakterlerini ve rollerini belirle\n2. Sahne diyaloglarını oluştur\n3. Her sahnenin sonucunu belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      characters: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            role: { type: 'STRING' },
            traits: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      scenes: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            scene: { type: 'STRING' },
            dialogue: { type: 'STRING' },
            outcome: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as RolePlayScenarioAIResult;
  return {
    title: result.title || `${params.topic} - Rol Yapma Senaryosu`,
    content: {
      steps: (result.scenes || []).map((scene, i) => ({
        stepNumber: i + 1,
        label: `Sahne ${i + 1}: ${scene.scene}`,
        description: scene.dialogue,
        isCheckpoint: i === 0,
        scaffoldHint: `Sonuç: ${scene.outcome}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Empati kurma', 'Sosyal iletişim', 'Perspektif alma'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_ROLE_PLAY_SCENARIO_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const scenes = [
    {
      scene: 'Tanışma',
      dialogue: 'Merhaba, ben Ayşe. Senin adın ne? — Ben Ali. Tanıştığımıza memnun oldum.',
      outcome: 'İki çocuk birbirini tanır.',
    },
    {
      scene: 'Problem',
      dialogue: 'Topu birlikte kullanabilir miyiz? — Evet, sıra ile oynayalım.',
      outcome: 'İşbirliği kararı alınır.',
    },
    {
      scene: 'Çözüm',
      dialogue: 'Harika oynadık! Birlikte daha eğlenceli. — Evet, arkadaş olmak güzel.',
      outcome: 'Arkadaşlık kurulur.',
    },
  ];

  return {
    title: `${params.topic} - Rol Yapma Senaryosu`,
    content: {
      steps: scenes.map((scene, i) => ({
        stepNumber: i + 1,
        label: `Sahne ${i + 1}: ${scene.scene}`,
        description: scene.dialogue,
        isCheckpoint: i === 0,
        scaffoldHint: `Sonuç: ${scene.outcome}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Empati kurma', 'Sosyal iletişim', 'Perspektif alma'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_ROLE_PLAY_SCENARIO: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_ROLE_PLAY_SCENARIO,
  aiGenerator: generateInfographic_ROLE_PLAY_SCENARIO_AI,
  offlineGenerator: generateInfographic_ROLE_PLAY_SCENARIO_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'scenarioTheme',
        type: 'string',
        label: 'Senaryo Teması',
        defaultValue: 'Arkadaşlık Kurma',
        description: 'Senaryonun teması ne olsun?',
      },
      {
        name: 'sceneCount',
        type: 'number',
        label: 'Sahne Sayısı',
        defaultValue: 3,
        description: 'Kaç sahne oluşturulsun?',
      },
    ],
  },
};
