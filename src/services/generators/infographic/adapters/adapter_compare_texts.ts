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

export async function generateInfographic_CompareTexts_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'METİN KARŞILAŞTIRMA',
    params,
    '1. İki metni tematik açıdan karşılaştır\n2. Benzerlik ve farklılıkları yaz\n3. Pedagojik not: Karşılaştırmalı okumanın gelişime katkısı (min 100 kelime)\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      textA: { type: 'string' as const },
      textB: { type: 'string' as const },
      similarities: { type: 'array' as const, items: { type: 'string' as const } },
      differences: { type: 'array' as const, items: { type: 'string' as const } },
      pedagogicalNote: { type: 'string' as const },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as {
    title: string;
    textA: string;
    textB: string;
    similarities: string[];
    differences: string[];
    pedagogicalNote: string;
  };
  return {
    title: result.title || `${params.topic} - Metin Karşılaştırma`,
    content: {
      comparisons: {
        leftTitle: result.textA,
        rightTitle: result.textB,
        leftItems: result.differences.slice(0, result.differences.length / 2),
        rightItems: result.differences.slice(result.differences.length / 2),
        commonGround: result.similarities,
      },
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Karşılaştırmalı okuma, öğrencinin analitik düşünme ve metinler arası bağlantı kurma becerisini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için renk kodlu sütunlar kullanılmalıdır.',
    layoutHints: { orientation: 'horizontal', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Karşılaştırmalı okuma', 'Analitik düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_CompareTexts_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const templates: Record<
    string,
    { textA: string; textB: string; similarities: string[]; differences: string[] }
  > = {
    language: {
      textA: 'Masal',
      textB: 'Hikaye',
      similarities: [
        'Kurgusal metinlerdir.',
        'Karakter ve olay örgüsü vardır.',
        'Okuyucuya mesaj verir.',
      ],
      differences: [
        'Masalda olağanüstü olaylar vardır.',
        'Hikaye gerçeğe yakındır.',
        'Masal kalıplaşmış giriş ve bitişe sahiptir.',
      ],
    },
    science: {
      textA: 'Gündüz',
      textB: 'Gece',
      similarities: [
        'Doğanın parçasıdır.',
        'Canlıları etkiler.',
        "Dünya'nın dönüşünden kaynaklanır.",
      ],
      differences: ['Gündüz güneşlidir.', 'Gece karanlıktır.', 'Sıcaklık farkı vardır.'],
    },
    math: {
      textA: 'Toplama',
      textB: 'Çıkarma',
      similarities: [
        'Temel matematik işlemidir.',
        'Sayılarla yapılır.',
        'Günlük hayatta kullanılır.',
      ],
      differences: [
        'Toplama artırmadır.',
        'Çıkarma azaltmadır.',
        'Toplama değişme özelliğine sahiptir.',
      ],
    },
    social: {
      textA: 'Şehir Hayatı',
      textB: 'Köy Hayatı',
      similarities: ['İnsanlar yaşar.', 'Kültür vardır.', 'Toplumsal ilişkiler bulunur.'],
      differences: ['Şehirde kalabalıktır.', 'Köyde doğa yakındır.', 'Ulaşım farklıdır.'],
    },
    general: {
      textA: `${params.topic} - A Metni`,
      textB: `${params.topic} - B Metni`,
      similarities: ['Benzerlik 1', 'Benzerlik 2', 'Benzerlik 3'],
      differences: ['Fark 1', 'Fark 2', 'Fark 3'],
    },
  };
  const t = templates[category] || templates.general;
  return {
    title: `${params.topic} - Metin Karşılaştırma`,
    content: {
      comparisons: {
        leftTitle: t.textA,
        rightTitle: t.textB,
        leftItems: t.differences.slice(0, t.differences.length / 2),
        rightItems: t.differences.slice(t.differences.length / 2),
        commonGround: t.similarities,
      },
    },
    pedagogicalNote:
      'Karşılaştırmalı okuma, öğrencinin analitik düşünme ve metinler arası bağlantı kurma becerisini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için renk kodlu sütunlar ve görsel ayırıcılar kullanılmalıdır.',
    layoutHints: { orientation: 'horizontal', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Karşılaştırmalı okuma', 'Analitik düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_COMPARE_TEXTS: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_COMPARE_TEXTS,
  aiGenerator: generateInfographic_CompareTexts_AI,
  offlineGenerator: generateInfographic_CompareTexts_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'criteria',
        type: 'string',
        label: 'Karşılaştırma Kriteri',
        defaultValue: 'tema',
        description: 'Hangi açıdan karşılaştırılsın?',
      },
      {
        name: 'includeVenn',
        type: 'boolean',
        label: 'Venn Şeması',
        defaultValue: true,
        description: 'Venn şeması gösterilsin mi?',
      },
    ],
  },
};
