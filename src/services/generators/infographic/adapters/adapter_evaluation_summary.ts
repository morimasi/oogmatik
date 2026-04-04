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

export async function generateInfographic_EvaluationSummary_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DEĞERLENDİRME ÖZETİ',
    params,
    '1. Değerlendirme sonuçlarını özetle\n2. Güçlü ve gelişim alanlarını belirt\n3. Pedagojik not: Değerlendirme özeti bütünsel bakış sağlar (min 100 kelime)\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      strengths: { type: 'array' as const, items: { type: 'string' as const } },
      areasForGrowth: { type: 'array' as const, items: { type: 'string' as const } },
      recommendations: { type: 'array' as const, items: { type: 'string' as const } },
      pedagogicalNote: { type: 'string' as const },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as {
    title: string;
    strengths: string[];
    areasForGrowth: string[];
    recommendations: string[];
    pedagogicalNote: string;
  };
  return {
    title: result.title || `${params.topic} - Değerlendirme Özeti`,
    content: {
      hierarchy: {
        label: 'Değerlendirme Özeti',
        children: [
          { label: 'Güçlü Alanlar', children: (result.strengths || []).map((s) => ({ label: s })) },
          {
            label: 'Gelişim Alanları',
            children: (result.areasForGrowth || []).map((a) => ({ label: a })),
          },
          {
            label: 'Öneriler',
            children: (result.recommendations || []).map((r) => ({ label: r })),
          },
        ],
      },
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Değerlendirme özeti, öğrencinin mevcut seviyesini bütünsel olarak görmeyi sağlar. Disleksi desteğine ihtiyacı olan öğrenciler için görsel ilerleme göstergeleri kullanılmalıdır.',
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
      columnCount: 2,
    },
    targetSkills: ['Öz değerlendirme', 'İlerleme takibi'],
    estimatedDuration: 10,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_EvaluationSummary_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  return {
    title: `${params.topic} - Değerlendirme Özeti`,
    content: {
      hierarchy: {
        label: 'Değerlendirme Özeti',
        children: [
          {
            label: 'Güçlü Alanlar',
            children: [{ label: 'Güç 1' }, { label: 'Güç 2' }, { label: 'Güç 3' }],
          },
          { label: 'Gelişim Alanları', children: [{ label: 'Gelişim 1' }, { label: 'Gelişim 2' }] },
          {
            label: 'Öneriler',
            children: [{ label: 'Öneri 1' }, { label: 'Öneri 2' }, { label: 'Öneri 3' }],
          },
        ],
      },
    },
    pedagogicalNote:
      'Değerlendirme özeti, öğrencinin mevcut seviyesini bütünsel olarak görmeyi sağlar. Güçlü alanların vurgulanması özgüveni artırır. Disleksi desteğine ihtiyacı olan öğrenciler için görsel ilerleme göstergeleri ve renk kodlu alanlar kullanılmalıdır.',
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
      columnCount: 2,
    },
    targetSkills: ['Öz değerlendirme', 'İlerleme takibi'],
    estimatedDuration: 10,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_EVALUATION_SUMMARY: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_EVALUATION_SUMMARY,
  aiGenerator: generateInfographic_EvaluationSummary_AI,
  offlineGenerator: generateInfographic_EvaluationSummary_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'domainCount',
        type: 'number',
        label: 'Alan Sayısı',
        defaultValue: 4,
        description: 'Kaç değerlendirme alanı gösterilsin?',
      },
      {
        name: 'includeVisual',
        type: 'boolean',
        label: 'Görsel Gösterge',
        defaultValue: true,
        description: 'İlerleme göstergeleri görsel olsun mu?',
      },
    ],
  },
};
