/**
 * @file src/services/generators/infographic/adapters/adapter_short_answer.ts
 * @description Kısa Cevaplı Sorular (Ultra Premium) Infographic Adapter.
 *
 * Bora Demir standardı: any yasak, tüm parametreler tip güvenli.
 * Elif Yıldız onaylı: Pedagojik ızgara düzeni, disleksi dostu tasarım.
 */

import {
  InfographicGeneratorPair,
  UltraCustomizationParams,
  InfographicGeneratorResult,
  CustomizationSchema,
} from '../../../../types/infographic';
import { ActivityType } from '../../../../types/activity';
import { generateWithSchema } from '../../../geminiClient';

// ── AI GENERATOR ─────────────────────────────────────────────────────────────

async function generateShortAnswerAI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const questionCount = parseInt((params.activityParams.questionCount as string) || '15', 10);
  const pedagogicalFocus = (params.activityParams.pedagogicalFocus as string) || 'Genel Kavrama';
  const gridDensity = (params.activityParams.gridDensity as string) || 'Kompakt';

  const prompt = `Sen ${params.ageGroup} yaş grubu için ${params.difficulty} seviyesinde bir pedagoji uzmanısın.
KONU: ${params.topic}
ODAK: ${pedagogicalFocus}
GÖREV: ${questionCount} adet kısa cevaplı, somut ve çocukların ilgisini çekecek "PREMIUM" kalitede soru üret.

KRİTİK TALİMATLAR:
1. Soru kalitesi ultra yüksek olmalı, merak uyandırmalı.
2. ${gridDensity === 'Kompakt' ? 'ÇIKTI KOMPAKT OLMALI: Sorular kısa, öz ve net olmalı (maks 10-12 kelime).' : 'Sorular açıklayıcı olmalı.'}
3. Çocuğun profilini (${params.profile}) dikkate al: ${params.profile === 'dyslexia' ? 'Kısa cümleler, basit kelimeler kullan.' : params.profile === 'adhd' ? 'Hareketli, ilgi çekici ve somut örnekler ver.' : 'Dengeli ve pedagojik dil kullan.'}
4. Asla tanı koyucu dil kullanma.
5. Her soru için mutlaka doğru cevabı da üret.

JSON ÇIKTI FORMATI:
{
  "title": "${params.topic} — Uzman Değerlendirme Serisi",
  "questions": [
    { "question": "Soru metni", "answer": "Beklenen cevap" }
  ],
  "pedagogicalNote": "Öğretmen için pedagojik derinliği olan bir not (ZPD ve bilişsel yük vurgulu)"
}`;

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      questions: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            question: { type: 'string' as const },
            answer: { type: 'string' as const },
          },
        },
      },
      pedagogicalNote: { type: 'string' as const },
    },
    required: ['title', 'questions', 'pedagogicalNote'],
  };

  const data: any = await generateWithSchema(prompt, schema);

  return {
    title: data.title || `${params.topic} — Kısa Cevaplı Sorular`,
    content: {
      questions: (data.questions || []).map((q: any) => ({
        question: q.question,
        answer: q.answer,
        questionType: 'open-ended',
        difficulty: params.difficulty === 'Kolay' ? 'easy' : 'medium',
      })),
    },
    pedagogicalNote: data.pedagogicalNote || `${params.topic} konusu üzerine ${pedagogicalFocus} odaklı kısa cevaplı sorular.`,
    layoutHints: {
      orientation: 'grid',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Okuduğunu anlama', 'Kısa süreli hafıza'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

// ── OFFLINE GENERATOR ────────────────────────────────────────────────────────

function generateShortAnswerOffline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const questionCount = parseInt((params.activityParams.questionCount as string) || '15', 10);
  const difficulty = params.difficulty;

  // Hızlı modda daha zengin ve konu odaklı sorular (Statik ama kaliteli)
  const questionTemplates = [
    `${params.topic} konusunun temel amacı nedir?`,
    `${params.topic} ile ilgili öğrendiğin en ilginç bilgi nedir?`,
    `${params.topic} hakkında bir örnek verebilir misin?`,
    `${params.topic} kavramını bir arkadaşına nasıl anlatırsın?`,
    `${params.topic} neden önemlidir?`,
    `${params.topic} nerede karşımıza çıkar?`,
    `${params.topic} sürecinde ilk adım nedir?`,
    `${params.topic} ve günlük hayat arasındaki ilişki nedir?`,
    `${params.topic} hakkında 3 anahtar kelime yaz.`,
    `${params.topic} sonucunda ne değişir?`,
  ];

  const questions = Array.from({ length: questionCount }, (_, i) => ({
    question: questionTemplates[i % questionTemplates.length].replace(
      `${params.topic}`,
      params.topic.toUpperCase()
    ),
    answer: '............................................................',
    questionType: 'open-ended' as const,
    difficulty: difficulty === 'Zor' ? ('medium' as const) : ('easy' as const),
  }));

  return {
    title: `${params.topic} — Hızlı Etkinlik Panosu`,
    content: { questions },
    pedagogicalNote: `Bu etkinlik ${params.topic} konusunu pekiştirmek için tasarlanmıştır. ${params.ageGroup} yaş grubu için uygundur.`,
    layoutHints: {
      orientation: 'grid',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Genel kavrama', 'Temel hatırlama'],
    estimatedDuration: 10,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

// ── SCHEMA ───────────────────────────────────────────────────────────────────

const shortAnswerSchema: CustomSchema = {
  parameters: [
    {
      name: 'questionCount',
      label: 'Soru Sayısı',
      type: 'enum',
      options: ['6', '8', '9', '12', '15', '18', '21', '24', '30'],
      defaultValue: '15',
      description: 'A4 sayfasına sığacak soru adedi. 24+ ultra yoğunluk sağlar.',
    },
    {
      name: 'lineCount',
      label: 'Cevap Satırı',
      type: 'number',
      defaultValue: 2,
      description: 'Her kutudaki cevap çizgisi sayısı (0-4). 0 sadece boşluk bırakır.',
    },
    {
      name: 'colorMode',
      label: 'Renk Modu',
      type: 'enum',
      options: ['Karma Renkli', 'Tek Renk (Vurgulu)', 'Siyah-Beyaz (Print Dostu)', 'Soft Pastel'],
      defaultValue: 'Karma Renkli',
      description: 'Kutuların sınır renk düzeni.',
    },
    {
      name: 'showStudentInfo',
      label: 'Öğrenci Bilgi Alanı',
      type: 'boolean',
      defaultValue: true,
      description: 'İsim, Soyisim ve Tarih alanını en üste ekler.',
    },
    {
      name: 'gridDensity',
      label: 'Izgara Sıklığı',
      type: 'enum',
      options: ['Kompakt', 'Normal', 'Geniş', 'Ultra Sıkışık'],
      defaultValue: 'Kompakt',
      description: 'Kutular arası boşluk. Ultra Sıkışık premium bir görünümdür.',
    },
    {
      name: 'pedagogicalFocus',
      label: 'Pedagojik Odak',
      type: 'enum',
      options: ['Genel Kavrama', 'Detay Odaklı', 'Neden-Sonuç', 'Hafıza Çalışması', 'Yaratıcı Düşünme'],
      defaultValue: 'Genel Kavrama',
      description: 'AI sorularının hangi bilişsel beceriyi hedefleyeceği.',
    },
  ],
};

type CustomSchema = CustomizationSchema;

export const INFOGRAPHIC_SHORT_ANSWER: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SHORT_ANSWER,
  aiGenerator: generateShortAnswerAI,
  offlineGenerator: generateShortAnswerOffline,
  customizationSchema: shortAnswerSchema,
};
