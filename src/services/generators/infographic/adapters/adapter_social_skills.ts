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
    '1. Sosyal becerileri listele\n2. Her beceri için açıklama ve örnek belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için sosyal beceri geliştirme stratejileri (min 100 kelime)'
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
      pedagogicalNote: { type: 'STRING' },
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
    pedagogicalNote:
      result.pedagogicalNote ||
      'Sosyal beceriler infografiği, disleksi desteğine ihtiyacı olan öğrenciler için akran ilişkileri ve sosyal etkileşim becerilerini geliştirmede görsel bir rehber sunar. Disleksi desteğine ihtiyacı olan öğrenciler, akademik zorluklar nedeniyle sosyal izolasyon ve akran zorbalığı riskiyle karşı karşıyadır. Görsel sosyal beceri kartları ve rol oynama senaryoları, disleksi desteğine ihtiyacı olan öğrencilerin sosyal ipuçlarını okuma ve uygun yanıtlar verme becerilerini geliştirir. Empati, sıra bekleme ve çatışma çözme gibi temel sosyal becerilerin görsel olarak modellenmesi, disleksi desteğine ihtiyacı olan öğrencilerin sosyal ortamda daha güvenli hissetmelerini sağlar.',
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

  const categoryDescriptions: Record<string, string> = {
    science:
      'Sosyal beceriler infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri grup deneylerinde iş birliği yapma becerilerini geliştirir. Deney gruplarında rol paylaşımı ve iletişim, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel öğrenme süreçlerinde aktif katılım göstermelerini sağlar.',
    math: 'Sosyal beceriler infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik grup çalışmalarında iş birliği yapma becerilerini destekler. Matematik problemlerini birlikte çözme, disleksi desteğine ihtiyacı olan öğrenclerin akran öğrenmesi deneyimlerini zenginleştirir.',
    language:
      'Sosyal beceriler infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma grupları ve tartışma etkinliklerinde iletişim becerilerini geliştirir. Hikaye tartışmalarında fikir paylaşma ve dinleme becerileri, disleksi desteğine ihtiyacı olan öğrenclerin dil gelişimini sosyal bağlamda destekler.',
    social:
      'Sosyal beceriler infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler dersindeki grup projeleri ve tartışmalarda etkili iletişim kurma becerilerini geliştirir. Toplumsal konuları tartışma ve farklı görüşlere saygı gösterme, disleksi desteğine ihtiyacı olan öğrenclerin vatandaşlık becerilerini güçlendirir.',
    general:
      'Sosyal beceriler infografiği, disleksi desteğine ihtiyacı olan öğrenciler için akran ilişkileri ve sosyal etkileşim becerilerini geliştirmede görsel bir rehber sunar. Disleksi desteğine ihtiyacı olan öğrenciler, akademik zorluklar nedeniyle sosyal izolasyon ve akran zorbalığı riskiyle karşı karşıyadır. Görsel sosyal beceri kartları ve rol oynama senaryoları, disleksi desteğine ihtiyacı olan öğrencilerin sosyal ipuçlarını okuma ve uygun yanıtlar verme becerilerini geliştirir. Empati, sıra bekleme ve çatışma çözme gibi temel sosyal becerilerin görsel olarak modellenmesi, disleksi desteğine ihtiyacı olan öğrencilerin sosyal ortamda daha güvenli hissetmelerini sağlar.',
  };

  return {
    title: `${params.topic} - Sosyal Beceriler`,
    content: {
      steps: skills.map((s, i) => ({
        stepNumber: i + 1,
        label: s.name,
        description: s.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Örnek: ${s.example}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
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
