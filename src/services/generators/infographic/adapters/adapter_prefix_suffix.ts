import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type PrefixSuffixAIResult = {
  title: string;
  suffixes: { suffix: string; type: string; example: string; meaning: string }[];
};

function detectCategory(topic: string): 'science' | 'math' | 'language' | 'social' | 'general' {
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes('fen') || lowerTopic.includes('bilim') || lowerTopic.includes('doğa'))
    return 'science';
  if (lowerTopic.includes('sayı') || lowerTopic.includes('matematik')) return 'math';
  if (lowerTopic.includes('hikaye') || lowerTopic.includes('şiir') || lowerTopic.includes('dil'))
    return 'language';
  if (lowerTopic.includes('tarih') || lowerTopic.includes('coğrafya')) return 'social';
  return 'general';
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

export async function generateInfographic_PrefixSuffix_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'EK BİLGİSİ',
    params,
    '1. Konuya uygun 4-6 ek belirle\n2. Her ekin türünü, anlamını ve örnek kelimesini yaz\n3. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      suffixes: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            suffix: { type: 'STRING' },
            type: { type: 'STRING' },
            example: { type: 'STRING' },
            meaning: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as PrefixSuffixAIResult;
  return {
    title: result.title || `${params.topic} - Ek Bilgisi`,
    content: {
      vocabulary: (result.suffixes || []).map((s) => ({
        word: s.suffix,
        syllables: [s.suffix],
        meaning: `${s.type} — ${s.meaning}`,
        exampleSentence: `Örnek: ${s.example}`,
      })),
    },
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Ek bilgisi', 'Kelime türetme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_PrefixSuffix_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const suffixesMap: Record<
    string,
    { suffix: string; type: string; example: string; meaning: string }[]
  > = {
    science: [
      {
        suffix: '-bilim',
        type: 'yapım eki',
        example: 'doğabilim',
        meaning: 'Bilim alanı belirten ek',
      },
      { suffix: '-lı', type: 'yapım eki', example: 'sulu', meaning: 'Sahip olma anlamı' },
      { suffix: '-sız', type: 'yapım eki', example: 'susuz', meaning: 'Yoksunluk anlamı' },
      { suffix: '-mek', type: 'fiil eki', example: 'büyümek', meaning: 'Eylem oluşturma eki' },
      { suffix: '-sel', type: 'yapım eki', example: 'döngüsel', meaning: 'İlişki belirten ek' },
    ],
    math: [
      { suffix: '-sal', type: 'yapım eki', example: 'sayısal', meaning: 'İlişki belirten ek' },
      { suffix: '-ım', type: 'yapım eki', example: 'ölçüm', meaning: 'İsim yapan ek' },
      { suffix: '-mek', type: 'fiil eki', example: 'bölme', meaning: 'Eylem eki' },
      { suffix: '-ce', type: 'yapım eki', example: 'eşitçe', meaning: 'Durum belirten ek' },
      { suffix: '-li', type: 'yapım eki', example: 'işlemli', meaning: 'Sahip olma anlamı' },
    ],
    language: [
      {
        suffix: '-lık',
        type: 'yapım eki',
        example: 'kitaplık',
        meaning: 'Yer veya alet belirten ek',
      },
      { suffix: '-cı', type: 'yapım eki', example: 'yazıcı', meaning: 'Meslek yapan ek' },
      { suffix: '-lı', type: 'yapım eki', example: 'bilgili', meaning: 'Sahip olma anlamı' },
      { suffix: '-sız', type: 'yapım eki', example: 'hecesiz', meaning: 'Yoksunluk anlamı' },
      { suffix: '-mek', type: 'fiil eki', example: 'okumak', meaning: 'Fiil yapım eki' },
    ],
    social: [
      { suffix: '-lık', type: 'yapım eki', example: 'yurttaşlık', meaning: 'Durum belirten ek' },
      { suffix: '-daş', type: 'yapım eki', example: 'yurttaş', meaning: 'Ortaklık belirten ek' },
      { suffix: '-sever', type: 'yapım eki', example: 'yurtsever', meaning: 'Seven, bağlı olan' },
      { suffix: '-lı', type: 'yapım eki', example: 'toplumsal', meaning: 'İlişki belirten ek' },
      { suffix: '-sal', type: 'yapım eki', example: 'kültürel', meaning: 'İlişki belirten ek' },
    ],
    general: [
      {
        suffix: '-lık',
        type: 'yapım eki',
        example: 'kitaplık',
        meaning: 'Yer veya alet belirten ek',
      },
      { suffix: '-cı', type: 'yapım eki', example: 'yazıcı', meaning: 'Meslek yapan ek' },
      { suffix: '-lı', type: 'yapım eki', example: 'bilgili', meaning: 'Sahip olma anlamı' },
      { suffix: '-sız', type: 'yapım eki', example: 'hecesiz', meaning: 'Yoksunluk anlamı' },
      { suffix: '-mek', type: 'fiil eki', example: 'okumak', meaning: 'Fiil yapım eki' },
    ],
  };
  const suffixes = suffixesMap[category] || suffixesMap.general;
  return {
    title: `${params.topic} - Ek Bilgisi`,
    content: {
      vocabulary: suffixes.map((s) => ({
        word: s.suffix,
        syllables: [s.suffix],
        meaning: `${s.type} — ${s.meaning}`,
        exampleSentence: `Örnek: ${s.example}`,
      })),
    },
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Ek bilgisi', 'Kelime türetme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_PREFIX_SUFFIX: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_PREFIX_SUFFIX,
  aiGenerator: generateInfographic_PrefixSuffix_AI,
  offlineGenerator: generateInfographic_PrefixSuffix_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'suffixCount',
        type: 'number',
        label: 'Ek Sayısı',
        defaultValue: 5,
        description: 'Kaç ek gösterilsin?',
      },
      {
        name: 'highlightSuffix',
        type: 'boolean',
        label: 'Ek Vurgulama',
        defaultValue: true,
        description: 'Ekler renkle vurgulansın mı?',
      },
    ],
  },
};
