import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type SyllableMapAIResult = {
  title: string;
  words: { word: string; syllables: string[] }[];
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

export async function generateInfographic_SyllableMap_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'HECE HARİTASI',
    params,
    '1. Konuya uygun 5-8 kelime seç\n2. Her kelimeyi hecelerine ayır\n3. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      words: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING' },
            syllables: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as SyllableMapAIResult;
  return {
    title: result.title || `${params.topic} - Hece Haritası`,
    content: {
      vocabulary: (result.words || []).map((w) => ({
        word: w.word,
        syllables: w.syllables,
        meaning: '',
        exampleSentence: '',
      })),
    },
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Hece bilinci', 'Okuma hazırlığı'],
    estimatedDuration: 10,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SyllableMap_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const wordsMap: Record<string, { word: string; syllables: string[] }[]> = {
    science: [
      { word: 'bitki', syllables: ['bit', 'ki'] },
      { word: 'hayvan', syllables: ['hay', 'van'] },
      { word: 'toprak', syllables: ['top', 'rak'] },
      { word: 'güneş', syllables: ['gü', 'neş'] },
      { word: 'yaprak', syllables: ['ya', 'prak'] },
    ],
    math: [
      { word: 'sayı', syllables: ['sa', 'yı'] },
      { word: 'toplama', syllables: ['top', 'la', 'ma'] },
      { word: 'çıkarma', syllables: ['çı', 'kar', 'ma'] },
      { word: 'bölme', syllables: ['böl', 'me'] },
      { word: 'çarpma', syllables: ['çar', 'pma'] },
    ],
    language: [
      { word: 'kelebek', syllables: ['ke', 'le', 'bek'] },
      { word: 'armut', syllables: ['ar', 'mut'] },
      { word: 'kitap', syllables: ['ki', 'tap'] },
      { word: 'okul', syllables: ['o', 'kul'] },
      { word: 'öğretmen', syllables: ['öğ', 'ret', 'men'] },
    ],
    social: [
      { word: 'aile', syllables: ['ai', 'le'] },
      { word: 'okul', syllables: ['o', 'kul'] },
      { word: 'şehir', syllables: ['şe', 'hir'] },
      { word: 'köy', syllables: ['köy'] },
      { word: 'ülke', syllables: ['ül', 'ke'] },
    ],
    general: [
      { word: 'kelebek', syllables: ['ke', 'le', 'bek'] },
      { word: 'armut', syllables: ['ar', 'mut'] },
      { word: 'kitap', syllables: ['ki', 'tap'] },
      { word: 'okul', syllables: ['o', 'kul'] },
      { word: 'öğretmen', syllables: ['öğ', 'ret', 'men'] },
    ],
  };
  const words = wordsMap[category] || wordsMap.general;
  return {
    title: `${params.topic} - Hece Haritası`,
    content: {
      vocabulary: words.map((w) => ({
        word: w.word,
        syllables: w.syllables,
        meaning: '',
        exampleSentence: '',
      })),
    },
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Hece bilinci', 'Okuma hazırlığı'],
    estimatedDuration: 10,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SYLLABLE_MAP: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SYLLABLE_MAP,
  aiGenerator: generateInfographic_SyllableMap_AI,
  offlineGenerator: generateInfographic_SyllableMap_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'wordCount',
        type: 'number',
        label: 'Kelime Sayısı',
        defaultValue: 5,
        description: 'Kaç kelime gösterilsin?',
      },
      {
        name: 'colorCodeSyllables',
        type: 'boolean',
        label: 'Hece Renklendirme',
        defaultValue: true,
        description: 'Her hece farklı renkte gösterilsin mi?',
      },
    ],
  },
};
