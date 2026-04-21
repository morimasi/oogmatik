import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type SentenceBuilderAIResult = {
  title: string;
  sentences: { subject: string; object: string; verb: string; fullSentence: string }[];
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

export async function generateInfographic_SentenceBuilder_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'CÜMLE İNŞASI',
    params,
    '1. Konuya uygun 3-5 cümle oluştur\n2. Her cümleyi özne, nesne ve yüklem olarak ayır\n3. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      sentences: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            subject: { type: 'STRING' },
            object: { type: 'STRING' },
            verb: { type: 'STRING' },
            fullSentence: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as SentenceBuilderAIResult;
  return {
    title: result.title || `${params.topic} - Cümle İnşası`,
    content: {
      steps: (result.sentences || []).map((s, i) => ({
        stepNumber: i + 1,
        label: s.fullSentence,
        description: `Özne: ${s.subject} | Nesne: ${s.object} | Yüklem: ${s.verb}`,
        isCheckpoint: false,
      })),
    },
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Cümle yapısı', 'Dilbilgisi'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SentenceBuilder_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const sentencesMap: Record<
    string,
    { subject: string; object: string; verb: string; fullSentence: string }[]
  > = {
    science: [
      {
        subject: 'Bilim insanları',
        object: 'deneyleri',
        verb: 'yaptı.',
        fullSentence: 'Bilim insanları deneyleri yaptı.',
      },
      {
        subject: 'Güneş',
        object: 'dünyayı',
        verb: 'aydınlatır.',
        fullSentence: 'Güneş dünyayı aydınlatır.',
      },
      {
        subject: 'Bitkiler',
        object: 'fotosentezle',
        verb: 'beslenir.',
        fullSentence: 'Bitkiler fotosentezle beslenir.',
      },
    ],
    math: [
      {
        subject: 'Öğrenciler',
        object: 'problemleri',
        verb: 'çözdü.',
        fullSentence: 'Öğrenciler problemleri çözdü.',
      },
      {
        subject: 'Ayşe',
        object: 'sayıları',
        verb: 'topladı.',
        fullSentence: 'Ayşe sayıları topladı.',
      },
      {
        subject: 'Öğretmen',
        object: 'geometriyi',
        verb: 'anlattı.',
        fullSentence: 'Öğretmen geometriyi anlattı.',
      },
    ],
    language: [
      {
        subject: 'Çocuklar',
        object: 'kitapları',
        verb: 'okudu.',
        fullSentence: 'Çocuklar kitapları okudu.',
      },
      {
        subject: 'Öğretmen',
        object: 'hikayeyi',
        verb: 'anlattı.',
        fullSentence: 'Öğretmen hikayeyi anlattı.',
      },
      {
        subject: 'Öğrenciler',
        object: 'şiirleri',
        verb: 'ezberledi.',
        fullSentence: 'Öğrenciler şiirleri ezberledi.',
      },
    ],
    social: [
      {
        subject: 'Atatürk',
        object: 'cumhuriyeti',
        verb: 'kurdu.',
        fullSentence: 'Atatürk cumhuriyeti kurdu.',
      },
      { subject: 'Millet', object: 'meclisi', verb: 'açtı.', fullSentence: 'Millet meclisi açtı.' },
      {
        subject: 'Toplum',
        object: 'geleneklerini',
        verb: 'koruyor.',
        fullSentence: 'Toplum geleneklerini koruyor.',
      },
    ],
    general: [
      {
        subject: 'Çocuklar',
        object: 'kitapları',
        verb: 'okudu.',
        fullSentence: 'Çocuklar kitapları okudu.',
      },
      {
        subject: 'Öğretmen',
        object: 'hikayeyi',
        verb: 'anlattı.',
        fullSentence: 'Öğretmen hikayeyi anlattı.',
      },
      {
        subject: 'Öğrenciler',
        object: 'şiirleri',
        verb: 'ezberledi.',
        fullSentence: 'Öğrenciler şiirleri ezberledi.',
      },
    ],
  };
  const sentences = sentencesMap[category] || sentencesMap.general;
  return {
    title: `${params.topic} - Cümle İnşası`,
    content: {
      steps: sentences.map((s, i) => ({
        stepNumber: i + 1,
        label: s.fullSentence,
        description: `Özne: ${s.subject} | Nesne: ${s.object} | Yüklem: ${s.verb}`,
        isCheckpoint: false,
      })),
    },
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Cümle yapısı', 'Dilbilgisi'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SENTENCE_BUILDER: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SENTENCE_BUILDER,
  aiGenerator: generateInfographic_SentenceBuilder_AI,
  offlineGenerator: generateInfographic_SentenceBuilder_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'sentenceCount',
        type: 'number',
        label: 'Cümle Sayısı',
        defaultValue: 3,
        description: 'Kaç cümle gösterilsin?',
      },
      {
        name: 'colorCodeParts',
        type: 'boolean',
        label: 'Cümle Parçalarını Renklendir',
        defaultValue: true,
        description: 'Özne, nesne ve yüklem farklı renkte gösterilsin mi?',
      },
    ],
  },
};
