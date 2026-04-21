import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type WordOriginAIResult = {
  title: string;
  words: { word: string; origin: string; meaning: string; modernUse: string }[];
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

export async function generateInfographic_WordOrigin_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'KELİME KÖKENİ',
    params,
    '1. Konuya uygun 4 kelime seç\n2. Her kelimenin kökenini, orijinal anlamını ve günümüz kullanımını yaz\n3. Lexend font, disleksi uyumlu'
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
            origin: { type: 'STRING' },
            meaning: { type: 'STRING' },
            modernUse: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as WordOriginAIResult;
  return {
    title: result.title || `${params.topic} - Kelime Kökeni`,
    content: {
      vocabulary: (result.words || []).map((w) => ({
        word: w.word,
        syllables: [w.origin],
        meaning: w.meaning,
        exampleSentence: `Günümüz: ${w.modernUse}`,
        rootWord: w.origin,
      })),
    },
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Etimoloji', 'Kültürel farkındalık'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_WordOrigin_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const wordsMap: Record<
    string,
    { word: string; origin: string; meaning: string; modernUse: string }[]
  > = {
    science: [
      {
        word: 'atom',
        origin: 'Yunanca "atomos" (bölünemez)',
        meaning: 'Maddeyi oluşturan en küçük birim',
        modernUse: 'Fizik ve kimyanın temel kavramı',
      },
      {
        word: 'hücre',
        origin: 'Latince "cellula" (küçük oda)',
        meaning: 'Canlıların yapısal birimi',
        modernUse: 'Biyolojinin temel kavramı',
      },
      {
        word: 'enerji',
        origin: 'Yunanca "energeia" (etkinlik)',
        meaning: 'İş yapabilme yeteneği',
        modernUse: 'Fizikte temel büyüklük',
      },
      {
        word: 'ekosistem',
        origin: 'Yunanca "oikos" + "systema"',
        meaning: 'Canlı ve cansız varlıklar bütünü',
        modernUse: 'Çevre biliminin temel kavramı',
      },
    ],
    math: [
      {
        word: 'geometri',
        origin: 'Yunanca "geo" (toprak) + "metron" (ölçüm)',
        meaning: 'Toprak ölçme sanatı',
        modernUse: 'Matematiğin temel dalı',
      },
      {
        word: 'aritmetik',
        origin: 'Yunanca "arithmos" (sayı)',
        meaning: 'Sayı bilimi',
        modernUse: 'Temel matematik işlemleri',
      },
      {
        word: 'cebir',
        origin: 'Arapça "al-jabr" (kırılanı düzeltme)',
        meaning: 'Denklem çözme bilimi',
        modernUse: 'Matematiğin temel dalı',
      },
      {
        word: 'algoritma',
        origin: 'Farsça "Harezmi" isminden',
        meaning: 'İşlem basamakları',
        modernUse: 'Bilgisayar bilimlerinin temeli',
      },
    ],
    language: [
      {
        word: 'gök',
        origin: 'Eski Türkçe "kök" (mavi gökyüzü)',
        meaning: 'Gökyüzü, sema',
        modernUse: 'Şiirsel anlatımda sıkça kullanılır',
      },
      {
        word: 'su',
        origin: 'Eski Türkçe "sub"',
        meaning: 'Yaşam kaynağı sıvı',
        modernUse: 'Günlük dilde en sık kullanılan kelimelerden',
      },
      {
        word: 'ateş',
        origin: 'Eski Türkçe "ot"',
        meaning: 'Yanma olayı, alev',
        modernUse: 'Mecaz anlamda coşku için de kullanılır',
      },
      {
        word: 'toprak',
        origin: 'Eski Türkçe "topur"',
        meaning: 'Yer kabuğu, dünya',
        modernUse: 'Tarım ve doğa bağlamında kullanılır',
      },
    ],
    social: [
      {
        word: 'devlet',
        origin: 'Arapça "devle" (dönme, iktidar)',
        meaning: 'Siyasi örgütlenme',
        modernUse: 'Yönetim biliminin temel kavramı',
      },
      {
        word: 'millet',
        origin: 'Arapça "milla" (din, topluluk)',
        meaning: 'Birlikte yaşayan halk',
        modernUse: 'Toplumsal kimlik ifadesi',
      },
      {
        word: 'cumhuriyet',
        origin: 'Arapça "cumhur" (halk) + Latince "-itas"',
        meaning: 'Halk yönetimi',
        modernUse: "Türkiye'nin yönetim biçimi",
      },
      {
        word: 'demokrasi',
        origin: 'Yunanca "demos" (halk) + "kratos" (yönetim)',
        meaning: 'Halk yönetimi',
        modernUse: 'Siyasi yönetim biçimi',
      },
    ],
    general: [
      {
        word: 'gök',
        origin: 'Eski Türkçe "kök" (mavi gökyüzü)',
        meaning: 'Gökyüzü, sema',
        modernUse: 'Şiirsel anlatımda sıkça kullanılır',
      },
      {
        word: 'su',
        origin: 'Eski Türkçe "sub"',
        meaning: 'Yaşam kaynağı sıvı',
        modernUse: 'Günlük dilde en sık kullanılan kelimelerden',
      },
      {
        word: 'ateş',
        origin: 'Eski Türkçe "ot"',
        meaning: 'Yanma olayı, alev',
        modernUse: 'Mecaz anlamda coşku için de kullanılır',
      },
      {
        word: 'toprak',
        origin: 'Eski Türkçe "topur"',
        meaning: 'Yer kabuğu, dünya',
        modernUse: 'Tarım ve doğa bağlamında kullanılır',
      },
    ],
  };
  const words = wordsMap[category] || wordsMap.general;
  return {
    title: `${params.topic} - Kelime Kökeni`,
    content: {
      vocabulary: words.map((w) => ({
        word: w.word,
        syllables: [w.origin],
        meaning: w.meaning,
        exampleSentence: `Günümüz: ${w.modernUse}`,
        rootWord: w.origin,
      })),
    },
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Etimoloji', 'Kültürel farkındalık'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_WORD_ORIGIN: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_WORD_ORIGIN,
  aiGenerator: generateInfographic_WordOrigin_AI,
  offlineGenerator: generateInfographic_WordOrigin_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'wordCount',
        type: 'number',
        label: 'Kelime Sayısı',
        defaultValue: 4,
        description: 'Kaç kelimenin kökeni gösterilsin?',
      },
      {
        name: 'showModernUse',
        type: 'boolean',
        label: 'Günümüz Kullanımı',
        defaultValue: true,
        description: 'Kelimenin günümüzdeki kullanımı gösterilsin mi?',
      },
    ],
  },
};
