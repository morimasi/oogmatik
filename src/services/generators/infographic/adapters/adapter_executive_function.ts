import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type ExecutiveFunctionAIResult = {
  title: string;
  skills: { name: string; description: string; activity: string }[];
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

export async function generateInfographic_EXECUTIVE_FUNCTION_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'YÜRÜTÜCÜ İŞLEVLER',
    params,
    '1. Yürütücü işlev becerilerini listele\n2. Her beceri için açıklama ve geliştirme aktivitesi belirt'
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
            activity: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as ExecutiveFunctionAIResult;
  return {
    title: result.title || `${params.topic} - Yürütücü İşlevler`,
    content: {
      steps: (result.skills || []).map((s, i) => ({
        stepNumber: i + 1,
        label: s.name,
        description: s.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Aktivite: ${s.activity}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Planlama', 'Organizasyon', 'Çalışma belleği', 'Bilişsel esneklik'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_EXECUTIVE_FUNCTION_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const skills = [
    {
      name: 'Planlama',
      description: 'Görevleri önceden planlama becerisi',
      activity: 'Günlük plan oluşturma',
    },
    {
      name: 'Organizasyon',
      description: 'Materyal ve bilgileri düzenleme',
      activity: 'Renkli klasör sistemi',
    },
    {
      name: 'Çalışma Belleği',
      description: 'Bilgiyi kısa süreli tutma ve işleme',
      activity: 'Sayı tekrarı oyunu',
    },
    {
      name: 'Bilişsel Esneklik',
      description: 'Farklı perspektiflerden düşünme',
      activity: 'Alternatif çözüm bulma',
    },
    {
      name: 'Dürtü Kontrolü',
      description: 'Düşünmeden hareket etmeme',
      activity: 'Dur-düşün-yap egzersizi',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Yürütücü işlevler infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri deney süreçlerini planlama ve organize etmede rehberlik eder. Deney adımlarını sıralama ve sonuçları organize etme, disleksi desteğine ihtiyacı olan öğrencilerin yürütücü işlev becerilerini fen bağlamında geliştirmelerini sağlar.',
    math: 'Yürütücü işlevler infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik problem çözme süreçlerinde planlama ve organizasyon becerilerini destekler. Çok adımlı matematik problemlerini organize etmek, disleksi desteğine ihtiyacı olan öğrencilerin yürütücü işlev becerilerini matematiksel düşünce ile entegre etmelerini sağlar.',
    language:
      'Yürütücü işlevler infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma süreçlerinde organizasyon ve planlama becerilerini geliştirir. Yazma görevlerini planlama ve okuma stratejilerini organize etme, disleksi desteğine ihtiyacı olan öğrencilerin dil becerilerini yürütücü işlev destekleriyle güçlendirir.',
    social:
      'Yürütücü işlevler infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler proje ve araştırma süreçlerini organize etmede yapılandırılmış destek sunar. Araştırma planı oluşturma ve bilgi organize etme, disleksi desteğine ihtiyacı olan öğrencilerin yürütücü işlev becerilerini sosyal bağlamda geliştirmelerini sağlar.',
    general:
      'Yürütücü işlevler infografiği, disleksi desteğine ihtiyacı olan öğrenciler için planlama, organize etme, çalışma belleği ve bilişsel esneklik gibi temel becerileri geliştirmede kapsamlı bir rehber sunar. Disleksi desteğine ihtiyacı olan öğrenciler, yürütücü işlev zorlukları sıklıkla eşlik eder ve bu durum akademik performansı önemli ölçüde etkiler. Görsel planlama araçları, adım adım talimatlar ve rutin yapıları, disleksi desteğine ihtiyacı olan öğrencilerin yürütücü işlev becerilerini sistematik olarak geliştirmelerini sağlar. Her yürütücü işlev becerisinin ayrı ayrı ele alınması, disleksi desteğine ihtiyacı olan öğrencilerin güçlü ve zayıf alanlarını belirlemelerine yardımcı olur.',
  };

  return {
    title: `${params.topic} - Yürütücü İşlevler`,
    content: {
      steps: skills.map((s, i) => ({
        stepNumber: i + 1,
        label: s.name,
        description: s.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Aktivite: ${s.activity}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Planlama', 'Organizasyon', 'Çalışma belleği', 'Bilişsel esneklik'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_EXECUTIVE_FUNCTION: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_EXECUTIVE_FUNCTION,
  aiGenerator: generateInfographic_EXECUTIVE_FUNCTION_AI,
  offlineGenerator: generateInfographic_EXECUTIVE_FUNCTION_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'skillFocus',
        type: 'enum',
        label: 'Odaklanılacak Beceri',
        defaultValue: 'planlama',
        options: ['planlama', 'organizasyon', 'calisma_belleği', 'bilesnel_esneklik'],
        description: 'Hangi yürütücü işlev becerisine odaklanılsın?',
      },
      {
        name: 'showActivities',
        type: 'boolean',
        label: 'Aktiviteleri Göster',
        defaultValue: true,
        description: 'Her beceri için geliştirme aktiviteleri gösterilsin mi?',
      },
    ],
  },
};
