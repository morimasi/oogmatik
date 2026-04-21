import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type TransitionPlanAIResult = {
  title: string;
  phases: { name: string; actions: string[]; timeline: string; responsible: string }[];
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

export async function generateInfographic_TRANSITION_PLAN_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'GEÇİŞ PLANI',
    params,
    '1. Geçiş planı aşamalarını oluştur\n2. Her aşama için eylemler, zaman çizelgesi ve sorumlu belirt'
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
            actions: { type: 'ARRAY', items: { type: 'STRING' } },
            timeline: { type: 'STRING' },
            responsible: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as TransitionPlanAIResult;
  return {
    title: result.title || `${params.topic} - Geçiş Planı`,
    content: {
      steps: (result.phases || []).flatMap((phase, pi) =>
        (phase.actions || []).map((action, ai) => ({
          stepNumber: pi * 10 + ai + 1,
          label: `${phase.name}: ${action}`,
          description: action,
          isCheckpoint: ai === (phase.actions || []).length - 1,
          scaffoldHint: `Süre: ${phase.timeline} | Sorumlu: ${phase.responsible}`,
        }))
      ),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Geçiş planlama', 'Hazırlık', 'İletişim', 'Destek koordinasyonu'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_TRANSITION_PLAN_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const phases = [
    {
      name: 'Hazırlık',
      actions: ['Mevcut durumu değerlendir', 'Hedef okulu ziyaret et', 'Yeni ortamı tanıştır'],
      timeline: '2 ay önce',
      responsible: 'Öğretmen + Aile',
    },
    {
      name: 'Uyum',
      actions: ['Deneme günleri planla', 'Akran buddy sistemi kur', 'Destek personelini tanıştır'],
      timeline: '1 ay önce',
      responsible: 'Rehber Öğretmen',
    },
    {
      name: 'Geçiş',
      actions: ['BEP dosyasını aktar', 'İlk gün planı yap', 'Duygusal destek sağla'],
      timeline: 'Geçiş haftası',
      responsible: 'Tüm ekip',
    },
    {
      name: 'Takip',
      actions: ['İlk hafta gözlem yap', 'Aile ile iletişim kur', 'Gerekiyorsa BEP güncelle'],
      timeline: 'Geçiş sonrası 1 ay',
      responsible: 'Öğretmen + RAM',
    },
  ];

  return {
    title: `${params.topic} - Geçiş Planı`,
    content: {
      steps: phases.flatMap((phase, pi) =>
        phase.actions.map((action, ai) => ({
          stepNumber: pi * 10 + ai + 1,
          label: `${phase.name}: ${action}`,
          description: action,
          isCheckpoint: ai === phase.actions.length - 1,
          scaffoldHint: `Süre: ${phase.timeline} | Sorumlu: ${phase.responsible}`,
        }))
      ),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Geçiş planlama', 'Hazırlık', 'İletişim', 'Destek koordinasyonu'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_TRANSITION_PLAN: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_TRANSITION_PLAN,
  aiGenerator: generateInfographic_TRANSITION_PLAN_AI,
  offlineGenerator: generateInfographic_TRANSITION_PLAN_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'transitionType',
        type: 'enum',
        label: 'Geçiş Türü',
        defaultValue: 'sinif_gecişi',
        options: ['sinif_gecişi', 'okul_değişikliği', 'program_değişikliği'],
        description: 'Hangi tür geçiş planlansın?',
      },
      {
        name: 'showTimeline',
        type: 'boolean',
        label: 'Zaman Çizelgesi Göster',
        defaultValue: true,
        description: 'Her aşama için zaman çizelgesi gösterilsin mi?',
      },
    ],
  },
};
