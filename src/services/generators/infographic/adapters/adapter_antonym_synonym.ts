import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type AntonymSynonymAIResult = {
  title: string;
  pairs: { word: string; synonym: string; antonym: string }[];
  pedagogicalNote: string;
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

export async function generateInfographic_AntonymSynonym_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'EŞ VE ZIT ANLAMLILAR',
    params,
    '1. Konuya uygun 5 kelime seç\n2. Her kelimenin eş ve zıt anlamını yaz\n3. Pedagojik not: Eş-zıt anlam çalışmasının kelime gelişimine katkısı (min 100 kelime)\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      pairs: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING' },
            synonym: { type: 'STRING' },
            antonym: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as AntonymSynonymAIResult;
  return {
    title: result.title || `${params.topic} - Eş ve Zıt Anlamlılar`,
    content: {
      comparisons: {
        leftTitle: 'Eş Anlamlılar',
        rightTitle: 'Zıt Anlamlılar',
        leftItems: (result.pairs || []).map((p) => `${p.word} → ${p.synonym}`),
        rightItems: (result.pairs || []).map((p) => `${p.word} → ${p.antonym}`),
      },
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Eş ve zıt anlam çalışması, disleksi desteğine ihtiyacı olan öğrenciler için kelime anlamları arasındaki ilişkileri görselleştirerek kelime hazinesini genişletir. Eş anlamlıları öğrenmek, metinlerdeki anlam zenginliğini fark etmeyi sağlarken zıt anlamlılar kavramsal karşılaştırma becerisini geliştirir. Bu ikili yaklaşım, anlam çıkarımını güçlendirir.',
    layoutHints: {
      orientation: 'dual-column',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kelime anlamı', 'İlişkilendirme'],
    estimatedDuration: 12,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_AntonymSynonym_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const pairsMap: Record<string, { word: string; synonym: string; antonym: string }[]> = {
    science: [
      { word: 'sıcak', synonym: 'ılık', antonym: 'soğuk' },
      { word: 'büyük', synonym: 'iri', antonym: 'küçük' },
      { word: 'hızlı', synonym: 'çabuk', antonym: 'yavaş' },
      { word: 'ağır', synonym: 'tok', antonym: 'hafif' },
      { word: 'parlak', synonym: 'aydınlık', antonym: 'karanlık' },
    ],
    math: [
      { word: 'uzun', synonym: 'uzun boylu', antonym: 'kısa' },
      { word: 'geniş', synonym: 'genişçe', antonym: 'dar' },
      { word: 'çok', synonym: 'fazla', antonym: 'az' },
      { word: 'ağır', synonym: 'tok', antonym: 'hafif' },
      { word: 'büyük', synonym: 'iri', antonym: 'küçük' },
    ],
    language: [
      { word: 'güzel', synonym: 'hoş', antonym: 'çirkin' },
      { word: 'cesur', synonym: 'yiğit', antonym: 'korkak' },
      { word: 'zengin', synonym: 'varlıklı', antonym: 'fakir' },
      { word: 'temiz', synonym: 'pak', antonym: 'kirli' },
      { word: 'kolay', synonym: 'rahat', antonym: 'zor' },
    ],
    social: [
      { word: 'barış', synonym: 'sulh', antonym: 'savaş' },
      { word: 'özgürlük', synonym: 'hürriyet', antonym: 'esaret' },
      { word: 'adalet', synonym: 'hakkaniyet', antonym: 'zulüm' },
      { word: 'sevgi', synonym: 'muhabbet', antonym: 'nefret' },
      { word: 'yardım', synonym: 'destek', antonym: 'engel' },
    ],
    general: [
      { word: 'güzel', synonym: 'hoş', antonym: 'çirkin' },
      { word: 'cesur', synonym: 'yiğit', antonym: 'korkak' },
      { word: 'zengin', synonym: 'varlıklı', antonym: 'fakir' },
      { word: 'temiz', synonym: 'pak', antonym: 'kirli' },
      { word: 'kolay', synonym: 'rahat', antonym: 'zor' },
    ],
  };
  const pairs = pairsMap[category] || pairsMap.general;
  return {
    title: `${params.topic} - Eş ve Zıt Anlamlılar`,
    content: {
      comparisons: {
        leftTitle: 'Eş Anlamlılar',
        rightTitle: 'Zıt Anlamlılar',
        leftItems: pairs.map((p) => `${p.word} → ${p.synonym}`),
        rightItems: pairs.map((p) => `${p.word} → ${p.antonym}`),
      },
    },
    pedagogicalNote:
      'Eş ve zıt anlam çalışması, disleksi desteğine ihtiyacı olan öğrenciler için kelime anlamları arasındaki ilişkileri görselleştirerek kelime hazinesini genişletir. Eş anlamlıları öğrenmek, metinlerdeki anlam zenginliğini fark etmeyi sağlarken zıt anlamlılar kavramsal karşılaştırma becerisini geliştirir. Bu ikili yaklaşım, anlam çıkarımını güçlendirir ve okuduğunu anlama derinliğini artırır.',
    layoutHints: {
      orientation: 'dual-column',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kelime anlamı', 'İlişkilendirme'],
    estimatedDuration: 12,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_ANTONYM_SYNONYM: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_ANTONYM_SYNONYM,
  aiGenerator: generateInfographic_AntonymSynonym_AI,
  offlineGenerator: generateInfographic_AntonymSynonym_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'pairCount',
        type: 'number',
        label: 'Kelime Çifti Sayısı',
        defaultValue: 5,
        description: 'Kaç kelime çifti gösterilsin?',
      },
      {
        name: 'showBothColumns',
        type: 'boolean',
        label: 'Her İki Sütunu Göster',
        defaultValue: true,
        description: 'Eş ve zıt anlamlılar yan yana gösterilsin mi?',
      },
    ],
  },
};
