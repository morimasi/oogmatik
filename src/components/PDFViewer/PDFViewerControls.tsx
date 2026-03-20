import React, { useCallback } from 'react';
import styles from './PDFViewer.module.css';
import { ZOOM_LEVELS } from './constants/pdfConfig';
import type { ZoomLevel, FitMode } from './constants/pdfConfig';

interface PDFViewerControlsProps {
  currentPage: number;
  totalPages: number;
  zoom: ZoomLevel;
  fitMode: FitMode;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomChange: (zoom: ZoomLevel) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitModeChange: (mode: FitMode) => void;
  highContrast?: boolean;
}

export const PDFViewerControls: React.FC<PDFViewerControlsProps> = React.memo(
  ({
    currentPage,
    totalPages,
    zoom,
    fitMode,
    onPageChange,
    onPrevPage,
    onNextPage,
    onZoomChange,
    onZoomIn,
    onZoomOut,
    onFitModeChange,
    highContrast = false,
  }) => {
    const handlePageInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
          onPageChange(value);
        }
      },
      [onPageChange],
    );

    const handlePageInputKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          const value = parseInt((e.target as HTMLInputElement).value, 10);
          if (!isNaN(value)) {
            onPageChange(value);
          }
        }
      },
      [onPageChange],
    );

    const handleZoomSelect = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value, 10) as ZoomLevel;
        onZoomChange(value);
      },
      [onZoomChange],
    );

    const handleFitModeSelect = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFitModeChange(e.target.value as FitMode);
      },
      [onFitModeChange],
    );

    const fitModeLabels: Record<FitMode, string> = {
      page: 'Sayfa',
      width: 'Genişlik',
      height: 'Yükseklik',
    };

    return (
      <div
        className={styles.controlsBar}
        role="toolbar"
        aria-label="PDF görüntüleyici kontrolleri"
      >
        {/* Page navigation */}
        <div className={styles.controlsGroup} role="group" aria-label="Sayfa navigasyonu">
          <button
            className={styles.controlButton}
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            aria-label="Önceki sayfa"
            title="Önceki sayfa (Sol ok)"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>

          <input
            className={styles.pageInput}
            type="number"
            min={1}
            max={totalPages || 1}
            value={currentPage}
            onChange={handlePageInputChange}
            onKeyDown={handlePageInputKeyDown}
            aria-label="Mevcut sayfa numarası"
            aria-describedby="page-total"
          />

          <span id="page-total" className="text-xs font-semibold text-gray-500 px-1">
            / {totalPages || '–'}
          </span>

          <button
            className={styles.controlButton}
            onClick={onNextPage}
            disabled={currentPage >= (totalPages || 1)}
            aria-label="Sonraki sayfa"
            title="Sonraki sayfa (Sağ ok)"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.controlsSeparator} aria-hidden="true" />

        {/* Zoom controls */}
        <div className={styles.controlsGroup} role="group" aria-label="Zoom kontrolleri">
          <button
            className={styles.controlButton}
            onClick={onZoomOut}
            disabled={ZOOM_LEVELS.indexOf(zoom) <= 0}
            aria-label="Küçült"
            title="Küçült"
          >
            <i className="fa-solid fa-minus" aria-hidden="true" />
          </button>

          <select
            className={styles.zoomSelect}
            value={zoom}
            onChange={handleZoomSelect}
            aria-label="Zoom seviyesi"
          >
            {ZOOM_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}%
              </option>
            ))}
          </select>

          <button
            className={styles.controlButton}
            onClick={onZoomIn}
            disabled={ZOOM_LEVELS.indexOf(zoom) >= ZOOM_LEVELS.length - 1}
            aria-label="Büyüt"
            title="Büyüt"
          >
            <i className="fa-solid fa-plus" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.controlsSeparator} aria-hidden="true" />

        {/* Fit mode */}
        <div className={styles.controlsGroup} role="group" aria-label="Sayfa sığdırma modu">
          <select
            className={styles.zoomSelect}
            value={fitMode}
            onChange={handleFitModeSelect}
            aria-label="Sığdırma modu"
          >
            {(['page', 'width', 'height'] as FitMode[]).map((mode) => (
              <option key={mode} value={mode}>
                {fitModeLabels[mode]}
              </option>
            ))}
          </select>
        </div>

        {/* Accessible high-contrast indicator */}
        {highContrast && (
          <span
            className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"
            aria-live="polite"
          >
            Yüksek Kontrast
          </span>
        )}
      </div>
    );
  },
);

PDFViewerControls.displayName = 'PDFViewerControls';
