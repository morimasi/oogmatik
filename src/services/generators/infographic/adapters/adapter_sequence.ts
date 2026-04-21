import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

function buildAIPrompt(
  activityName: string,
  params: UltraCustomizationParams,
  rules: string
): string {
  return `Sen ${params.ageGroup} yaş grubu, ${params.difficulty} zorluk seviyesinde, ${params.profile} profili için ${activityName} infografiği oluşturan bir pedagoji uzmanısın.\nKONU: ${params.topic}\nÖZEL PARAMETRELER: ${JSON.stringify(params.activityParams, null, 2)}\nKURALLAR:\n${rules}\nJSON ÇIKTI:`;
}

function detectCategory(topic: string): string {
  const t = topic.toLowerCase();
  if (t.includes('canlı') || t.includes('hayvan') || t.includes('fen')) return 'science';
  if (t.includes('sayı') || t.includes('matematik')) return 'math';
  if (t.includes('tarih') || t.includes('coğrafya')) return 'social';
  return 'language';
}

export async function generateInfographic_Sequence_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'OLAY SIRALAMA',
    params,
    '1. Olayları kronolojik sıraya koy\n2. Her olay için numara ve açıklama yaz\n3. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      events: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            order: { type: 'number' as const },
            description: { type: 'string' as const },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as {
    title: string;
    events: Array<{ order: number; description: string }>;
  };
  return {
    title: result.title || `${params.topic} - Olay Sıralama`,
    content: {
      steps: (result.events || []).map((e) => ({
        stepNumber: e.order,
        label: `Adım ${e.order}`,
        description: e.description,
        isCheckpoint: e.order % 2 === 0,
      })),
    },
    layoutHints: { orientation: 'vertical', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Sıralı düşünme', 'Zaman algısı'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_Sequence_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const templates: Record<string, Array<{ order: number; description: string }>> = {
    science: [
      { order: 1, description: 'Tohum toprağa ekilir.' },
      { order: 2, description: 'Su ve güneş ile filizlenir.' },
      { order: 3, description: 'Bitki büyür ve yaprak açar.' },
      { order: 4, description: 'Çiçek açar ve meyve verir.' },
      { order: 5, description: 'Yeni tohumlar oluşur.' },
    ],
    math: [
      { order: 1, description: 'Problemi dikkatlice oku.' },
      { order: 2, description: 'Verilenleri belirle.' },
      { order: 3, description: 'İşlem sırasını planla.' },
      { order: 4, description: 'İşlemi adım adım çöz.' },
      { order: 5, description: 'Sonucu kontrol et.' },
    ],
    language: [
      { order: 1, description: 'Hikayenin başlangıcını oku.' },
      { order: 2, description: 'Karakterleri ve mekanı tanı.' },
      { order: 3, description: 'Sorunu (çatışmayı) belirle.' },
      { order: 4, description: 'Olayların gelişimini takip et.' },
      { order: 5, description: 'Sonucu ve mesajı anla.' },
    ],
    social: [
      { order: 1, description: 'Olayın geçtiği dönemi belirle.' },
      { order: 2, description: 'Nedenlerini araştır.' },
      { order: 3, description: 'Gelişme sürecini takip et.' },
      { order: 4, description: 'Sonuçlarını değerlendir.' },
      { order: 5, description: 'Günümüze etkisini düşün.' },
    ],
    general: [
      { order: 1, description: `${params.topic} - Birinci adım.` },
      { order: 2, description: `${params.topic} - İkinci adım.` },
      { order: 3, description: `${params.topic} - Üçüncü adım.` },
      { order: 4, description: `${params.topic} - Dördüncü adım.` },
      { order: 5, description: `${params.topic} - Beşinci adım.` },
    ],
  };
  const events = templates[category] || templates.general;
  return {
    title: `${params.topic} - Olay Sıralama`,
    content: {
      steps: events.map((e) => ({
        stepNumber: e.order,
        label: `Adım ${e.order}`,
        description: e.description,
        isCheckpoint: e.order % 2 === 0,
      })),
    },
    layoutHints: { orientation: 'vertical', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Sıralı düşünme', 'Zaman algısı'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SEQUENCE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SEQUENCE,
  aiGenerator: generateInfographic_Sequence_AI,
  offlineGenerator: generateInfographic_Sequence_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'eventCount',
        type: 'number',
        label: 'Olay Sayısı',
        defaultValue: 5,
        description: 'Kaç olay sıralansın?',
      },
      {
        name: 'shuffleMode',
        type: 'boolean',
        label: 'Karışık Sıralama',
        defaultValue: true,
        description: 'Öğrenci için olaylar karışık verilsin mi?',
      },
    ],
  },
};
