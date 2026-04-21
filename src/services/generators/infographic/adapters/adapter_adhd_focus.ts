import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type AdhdFocusAIResult = {
  title: string;
  techniques: { name: string; description: string; duration: string }[];
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

export async function generateInfographic_ADHD_FOCUS_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DEHB ODAKLANMA',
    params,
    '1. DEHB için odaklanma tekniklerini listele\n2. Her teknik için açıklama ve süre belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      techniques: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            description: { type: 'STRING' },
            duration: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as AdhdFocusAIResult;
  return {
    title: result.title || `${params.topic} - DEHB Odaklanma`,
    content: {
      steps: (result.techniques || []).map((t, i) => ({
        stepNumber: i + 1,
        label: t.name,
        description: t.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Süre: ${t.duration}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Odaklanma', 'Dikkat yönetimi', 'Görev tamamlama', 'Dürtü kontrolü'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: 'adhd',
  };
}

export function generateInfographic_ADHD_FOCUS_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const techniques = [
    {
      name: 'Pomodoro Tekniği',
      description: '25 dakika çalışma, 5 dakika mola',
      duration: '25 dk',
    },
    {
      name: 'Tek Görev Odaklanma',
      description: 'Aynı anda sadece bir göreve odaklanma',
      duration: '15 dk',
    },
    {
      name: 'Hareket Molası',
      description: 'Kısa fiziksel aktivite ile enerji atma',
      duration: '3 dk',
    },
    {
      name: 'Görsel Zamanlayıcı',
      description: 'Kalan süreyi görsel olarak takip etme',
      duration: 'Tüm süre',
    },
    {
      name: 'Çevre Düzenleme',
      description: 'Dikkat dağıtıcıları ortadan kaldırma',
      duration: 'Sürekli',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'DEHB odaklanma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri deney ve gözlem süreçlerinde dikkatlerini sürdürmelerinde yardımcı olur. Deney aşamalarını kısa odaklanma bloklarına bölmek, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel süreçleri takip etmelerini kolaylaştırır. Görsel zamanlayıcılar, disleksi desteğine ihtiyacı olan öğrencilerin deney süresini yönetmelerine ve gözlem görevlerini tamamlamalarına destek olur.',
    math: 'DEHB odaklanma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik problem çözme süreçlerinde odaklanmalarını sürdürmelerinde rehberlik eder. Matematik alıştırmalarını kısa seanslara bölmek, disleksi desteğine ihtiyacı olan öğrencilerin dikkatlerini korumalarını sağlar. Pomodoro tekniği ile matematik çalışmak, disleksi desteğine ihtiyacı olan öğrencilerin işlem hatalarını azaltır.',
    language:
      'DEHB odaklanma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma görevlerinde dikkatlerini sürdürmelerinde yapılandırılmış destek sunar. Okuma seanslarını kısa bölümlere ayırmak, disleksi desteğine ihtiyacı olan öğrencilerin metin takibini kolaylaştırır. Hareket molaları, disleksi desteğine ihtiyacı olan öğrencilerin okuma enerjisini yenilemelerine yardımcı olur.',
    social:
      'DEHB odaklanma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler araştırma ve proje görevlerinde odaklanmalarını sürdürmelerinde destek sağlar. Araştırma adımlarını kısa görevlere bölmek, disleksi desteğine ihtiyacı olan öğrencilerin büyük projeleri yönetilebilir parçalara ayırma becerilerini geliştirir.',
    general:
      'DEHB odaklanma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için dikkat sürelerini yönetme ve odaklanma becerilerini geliştirmede yapılandırılmış bir rehber sunar. Disleksi desteğine ihtiyacı olan öğrenciler, DEHB belirtileri ile birleştiğinde çift katmanlı zorluk yaşarlar. Kısa ve yoğun çalışma seansları, disleksi desteğine ihtiyacı olan öğrencilerin dikkatlerini korumalarını sağlar. Görsel zamanlayıcılar ve hareket molaları, disleksi desteğine ihtiyacı olan öğrencilerin enerji seviyelerini dengelemelerine yardımcı olur. Bu stratejiler, disleksi desteğine ihtiyacı olan öğrencilerin öğrenme ortamlarında daha başarılı olmalarını destekler.',
  };

  return {
    title: `${params.topic} - DEHB Odaklanma`,
    content: {
      steps: techniques.map((t, i) => ({
        stepNumber: i + 1,
        label: t.name,
        description: t.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Süre: ${t.duration}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Odaklanma', 'Dikkat yönetimi', 'Görev tamamlama', 'Dürtü kontrolü'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: 'adhd',
  };
}

export const INFOGRAPHIC_ADHD_FOCUS: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_ADHD_FOCUS,
  aiGenerator: generateInfographic_ADHD_FOCUS_AI,
  offlineGenerator: generateInfographic_ADHD_FOCUS_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'focusDuration',
        type: 'number',
        label: 'Odaklanma Süresi (dakika)',
        defaultValue: 15,
        description: 'Her odaklanma seansı kaç dakika olsun?',
      },
      {
        name: 'breakType',
        type: 'enum',
        label: 'Mola Türü',
        defaultValue: 'hareket',
        options: ['hareket', 'dinlenme', 'oyun'],
        description: 'Mola türü ne olsun?',
      },
    ],
  },
};
