import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type TimelineEventAIResult = {
  title: string;
  events: { date: string; event: string; significance: string }[];
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

export async function generateInfographic_TimelineEvent_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ZAMAN ÇİZELGESİ',
    params,
    '1. Konuya uygun 4-6 olay belirle\n2. Her olay için tarih, açıklama ve önemini yaz\n3. Pedagojik not: Kronolojik düşünmenin tarih bilincine katkısı (min 100 kelime)\n4. Lexend font, disleksi uyumlu'
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
            event: { type: 'STRING' },
            significance: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as TimelineEventAIResult;
  return {
    title: result.title || `${params.topic} - Zaman Çizelgesi`,
    content: {
      timeline: (result.events || []).map((ev) => ({
        date: ev.date,
        title: ev.event,
        description: ev.significance,
        isKeyEvent: true,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Zaman çizelgesi, disleksi desteğine ihtiyacı olan öğrenciler için olayları kronolojik sırayla görselleştirerek tarih bilincini geliştirir. Olaylar arasındaki nedensellik ilişkilerini görmek, öğrencilerin analitik düşünme becerilerini güçlendirir ve geçmiş-şimdi-gelecek kavramlarını somutlaştırır.',
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Tarih bilinci', 'Kronolojik düşünme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_TimelineEvent_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const eventsMap: Record<string, { date: string; title: string; description: string }[]> = {
    science: [
      {
        date: '1687',
        title: 'Newton - Yerçekimi Kanunu',
        description: 'Evrensel çekim yasası formüle edildi.',
      },
      {
        date: '1859',
        title: 'Darwin - Türlerin Kökeni',
        description: 'Doğal seçilim teorisi yayımlandı.',
      },
      {
        date: '1905',
        title: 'Einstein - Görelilik',
        description: 'Özel görelilik teorisi ortaya atıldı.',
      },
      {
        date: '1953',
        title: 'DNA Yapısı',
        description: 'Watson ve Crick DNA çift sarmalını keşfetti.',
      },
      { date: '1969', title: "Ay'a İniş", description: 'İnsan ilk kez Ay yüzeyine adım attı.' },
    ],
    math: [
      {
        date: 'MÖ 300',
        title: 'Öklid - Elementler',
        description: 'Geometrinin temel eseri yazıldı.',
      },
      {
        date: '1687',
        title: 'Newton - Calculus',
        description: 'Diferansiyel ve integral hesap geliştirildi.',
      },
      {
        date: '1736',
        title: 'Euler - Çizge Teorisi',
        description: 'Königsberg köprüleri problemi çözüldü.',
      },
      {
        date: '1900',
        title: 'Hilbert Problemleri',
        description: '23 matematik problemi tanımlandı.',
      },
      { date: '1995', title: 'Fermat Son Teoremi', description: 'Andrew Wiles kanıtı yayımladı.' },
    ],
    language: [
      { date: '1928', title: 'Harf Devrimi', description: 'Latin alfabesi kabul edildi.' },
      { date: '1932', title: 'Türk Dil Kurumu', description: 'Dil araştırma kurumu kuruldu.' },
      { date: '1945', title: 'Ses Devrimi', description: 'Öz Türkçe çalışmaları hız kazandı.' },
      { date: '1983', title: 'TDK Sözlüğü', description: 'Güncel Türkçe sözlük yayımlandı.' },
      { date: '2005', title: 'Dijital Türkçe', description: 'İnternet çağında Türkçe kullanımı.' },
    ],
    social: [
      { date: '1920', title: 'TBMM Açılışı', description: 'Türkiye Büyük Millet Meclisi açıldı.' },
      { date: '1922', title: 'Saltanatın Kaldırılması', description: 'Saltanat rejimi sona erdi.' },
      { date: '1923', title: 'Cumhuriyet İlanı', description: 'Türkiye Cumhuriyeti kuruldu.' },
      { date: '1928', title: 'Harf Devrimi', description: 'Yeni Türk alfabesi kabul edildi.' },
      {
        date: '1938',
        title: "Atatürk'ün Vefatı",
        description: 'Cumhuriyetin kurucusu vefat etti.',
      },
    ],
    general: [
      { date: '1920', title: 'TBMM Açılışı', description: 'Türkiye Büyük Millet Meclisi açıldı.' },
      { date: '1922', title: 'Saltanatın Kaldırılması', description: 'Saltanat rejimi sona erdi.' },
      { date: '1923', title: 'Cumhuriyet İlanı', description: 'Türkiye Cumhuriyeti kuruldu.' },
      { date: '1928', title: 'Harf Devrimi', description: 'Yeni Türk alfabesi kabul edildi.' },
      {
        date: '1938',
        title: "Atatürk'ün Vefatı",
        description: 'Cumhuriyetin kurucusu vefat etti.',
      },
    ],
  };
  const events = eventsMap[category] || eventsMap.general;
  return {
    title: `${params.topic} - Zaman Çizelgesi`,
    content: {
      timeline: events.map((ev) => ({
        date: ev.date,
        title: ev.title,
        description: ev.description,
        isKeyEvent: true,
      })),
    },
    pedagogicalNote:
      'Zaman çizelgesi, disleksi desteğine ihtiyacı olan öğrenciler için olayları kronolojik sırayla görselleştirerek tarih bilincini geliştirir. Olaylar arasındaki nedensellik ilişkilerini görmek, öğrencilerin analitik düşünme becerilerini güçlendirir ve geçmiş-şimdi-gelecek kavramlarını somutlaştırır. Görsel zaman akışı, sıralama becerisini de destekler.',
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Tarih bilinci', 'Kronolojik düşünme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_TIMELINE_EVENT: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_TIMELINE_EVENT,
  aiGenerator: generateInfographic_TimelineEvent_AI,
  offlineGenerator: generateInfographic_TimelineEvent_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'eventCount',
        type: 'number',
        label: 'Olay Sayısı',
        defaultValue: 5,
        description: 'Kaç olay gösterilsin?',
      },
      {
        name: 'showIcons',
        type: 'boolean',
        label: 'Olay İkonları',
        defaultValue: true,
        description: 'Her olay için ikon gösterilsin mi?',
      },
    ],
  },
};
