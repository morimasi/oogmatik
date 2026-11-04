// ============================================================
// VisionStudio — Zod Şemaları
// TypeScript tipleri bu dosyadan türetilir.
// ============================================================
import { z } from 'zod';

// --- Temel şemalar ---
export const UploadedFileSchema = z.object({
  id: z.string().min(1),
  storagePath: z.string().min(1),
  downloadUrl: z.string().url(),
  fileName: z.string().min(1),
  fileType: z.enum(['pdf', 'image']),
  fileSizeBytes: z.number().int().positive().max(20 * 1024 * 1024, 'Dosya 20 MB\'dan küçük olmalı'),
  uploadedAt: z.string().datetime(),
  uploadedBy: z.string().min(1),
});

export const AIObjectiveSchema = z.object({
  code: z.string(),
  text: z.string().min(1),
});

export const AIAnalysisResultSchema = z.object({
  detectedCategory: z.enum(['matematik','turkce','fen','sosyal','ingilizce','sanat','beden','diger']),
  detectedGrade: z.string().min(1),
  detectedSubject: z.string().min(1),
  detectedDifficulty: z.enum(['kolay','orta','zor']),
  detectedObjectives: z.array(AIObjectiveSchema).min(1),
  detectedActivityType: z.string().min(1),
  summary: z.string().min(10),
  tokensUsed: z.number().int().nonnegative(),
  modelUsed: z.string().min(1),
});

// --- Bölüm içerikleri ---
const TextContentSchema       = z.object({ type: z.literal('text'),          text: z.string().min(1) });
const InstructionContentSchema= z.object({ type: z.literal('instruction'),   text: z.string().min(1) });
const PageBreakContentSchema  = z.object({ type: z.literal('pageBreak') });

const QuestionContentSchema = z.object({
  type: z.literal('question'),
  questionText: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
});

const FillInTheBlankContentSchema = z.object({
  type: z.literal('fillInTheBlank'),
  sentence: z.string().min(1),
  blanks: z.array(z.string()).min(1),
});

const MatchingContentSchema = z.object({
  type: z.literal('matching'),
  pairs: z.array(z.object({ left: z.string().min(1), right: z.string().min(1) })).min(2),
});

const TableContentSchema = z.object({
  type: z.literal('table'),
  headers: z.array(z.string().min(1)).min(1),
  rows: z.array(z.array(z.string())).min(1),
});

const ImageContentSchema = z.object({
  type: z.literal('image'),
  url: z.string().url(),
  alt: z.string().min(1),
  caption: z.string().optional(),
});

export const ActivitySectionContentSchema = z.discriminatedUnion('type', [
  TextContentSchema,
  InstructionContentSchema,
  PageBreakContentSchema,
  QuestionContentSchema,
  FillInTheBlankContentSchema,
  MatchingContentSchema,
  TableContentSchema,
  ImageContentSchema,
]);

export const ActivitySectionSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().nonnegative(),
  type: z.enum(['text','question','fillInTheBlank','matching','table','image','instruction','pageBreak']),
  title: z.string(),
  content: ActivitySectionContentSchema,
  points: z.number().nonnegative().default(0),
  objectiveRefs: z.array(z.string()).default([]),
});

export const GeneratedActivitySchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.literal(1),
  title: z.string().min(1, 'Başlık zorunlu'),
  grade: z.string().min(1),
  subject: z.string().min(1),
  category: z.enum(['matematik','turkce','fen','sosyal','ingilizce','sanat','beden','diger']),
  difficulty: z.enum(['kolay','orta','zor']),
  durationMinutes: z.number().int().positive().max(180),
  objectives: z.array(AIObjectiveSchema).min(1),
  instructions: z.string().min(1),
  sections: z.array(ActivitySectionSchema).min(1),
  answerKey: z.array(z.object({
    sectionId: z.string(),
    answer: z.string(),
    explanation: z.string(),
  })).default([]),
  teacherNotes: z.string().default(''),
  pedagogicalNote: z.string().min(1, 'pedagogicalNote zorunlu'),

  status: z.enum(['uploading','analyzing','ready','pending','approved','rejected']),
  ownerId: z.string().min(1),
  sourceFileId: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().nonnegative(),
  deletedAt: z.string().datetime().optional(),
  rejectionReason: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional(),
});

// API istek şeması — AI analize gönderilecek
export const AnalyzeRequestSchema = z.object({
  fileUrl: z.string().url('Gecerli bir dosya URL-si gerekli'),
  fileType: z.enum(['pdf', 'image']),
  fileId: z.string().min(1),
  userId: z.string().min(1),
  generateVariations: z.number().int().min(1).max(3).default(1),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type GeneratedActivityInput = z.infer<typeof GeneratedActivitySchema>;
