import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type TestPreparationAIResult = {
  title: string;
  phases: { name: string; activities: string[]; duration: string; tips: string[] }[];
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

export async function generateInfographic_TEST_PREPARATION_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'SINAV HAZIRLIĞI',
    params,
    '1. Sınav hazırlık aşamalarını oluştur\n2. Her aşama için aktiviteler, süre ve ipuçları belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      phases: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            activities: { type: 'ARRAY', items: { type: 'STRING' } },
            duration: { type: 'STRING' },
            tips: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as TestPreparationAIResult;
  return {
    title: result.title || `${params.topic} - Sınav Hazırlığı`,
    content: {
      steps: (result.phases || []).flatMap((phase, pi) =>
        (phase.activities || []).map((activity, ai) => ({
          stepNumber: pi * 10 + ai + 1,
          label: `${phase.name}: ${activity}`,
          description: activity,
          isCheckpoint: ai === (phase.activities || []).length - 1,
          scaffoldHint: `Süre: ${phase.duration}`,
        }))
      ),
      strategicContent: {
        strategyName: 'Sınav Hazırlık Planı',
        steps: (result.phases || []).map((p) => p.name),
        useWhen: 'Sınav öncesi çalışma döneminde',
        benefits: (result.phases || []).map((p) => `${p.name}: ${p.duration}`),
      },
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Sınav stratejisi', 'Zaman yönetimi', 'Kaygı yönetimi', 'Teknik planlama'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_TEST_PREPARATION_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const phases = [
    {
      name: 'Konu Tekrarı',
      activities: ['Notları gözden geçir', 'Ana kavramları belirle', 'Eksik konuları tespit et'],
      duration: '1 hafta',
      tips: ['Renkli kalemler kullan', 'Kavram haritası oluştur'],
    },
    {
      name: 'Alıştırma Çözme',
      activities: ['Örnek sorular çöz', 'Zamanlı deneme yap', 'Yanlışları analiz et'],
      duration: '3 gün',
      tips: ['Zaman tutarak çöz', 'Hatalarını not al'],
    },
    {
      name: 'Son Tekrar',
      activities: ['Zayıf alanları tekrar et', 'Kısa özetler oku', 'Rahatla ve uyu'],
      duration: '1 gün',
      tips: ['Sınavdan önce iyi uyu', 'Kahvaltını yap'],
    },
  ];

        benefits: phases.map((p) => `${p.name}: ${p.duration}`),
      },
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Sınav stratejisi', 'Zaman yönetimi', 'Kaygı yönetimi', 'Teknik planlama'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_TEST_PREPARATION: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_TEST_PREPARATION,
  aiGenerator: generateInfographic_TEST_PREPARATION_AI,
  offlineGenerator: generateInfographic_TEST_PREPARATION_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'examType',
        type: 'enum',
        label: 'Sınav Türü',
        defaultValue: 'genel',
        options: ['genel', 'okuma', 'matematik', 'fen'],
        description: 'Hangi tür sınav için hazırlık?',
      },
      {
        name: 'prepDays',
        type: 'number',
        label: 'Hazırlık Süresi (gün)',
        defaultValue: 14,
        description: 'Sınava kaç gün var?',
      },
    ],
  },
};
