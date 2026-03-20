/**
 * PDFViewer.tsx — Oogmatik Premium PDF Viewer
 *
 * 5 Perspektif entegrasyonu:
 *  🧠 Özel Öğrenme Güçlüğü Profesörü — Disleksi-dostu fontlar, kontrast, satır aralığı
 *  👨‍🏫 Eğitim Profesörü            — Temiz navigasyon, sayfa göstergesi, kolay kullanım
 *  🎨 Grafik Tasarımcı              — Modern tasarım, WCAG AA, smooth transitions
 *  💻 Frontend Yazılımcı            — Memory-efficient, lazy loading, error boundaries
 *  📄 Sayfa Tasarımcı               — A4 desteği, print-friendly, responsive
 */

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  Component,
  ErrorInfo,
  ReactNode,
} from 'react';
import { PDFViewer as ReactPDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import styles from './PDFViewer.module.css';
import { usePDFViewer } from './hooks/usePDFViewer';
import { useDyslexiaSettings } from './hooks/useDyslexiaSettings';
import {
  ZOOM_PRESETS,
  DYSLEXIA_FONTS,
  CONTRAST_THEMES,
  LINE_HEIGHT_PRESETS,
  LETTER_SPACING_PRESETS,
  type FitMode,
  type FontFamilyKey,
  type ContrastTheme,
} from './constants/pdfConfig';

/* ════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════ */

/** pdfjs-dist ile uyumlu minimal tip tanımı */
export interface PDFDocumentProxy {
  numPages: number;
  getPage?: (pageNumber: number) => Promise<unknown>;
  destroy?: () => void;
}

export interface PDFViewerProps {
  /* PDF kaynağı */
  url?: string;
  /** @react-pdf/renderer Document bileşeni (React element veya component) */
  documentComponent?: React.ComponentType<unknown> | React.ReactElement;
  document?: PDFDocumentProxy;

  /* Sayfa kontrolleri */
  initialPage?: number;
  onPageChange?: (page: number) => void;

  /* Görüntü ayarları */
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  fitMode?: FitMode;

  /* Disleksi özellikleri */
  dyslexiaMode?: boolean;
  fontFamily?: FontFamilyKey;
  highContrast?: boolean;
  lineHeight?: number;
  letterSpacing?: number;

  /* Durum yönetimi */
  isLoading?: boolean;
  error?: Error;
  onError?: (error: Error) => void;

  /* UI kontrolü */
  showControls?: boolean;
  showThumbnails?: boolean;
  showAnnotations?: boolean;

  /* İndirme */
  fileName?: string;

  /* Accessibility */
  role?: string;
  ariaLabel?: string;

  /** Ek wrapper sınıfı */
  className?: string;
}

/* ════════════════════════════════════════════════════════
   PDFErrorBoundary
   ════════════════════════════════════════════════════════ */

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
  fallback?: ReactNode;
}

export class PDFErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[PDFViewer] Render hatası:', error, info);
    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className={styles.errorState} role="alert">
          <div className={styles.errorIcon}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <p className={styles.errorTitle}>PDF yüklenemedi</p>
          {this.state.error && (
            <p className={styles.errorMessage}>{this.state.error.message}</p>
          )}
          <button className={styles.retryBtn} onClick={this.handleRetry}>
            <i className="fa-solid fa-rotate-right" style={{ marginRight: '0.375rem' }}></i>
            Tekrar Dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ════════════════════════════════════════════════════════
   DyslexiaToolbar
   ════════════════════════════════════════════════════════ */

interface DyslexiaToolbarProps {
  fontFamily: FontFamilyKey;
  contrastTheme: ContrastTheme;
  lineHeight: number;
  letterSpacing: number;
  fontSize: number;
  onFontChange: (f: FontFamilyKey) => void;
  onThemeChange: (t: ContrastTheme) => void;
  onLineHeightChange: (v: number) => void;
  onLetterSpacingChange: (v: number) => void;
  onFontSizeChange: (v: number) => void;
  onReset: () => void;
}

export const DyslexiaToolbar: React.FC<DyslexiaToolbarProps> = ({
  fontFamily,
  contrastTheme,
  lineHeight,
  letterSpacing,
  fontSize,
  onFontChange,
  onThemeChange,
  onLineHeightChange,
  onLetterSpacingChange,
  onFontSizeChange,
  onReset,
}) => {
  const THEME_COLORS: Record<ContrastTheme, string> = {
    default: '#ffffff',
    highContrast: '#000000',
    cream: '#fffde7',
    blue: '#e8f0fe',
  };

  return (
    <div className={styles.dyslexiaToolbar} role="toolbar" aria-label="Disleksi erişilebilirlik araçları">
      {/* Font Ailesi */}
      <div className={styles.dyslexiaSection}>
        <span className={styles.dyslexiaLabel}>Font</span>
        {(Object.keys(DYSLEXIA_FONTS) as FontFamilyKey[]).map((key) => (
          <button
            key={key}
            onClick={() => onFontChange(key)}
            className={`${styles.fontBtn} ${fontFamily === key ? styles.fontBtnActive : ''}`}
            title={DYSLEXIA_FONTS[key].label}
            aria-pressed={fontFamily === key}
          >
            {DYSLEXIA_FONTS[key].label}
          </button>
        ))}
      </div>

      <div className={styles.dyslexiaDivider} />

      {/* Kontrast Tema */}
      <div className={styles.dyslexiaSection}>
        <span className={styles.dyslexiaLabel}>Zemin</span>
        {(Object.keys(CONTRAST_THEMES) as ContrastTheme[]).map((key) => (
          <button
            key={key}
            onClick={() => onThemeChange(key)}
            className={`${styles.themeBtn} ${contrastTheme === key ? styles.themeBtnActive : ''}`}
            style={{ background: THEME_COLORS[key], border: '2px solid #e2e8f0' }}
            title={CONTRAST_THEMES[key].label}
            aria-pressed={contrastTheme === key}
            aria-label={CONTRAST_THEMES[key].label}
          />
        ))}
      </div>

      <div className={styles.dyslexiaDivider} />

      {/* Yazı Boyutu */}
      <div className={styles.dyslexiaSection}>
        <span className={styles.dyslexiaLabel}>Boyut</span>
        <button
          onClick={() => onFontSizeChange(fontSize - 1)}
          className={styles.controlBtn}
          title="Yazı küçült"
          aria-label="Yazı boyutunu küçült"
        >
          <i className="fa-solid fa-minus"></i>
        </button>
        <span className={styles.dyslexiaCounter}>{fontSize}</span>
        <button
          onClick={() => onFontSizeChange(fontSize + 1)}
          className={styles.controlBtn}
          title="Yazı büyüt"
          aria-label="Yazı boyutunu büyüt"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>

      <div className={styles.dyslexiaDivider} />

      {/* Satır Aralığı */}
      <div className={styles.dyslexiaSection}>
        <span className={styles.dyslexiaLabel}>Satır</span>
        <select
          value={lineHeight}
          onChange={(e) => onLineHeightChange(parseFloat(e.target.value))}
          className={styles.dyslexiaSelect}
          aria-label="Satır aralığı"
        >
          {LINE_HEIGHT_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Harf Aralığı */}
      <div className={styles.dyslexiaSection}>
        <span className={styles.dyslexiaLabel}>Harf</span>
        <select
          value={letterSpacing}
          onChange={(e) => onLetterSpacingChange(parseFloat(e.target.value))}
          className={styles.dyslexiaSelect}
          aria-label="Harf aralığı"
        >
          {LETTER_SPACING_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.dyslexiaDivider} />

      {/* Sıfırla */}
      <button
        onClick={onReset}
        className={styles.controlBtn}
        title="Ayarları sıfırla"
        aria-label="Disleksi ayarlarını sıfırla"
        style={{ color: '#ef4444' }}
      >
        <i className="fa-solid fa-arrow-rotate-left"></i>
      </button>
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   PDFViewerControls (Üst araç çubuğu)
   ════════════════════════════════════════════════════════ */

interface PDFViewerControlsProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onGoToPage: (p: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomChange: (z: number) => void;
  onFitChange: (mode: FitMode) => void;
  fitMode: FitMode;
  isDyslexiaOpen: boolean;
  onToggleDyslexia: () => void;
  isThumbnailsOpen: boolean;
  onToggleThumbnails: () => void;
  downloadLink?: ReactNode;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const PDFViewerControls: React.FC<PDFViewerControlsProps> = ({
  currentPage,
  totalPages,
  zoom,
  onGoToPage,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  onFitChange,
  fitMode,
  isDyslexiaOpen,
  onToggleDyslexia,
  isThumbnailsOpen,
  onToggleThumbnails,
  downloadLink,
  darkMode,
  onToggleDarkMode,
}) => {
  const [pageInputValue, setPageInputValue] = useState(String(currentPage));
  const [zoomOpen, setZoomOpen] = useState(false);
  const zoomRef = useRef<HTMLDivElement>(null);

  /* Sayfa input sync */
  useEffect(() => {
    setPageInputValue(String(currentPage));
  }, [currentPage]);

  /* Zoom dropdown dışarı tıklama */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (zoomRef.current && !zoomRef.current.contains(e.target as Node)) {
        setZoomOpen(false);
      }
    };
    if (zoomOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [zoomOpen]);

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(pageInputValue, 10);
    if (!isNaN(num)) onGoToPage(num);
  };

  const FIT_LABELS: Record<FitMode, string> = {
    page: 'Sayfaya Sığdır',
    width: 'Genişliğe Sığdır',
    height: 'Yüksekliğe Sığdır',
  };

  return (
    <div className={styles.controlBar} role="toolbar" aria-label="PDF görüntüleyici kontrolleri">
      {/* ─── Sol: Sayfa Navigasyonu ─── */}
      <div className={styles.controlGroup}>
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className={styles.controlBtn}
          title="Önceki sayfa (←)"
          aria-label="Önceki sayfa"
        >
          <i className="fa-solid fa-chevron-up"></i>
        </button>

        <form onSubmit={handlePageSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <input
            type="number"
            value={pageInputValue}
            min={1}
            max={totalPages}
            onChange={(e) => setPageInputValue(e.target.value)}
            onBlur={handlePageSubmit}
            className={styles.pageInput}
            aria-label={`Sayfa numarası (toplam ${totalPages})`}
          />
          <span className={styles.pageTotal}>/ {totalPages}</span>
        </form>

        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className={styles.controlBtn}
          title="Sonraki sayfa (→)"
          aria-label="Sonraki sayfa"
        >
          <i className="fa-solid fa-chevron-down"></i>
        </button>
      </div>

      {/* ─── Sağ: Zoom + Araçlar ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

        {/* Zoom grubu */}
        <div className={styles.controlGroup}>
          <button
            onClick={onZoomOut}
            disabled={zoom <= 0.3}
            className={styles.controlBtn}
            title="Uzaklaştır (-)"
            aria-label="Uzaklaştır"
          >
            <i className="fa-solid fa-minus"></i>
          </button>

          <div style={{ position: 'relative' }} ref={zoomRef}>
            <button
              onClick={() => setZoomOpen((o) => !o)}
              className={styles.zoomBadge}
              title="Zoom seviyesi"
              aria-haspopup="listbox"
              aria-expanded={zoomOpen}
            >
              %{Math.round(zoom * 100)}
            </button>
            {zoomOpen && (
              <div className={styles.dropdownMenu} role="listbox" aria-label="Zoom presetleri">
                {ZOOM_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => { onZoomChange(p.value); setZoomOpen(false); }}
                    className={`${styles.dropdownItem} ${zoom === p.value ? styles.active : ''}`}
                    role="option"
                    aria-selected={zoom === p.value}
                  >
                    {p.label}
                  </button>
                ))}
                <div className={styles.dropdownDivider} />
                {(['page', 'width', 'height'] as FitMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { onFitChange(mode); setZoomOpen(false); }}
                    className={`${styles.dropdownItem} ${fitMode === mode ? styles.active : ''}`}
                    role="option"
                    aria-selected={fitMode === mode}
                  >
                    <i className="fa-solid fa-expand" style={{ marginRight: '0.375rem', opacity: 0.6, fontSize: '0.5625rem' }}></i>
                    {FIT_LABELS[mode]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onZoomIn}
            disabled={zoom >= 3}
            className={styles.controlBtn}
            title="Yakınlaştır (+)"
            aria-label="Yakınlaştır"
          >
            <i className="fa-solid fa-plus"></i>
          </button>

          {/* Slider (geniş ekranlarda) */}
          <div style={{ display: 'none', alignItems: 'center', padding: '0 0.25rem' }}
            className="md:flex">
            <input
              type="range"
              min="30"
              max="300"
              value={Math.round(zoom * 100)}
              onChange={(e) => onZoomChange(parseInt(e.target.value) / 100)}
              style={{ width: '5rem', height: '0.25rem', accentColor: '#6366f1', cursor: 'pointer' }}
              aria-label={`Zoom: %${Math.round(zoom * 100)}`}
            />
          </div>
        </div>

        {/* Araçlar grubu */}
        <div className={styles.controlGroup}>
          {/* Disleksi araç çubuğu toggle */}
          <button
            onClick={onToggleDyslexia}
            className={`${styles.controlBtn} ${isDyslexiaOpen ? styles.controlBtnActive : ''}`}
            title="Disleksi araçları"
            aria-label="Disleksi erişilebilirlik araçlarını aç/kapat"
            aria-pressed={isDyslexiaOpen}
          >
            <i className="fa-solid fa-universal-access"></i>
          </button>

          {/* Thumbnail toggle */}
          <button
            onClick={onToggleThumbnails}
            className={`${styles.controlBtn} ${isThumbnailsOpen ? styles.controlBtnActive : ''}`}
            title="Sayfa miniatürleri"
            aria-label="Sayfa miniatürlerini göster/gizle"
            aria-pressed={isThumbnailsOpen}
          >
            <i className="fa-solid fa-grip"></i>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`${styles.controlBtn} ${darkMode ? styles.controlBtnActive : ''}`}
            title={darkMode ? 'Açık mod' : 'Koyu mod'}
            aria-label={darkMode ? 'Açık moda geç' : 'Koyu moda geç'}
            aria-pressed={darkMode}
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>

        {/* İndirme bağlantısı */}
        {downloadLink && (
          <div className={styles.controlGroup} style={{ padding: '0.125rem' }}>
            {downloadLink}
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   PDFThumbnails
   ════════════════════════════════════════════════════════ */

interface PDFThumbnailsProps {
  currentPage: number;
  totalPages: number;
  onGoToPage: (p: number) => void;
}

export const PDFThumbnails: React.FC<PDFThumbnailsProps> = ({
  currentPage,
  totalPages,
  onGoToPage,
}) => (
  <div
    className={styles.thumbnailStrip}
    role="navigation"
    aria-label="Sayfa miniatürleri"
  >
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        onClick={() => onGoToPage(i + 1)}
        className={`${styles.thumbnailBtn} ${currentPage === i + 1 ? styles.thumbnailBtnActive : ''}`}
        title={`Sayfa ${i + 1}`}
        aria-label={`Sayfa ${i + 1}${currentPage === i + 1 ? ' (aktif)' : ''}`}
        aria-current={currentPage === i + 1 ? 'page' : undefined}
      >
        {i + 1}
      </button>
    ))}
  </div>
);

/* ════════════════════════════════════════════════════════
   PDFPageRenderer (URL veya @react-pdf/renderer document)
   ════════════════════════════════════════════════════════ */

interface PDFPageRendererProps {
  url?: string;
  documentElement: React.ReactElement | null;
  zoom: number;
  fitMode: FitMode;
  onError: (e: Error) => void;
}

export const PDFPageRenderer: React.FC<PDFPageRendererProps> = ({
  url,
  documentElement,
  zoom,
  fitMode,
  onError,
}) => {
  const wrapperStyle: React.CSSProperties = {
    transform: fitMode === 'page' ? `scale(${zoom})` : undefined,
    width: fitMode === 'width' ? `${100 / zoom}%` : undefined,
    transformOrigin: 'top center',
    transition: 'transform 200ms ease',
    willChange: 'transform',
  };

  if (url) {
    return (
      <div className={styles.pageWrapper} style={wrapperStyle}>
        <div className={styles.page}>
          <object
            data={url}
            type="application/pdf"
            className={styles.pdfEmbed}
            aria-label="PDF belgesi"
          >
            <iframe
              src={url}
              className={styles.pdfIframe}
              title="PDF önizleme"
              onError={() => onError(new Error('PDF yüklenemedi: ' + url))}
            />
          </object>
        </div>
      </div>
    );
  }

  if (documentElement) {
    return (
      <div className={styles.pageWrapper} style={{ ...wrapperStyle, height: '100%' }}>
        <div className={styles.page} style={{ height: '100%' }}>
          <PDFErrorBoundary onError={onError}>
            <ReactPDFViewer
              style={{ width: '100%', height: '100%', border: 'none' }}
              showToolbar={false}
            >
              {documentElement}
            </ReactPDFViewer>
          </PDFErrorBoundary>
        </div>
      </div>
    );
  }

  return null;
};

/* ════════════════════════════════════════════════════════
   PDFViewer — Ana Bileşen
   ════════════════════════════════════════════════════════ */

export const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  documentComponent,
  document: pdfDocument,
  initialPage = 1,
  onPageChange,
  zoom: controlledZoom,
  onZoomChange,
  fitMode: controlledFitMode,
  dyslexiaMode: initialDyslexiaMode,
  fontFamily: initialFontFamily,
  highContrast: initialHighContrast,
  lineHeight: initialLineHeight,
  letterSpacing: initialLetterSpacing,
  isLoading: externalLoading = false,
  error: externalError,
  onError,
  showControls = true,
  showThumbnails = false,
  /** showAnnotations: gelecekte PDF üzerinde yorum/not gösterimi için ayrılmış, şimdilik kullanılmıyor */
  showAnnotations = false,
  fileName = 'Oogmatik_Etkinlik.pdf',
  role = 'main',
  ariaLabel = 'PDF Görüntüleyici',
  className,
}) => {
  /* showAnnotations ileride kullanılacak; şimdilik tüketilmeden geçiliyor */
  void showAnnotations;
  /* ─── State ─── */
  const viewer = usePDFViewer({
    initialPage,
    initialZoom: controlledZoom ?? 1,
    initialFitMode: controlledFitMode ?? 'page',
    totalPages: pdfDocument?.numPages ?? 1,
    onPageChange,
    onZoomChange,
    onError,
  });

  const dyslexia = useDyslexiaSettings({
    dyslexiaMode: initialDyslexiaMode,
    fontFamily: initialFontFamily,
    highContrast: initialHighContrast,
    lineHeight: initialLineHeight,
    letterSpacing: initialLetterSpacing,
  });

  const [isDyslexiaOpen, setIsDyslexiaOpen] = useState(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState(showThumbnails);
  const [darkMode, setDarkMode] = useState(false);

  /* ─── Controlled props sync ─── */
  useEffect(() => {
    if (controlledZoom !== undefined) viewer.setZoom(controlledZoom);
  }, [controlledZoom]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pdfDocument?.numPages) viewer.setTotalPages(pdfDocument.numPages);
  }, [pdfDocument?.numPages]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Dışa aktarma elementi oluştur ─── */
  const documentElement = useCallback((): React.ReactElement | null => {
    if (!documentComponent) return null;
    return React.isValidElement(documentComponent)
      ? documentComponent
      : React.createElement(documentComponent as React.ComponentType<unknown>);
  }, [documentComponent]);

  const docEl = documentElement();

  /* ─── PDF indirme bağlantısı ─── */
  const downloadLink =
    docEl ? (
      <PDFDownloadLink
        document={docEl}
        fileName={fileName}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.75rem',
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#059669',
          borderRadius: '0.625rem',
          fontSize: '0.6875rem',
          fontWeight: 800,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'background 200ms',
        }}
      >
        {({ loading }: { loading: boolean }) => (
          <>
            <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-download'}`}
               style={{ fontSize: '0.625rem' }}></i>
            {loading ? 'Hazırlanıyor...' : 'PDF İndir'}
          </>
        )}
      </PDFDownloadLink>
    ) : null;

  /* ─── Hata ve yükleme durumu ─── */
  const hasError = externalError ?? viewer.error;
  const isLoadingState = externalLoading || viewer.isLoading;
  const hasContent = !!(url || docEl);

  /* ─── Sınıf birleştirme ─── */
  const viewerClasses = [
    styles.viewer,
    darkMode ? styles.darkMode : '',
    dyslexia.settings.highContrast ? styles.highContrast : '',
    dyslexia.settings.dyslexiaMode ? 'dyslexia-mode' : '',
    dyslexia.containerClasses,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  /* ════ RENDER ════ */

  /* Hata durumu */
  if (hasError) {
    return (
      <div className={viewerClasses} style={dyslexia.cssVars} role="alert" aria-label="Hata">
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <p className={styles.errorTitle}>PDF yüklenemedi</p>
          <p className={styles.errorMessage}>{hasError.message}</p>
          <button
            className={styles.retryBtn}
            onClick={() => { viewer.setError(null); }}
          >
            <i className="fa-solid fa-rotate-right" style={{ marginRight: '0.375rem' }}></i>
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  /* Boş durum */
  if (!hasContent && !externalLoading) {
    return (
      <div className={viewerClasses} style={dyslexia.cssVars} role={role} aria-label={ariaLabel}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <i className="fa-regular fa-file-pdf"></i>
          </div>
          <p className={styles.emptyTitle}>PDF Önizleme</p>
          <p className={styles.emptyDesc}>
            Görüntülemek için bir PDF belgesi veya URL sağlayın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={viewerClasses}
      style={dyslexia.cssVars}
      role={role}
      aria-label={ariaLabel}
      tabIndex={0}
      ref={viewer.containerRef as React.RefObject<HTMLDivElement>}
    >
      {/* Yükleniyor progress bar */}
      {isLoadingState && (
        <div className={styles.progressBar} role="progressbar" aria-label="Yükleniyor">
          <div className={styles.progressFill} />
        </div>
      )}

      {/* Kontrol çubuğu */}
      {showControls && (
        <PDFViewerControls
          currentPage={viewer.currentPage}
          totalPages={viewer.totalPages}
          zoom={viewer.zoom}
          fitMode={viewer.fitMode}
          onGoToPage={viewer.goToPage}
          onPrevPage={viewer.goToPrevPage}
          onNextPage={viewer.goToNextPage}
          onZoomIn={viewer.zoomIn}
          onZoomOut={viewer.zoomOut}
          onZoomChange={viewer.setZoom}
          onFitChange={viewer.setFitMode}
          isDyslexiaOpen={isDyslexiaOpen}
          onToggleDyslexia={() => setIsDyslexiaOpen((o) => !o)}
          isThumbnailsOpen={isThumbnailsOpen}
          onToggleThumbnails={() => setIsThumbnailsOpen((o) => !o)}
          downloadLink={downloadLink}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
        />
      )}

      {/* İçerik alanı */}
      <div className={styles.contentArea}>
        {isLoadingState && !docEl ? (
          /* Yükleme skeleton */
          <div
            className={styles.pageWrapper}
            style={{ transform: `scale(${viewer.zoom})`, transformOrigin: 'top center' }}
          >
            <div className={styles.page}>
              <div className={styles.skeleton} style={{ width: '100%', height: '70.3125rem' }} />
            </div>
          </div>
        ) : (
          <PDFPageRenderer
            url={url}
            documentElement={docEl}
            zoom={viewer.zoom}
            fitMode={viewer.fitMode}
            onError={(e) => viewer.setError(e)}
          />
        )}
      </div>

      {/* Disleksi araç çubuğu */}
      {isDyslexiaOpen && (
        <DyslexiaToolbar
          fontFamily={dyslexia.settings.fontFamily}
          contrastTheme={dyslexia.settings.contrastTheme}
          lineHeight={dyslexia.settings.lineHeight}
          letterSpacing={dyslexia.settings.letterSpacing}
          fontSize={dyslexia.settings.fontSize}
          onFontChange={dyslexia.setFontFamily}
          onThemeChange={dyslexia.setContrastTheme}
          onLineHeightChange={dyslexia.setLineHeight}
          onLetterSpacingChange={dyslexia.setLetterSpacing}
          onFontSizeChange={dyslexia.setFontSize}
          onReset={dyslexia.resetSettings}
        />
      )}

      {/* Thumbnail şeridi */}
      {isThumbnailsOpen && viewer.totalPages > 1 && (
        <PDFThumbnails
          currentPage={viewer.currentPage}
          totalPages={viewer.totalPages}
          onGoToPage={viewer.goToPage}
        />
      )}

      {/* Watermark */}
      <div className={styles.watermark} aria-hidden="true">
        <img src="/assets/logo.png" alt="" className={styles.watermarkLogo} />
        <span className={styles.watermarkText}>Oogmatik Production Engine</span>
      </div>
    </div>
  );
};

export default PDFViewer;
