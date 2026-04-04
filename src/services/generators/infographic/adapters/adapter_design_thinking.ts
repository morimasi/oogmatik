import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type DesignThinkingAIResult = {
  title: string;
  phases: { name: string; description: string; activities: string[] }[];
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
  const scienceTerms = ['tasarım', 'mühendislik', 'prototip'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  return 'general' as const;
}

export async function generateInfographic_DESIGN_THINKING_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'TASARIM DÜŞÜNCE',
    params,
    '1. Tasarım düşünce aşamalarını belirle\n2. Her aşama için aktiviteler öner\n3. Döngüsel süreci göster\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için tasarım düşünce öğrenme stratejileri (min 100 kelime)'
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
            description: { type: 'STRING' },
            activities: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as DesignThinkingAIResult;
  return {
    title: result.title || `${params.topic} - Tasarım Düşünce`,
    content: {
      steps: (result.phases || []).map((phase, i) => ({
        stepNumber: i + 1,
        label: `Aşama ${i + 1}: ${phase.name}`,
        description: phase.description,
        isCheckpoint: i === 0,
        scaffoldHint: `Aktiviteler: ${phase.activities.join(', ')}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Tasarım düşünce infografiği, disleksi desteğine ihtiyacı olan öğrenciler için empati kurma, problem tanımlama ve çözüm üretme becerilerini yapılandırılmış bir süreçle geliştiren önemli bir öğrenme aracıdır. Her aşamanın somut aktivitelerle desteklenmesi, soyut tasarım süreçlerini somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, adım adım ilerleyen tasarım düşünce yapısı sayesinde kullanıcı odaklı düşünmeyi öğrenir ve yaratıcı problem çözme becerilerini geliştirirler.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Empati kurma', 'Problem tanımlama', 'Prototip oluşturma'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_DESIGN_THINKING_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const phases = [
    {
      name: 'Empati',
      description: 'Kullanıcının ihtiyaçlarını anlamaya çalış.',
      activities: ['Gözlem yap', 'Röportaj yap', 'Kullanıcı haritası çıkar'],
    },
    {
      name: 'Tanımla',
      description: 'Problemi net bir şekilde tanımla.',
      activities: ['Problem cümlesi yaz', 'İhtiyaçları sırala'],
    },
    {
      name: 'Fikir Üret',
      description: 'Mümkün olduğunca çok çözüm fikri bul.',
      activities: ['Beyin fırtınası', 'Çılgın 8', 'SCAMPER'],
    },
    {
      name: 'Prototip',
      description: 'En iyi fikri basit bir modelle somutlaştır.',
      activities: ['Kağıt prototip', 'Maket yap', 'Çizim yap'],
    },
    {
      name: 'Test Et',
      description: 'Prototipi kullanıcılarla test et ve geri bildirim al.',
      activities: ['Gözlemle', 'Geri bildirim al', 'İyileştir'],
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Tasarım düşünce, disleksi desteğine ihtiyacı olan öğrenciler için bilimsel problem çözme ve mühendislik tasarım süreçlerini yapılandırılmış bir yaklaşımla destekleyen önemli bir fen bilimleri aracıdır. Her aşamanın somut aktivitelerle desteklenmesi, soyut mühendislik süreçlerini somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, adım adım ilerleyen tasarım düşünce yapısı sayesinde kullanıcı odaklı bilimsel düşünmeyi öğrenirler.',
    math: 'Matematiksel tasarım problemleri, disleksi desteğine ihtiyacı olan öğrenciler için geometrik düşünceyi tasarım ile bağdaştırır.',
    language:
      'Tasarım sürecini anlatmak, disleksi desteğine ihtiyacı olan öğrenciler için açıklayıcı yazma becerisini geliştirir.',
    social:
      'Toplumsal sorunlara tasarım düşünce ile çözüm üretmek, disleksi desteğine ihtiyacı olan öğrenciler için empati ve vatandaşlık becerilerini destekler.',
    general:
      'Tasarım düşünce infografiği, disleksi desteğine ihtiyacı olan öğrenciler için yaratıcı problem çözme becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Tasarım Düşünce`,
    content: {
      steps: phases.map((phase, i) => ({
        stepNumber: i + 1,
        label: `Aşama ${i + 1}: ${phase.name}`,
        description: phase.description,
        isCheckpoint: i === 0,
        scaffoldHint: `Aktiviteler: ${phase.activities.join(', ')}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Empati kurma', 'Problem tanımlama', 'Prototip oluşturma'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_DESIGN_THINKING: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_DESIGN_THINKING,
  aiGenerator: generateInfographic_DESIGN_THINKING_AI,
  offlineGenerator: generateInfographic_DESIGN_THINKING_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'problem',
        type: 'string',
        label: 'Tasarım Problemi',
        defaultValue: 'Okul bahçesini iyileştir',
        description: 'Hangi tasarım problemi çözülsün?',
      },
      {
        name: 'showActivities',
        type: 'boolean',
        label: 'Aktiviteleri Göster',
        defaultValue: true,
        description: 'Her aşama için aktiviteler gösterilsin mi?',
      },
    ],
  },
};
