/**
 * OOGMATIK — Workbook Module Type Definitions
 *
 * Ultra-premium workbook editor tip tanımları
 *
 * @module types/workbook
 * @version 2.0.0
 * @author Bora Demir (Yazılım Mühendisi)
 *
 * KRITIK KURALLAR:
 * - TypeScript strict mode — `any` tipi YASAK
 * - Tüm öğrenme profilleri desteklenmeli (dyslexia, dyscalculia, adhd, mixed)
 * - KVKV uyumu zorunlu — öğrenci adı + tanı + skor birlikte görünmez
 * - pedagogicalNote her aktivitede ZORUNLU
 */

import {
  ActivityType,
  LearningDisabilityProfile,
  AgeGroup,
  Difficulty,
  StudentProfile,
  BEPGoal
} from './index';

// ============================================================================
// WORKBOOK EXPORT/IMPORT FORMATS
// ============================================================================

/**
 * Workbook dışa aktarma formatları (7 format)
 */
export type WorkbookExportFormat =
  | 'pdf'           // Standard PDF export
  | 'docx'          // Microsoft Word
  | 'pptx'          // Microsoft PowerPoint
  | 'epub'          // E-book format
  | 'interactive'   // Interactive HTML5
  | 'print-ready'   // Print-optimized PDF (CMYK, bleeds)
  | 'scorm';        // SCORM 1.2/2004 package

/**
 * Workbook içe aktarma kaynakları (10 kaynak)
 */
export type WorkbookImportSource =
  | 'file-upload'     // Local file upload
  | 'url'             // Remote URL
  | 'google-drive'    // Google Drive integration
  | 'onedrive'        // Microsoft OneDrive
  | 'dropbox'         // Dropbox
  | 'curriculum'      // MEB Müfredat
  | 'template'        // Hazır şablon
  | 'ocr-scan'        // Gemini Vision OCR
  | 'ai-generate'     // AI ile üretim
  | 'community';      // Topluluk paylaşımı

// ============================================================================
// WORKBOOK TEMPLATE SYSTEM
// ============================================================================

/**
 * Workbook şablon türleri (12 premium template)
 */
export type WorkbookTemplateType =
  | 'academic-standard'      // Standart akademik kitapçık
  | 'dyslexia-friendly'      // Disleksi dostu tasarım
  | 'dyscalculia-support'    // Diskalkuli destek
  | 'adhd-focus'             // ADHD odak artırıcı
  | 'exam-prep'              // Sınav hazırlık
  | 'skill-practice'         // Beceri pratiği
  | 'assessment-portfolio'   // Değerlendirme portfolyosu
  | 'bep-aligned'            // BEP uyumlu
  | 'creative-journal'       // Yaratıcı günlük
  | 'progress-tracker'       // İlerleme takip
  | 'multi-subject'          // Çok dersli
  | 'custom';                // Özel tasarım

/**
 * Workbook teması (UI görünüm)
 */
export type WorkbookTheme =
  | 'minimal'
  | 'playful'
  | 'nature'
  | 'space'
  | 'geometric'
  | 'luxury'
  | 'cyber'
  | 'artistic'
  | 'academic'
  | 'modern';

/**
 * Premium workbook şablonu
 */
export interface WorkbookTemplate {
  readonly id: string;
  readonly name: string;
  readonly type: WorkbookTemplateType;
  readonly description: string;

  // Pedagojik yapılandırma (Elif Yıldız onaylı)
  readonly targetProfile: LearningDisabilityProfile;
  readonly ageGroup: AgeGroup;
  readonly recommendedActivityCount: number;
  readonly difficultyDistribution: {
    readonly kolay: number;    // Yüzde (örn: 40)
    readonly orta: number;     // Yüzde (örn: 40)
    readonly zor: number;      // Yüzde (örn: 20)
  };

  // Görsel tasarım
  readonly theme: WorkbookTheme;
  readonly coverDesign: WorkbookCoverDesign;
  readonly pageLayout: WorkbookPageLayout;

  // İçerik yapısı
  readonly sections: WorkbookTemplateSection[];
  readonly includeTableOfContents: boolean;
  readonly includeDividerPages: boolean;
  readonly includeAnswerKey: boolean;

  // Metadata
  readonly isPremium: boolean;
  readonly isPublic: boolean;
  readonly createdBy: string;
  readonly createdAt: string; // ISO 8601
  readonly usageCount: number;
  readonly rating: number; // 0-5
}

/**
 * Şablon bölümü (section) tanımı
 */
export interface WorkbookTemplateSection {
  readonly title: string;
  readonly activityTypes: ActivityType[];
  readonly minActivities: number;
  readonly maxActivities: number;
  readonly allowCustomActivities: boolean;
}

/**
 * Kapak tasarımı yapılandırması
 */
export interface WorkbookCoverDesign {
  readonly backgroundColor: string;
  readonly textColor: string;
  readonly borderStyle: 'none' | 'simple' | 'decorative' | 'geometric';
  readonly illustration?: 'abstract' | 'educational' | 'playful' | 'nature' | 'custom';
  readonly logoPosition: 'top-left' | 'top-right' | 'center' | 'bottom';
}

/**
 * Sayfa düzeni yapılandırması
 */
export interface WorkbookPageLayout {
  readonly columns: 1 | 2;
  readonly marginTop: number;    // mm
  readonly marginBottom: number; // mm
  readonly marginLeft: number;   // mm
  readonly marginRight: number;  // mm
  readonly headerHeight: number; // mm
  readonly footerHeight: number; // mm
  readonly gutterWidth: number;  // mm (columns > 1)
}

// ============================================================================
// WORKBOOK CORE STRUCTURE
// ============================================================================

/**
 * Ana Workbook veri yapısı
 */
export interface Workbook {
  // Temel kimlik
  readonly id: string;
  readonly userId: string; // Sahip kullanıcı
  title: string;
  description?: string;

  // İçerik yapısı
  pages: WorkbookPage[];
  settings: WorkbookSettings;

  // Template & tema
  templateId?: string;
  templateType: WorkbookTemplateType;
  theme: WorkbookTheme;

  // Öğrenci profili (atanmış çalışma)
  assignedStudentId?: string;
  studentProfile?: StudentProfile;

  // Versiyon kontrolü
  version: number;
  versionHistory: WorkbookVersion[];

  // İşbirliği & paylaşım
  collaborators: WorkbookCollaborator[];
  isPublic: boolean;
  shareSettings: WorkbookShareSettings;

  // Analitik
  analytics: WorkbookAnalytics;

  // Metadata
  readonly createdAt: string; // ISO 8601
  updatedAt: string;          // ISO 8601
  lastAccessedAt: string;     // ISO 8601

  // Durum
  status: 'draft' | 'active' | 'archived' | 'deleted';
  deletedAt?: string;         // Soft delete (KVKV uyumu — 30 gün)

  // Etiketler & kategoriler
  tags: string[];
  category?: string;

  // AI öneriler (cache)
  aiSuggestions?: AISuggestionCache;
}

/**
 * Workbook sayfası
 */
export interface WorkbookPage {
  readonly id: string;
  readonly workbookId: string;
  order: number; // Sıralama

  // Sayfa tipi
  type: WorkbookPageType;

  // İçerik (type'a göre değişir)
  content: WorkbookPageContent;

  // Stil
  style?: WorkbookPageStyle;

  // Metadata
  readonly createdAt: string;
  updatedAt: string;

  // Öğrenci notları (öğrenci bu sayfayı tamamladığında)
  studentNotes?: WorkbookPageStudentNote[];
}

/**
 * Sayfa türleri
 */
export type WorkbookPageType =
  | 'cover'              // Kapak sayfası
  | 'table-of-contents'  // İçindekiler
  | 'divider'            // Bölüm ayırıcı
  | 'activity'           // Aktivite sayfası
  | 'blank'              // Boş sayfa (öğrenci notu için)
  | 'assessment'         // Değerlendirme sayfası
  | 'answer-key'         // Cevap anahtarı
  | 'back-cover';        // Arka kapak

/**
 * Sayfa içeriği (union type — type'a göre değişir)
 */
export type WorkbookPageContent =
  | WorkbookCoverContent
  | WorkbookTOCContent
  | WorkbookDividerContent
  | WorkbookActivityContent
  | WorkbookBlankContent
  | WorkbookAssessmentContent
  | WorkbookAnswerKeyContent
  | WorkbookBackCoverContent;

/**
 * Kapak sayfası içeriği
 */
export interface WorkbookCoverContent {
  readonly type: 'cover';
  title: string;
  subtitle?: string;
  studentName?: string; // KVKV: Sadece atanmış workbook'larda, tanı bilgisi ile birlikte ASLA
  gradeLevel?: string;
  schoolYear?: string;
  coverDesign: WorkbookCoverDesign;
}

/**
 * İçindekiler sayfası içeriği
 */
export interface WorkbookTOCContent {
  readonly type: 'table-of-contents';
  entries: WorkbookTOCEntry[];
  autoGenerate: boolean; // true ise otomatik oluştur
}

export interface WorkbookTOCEntry {
  readonly pageId: string;
  title: string;
  pageNumber: number;
  level: 1 | 2 | 3; // Başlık seviyesi
}

/**
 * Bölüm ayırıcı sayfası içeriği
 */
export interface WorkbookDividerContent {
  readonly type: 'divider';
  sectionTitle: string;
  sectionNumber?: number;
  design?: 'simple' | 'decorative' | 'illustrated';
}

/**
 * Aktivite sayfası içeriği
 */
export interface WorkbookActivityContent {
  readonly type: 'activity';
  activityId?: string;      // Kayıtlı aktivite ID (varsa)
  activityType: ActivityType;
  activityData: unknown;     // Aktiviteye özel veri (any yasak — unknown kullan)

  // Pedagojik bilgi (ZORUNLU)
  pedagogicalNote: string;
  targetSkills: string[];
  difficulty: Difficulty;
  estimatedDuration: number; // dakika

  // Öğrenci profil uyumu
  profile: LearningDisabilityProfile;
  ageGroup: AgeGroup;

  // BEP hedefi (varsa)
  bepGoalIds?: string[];
}

/**
 * Boş sayfa içeriği (öğrenci notu için)
 */
export interface WorkbookBlankContent {
  readonly type: 'blank';
  prompt?: string; // Öğrenciye yönlendirme (örn: "Düşüncelerini buraya yaz")
  lineType: 'none' | 'dotted' | 'solid' | 'grid';
  lineSpacing: number; // mm
}

/**
 * Değerlendirme sayfası içeriği
 */
export interface WorkbookAssessmentContent {
  readonly type: 'assessment';
  assessmentId?: string;
  questions: unknown[]; // Değerlendirme soruları
  scoringRubric?: unknown;
}

/**
 * Cevap anahtarı içeriği
 */
export interface WorkbookAnswerKeyContent {
  readonly type: 'answer-key';
  answers: WorkbookAnswer[];
  showExplanations: boolean;
}

export interface WorkbookAnswer {
  readonly pageId: string;
  readonly questionNumber: number;
  answer: string;
  explanation?: string;
}

/**
 * Arka kapak içeriği
 */
export interface WorkbookBackCoverContent {
  readonly type: 'back-cover';
  text?: string;
  qrCode?: string; // QR kod URL'i
  logo?: string;
}

/**
 * Sayfa stili (override için)
 */
export interface WorkbookPageStyle {
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number; // px
  lineHeight?: number;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Öğrenci notları (öğrenci sayfayı tamamladığında)
 */
export interface WorkbookPageStudentNote {
  readonly studentId: string;
  completedAt: string; // ISO 8601
  score?: number;
  timeSpent?: number; // saniye
  notes?: string;
  attachments?: string[]; // Dosya URL'leri
}

// ============================================================================
// WORKBOOK SETTINGS
// ============================================================================

/**
 * Workbook ayarları
 */
export interface WorkbookSettings {
  // Sayfa düzeni
  pageSize: 'A4' | 'Letter' | 'B5';
  orientation: 'portrait' | 'landscape';
  layout: WorkbookPageLayout;

  // Tipografi
  fontFamily: string;
  baseFontSize: number; // px
  lineHeight: number;
  letterSpacing: number; // px
  wordSpacing: number;   // px

  // Disleksi uyumu
  dyslexiaMode: boolean;
  highlightSyllables: boolean;
  syllableColors?: string[];

  // İçerik yapısı
  showPageNumbers: boolean;
  showTableOfContents: boolean;
  showAnswerKey: boolean;
  includeDividerPages: boolean;

  // Export
  defaultExportFormat: WorkbookExportFormat;

  // Print
  printMargins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  // Accessibility
  highContrast: boolean;
  largePrint: boolean;
  screenReaderOptimized: boolean;
}

// ============================================================================
// VERSION CONTROL
// ============================================================================

/**
 * Workbook versiyonu (50 versiyon limit)
 */
export interface WorkbookVersion {
  readonly versionNumber: number;
  readonly workbookId: string;
  readonly snapshot: Partial<Workbook>; // Tam snapshot çok yer kaplar
  readonly changeDescription: string;
  readonly changedBy: string; // userId
  readonly createdAt: string; // ISO 8601

  // Diff (önceki versiyondan farklar)
  diff?: WorkbookVersionDiff;
}

export interface WorkbookVersionDiff {
  pagesAdded: string[];    // page IDs
  pagesRemoved: string[];  // page IDs
  pagesModified: string[]; // page IDs
  settingsChanged: boolean;
}

// ============================================================================
// COLLABORATION & SHARING
// ============================================================================

/**
 * Workbook işbirlikçisi
 */
export interface WorkbookCollaborator {
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  permission: CollaborationPermission;
  readonly addedAt: string; // ISO 8601
  addedBy: string; // userId
}

/**
 * İşbirliği izin seviyeleri (KVKV uyumu — Dr. Ahmet Kaya onaylı)
 */
export type CollaborationPermission =
  | 'view'      // Sadece görüntüleme
  | 'comment'   // Görüntüleme + yorum
  | 'edit'      // Düzenleme (sayfa ekle/sil/değiştir)
  | 'admin';    // Tam kontrol (paylaşım, silme dahil)

/**
 * Paylaşım ayarları
 */
export interface WorkbookShareSettings {
  isPublic: boolean;
  allowCopy: boolean;       // Kopya alınabilir mi?
  allowDownload: boolean;   // İndirilebilir mi?
  requireApproval: boolean; // Erişim için onay gerekli mi?

  // KVKV uyumu — öğrenci verisi anonimleştirme
  anonymizeStudentData: boolean;

  // Paylaşım linki
  shareLink?: string;
  shareLinkExpiry?: string; // ISO 8601
  shareLinkPassword?: string;
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Workbook analitik verileri
 */
export interface WorkbookAnalytics {
  // Kullanım istatistikleri
  viewCount: number;
  downloadCount: number;
  copyCount: number;
  shareCount: number;

  // Öğrenci performansı (atanmış workbook'lar için)
  studentProgress?: WorkbookStudentProgress;

  // Sayfa bazlı metrikler
  pageMetrics: Map<string, WorkbookPageMetrics>; // pageId -> metrics

  // Toplam süre
  totalTimeSpent: number; // saniye

  // Son güncelleme
  lastCalculatedAt: string; // ISO 8601
}

export interface WorkbookStudentProgress {
  readonly studentId: string;
  completedPages: number;
  totalPages: number;
  averageScore?: number;
  totalTimeSpent: number; // saniye
  lastActivityAt: string; // ISO 8601

  // Beceri gelişimi
  skillProgress: Map<string, number>; // skill name -> progress (0-100)

  // BEP hedef ilerlemesi
  bepGoalProgress?: Map<string, number>; // goalId -> progress (0-100)
}

export interface WorkbookPageMetrics {
  readonly pageId: string;
  viewCount: number;
  completionCount: number;
  averageTimeSpent: number; // saniye
  averageScore?: number;
  difficultyRating?: number; // Öğrencilerin algıladığı zorluk (1-5)
}

// ============================================================================
// AI SUGGESTIONS & CACHE
// ============================================================================

/**
 * AI öneri cache (10 dakika TTL)
 */
export interface AISuggestionCache {
  readonly workbookId: string;
  suggestions: AISuggestion[];
  readonly generatedAt: string; // ISO 8601
  readonly expiresAt: string;   // ISO 8601
}

/**
 * AI önerisi
 */
export interface AISuggestion {
  readonly id: string;
  type: AIWorkbookSuggestionType;
  title: string;
  description: string;
  confidence: number; // 0-1

  // Tip-spesifik data
  data: unknown;

  // Kullanıcı aksiyonu
  status: 'pending' | 'accepted' | 'rejected' | 'applied';
  appliedAt?: string; // ISO 8601
}

/**
 * AI öneri türleri
 */
export type AIWorkbookSuggestionType =
  | 'add-activity'          // Yeni aktivite önerisi
  | 'reorder-pages'         // Sayfa sıralaması önerisi
  | 'adjust-difficulty'     // Zorluk ayarlama
  | 'add-divider'           // Bölüm ayırıcı önerisi
  | 'improve-balance'       // Aktivite dengesi
  | 'fill-skill-gap'        // Beceri boşluğu doldurma
  | 'add-assessment'        // Değerlendirme önerisi
  | 'improve-pedagogy';     // Pedagojik not iyileştirme

// ============================================================================
// IMPORT/EXPORT TYPES
// ============================================================================

/**
 * Export yapılandırması
 */
export interface WorkbookExportConfig {
  format: WorkbookExportFormat;
  includeAnswers: boolean;
  includeStudentData: boolean; // KVKV: false ise anonimleştir
  watermark?: string;

  // Format-spesifik ayarlar
  pdfOptions?: PDFExportOptions;
  docxOptions?: DocxExportOptions;
  epubOptions?: EpubExportOptions;
  scormOptions?: ScormExportOptions;
}

export interface PDFExportOptions {
  quality: 'low' | 'medium' | 'high' | 'print-ready';
  colorMode: 'RGB' | 'CMYK';
  embedFonts: boolean;
  addBleed: boolean;   // Print-ready için
  bleedSize?: number;  // mm
}

export interface DocxExportOptions {
  templateFile?: string;
  preserveFormatting: boolean;
}

export interface EpubExportOptions {
  coverImage?: string;
  metadata: {
    author: string;
    publisher?: string;
    isbn?: string;
  };
}

export interface ScormExportOptions {
  version: '1.2' | '2004';
  trackingMode: 'completed' | 'passed' | 'scored';
}

/**
 * Import yapılandırması
 */
export interface WorkbookImportConfig {
  source: WorkbookImportSource;
  mergeWithExisting: boolean; // true ise mevcut workbook'a ekle

  // Kaynak-spesifik ayarlar
  fileUploadOptions?: FileUploadImportOptions;
  ocrOptions?: OCRImportOptions;
  aiGenerateOptions?: AIGenerateImportOptions;
}

export interface FileUploadImportOptions {
  file: File;
  preserveFormatting: boolean;
}

export interface OCRImportOptions {
  imageUrl: string;
  language: 'tr' | 'en';
  autoCorrect: boolean;
}

export interface AIGenerateImportOptions {
  prompt: string;
  templateType?: WorkbookTemplateType;
  targetProfile: LearningDisabilityProfile;
  ageGroup: AgeGroup;
  pageCount: number;
}

// ============================================================================
// VALIDATION CONSTRAINTS
// ============================================================================

/**
 * Workbook kısıtları (validation için)
 */
export const WORKBOOK_CONSTRAINTS = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  MIN_PAGES: 1,
  MAX_PAGES: 200,
  MAX_TAGS: 10,
  TAG_MAX_LENGTH: 30,
  MAX_COLLABORATORS: 50,
  MAX_VERSIONS: 50,
  VERSION_RETENTION_DAYS: 90,
  SOFT_DELETE_RETENTION_DAYS: 30,
  MAX_SHARE_LINK_AGE_DAYS: 365,
} as const;

/**
 * AI rate limits (Selin Arslan onaylı)
 */
export const AI_RATE_LIMITS = {
  MAX_SUGGESTIONS_PER_REQUEST: 10,
  MAX_REQUESTS_PER_HOUR: 100,
  CACHE_TTL_SECONDS: 600,      // 10 dakika
  MAX_BATCH_SIZE: 5,            // Batch processing
  TOKEN_LIMIT_PER_REQUEST: 600,
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Workbook creation payload (API için)
 */
export interface CreateWorkbookPayload {
  title: string;
  description?: string;
  templateId?: string;
  templateType: WorkbookTemplateType;
  assignedStudentId?: string;
  settings?: Partial<WorkbookSettings>;
}

/**
 * Workbook update payload (API için)
 */
export interface UpdateWorkbookPayload {
  title?: string;
  description?: string;
  pages?: WorkbookPage[];
  settings?: Partial<WorkbookSettings>;
  tags?: string[];
  category?: string;
}

/**
 * Workbook list query (API için)
 */
export interface WorkbookListQuery {
  userId?: string;
  status?: Workbook['status'];
  templateType?: WorkbookTemplateType;
  assignedStudentId?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Workbook istatistikleri (dashboard için)
 */
export interface WorkbookStats {
  totalWorkbooks: number;
  activeWorkbooks: number;
  archivedWorkbooks: number;
  totalPages: number;
  totalStudents: number;
  averageCompletionRate: number;
  mostUsedTemplates: Array<{
    templateType: WorkbookTemplateType;
    count: number;
  }>;
  recentActivity: Array<{
    workbookId: string;
    activityType: string;
    timestamp: string;
  }>;
}
