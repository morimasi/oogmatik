declare global {
  namespace JSX {
    interface IntrinsicElements extends Record<string, unknown> { }
  }
}

import {
  Activity,
  ActivityCategory,
  WorksheetBlock,
  CognitiveErrorTag,
  ActivityType,
} from './activity';
import { User, UserRole, UserStatus } from './user';
import { Student, StudentProfile } from './student';
import { LayoutItem, LayoutSectionId, ReadingStudioConfig } from './studio';

export { ActivityType };
export type {
  Activity,
  ActivityCategory,
  WorksheetBlock,
  CognitiveErrorTag,
  User,
  UserRole,
  UserStatus,
  Student,
  StudentProfile,
  LayoutItem,
  LayoutSectionId,
  ReadingStudioConfig,
};

import type {
  StyleSettings,
  BaseActivityData,
  CognitiveDomain,
  ShapeType,
  VisualMathType,
  Difficulty
} from './common';

export type { ShapeType, StyleSettings, BaseActivityData, Difficulty } from './common';

export interface SingleWorksheetData extends BaseActivityData {
  layoutArchitecture?: {
    cols?: number;
    gap?: number;
    blocks: WorksheetBlock[];
  };
  metadata?: Record<string, unknown>;
  id?: string;
  type?: ActivityType | string;
  puzzles?: Record<string, unknown>[];
  items?: Record<string, unknown>[];
  blocks?: WorksheetBlock[];
  content?: unknown;
  targetSkills?: string[];
  difficultyLevel?: string;
  ageGroup?: string;
  [key: string]: unknown;
}
export type WorksheetData = SingleWorksheetData[] | null;

export interface GeneratorOptions {
  mode?: 'fast' | 'ai';
  difficulty?: string;
  worksheetCount?: number;
  itemCount?: number;
  topic?: string;
  gridSize?: number;
  puzzleCount?: number;
  patternType?: 'arithmetic' | 'geometric' | 'complex' | 'color_blocks' | 'logic_sequence';
  variant?: string;
  studentContext?: Student;
  memorizeRatio?: number;
  targetLetters?: string;
  visualType?: 'geometric' | 'abstract' | 'character' | 'complex';
  fontFamily?: string;
  case?: 'upper' | 'lower';
  numberRange?: string | [number, number];
  codeLength?: number;
  targetChar?: string;
  distractorChar?: string;
  gridRows?: number;
  gridCols?: number;
  syllableRange?: string;
  pyramidHeight?: number;
  layoutDensity?: 'compact' | 'normal' | 'relaxed';
  selectedOperations?: string[];
  visualStyle?: string;
  showNumbers?: boolean;
  showImage?: boolean;
  targetPair?: string;
  mapInstructionTypes?: string[];
  showCityNames?: boolean;
  markerStyle?: string;
  emphasizedRegion?: string;
  customInput?: string;
  operationType?: string;
  distractionLevel?: 'low' | 'medium' | 'high' | 'extreme';
  fontSize?: 'small' | 'medium' | 'large' | 'xl';
  fontSizePreference?: 'small' | 'medium' | 'large';
  visualComplexity?: 'simple' | 'balanced' | 'complex';
  targetFrequency?: string;
  distractorStrategy?: string;
  findDiffType?: string;
  genre?: string;
  tone?: string;
  include5N1K?: boolean;
  focusVocabulary?: boolean;
  includeCreativeTask?: boolean;
  includeImage?: boolean;
  showSumTarget?: boolean;
  concept?: string;
  density?: 'low' | 'medium' | 'high';
  hintLevel?: 'low' | 'medium' | 'high' | 'none';
  textLength?: 'kısa' | 'orta' | 'uzun';
  questionStyle?:
  | 'test_and_open'
  | 'only_test'
  | 'only_open_ended'
  | 'mixed'
  | '5n1k'
  | 'detail'
  | 'inference'
  | 'true_false'
  | 'open_ended';
  generationMode?: 'fast' | 'ai';
  premiumMode?: boolean;
  syllableColoring?: boolean;
  wpmTarget?: number;
  colorPalette?: 'red_blue' | 'contrast' | 'pastel' | 'indigo' | 'rose' | 'emerald' | 'amber' | 'slate' | 'colorful';
  highlightType?: 'vowels_only' | 'syllables' | 'words';
  familySize?: 'nuclear' | 'extended';
  clueComplexity?: 'direct' | 'logical';
  emptyNodesCount?: number;
  apartmentFloors?: number;
  apartmentRoomsPerFloor?: number;
  variableCount?: number;
  negativeClues?: boolean;
  currency?: 'TRY' | 'USD' | 'EUR';
  useCents?: boolean;
  budgetLimit?: number;
  cartSize?: number;
  obstacleDensity?: number;
  cipherType?: 'arrows' | 'letters' | 'colors';
  absurdityDegree?: 'minimal' | 'obvious' | 'surreal';
  errorCount?: number;
  useGridSystem?: boolean;
  targetShape?: string;
  mapType?: 'turkey' | 'world' | 'treasure';
  includeCompass?: boolean;
  cognitiveLoad?: number;
  includeClinicalNotes?: boolean;
  generateImage?: boolean;
  showCoordinates?: boolean;
  showSymmetryLine?: boolean;
  pathType?: 'straight' | 'curved' | 'angular';
  connectDots?: boolean;
  showPoints?: boolean;
  // Yeni Aktiviteler - Gizemli Sayılar
  clueCount?: number;
  operationTypes?: ('topla' | 'cikar' | 'carp' | 'bol')[];
  includeMultiStep?: boolean;
  includeModular?: boolean;
  includeDigitClue?: boolean;
  layoutStyle?: 'ipucu-liste' | 'matris' | 'kartezyen';
  // Yeni Aktiviteler - Meyveli Toplama
  fruitTypes?: string[];
  maxSum?: number;
  maxFruitCount?: number;
  includeNegative?: boolean;
  // Yeni Aktiviteler - Sayı Dedektifi
  mysteryNumber?: number;
  clueTypes?: ('greater' | 'less' | 'mod' | 'digit' | 'prime' | 'square')[];
  includeRangeClue?: boolean;
  // Yeni Aktiviteler - Kavram Haritası
  depth?: number;
  branchCount?: number;
  fillRatio?: number;
  layout?: 'radial' | 'tree' | 'horizontal' | 'vertical' | 'ultra_full' | 'ultra_dense';
  nodeStyle?: 'rounded' | 'sharp' | 'circle';
  edgeStyle?: 'straight' | 'curved' | 'orthogonal';
  includeExamples?: boolean;
  includeDefinitions?: boolean;
  colorScheme?: 'monochrome' | 'rainbow' | 'pastel';
  // Yeni Aktiviteler - Eş Anlamlı Kelimeler
  wordCount?: number;
  pairsPerRow?: number;
  includeAntonyms?: boolean;
  includeHomophones?: boolean;
  wordCategory?: 'all' | 'nouns' | 'verbs' | 'adjectives';
  // Yeni Aktiviteler - 5N1K
  includeAllQuestions?: boolean;
  passageLength?: 'short' | 'medium' | 'long';
  includeMultipleChoice?: boolean;
  targetSkills?: string[];
  
  // Hikaye Analizi Ultra Pro
  ageGroup?: '5-7' | '8-10' | '11-13' | '14+';
  gradeLevel?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  analysisDepth?: 'temel' | 'detaylı' | 'akademik';
  showStoryMap?: boolean;
  includeCharacterAnalysis?: boolean;
  includeSettingAnalysis?: boolean;
  includeConflictResolution?: boolean;
  includeMainIdea?: boolean;
  includeSubThemes?: boolean;
  includeThematicQuestions?: boolean;
  includeInferentialQuestions?: boolean;
  includeCreativeQuestions?: boolean;
  questionCount?: number;
  storyLength?: 'kısa' | 'orta' | 'uzun' | 'çok uzun';
  vocabularyLevel?: 'basit' | 'orta' | 'zor' | 'akademik';
  sentenceComplexity?: 'basit' | 'birleşik' | 'karmaşık';
  includeVocabularyList?: boolean;
  vocabularyWordCount?: number;
  compactLayout?: boolean;
  useIcons?: boolean;
  showReadingRuler?: boolean;
  
  // Eksik Parçaları Tamamlama
  blankType?: 'word' | 'phrase' | 'sentence' | 'number';
  blankCount?: number;
  blankSize?: 'small' | 'medium' | 'large';
  blankStyle?: 'underline' | 'dashed' | 'solid' | 'dotted';
  showLineNumber?: boolean;
  showParagraphNumbers?: boolean;
  showWordBank?: boolean;
  showVisualHints?: boolean;
  includeDistractors?: boolean;
  distractorCount?: number;
  semanticComplexity?: 'low' | 'medium' | 'high';
  showInstructions?: boolean;
  showExamples?: boolean;
  includeTimer?: boolean;
  showProgress?: boolean;
  lineHeight?: 'tight' | 'normal' | 'relaxed';
  columnLayout?: 'single' | 'two-column';
  maxParagraphsPerPage?: number;
  
  // Resim Yorumlama Analiz
  itemCountVisual?: number;
  visualInterpretationStyle?: 'true_false' | 'multiple_choice' | 'open_ended' | 'mixed';
  includeDetailQuestions?: boolean;
  includeInferentialVisualQuestions?: boolean;
  includeCreativeVisualQuestions?: boolean;
  visualComplexityLevel?: 'simple' | 'medium' | 'complex' | 'ultra';
  includeAnswerKey?: boolean;
  includeObservationNotes?: boolean;
  
  // Kısa Cevaplı Sorular (Premium)
  itemCountShort?: number;
  questionType?: 'open_ended' | 'fill_in_blank' | 'two_choice' | 'mixed' | 'visual_analysis' | 'scenario_based' | 'creative_thinking';
  includeVisualHints?: boolean;
  includeAnswerLines?: boolean;
  answerLineCount?: number;
  includeHints?: boolean;
  includePoints?: boolean;
  includeScenarios?: boolean;
  includeVisualAnalysis?: boolean;
  includeCreativeThinking?: boolean;
  lineStyle?: 'single' | 'double' | 'dotted' | 'dashed';
  lineColor?: 'standard' | 'light' | 'dark' | 'blue' | 'green' | 'red';
  marginSize?: 'narrow' | 'normal' | 'wide';
  showBorders?: boolean;
  colorTheme?: 'classic' | 'blue' | 'green' | 'purple' | 'amber';
  isPreschoolMode?: boolean;
  usePictures?: boolean;
  largeButtons?: boolean;
  simpleWords?: boolean;
  isElementaryMode?: boolean;
  vocabularySupport?: boolean;
  
  // Ek aktivite config özellikleri
  selectedCategories?: string[];
  showHints?: boolean;
  aestheticMode?: string;
  classLevel?: string;
  puzzleType?: string;
  storyMode?: boolean;
  colorfulText?: boolean;
  complexity?: string;
  profile?: string;
  compact?: boolean;
  showPredicate?: boolean;
  overlapping?: boolean;
  panelCount?: number;
  showTransitionWords?: boolean;
  count?: number;
  customSettings?: Record<string, unknown>;
  itemsPerPage?: number;
  locationType?: string;
  studentAge?: number;
  padding?: number;
  _worksheetCount?: number;
  _studentContext?: Record<string, unknown>;
  _difficulty?: string;
  params?: Record<string, unknown>;
  theme?: string;
  [key: string]: unknown;
}

export interface OverlayItem {
  id: string;
  type: 'sticker' | 'text' | 'drawing';
  content: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
}

export interface ActiveCurriculumSession {
  planId: string;
  day: number;
  activityId: string;
  activityTitle: string;
  studentName: string;
  studentId?: string;
  difficulty: Difficulty;
  goal: string;
}

export interface SavedWorksheet {
  id: string;
  userId: string;
  studentId?: string;
  studentName?: string;
  name: string;
  activityType: ActivityType;
  worksheetData: SingleWorksheetData[];
  createdAt: string;
  icon: string;
  category: { id: string; title: string };
  sharedBy?: string;
  sharedByName?: string;
  sharedWith?: string | string[];
  originalWorksheetId?: string;
  isPrivate?: boolean;
  styleSettings?: StyleSettings;
  studentProfile?: StudentProfile;
  workbookItems?: CollectionItem[];
  workbookSettings?: WorkbookSettings;
}

export type AppTheme =
  | 'light'
  | 'dark'
  | 'anthracite'
  | 'space'
  | 'nature'
  | 'ocean'
  | 'anthracite-gold'
  | 'anthracite-cyber'
  | 'oled-black'
  | 'dyslexia-cream'
  | 'dyslexia-mint';

export interface HistoryItem {
  id: string;
  userId: string;
  studentId?: string;
  studentName?: string;
  activityType: ActivityType;
  data: SingleWorksheetData[];
  timestamp: string;
  title: string;
  category: { id: string; title: string };
}

export type View =
  | 'premium_studio'
  | 'generator'
  | 'activity-studio'
  | 'savedList'
  | 'workbook'
  | 'favorites'
  | 'shared'
  | 'admin'
  | 'profile'
  | 'assessment'
  | 'screening'
  | 'ocr'
  | 'curriculum'
  | 'reading-studio'
  | 'math-studio'
  | 'super-turkce'
  | 'sinav-studyosu'
  | 'mat-sinav-studyosu'
  | 'sari-kitap-studio'
  | 'kelime-cumle-studio'
  | 'messages'
  | 'infographic-studio'
  | 'students';

export interface UiSettings {
  fontFamily: string;
  fontSizeScale: number;
  fontWeight: 'thin' | 'normal' | 'medium' | 'bold' | 'black';
  letterSpacing: 'normal' | 'wide';
  lineHeight: number;
  saturation: number;
  compactMode: boolean;
  premiumIntensity: number; // 0-100 (blur/glass effect)
  contrastLevel: number; // 0-100
  borderRadius?: 'none' | 'sm' | 'xl' | 'full';
  animationLevel?: 'full' | 'reduced' | 'none';
}

export interface WorkbookPageData {
  pageIndex: number;
  pageTitle: string;      // "Etkinlik - Sayfa 1/3"
  data: Record<string, unknown> | SingleWorksheetData;  // Renderer'a gönderilecek ham veri
}

export interface WorkbookPageContract {
  activityType: ActivityType;  // Renderer seçimi için
  title: string;               // İçindekiler için
  pages: WorkbookPageData[];   // HER ZAMAN array — tek sayfa bile olsa
}

export interface CollectionItem {
  id: string;
  activityType: ActivityType;
  itemType?: 'activity' | 'divider';
  data: WorkbookPageContract | SingleWorksheetData[] | Record<string, unknown>; // Yeni contract eklendi, eskiler fallback için
  settings: StyleSettings;
  overrideStyle?: Partial<StyleSettings>;
  title: string;
  dividerConfig?: {
    title: string;
    subtitle: string;
    icon: string;
  };
}

export interface WorkbookSettings {
  title: string;
  studentName: string;
  schoolName: string;
  year: string;
  teacherNote: string;
  theme:
  | 'modern'
  | 'classic'
  | 'fun'
  | 'minimal'
  | 'academic'
  | 'artistic'
  | 'space'
  | 'nature'
  | 'geometric'
  | 'cyber'
  | 'luxury'
  | 'playful';
  accentColor: string;
  coverStyle: 'centered' | 'left' | 'split' | 'hero' | 'minimalist';
  showTOC: boolean;
  showPageNumbers: boolean;
  showWatermark: boolean;
  watermarkOpacity: number;
  showBackCover: boolean;
  logoUrl?: string;
  aiPreface?: string;
  isAiGeneratedCover?: boolean;
  aiCoverConcept?: string;
  fontFamily?: string;
  layoutDensity?: 'compact' | 'comfortable' | 'spacious';
  showHeaderOnEveryPage?: boolean;
  customBackCoverNote?: string;
  orientation?: 'portrait' | 'landscape';
  margin?: number;
}

export interface SubTestResult {
  testId: CognitiveDomain;
  name: string;
  score: number;
  rawScore: number;
  totalItems: number;
  avgReactionTime: number;
  accuracy: number;
  status: 'completed' | 'skipped' | 'partial';
  timestamp: number;
}

export interface ClinicalObservation {
  anxietyLevel: 'low' | 'medium' | 'high';
  attentionSpan: 'focused' | 'distracted' | 'hyperactive';
  motorSkills: 'typical' | 'delayed' | 'precise';
  // Genişletilmiş klinik indikatörler (FAZ 4)
  cooperationLevel?: 'cooperative' | 'reluctant' | 'resistant';
  fatigueIndex?: 'normal' | 'mild' | 'severe';
  frustrationTolerance?: 'high' | 'medium' | 'low';
  verbalization?: 'adequate' | 'limited' | 'excessive';
  eyeContact?: 'normal' | 'reduced' | 'avoidant';
  notes: string;
}

export interface AssessmentRoadmapItem {
  activityId: ActivityType | string;
  title: string;
  reason: string;
  frequency: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ProfessionalAssessmentReport {
  id: string;
  studentId: string;
  studentName: string;
  examinerId: string;
  date: string;
  duration: number;
  subTests: SubTestResult[];
  observations: ClinicalObservation;
  overallRiskAnalysis: {
    dyslexiaRisk: 'low' | 'moderate' | 'high';
    dyscalculiaRisk: 'low' | 'moderate' | 'high';
    attentionDeficitRisk: 'low' | 'moderate' | 'high';
    summary: string;
  };
  recommendations: string[];
  roadmap: AssessmentRoadmapItem[];
}

export interface SavedAssessment {
  id: string;
  userId: string;
  studentId?: string;
  studentName: string;
  gender: 'Kız' | 'Erkek';
  age: number;
  grade: string;
  createdAt: string;
  report: AssessmentReport;
  sharedBy?: string;
  sharedByName?: string;
  sharedWith?: string | string[];
  originalAssessmentId?: string;
}

export interface AssessmentReport {
  overallSummary: string;
  scores: Record<string, number>;
  chartData: { label: string; value: number; fullMark: number }[];
  analysis: {
    strengths: string[];
    weaknesses: string[];
    errorAnalysis: string[];
  };
  roadmap: { activityId: string; reason: string; frequency: string }[];
  observations?: ClinicalObservation;
  professionalData?: ProfessionalAssessmentReport;
}

export interface ActivityStats {
  activityId: ActivityType;
  title: string;
  generationCount: number;
  lastGenerated: string;
  avgCompletionTime?: number;
}

export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'content';
export type FeedbackStatus = 'new' | 'read' | 'in-progress' | 'replied' | 'resolved';

export interface FeedbackItem {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  activityType: string;
  activityTitle: string;
  rating: number;
  category: FeedbackCategory;
  message: string;
  timestamp: string;
  status: FeedbackStatus;
  adminReply?: string;
}



export interface AssessmentProfile {
  studentName: string;
  age: number;
  grade: string;
  observations: string[];
  testResults?: Record<string, { name: string; accuracy: number }>;
  errorPatterns?: Record<string, number>;
}

export type TestCategory =
  | 'linguistic'
  | 'logical'
  | 'spatial'
  | 'attention'
  | 'musical'
  | 'kinesthetic'
  | 'naturalistic'
  | 'interpersonal'
  | 'intrapersonal';

export interface AdaptiveQuestion {
  id: string;
  text: string;
  options: string[];
  correct: string;
  difficulty: number;
  skill: TestCategory;
  subSkill?: string;
  errorTags: Record<string, string>;
}

export interface AssessmentConfig {
  selectedSkills: TestCategory[];
  mode: 'quick' | 'standard' | 'full';
}

export interface CurriculumDay {
  day: number;
  focus: string;
  activities: CurriculumActivity[];
  isCompleted: boolean;
}

export type CurriculumActivityStatus = 'pending' | 'completed' | 'skipped';

export interface CurriculumActivity {
  id: string;
  activityId: string;
  title: string;
  duration: number;
  goal: string;
  difficultyLevel: Difficulty;
  status: CurriculumActivityStatus;
}

export interface Curriculum {
  id: string;
  userId?: string;
  studentId?: string;
  studentName: string;
  grade: string;
  startDate: string;
  durationDays: number;
  goals: string[];
  schedule: CurriculumDay[];
  note: string;
  interests: string[];
  weaknesses: string[];
  createdAt?: string;
  progress?: number;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  bepGoals?: string[];
}

export type OCRDetectedType =
  | 'MATH_WORKSHEET'
  | 'READING_COMPREHENSION'
  | 'FILL_IN_THE_BLANK'
  | 'MATCHING'
  | 'TRUE_FALSE'
  | 'MULTIPLE_CHOICE'
  | 'OTHER';

export interface OCRBlueprintComponentRequirements {
  /** Grafik, şekil veya geometrik çizim gerekiyor mu? */
  requiresGraphic: boolean;
  /** Tablo veya ızgara yapısı gerekiyor mu? */
  requiresTable: boolean;
  /** Cevap kutuları veya yazma alanları gerekiyor mu? */
  requiresAnswerBoxes: boolean;
  /** Kelime bankası kutusu gerekiyor mu? */
  requiresWordBank: boolean;
  /** Eşleştirme sütunları gerekiyor mu? */
  requiresMatchingColumns: boolean;
  /** Çoktan seçmeli format (A/B/C/D) gerekiyor mu? */
  requiresMultipleChoice: boolean;
}

export interface OCRBlueprintDensityHints {
  /** Sayfanın doluluk oranı 0-100 */
  densityScore: number;
  /** Tahmini font boyutu (pt) */
  estimatedFontSize: number;
  /** Tahmini satır aralığı katsayısı */
  estimatedLineHeight: number;
  /** Önerilen sütun sayısı (1-3) */
  recommendedColumns: number;
  /** A4'ü doldurmak için minimum madde/soru sayısı */
  recommendedItemCount: number;
}

export interface OCRBlueprint {
  title: string;
  detectedType: OCRDetectedType;
  worksheetBlueprint: string;
  layoutHints?: {
    columns: number;
    hasImages: boolean;
    questionCount: number;
  };
  visualDescriptors?: Array<{
    tipi: string;
    aciklama: string;
    veri?: Array<{ etiket: string; deger?: number; birim?: string }>;
  }>;
  /** Hangi UI bileşenlerinin gerektiğini belirtir (analiz sırasında otomatik çıkarılır) */
  componentRequirements?: OCRBlueprintComponentRequirements;
  /** Sayfa yoğunluk analizi (A4 doluluk optimizasyonu için) */
  densityHints?: OCRBlueprintDensityHints;
}

export interface OCRResult {
  rawText: string;
  detectedType: OCRDetectedType | string;
  title: string;
  description: string;
  generatedTemplate: string;
  structuredData: OCRBlueprint;
  baseType: string;
  quality?: 'high' | 'medium' | 'low';
  warnings?: string[];
}

// ─────────────────────────────────────────────────────────────────────────
// OCR VARIATION SYSTEM - Pedagojik Güvenli Varyasyon Üretimi
// ─────────────────────────────────────────────────────────────────────────

export interface DifficultyMetrics {
  digitCount?: number;
  carryOperations?: number;
  maxDigitValue?: number;
  workingMemoryLoad: 'low' | 'medium' | 'high';
  estimatedSolveTime: number; // dakika cinsinden
  difficultyScore: number; // 0-100 arası
  cognitiveSteps: number; // İşlem adım sayısı
}

export interface VariantContext {
  dayNumber: number; // 1-5 arası (haftalık döngü)
  prerequisiteSkills: string[];
  targetSkill: string;
  nextStepIfSuccess: string;
  nextStepIfStruggle: string;
  estimatedCompletionMinutes: number;
}


export interface VariantGenerationConfig {
  baseActivity: SingleWorksheetData;
  variantCount: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  difficultyProgression: 'static' | 'gradual' | 'adaptive';
  progressionRate: number; // 0.10 - 0.15 (her varyant için zorluk artış oranı)

  // Disleksi/ADHD güvenlik
  avoidConfusableDigits: boolean; // 6/9, 2/5, 3/8 gibi karıştırılabilir rakamları kullanma
  maxCognitiveSteps: number; // ADHD için maksimum adım sayısı
  estimatedCompletionMinutes: number; // Tahmini tamamlanma süresi

  // Pedagojik garantiler
  firstVariantEasier: boolean; // İlk varyant %20-30 daha kolay olmalı
}

export interface VariationRequest {
  blueprintId: string; // OCR'dan çıkarılan blueprint hash'i
  teacherId: string;
  targetStudentProfile?: Student;
  targetAgeGroup?: '5-7' | '8-10' | '11-13' | '14+';
  bepGoalId?: string; // BEP hedefi ile ilişkilendirme (opsiyonel)

  config: VariantGenerationConfig;

  // Koruma bayrakları
  preserveDifficulty: boolean; // Orijinal zorluk korunsun mu?
  preserveStructure: 'strict' | 'flexible';

  // Disleksi uyumu
  applyDyslexiaFormatting: {
    lexendFont: true; // ASLA değiştirilemez
    lineSpacing: number; // Minimum 1.5
    syllableHighlighting: boolean;
    contrastMode: 'high' | 'normal';
  };
}

export interface VariationResult {
  variants: SingleWorksheetData[];
  metadata: {
    totalTokensUsed: number;
    totalCost: number; // USD
    generationTime: number; // ms
    successRate: number; // 0-1
    failedIndices: number[];
  };
  difficultyMetrics: DifficultyMetrics[];
  variantContexts: VariantContext[];
}

// Disleksi-güvenli rakam kontrol çiftleri
export const CONFUSABLE_DIGIT_PAIRS = [
  ['6', '9'],
  ['2', '5'],
  ['3', '8'],
  ['1', '7'],
] as const;
