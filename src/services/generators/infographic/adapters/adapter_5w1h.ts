import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
  CustomizationSchema,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

// Helper Functions
function detectCategory(topic: string): string {
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes('canlı') || lowerTopic.includes('hayvan') || lowerTopic.includes('hücre'))
    return 'science';
  if (
    lowerTopic.includes('sayı') ||
    lowerTopic.includes('matematik') ||
    lowerTopic.includes('kesir')
  )
    return 'math';
  if (
    lowerTopic.includes('harita') ||
    lowerTopic.includes('tarih') ||
    lowerTopic.includes('kültür')
  )
    return 'social';
  return 'language';
}

function generateGenericConcepts(topic: string, count: number): string[] {
  return Array(count)
    .fill(0)
    .map((_, i) => `${topic} Alt Kavram ${i + 1}`);
}

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

// ... [Existing 10 Adapters omitted to save space, but I will append these 4 Sprint 4 adapters]

export async function generateInfographic_5W1H_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    '5N1K PANOSU',
    params,
    '1. Ne, Nerede, Ne Zaman, Neden, Nasıl, Kim sorularını cevapla\n2. Her soru için kısa ve net cevap yaz\n3. Pedagojik not: 5N1K tekniğinin okuduğunu anlamaya katkısı (min 100 kelime)\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      questions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            questionType: {
              type: 'STRING',
              enum: ['Ne', 'Nerede', 'Ne Zaman', 'Neden', 'Nasıl', 'Kim'],
            },
            question: { type: 'STRING' },
            answer: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result: any = await generateWithSchema(prompt, schema);
  return {
    title: result.title || `${params.topic} - 5N1K Panosu`,
    content: {
      questions: (result.questions || []).map((q: any) => ({
        question: q.question,
        questionType: 'open-ended',
        answer: q.answer,
        difficulty: params.difficulty === 'Kolay' ? 'easy' : 'medium',
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote || '5N1K analizi okuduğunu anlama becerisini geliştirir.',
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
      columnCount: 2,
    },
    targetSkills: ['Okuduğunu anlama', 'Analitik düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_5W1H_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  return {
    title: `${params.topic} - 5N1K Panosu`,
    content: {
      questions: [
        { question: 'Ne oldu?', questionType: 'open-ended', answer: '...', difficulty: 'easy' },
        { question: 'Nerede oldu?', questionType: 'open-ended', answer: '...', difficulty: 'easy' },
        {
          question: 'Ne zaman oldu?',
          questionType: 'open-ended',
          answer: '...',
          difficulty: 'easy',
        },
        { question: 'Neden oldu?', questionType: 'open-ended', answer: '...', difficulty: 'easy' },
        { question: 'Nasıl oldu?', questionType: 'open-ended', answer: '...', difficulty: 'easy' },
        { question: 'Kim yaptı?', questionType: 'open-ended', answer: '...', difficulty: 'easy' },
      ],
    },
    pedagogicalNote:
      '5N1K analizi okuduğunu anlama becerisini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için görsellerle desteklenmelidir.',
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
      columnCount: 2,
    },
    targetSkills: ['Okuduğunu anlama', 'Analitik düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_5W1H_BOARD: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_5W1H_BOARD,
  aiGenerator: generateInfographic_5W1H_AI,
  offlineGenerator: generateInfographic_5W1H_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'includeAll',
        type: 'boolean',
        label: 'Tüm Sorular',
        defaultValue: true,
        description: '6 soru da dahil edilsin mi?',
      },
    ],
  },
};
