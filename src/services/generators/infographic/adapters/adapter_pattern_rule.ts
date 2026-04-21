import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type PatternRuleAIResult = {
  title: string;
  patterns: { sequence: string; rule: string; next: string }[];
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
  const mathTerms = ['sayı', 'desen', 'dizi', 'örüntü'];
  const languageTerms = ['harf', 'kelime', 'ses'];
  if (mathTerms.some((term) => topic.toLowerCase().includes(term))) return 'math' as const;
  if (languageTerms.some((term) => topic.toLowerCase().includes(term))) return 'language' as const;
  return 'general' as const;
}

export async function generateInfographic_PATTERN_RULE_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ÖRÜNTÜ KURALI',
    params,
    '1. Sayısal veya görsel örüntüler oluştur\n2. Her örüntünün kuralını açıkla\n3. Devamını bulma soruları ekle'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      patterns: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            sequence: { type: 'STRING' },
            rule: { type: 'STRING' },
            next: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as PatternRuleAIResult;
  return {
    title: result.title || `${params.topic} - Örüntü Kuralı`,
    content: {
      steps: (result.patterns || []).map((pattern, i) => ({
        stepNumber: i + 1,
        label: `Örüntü ${i + 1}: ${pattern.sequence}`,
        description: `Kural: ${pattern.rule}. Devamı: ${pattern.next}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Kural: ${pattern.rule}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Örüntü tanıma', 'Kural bulma', 'Tahmin yapma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_PATTERN_RULE_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const patterns = [
    { sequence: '2, 4, 6, 8, ...', rule: 'Her adımda 2 ekle', next: '10' },
    { sequence: '1, 3, 5, 7, ...', rule: 'Her adımda 2 ekle (tek sayılar)', next: '9' },
    { sequence: '5, 10, 15, 20, ...', rule: 'Her adımda 5 ekle', next: '25' },
    { sequence: '100, 90, 80, 70, ...', rule: 'Her adımda 10 çıkar', next: '60' },
  ];

  const categoryDescriptions: Record<string, string> = {
    math: 'Örüntü kuralı keşfi, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünce ve düzen algısı geliştiren temel bir etkinlik alanıdır. Tekrarlayan sayısal desenleri tanımak, cebirsel düşünme becerilerinin temelini oluşturur. Disleksi desteğine ihtiyacı olan öğrenciler, görsel düzenleme ile örüntü kurallarını daha kolay kavrar ve bu beceri ileri matematik öğreniminde kritik rol oynar.',
    science:
      'Doğadaki örüntüler bilimsel gözlem için önemlidir. Disleksi desteğine ihtiyacı olan öğrenciler için örüntü tanıma, doğadaki düzenleri fark etmelerine yardımcı olur.',
    language:
      'Dildeki örüntüler (ekler, hece yapıları) dilbilgisi öğrenimini destekler. Disleksi desteğine ihtiyacı olan öğrenciler için kelime örüntülerini tanımak okuma becerisini geliştirir.',
    social:
      'Toplumsal olaylarda örüntüler gözlemlenebilir. Disleksi desteğine ihtiyacı olan öğrenciler için örüntü tanıma becerisi, tarihsel tekrarları anlamada yardımcı olur.',
    general:
      'Örüntü kuralı keşfi, disleksi desteğine ihtiyacı olan öğrenciler için genel düşünme becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Örüntü Kuralı`,
    content: {
      steps: patterns.map((pattern, i) => ({
        stepNumber: i + 1,
        label: `Örüntü ${i + 1}: ${pattern.sequence}`,
        description: `Kural: ${pattern.rule}. Devamı: ${pattern.next}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Kural: ${pattern.rule}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Örüntü tanıma', 'Kural bulma', 'Tahmin yapma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_PATTERN_RULE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_PATTERN_RULE,
  aiGenerator: generateInfographic_PATTERN_RULE_AI,
  offlineGenerator: generateInfographic_PATTERN_RULE_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'patternCount',
        type: 'number',
        label: 'Örüntü Sayısı',
        defaultValue: 4,
        description: 'Kaç örüntü gösterilsin?',
      },
      {
        name: 'patternType',
        type: 'enum',
        label: 'Örüntü Türü',
        defaultValue: 'numeric',
        options: ['numeric', 'visual', 'mixed'],
        description: 'Sayısal, görsel veya karışık örüntü mü?',
      },
    ],
  },
};
