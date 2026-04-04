import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type AssociationsAIResult = {
  title: string;
  centralWord: string;
  associations: { word: string; connection: string; strength: number }[];
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
  const languageTerms = ['kelime', 'anlam', 'eş anlamlı', 'zıt'];
  if (languageTerms.some((term) => topic.toLowerCase().includes(term))) return 'language' as const;
  return 'general' as const;
}

export async function generateInfographic_ASSOCIATIONS_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ÇAĞRIŞIMLAR',
    params,
    '1. Ana kelimeyi belirle\n2. Çağrışım kelimelerini ve bağlantılarını listele\n3. Güç derecelerini belirt\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için çağrışım öğrenme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      centralWord: { type: 'STRING' },
      associations: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING' },
            connection: { type: 'STRING' },
            strength: { type: 'NUMBER' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as AssociationsAIResult;
  return {
    title: result.title || `${params.topic} - Çağrışımlar`,
    content: {
      hierarchy: {
        label: result.centralWord || params.topic,
        children: (result.associations || []).map((assoc) => ({
          label: assoc.word,
          description: assoc.connection,
        })),
      },
      steps: (result.associations || []).map((assoc, i) => ({
        stepNumber: i + 1,
        label: assoc.word,
        description: assoc.connection,
        isCheckpoint: i === 0,
        scaffoldHint: `Güç: ${assoc.strength}/10`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Çağrışım infografiği, disleksi desteğine ihtiyacı olan öğrenciler için kelime dağarcığı ve anlamsal ağ oluşturma becerilerini geliştiren önemli bir dil öğrenme aracıdır. Ana kelimeden dallanan çağrışım kelimelerinin görsel olarak düzenlenmesi, soyut anlamsal ilişkileri somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve görsel hiyerarşi ile kelimeler arasındaki anlamsal bağları daha kolay kavrar ve okuma anlama becerilerini geliştirirler.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kelime dağarcığı', 'Anlamsal ilişki kurma', 'Çağrışım yapma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_ASSOCIATIONS_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const associations = [
    { word: 'Güneş', connection: 'Isı ve ışık kaynağı', strength: 9 },
    { word: 'Yaz', connection: 'Mevim ilişkisi', strength: 8 },
    { word: 'Sarı', connection: 'Renk ilişkisi', strength: 7 },
    { word: 'Gündüz', connection: 'Zaman ilişkisi', strength: 8 },
    { word: 'Enerji', connection: 'Fonksiyon ilişkisi', strength: 6 },
  ];

  const categoryDescriptions: Record<string, string> = {
    language:
      'Çağrışım infografiği, disleksi desteğine ihtiyacı olan öğrenciler için kelime dağarcığı ve anlamsal ağ oluşturma becerilerini geliştiren temel bir dil öğrenme aracıdır. Ana kelimeden dallanan çağrışım kelimelerinin görsel olarak düzenlenmesi, soyut anlamsal ilişkileri somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve görsel hiyerarşi ile kelimeler arasındaki anlamsal bağları daha kolay kavrar ve okuma anlama becerilerini geliştirirler.',
    math: 'Çağrışım kelimelerinin güç derecelerini karşılaştırmak, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi dil ile bağdaştırır.',
    science:
      'Bilimsel kavramlar arası çağrışımlar, disleksi desteğine ihtiyacı olan öğrenciler için kavramsal öğrenmeyi destekler.',
    social:
      'Toplumsal kavramlar arası çağrışımlar, disleksi desteğine ihtiyacı olan öğrenciler için sosyal farkındalık geliştirir.',
    general:
      'Çağrışım infografiği, disleksi desteğine ihtiyacı olan öğrenciler için anlamsal düşünme becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Çağrışımlar`,
    content: {
      hierarchy: {
        label: params.topic,
        children: associations.map((assoc) => ({
          label: assoc.word,
          description: assoc.connection,
        })),
      },
      steps: associations.map((assoc, i) => ({
        stepNumber: i + 1,
        label: assoc.word,
        description: assoc.connection,
        isCheckpoint: i === 0,
        scaffoldHint: `Güç: ${assoc.strength}/10`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Kelime dağarcığı', 'Anlamsal ilişki kurma', 'Çağrışım yapma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_ASSOCIATIONS: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_ASSOCIATIONS,
  aiGenerator: generateInfographic_ASSOCIATIONS_AI,
  offlineGenerator: generateInfographic_ASSOCIATIONS_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'centralWord',
        type: 'string',
        label: 'Ana Kelime',
        defaultValue: 'Su',
        description: 'Hangi kelimenin çağrışımları oluşturulsun?',
      },
      {
        name: 'showStrength',
        type: 'boolean',
        label: 'Güç Derecesini Göster',
        defaultValue: true,
        description: 'Çağrışım güç dereceleri gösterilsin mi?',
      },
    ],
  },
};
