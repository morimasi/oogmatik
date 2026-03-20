// Barrel export for UniversalWorksheetViewer component system

export { UniversalWorksheetViewer, UniversalWorksheetViewer as default } from './UniversalWorksheetViewer';
export type { UniversalWorksheetViewerProps } from './UniversalWorksheetViewer';

export { WorksheetEditor } from './WorksheetEditor';
export { PreviewPane } from './PreviewPane';
export { ExportPanel } from './ExportPanel';
export { TemplateSelector } from './TemplateSelector';
export { DyslexiaControls } from './DyslexiaControls';

export { useWorksheetState } from './hooks/useWorksheetState';
export type { UseWorksheetStateReturn } from './hooks/useWorksheetState';

export { useExportEngine } from './hooks/useExportEngine';

export { useTemplateManager } from './hooks/useTemplateManager';
export type { UseTemplateManagerReturn } from './hooks/useTemplateManager';

export {
  BUILT_IN_TEMPLATES,
  DEFAULT_DYSLEXIA_SETTINGS,
  DEFAULT_EXPORT_SETTINGS,
  FONT_FAMILY_LABELS,
  BACKGROUND_COLOR_PRESETS,
  ZOOM_LEVELS,
  TEMPLATE_CATEGORY_LABELS,
  EMPTY_WORKSHEET_CONTENT,
} from './constants/templates';
export type { ZoomLevel } from './constants/templates';

export type {
  Worksheet,
  WorksheetMetadata,
  WorksheetContent,
  WorksheetContentBlock,
  WorksheetContentBlockType,
  DyslexiaSettings,
  WorksheetFontFamily,
  ContrastMode,
  ExportSettings,
  ExportJob,
  ExportFormat,
  PageSize,
  PageOrientation,
  WorksheetTemplate,
  TemplateCategory,
  EditorState,
  HistoryEntry,
} from './types/worksheet';
