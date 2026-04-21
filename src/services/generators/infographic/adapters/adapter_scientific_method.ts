import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type ScientificMethodAIResult = {
  title: string;
  steps: { step: string; description: string; example: string }[];
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
  const scienceTerms = ['deney', 'hipotez', 'gözlem', 'sonuç'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  return 'general' as const;
}

export async function generateInfographic_SCIENTIFIC_METHOD_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'BİLİMSEL YÖNTEM',
    params,
    '1. Bilimsel yöntem adımlarını belirle\n2. Her adımı örnekle açıkla\n3. Görsel sembollerle destekle'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      steps: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            step: { type: 'STRING' },
            description: { type: 'STRING' },
            example: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as ScientificMethodAIResult;
  return {
    title: result.title || `${params.topic} - Bilimsel Yöntem`,
    content: {
      steps: (result.steps || []).map((step, i) => ({
        stepNumber: i + 1,
        label: `Adım ${i + 1}: ${step.step}`,
        description: step.description,
        isCheckpoint: i === 0 || i === (result.steps || []).length - 1,
        scaffoldHint: `Örnek: ${step.example}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Bilimsel düşünme', 'Hipotez kurma', 'Sistematik gözlem'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SCIENTIFIC_METHOD_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const steps = [
    {
      step: 'Soru Sor',
      description: 'Merak ettiğin bir soru belirle.',
      example: 'Bitkiler ışık olmadan büyür mü?',
    },
    {
      step: 'Hipotez Kur',
      description: 'Soruya tahmini bir cevap ver.',
      example: 'Bitkiler ışık olmadan büyümez.',
    },
    {
      step: 'Deney Yap',
      description: 'Hipotezini test etmek için deney tasarla.',
      example: 'Işıklı ve ışıksız iki bitki yetiştir.',
    },
    {
      step: 'Gözlem Yap',
      description: 'Deney sonuçlarını kaydet.',
      example: 'Her gün bitkilerin boyunu ölç.',
    },
    {
      step: 'Sonuç Çıkar',
      description: 'Verileri analiz edip hipotezini değerlendir.',
      example: 'Işık alan bitki daha uzun büyüdü.',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Bilimsel yöntem infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sistematik düşünme ve problem çözme becerilerini geliştiren temel bir fen bilimleri aracıdır. Her adımın görsel sembollerle ve somut örneklerle desteklenmesi, soyut bilimsel süreçleri anlaşılır kılar. Disleksi desteğine ihtiyacı olan öğrenciler, yapılandırılmış bilimsel yöntem adımlarını takip ederek eleştirel düşünme becerilerini geliştirirler.',
    math: 'Bilimsel yöntemde veri analizi matematiksel beceriler gerektirir. Disleksi desteğine ihtiyacı olan öğrenciler için deney sonuçlarını grafik ve tablo ile yorumlamak, matematiksel okuryazarlığı geliştirir.',
    language:
      'Bilimsel yöntemi anlatmak, disleksi desteğine ihtiyacı olan öğrenciler için sıralı anlatım ve bilimsel kelime dağarcığını geliştirir.',
    social:
      'Bilimsel düşünce toplumsal sorunların çözümünde önemlidir. Disleksi desteğine ihtiyacı olan öğrenciler için bilimsel yöntem, kanıta dayalı karar verme becerisini destekler.',
    general:
      'Bilimsel yöntem infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sistematik düşünme becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Bilimsel Yöntem`,
    content: {
      steps: steps.map((step, i) => ({
        stepNumber: i + 1,
        label: `Adım ${i + 1}: ${step.step}`,
        description: step.description,
        isCheckpoint: i === 0 || i === steps.length - 1,
        scaffoldHint: `Örnek: ${step.example}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Bilimsel düşünme', 'Hipotez kurma', 'Sistematik gözlem'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SCIENTIFIC_METHOD: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SCIENTIFIC_METHOD,
  aiGenerator: generateInfographic_SCIENTIFIC_METHOD_AI,
  offlineGenerator: generateInfographic_SCIENTIFIC_METHOD_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'experimentTopic',
        type: 'string',
        label: 'Deney Konusu',
        defaultValue: 'Bitki Büyümesi',
        description: 'Hangi deney konusu kullanılsın?',
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
