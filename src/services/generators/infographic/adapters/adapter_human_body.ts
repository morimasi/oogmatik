import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type HumanBodyAIResult = {
  title: string;
  systems: { name: string; organs: string[]; function: string }[];
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
  return 'science' as const;
}

export async function generateInfographic_HUMAN_BODY_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'İNSAN VÜCUDU',
    params,
    '1. İnsan vücudu sistemlerini listele\n2. Her sistemin organlarını ve işlevini belirt\n3. Görsel konum bilgisi ekle'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      systems: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            organs: { type: 'ARRAY', items: { type: 'STRING' } },
            function: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as HumanBodyAIResult;
  return {
    title: result.title || `${params.topic} - İnsan Vücudu`,
    content: {
      scienceData: {
        topic: params.topic,
        components: (result.systems || []).map((s) => s.name),
        properties: Object.fromEntries((result.systems || []).map((s) => [s.name, s.function])),
      },
      steps: (result.systems || []).map((system, i) => ({
        stepNumber: i + 1,
        label: system.name,
        description: `${system.function}. Organlar: ${system.organs.join(', ')}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Organlar: ${system.organs.join(', ')}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Vücut sistemlerini tanıma', 'Organ işlevleri', 'Sağlık bilinci'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_HUMAN_BODY_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const systems = [
    {
      name: 'Sindirim Sistemi',
      organs: ['Ağız', 'Mide', 'Bağırsaklar'],
      function: 'Besinleri sindirir ve enerjiye dönüştürür.',
    },
    {
      name: 'Solunum Sistemi',
      organs: ['Burun', 'Boğaz', 'Akciğerler'],
      function: 'Oksijen alıp karbondioksit verir.',
    },
    {
      name: 'Dolaşım Sistemi',
      organs: ['Kalp', 'Damarlar', 'Kan'],
      function: 'Kan pompalayarak besin ve oksijen taşır.',
    },
    {
      name: 'Sinir Sistemi',
      organs: ['Beyin', 'Omurilik', 'Sinirler'],
      function: 'Vücudu yönetir ve koordinasyonu sağlar.',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'İnsan vücudu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için biyolojik sistemleri görsel ve etiketli olarak anlamalarını sağlayan temel bir fen bilimleri aracıdır. Her sistemin organları ve işlevleri görsel olarak eşleştirildiğinde, soyut anatomik kavramlar somutlaşır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve görsel düzenleme ile vücut sistemlerini daha kolay öğrenirler.',
    math: 'Vücut ölçümleri (boy, kilo, nabız) disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi biyoloji ile bağdaştırır.',
    language:
      'Vücut sistemi isimlerini öğrenmek, disleksi desteğine ihtiyacı olan öğrenciler için bilimsel kelime dağarcığını geliştirir.',
    social:
      'İnsan vücudu bilgisi sağlık okuryazarlığı için temeldir. Disleksi desteğine ihtiyacı olan öğrenciler için bedenlerini tanımak, sağlıklı yaşam alışkanlıklarını destekler.',
    general:
      'İnsan vücudu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için biyolojik yapıları anlamada önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - İnsan Vücudu`,
    content: {
      scienceData: {
        topic: params.topic,
        components: systems.map((s) => s.name),
        properties: Object.fromEntries(systems.map((s) => [s.name, s.function])),
      },
      steps: systems.map((system, i) => ({
        stepNumber: i + 1,
        label: system.name,
        description: `${system.function}. Organlar: ${system.organs.join(', ')}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Organlar: ${system.organs.join(', ')}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Vücut sistemlerini tanıma', 'Organ işlevleri', 'Sağlık bilinci'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_HUMAN_BODY: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_HUMAN_BODY,
  aiGenerator: generateInfographic_HUMAN_BODY_AI,
  offlineGenerator: generateInfographic_HUMAN_BODY_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'systemCount',
        type: 'number',
        label: 'Sistem Sayısı',
        defaultValue: 4,
        description: 'Kaç vücut sistemi gösterilsin?',
      },
      {
        name: 'showOrgans',
        type: 'boolean',
        label: 'Organları Göster',
        defaultValue: true,
        description: 'Her sistemin organları detaylı gösterilsin mi?',
      },
    ],
  },
};
