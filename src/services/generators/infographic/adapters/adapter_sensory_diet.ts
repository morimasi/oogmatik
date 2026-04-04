import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type SensoryDietAIResult = {
  title: string;
  activities: { name: string; sensoryType: string; time: string; purpose: string }[];
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

export async function generateInfographic_SENSORY_DIET_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DUYUSAL DİYET',
    params,
    '1. Günlük duyusal diyet programını oluştur\n2. Her aktivite için duyusal tür, zaman ve amaç belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için duyusal diyet stratejileri (min 100 kelime)'
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
            sensoryType: { type: 'STRING' },
            time: { type: 'STRING' },
            purpose: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as SensoryDietAIResult;
  return {
    title: result.title || `${params.topic} - Duyusal Diyet`,
    content: {
      steps: (result.activities || []).map((a, i) => ({
        stepNumber: i + 1,
        label: a.name,
        description: `Amaç: ${a.purpose}`,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Tür: ${a.sensoryType} | Zaman: ${a.time}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Duyusal diyet infografiği, disleksi desteğine ihtiyacı olan öğrenciler için günlük duyusal girdi ihtiyaçlarını karşılayan yapılandırılmış bir aktivite programı sunar. Disleksi desteğine ihtiyacı olan öğrenciler sıklıkla duyusal işlemleme farklılıkları gösterirler ve bu durum öğrenme performanslarını doğrudan etkiler. Ergoterapist rehberliğinde hazırlanan duyusal diyet, disleksi desteğine ihtiyacı olan öğrencilerin sinir sistemlerini düzenli tutmalarına ve öğrenmeye hazır hale gelmelerine yardımcı olur. Proprioceptif, vestibüler ve dokunsal aktivitelerin dengeli dağılımı, disleksi desteğine ihtiyacı olan öğrencilerin dikkat, odaklanma ve duygusal düzenleme becerilerini destekler.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Duyusal düzenleme', 'Öz düzenleme', 'Dikkat yönetimi', 'Günlük rutin'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SENSORY_DIET_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const activities = [
    {
      name: 'Duvar İtme',
      sensoryType: 'Proprioseptif',
      time: 'Sabah',
      purpose: 'Vücut farkındalığı',
    },
    {
      name: 'Salıncak',
      sensoryType: 'Vestibüler',
      time: 'Teneffüs',
      purpose: 'Denge ve düzenleme',
    },
    {
      name: 'Hamur Oynama',
      sensoryType: 'Dokunsal',
      time: 'Öğle',
      purpose: 'El kasları ve dokunma',
    },
    {
      name: 'Ağır Battaniye',
      sensoryType: 'Proprioseptif',
      time: 'Dinlenme',
      purpose: 'Sakinleşme',
    },
    { name: 'Zıplama', sensoryType: 'Vestibüler', time: 'Ara', purpose: 'Enerji atma' },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Duyusal diyet infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri dersinde duyusal deneyimleri zenginleştirmede yardımcı olur. Fen deneylerinde dokunsal ve görsel duyusal girdiler, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel kavramları somut olarak deneyimlemelerini sağlar.',
    math: 'Duyusal diyet infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik öğrenme öncesi duyusal hazırlık aktiviteleri sunar. Proprioceptif aktiviteler ile vücut farkındalığı kazanan disleksi desteğine ihtiyacı olan öğrenciler, matematik çalışmalarına daha hazır bir sinir sistemi ile başlarlar.',
    language:
      'Duyusal diyet infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma öncesi duyusal düzenleme aktiviteleri içerir. Dokunsal harf yazma ve kumda çizme aktiviteleri, disleksi desteğine ihtiyacı olan öğrencilerin harf tanıma becerilerini çoklu duyusal kanallarla geliştirmelerini sağlar.',
    social:
      'Duyusal diyet infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal etkileşim öncesi duyusal hazırlık aktiviteleri sunar. Grup duyusal aktiviteleri, disleksi desteğine ihtiyacı olan öğrencilerin sosyal ortamlarda daha düzenli ve katılımcı olmalarını destekler.',
    general:
      'Duyusal diyet infografiği, disleksi desteğine ihtiyacı olan öğrenciler için günlük duyusal girdi ihtiyaçlarını karşılayan yapılandırılmış bir aktivite programı sunar. Disleksi desteğine ihtiyacı olan öğrenciler sıklıkla duyusal işlemleme farklılıkları gösterirler ve bu durum öğrenme performanslarını doğrudan etkiler. Ergoterapist rehberliğinde hazırlanan duyusal diyet, disleksi desteğine ihtiyacı olan öğrencilerin sinir sistemlerini düzenli tutmalarına ve öğrenmeye hazır hale gelmelerine yardımcı olur. Proprioceptif, vestibüler ve dokunsal aktivitelerin dengeli dağılımı, disleksi desteğine ihtiyacı olan öğrencilerin dikkat, odaklanma ve duygusal düzenleme becerilerini destekler.',
  };

  return {
    title: `${params.topic} - Duyusal Diyet`,
    content: {
      steps: activities.map((a, i) => ({
        stepNumber: i + 1,
        label: a.name,
        description: `Amaç: ${a.purpose}`,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Tür: ${a.sensoryType} | Zaman: ${a.time}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Duyusal düzenleme', 'Öz düzenleme', 'Dikkat yönetimi', 'Günlük rutin'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SENSORY_DIET: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SENSORY_DIET,
  aiGenerator: generateInfographic_SENSORY_DIET_AI,
  offlineGenerator: generateInfographic_SENSORY_DIET_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'sensoryProfile',
        type: 'enum',
        label: 'Duyusal Profil',
        defaultValue: 'arayan',
        options: ['arayan', 'kaçınan', 'karma'],
        description: 'Öğrencinin duyusal profili nedir?',
      },
      {
        name: 'activityCount',
        type: 'number',
        label: 'Aktivite Sayısı',
        defaultValue: 5,
        description: 'Günlük kaç duyusal aktivite olsun?',
      },
    ],
  },
};
