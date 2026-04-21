import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

function buildAIPrompt(
  activityName: string,
  params: UltraCustomizationParams,
  rules: string
): string {
  return `Sen ${params.ageGroup} yaş grubu, ${params.difficulty} zorluk seviyesinde, ${params.profile} profili için ${activityName} infografiği oluşturan bir pedagoji uzmanısın.\nKONU: ${params.topic}\nÖZEL PARAMETRELER: ${JSON.stringify(params.activityParams, null, 2)}\nKURALLAR:\n${rules}\nJSON ÇIKTI:`;
}

export async function generateInfographic_SummaryPyramid_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ÖZET PİRAMİDİ',
    params,
    '1. Ana fikir en üstte, destekleyici noktalar ortada, detaylar altta\n2. Her seviye için 2-3 madde yaz\n3. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      mainIdea: { type: 'string' as const },
      supportingPoints: { type: 'array' as const, items: { type: 'string' as const } },
      details: { type: 'array' as const, items: { type: 'string' as const } },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as {
    title: string;
    mainIdea: string;
    supportingPoints: string[];
    details: string[];
  };
  return {
    title: result.title || `${params.topic} - Özet Piramidi`,
    content: {
      hierarchy: {
        label: result.mainIdea,
        children: (result.supportingPoints || []).map((p) => ({
          label: p,
          children: (result.details || []).slice(0, 2).map((d) => ({ label: d })),
        })),
      },
    },
    layoutHints: { orientation: 'vertical', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Özetleme', 'Ana fikir belirleme', 'Hiyerarşik düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SummaryPyramid_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  return {
    title: `${params.topic} - Özet Piramidi`,
    content: {
      hierarchy: {
        label: `${params.topic} - Ana Fikir`,
        children: [
          {
            label: 'Destekleyici Nokta 1',
            children: [{ label: 'Detay 1a' }, { label: 'Detay 1b' }],
          },
          {
            label: 'Destekleyici Nokta 2',
            children: [{ label: 'Detay 2a' }, { label: 'Detay 2b' }],
          },
          {
            label: 'Destekleyici Nokta 3',
            children: [{ label: 'Detay 3a' }, { label: 'Detay 3b' }],
          },
        ],
      },
    },
    layoutHints: { orientation: 'vertical', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Özetleme', 'Ana fikir belirleme', 'Hiyerarşik düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SUMMARY_PYRAMID: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SUMMARY_PYRAMID,
  aiGenerator: generateInfographic_SummaryPyramid_AI,
  offlineGenerator: generateInfographic_SummaryPyramid_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'levels',
        type: 'number',
        label: 'Piramit Seviyesi',
        defaultValue: 3,
        description: 'Piramit kaç seviyeli olsun?',
      },
      {
        name: 'itemsPerLevel',
        type: 'number',
        label: 'Seviye Başına Madde',
        defaultValue: 3,
        description: 'Her seviyede kaç madde olsun?',
      },
    ],
  },
};
