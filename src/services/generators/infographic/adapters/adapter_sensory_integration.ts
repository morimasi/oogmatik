import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type SensoryIntegrationAIResult = {
  title: string;
  activities: { name: string; type: string; description: string; duration: string }[];
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

export async function generateInfographic_SENSORY_INTEGRATION_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DUYUSAL BÜTÜNLEME',
    params,
    '1. Duyusal bütünleme aktivitelerini listele\n2. Her aktivite için tür, açıklama ve süre belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      activities: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            type: { type: 'STRING' },
            description: { type: 'STRING' },
            duration: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as SensoryIntegrationAIResult;
  return {
    title: result.title || `${params.topic} - Duyusal Bütünleme`,
    content: {
      steps: (result.activities || []).map((a, i) => ({
        stepNumber: i + 1,
        label: a.name,
        description: a.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Tür: ${a.type} | Süre: ${a.duration}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Duyusal düzenleme',
      'Dokunsal farkındalık',
      'Vestibüler işleme',
      'Propriosepsiyon',
    ],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SENSORY_INTEGRATION_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const activities = [
    {
      name: 'Hamur Etkinliği',
      type: 'Dokunsal',
      description: 'Hamur yoğurma ve şekil verme',
      duration: '10 dk',
    },
    {
      name: 'Salıncak',
      type: 'Vestibüler',
      description: 'İleri-geri salınma hareketi',
      duration: '5 dk',
    },
    {
      name: 'Ağırlık Taşıma',
      type: 'Proprioseptif',
      description: 'Hafif ağırlık taşıma aktivitesi',
      duration: '5 dk',
    },
    {
      name: 'Kum Oynama',
      type: 'Dokunsal',
      description: 'Kumda şekil çizme ve yazma',
      duration: '10 dk',
    },
    {
      name: 'Zıplama',
      type: 'Vestibüler',
      description: 'Yerinde zıplama ve ritmik hareket',
      duration: '3 dk',
    },
  ];

  return {
    title: `${params.topic} - Duyusal Bütünleme`,
    content: {
      steps: activities.map((a, i) => ({
        stepNumber: i + 1,
        label: a.name,
        description: a.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Tür: ${a.type} | Süre: ${a.duration}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Duyusal düzenleme',
      'Dokunsal farkındalık',
      'Vestibüler işleme',
      'Propriosepsiyon',
    ],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SENSORY_INTEGRATION: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SENSORY_INTEGRATION,
  aiGenerator: generateInfographic_SENSORY_INTEGRATION_AI,
  offlineGenerator: generateInfographic_SENSORY_INTEGRATION_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'sensoryType',
        type: 'enum',
        label: 'Duyusal Tür',
        defaultValue: 'dokunsal',
        options: ['dokunsal', 'vestibuler', 'proprioseptif'],
        description: 'Hangi duyusal sisteme odaklanılsın?',
      },
      {
        name: 'activityDuration',
        type: 'number',
        label: 'Aktivite Süresi (dakika)',
        defaultValue: 10,
        description: 'Her duyusal aktivite kaç dakika sürsün?',
      },
    ],
  },
};
