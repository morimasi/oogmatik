import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type AccommodationListAIResult = {
  title: string;
  accommodations: { category: string; item: string; implementation: string }[];
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

export async function generateInfographic_ACCOMMODATION_LIST_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'UYARLAMA LİSTESİ',
    params,
    '1. Sınıf içi uyarlama listesini oluştur\n2. Her uyarlama için kategori, madde ve uygulama bilgisi belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      accommodations: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            category: { type: 'STRING' },
            item: { type: 'STRING' },
            implementation: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as AccommodationListAIResult;
  return {
    title: result.title || `${params.topic} - Uyarlama Listesi`,
    content: {
      steps: (result.accommodations || []).map((a, i) => ({
        stepNumber: i + 1,
        label: `${a.category}: ${a.item}`,
        description: a.item,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Uygulama: ${a.implementation}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Uyarlama planlama', 'Erişilebilirlik', 'MEB uyumu', 'Adil değerlendirme'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_ACCOMMODATION_LIST_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const accommodations = [
    {
      category: 'Sınav',
      item: 'Ek süre (%50)',
      implementation: 'Sınav süresine ek 30 dakika ekle',
    },
    {
      category: 'Materyal',
      item: 'Büyük punto metin',
      implementation: '14 punto Lexend font kullan',
    },
    { category: 'Sunum', item: 'Okuyucu desteği', implementation: 'Soruları sesli oku' },
    {
      category: 'Yanıt',
      item: 'Sözlü yanıt seçeneği',
      implementation: 'Yazılı yerine sözlü cevap al',
    },
    { category: 'Çevre', item: 'Sessiz ortam', implementation: 'Ayrı sınıfta sınav uygula' },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Uyarlama listesi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri dersinde ve sınavlarında gerekli uyarlamaları planlamada yardımcı olur. Fen bilimleri sınavlarında bilimsel terimlerin okunması ve deney raporlarının yazılması, disleksi desteğine ihtiyacı olan öğrenciler için ek uyarlama gerektirebilir. Görsel destekli fen materyalleri ve alternatif değerlendirme yöntemleri, disleksi desteğine ihtiyacı olan öğrencilerin fen bilgisini adil şekilde göstermelerini sağlar.',
    math: 'Uyarlama listesi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik dersinde ve sınavlarında gerekli uyarlamaları planlamada rehberlik eder. Matematik problemlerinin okunması ve çözüm süreçlerinin yazılması, disleksi desteğine ihtiyacı olan öğrenciler için ek uyarlama gerektirebilir. Hesap makinesi kullanımı ve görsel problem çözme şablonları, disleksi desteğine ihtiyacı olan öğrencilerin matematik becerilerini adil şekilde göstermelerini sağlar.',
    language:
      'Uyarlama listesi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma derslerinde gerekli uyarlamaları planlamada temel bir araçtır. Okuma sınavlarında ek süre, yazma görevlerinde yazım denetimi ve alternatif değerlendirme yöntemleri, disleksi desteğine ihtiyacı olan öğrencilerin dil becerilerini adil şekilde göstermelerini sağlar.',
    social:
      'Uyarlama listesi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler dersinde ve sınavlarında gerekli uyarlamaları planlamada destek sağlar. Uzun metinlerin özetlenmesi ve görsel destekli materyaller, disleksi desteğine ihtiyacı olan öğrencilerin sosyal bilgiler bilgisini adil şekilde göstermelerini sağlar.',
    general:
      'Uyarlama listesi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sınıf içi ve sınav uyarlamalarını sistematik olarak planlama ve uygulama rehberi sunar. MEB Özel Eğitim Yönetmeliği kapsamında disleksi desteğine ihtiyacı olan öğrencilere sağlanan uyarlamalar, öğrenme erişimini eşitlemeyi hedefler. Ek süre, okuyucu desteği, büyük punto materyaller ve alternatif değerlendirme yöntemleri, disleksi desteğine ihtiyacı olan öğrencilerin bilgi ve becerilerini adil şekilde göstermelerini sağlar. Her uyarlamanın somut olarak tanımlanması ve uygulama detaylarının belirtilmesi, disleksi desteğine ihtiyacı olan öğrencilere tutarlı destek sağlanmasını garanti eder.',
  };

  return {
    title: `${params.topic} - Uyarlama Listesi`,
    content: {
      steps: accommodations.map((a, i) => ({
        stepNumber: i + 1,
        label: `${a.category}: ${a.item}`,
        description: a.item,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Uygulama: ${a.implementation}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Uyarlama planlama', 'Erişilebilirlik', 'MEB uyumu', 'Adil değerlendirme'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_ACCOMMODATION_LIST: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_ACCOMMODATION_LIST,
  aiGenerator: generateInfographic_ACCOMMODATION_LIST_AI,
  offlineGenerator: generateInfographic_ACCOMMODATION_LIST_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'accommodationType',
        type: 'enum',
        label: 'Uyarlama Türü',
        defaultValue: 'sinav',
        options: ['sinav', 'materyal', 'cevre', 'degerlendirme'],
        description: 'Hangi tür uyarlama planlansın?',
      },
      {
        name: 'showImplementation',
        type: 'boolean',
        label: 'Uygulama Detayları',
        defaultValue: true,
        description: 'Her uyarlama için uygulama detayları gösterilsin mi?',
      },
    ],
  },
};
