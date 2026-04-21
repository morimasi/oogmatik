import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type ScamperAIResult = {
  title: string;
  techniques: { letter: string; name: string; question: string; example: string }[];
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
  const scienceTerms = ['icat', 'keşif', 'deney'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  return 'general' as const;
}

export async function generateInfographic_SCAMPER_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'SCAMPER TEKNİĞİ',
    params,
    '1. SCAMPER tekniğinin 7 adımını konuya uygula\n2. Her adım için soru ve örnek oluştur\n3. Yaratıcı düşünce sürecini haritala'
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
            letter: { type: 'STRING' },
            name: { type: 'STRING' },
            question: { type: 'STRING' },
            example: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as ScamperAIResult;
  return {
    title: result.title || `${params.topic} - SCAMPER`,
    content: {
      steps: (result.techniques || []).map((tech, i) => ({
        stepNumber: i + 1,
        label: `${tech.letter} - ${tech.name}`,
        description: tech.question,
        isCheckpoint: i === 0,
        scaffoldHint: `Örnek: ${tech.example}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Yaratıcı problem çözme', 'Alternatif düşünme', 'Fikir geliştirme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SCAMPER_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const techniques = [
    {
      letter: 'S',
      name: 'Substitute (Değiştir)',
      question: 'Başka bir şey ile değiştirebilir miyim?',
      example: 'Kalem yerine boya fırçası kullanmak.',
    },
    {
      letter: 'C',
      name: 'Combine (Birleştir)',
      question: 'İki şeyi birleştirebilir miyim?',
      example: 'Kalem ve silgiyi birleştirmek.',
    },
    {
      letter: 'A',
      name: 'Adapt (Uyarla)',
      question: 'Başka bir yere uyarlayabilir miyim?',
      example: 'Oyun kurallarını sınıfa uyarlamak.',
    },
    {
      letter: 'M',
      name: 'Modify (Değiştir)',
      question: 'Boyutunu veya şeklini değiştirebilir miyim?',
      example: 'Defteri daha büyük yapmak.',
    },
    {
      letter: 'P',
      name: 'Put to other uses (Başka amaçla kullan)',
      question: 'Farklı bir amaçla kullanabilir miyim?',
      example: 'Kutuyu kalemlik olarak kullanmak.',
    },
    {
      letter: 'E',
      name: 'Eliminate (Çıkar)',
      question: 'Bir şeyi çıkarabilir miyim?',
      example: 'Gereksiz adımları atmak.',
    },
    {
      letter: 'R',
      name: 'Reverse (Tersine çevir)',
      question: 'Sırayı tersine çevirebilir miyim?',
      example: 'Önce sonucu bulup sonra soruyu yazmak.',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'SCAMPER tekniği, disleksi desteğine ihtiyacı olan öğrenciler için bilimsel problem çözme ve icat geliştirme becerilerini yapılandırılmış bir yaklaşımla destekleyen önemli bir fen bilimleri aracıdır. Her adımın somut örneklerle desteklenmesi, soyut yaratıcılık kavramlarını somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, adım adım ilerleyen SCAMPER yapısı sayesinde bilimsel fikir üretme sürecini daha kolay takip ederler.',
    math: 'Matematiksel problemlere SCAMPER uygulamak, disleksi desteğine ihtiyacı olan öğrenciler için farklı çözüm yollarını keşfetmelerini sağlar.',
    language:
      'Yazılı anlatımda SCAMPER kullanmak, disleksi desteğine ihtiyacı olan öğrenciler için yaratıcı yazma becerilerini geliştirir.',
    social:
      'Toplumsal sorunlara SCAMPER ile çözüm üretmek, disleksi desteğine ihtiyacı olan öğrenciler için yaratıcı vatandaşlık becerilerini destekler.',
    general:
      'SCAMPER tekniği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için yaratıcı problem çözme becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - SCAMPER`,
    content: {
      steps: techniques.map((tech, i) => ({
        stepNumber: i + 1,
        label: `${tech.letter} - ${tech.name}`,
        description: tech.question,
        isCheckpoint: i === 0,
        scaffoldHint: `Örnek: ${tech.example}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Yaratıcı problem çözme', 'Alternatif düşünme', 'Fikir geliştirme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SCAMPER: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SCAMPER,
  aiGenerator: generateInfographic_SCAMPER_AI,
  offlineGenerator: generateInfographic_SCAMPER_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'product',
        type: 'string',
        label: 'Ürün/Nesne',
        defaultValue: 'Okul Çantası',
        description: 'SCAMPER hangi ürün veya nesneye uygulansın?',
      },
      {
        name: 'showExamples',
        type: 'boolean',
        label: 'Örnekleri Göster',
        defaultValue: true,
        description: 'Her adım için somut örnek gösterilsin mi?',
      },
    ],
  },
};
