// ============================================================
// VisionStudio — Tip Tanımları
// Zod şemalarından türetilir; tek doğruluk kaynağı: schemas/visionStudio.ts
// ============================================================

export type UploadFileType = 'pdf' | 'image';

export type ActivityStatus =
  | 'uploading'
  | 'analyzing'
  | 'ready'
  | 'pending'
  | 'approved'
  | 'rejected';

export type ActivityCategory =
  | 'matematik'
  | 'turkce'
  | 'fen'
  | 'sosyal'
  | 'ingilizce'
  | 'sanat'
  | 'beden'
  | 'diger';

export type DifficultyLevel = 'kolay' | 'orta' | 'zor';

// --- Yükleme ---
export interface UploadedFile {
  id: string;
  storagePath: string;      // Firebase Storage tam yolu
  downloadUrl: string;
  fileName: string;
  fileType: UploadFileType;
  fileSizeBytes: number;
  uploadedAt: string;       // ISO 8601
  uploadedBy: string;       // userId
}

// --- AI Analiz Çıktısı ---
export interface AIObjective {
  code: string;             // örn. "M.5.2.1"
  text: string;
}

export interface AIAnalysisResult {
  detectedCategory: ActivityCategory;
  detectedGrade: string;    // örn. "5. Sınıf"
  detectedSubject: string;
  detectedDifficulty: DifficultyLevel;
  detectedObjectives: AIObjective[];
  detectedActivityType: string; // çalışma sayfası, test, bulmaca vb.
  summary: string;              // AI'ın etkinliği anlatan kısa özeti
  tokensUsed: number;
  modelUsed: string;
}

// --- Üretilen Varyasyon Bölümü ---
export type SectionType =
  | 'text'
  | 'question'
  | 'fillInTheBlank'
  | 'matching'
  | 'table'
  | 'image'
  | 'instruction'
  | 'pageBreak';

export interface ActivitySection {
  id: string;
  order: number;
  type: SectionType;
  title: string;
  content: ActivitySectionContent;
  points: number;
  objectiveRefs: string[];
}

// Discriminated union — her tip için ayrı içerik
export type ActivitySectionContent =
  | TextContent
  | QuestionContent
  | FillInTheBlankContent
  | MatchingContent
  | TableContent
  | ImageContent
  | InstructionContent
  | PageBreakContent;

export interface TextContent       { type: 'text';          text: string; }
export interface InstructionContent{ type: 'instruction';   text: string; }
export interface PageBreakContent  { type: 'pageBreak'; }

export interface QuestionContent {
  type: 'question';
  questionText: string;
  options?: string[];        // çoktan seçmeli için
  correctAnswer?: string;
  explanation?: string;
}

export interface FillInTheBlankContent {
  type: 'fillInTheBlank';
  sentence: string;         // "___ ile ___ eşleştir" biçiminde boşluklar
  blanks: string[];         // doğru cevaplar listesi
}

export interface MatchingContent {
  type: 'matching';
  pairs: Array<{ left: string; right: string }>;
}

export interface TableContent {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface ImageContent {
  type: 'image';
  url: string;
  alt: string;
  caption?: string;
}

// --- Üretilen Etkinlik (Varyasyon) ---
export interface GeneratedActivity {
  id: string;
  schemaVersion: 1;
  title: string;
  grade: string;
  subject: string;
  category: ActivityCategory;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  objectives: AIObjective[];
  instructions: string;
  sections: ActivitySection[];
  answerKey: Array<{ sectionId: string; answer: string; explanation: string }>;
  teacherNotes: string;
  pedagogicalNote: string;  // zorunlu — AGENTS.md kuralı

  // Meta
  status: ActivityStatus;
  ownerId: string;
  sourceFileId: string;         // yüklenen dosyanın id'si
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedAt?: string;           // soft-delete

  // Onay
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
}

// --- Audit Log ---
export interface AuditLogEntry {
  from: ActivityStatus;
  to: ActivityStatus;
  actorId: string;
  actorRole: 'teacher' | 'admin';
  at: string;
  reason?: string;
}

// --- Stüdyo Genel State ---
export interface VisionStudioState {
  step: 'upload' | 'analyzing' | 'preview' | 'approval';
  uploadedFile: UploadedFile | null;
  analysisResult: AIAnalysisResult | null;
  generatedActivities: GeneratedActivity[];
  selectedActivityId: string | null;
  isLoading: boolean;
  error: string | null;
}
