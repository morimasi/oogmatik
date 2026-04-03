// ─── Worksheet Types ──────────────────────────────────────────────────────────

export type WorksheetContentBlockType =
  | 'text'
  | 'heading'
  | 'math'
  | 'image'
  | 'table'
  | 'list'
  | 'divider'
  | 'blank';

export type BlockType = WorksheetContentBlockType;

export interface WorksheetContentBlock {
  id: string;
  type: WorksheetContentBlockType;
  content: string;
  /** Raw LaTeX string (for math blocks) */
  mathRaw?: string;
  /** Image URL or base64 data (for image blocks) */
  imageUrl?: string;
  /** Table rows/columns (for table blocks) */
  tableData?: string[][];
  /** List items (for list blocks) */
  listItems?: string[];
  /** Heading level 1–6 (for heading blocks) */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Inline styles */
  styles?: Record<string, string>;
}

export type WorksheetBlock = WorksheetContentBlock;
export type TextBlock = WorksheetContentBlock & { type: 'text' };
export type ImageBlock = WorksheetContentBlock & { type: 'image' };
export type MathBlock = WorksheetContentBlock & { type: 'math' };
export type DividerBlock = WorksheetContentBlock & { type: 'divider' };
export type BlankBlock = WorksheetContentBlock & { type: 'blank' };

export interface WorksheetMetadata {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  grade?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  templateId?: string;
}

export type WorksheetMeta = WorksheetMetadata;

export interface WorksheetContent {
  blocks: WorksheetContentBlock[];
}

export interface Worksheet {
  metadata: WorksheetMetadata;
  content: WorksheetContent;
}

export type WorksheetDocument = Worksheet;

// ─── Dyslexia / Accessibility Settings ───────────────────────────────────────

export const WORKSHEET_FONT_FAMILIES = ['default', 'OpenDyslexic', 'ReadingFont'] as const;
export type WorksheetFontFamily = (typeof WORKSHEET_FONT_FAMILIES)[number];
export type DyslexiaFont = WorksheetFontFamily;

export const CONTRAST_MODES = ['normal', 'high', 'inverted'] as const;
export type ContrastMode = (typeof CONTRAST_MODES)[number];

export interface DyslexiaSettings {
  fontFamily: WorksheetFontFamily;
  lineHeight: number;
  letterSpacing: number;
  contrastMode: ContrastMode;
  backgroundColor: string;
  fontSize: number;
}

// ─── Export Settings ──────────────────────────────────────────────────────────

export type ExportFormat = 'pdf' | 'png' | 'docx' | 'json';
export type PageSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'Custom';
export type WorksheetPageSize = PageSize;
export type PageOrientation = 'portrait' | 'landscape';
export type WorksheetOrientation = PageOrientation;

export interface ExportSettings {
  format: ExportFormat;
  pageSize: PageSize;
  orientation: PageOrientation;
  includeHeader: boolean;
  includeFooter: boolean;
  headerText?: string;
  footerText?: string;
  /** PNG-specific: resolution in DPI */
  pngDpi?: number;
  /** Custom page dimensions in mm (only when pageSize === 'Custom') */
  customWidth?: number;
  customHeight?: number;
  /** Page margin in mm */
  marginMm?: number;
}

export interface ExportJob {
  id: string;
  worksheetId: string;
  format: ExportFormat;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  url?: string;
  error?: string;
  createdAt: string;
}

export type ExportStatus = ExportJob['status'];

// ─── Template ─────────────────────────────────────────────────────────────────

export type TemplateCategory = 'math' | 'language' | 'science' | 'social' | 'art' | 'custom';
export type WorksheetCategory = TemplateCategory;

export interface WorksheetTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  content: WorksheetContent;
  isBuiltIn: boolean;
  createdAt: string;
}

// ─── Editor State ─────────────────────────────────────────────────────────────

export interface EditorSettings {
  autoSave: boolean;
  autoSaveIntervalMs: number;
}

export interface EditorState {
  selectedBlockId: string | null;
  isDirty: boolean;
  isAutoSaving: boolean;
  lastSavedAt: string | null;
  zoom: number;
  isPrintMode: boolean;
  showPreview: boolean;
  showExportPanel: boolean;
  showTemplateSelector: boolean;
  showDyslexiaControls: boolean;
}

export type ZoomLevel = number;

export interface WorksheetEditorState extends EditorState {
  document: WorksheetDocument;
  editorSettings: EditorSettings;
  dyslexiaSettings: DyslexiaSettings;
  exportSettings: ExportSettings;
  history: WorksheetDocument[];
  historyIndex: number;
  isSaving: boolean;
}

export interface UseWorksheetStateReturn {
  editorState: WorksheetEditorState;
  worksheet: WorksheetDocument;
  exportSettings: ExportSettings;
  dyslexiaSettings: DyslexiaSettings;
  canUndo: boolean;
  canRedo: boolean;
  setDocument: (doc: WorksheetDocument) => void;
  updateContent: (content: Partial<WorksheetContent>) => void;
  addBlock: (block: WorksheetBlock) => void;
  updateBlock: (id: string, updates: Partial<WorksheetBlock>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  selectBlock: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  togglePrintMode: () => void;
  togglePreview: () => void;
  toggleExportPanel: () => void;
  toggleTemplateSelector: () => void;
  toggleDyslexiaControls: () => void;
  setAutoSaving: (saving: boolean) => void;
  markSaved: () => void;
  updateDyslexiaSettings: (settings: Partial<DyslexiaSettings>) => void;
  resetDyslexiaSettings: () => void;
  updateExportSettings: (settings: Partial<ExportSettings>) => void;
  updateTitle: (title: string, saveToHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  resetWorksheet: () => void;
}

export interface UseExportEngineReturn {
  isExporting: boolean;
  exportWorksheet: (worksheet: WorksheetDocument, settings: ExportSettings) => Promise<void>;
  progress: number;
}

export interface UseTemplateManagerReturn {
  templates: WorksheetTemplate[];
  applyTemplate: (templateId: string) => void;
  saveAsTemplate: (name: string, description: string) => Promise<void>;
}

// ─── Undo/Redo ────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  content: WorksheetContent;
  timestamp: string;
  description?: string;
}

// ─── Export Presets ───────────────────────────────────────────────────────────

export interface ExportPreset {
  id: string;
  name: string;
  settings: ExportSettings;
  createdAt: string;
}

// ─── Export History ───────────────────────────────────────────────────────────

export interface ExportHistoryEntry {
  id: string;
  worksheetId: string;
  worksheetTitle: string;
  format: ExportFormat;
  settings: ExportSettings;
  status: 'done' | 'error';
  fileSize?: number;
  url?: string;
  error?: string;
  exportedAt: string;
}

// ─── Batch Export ─────────────────────────────────────────────────────────────

export interface BatchExportItem {
  worksheetId: string;
  worksheetTitle: string;
  content: WorksheetContent;
  metadata: WorksheetMetadata;
}

export interface BatchExportJob {
  id: string;
  items: BatchExportItem[];
  settings: ExportSettings;
  status: 'pending' | 'processing' | 'done' | 'error' | 'cancelled';
  progress: number;
  completedCount: number;
  failedCount: number;
  results: Array<{ worksheetId: string; status: 'done' | 'error'; url?: string; error?: string }>;
  createdAt: string;
  completedAt?: string;
}

// ─── Cloud Storage ────────────────────────────────────────────────────────────

export type CloudProvider = 'google_drive' | 'dropbox' | 'onedrive';

export interface CloudStorageConfig {
  provider: CloudProvider;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  userEmail?: string;
  userId?: string;
  folderId?: string;
  folderName?: string;
  autoSync: boolean;
}

export interface CloudFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedAt: string;
  webViewLink?: string;
  downloadUrl?: string;
  provider: CloudProvider;
}

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
