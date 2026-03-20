import React from 'react';
import styles from './UniversalWorksheetViewer.module.css';
import type { ExportSettings, ExportJob, ExportFormat, PageSize, PageOrientation } from './types/worksheet';

interface ExportPanelProps {
  settings: ExportSettings;
  jobs: ExportJob[];
  isExporting: boolean;
  onUpdateSettings: (patch: Partial<ExportSettings>) => void;
  onExport: () => void;
  onCancel: () => void;
  onClearJobs: () => void;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  pdf: 'PDF',
  png: 'PNG Görsel',
  docx: 'DOCX / TXT',
  json: 'JSON Verisi',
};

const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  A4: 'A4 (210×297 mm)',
  Letter: 'Letter (216×279 mm)',
  Legal: 'Legal (216×356 mm)',
  A3: 'A3 (297×420 mm)',
  Custom: 'Özel Boyut',
};

const STATUS_LABELS: Record<ExportJob['status'], string> = {
  pending: '⏳ Bekliyor',
  processing: '🔄 İşleniyor',
  done: '✅ Tamamlandı',
  error: '❌ Hata',
};

export const ExportPanel: React.FC<ExportPanelProps> = React.memo(
  ({ settings, jobs, isExporting, onUpdateSettings, onExport, onCancel, onClearJobs }) => {
    return (
      <div
        className={styles.exportPanel}
        role="region"
        aria-label="Dışa aktarma paneli"
      >
        <h3 className={styles.panelTitle}>Dışa Aktar</h3>

        {/* Format selection */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.fieldsetLegend}>Format</legend>
          <div className={styles.radioGroup}>
            {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((fmt) => (
              <label key={fmt} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="export-format"
                  value={fmt}
                  checked={settings.format === fmt}
                  onChange={() => onUpdateSettings({ format: fmt })}
                />
                {FORMAT_LABELS[fmt]}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Page settings (PDF only) */}
        {settings.format === 'pdf' && (
          <>
            <fieldset className={styles.fieldset}>
              <legend className={styles.fieldsetLegend}>Sayfa Boyutu</legend>
              <select
                className={styles.select}
                value={settings.pageSize}
                onChange={(e) => onUpdateSettings({ pageSize: e.target.value as PageSize })}
                aria-label="Sayfa boyutu"
              >
                {(Object.keys(PAGE_SIZE_LABELS) as PageSize[]).map((size) => (
                  <option key={size} value={size}>
                    {PAGE_SIZE_LABELS[size]}
                  </option>
                ))}
              </select>
            </fieldset>

            {settings.pageSize === 'Custom' && (
              <fieldset className={styles.fieldset}>
                <legend className={styles.fieldsetLegend}>Özel Boyut (mm)</legend>
                <div className={styles.row}>
                  <label className={styles.inputLabel}>
                    Genişlik
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={settings.customWidth ?? 210}
                      min={50}
                      max={1000}
                      onChange={(e) => onUpdateSettings({ customWidth: Number(e.target.value) })}
                    />
                  </label>
                  <label className={styles.inputLabel}>
                    Yükseklik
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={settings.customHeight ?? 297}
                      min={50}
                      max={1500}
                      onChange={(e) => onUpdateSettings({ customHeight: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </fieldset>
            )}

            <fieldset className={styles.fieldset}>
              <legend className={styles.fieldsetLegend}>Yön</legend>
              <div className={styles.radioGroup}>
                {(['portrait', 'landscape'] as PageOrientation[]).map((o) => (
                  <label key={o} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="export-orientation"
                      value={o}
                      checked={settings.orientation === o}
                      onChange={() => onUpdateSettings({ orientation: o })}
                    />
                    {o === 'portrait' ? 'Dikey' : 'Yatay'}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.fieldsetLegend}>Üst/Alt Bilgi</legend>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.includeHeader}
                  onChange={(e) => onUpdateSettings({ includeHeader: e.target.checked })}
                />
                Üst bilgi ekle
              </label>
              {settings.includeHeader && (
                <input
                  className={styles.textInput}
                  value={settings.headerText ?? ''}
                  onChange={(e) => onUpdateSettings({ headerText: e.target.value })}
                  placeholder="Üst bilgi metni..."
                  aria-label="Üst bilgi metni"
                />
              )}
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.includeFooter}
                  onChange={(e) => onUpdateSettings({ includeFooter: e.target.checked })}
                />
                Alt bilgi ekle
              </label>
              {settings.includeFooter && (
                <input
                  className={styles.textInput}
                  value={settings.footerText ?? ''}
                  onChange={(e) => onUpdateSettings({ footerText: e.target.value })}
                  placeholder="Alt bilgi metni..."
                  aria-label="Alt bilgi metni"
                />
              )}
            </fieldset>
          </>
        )}

        {/* PNG DPI */}
        {settings.format === 'png' && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.fieldsetLegend}>Çözünürlük (DPI)</legend>
            <input
              type="number"
              className={styles.numberInput}
              value={settings.pngDpi ?? 150}
              min={72}
              max={600}
              step={1}
              onChange={(e) => onUpdateSettings({ pngDpi: Number(e.target.value) })}
              aria-label="PNG DPI çözünürlüğü"
            />
          </fieldset>
        )}

        {/* Action buttons */}
        <div className={styles.exportActions}>
          {isExporting ? (
            <button className={styles.cancelBtn} onClick={onCancel}>
              ⏹ İptal Et
            </button>
          ) : (
            <button className={styles.exportBtn} onClick={onExport}>
              ⬇ İndir
            </button>
          )}
        </div>

        {/* Job history */}
        {jobs.length > 0 && (
          <div className={styles.jobHistory}>
            <div className={styles.jobHistoryHeader}>
              <span className={styles.jobHistoryTitle}>Geçmiş</span>
              <button className={styles.clearJobsBtn} onClick={onClearJobs}>
                Temizle
              </button>
            </div>
            {[...jobs].reverse().map((job) => (
              <div key={job.id} className={`${styles.jobRow} ${styles[`job-${job.status}`]}`}>
                <span>{FORMAT_LABELS[job.format]}</span>
                <span>{STATUS_LABELS[job.status]}</span>
                {job.status === 'processing' && (
                  <div
                    className={styles.progressBar}
                    role="progressbar"
                    aria-valuenow={job.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className={styles.progressFill} style={{ width: `${job.progress}%` }} />
                  </div>
                )}
                {job.error && <span className={styles.jobError}>{job.error}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

ExportPanel.displayName = 'ExportPanel';
