import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type HistoricalTimelineAIResult = {
  title: string;
  events: { date: string; title: string; description: string; significance: string }[];
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
  const socialTerms = ['tarih', 'savaş', 'imparatorluk', 'devrim', 'cumhuriyet'];
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_HISTORICAL_TIMELINE_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'TARİHSEL ZAMAN ÇİZELGESİ',
    params,
    '1. Konuya uygun tarihsel olayları kronolojik sırayla listele\n2. Her olayın tarihini ve önemini belirt\n3. Görsel sembollerle destekle'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      events: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            date: { type: 'STRING' },
            title: { type: 'STRING' },
            description: { type: 'STRING' },
            significance: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as HistoricalTimelineAIResult;
  return {
    title: result.title || `${params.topic} - Tarihsel Zaman Çizelgesi`,
    content: {
      timeline: (result.events || []).map((event) => ({
        date: event.date,
        title: event.title,
        description: event.description,
        isKeyEvent: event.significance.includes('önemli') || event.significance.includes('kritik'),
      })),
      steps: (result.events || []).map((event, i) => ({
        stepNumber: i + 1,
        label: `${event.date}: ${event.title}`,
        description: event.description,
        isCheckpoint: i === 0,
        scaffoldHint: `Önem: ${event.significance}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kronolojik düşünme', 'Tarihsel olayları sıralama', 'Nedensellik ilişkileri'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_HISTORICAL_TIMELINE_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const events = [
    {
      date: '1071',
      title: 'Malazgirt Zaferi',
      description: "Anadolu'nun kapıları Türklere açıldı.",
      significance: 'Türk tarihinin dönüm noktası',
    },
    {
      date: '1299',
      title: 'Osmanlı Beyliği Kuruldu',
      description: 'Osman Gazi tarafından Osmanlı Devleti kuruldu.',
      significance: 'Yeni bir imparatorluğun başlangıcı',
    },
    {
      date: '1453',
      title: "İstanbul'un Fethi",
      description: "Fatih Sultan Mehmet İstanbul'u fethetti.",
      significance: 'Orta Çağ kapanıp Yeni Çağ açıldı',
    },
    {
      date: '1923',
      title: 'Cumhuriyet İlan Edildi',
      description: 'Türkiye Cumhuriyeti kuruldu.',
      significance: "Modern Türkiye'nin kuruluşu",
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    social:
      'Tarihsel zaman çizelgesi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için kronolojik düşünme becerilerini geliştiren temel bir sosyal bilgiler aracıdır. Olayların görsel zaman çizelgesi üzerinde sıralanması, soyut tarihsel kavramları somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve görsel semboller ile olaylar arasındaki nedensellik ilişkilerini daha kolay kavrar ve tarihsel farkındalık geliştirirler.',
    math: 'Tarihsel olaylar arasındaki süreleri hesaplamak, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi tarih ile bağdaştırır.',
    language:
      'Tarihsel olayları anlatmak, disleksi desteğine ihtiyacı olan öğrenciler için sıralı anlatım ve tarihsel kelime dağarcığını geliştirir.',
    science:
      'Bilim tarihindeki önemli keşifleri zaman çizelgesinde göstermek, disleksi desteğine ihtiyacı olan öğrenciler için bilimsel gelişmeleri bağlamsal olarak anlamalarını sağlar.',
    general:
      'Tarihsel zaman çizelgesi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için kronolojik düşünme becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Tarihsel Zaman Çizelgesi`,
    content: {
      timeline: events.map((event) => ({
        date: event.date,
        title: event.title,
        description: event.description,
        isKeyEvent: true,
      })),
      steps: events.map((event, i) => ({
        stepNumber: i + 1,
        label: `${event.date}: ${event.title}`,
        description: event.description,
        isCheckpoint: i === 0,
        scaffoldHint: `Önem: ${event.significance}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kronolojik düşünme', 'Tarihsel olayları sıralama', 'Nedensellik ilişkileri'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_HISTORICAL_TIMELINE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_HISTORICAL_TIMELINE,
  aiGenerator: generateInfographic_HISTORICAL_TIMELINE_AI,
  offlineGenerator: generateInfographic_HISTORICAL_TIMELINE_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'era',
        type: 'string',
        label: 'Tarihsel Dönem',
        defaultValue: 'Osmanlı Tarihi',
        description: 'Hangi tarihsel dönem gösterilsin?',
      },
      {
        name: 'showSignificance',
        type: 'boolean',
        label: 'Önem Derecesini Göster',
        defaultValue: true,
        description: 'Her olayın önem derecesi vurgulansın mı?',
      },
    ],
  },
};
