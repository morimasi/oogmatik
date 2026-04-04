import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type AlgebraBalanceAIResult = {
  title: string;
  equations: { left: string; right: string; variable: string; solution: number }[];
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

function detectCategory(_topic: string): 'science' | 'math' | 'language' | 'social' | 'general' {
  return 'math' as const;
}

export async function generateInfographic_ALGEBRA_BALANCE_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DENKLEM DENGE',
    params,
    '1. Basit cebir denklemleri oluştur\n2. Her denklem için denge görseli tanımla\n3. Çözüm adımlarını göster\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için denklem çözme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      equations: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            left: { type: 'STRING' },
            right: { type: 'STRING' },
            variable: { type: 'STRING' },
            solution: { type: 'NUMBER' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as AlgebraBalanceAIResult;
  return {
    title: result.title || `${params.topic} - Denklem Denge`,
    content: {
      steps: (result.equations || []).map((eq, i) => ({
        stepNumber: i + 1,
        label: `${eq.left} = ${eq.right}`,
        description: `Değişken: ${eq.variable}, Çözüm: ${eq.solution}`,
        isCheckpoint: i === 0,
        scaffoldHint: `${eq.variable} = ${eq.solution}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Denklem denge infografiği, disleksi desteğine ihtiyacı olan öğrenciler için cebirsel düşünceyi somutlaştırarak soyut matematik kavramlarını anlaşılır kılar. Terazi metaforu ile denklemin iki tarafının eşitliği görselleştirildiğinde, disleksi desteğine ihtiyacı olan öğrenciler değişken kavramını daha kolay içselleştirir. Bu görsel-yapılandırılmış yaklaşım, diskalkuli desteğine ihtiyacı olan öğrenciler için de matematiksel eşitlik algısını güçlendirir ve işlem yapma güvenini artırır.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Denklem çözme', 'Eşitlik algısı', 'Cebirsel düşünme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_ALGEBRA_BALANCE_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const equations = [
    { left: 'x + 3', right: '7', variable: 'x', solution: 4 },
    { left: '2x', right: '10', variable: 'x', solution: 5 },
    { left: 'x - 2', right: '8', variable: 'x', solution: 10 },
    { left: '3x + 1', right: '16', variable: 'x', solution: 5 },
  ];

  const categoryDescriptions: Record<string, string> = {
    math: 'Denklem denge infografiği, disleksi desteğine ihtiyacı olan öğrenciler için cebirsel düşünceyi somutlaştıran temel bir matematik aracıdır. Terazi metaforu ile eşitlik kavramı görselleştirildiğinde, soyut değişkenler anlaşılır hale gelir. Disleksi desteğine ihtiyacı olan öğrenciler, görsel düzen içinde denklem çözme adımlarını takip ederek matematiksel güven kazanırlar.',
    science:
      'Bilimsel denklemlerde denge kavramı önemlidir. Disleksi desteğine ihtiyacı olan öğrenciler için denklem denge görseli, fizik ve kimya formüllerini anlamada yardımcı olur.',
    language:
      'Dilbilgisinde denge kavramı cümle yapısı ile ilişkilidir. Disleksi desteğine ihtiyacı olan öğrenciler için denklem denge mantığı, cümle bileşenlerini anlamada kullanılabilir.',
    social:
      'Sosyal bilimlerde denge kavramı ekonomik ve toplumsal ilişkilerde görülür. Disleksi desteğine ihtiyacı olan öğrenciler için denklem denge mantığı, bu ilişkileri somutlaştırır.',
    general:
      'Denklem denge infografiği, disleksi desteğine ihtiyacı olan öğrenciler için temel matematik becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Denklem Denge`,
    content: {
      steps: equations.map((eq, i) => ({
        stepNumber: i + 1,
        label: `${eq.left} = ${eq.right}`,
        description: `Değişken: ${eq.variable}, Çözüm: ${eq.solution}`,
        isCheckpoint: i === 0,
        scaffoldHint: `${eq.variable} = ${eq.solution}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Denklem çözme', 'Eşitlik algısı', 'Cebirsel düşünme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_ALGEBRA_BALANCE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_ALGEBRA_BALANCE,
  aiGenerator: generateInfographic_ALGEBRA_BALANCE_AI,
  offlineGenerator: generateInfographic_ALGEBRA_BALANCE_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'equationCount',
        type: 'number',
        label: 'Denklem Sayısı',
        defaultValue: 4,
        description: 'Kaç denklem gösterilsin?',
      },
      {
        name: 'showBalance',
        type: 'boolean',
        label: 'Denge Görseli',
        defaultValue: true,
        description: 'Terazi görseli ile denge gösterilsin mi?',
      },
    ],
  },
};
