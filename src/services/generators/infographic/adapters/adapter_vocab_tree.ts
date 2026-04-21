import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type VocabTreeAIResult = {
  title: string;
  rootWord: string;
  derivedWords: { word: string; meaning: string; example: string }[];
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

export async function generateInfographic_VocabTree_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'KELİME AĞACI',
    params,
    '1. Bir kök kelime belirle\n2. Bu kökten türeyen 4-6 kelime bul\n3. Her türeyen kelime için anlam ve örnek cümle yaz\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      rootWord: { type: 'STRING' },
      derivedWords: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING' },
            meaning: { type: 'STRING' },
            example: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as VocabTreeAIResult;
  return {
    title: result.title || `${params.topic} - Kelime Ağacı`,
    content: {
      hierarchy: {
        label: result.rootWord || params.topic,
        description: 'Kök kelime',
        children: (result.derivedWords || []).map((dw) => ({
          label: dw.word,
          description: `${dw.meaning} — ${dw.example}`,
        })),
      },
    },
    layoutHints: {
      orientation: 'tree',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kelime hazinesi', 'Türetme bilgisi'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_VocabTree_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const rootsMap: Record<
    string,
    { rootWord: string; derivedWords: { word: string; meaning: string; example: string }[] }
  > = {
    science: {
      rootWord: 'canlı',
      derivedWords: [
        { word: 'canlılık', meaning: 'Yaşam özelliği', example: 'Canlılık belirtileri nelerdir?' },
        { word: 'cansız', meaning: 'Yaşamayan varlık', example: 'Taş cansız bir varlıktır.' },
        {
          word: 'canlandırmak',
          meaning: 'Hayal gücüyle yaşatmak',
          example: 'Hikayeyi canlandırdık.',
        },
        { word: 'yaşam', meaning: 'Hayat, canlı durumu', example: 'Su yaşam kaynağıdır.' },
      ],
    },
    math: {
      rootWord: 'sayı',
      derivedWords: [
        { word: 'sayısal', meaning: 'Sayılarla ilgili', example: 'Sayısal veriler topladık.' },
        { word: 'saymak', meaning: 'Adet belirlemek', example: 'Elmaları saydık.' },
        { word: 'sayısız', meaning: 'Çok fazla, hesaplanamaz', example: 'Sayısız yıldız var.' },
        { word: 'sayıca', meaning: 'Sayı bakımından', example: 'Sayıca fazla olduk.' },
      ],
    },
    language: {
      rootWord: 'göz',
      derivedWords: [
        { word: 'gözlük', meaning: 'Görmeyi sağlayan araç', example: 'Dede gözlük takıyor.' },
        { word: 'gözcü', meaning: 'Gözetleyen kişi', example: 'Kale gözcüsü nöbette.' },
        { word: 'gözetlemek', meaning: 'Gizlice izlemek', example: 'Kuşları gözetledik.' },
        { word: 'gözlem', meaning: 'Dikkatli inceleme', example: 'Fen gözlemi yaptık.' },
      ],
    },
    social: {
      rootWord: 'insan',
      derivedWords: [
        {
          word: 'insancıl',
          meaning: 'İnsanlık değerlerine uygun',
          example: 'İnsancıl bir yaklaşım.',
        },
        { word: 'insanlık', meaning: 'İnsan olma durumu', example: 'İnsanlık tarihi uzundur.' },
        { word: 'insansı', meaning: 'İnsana benzeyen', example: 'İnsansı robotlar gelişiyor.' },
        { word: 'insanca', meaning: 'İnsan yakışır biçimde', example: 'İnsanca yaşamak hakkımız.' },
      ],
    },
    general: {
      rootWord: 'göz',
      derivedWords: [
        { word: 'gözlük', meaning: 'Görmeyi sağlayan araç', example: 'Dede gözlük takıyor.' },
        { word: 'gözcü', meaning: 'Gözetleyen kişi', example: 'Kale gözcüsü nöbette.' },
        { word: 'gözetlemek', meaning: 'Gizlice izlemek', example: 'Kuşları gözetledik.' },
        { word: 'gözlem', meaning: 'Dikkatli inceleme', example: 'Fen gözlemi yaptık.' },
      ],
    },
  };
  const rootData = rootsMap[category] || rootsMap.general;
  return {
    title: `${params.topic} - Kelime Ağacı`,
    content: {
      hierarchy: {
        label: rootData.rootWord,
        description: 'Kök kelime',
        children: rootData.derivedWords.map((dw) => ({
          label: dw.word,
          description: `${dw.meaning} — ${dw.example}`,
        })),
      },
    },
    layoutHints: {
      orientation: 'tree',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kelime hazinesi', 'Türetme bilgisi'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_VOCAB_TREE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_VOCAB_TREE,
  aiGenerator: generateInfographic_VocabTree_AI,
  offlineGenerator: generateInfographic_VocabTree_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'derivedWordCount',
        type: 'number',
        label: 'Türeyen Kelime Sayısı',
        defaultValue: 4,
        description: 'Kaç türeyen kelime gösterilsin?',
      },
      {
        name: 'showExamples',
        type: 'boolean',
        label: 'Örnek Cümleler',
        defaultValue: true,
        description: 'Her kelime için örnek cümle gösterilsin mi?',
      },
    ],
  },
};
