import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type FractionVisualAIResult = {
  title: string;
  fractions: { numerator: number; denominator: number; visual: string; description: string }[];
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

export async function generateInfographic_FractionVisual_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'KESİR GÖRSELLEŞTİRME',
    params,
    '1. Konuya uygun 3-5 kesir belirle\n2. Her kesir için görsel betimleme ve açıklama yaz\n3. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      fractions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            numerator: { type: 'NUMBER' },
            denominator: { type: 'NUMBER' },
            visual: { type: 'STRING' },
            description: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as FractionVisualAIResult;
  return {
    title: result.title || `${params.topic} - Kesir Görselleştirme`,
    content: {
      steps: (result.fractions || []).map((f, i) => ({
        stepNumber: i + 1,
        label: `${f.numerator}/${f.denominator}`,
        description: `${f.description} — Görsel: ${f.visual}`,
        isCheckpoint: false,
        scaffoldHint: `Pay: ${f.numerator}, Payda: ${f.denominator}`,
      })),
    },
    layoutHints: {
      orientation: 'grid',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kesir kavramı', 'Görsel matematik'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_FractionVisual_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  return {
    title: `${params.topic} - Kesir Görselleştirme`,
    content: {
      steps: [
        {
          stepNumber: 1,
          label: '1/2 (Yarım)',
          description: 'Bir bütün iki eşit parçaya bölünür, bir parça alınır.',
          isCheckpoint: false,
          scaffoldHint: 'Pasta modeli: Yarısı boyalı, yarısı boş.',
        },
        {
          stepNumber: 2,
          label: '1/4 (Çeyrek)',
          description: 'Bir bütün dört eşit parçaya bölünür, bir parça alınır.',
          isCheckpoint: false,
          scaffoldHint: 'Pasta modeli: Dört dilimden biri boyalı.',
        },
        {
          stepNumber: 3,
          label: '3/4 (Üç çeyrek)',
          description: 'Bir bütün dört eşit parçaya bölünür, üç parça alınır.',
          isCheckpoint: true,
          scaffoldHint: 'Pasta modeli: Dört dilimden üçü boyalı.',
        },
      ],
    },
    layoutHints: {
      orientation: 'grid',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kesir kavramı', 'Görsel matematik'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_FRACTION_VISUAL: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_FRACTION_VISUAL,
  aiGenerator: generateInfographic_FractionVisual_AI,
  offlineGenerator: generateInfographic_FractionVisual_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'fractionCount',
        type: 'number',
        label: 'Kesir Sayısı',
        defaultValue: 3,
        description: 'Kaç kesir gösterilsin?',
      },
      {
        name: 'modelType',
        type: 'enum',
        label: 'Model Türü',
        defaultValue: 'pasta',
        options: ['pasta', 'dikdortgen', 'çubuk'],
        description: 'Hangi görsel model kullanılsın?',
      },
    ],
  },
};
