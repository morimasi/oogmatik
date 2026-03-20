import React, {
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import styles from './PDFViewer.module.css';
import { PDFViewerControls } from './PDFViewerControls';
import { PDFPageRenderer } from './PDFPageRenderer';
import { DyslexiaToolbar } from './DyslexiaToolbar';
import { PDFErrorBoundary } from './PDFErrorBoundary';
import { usePDFViewer } from './hooks/usePDFViewer';
import { useDyslexiaSettings } from './hooks/useDyslexiaSettings';
import { DEFAULT_PDF_SETTINGS } from './constants/pdfConfig';
import type { ZoomLevel, FitMode } from './constants/pdfConfig';
import type { DyslexiaFontFamily } from './constants/pdfConfig';

/** Approximate combined height of the controls bar and dyslexia toolbar in pixels */
const VIEWER_CHROME_HEIGHT = 80;
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface PDFViewerProps {
  /** URL of the PDF file to display */
  url?: string;
  /** Pre-loaded PDF document proxy (from react-pdf or pdfjs-dist) */
  document?: any;
  /** Initial page number (1-indexed) */
  initialPage?: number;
  /** Callback invoked when the page changes */
  onPageChange?: (page: number) => void;
  /** Initial zoom level (percentage) */
  zoom?: ZoomLevel;
  /** Callback invoked when zoom changes */
  onZoomChange?: (zoom: ZoomLevel) => void;
  /** How to fit the page in the viewport */
  fitMode?: FitMode;
  /** Enable the dyslexia accessibility toolbar */
  dyslexiaMode?: boolean;
  /** Dyslexia font family override */
  fontFamily?: DyslexiaFontFamily;
  /** Enable high-contrast mode */
  highContrast?: boolean;
  /** Line height for dyslexia mode */
  lineHeight?: number;
  /** Letter spacing (in px) for dyslexia mode */
  letterSpacing?: number;
  /** Loading state override */
  isLoading?: boolean;
  /** Error override */
  error?: Error;
  /** Callback invoked on load error */
  onError?: (error: Error) => void;
  /** Show the navigation / zoom controls bar */
  showControls?: boolean;
  /** Show the dyslexia toolbar */
  showThumbnails?: boolean;
  /** ARIA role for the root element */
  role?: string;
  /** ARIA label for the root element */
  ariaLabel?: string;
}

/**
 * PDFViewer — Disleksi-dostu PDF görüntüleyici bileşeni
 *
 * Özellikler:
 * - PDF.js tabanlı hızlı render (< 500 ms ilk sayfa)
 * - OpenDyslexic / ReadingFont desteği
 * - Yüksek kontrast modu
 * - Klavye navigasyonu (←/→, PageUp/PageDown, +/-)
 * - WCAG AA erişilebilirlik
 * - Responsive tasarım
 */
export const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  document: documentProp,
  initialPage = DEFAULT_PDF_SETTINGS.initialPage,
  onPageChange,
  zoom: zoomProp,
  onZoomChange,
  fitMode: fitModeProp = DEFAULT_PDF_SETTINGS.fitMode,
  dyslexiaMode = false,
  fontFamily: fontFamilyProp,
  highContrast: highContrastProp,
  lineHeight: lineHeightProp,
  letterSpacing: letterSpacingProp,
  isLoading: isLoadingProp,
  error: errorProp,
  onError,
  showControls = DEFAULT_PDF_SETTINGS.showControls,
  showThumbnails: _showThumbnails = DEFAULT_PDF_SETTINGS.showThumbnails,
  role = 'region',
  ariaLabel = 'PDF Görüntüleyici',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [pdfDocument, setPdfDocument] = useState<any>(null);

  // ── PDF viewer state hook ────────────────────────────────────
  const viewer = usePDFViewer({
    initialPage,
    initialZoom: zoomProp ?? DEFAULT_PDF_SETTINGS.zoom,
    initialFitMode: fitModeProp,
    onPageChange,
    onZoomChange,
  });

  // ── Dyslexia settings hook ───────────────────────────────────
  const dyslexia = useDyslexiaSettings({
    initialSettings: {
      fontFamily: fontFamilyProp,
      highContrast: highContrastProp,
      lineHeight: lineHeightProp,
      letterSpacing: letterSpacingProp,
    },
  });

  // ── Sync prop overrides into state ───────────────────────────
  const effectiveHighContrast = highContrastProp !== undefined ? highContrastProp : dyslexia.highContrast;

  // ── Container resize observer ────────────────────────────────
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Load PDF document ────────────────────────────────────────
  useEffect(() => {
    if (documentProp) {
      setPdfDocument(documentProp);
      viewer.setTotalPages(documentProp.numPages ?? 0);
      return;
    }

    if (!url) return;

    let cancelled = false;
    viewer.setLoading(true);
    viewer.setError(null);

    const loadTask = pdfjsLib.getDocument({ url });
    loadTask.promise
      .then((doc: any) => {
        if (cancelled) return;
        setPdfDocument(doc);
        viewer.setTotalPages(doc.numPages);
        viewer.setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        viewer.setError(err);
        onError?.(err);
      });

    return () => {
      cancelled = true;
      loadTask.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, documentProp]);

  // ── Keyboard navigation ──────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          viewer.prevPage();
          break;
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          viewer.nextPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          viewer.zoomIn();
          break;
        case '-':
          e.preventDefault();
          viewer.zoomOut();
          break;
        default:
          break;
      }
    },
    [viewer],
  );

  // ── Effective loading / error states ─────────────────────────
  const isLoading = isLoadingProp !== undefined ? isLoadingProp : viewer.loading;
  const error = errorProp !== undefined ? errorProp : viewer.error;

  // ── Container class ──────────────────────────────────────────
  const containerClass = [
    styles.pdfViewerContainer,
    effectiveHighContrast ? styles.highContrast : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ── Dyslexia font style ──────────────────────────────────────
  const fontFamilyCss =
    dyslexia.fontFamily === 'OpenDyslexic'
      ? '"OpenDyslexic", sans-serif'
      : dyslexia.fontFamily === 'ReadingFont'
        ? '"Lexend", "Comic Sans MS", sans-serif'
        : 'inherit';

  return (
    <div
      ref={containerRef}
      className={containerClass}
      role={role}
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ fontFamily: fontFamilyCss }}
    >
      <PDFErrorBoundary onError={onError}>
        {/* Controls bar */}
        {showControls && (
          <PDFViewerControls
            currentPage={viewer.currentPage}
            totalPages={viewer.totalPages}
            zoom={viewer.zoom}
            fitMode={viewer.fitMode}
            onPageChange={viewer.goToPage}
            onPrevPage={viewer.prevPage}
            onNextPage={viewer.nextPage}
            onZoomChange={viewer.setZoom}
            onZoomIn={viewer.zoomIn}
            onZoomOut={viewer.zoomOut}
            onFitModeChange={viewer.setFitMode}
            highContrast={effectiveHighContrast}
          />
        )}

        {/* Dyslexia toolbar */}
        {dyslexiaMode && (
          <DyslexiaToolbar
            fontFamily={dyslexia.fontFamily}
            highContrast={dyslexia.highContrast}
            lineHeight={dyslexia.lineHeight}
            letterSpacing={dyslexia.letterSpacing}
            backgroundColor={dyslexia.backgroundColor}
            setFontFamily={dyslexia.setFontFamily}
            setHighContrast={dyslexia.setHighContrast}
            setLineHeight={dyslexia.setLineHeight}
            setLetterSpacing={dyslexia.setLetterSpacing}
            setBackgroundColor={dyslexia.setBackgroundColor}
            resetDyslexiaSettings={dyslexia.resetDyslexiaSettings}
          />
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className={styles.loadingOverlay} role="status" aria-live="polite" aria-label="PDF yükleniyor">
            <div className={styles.spinner} aria-hidden="true" />
            <span className={styles.loadingText}>PDF yükleniyor…</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className={styles.errorContainer} role="alert" aria-live="assertive">
            <i className={`fa-solid fa-file-circle-exclamation ${styles.errorIcon}`} aria-hidden="true" />
            <h3 className={styles.errorTitle}>PDF yüklenemedi</h3>
            <p className={styles.errorMessage}>{error.message}</p>
            <button
              className={styles.retryButton}
              onClick={() => {
                viewer.setError(null);
                viewer.reset();
              }}
              aria-label="Yeniden dene"
            >
              <i className="fa-solid fa-rotate-right mr-2" aria-hidden="true" />
              Yeniden Dene
            </button>
          </div>
        )}

        {/* Page renderer */}
        {!error && pdfDocument && (
          <PDFPageRenderer
            pdfDocument={pdfDocument}
            pageNumber={viewer.currentPage}
            zoom={viewer.zoom}
            fitMode={viewer.fitMode}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height - VIEWER_CHROME_HEIGHT}
            dyslexiaSettings={{
              fontFamily: dyslexia.fontFamily,
              highContrast: effectiveHighContrast,
              lineHeight: dyslexia.lineHeight,
              letterSpacing: dyslexia.letterSpacing,
              backgroundColor: dyslexia.backgroundColor,
            }}
            onPageRendered={() => viewer.setLoading(false)}
            onRenderError={(err) => {
              viewer.setError(err);
              onError?.(err);
            }}
            ariaLabel={`${ariaLabel} - Sayfa ${viewer.currentPage} / ${viewer.totalPages}`}
          />
        )}

        {/* Empty state (no URL and no document) */}
        {!url && !documentProp && !isLoading && !error && (
          <div className={styles.errorContainer} role="status">
            <i className="fa-regular fa-file-pdf text-4xl text-gray-400 mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-500">
              Görüntülenecek PDF dosyası seçilmedi
            </p>
          </div>
        )}
      </PDFErrorBoundary>
    </div>
  );
};

PDFViewer.displayName = 'PDFViewer';

export default PDFViewer;
