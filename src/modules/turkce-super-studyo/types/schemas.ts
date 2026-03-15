import { z } from 'zod';

// ==========================================
// 1. TEXT (METİN) ŞEMASI
// ==========================================
export const textPassageSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(), // Markdown veya zengin metin (Rich Text) formatında
  metadata: z.object({
    gradeLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    difficulty: z.enum(['KOLAY', 'ORTA', 'ZOR']),
    theme: z.enum(['DOGA', 'BILIM', 'SOCIETY', 'HIKAYE', 'FABL']),
    wordCount: z.number().int().nonnegative(),
    readabilityScore: z.number(), // Flesch-Kincaid veya benzeri
    estimatedReadingTimeMs: z.number().int().nonnegative(),
  }),
  learningOutcomes: z.array(z.string()), // MEB Kazanım kodları (Örn: T.1.3.4)
  assets: z
    .object({
      audioUrl: z.string().url().optional(), // Sesli okuma için (CDN Cache linki)
      imageUrl: z.string().url().optional(), // Görsel destek için
    })
    .optional(),
});

export type TextPassage = z.infer<typeof textPassageSchema>;

// ==========================================
// 2. QUESTION (SORU) ŞEMASI (POLİMORFİK)
// ==========================================
const QuestionTypeEnum = z.enum([
  'MCQ',
  'OPEN_ENDED',
  'TRUE_FALSE',
  'FILL_BLANK',
  'DRAG_DROP',
  'LOGIC_MATCH',
  'SPELLING_CORRECT',
]);

export type QuestionType = z.infer<typeof QuestionTypeEnum>;

const baseQuestionSchema = z.object({
  id: z.string(),
  textId: z.string(),
  type: QuestionTypeEnum,
  instruction: z.string(),
  difficulty: z.enum(['KOLAY', 'ORTA', 'ZOR']),
  targetSkill: z.enum(['ANA_FIKIR', 'SEBEP_SONUC', 'SOZ_VARLIGI', 'YAZIM_NOKTALAMA', 'MANTIK']),
  learningOutcomes: z.array(z.string()),
  feedback: z.object({
    correct: z.string(),
    incorrect: z.string(),
  }),
});

// Çoktan Seçmeli (MCQ) Soru Şeması
export const mcqQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('MCQ'),
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        isCorrect: z.boolean(),
        imageUrl: z.string().url().optional(),
      })
    )
    .min(2),
});

// Sürükle Bırak (Sıralama) Soru Şeması
export const dragDropQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('DRAG_DROP'),
  items: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      correctOrder: z.number().int(),
    })
  ),
});

// Boşluk Doldurma Soru Şeması
export const fillBlankQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('FILL_BLANK'),
  template: z.string(), // Örn: "Ali {blank_1} gitti ve {blank_2} aldı."
  blanks: z.array(
    z.object({
      id: z.string(),
      correctValue: z.string(),
      acceptedValues: z.array(z.string()).optional(),
    })
  ),
  wordBank: z.array(z.string()).optional(),
});

// Tüm Soru Tipleri İçin Union Şema
export const questionSchema = z.discriminatedUnion('type', [
  mcqQuestionSchema,
  dragDropQuestionSchema,
  fillBlankQuestionSchema,
  // İleride diğer soru tipleri de eklenebilir. Şimdilik bu üçü yeterli (MVP için)
]);

export type BaseQuestion = z.infer<typeof baseQuestionSchema>;
export type MCQQuestion = z.infer<typeof mcqQuestionSchema>;
export type DragDropQuestion = z.infer<typeof dragDropQuestionSchema>;
export type FillBlankQuestion = z.infer<typeof fillBlankQuestionSchema>;
export type Question = z.infer<typeof questionSchema>;

// ==========================================
// 3. SESSION (OTURUM) ŞEMASI
// ==========================================
export const learningSessionSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  moduleType: z.enum(['TEXT_STUDIO', 'LOGIC_STUDIO', 'SPELLING_STUDIO']),
  startTime: z.date(),
  endTime: z.date().nullable(),
  interactions: z.array(
    z.object({
      questionId: z.string(),
      timeSpentMs: z.number().int().nonnegative(),
      attempts: z.number().int().nonnegative(),
      isCorrect: z.boolean(),
      givenAnswer: z.any(),
      hintsUsed: z.number().int().nonnegative(),
    })
  ),
  telemetry: z.object({
    frustrationClicks: z.number().int().nonnegative(),
    idleTimeMs: z.number().int().nonnegative(),
    readingRulerUsed: z.boolean(),
  }),
  score: z.number().int().nonnegative(),
});

export type LearningSession = z.infer<typeof learningSessionSchema>;
