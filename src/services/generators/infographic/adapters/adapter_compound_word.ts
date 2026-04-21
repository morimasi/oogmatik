import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type CompoundWordAIResult = {
  title: string;
  compounds: { word: string; part1: string; part2: string; meaning: string }[];
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

export async function generateInfographic_CompoundWord_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'BİRLEŞİK KELİMELER',
    params,
    '1. Konuya uygun 5 birleşik kelime seç\n2. Her birleşik kelimenin iki parçasını ve anlamını yaz\n3. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      compounds: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING' },
            part1: { type: 'STRING' },
            part2: { type: 'STRING' },
            meaning: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as CompoundWordAIResult;
  return {
    title: result.title || `${params.topic} - Birleşik Kelimeler`,
    content: {
      vocabulary: (result.compounds || []).map((c) => ({
        word: c.word,
        syllables: [c.part1, c.part2],
        meaning: c.meaning,
        exampleSentence: `${c.part1} + ${c.part2} = ${c.word}`,
        rootWord: c.part1,
        relatedWords: [c.part2],
      })),
    },
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kelime yapısı', 'Birleşik kelime'],
    estimatedDuration: 12,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_CompoundWord_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const compoundsMap: Record<
    string,
    { word: string; part1: string; part2: string; meaning: string }[]
  > = {
    science: [
      { word: 'göktaşı', part1: 'gök', part2: 'taşı', meaning: 'Uzaydan dünyaya düşen taş' },
      { word: 'denizanası', part1: 'deniz', part2: 'anası', meaning: 'Denizde yaşayan canlı' },
      { word: 'yıldızbilim', part1: 'yıldız', part2: 'bilim', meaning: 'Astronomi bilimi' },
      { word: 'canlıbilim', part1: 'canlı', part2: 'bilim', meaning: 'Biyoloji bilimi' },
      {
        word: 'topraksolucanı',
        part1: 'toprak',
        part2: 'solucanı',
        meaning: 'Toprakta yaşayan solucan',
      },
    ],
    math: [
      {
        word: 'sayıdoğrusu',
        part1: 'sayı',
        part2: 'doğrusu',
        meaning: 'Sayıların gösterildiği doğru',
      },
      { word: 'işlemsırası', part1: 'işlem', part2: 'sırası', meaning: 'İşlem yapma düzeni' },
      { word: 'kesirçubuğu', part1: 'kesir', part2: 'çubuğu', meaning: 'Kesirleri gösteren araç' },
      {
        word: 'geometritahtası',
        part1: 'geometri',
        part2: 'tahtası',
        meaning: 'Geometri çalışma tahtası',
      },
      { word: 'ölçübirimi', part1: 'ölçü', part2: 'birimi', meaning: 'Standart ölçü değeri' },
    ],
    language: [
      { word: 'bilgisayar', part1: 'bilgi', part2: 'sayar', meaning: 'Bilgi işleyen cihaz' },
      { word: 'gökdelen', part1: 'gök', part2: 'delen', meaning: 'Çok yüksek bina' },
      { word: 'demiryolu', part1: 'demir', part2: 'yolu', meaning: 'Tren yolu' },
      { word: 'içgüdü', part1: 'iç', part2: 'güdü', meaning: 'Doğdüsel tepki' },
      { word: 'başparmak', part1: 'baş', part2: 'parmak', meaning: 'Elin en kalın parmağı' },
    ],
    social: [
      { word: 'ülke yönetimi', part1: 'ülke', part2: 'yönetimi', meaning: 'Devlet idaresi' },
      { word: 'halkoyu', part1: 'halk', part2: 'oyu', meaning: 'Halkın kararı' },
      { word: 'bayramlaşma', part1: 'bayram', part2: 'laşma', meaning: 'Bayram kutlaması' },
      { word: 'yurtseverlik', part1: 'yurtsever', part2: 'lik', meaning: 'Vatanseverlik duygusu' },
      { word: 'kardeşlik', part1: 'kardeş', part2: 'lik', meaning: 'Kardeş olma bağı' },
    ],
    general: [
      { word: 'bilgisayar', part1: 'bilgi', part2: 'sayar', meaning: 'Bilgi işleyen cihaz' },
      { word: 'gökdelen', part1: 'gök', part2: 'delen', meaning: 'Çok yüksek bina' },
      { word: 'demiryolu', part1: 'demir', part2: 'yolu', meaning: 'Tren yolu' },
      { word: 'içgüdü', part1: 'iç', part2: 'güdü', meaning: 'Doğdüsel tepki' },
      { word: 'başparmak', part1: 'baş', part2: 'parmak', meaning: 'Elin en kalın parmağı' },
    ],
  };
  const compounds = compoundsMap[category] || compoundsMap.general;
  return {
    title: `${params.topic} - Birleşik Kelimeler`,
    content: {
      vocabulary: compounds.map((c) => ({
        word: c.word,
        syllables: [c.part1, c.part2],
        meaning: c.meaning,
        exampleSentence: `${c.part1} + ${c.part2} = ${c.word}`,
        rootWord: c.part1,
        relatedWords: [c.part2],
      })),
    },
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kelime yapısı', 'Birleşik kelime'],
    estimatedDuration: 12,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_COMPOUND_WORD: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_COMPOUND_WORD,
  aiGenerator: generateInfographic_CompoundWord_AI,
  offlineGenerator: generateInfographic_CompoundWord_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'compoundCount',
        type: 'number',
        label: 'Birleşik Kelime Sayısı',
        defaultValue: 5,
        description: 'Kaç birleşik kelime gösterilsin?',
      },
      {
        name: 'showParts',
        type: 'boolean',
        label: 'Parçaları Göster',
        defaultValue: true,
        description: 'Kelimenin iki parçası ayrı ayrı gösterilsin mi?',
      },
    ],
  },
};
