import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type DyscalculiaMathAIResult = {
  title: string;
  strategies: { name: string; description: string; visual: string }[];
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

export async function generateInfographic_DYSCALCULIA_MATH_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DİSKALKULİ MATEMATİK DESTEĞİ',
    params,
    '1. Diskalkuli için matematik destek stratejilerini listele\n2. Her strateji için açıklama ve görsel destek belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için matematik destek stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      strategies: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            description: { type: 'STRING' },
            visual: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as DyscalculiaMathAIResult;
  return {
    title: result.title || `${params.topic} - Diskalkuli Matematik Desteği`,
    content: {
      steps: (result.strategies || []).map((s, i) => ({
        stepNumber: i + 1,
        label: s.name,
        description: s.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Görsel: ${s.visual}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Diskalkuli matematik desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sayısal kavramları anlamada ve matematiksel işlemleri yapmada görsel ve somut stratejiler sunan kritik bir araçtır. Disleksi desteğine ihtiyacı olan öğrenciler, sayı büyüklüğü, sıralama ve temel işlemler konusunda zorluk yaşayabilirler. Görsel manipülatifler, sayı doğruları ve renk kodlu matematik şablonları, disleksi desteğine ihtiyacı olan öğrencilerin soyut matematiksel kavramları somut olarak algılamalarını sağlar. Çoklu duyusal matematik öğretimi, disleksi desteğine ihtiyacı olan öğrencilerin matematik kaygısını azaltır ve sayısal düşünce becerilerini kademeli olarak geliştirir.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Sayı algısı', 'Temel işlemler', 'Görsel matematik', 'Problem çözme'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: 'dyscalculia',
  };
}

export function generateInfographic_DYSCALCULIA_MATH_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const strategies = [
    {
      name: 'Sayı Doğrusu',
      description: 'Sayıları görsel doğru üzerinde gösterme',
      visual: 'Renkli sayı doğrusu',
    },
    {
      name: 'Somut Materyal',
      description: 'Bloklar ve boncuklarla sayı kavramı',
      visual: 'Renkli bloklar',
    },
    {
      name: 'Renk Kodlu İşlemler',
      description: 'Her işlem için farklı renk kullanma',
      visual: 'Renkli işlem kartları',
    },
    {
      name: 'Görsel Problem Çözme',
      description: 'Problemleri resimlerle modelleme',
      visual: 'Adım adım resimli çözüm',
    },
    {
      name: 'Çarpım Tablosu Deseni',
      description: 'Çarpım tablosunda desenleri keşfetme',
      visual: 'Renkli çarpım tablosu',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Diskalkuli matematik desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri ölçüm ve veri analiz süreçlerinde matematiksel becerileri destekler. Deney sonuçlarını sayısal olarak ifade etme ve grafiklere dökme konularında disleksi desteğine ihtiyacı olan öğrenciler, görsel matematik araçları ile daha güvenli çalışabilirler.',
    math: 'Diskalkuli matematik desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik öğrenme süreçlerinde temel bir rehberdir. Sayısal kavramları somut materyaller ve görsel desteklerle öğrenmek, disleksi desteğine ihtiyacı olan öğrencilerin matematiksel düşünce becerilerini kademeli olarak geliştirmelerini sağlar. Renk kodlu işlemler ve sayı doğruları, disleksi desteğine ihtiyacı olan öğrencilerin matematik kaygısını azaltır.',
    language:
      'Diskalkuli matematik desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik problem metinlerini anlama ve sayısal bilgileri çıkarma becerilerini destekler. Kelime problemlerindeki sayısal bilgileri görsel olarak temsil etmek, disleksi desteğine ihtiyacı olan öğrencilerin matematik dilini daha iyi anlamalarını sağlar.',
    social:
      'Diskalkuli matematik desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler dersindeki sayısal verileri (nüfus, tarih, istatistik) anlamada yardımcı olur. Grafik ve tablo okuma becerilerini görsel stratejilerle desteklemek, disleksi desteğine ihtiyacı olan öğrencilerin sayısal verileri yorumlama güvenini artırır.',
    general:
      'Diskalkuli matematik desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sayısal kavramları anlamada ve matematiksel işlemleri yapmada görsel ve somut stratejiler sunan kritik bir araçtır. Disleksi desteğine ihtiyacı olan öğrenciler, sayı büyüklüğü, sıralama ve temel işlemler konusunda zorluk yaşayabilirler. Görsel manipülatifler, sayı doğruları ve renk kodlu matematik şablonları, disleksi desteğine ihtiyacı olan öğrencilerin soyut matematiksel kavramları somut olarak algılamalarını sağlar. Çoklu duyusal matematik öğretimi, disleksi desteğine ihtiyacı olan öğrencilerin matematik kaygısını azaltır ve sayısal düşünce becerilerini kademeli olarak geliştirir.',
  };

  return {
    title: `${params.topic} - Diskalkuli Matematik Desteği`,
    content: {
      steps: strategies.map((s, i) => ({
        stepNumber: i + 1,
        label: s.name,
        description: s.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Görsel: ${s.visual}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Sayı algısı', 'Temel işlemler', 'Görsel matematik', 'Problem çözme'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: 'dyscalculia',
  };
}

export const INFOGRAPHIC_DYSCALCULIA_MATH: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_DYSCALCULIA_MATH,
  aiGenerator: generateInfographic_DYSCALCULIA_MATH_AI,
  offlineGenerator: generateInfographic_DYSCALCULIA_MATH_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'mathLevel',
        type: 'enum',
        label: 'Matematik Seviyesi',
        defaultValue: 'temel',
        options: ['temel', 'orta', 'ileri'],
        description: 'Öğrencinin matematik seviyesi',
      },
      {
        name: 'showManipulatives',
        type: 'boolean',
        label: 'Somut Materyal Göster',
        defaultValue: true,
        description: 'Somut materyal önerileri gösterilsin mi?',
      },
    ],
  },
};
