import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type InventionPlanAIResult = {
  title: string;
  steps: { phase: string; description: string; tools: string[] }[];
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
  const scienceTerms = ['icat', 'mucit', 'buluş', 'teknoloji'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  return 'general' as const;
}

export async function generateInfographic_INVENTION_PLAN_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'BULUŞ PLANI',
    params,
    '1. Buluş sürecinin aşamalarını belirle\n2. Her aşama için gerekli araçları listele\n3. Adımlı plan oluştur'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      steps: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            phase: { type: 'STRING' },
            description: { type: 'STRING' },
            tools: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as InventionPlanAIResult;
  return {
    title: result.title || `${params.topic} - Buluş Planı`,
    content: {
      steps: (result.steps || []).map((step, i) => ({
        stepNumber: i + 1,
        label: `Aşama ${i + 1}: ${step.phase}`,
        description: step.description,
        isCheckpoint: i === 0,
        scaffoldHint: `Araçlar: ${step.tools.join(', ')}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Buluş planlama', 'Mühendislik düşünce', 'Proje yönetimi'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_INVENTION_PLAN_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const steps = [
    {
      phase: 'Fikir Bul',
      description: 'Bir problem belirle ve çözüm fikri üret.',
      tools: ['Kağıt', 'Kalem', 'Beyin fırtınası'],
    },
    {
      phase: 'Araştırma Yap',
      description: 'Benzer çözümler var mı araştır.',
      tools: ['İnternet', 'Kitap', 'Uzman görüşü'],
    },
    {
      phase: 'Tasarla',
      description: 'Çözümünü çizim veya modelle planla.',
      tools: ['Çizim kağıdı', 'Renkli kalemler', 'Maket malzemesi'],
    },
    {
      phase: 'Prototip Üret',
      description: 'Basit bir model oluştur.',
      tools: ['Karton', 'Yapıştırıcı', 'Makas'],
    },
    {
      phase: 'Test Et',
      description: 'Prototipi dene ve iyileştir.',
      tools: ['Gözlem defteri', 'Geri bildirim formu'],
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Buluş planı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için icat sürecini yapılandırılmış adımlarla planlamalarını sağlayan temel bir fen bilimleri aracıdır. Her aşamanın gerekli araçları ve açıklamaları ile birlikte sunulması, soyut buluş süreçlerini somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, görsel düzenleme ve adım adım ilerleme yapısı sayesinde fikirlerini somut bir buluşa dönüştürme becerisini geliştirirler.',
    math: 'Buluş planında ölçüm ve hesaplama, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi mühendislik ile bağdaştırır.',
    language:
      'Buluş sürecini anlatmak, disleksi desteğine ihtiyacı olan öğrenciler için teknik yazma ve sunum becerilerini geliştirir.',
    social:
      'Toplumsal sorunlara buluş ile çözüm üretmek, disleksi desteğine ihtiyacı olan öğrenciler için sosyal girişimcilik becerilerini destekler.',
    general:
      'Buluş planı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için yaratıcı mühendislik becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Buluş Planı`,
    content: {
      steps: steps.map((step, i) => ({
        stepNumber: i + 1,
        label: `Aşama ${i + 1}: ${step.phase}`,
        description: step.description,
        isCheckpoint: i === 0,
        scaffoldHint: `Araçlar: ${step.tools.join(', ')}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Buluş planlama', 'Mühendislik düşünce', 'Proje yönetimi'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_INVENTION_PLAN: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_INVENTION_PLAN,
  aiGenerator: generateInfographic_INVENTION_PLAN_AI,
  offlineGenerator: generateInfographic_INVENTION_PLAN_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'inventionName',
        type: 'string',
        label: 'Buluş Adı',
        defaultValue: 'Otomatik Sulama Sistemi',
        description: 'Hangi buluş planlansın?',
      },
      {
        name: 'showTools',
        type: 'boolean',
        label: 'Araçları Göster',
        defaultValue: true,
        description: 'Her aşama için gerekli araçlar gösterilsin mi?',
      },
    ],
  },
};
