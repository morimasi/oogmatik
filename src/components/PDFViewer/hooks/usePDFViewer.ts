import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
  KEYBOARD_SHORTCUTS,
  RENDER_DEBOUNCE_MS,
  type FitMode,
} from '../constants/pdfConfig';

export interface UsePDFViewerOptions {
  initialPage?: number;
  initialZoom?: number;
  initialFitMode?: FitMode;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
  onError?: (error: Error) => void;
}

export interface UsePDFViewerReturn {
  currentPage: number;
  totalPages: number;
  zoom: number;
  fitMode: FitMode;
  isLoading: boolean;
  error: Error | null;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setFitMode: (mode: FitMode) => void;
  setTotalPages: (total: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  renderTime: number | null;
}

export function usePDFViewer(options: UsePDFViewerOptions = {}): UsePDFViewerReturn {
  const {
    initialPage = 1,
    initialZoom = 1,
    initialFitMode = 'page',
    totalPages: initialTotalPages = 1,
    onPageChange,
    onZoomChange,
    onError,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [zoom, setZoomState] = useState(initialZoom);
  const [fitMode, setFitModeState] = useState<FitMode>(initialFitMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState<Error | null>(null);
  const [renderTime, setRenderTime] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const renderStartRef = useRef<number | null>(null);
  const zoomDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Sayfa navigasyonu ─── */
  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clamped);
      onPageChange?.(clamped);
    },
    [totalPages, onPageChange],
  );

  const goToNextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const goToPrevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
  const goToFirstPage = useCallback(() => goToPage(1), [goToPage]);
  const goToLastPage = useCallback(() => goToPage(totalPages), [totalPages, goToPage]);

  /* ─── Zoom kontrolü ─── */
  const setZoom = useCallback(
    (newZoom: number) => {
      const clamped = Math.max(ZOOM_MIN, Math.min(newZoom, ZOOM_MAX));
      const rounded = Math.round(clamped * 100) / 100;
      setZoomState(rounded);

      if (zoomDebounceRef.current) clearTimeout(zoomDebounceRef.current);
      zoomDebounceRef.current = setTimeout(() => {
        onZoomChange?.(rounded);
      }, RENDER_DEBOUNCE_MS);
    },
    [onZoomChange],
  );

  const zoomIn = useCallback(() => setZoom(zoom + ZOOM_STEP), [zoom, setZoom]);
  const zoomOut = useCallback(() => setZoom(zoom - ZOOM_STEP), [zoom, setZoom]);

  const setFitMode = useCallback((mode: FitMode) => {
    setFitModeState(mode);
  }, []);

  /* ─── Hata yönetimi ─── */
  const setError = useCallback(
    (err: Error | null) => {
      setErrorState(err);
      if (err) onError?.(err);
    },
    [onError],
  );

  /* ─── Render süresi takibi ─── */
  useEffect(() => {
    renderStartRef.current = performance.now();
    setIsLoading(true);

    const timer = setTimeout(() => {
      if (renderStartRef.current !== null) {
        setRenderTime(Math.round(performance.now() - renderStartRef.current));
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, zoom]);

  /* ─── Klavye navigasyonu ─── */
  useEffect(() => {
    /** Verilen kısayol listesinin tuşu içerip içermediğini kontrol eder */
    const matchesShortcut = <T extends readonly string[]>(list: T, key: string): boolean =>
      (list as readonly string[]).includes(key);

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (matchesShortcut(KEYBOARD_SHORTCUTS.NEXT_PAGE, e.key)) {
        e.preventDefault();
        goToNextPage();
      } else if (matchesShortcut(KEYBOARD_SHORTCUTS.PREV_PAGE, e.key)) {
        e.preventDefault();
        goToPrevPage();
      } else if (matchesShortcut(KEYBOARD_SHORTCUTS.ZOOM_IN, e.key)) {
        e.preventDefault();
        zoomIn();
      } else if (matchesShortcut(KEYBOARD_SHORTCUTS.ZOOM_OUT, e.key)) {
        e.preventDefault();
        zoomOut();
      } else if (matchesShortcut(KEYBOARD_SHORTCUTS.FIRST_PAGE, e.key)) {
        e.preventDefault();
        goToFirstPage();
      } else if (matchesShortcut(KEYBOARD_SHORTCUTS.LAST_PAGE, e.key)) {
        e.preventDefault();
        goToLastPage();
      } else if (matchesShortcut(KEYBOARD_SHORTCUTS.FIT_PAGE, e.key)) {
        e.preventDefault();
        setFitMode('page');
      }
    };

    const container = containerRef.current ?? document;
    container.addEventListener('keydown', handleKeyDown as EventListener);
    return () => container.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [goToNextPage, goToPrevPage, zoomIn, zoomOut, goToFirstPage, goToLastPage, setFitMode]);

  /* ─── Cleanup ─── */
  useEffect(() => {
    return () => {
      if (zoomDebounceRef.current) clearTimeout(zoomDebounceRef.current);
    };
  }, []);

  return {
    currentPage,
    totalPages,
    zoom,
    fitMode,
    isLoading,
    error,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    setZoom,
    zoomIn,
    zoomOut,
    setFitMode,
    setTotalPages,
    setIsLoading,
    setError,
    containerRef,
    renderTime,
  };
}
