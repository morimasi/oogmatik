import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type GenreChartAIResult = {
  title: string;
  genres: { name: string; features: string[]; example: string }[];
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

export async function generateInfographic_GenreChart_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'TÜR GRAFİĞİ',
    params,
    '1. Konuya uygun 4 edebi tür seç\n2. Her türün özelliklerini ve örneğini yaz\n3. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      genres: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            features: { type: 'ARRAY', items: { type: 'STRING' } },
            example: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as GenreChartAIResult;
  return {
    title: result.title || `${params.topic} - Tür Grafiği`,
    content: {
      hierarchy: {
        label: 'Edebi Türler',
        description: 'Ana konu',
        children: (result.genres || []).map((g) => ({
          label: g.name,
          description: g.features.join(', '),
        })),
      },
    },
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Edebi türler', 'Sınıflandırma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_GenreChart_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const genresMap: Record<string, { name: string; features: string[]; example: string }[]> = {
    language: [
      {
        name: 'Şiir',
        features: ['Dize yapısı', 'Kafiye', 'Duygu yoğunluğu', 'Ölçü'],
        example: 'Saffet Kemal Şiirleri',
      },
      {
        name: 'Hikaye',
        features: ['Olay örgüsü', 'Karakter', 'Mekan', 'Kısa anlatı'],
        example: 'Sait Faik Hikayeleri',
      },
      {
        name: 'Roman',
        features: ['Uzun anlatı', 'Çoklu karakter', 'Detaylı mekan', 'Geniş zaman'],
        example: 'Tutunamayanlar',
      },
      {
        name: 'Masal',
        features: ['Hayal ürünü', 'Olağanüstü olaylar', 'İyi-kötü çatışması', 'Mutlu son'],
        example: 'Keloğlan Masalları',
      },
    ],
    science: [
      {
        name: 'Bilimsel Makale',
        features: ['Hipotez', 'Deney', 'Sonuç', 'Kaynakça'],
        example: 'Fen Bilimleri Dergisi',
      },
      {
        name: 'Deney Raporu',
        features: ['Amaç', 'Yöntem', 'Bulgular', 'Yorum'],
        example: 'Laboratuvar Raporu',
      },
      {
        name: 'Ansiklopedi',
        features: ['Tanım', 'Açıklama', 'Görsel', 'Kaynak'],
        example: 'Bilim Ansiklopedisi',
      },
      {
        name: 'Gözlem Günlüğü',
        features: ['Tarih', 'Gözlem', 'Notlar', 'Sonuç'],
        example: 'Doğa Gözlem Günlüğü',
      },
    ],
    math: [
      {
        name: 'Problem Çözümü',
        features: ['Soru', 'Çözüm yolu', 'İşlem', 'Sonuç'],
        example: 'Matematik Problemleri',
      },
      {
        name: 'Formül Kitabı',
        features: ['Tanım', 'Formül', 'Açıklama', 'Örnek'],
        example: 'Geometri Formülleri',
      },
      {
        name: 'İspat',
        features: ['Önerme', 'Kanıt', 'Sonuç', 'Genelleme'],
        example: 'Pisagor İspatı',
      },
      {
        name: 'Alıştırma',
        features: ['Soru', 'Boşluk', 'Cevap', 'Kontrol'],
        example: 'Toplama Alıştırmaları',
      },
    ],
    social: [
      {
        name: 'Tarihi Roman',
        features: ['Gerçek olaylar', 'Kurgusal karakter', 'Dönem detayı', 'Olay örgüsü'],
        example: 'Kürk Mantolu Madonna',
      },
      {
        name: 'Biyografi',
        features: ['Gerçek yaşam', 'Kronolojik sıra', 'Olaylar', 'Başarılar'],
        example: 'Atatürk Biyografisi',
      },
      {
        name: 'Gezi Yazısı',
        features: ['Mekan betimleme', 'Gözlemler', 'İzlenimler', 'Kültür'],
        example: 'Anadolu Gezi Notları',
      },
      {
        name: 'Makale',
        features: ['Tez', 'Argüman', 'Kanıt', 'Sonuç'],
        example: 'Toplum ve Eğitim Makalesi',
      },
    ],
    general: [
      {
        name: 'Şiir',
        features: ['Dize yapısı', 'Kafiye', 'Duygu yoğunluğu', 'Ölçü'],
        example: 'Saffet Kemal Şiirleri',
      },
      {
        name: 'Hikaye',
        features: ['Olay örgüsü', 'Karakter', 'Mekan', 'Kısa anlatı'],
        example: 'Sait Faik Hikayeleri',
      },
      {
        name: 'Roman',
        features: ['Uzun anlatı', 'Çoklu karakter', 'Detaylı mekan', 'Geniş zaman'],
        example: 'Tutunamayanlar',
      },
      {
        name: 'Masal',
        features: ['Hayal ürünü', 'Olağanüstü olaylar', 'İyi-kötü çatışması', 'Mutlu son'],
        example: 'Keloğlan Masalları',
      },
    ],
  };
  const genres = genresMap[category] || genresMap.general;
  return {
    title: `${params.topic} - Tür Grafiği`,
    content: {
      hierarchy: {
        label: 'Edebi Türler',
        description: 'Ana konu',
        children: genres.map((g) => ({
          label: g.name,
          description: g.features.join(', '),
        })),
      },
    },
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Edebi türler', 'Sınıflandırma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_GENRE_CHART: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_GENRE_CHART,
  aiGenerator: generateInfographic_GenreChart_AI,
  offlineGenerator: generateInfographic_GenreChart_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'genreCount',
        type: 'number',
        label: 'Tür Sayısı',
        defaultValue: 4,
        description: 'Kaç edebi tür gösterilsin?',
      },
      {
        name: 'showExamples',
        type: 'boolean',
        label: 'Örnekler',
        defaultValue: true,
        description: 'Her tür için örnek eser gösterilsin mi?',
      },
    ],
  },
};
