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

export async function generateInfographic_InferenceChain_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ÇIKARIM ZİNCİRİ',
    params,
    '1. Metinden ipuçları topla\n2. Her ipucundan çıkarım yap\n3. Sonuca ulaş\n4. Pedagojik not: Çıkarım yapmanın eleştirel düşünmeye katkısı (min 100 kelime)\n5. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      clues: { type: 'array' as const, items: { type: 'string' as const } },
      inferences: { type: 'array' as const, items: { type: 'string' as const } },
      conclusion: { type: 'string' as const },
      pedagogicalNote: { type: 'string' as const },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as {
    title: string;
    clues: string[];
    inferences: string[];
    conclusion: string;
    pedagogicalNote: string;
  };
  return {
    title: result.title || `${params.topic} - Çıkarım Zinciri`,
    content: {
      questions: (result.clues || []).map((c, i) => ({
        question: `İpucu ${i + 1}: ${c}`,
        questionType: 'open-ended' as const,
        answer: result.inferences[i] || '...',
        difficulty: i === 0 ? ('easy' as const) : ('medium' as const),
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Çıkarım yapma becerisi, öğrencinin metinler arası bağlantı kurma ve eleştirel düşünme yetisini güçlendirir. Disleksi desteğine ihtiyacı olan öğrenciler için her ipucu ayrı kutuda ve görsel destekli sunulmalıdır.',
    layoutHints: { orientation: 'horizontal', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Çıkarım yapma', 'Eleştirel düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_InferenceChain_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const templates: Record<string, { clues: string[]; inferences: string[]; conclusion: string }> = {
    science: {
      clues: ['Yapraklar sararıyor.', 'Günler kısalıyor.', 'Hava soğumaya başladı.'],
      inferences: [
        'Mevsim değişiyor olabilir.',
        'Sonbahar yaklaşıyor.',
        'Bitkiler kışa hazırlanıyor.',
      ],
      conclusion: 'Doğada mevsimsel değişimler canlıları etkiler.',
    },
    math: {
      clues: ["Sayı 2'ye bölünmüyor.", "Sayı 3'ün katı.", "Sayı 10'dan küçük."],
      inferences: ['Sayı tek sayı olmalı.', '3, 6 veya 9 olabilir.', '6 bu koşulları sağlıyor.'],
      conclusion: 'Verilen ipuçlarıyla sayı 6 olarak bulunur.',
    },
    language: {
      clues: ['Karakter üzgün görünüyor.', 'Elinde mektup var.', 'Pencereden dışarı bakıyor.'],
      inferences: [
        'Mektup kötü haber içerebilir.',
        'Birini özlüyor olabilir.',
        'Yalnız hissediyor.',
      ],
      conclusion: 'Karakter, mektuptaki haber nedeniyle duygusal bir süreçten geçiyor.',
    },
    social: {
      clues: ['İnsanlar sokaklara döküldü.', 'Bayraklar asıldı.', 'Konuşmalar yapılıyor.'],
      inferences: [
        'Önemli bir kutlama var.',
        'Milli bir bayram olabilir.',
        'Toplum bir araya geldi.',
      ],
      conclusion: 'Toplumsal birlikteliğin yaşandığı özel bir gün kutlanıyor.',
    },
    general: {
      clues: ['İpucu 1 hakkında bilgi.', 'İpucu 2 hakkında bilgi.', 'İpucu 3 hakkında bilgi.'],
      inferences: ['Birinci çıkarım.', 'İkinci çıkarım.', 'Üçüncü çıkarım.'],
      conclusion: 'Tüm ipuçları birleştirildiğinde sonuç ortaya çıkar.',
    },
  };
  const t = templates[category] || templates.general;
  return {
    title: `${params.topic} - Çıkarım Zinciri`,
    content: {
      questions: t.clues.map((c, i) => ({
        question: `İpucu ${i + 1}: ${c}`,
        questionType: 'open-ended' as const,
        answer: t.inferences[i] || '...',
        difficulty: i === 0 ? ('easy' as const) : ('medium' as const),
      })),
    },
    pedagogicalNote:
      'Çıkarım yapma becerisi, öğrencinin metinler arası bağlantı kurma ve eleştirel düşünme yetisini güçlendirir. Disleksi desteğine ihtiyacı olan öğrenciler için her ipucu ayrı kutuda ve görsel destekli sunulmalıdır. Ok işaretleriyle ipuçından çıkarıma geçiş gösterilmelidir.',
    layoutHints: { orientation: 'horizontal', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Çıkarım yapma', 'Eleştirel düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_INFERENCE_CHAIN: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_INFERENCE_CHAIN,
  aiGenerator: generateInfographic_InferenceChain_AI,
  offlineGenerator: generateInfographic_InferenceChain_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'clueCount',
        type: 'number',
        label: 'İpucu Sayısı',
        defaultValue: 3,
        description: 'Kaç ipucu verilsin?',
      },
      {
        name: 'difficulty',
        type: 'enum',
        label: 'Zorluk',
        defaultValue: 'dolayli',
        options: ['dolayli', 'karmaşık'],
        description: 'İpuçları ne kadar dolaylı olsun?',
      },
    ],
  },
};
