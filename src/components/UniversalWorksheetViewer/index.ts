// ── Components ────────────────────────────────────────────────────────────────
export { UniversalWorksheetViewer } from './UniversalWorksheetViewer';
export type { UniversalWorksheetViewerProps } from './UniversalWorksheetViewer';

export { WorksheetEditor } from './WorksheetEditor';
export { PreviewPane } from './PreviewPane';
export { ExportPanel } from './ExportPanel';
export { TemplateSelector } from './TemplateSelector';
export { DyslexiaControls } from './DyslexiaControls';

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useWorksheetState } from './hooks/useWorksheetState';
export { useExportEngine } from './hooks/useExportEngine';
export { useTemplateManager } from './hooks/useTemplateManager';

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  WorksheetCategory,
  ExportFormat,
  DyslexiaFont,
  WorksheetOrientation,
  WorksheetPageSize,
  ZoomLevel,
  BlockType,
  TextBlock,
  ImageBlock,
  MathBlock,
  DividerBlock,
  BlankBlock,
  WorksheetBlock,
  WorksheetMeta,
  WorksheetContent,
  WorksheetDocument,
  WorksheetTemplate,
  EditorSettings,
  DyslexiaSettings,
  ExportSettings,
  WorksheetEditorState,
  ExportStatus,
  ExportJob,
  UseWorksheetStateReturn,
  UseExportEngineReturn,
  UseTemplateManagerReturn,
} from './types/worksheet';

// ── Constants ─────────────────────────────────────────────────────────────────
export {
  BUILT_IN_TEMPLATES,
  TEMPLATE_CATEGORIES,
  ZOOM_LEVELS,
  DEFAULT_EDITOR_SETTINGS,
  DEFAULT_DYSLEXIA_SETTINGS,
  DEFAULT_EXPORT_SETTINGS,
} from './constants/templates';
