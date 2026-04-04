import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type AlternativeEndsAIResult = {
  title: string;
  originalEnd: string;
  alternatives: { ending: string; consequence: string; lesson: string }[];
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
  const languageTerms = ['hikaye', 'masal', 'öykü', 'kitap'];
  if (languageTerms.some((term) => topic.toLowerCase().includes(term))) return 'language' as const;
  return 'general' as const;
}

export async function generateInfographic_ALTERNATIVE_ENDS_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ALTERNATİF SONLAR',
    params,
    '1. Hikayenin orijinal sonunu belirt\n2. En az 3 alternatif son oluştur\n3. Her sonun sonuçlarını ve dersini açıkla\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için alternatif sonlar öğrenme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      originalEnd: { type: 'STRING' },
      alternatives: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            ending: { type: 'STRING' },
            consequence: { type: 'STRING' },
            lesson: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as AlternativeEndsAIResult;
  return {
    title: result.title || `${params.topic} - Alternatif Sonlar`,
    content: {
      steps: (result.alternatives || []).map((alt, i) => ({
        stepNumber: i + 1,
        label: `Alternatif ${i + 1}`,
        description: alt.ending,
        isCheckpoint: i === 0,
        scaffoldHint: `Sonuç: ${alt.consequence}. Ders: ${alt.lesson}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Alternatif sonlar infografiği, disleksi desteğine ihtiyacı olan öğrenciler için yaratıcı yazma ve eleştirel düşünme becerilerini geliştiren önemli bir dil öğrenme aracıdır. Bir hikayenin farklı sonlarını keşfetmek, disleksi desteğine ihtiyacı olan öğrencilerin nedensellik ilişkilerini anlamalarını ve hayal güçlerini kullanmalarını sağlar. Her alternatif sonun sonuçları ve dersleri görsel olarak düzenlendiğinde, soyut anlatı kavramları somutlaşır ve öğrencilerin yaratıcı ifade özgüveni artar.',
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Yaratıcı yazma', 'Nedensellik düşünme', 'Hayal gücü geliştirme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_ALTERNATIVE_ENDS_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const alternatives = [
    {
      ending: 'Kaplumbağa yarışı kazanır.',
      consequence: 'Herkes azmin önemini anlar.',
      lesson: 'Yavaş ama kararlı olmak başar getirir.',
    },
    {
      ending: 'Tavşan ve kaplumbağa birlikte bitiş çizgisine varır.',
      consequence: 'İkisi de arkadaş olur.',
      lesson: 'İşbirliği rekabetten değerlidir.',
    },
    {
      ending: 'Yarış yağmur nedeniyle iptal edilir.',
      consequence: 'Herkes eve gider, başka gün yarışılır.',
      lesson: 'Doğa koşulları planları değiştirebilir.',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    language:
      'Alternatif sonlar infografiği, disleksi desteğine ihtiyacı olan öğrenciler için yaratıcı yazma ve eleştirel düşünme becerilerini geliştiren temel bir dil öğrenme aracıdır. Bir hikayenin farklı sonlarını keşfetmek, disleksi desteğine ihtiyacı olan öğrencilerin nedensellik ilişkilerini anlamalarını ve hayal güçlerini kullanmalarını sağlar. Her alternatif sonun sonuçları ve dersleri görsel olarak düzenlendiğinde, soyut anlatı kavramları somutlaşır ve öğrencilerin yaratıcı ifade özgüveni artar.',
    math: 'Alternatif senaryoların olasılıklarını hesaplamak, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi hikaye anlatımı ile bağdaştırır.',
    science:
      'Bilimsel deneylerde alternatif sonuçları düşünmek, disleksi desteğine ihtiyacı olan öğrenciler için hipotez test etme becerisini geliştirir.',
    social:
      'Tarihsel olaylara alternatif sonlar düşünmek, disleksi desteğine ihtiyacı olan öğrenciler için "ya şöyle olsaydı" düşünce becerisini destekler.',
    general:
      'Alternatif sonlar infografiği, disleksi desteğine ihtiyacı olan öğrenciler için yaratıcı düşünme becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Alternatif Sonlar`,
    content: {
      steps: alternatives.map((alt, i) => ({
        stepNumber: i + 1,
        label: `Alternatif ${i + 1}`,
        description: alt.ending,
        isCheckpoint: i === 0,
        scaffoldHint: `Sonuç: ${alt.consequence}. Ders: ${alt.lesson}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Yaratıcı yazma', 'Nedensellik düşünme', 'Hayal gücü geliştirme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_ALTERNATIVE_ENDS: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_ALTERNATIVE_ENDS,
  aiGenerator: generateInfographic_ALTERNATIVE_ENDS_AI,
  offlineGenerator: generateInfographic_ALTERNATIVE_ENDS_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'storyName',
        type: 'string',
        label: 'Hikaye Adı',
        defaultValue: 'Tavşan ve Kaplumbağa',
        description: 'Hangi hikayenin alternatif sonları oluşturulsun?',
      },
      {
        name: 'altCount',
        type: 'number',
        label: 'Alternatif Sayısı',
        defaultValue: 3,
        description: 'Kaç alternatif son oluşturulsun?',
      },
    ],
  },
};
