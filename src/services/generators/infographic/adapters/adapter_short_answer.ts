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

  const prompt = `Sen ${params.ageGroup} yaş grubu için ${params.difficulty} seviyesinde bir pedagoji uzmanısın.
KONU: ${params.topic}
ODAK: ${pedagogicalFocus}
GÖREV: ${questionCount} adet kısa cevaplı, somut ve çocukların ilgisini çekecek soru üret.

JSON ÇIKTI FORMATI:
{
  "title": "Başlık",
  "questions": [
    { "question": "Soru metni", "answer": "Beklenen cevap" }
  ],
  "pedagogicalNote": "Öğretmen için not"
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

  const questions = Array.from({ length: questionCount }, (_, i) => ({
    question: `${params.topic} hakkında ${i + 1}. soru?`,
    answer: 'Cevap buraya gelecek.',
    questionType: 'open-ended' as const,
    difficulty: 'easy' as const,
  }));

  return {
    title: `${params.topic} — Kısa Cevaplı Sorular`,
    content: { questions },
    pedagogicalNote: `Bu etkinlik ${params.topic} konusunu pekiştirmek için tasarlanmıştır.`,
    layoutHints: {
      orientation: 'grid',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Genel kavrama'],
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
      options: ['6', '8', '9', '12', '15', '18', '21'],
      defaultValue: '15',
      description: 'A4 sayfasına sığacak soru adedi.',
    },
    {
      name: 'lineCount',
      label: 'Satır Sayısı',
      type: 'number',
      defaultValue: 2,
      description: 'Her kutudaki cevap satırı sayısı (1-4).',
    },
    {
      name: 'colorMode',
      label: 'Renk Modu',
      type: 'enum',
      options: ['Karma Renkli', 'Tek Renk (Vurgulu)', 'Siyah-Beyaz (Print Dostu)'],
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
      options: ['Kompakt', 'Normal', 'Geniş'],
      defaultValue: 'Kompakt',
      description: 'Kutular arası boşluk ve sayfa doluluğu.',
    },
    {
      name: 'pedagogicalFocus',
      label: 'Pedagojik Odak',
      type: 'enum',
      options: ['Genel Kavrama', 'Detay Odaklı', 'Neden-Sonuç', 'Hafıza Çalışması'],
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
