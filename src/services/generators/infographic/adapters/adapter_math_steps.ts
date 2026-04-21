import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type MathStepsAIResult = {
  title: string;
  problem: string;
  steps: { step: string; description: string; result: string }[];
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

export async function generateInfographic_MathSteps_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'MATEMATİK ADIMLARI',
    params,
    '1. Konuya uygun bir matematik problemi belirle\n2. Problemi 4-6 adımda çöz\n3. Her adım için açıklama ve sonuç yaz\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      problem: { type: 'STRING' },
      steps: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            step: { type: 'STRING' },
            description: { type: 'STRING' },
            result: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as MathStepsAIResult;
  return {
    title: result.title || `${params.topic} - Matematik Adımları`,
    content: {
      steps: (result.steps || []).map((s, i) => ({
        stepNumber: i + 1,
        label: `Adım ${i + 1}: ${s.step}`,
        description: s.description,
        isCheckpoint: false,
        scaffoldHint: `Sonuç: ${s.result}`,
      })),
    },
    layoutHints: {
      orientation: 'vertical',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Problem çözme', 'Adımlı düşünme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_MathSteps_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  return {
    title: `${params.topic} - Matematik Adımları`,
    content: {
      steps: [
        {
          stepNumber: 1,
          label: 'Adım 1: Problemi Anla',
          description: 'Verilenleri ve isteneni belirle. Soruyu dikkatlice oku.',
          isCheckpoint: true,
          scaffoldHint: 'Ne sorulduğunu anlamak en önemli adımdır.',
        },
        {
          stepNumber: 2,
          label: 'Adım 2: Plan Yap',
          description: 'Hangi işlemi kullanacağına karar ver: toplama, çıkarma, çarpma veya bölme.',
          isCheckpoint: false,
          scaffoldHint: 'İşlem işaretini doğru seçmek sonucu etkiler.',
        },
        {
          stepNumber: 3,
          label: 'Adım 3: İşlemi Yap',
          description: 'Karar verdiğin işlemi uygula. Adım adım ilerle.',
          isCheckpoint: false,
          scaffoldHint: 'Her adımı kontrol ederek ilerle.',
        },
        {
          stepNumber: 4,
          label: 'Adım 4: Sonucu Kontrol Et',
          description: 'Bulduğun sonucun mantıklı olup olmadığını kontrol et.',
          isCheckpoint: true,
          scaffoldHint: 'Sonucu ters işlemle doğrula.',
        },
      ],
    },
    layoutHints: {
      orientation: 'vertical',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Problem çözme', 'Adımlı düşünme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_MATH_STEPS: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_MATH_STEPS,
  aiGenerator: generateInfographic_MathSteps_AI,
  offlineGenerator: generateInfographic_MathSteps_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'stepCount',
        type: 'number',
        label: 'Adım Sayısı',
        defaultValue: 4,
        description: 'Kaç adımda çözülsün?',
      },
      {
        name: 'showHints',
        type: 'boolean',
        label: 'İpuçları Göster',
        defaultValue: true,
        description: 'Her adım için ipucu gösterilsin mi?',
      },
    ],
  },
};
