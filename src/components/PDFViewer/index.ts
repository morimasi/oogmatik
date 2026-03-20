// Barrel export for PDFViewer component and its sub-components
export { PDFViewer, PDFViewer as default } from './PDFViewer';
export type { PDFViewerProps } from './PDFViewer';

export { PDFViewerControls } from './PDFViewerControls';
export { PDFPageRenderer } from './PDFPageRenderer';
export { DyslexiaToolbar } from './DyslexiaToolbar';
export { PDFErrorBoundary } from './PDFErrorBoundary';

export { usePDFViewer } from './hooks/usePDFViewer';
export type { PDFViewerState, PDFViewerActions, UsePDFViewerReturn } from './hooks/usePDFViewer';

export { useDyslexiaSettings } from './hooks/useDyslexiaSettings';
export type { DyslexiaSettings, DyslexiaSettingsActions, UseDyslexiaSettingsReturn } from './hooks/useDyslexiaSettings';

export {
  ZOOM_LEVELS,
  FIT_MODES,
  DEFAULT_PDF_SETTINGS,
  DEFAULT_DYSLEXIA_SETTINGS,
  DYSLEXIA_FONT_FAMILIES,
  LINE_HEIGHT_RANGE,
  LETTER_SPACING_RANGE,
} from './constants/pdfConfig';
export type { ZoomLevel, FitMode, DyslexiaFontFamily } from './constants/pdfConfig';
