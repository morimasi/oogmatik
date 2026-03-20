// ── Worksheet Type System ────────────────────────────────────────────────────

export type WorksheetCategory = 'math' | 'language' | 'science' | 'social' | 'custom';

export type ExportFormat = 'pdf' | 'png' | 'docx' | 'json';

export type DyslexiaFont = 'default' | 'OpenDyslexic' | 'ReadingFont';

export type WorksheetOrientation = 'portrait' | 'landscape';

export type WorksheetPageSize = 'A4' | 'A5' | 'Letter' | 'Legal';

export type ZoomLevel = 50 | 75 | 100 | 125 | 150 | 200;

// ── Content Blocks ───────────────────────────────────────────────────────────

export type BlockType = 'text' | 'heading' | 'image' | 'math' | 'divider' | 'blank';

export interface TextBlock {
  id: string;
  type: 'text' | 'heading';
  content: string;
  level?: 1 | 2 | 3;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface MathBlock {
  id: string;
  type: 'math';
  expression: string;
  rendered?: string;
}

export interface DividerBlock {
  id: string;
  type: 'divider';
}

export interface BlankBlock {
  id: string;
  type: 'blank';
  lines: number;
  label?: string;
}

export type WorksheetBlock = TextBlock | ImageBlock | MathBlock | DividerBlock | BlankBlock;

// ── Worksheet Document ───────────────────────────────────────────────────────

export interface WorksheetMeta {
  id: string;
  title: string;
  subject: string;
  grade: string;
  category: WorksheetCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  authorId?: string;
}

export interface WorksheetContent {
  blocks: WorksheetBlock[];
  studentInfoVisible: boolean;
  titleVisible: boolean;
  instructionText: string;
  footerText: string;
}

export interface WorksheetDocument {
  meta: WorksheetMeta;
  content: WorksheetContent;
  version: number;
}

// ── Template ─────────────────────────────────────────────────────────────────

export interface WorksheetTemplate {
  id: string;
  name: string;
  description: string;
  category: WorksheetCategory;
  thumbnail?: string;
  document: WorksheetDocument;
  isBuiltIn: boolean;
  isCustom?: boolean;
}

// ── Editor State ─────────────────────────────────────────────────────────────

export interface EditorSettings {
  zoom: ZoomLevel;
  showPageBreaks: boolean;
  showRuler: boolean;
  autoSave: boolean;
  autoSaveIntervalMs: number;
}

export interface DyslexiaSettings {
  fontFamily: DyslexiaFont;
  lineHeight: number;
  letterSpacing: number;
  highContrast: boolean;
  backgroundColor: string;
  reducedMotion: boolean;
}

export interface ExportSettings {
  format: ExportFormat;
  pageSize: WorksheetPageSize;
  orientation: WorksheetOrientation;
  quality: number;
  includeAnswerKey: boolean;
  watermark?: string;
}

export interface WorksheetEditorState {
  document: WorksheetDocument;
  editorSettings: EditorSettings;
  dyslexiaSettings: DyslexiaSettings;
  exportSettings: ExportSettings;
  selectedBlockId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  history: WorksheetDocument[];
  historyIndex: number;
}

// ── Export Job ────────────────────────────────────────────────────────────────

export type ExportStatus = 'idle' | 'pending' | 'processing' | 'done' | 'error';

export interface ExportJob {
  id: string;
  format: ExportFormat;
  status: ExportStatus;
  progress: number;
  url?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

// ── Hook Return Types ─────────────────────────────────────────────────────────

export interface UseWorksheetStateReturn {
  state: WorksheetEditorState;
  setDocument: (doc: WorksheetDocument) => void;
  updateContent: (content: Partial<WorksheetContent>) => void;
  addBlock: (block: WorksheetBlock) => void;
  updateBlock: (id: string, updates: Partial<WorksheetBlock>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  selectBlock: (id: string | null) => void;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
  updateDyslexiaSettings: (settings: Partial<DyslexiaSettings>) => void;
  updateExportSettings: (settings: Partial<ExportSettings>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  save: () => Promise<void>;
  reset: () => void;
}

export interface UseExportEngineReturn {
  jobs: ExportJob[];
  exportDocument: (format: ExportFormat, settings?: Partial<ExportSettings>) => Promise<ExportJob>;
  batchExport: (formats: ExportFormat[]) => Promise<ExportJob[]>;
  cancelJob: (jobId: string) => void;
  clearJobs: () => void;
  isExporting: boolean;
}

export interface UseTemplateManagerReturn {
  templates: WorksheetTemplate[];
  customTemplates: WorksheetTemplate[];
  loadTemplate: (template: WorksheetTemplate) => void;
  saveAsTemplate: (name: string, description: string, category: WorksheetCategory) => WorksheetTemplate;
  deleteTemplate: (id: string) => void;
  searchTemplates: (query: string) => WorksheetTemplate[];
  filterByCategory: (category: WorksheetCategory | 'all') => WorksheetTemplate[];
}
