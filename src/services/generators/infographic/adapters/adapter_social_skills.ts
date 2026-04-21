import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type SocialSkillsAIResult = {
  title: string;
  skills: { name: string; description: string; example: string }[];
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

export async function generateInfographic_SOCIAL_SKILLS_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'SOSYAL BECERİLER',
    params,
    '1. Sosyal becerileri listele\n2. Her beceri için açıklama ve örnek belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      skills: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            description: { type: 'STRING' },
            example: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as SocialSkillsAIResult;
  return {
    title: result.title || `${params.topic} - Sosyal Beceriler`,
    content: {
      steps: (result.skills || []).map((s, i) => ({
        stepNumber: i + 1,
        label: s.name,
        description: s.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Örnek: ${s.example}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Empati', 'İletişim', 'Çatışma çözme', 'Sıra bekleme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SOCIAL_SKILLS_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const skills = [
    {
      name: 'Göz Teması',
      description: 'Konuşurken göz teması kurma',
      example: 'Karşındakinin gözlerine bak',
    },
    {
      name: 'Sıra Bekleme',
      description: 'Konuşma sırasını bekleme',
      example: 'El kaldır ve sıranı bekle',
    },
    {
      name: 'Empati',
      description: 'Başkasının duygularını anlama',
      example: 'Arkadaşın üzgünse yardım et',
    },
    {
      name: 'Çatışma Çözme',
      description: 'Sorunları konuşarak çözme',
      example: 'Hissetlerini söyle, çözüm öner',
    },
    {
      name: 'Grup Çalışması',
      description: 'Takım içinde iş birliği yapma',
      example: 'Görev paylaşımı yap',
    },
  ];

        scaffoldHint: `Örnek: ${s.example}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Empati', 'İletişim', 'Çatışma çözme', 'Sıra bekleme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SOCIAL_SKILLS: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SOCIAL_SKILLS,
  aiGenerator: generateInfographic_SOCIAL_SKILLS_AI,
  offlineGenerator: generateInfographic_SOCIAL_SKILLS_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'skillFocus',
        type: 'enum',
        label: 'Odaklanılacak Beceri',
        defaultValue: 'iletisim',
        options: ['iletisim', 'empati', 'catısma_cozme', 'grup_calismasi'],
        description: 'Hangi sosyal beceriye odaklanılsın?',
      },
      {
        name: 'showScenarios',
        type: 'boolean',
        label: 'Senaryoları Göster',
        defaultValue: true,
        description: 'Rol oynama senaryoları gösterilsin mi?',
      },
    ],
  },
};
