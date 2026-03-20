import { useState, useCallback, useRef } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { ZOOM_LEVELS, DEFAULT_PDF_SETTINGS } from '../constants/pdfConfig';
import type { ZoomLevel, FitMode } from '../constants/pdfConfig';

export interface PDFViewerState {
  currentPage: number;
  totalPages: number;
  zoom: ZoomLevel;
  fitMode: FitMode;
  loading: boolean;
  error: Error | null;
}

export interface PDFViewerActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setZoom: (zoom: ZoomLevel) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setFitMode: (mode: FitMode) => void;
  setTotalPages: (total: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export type UsePDFViewerReturn = PDFViewerState & PDFViewerActions;

interface UsePDFViewerOptions {
  initialPage?: number;
  initialZoom?: ZoomLevel;
  initialFitMode?: FitMode;
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: ZoomLevel) => void;
}

export function usePDFViewer(options: UsePDFViewerOptions = {}): UsePDFViewerReturn {
  const {
    initialPage = DEFAULT_PDF_SETTINGS.initialPage,
    initialZoom = DEFAULT_PDF_SETTINGS.zoom,
    initialFitMode = DEFAULT_PDF_SETTINGS.fitMode,
    onPageChange,
    onZoomChange,
  } = options;

  const setAppZoomScale = useAppStore((s) => s.setZoomScale);

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPagesState] = useState<number>(0);
  const totalPagesRef = useRef<number>(0);
  const [zoom, setZoomState] = useState<ZoomLevel>(initialZoom);
  const [fitMode, setFitModeState] = useState<FitMode>(initialFitMode);
  const [loading, setLoadingState] = useState<boolean>(false);
  const [error, setErrorState] = useState<Error | null>(null);

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPagesRef.current || 1));
      setCurrentPage(clamped);
      onPageChange?.(clamped);
    },
    [onPageChange],
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const setZoom = useCallback(
    (newZoom: ZoomLevel) => {
      setZoomState(newZoom);
      setAppZoomScale(newZoom / 100);
      onZoomChange?.(newZoom);
    },
    [setAppZoomScale, onZoomChange],
  );

  const zoomIn = useCallback(() => {
    setZoomState((current) => {
      const idx = ZOOM_LEVELS.indexOf(current);
      if (idx < ZOOM_LEVELS.length - 1) {
        const next = ZOOM_LEVELS[idx + 1];
        setAppZoomScale(next / 100);
        onZoomChange?.(next);
        return next;
      }
      return current;
    });
  }, [setAppZoomScale, onZoomChange]);

  const zoomOut = useCallback(() => {
    setZoomState((current) => {
      const idx = ZOOM_LEVELS.indexOf(current);
      if (idx > 0) {
        const prev = ZOOM_LEVELS[idx - 1];
        setAppZoomScale(prev / 100);
        onZoomChange?.(prev);
        return prev;
      }
      return current;
    });
  }, [setAppZoomScale, onZoomChange]);

  const setFitMode = useCallback((mode: FitMode) => {
    setFitModeState(mode);
  }, []);

  const setTotalPages = useCallback((total: number) => {
    totalPagesRef.current = total;
    setTotalPagesState(total);
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setLoadingState(isLoading);
  }, []);

  const setError = useCallback((err: Error | null) => {
    setErrorState(err);
    if (err) {
      setLoadingState(false);
    }
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    totalPagesRef.current = 0;
    setTotalPagesState(0);
    setZoomState(initialZoom);
    setFitModeState(initialFitMode);
    setLoadingState(false);
    setErrorState(null);
  }, [initialPage, initialZoom, initialFitMode]);

  return {
    currentPage,
    totalPages,
    zoom,
    fitMode,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    setZoom,
    zoomIn,
    zoomOut,
    setFitMode,
    setTotalPages,
    setLoading,
    setError,
    reset,
  };
}
