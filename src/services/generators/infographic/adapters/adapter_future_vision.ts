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

export async function generateInfographic_FutureVision_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'GELECEK VİZYONU',
    params,
    '1. Geleceğe yönelik senaryolar oluştur\n2. Her senaryo için olasılık ve etki analizi yap\n3. Pedagojik not: Gelecek vizyonunun yaratıcı düşünmeye katkısı (min 100 kelime)\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      scenarios: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            name: { type: 'string' as const },
            description: { type: 'string' as const },
            probability: { type: 'string' as const },
          },
        },
      },
      pedagogicalNote: { type: 'string' as const },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as {
    title: string;
    scenarios: Array<{ name: string; description: string; probability: string }>;
    pedagogicalNote: string;
  };
  return {
    title: result.title || `${params.topic} - Gelecek Vizyonu`,
    content: {
      questions: (result.scenarios || []).map((s) => ({
        question: `Senaryo: ${s.name} (${s.probability})`,
        questionType: 'open-ended' as const,
        answer: s.description,
        difficulty: 'medium' as const,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Gelecek vizyonu, öğrencinin yaratıcı düşünme ve olasılık analizi becerilerini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için görsel senaryo kartları kullanılmalıdır.',
    layoutHints: { orientation: 'horizontal', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Yaratıcı düşünme', 'Olasılık analizi', 'Gelecek planlama'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_FutureVision_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  return {
    title: `${params.topic} - Gelecek Vizyonu`,
    content: {
      questions: [
        {
          question: 'Senaryo 1: İyimser Gelecek (Yüksek olasılık)',
          questionType: 'open-ended' as const,
          answer: '...',
          difficulty: 'easy' as const,
        },
        {
          question: 'Senaryo 2: Gerçekçi Gelecek (Orta olasılık)',
          questionType: 'open-ended' as const,
          answer: '...',
          difficulty: 'medium' as const,
        },
        {
          question: 'Senaryo 3: Hayalî Gelecek (Düşük olasılık)',
          questionType: 'open-ended' as const,
          answer: '...',
          difficulty: 'hard' as const,
        },
      ],
    },
    pedagogicalNote:
      'Gelecek vizyonu, öğrencinin yaratıcı düşünme ve olasılık analizi becerilerini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için görsel senaryo kartları ve renk kodlu olasılık göstergeleri kullanılmalıdır.',
    layoutHints: { orientation: 'horizontal', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Yaratıcı düşünme', 'Olasılık analizi', 'Gelecek planlama'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_FUTURE_VISION: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_FUTURE_VISION,
  aiGenerator: generateInfographic_FutureVision_AI,
  offlineGenerator: generateInfographic_FutureVision_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'scenarioCount',
        type: 'number',
        label: 'Senaryo Sayısı',
        defaultValue: 3,
        description: 'Kaç gelecek senaryosu oluşturulsun?',
      },
      {
        name: 'timeframe',
        type: 'enum',
        label: 'Zaman Çerçevesi',
        defaultValue: '10yil',
        options: ['5yil', '10yil', '20yil'],
        description: 'Gelecek vizyonu ne kadar ileriye bakmalı?',
      },
    ],
  },
};
