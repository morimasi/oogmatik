import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type GoalSettingAIResult = {
  title: string;
  goals: { name: string; steps: string[]; deadline: string; successIndicator: string }[];
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

export async function generateInfographic_GOAL_SETTING_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'HEDEF BELİRLEME',
    params,
    '1. SMART formatında hedefler oluştur\n2. Her hedef için adımları, süreyi ve başarı göstergesini belirt'
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
            name: { type: 'STRING' },
            steps: { type: 'ARRAY', items: { type: 'STRING' } },
            deadline: { type: 'STRING' },
            successIndicator: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as GoalSettingAIResult;
  return {
    title: result.title || `${params.topic} - Hedef Belirleme`,
    content: {
      steps: (result.goals || []).flatMap((goal, gi) =>
        (goal.steps || []).map((step, si) => ({
          stepNumber: gi * 10 + si + 1,
          label: `${goal.name}: ${step}`,
          description: step,
          isCheckpoint: si === (goal.steps || []).length - 1,
          scaffoldHint: `Süre: ${goal.deadline}`,
        }))
      ),
      bepGoals: (result.goals || []).map((goal) => ({
        domain: goal.name,
        objective: goal.steps.join(', '),
        targetDate: goal.deadline,
        measurableIndicator: goal.successIndicator,
        supportStrategies: ['Görsel destek', 'Adım adım ilerleme'],
        progress: 'not_started' as const,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Hedef belirleme', 'Planlama', 'Öz düzenleme', 'İlerleme takibi'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_GOAL_SETTING_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const goals = [
    {
      name: 'Kısa Vadeli Hedef',
      steps: ['Hedefi yaz', 'Adımlara böl', 'Süre belirle'],
      deadline: '1 hafta',
      successIndicator: 'Hedefin %50 tamamlandı',
    },
    {
      name: 'Orta Vadeli Hedef',
      steps: ['Planı uygula', 'İlerlemeyi kontrol et', 'Gerekiyorsa düzelt'],
      deadline: '1 ay',
      successIndicator: 'Hedefin %75 tamamlandı',
    },
    {
      name: 'Uzun Vadeli Hedef',
      steps: ['Sonuçları değerlendir', 'Başarıyı kutla', 'Yeni hedef belirle'],
      deadline: '3 ay',
      successIndicator: 'Hedef tamamen tamamlandı',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Hedef belirleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri projelerini planlamada önemli bir rehberdir. Bilimsel araştırma sürecinde adım adım hedefler belirlemek, disleksi desteğine ihtiyacı olan öğrencilerin karmaşık deney ve gözlem süreçlerini yönetmelerini kolaylaştırır. Görsel hedef takibi, bilimsel yöntemin aşamalarını somutlaştırır ve disleksi desteğine ihtiyacı olan öğrencilerin bilimsel düşünce becerilerini sistematik olarak geliştirmelerini sağlar.',
    math: 'Hedef belirleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik öğrenme hedeflerini yapılandırmada etkili bir araçtır. Matematiksel kavramları adım adım öğrenme hedeflerine bölmek, disleksi desteğine ihtiyacı olan öğrencilerin sayısal düşünce becerilerini kademeli olarak geliştirmelerini sağlar ve her başarılı adımda matematik özgüveni artar.',
    language:
      'Hedef belirleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma hedeflerini somutlaştırır. Dil becerileri geliştirme sürecinde ölçülebilir hedefler belirlemek, disleksi desteğine ihtiyacı olan öğrencilerin ilerlemelerini takip etmelerini ve her küçük başarıyı kutlamalarını sağlar.',
    social:
      'Hedef belirleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler projelerini planlamada yapılandırılmış bir yaklaşım sunar. Toplumsal konuları araştırma hedeflerine bölmek, disleksi desteğine ihtiyacı olan öğrencilerin sosyal bilimler becerilerini sistematik olarak geliştirmelerini destekler.',
    general:
      'Hedef belirleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için öğrenme süreçlerini yapılandırmada kritik bir araçtır. Somut ve ölçülebilir hedefler, disleksi desteğine ihtiyacı olan öğrencilerin belirsizlik kaygısını azaltır ve motivasyonlarını artırır. Görsel hedef haritaları, öğrencilerin ilerlemelerini takip etmelerini sağlar ve her küçük başarı deneyimi öz yeterlik algısını güçlendirir.',
  };

  return {
    title: `${params.topic} - Hedef Belirleme`,
    content: {
      steps: goals.flatMap((goal, gi) =>
        goal.steps.map((step, si) => ({
          stepNumber: gi * 10 + si + 1,
          label: `${goal.name}: ${step}`,
          description: step,
          isCheckpoint: si === goal.steps.length - 1,
          scaffoldHint: `Süre: ${goal.deadline}`,
        }))
      ),
      bepGoals: goals.map((goal) => ({
        domain: goal.name,
        objective: goal.steps.join(', '),
        targetDate: goal.deadline,
        measurableIndicator: goal.successIndicator,
        supportStrategies: ['Görsel destek', 'Adım adım ilerleme'],
        progress: 'not_started' as const,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Hedef belirleme', 'Planlama', 'Öz düzenleme', 'İlerleme takibi'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_GOAL_SETTING: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_GOAL_SETTING,
  aiGenerator: generateInfographic_GOAL_SETTING_AI,
  offlineGenerator: generateInfographic_GOAL_SETTING_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'goalCount',
        type: 'number',
        label: 'Hedef Sayısı',
        defaultValue: 3,
        description: 'Kaç hedef belirlensin?',
      },
      {
        name: 'showMilestones',
        type: 'boolean',
        label: 'Ara Hedefleri Göster',
        defaultValue: true,
        description: 'Ara hedefler ve kilometre taşları gösterilsin mi?',
      },
    ],
  },
};
