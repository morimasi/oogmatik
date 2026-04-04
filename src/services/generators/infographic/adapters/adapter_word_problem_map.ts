import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type WordProblemMapAIResult = {
  title: string;
  problems: { problem: string; steps: string[]; solution: string }[];
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
  const mathTerms = ['toplam', 'fiyat', 'mesafe', 'hız'];
  const scienceTerms = ['deney', 'bitki', 'hayvan'];
  if (mathTerms.some((term) => topic.toLowerCase().includes(term))) return 'math' as const;
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  return 'general' as const;
}

export async function generateInfographic_WORD_PROBLEM_MAP_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'PROBLEM ÇÖZME HARİTASI',
    params,
    '1. Yaşa uygun sözel problemler oluştur\n2. Her problem için çözüm adımlarını haritala\n3. Görsel ipuçları ekle\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için sözel problem çözme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      problems: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            problem: { type: 'STRING' },
            steps: { type: 'ARRAY', items: { type: 'STRING' } },
            solution: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as WordProblemMapAIResult;
  return {
    title: result.title || `${params.topic} - Problem Çözme Haritası`,
    content: {
      steps: (result.problems || []).flatMap((prob, i) =>
        prob.steps.map((step, j) => ({
          stepNumber: i * 10 + j + 1,
          label: `Problem ${i + 1} - Adım ${j + 1}`,
          description: step,
          isCheckpoint: j === 0,
          scaffoldHint: `Çözüm: ${prob.solution}`,
        }))
      ),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Sözel problem çözme haritası, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi günlük yaşam bağlamında somutlaştıran önemli bir öğrenme aracıdır. Uzun metinleri parçalara ayırmak ve her adımı görsel olarak haritalamak, disleksi desteğine ihtiyacı olan öğrencilerin problem içindeki önemli bilgileri tespit etmesini kolaylaştırır. Bu yapılandırılmış yaklaşım, okuduğunu anlama ve matematiksel işlem becerilerini aynı anda geliştirirken öğrencilerin problem çözme özgüvenini artırır.',
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Problem çözme', 'Okuduğunu anlama', 'Adımlı düşünme'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_WORD_PROBLEM_MAP_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const problems = [
    {
      problem: "Ali'nin 12 elması var. 5 tanesini arkadaşına verdi. Kaç elması kaldı?",
      steps: [
        'Verilenleri belirle: 12 elma',
        'İstenen: Kalan elma sayısı',
        'İşlem: 12 - 5',
        'Sonuç: 7 elma',
      ],
      solution: '7 elma',
    },
    {
      problem: 'Bir kalem 3 TL. 4 kalem alırsak kaç TL öderiz?',
      steps: [
        'Verilenleri belirle: 1 kalem = 3 TL',
        'İstenen: 4 kalem fiyatı',
        'İşlem: 3 × 4',
        'Sonuç: 12 TL',
      ],
      solution: '12 TL',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    math: 'Sözel problem çözme haritası, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi günlük yaşam bağlamında somutlaştıran temel bir öğrenme aracıdır. Uzun metinleri parçalara ayırmak ve her adımı görsel olarak haritalamak, disleksi desteğine ihtiyacı olan öğrencilerin problem içindeki önemli bilgileri tespit etmesini kolaylaştırır. Bu yapılandırılmış yaklaşım, okuduğunu anlama ve matematiksel işlem becerilerini aynı anda geliştirir.',
    science:
      'Bilimsel problemleri adım adım çözmek, disleksi desteğine ihtiyacı olan öğrenciler için deney sonuçlarını yorumlamada yardımcı olur.',
    language:
      'Sözel problemler dil becerilerini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için problem metinlerini parçalara ayırmak okuduğunu anlamayı kolaylaştırır.',
    social:
      'Günlük yaşam problemleri sosyal becerileri destekler. Disleksi desteğine ihtiyacı olan öğrenciler için pratik problem çözme, yaşam becerilerini geliştirir.',
    general:
      'Problem çözme haritası, disleksi desteğine ihtiyacı olan öğrenciler için genel düşünme becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Problem Çözme Haritası`,
    content: {
      steps: problems.flatMap((prob, i) =>
        prob.steps.map((step, j) => ({
          stepNumber: i * 10 + j + 1,
          label: `Problem ${i + 1} - Adım ${j + 1}`,
          description: step,
          isCheckpoint: j === 0,
          scaffoldHint: `Çözüm: ${prob.solution}`,
        }))
      ),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Problem çözme', 'Okuduğunu anlama', 'Adımlı düşünme'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_WORD_PROBLEM_MAP: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_WORD_PROBLEM_MAP,
  aiGenerator: generateInfographic_WORD_PROBLEM_MAP_AI,
  offlineGenerator: generateInfographic_WORD_PROBLEM_MAP_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'problemCount',
        type: 'number',
        label: 'Problem Sayısı',
        defaultValue: 3,
        description: 'Kaç sözel problem gösterilsin?',
      },
      {
        name: 'showSteps',
        type: 'boolean',
        label: 'Adımları Göster',
        defaultValue: true,
        description: 'Çözüm adımları detaylı gösterilsin mi?',
      },
    ],
  },
};
