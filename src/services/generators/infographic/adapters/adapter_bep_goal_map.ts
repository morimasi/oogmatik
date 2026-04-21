import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type BepGoalMapAIResult = {
  title: string;
  goals: { domain: string; objective: string; indicator: string; timeline: string }[];
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

export async function generateInfographic_BEP_GOAL_MAP_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'BEP HEDEF HARİTASI',
    params,
    '1. BEP hedeflerini SMART formatında oluştur\n2. Her hedef için alan, amaç, gösterge ve zaman çizelgesi belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      goals: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            domain: { type: 'STRING' },
            objective: { type: 'STRING' },
            indicator: { type: 'STRING' },
            timeline: { type: 'STRING' },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as BepGoalMapAIResult;
  return {
    title: result.title || `${params.topic} - BEP Hedef Haritası`,
    content: {
      bepGoals: (result.goals || []).map((g) => ({
        domain: g.domain,
        objective: g.objective,
        targetDate: g.timeline,
        measurableIndicator: g.indicator,
        supportStrategies: ['Bireyselleştirilmiş destek', 'Görsel materyal'],
        progress: 'not_started' as const,
      })),
      steps: (result.goals || []).map((g, i) => ({
        stepNumber: i + 1,
        label: `${g.domain}: ${g.objective}`,
        description: g.objective,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Gösterge: ${g.indicator}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['BEP planlama', 'Hedef belirleme', 'İlerleme takibi', 'MEB uyumu'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_BEP_GOAL_MAP_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const goals = [
    {
      domain: 'Okuma',
      objective: 'Heceleyerek okuma becerisi kazanır',
      indicator: 'Dakikada 30 hece okur',
      timeline: '3 ay',
    },
    {
      domain: 'Yazma',
      objective: 'Basit cümleler yazar',
      indicator: '5 cümlelik paragraf yazar',
      timeline: '3 ay',
    },
    {
      domain: 'Matematik',
      objective: 'Toplama ve çıkarma işlemlerini yapar',
      indicator: '20 içinde işlem yapar',
      timeline: '2 ay',
    },
    {
      domain: 'Sosyal Beceri',
      objective: 'Grup çalışmalarına katılır',
      indicator: 'Haftada 2 grup etkinliği',
      timeline: '1 ay',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'BEP hedef haritası infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri öğrenme hedeflerini bireyselleştirilmiş eğitim planına entegre etmede yardımcı olur. Fen bilimleri BEP hedefleri, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel kavramları görsel ve somut materyallerle öğrenmelerini sağlayacak şekilde yapılandırılmalıdır.',
    math: 'BEP hedef haritası infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik öğrenme hedeflerini BEP kapsamında yapılandırmada rehberlik eder. Matematik BEP hedefleri, disleksi desteğine ihtiyacı olan öğrencilerin sayısal becerilerini kademeli olarak geliştirmelerini sağlayacak şekilde SMART formatında yazılmalıdır.',
    language:
      'BEP hedef haritası infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma hedeflerini BEP kapsamında yapılandırmada temel bir araçtır. Okuma ve yazma BEP hedefleri, disleksi desteğine ihtiyacı olan öğrencilerin dil becerilerini bireysel ihtiyaçlarına uygun şekilde geliştirmelerini sağlar.',
    social:
      'BEP hedef haritası infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler ve sosyal beceri hedeflerini BEP kapsamında organize etmede destek sağlar. Sosyal BEP hedefleri, disleksi desteğine ihtiyacı olan öğrencilerin toplumsal katılım becerilerini geliştirmelerini hedefler.',
    general:
      'BEP hedef haritası infografiği, disleksi desteğine ihtiyacı olan öğrenciler için bireyselleştirilmiş eğitim planının hedeflerini görsel olarak yapılandırmada kritik bir araçtır. MEB Özel Eğitim Yönetmeliği kapsamında hazırlanan BEP, disleksi desteğine ihtiyacı olan öğrencilerin öğrenme ihtiyaçlarına uygun hedefler belirlemelerini sağlar. SMART formatında yazılmış hedefler, disleksi desteğine ihtiyacı olan öğrencilerin ilerlemelerini ölçülebilir şekilde takip etmelerine olanak tanır. Her hedef alanının görsel olarak haritalanması, disleksi desteğine ihtiyacı olan öğrencilerin eğitim sürecini bütünsel olarak görmelerini ve öğretmen-veli iş birliğini güçlendirmesini sağlar.',
  };

  return {
    title: `${params.topic} - BEP Hedef Haritası`,
    content: {
      bepGoals: goals.map((g) => ({
        domain: g.domain,
        objective: g.objective,
        targetDate: g.timeline,
        measurableIndicator: g.indicator,
        supportStrategies: ['Bireyselleştirilmiş destek', 'Görsel materyal'],
        progress: 'not_started' as const,
      })),
      steps: goals.map((g, i) => ({
        stepNumber: i + 1,
        label: `${g.domain}: ${g.objective}`,
        description: g.objective,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Gösterge: ${g.indicator}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['BEP planlama', 'Hedef belirleme', 'İlerleme takibi', 'MEB uyumu'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_BEP_GOAL_MAP: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_BEP_GOAL_MAP,
  aiGenerator: generateInfographic_BEP_GOAL_MAP_AI,
  offlineGenerator: generateInfographic_BEP_GOAL_MAP_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'domainCount',
        type: 'number',
        label: 'Hedef Alanı Sayısı',
        defaultValue: 4,
        description: 'Kaç BEP hedef alanı belirlensin?',
      },
      {
        name: 'reviewPeriod',
        type: 'enum',
        label: 'Gözden Geçirme Dönemi',
        defaultValue: 'aylik',
        options: ['haftalik', 'aylik', 'donemlik'],
        description: 'BEP hedefleri ne sıklıkla gözden geçirilsin?',
      },
    ],
  },
};
