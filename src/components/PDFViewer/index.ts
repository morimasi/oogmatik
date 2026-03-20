/**
 * PDFViewer — Barrel Export
 *
 * Kullanım:
 *   import { PDFViewer } from 'src/components/PDFViewer';
 *   import { PDFViewer, DyslexiaToolbar, PDFViewerControls } from 'src/components/PDFViewer';
 */

export { PDFViewer } from './PDFViewer';
export type { PDFViewerProps, PDFDocumentProxy } from './PDFViewer';
export { PDFViewerControls } from './PDFViewer';
export { DyslexiaToolbar } from './PDFViewer';
export { PDFThumbnails } from './PDFViewer';
export { PDFPageRenderer } from './PDFViewer';
export { PDFErrorBoundary } from './PDFViewer';

export { usePDFViewer } from './hooks/usePDFViewer';
export type { UsePDFViewerOptions, UsePDFViewerReturn } from './hooks/usePDFViewer';

export { useDyslexiaSettings } from './hooks/useDyslexiaSettings';
export type { DyslexiaSettings, UseDyslexiaSettingsReturn } from './hooks/useDyslexiaSettings';

export * from './constants/pdfConfig';
