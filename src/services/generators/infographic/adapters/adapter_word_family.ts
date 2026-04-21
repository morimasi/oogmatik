import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type WordFamilyAIResult = {
  title: string;
  rootWord: string;
  familyWords: { word: string; type: string; meaning: string }[];
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

export async function generateInfographic_WordFamily_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'SÖZCÜK AİLESİ',
    params,
    '1. Bir kök kelime belirle\n2. Bu kökten gelen 5-7 kelime bul\n3. Her kelimenin türünü ve anlamını yaz\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      rootWord: { type: 'STRING' },
      familyWords: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING' },
            type: { type: 'STRING' },
            meaning: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as WordFamilyAIResult;
  return {
    title: result.title || `${params.topic} - Sözcük Ailesi`,
    content: {
      hierarchy: {
        label: result.rootWord || params.topic,
        description: 'Kök kelime',
        children: (result.familyWords || []).map((fw) => ({
          label: fw.word,
          description: `${fw.type}: ${fw.meaning}`,
        })),
      },
    },
    layoutHints: {
      orientation: 'tree',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kelime ailesi', 'Yapı bilgisi'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_WordFamily_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const rootsMap: Record<
    string,
    { rootWord: string; familyWords: { word: string; type: string; meaning: string }[] }
  > = {
    science: {
      rootWord: 'su',
      familyWords: [
        { word: 'sulu', type: 'sıfat', meaning: 'Su içeren, nemli' },
        { word: 'susuz', type: 'sıfat', meaning: 'Su içermeyen, kuru' },
        { word: 'sulamak', type: 'fiil', meaning: 'Su vermek' },
        { word: 'suluk', type: 'isim', meaning: 'Su kabı' },
        { word: 'sucu', type: 'isim', meaning: 'Su satan veya taşıyan kişi' },
      ],
    },
    math: {
      rootWord: 'ölç',
      familyWords: [
        { word: 'ölçü', type: 'isim', meaning: 'Birim, standart' },
        { word: 'ölçüm', type: 'isim', meaning: 'Ölçme işlemi sonucu' },
        { word: 'ölçmek', type: 'fiil', meaning: 'Büyüklük belirlemek' },
        { word: 'ölçülü', type: 'sıfat', meaning: 'Dengeli, ölçüye uygun' },
        { word: 'ölçüsüz', type: 'sıfat', meaning: 'Aşırı, sınırsız' },
      ],
    },
    language: {
      rootWord: 'yaz',
      familyWords: [
        { word: 'yazı', type: 'isim', meaning: 'Yazılı metin' },
        { word: 'yazmak', type: 'fiil', meaning: 'Harf koymak, kaleme almak' },
        { word: 'yazar', type: 'isim', meaning: 'Kitap yazan kişi' },
        { word: 'yazılı', type: 'isim', meaning: 'Sınav, yazılı test' },
        { word: 'yazılımcı', type: 'isim', meaning: 'Yazılım geliştiren kişi' },
      ],
    },
    social: {
      rootWord: 'yurt',
      familyWords: [
        { word: 'yurttaş', type: 'isim', meaning: 'Vatandaş, aynı ülkeden olan' },
        { word: 'yurttaşlık', type: 'isim', meaning: 'Vatandaşlık durumu' },
        { word: 'yurtsever', type: 'sıfat', meaning: 'Vatanını seven' },
        { word: 'yurtsuz', type: 'sıfat', meaning: 'Yurdu olmayan' },
        { word: 'yurtluk', type: 'isim', meaning: 'Yurt olarak kullanılan yer' },
      ],
    },
    general: {
      rootWord: 'yaz',
      familyWords: [
        { word: 'yazı', type: 'isim', meaning: 'Yazılı metin' },
        { word: 'yazmak', type: 'fiil', meaning: 'Harf koymak, kaleme almak' },
        { word: 'yazar', type: 'isim', meaning: 'Kitap yazan kişi' },
        { word: 'yazılı', type: 'isim', meaning: 'Sınav, yazılı test' },
        { word: 'yazılımcı', type: 'isim', meaning: 'Yazılım geliştiren kişi' },
      ],
    },
  };
  const rootData = rootsMap[category] || rootsMap.general;
  return {
    title: `${params.topic} - Sözcük Ailesi`,
    content: {
      hierarchy: {
        label: rootData.rootWord,
        description: 'Kök kelime',
        children: rootData.familyWords.map((fw) => ({
          label: fw.word,
          description: `${fw.type}: ${fw.meaning}`,
        })),
      },
    },
    layoutHints: {
      orientation: 'tree',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kelime ailesi', 'Yapı bilgisi'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_WORD_FAMILY: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_WORD_FAMILY,
  aiGenerator: generateInfographic_WordFamily_AI,
  offlineGenerator: generateInfographic_WordFamily_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'familyWordCount',
        type: 'number',
        label: 'Aile Kelime Sayısı',
        defaultValue: 5,
        description: 'Kaç aile kelimesi gösterilsin?',
      },
      {
        name: 'showWordTypes',
        type: 'boolean',
        label: 'Kelime Türleri',
        defaultValue: true,
        description: 'Her kelimenin türü gösterilsin mi?',
      },
    ],
  },
};
