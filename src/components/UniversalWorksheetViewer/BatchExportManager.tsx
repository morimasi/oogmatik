import React, { useState, useCallback } from 'react';
import styles from './UniversalWorksheetViewer.module.css';
import type { BatchExportJob, BatchExportItem, ExportSettings, ExportFormat } from './types/worksheet';

const FORMAT_LABELS: Record<ExportFormat, string> = {
  pdf: 'PDF',
  png: 'PNG',
  docx: 'DOCX',
  json: 'JSON',
};

interface BatchExportManagerProps {
  /** Available worksheets to choose from. If not provided a simple ID entry is shown. */
  availableItems?: BatchExportItem[];
  settings: ExportSettings;
  currentJob: BatchExportJob | null;
  isRunning: boolean;
  onStart: (items: BatchExportItem[], settings: ExportSettings) => void;
  onCancel: () => void;
  onRetryFailed: () => void;
  onClearJob: () => void;
  onUpdateSettings: (patch: Partial<ExportSettings>) => void;
}

export const BatchExportManager: React.FC<BatchExportManagerProps> = React.memo(
  ({
    availableItems = [],
    settings,
    currentJob,
    isRunning,
    onStart,
    onCancel,
    onRetryFailed,
    onClearJob,
    onUpdateSettings,
  }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelect = useCallback((id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    const selectAll = useCallback(() => {
      setSelectedIds(new Set(availableItems.map((i) => i.worksheetId)));
    }, [availableItems]);

    const selectNone = useCallback(() => {
      setSelectedIds(new Set());
    }, []);

    const handleStart = useCallback(() => {
      const items = availableItems.filter((i) => selectedIds.has(i.worksheetId));
      if (items.length === 0) return;
      onStart(items, settings);
    }, [availableItems, selectedIds, settings, onStart]);

    const hasFailed = currentJob?.results.some((r) => r.status === 'error') ?? false;

    return (
      <div className={styles.batchManager} role="region" aria-label="Toplu dışa aktarma">
        <h3 className={styles.panelTitle}>Toplu Dışa Aktarma</h3>

        {/* Format quick-select */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.fieldsetLegend}>Format</legend>
          <div className={styles.radioGroup}>
            {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((fmt) => (
              <label key={fmt} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="batch-format"
                  value={fmt}
                  checked={settings.format === fmt}
                  onChange={() => onUpdateSettings({ format: fmt })}
                />
                {FORMAT_LABELS[fmt]}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Worksheet selection */}
        {availableItems.length > 0 && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.fieldsetLegend}>
              Çalışma Kağıtları ({selectedIds.size}/{availableItems.length} seçili)
            </legend>
            <div className={styles.row} style={{ marginBottom: 8 }}>
              <button className={styles.toolbarBtn} onClick={selectAll}>
                Tümünü Seç
              </button>
              <button className={styles.toolbarBtn} onClick={selectNone}>
                Seçimi Kaldır
              </button>
            </div>
            <div className={styles.batchItemList} role="list">
              {availableItems.map((item) => (
                <label key={item.worksheetId} className={styles.checkboxLabel} role="listitem">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.worksheetId)}
                    onChange={() => toggleSelect(item.worksheetId)}
                  />
                  {item.worksheetTitle}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {availableItems.length === 0 && !currentJob && (
          <p className={styles.emptyState}>
            Toplu dışa aktarma için seçilebilecek çalışma kağıdı bulunamadı. Çalışma kağıtlarını yükledikten sonra
            tekrar deneyin.
          </p>
        )}

        {/* Action buttons */}
        <div className={styles.exportActions}>
          {isRunning ? (
            <button className={styles.cancelBtn} onClick={onCancel}>
              ⏹ İptal Et
            </button>
          ) : (
            <button
              className={styles.exportBtn}
              onClick={handleStart}
              disabled={selectedIds.size === 0 && availableItems.length > 0}
            >
              ⬇ Toplu İndir ({selectedIds.size || availableItems.length} dosya)
            </button>
          )}
        </div>

        {/* Job progress */}
        {currentJob && (
          <div className={styles.jobHistory} role="status" aria-live="polite">
            <div className={styles.jobHistoryHeader}>
              <span className={styles.jobHistoryTitle}>
                {currentJob.status === 'processing' && `İşleniyor... ${currentJob.progress}%`}
                {currentJob.status === 'done' &&
                  `✅ Tamamlandı (${currentJob.completedCount} başarılı, ${currentJob.failedCount} hatalı)`}
                {currentJob.status === 'error' && '❌ Tüm görevler başarısız'}
                {currentJob.status === 'cancelled' && '⏹ İptal edildi'}
                {currentJob.status === 'pending' && '⏳ Bekliyor'}
              </span>
              <button className={styles.clearJobsBtn} onClick={onClearJob}>
                Temizle
              </button>
            </div>

            {/* Overall progress bar */}
            {currentJob.status === 'processing' && (
              <div
                className={styles.progressBar}
                role="progressbar"
                aria-valuenow={currentJob.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className={styles.progressFill} style={{ width: `${currentJob.progress}%` }} />
              </div>
            )}

            {/* Per-item results */}
            {currentJob.results.length > 0 && (
              <div className={styles.batchResults}>
                {currentJob.results.map((r) => {
                  const item = currentJob.items.find((i) => i.worksheetId === r.worksheetId);
                  return (
                    <div
                      key={r.worksheetId}
                      className={`${styles.jobRow} ${styles[`job-${r.status}`]}`}
                    >
                      <span>{item?.worksheetTitle ?? r.worksheetId}</span>
                      <span>{r.status === 'done' ? '✅' : `❌ ${r.error ?? 'Hata'}`}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Retry button */}
            {hasFailed && currentJob.status !== 'processing' && (
              <button className={styles.exportBtn} onClick={onRetryFailed} style={{ marginTop: 8 }}>
                🔄 Hatalıları Yeniden Dene
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);

BatchExportManager.displayName = 'BatchExportManager';
