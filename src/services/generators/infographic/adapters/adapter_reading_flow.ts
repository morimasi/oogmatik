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

export async function generateInfographic_ReadingFlow_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'OKUMA AKIŞI',
    params,
    '1. Metni paragraflara böl\n2. Her paragraf için takip çizgisi ekle\n3. Pedagojik not: Okuma akıcılığının gelişimine katkısı (min 100 kelime)\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      paragraphs: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            text: { type: 'string' as const },
            highlight: { type: 'boolean' as const },
          },
        },
      },
      pedagogicalNote: { type: 'string' as const },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as {
    title: string;
    paragraphs: Array<{ text: string; highlight: boolean }>;
    pedagogicalNote: string;
  };
  return {
    title: result.title || `${params.topic} - Okuma Akışı`,
    content: {
      questions: (result.paragraphs || []).map((p, i) => ({
        question: `Paragraf ${i + 1}: ${p.text.substring(0, 50)}...`,
        questionType: 'open-ended' as const,
        answer: p.text,
        difficulty: i === 0 ? ('easy' as const) : ('medium' as const),
        visualCue: p.highlight ? '🔵 Önemli' : undefined,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Okuma akıcılığı, öğrencinin metni satır satır takip etme becerisini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için renkli takip çizgileri ve geniş satır aralığı kullanılmalıdır.',
    layoutHints: { orientation: 'vertical', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Okuma akıcılığı', 'Satır takibi'],
    estimatedDuration: 12,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_ReadingFlow_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const templates: Record<string, string[]> = {
    science: [
      'Canlılar dünyası, bitkiler ve hayvanlar birlikte yaşar.',
      'Her canlının bir yaşam alanı vardır.',
      'Doğayı korumak hepimizin görevidir.',
    ],
    math: [
      'Sayılar günlük hayatın her yerindedir.',
      'Toplama ve çıkarma işlemlerini öğreniriz.',
      'Matematik problemlerini adım adım çözeriz.',
    ],
    language: [
      'Hikayeler bizi farklı dünyalara götürür.',
      'Karakterlerin duygularını anlamaya çalışırız.',
      'Her hikayenin bir mesajı vardır.',
    ],
    social: [
      'Tarihimiz önemli olaylarla doludur.',
      'Kültürümüz nesilden nesile aktarılır.',
      'Toplumda birlikte yaşamayı öğreniriz.',
    ],
    general: [
      `${params.topic} hakkında birinci paragraf.`,
      `İkinci paragrafta detaylar verilir.`,
      `Son paragrafta sonuç özetlenir.`,
    ],
  };
  const paragraphs = templates[category] || templates.general;
  return {
    title: `${params.topic} - Okuma Akışı`,
    content: {
      questions: paragraphs.map((p, i) => ({
        question: `Paragraf ${i + 1}`,
        questionType: 'open-ended' as const,
        answer: p,
        difficulty: 'easy' as const,
        visualCue: i === 0 ? '🔵 Başlangıç' : i === paragraphs.length - 1 ? '🟢 Son' : undefined,
      })),
    },
    pedagogicalNote:
      'Okuma akıcılığı, öğrencinin metni satır satır takip etme becerisini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için renkli takip çizgileri ve geniş satır aralığı kullanılmalıdır. Her paragraf arasına boşluk bırakılmalıdır.',
    layoutHints: { orientation: 'vertical', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Okuma akıcılığı', 'Satır takibi'],
    estimatedDuration: 12,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_READING_FLOW: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_READING_FLOW,
  aiGenerator: generateInfographic_ReadingFlow_AI,
  offlineGenerator: generateInfographic_ReadingFlow_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'paragraphCount',
        type: 'number',
        label: 'Paragraf Sayısı',
        defaultValue: 3,
        description: 'Metin kaç paragraflı olsun?',
      },
      {
        name: 'highlightKey',
        type: 'boolean',
        label: 'Anahtar Kelime Vurgula',
        defaultValue: true,
        description: 'Önemli kelimeler renkli gösterilsin mi?',
      },
    ],
  },
};
