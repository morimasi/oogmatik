import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type EmotionGaugeAIResult = {
  title: string;
  emotions: { name: string; intensity: number; bodyLocation: string; strategy: string }[];
  pedagogicalNote: string;
};

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

function detectCategory(topic: string): 'science' | 'math' | 'language' | 'social' | 'general' {
  const scienceTerms = ['deney', 'gözlem', 'doğa', 'bitki', 'hayvan', 'fen'];
  const mathTerms = ['matematik', 'hesap', 'sayı', 'işlem', 'problem'];
  const languageTerms = ['okuma', 'yazma', 'hikaye', 'kelime', 'dil'];
  const socialTerms = ['toplum', 'tarih', 'coğrafya', 'kültür'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  if (mathTerms.some((term) => topic.toLowerCase().includes(term))) return 'math' as const;
  if (languageTerms.some((term) => topic.toLowerCase().includes(term))) return 'language' as const;
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_EMOTION_GAUGE_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DUYGU ÖLÇER',
    params,
    '1. Duygu seviyelerini 1-5 ölçeğinde belirle\n2. Her duygu için beden konumu ve baş etme stratejisi belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için duygusal farkındalık (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      emotions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            intensity: { type: 'NUMBER' },
            bodyLocation: { type: 'STRING' },
            strategy: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as EmotionGaugeAIResult;
  return {
    title: result.title || `${params.topic} - Duygu Ölçer`,
    content: {
      emotions: (result.emotions || []).map((e) => ({
        emotion: e.name,
        intensity: Math.min(5, Math.max(1, e.intensity)),
        bodyLocation: e.bodyLocation,
        color: e.intensity <= 2 ? '#4CAF50' : e.intensity <= 3 ? '#FFC107' : '#F44336',
        strategy: e.strategy,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Duygu ölçer infografiği, disleksi desteğine ihtiyacı olan öğrenciler için duygusal farkındalık geliştirmede önemli bir görsel araçtır. Disleksi desteğine ihtiyacı olan öğrenciler, akademik zorluklar nedeniyle sıklıkla hayal kırıklığı ve kaygı yaşarlar. Duygularını tanımlamak ve yoğunluklarını görsel olarak ifade edebilmek, disleksi desteğine ihtiyacı olan öğrencilerin öz düzenleme becerilerini güçlendirir. Renk kodlu duygu ölçekleri, disleksi desteğine ihtiyacı olan öğrencilerin içsel durumlarını dışsallaştırmalarını ve uygun baş etme stratejilerini seçmelerini kolaylaştırır. Bu araç, duygusal okuryazarlığı artırır ve sınıf içi iletişimi iyileştirir.',
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Duygusal farkındalık', 'Öz düzenleme', 'Baş etme stratejileri', 'Empati'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_EMOTION_GAUGE_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const emotions = [
    { name: 'Mutlu', intensity: 5, bodyLocation: 'Yüz kalbi', strategy: 'Gülümse ve paylaş' },
    { name: 'Meraklı', intensity: 4, bodyLocation: 'Gözler', strategy: 'Soru sor ve keşfet' },
    { name: 'Endişeli', intensity: 3, bodyLocation: 'Karın', strategy: 'Derin nefes al' },
    { name: 'Yorgun', intensity: 2, bodyLocation: 'Kollar', strategy: 'Kısa mola ver' },
    { name: 'Hayal Kırıklığı', intensity: 2, bodyLocation: 'Göğüs', strategy: 'Tekrar dene' },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Duygu ölçer infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri öğrenme sürecinde yaşanan duygusal deneyimleri tanımlamada yardımcı olur. Deney sonuçları beklendiği gibi olmadığında disleksi desteğine ihtiyacı olan öğrenciler hayal kırıklığı yaşayabilir. Duygularını tanımak ve baş etme stratejileri geliştirmek, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel keşif sürecinde dirençli olmalarını sağlar.',
    math: 'Duygu ölçer infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik kaygısını yönetmede önemli bir araçtır. Matematik problemleriyle karşılaştığında disleksi desteğine ihtiyacı olan öğrenciler sıklıkla kaygı ve yetersizlik duyguları yaşar. Duygusal farkındalık geliştirmek, disleksi desteğine ihtiyacı olan öğrencilerin matematik öğrenme süreçlerinde olumlu tutum geliştirmelerine yardımcı olur.',
    language:
      'Duygu ölçer infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma süreçlerinde yaşanan duygusal tepkileri anlamada destekleyici bir araçtır. Okuma güçlüğü çeken disleksi desteğine ihtiyacı olan öğrenciler, metin karşısında yaşadıkları hayal kırıklığını ifade edebilmelidir. Duygu ölçer, disleksi desteğine ihtiyacı olan öğrencilerin duygusal durumlarını görselleştirmelerini ve uygun baş etme stratejileri seçmelerini sağlar.',
    social:
      'Duygu ölçer infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal etkileşimlerde duygusal farkındalık geliştirmede rehberlik eder. Grup çalışmaları ve sınıf içi etkinliklerde disleksi desteğine ihtiyacı olan öğrenciler çeşitli duygular yaşar. Bu duyguları tanıma ve yönetme becerisi, disleksi desteğine ihtiyacı olan öğrencilerin sosyal ilişkilerini güçlendirir.',
    general:
      'Duygu ölçer infografiği, disleksi desteğine ihtiyacı olan öğrenciler için duygusal farkındalık geliştirmede önemli bir görsel araçtır. Disleksi desteğine ihtiyacı olan öğrenciler, akademik zorluklar nedeniyle sıklıkla hayal kırıklığı ve kaygı yaşarlar. Duygularını tanımlamak ve yoğunluklarını görsel olarak ifade edebilmek, disleksi desteğine ihtiyacı olan öğrencilerin öz düzenleme becerilerini güçlendirir. Renk kodlu duygu ölçekleri, disleksi desteğine ihtiyacı olan öğrencilerin içsel durumlarını dışsallaştırmalarını ve uygun baş etme stratejilerini seçmelerini kolaylaştırır. Bu araç, duygusal okuryazarlığı artırır ve sınıf içi iletişimi iyileştirir.',
  };

  return {
    title: `${params.topic} - Duygu Ölçer`,
    content: {
      emotions: emotions.map((e) => ({
        emotion: e.name,
        intensity: e.intensity,
        bodyLocation: e.bodyLocation,
        color: e.intensity <= 2 ? '#4CAF50' : e.intensity <= 3 ? '#FFC107' : '#F44336',
        strategy: e.strategy,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Duygusal farkındalık', 'Öz düzenleme', 'Baş etme stratejileri', 'Empati'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_EMOTION_GAUGE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_EMOTION_GAUGE,
  aiGenerator: generateInfographic_EMOTION_GAUGE_AI,
  offlineGenerator: generateInfographic_EMOTION_GAUGE_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'emotionCount',
        type: 'number',
        label: 'Duygu Sayısı',
        defaultValue: 5,
        description: 'Kaç duygu gösterilsin?',
      },
      {
        name: 'showBodyMap',
        type: 'boolean',
        label: 'Beden Haritası Göster',
        defaultValue: true,
        description: 'Duyguların bedendeki yeri gösterilsin mi?',
      },
    ],
  },
};
