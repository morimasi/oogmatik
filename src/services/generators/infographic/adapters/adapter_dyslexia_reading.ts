import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type DyslexiaReadingAIResult = {
  title: string;
  techniques: { name: string; description: string; example: string; difficulty: string }[];
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

export async function generateInfographic_DYSLEXIA_READING_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DİSLEKSİ OKUMA DESTEĞİ',
    params,
    '1. Disleksi dostu okuma tekniklerini listele\n2. Her teknik için açıklama, örnek ve zorluk seviyesi belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için okuma destek stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      techniques: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            description: { type: 'STRING' },
            example: { type: 'STRING' },
            difficulty: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as DyslexiaReadingAIResult;
  return {
    title: result.title || `${params.topic} - Disleksi Okuma Desteği`,
    content: {
      steps: (result.techniques || []).map((t, i) => ({
        stepNumber: i + 1,
        label: t.name,
        description: t.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Zorluk: ${t.difficulty} | Örnek: ${t.example}`,
      })),
      strategicContent: {
        strategyName: 'Disleksi Dostu Okuma',
        steps: (result.techniques || []).map((t) => t.name),
        useWhen: 'Okuma sırasında harf ve kelime karıştırma yaşandığında',
        benefits: (result.techniques || []).map((t) => t.description),
      },
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Disleksi okuma desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma güçlüğüyle başa çıkma stratejilerini görsel olarak sunan kritik bir araçtır. Disleksi desteğine ihtiyacı olan öğrenciler, harfleri ters okuma, atlama veya ekleme gibi zorluklar yaşarlar ve bu durum okuma akıcılığını olumsuz etkiler. Çoklu duyusal okuma teknikleri, disleksi desteğine ihtiyacı olan öğrencilerin görsel, işitsel ve dokunsal kanalları aynı anda kullanarak okuma becerilerini geliştirmelerini sağlar. Renkli overlay kullanımı, satır takibi ve heceleme stratejileri, disleksi desteğine ihtiyacı olan öğrencilerin okuma deneyimini olumlu yönde dönüştürür. Her öğrencinin farklı bir okuma profiline sahip olması, bireyselleştirilmiş yaklaşımın önemini vurgular.',
    layoutHints: {
      orientation: 'portrait',
      fontSize: 16,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Okuma akıcılığı', 'Harf tanıma', 'Heceleme', 'Kelime tanıma'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: 'dyslexia',
  };
}

export function generateInfographic_DYSLEXIA_READING_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const techniques = [
    {
      name: 'Renkli Overlay',
      description: 'Renkli filtre ile metin okuma',
      example: 'Mavi overlay ile okuma',
      difficulty: 'Kolay',
    },
    {
      name: 'Satır Takip Çubuğu',
      description: 'Okunan satırı işaretleyerek ilerleme',
      example: 'Cetvel ile satır takibi',
      difficulty: 'Kolay',
    },
    {
      name: 'Heceleme Stratejisi',
      description: 'Kelimeleri hecelere ayırarak okuma',
      example: 'ke-le-bek şeklinde okuma',
      difficulty: 'Orta',
    },
    {
      name: 'Parmakla Takip',
      description: 'Parmakla kelime kelime okuma',
      example: 'Her kelimeye parmakla dokunarak',
      difficulty: 'Kolay',
    },
    {
      name: 'Sesli Okuma Eşliği',
      description: 'Birisiyle birlikte sesli okuma',
      example: 'Öğretmen-öğrenci birlikte okuma',
      difficulty: 'Orta',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Disleksi okuma desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri metinlerini okumada karşılaşılan zorlukları aşmada yardımcı olur. Bilimsel terimler genellikle uzun ve unfamiliar olduğundan, disleksi desteğine ihtiyacı olan öğrenciler bu kelimeleri okumada ekstra zorluk yaşar. Heceleme stratejileri ve görsel destekler, disleksi desteğine ihtiyacı olan öğrencilerin fen metinlerini daha güvenle okumalarını sağlar.',
    math: 'Disleksi okuma desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik problem metinlerini anlamada destekleyici bir araç sunar. Matematik problemlerindeki sayılar ve terimler, disleksi desteğine ihtiyacı olan öğrenciler için karıştırılabilir. Görsel problem çözme şablonları, disleksi desteğine ihtiyacı olan öğrencilerin matematik metinlerini daha etkili işlemelerine yardımcı olur.',
    language:
      'Disleksi okuma desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma becerilerini geliştirmede temel bir rehberdir. Okuma güçlüğü çeken disleksi desteğine ihtiyacı olan öğrenciler, heceleme stratejileri ve çoklu duyusal tekniklerle okuma akıcılıklarını kademeli olarak artırabilirler. Renkli metinler ve geniş satır aralığı, disleksi desteğine ihtiyacı olan öğrencilerin okuma konforunu artırır.',
    social:
      'Disleksi okuma desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler metinlerini okumada rehberlik eder. Tarih ve coğrafya metinlerindeki uzun paragraflar, disleksi desteğine ihtiyacı olan öğrenciler için zorlayıcı olabilir. Kısa bölümlere ayırma ve görsel destek kullanma stratejileri, disleksi desteğine ihtiyacı olan öğrencilerin sosyal bilgiler metinlerini daha etkili okumalarını sağlar.',
    general:
      'Disleksi okuma desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma güçlüğüyle başa çıkma stratejilerini görsel olarak sunan kritik bir araçtır. Disleksi desteğine ihtiyacı olan öğrenciler, harfleri ters okuma, atlama veya ekleme gibi zorluklar yaşarlar ve bu durum okuma akıcılığını olumsuz etkiler. Çoklu duyusal okuma teknikleri, disleksi desteğine ihtiyacı olan öğrencilerin görsel, işitsel ve dokunsal kanalları aynı anda kullanarak okuma becerilerini geliştirmelerini sağlar. Renkli overlay kullanımı, satır takibi ve heceleme stratejileri, disleksi desteğine ihtiyacı olan öğrencilerin okuma deneyimini olumlu yönde dönüştürür. Her öğrencinin farklı bir okuma profiline sahip olması, bireyselleştirilmiş yaklaşımın önemini vurgular.',
  };

  return {
    title: `${params.topic} - Disleksi Okuma Desteği`,
    content: {
      steps: techniques.map((t, i) => ({
        stepNumber: i + 1,
        label: t.name,
        description: t.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Zorluk: ${t.difficulty} | Örnek: ${t.example}`,
      })),
      strategicContent: {
        strategyName: 'Disleksi Dostu Okuma',
        steps: techniques.map((t) => t.name),
        useWhen: 'Okuma sırasında harf ve kelime karıştırma yaşandığında',
        benefits: techniques.map((t) => t.description),
      },
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'portrait',
      fontSize: 16,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Okuma akıcılığı', 'Harf tanıma', 'Heceleme', 'Kelime tanıma'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: 'dyslexia',
  };
}

export const INFOGRAPHIC_DYSLEXIA_READING: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_DYSLEXIA_READING,
  aiGenerator: generateInfographic_DYSLEXIA_READING_AI,
  offlineGenerator: generateInfographic_DYSLEXIA_READING_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'readingLevel',
        type: 'enum',
        label: 'Okuma Seviyesi',
        defaultValue: 'basit',
        options: ['basit', 'orta', 'ileri'],
        description: 'Öğrencinin mevcut okuma seviyesi',
      },
      {
        name: 'showPhonics',
        type: 'boolean',
        label: 'Fonetik Destek Göster',
        defaultValue: true,
        description: 'Fonetik ipuçları gösterilsin mi?',
      },
    ],
  },
};
