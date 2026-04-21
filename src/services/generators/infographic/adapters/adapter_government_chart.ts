import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type GovernmentChartAIResult = {
  title: string;
  branches: { name: string; role: string; members: string[] }[];
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
  return 'social' as const;
}

export async function generateInfographic_GOVERNMENT_CHART_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'YÖNETİM YAPISI',
    params,
    '1. Yönetim organlarını hiyerarşik olarak listele\n2. Her organın rolünü ve üyelerini belirt\n3. Görsel hiyerarşi ağacı oluştur'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      branches: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            role: { type: 'STRING' },
            members: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as GovernmentChartAIResult;
  return {
    title: result.title || `${params.topic} - Yönetim Yapısı`,
    content: {
      hierarchy: {
        label: 'Yönetim Yapısı',
        children: (result.branches || []).map((branch) => ({
          label: branch.name,
          description: branch.role,
          children: branch.members.map((m) => ({ label: m })),
        })),
      },
      steps: (result.branches || []).map((branch, i) => ({
        stepNumber: i + 1,
        label: branch.name,
        description: branch.role,
        isCheckpoint: i === 0,
        scaffoldHint: `Üyeler: ${branch.members.join(', ')}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Yönetim yapısını anlama', 'Vatandaşlık bilinci', 'Hiyerarşik düşünme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_GOVERNMENT_CHART_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const branches = [
    { name: 'Yasama', role: 'Kanun yapar.', members: ['Milletvekilleri', 'TBMM Başkanı'] },
    { name: 'Yürütme', role: 'Kanunları uygular.', members: ['Cumhurbaşkanı', 'Bakanlar'] },
    { name: 'Yargı', role: 'Kanunları yorumlar ve denetler.', members: ['Hakimler', 'Savcılar'] },
  ];

  const categoryDescriptions: Record<string, string> = {
    social:
      'Yönetim yapısı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için vatandaşlık bilgisi ve demokrasi kavramlarını görsel hiyerarşi ile anlamalarını sağlayan temel bir sosyal bilgiler aracıdır. Her yönetim organının rolü ve işlevi görsel olarak düzenlendiğinde, soyut siyasi kavramlar somutlaşır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve hiyerarşik düzenleme ile devlet yapısını daha kolay kavrar ve vatandaşlık bilinci geliştirirler.',
    math: 'Yönetim organlarındaki üye sayılarını hesaplamak, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi sosyal bilimler ile bağdaştırır.',
    language:
      'Yönetim terimlerini öğrenmek, disleksi desteğine ihtiyacı olan öğrenciler için vatandaşlık kelime dağarcığını geliştirir.',
    science:
      'Bilim politikası ve araştırma yönetimi, disleksi desteğine ihtiyacı olan öğrenciler için bilim ve yönetim ilişkisini anlamada yardımcı olur.',
    general:
      'Yönetim yapısı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için vatandaşlık bilgisi geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Yönetim Yapısı`,
    content: {
      hierarchy: {
        label: 'Yönetim Yapısı',
        children: branches.map((branch) => ({
          label: branch.name,
          description: branch.role,
          children: branch.members.map((m) => ({ label: m })),
        })),
      },
      steps: branches.map((branch, i) => ({
        stepNumber: i + 1,
        label: branch.name,
        description: branch.role,
        isCheckpoint: i === 0,
        scaffoldHint: `Üyeler: ${branch.members.join(', ')}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Yönetim yapısını anlama', 'Vatandaşlık bilinci', 'Hiyerarşik düşünme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_GOVERNMENT_CHART: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_GOVERNMENT_CHART,
  aiGenerator: generateInfographic_GOVERNMENT_CHART_AI,
  offlineGenerator: generateInfographic_GOVERNMENT_CHART_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'governmentType',
        type: 'string',
        label: 'Yönetim Türü',
        defaultValue: 'Cumhuriyet',
        description: 'Hangi yönetim türü gösterilsin?',
      },
      {
        name: 'showMembers',
        type: 'boolean',
        label: 'Üyeleri Göster',
        defaultValue: true,
        description: 'Her organın üyeleri gösterilsin mi?',
      },
    ],
  },
};
