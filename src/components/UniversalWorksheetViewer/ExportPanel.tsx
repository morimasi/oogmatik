import React, { useState } from 'react';
import type { ExportFormat, ExportSettings } from './types/worksheet';
import type { UseExportEngineReturn } from './types/worksheet';
import styles from './UniversalWorksheetViewer.module.css';

interface ExportPanelProps {
  exportEngine: UseExportEngineReturn;
  exportSettings: ExportSettings;
  onSettingsChange: (settings: Partial<ExportSettings>) => void;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  pdf: 'PDF',
  png: 'PNG Görüntü',
  docx: 'Word (DOCX)',
  json: 'JSON Veri',
};

const FORMAT_ICONS: Record<ExportFormat, string> = {
  pdf: '📄',
  png: '🖼️',
  docx: '📝',
  json: '{ }',
};

const PAGE_SIZES = ['A4', 'A5', 'Letter', 'Legal'] as const;
const ORIENTATIONS = [
  { value: 'portrait', label: 'Dikey' },
  { value: 'landscape', label: 'Yatay' },
] as const;

export function ExportPanel({ exportEngine, exportSettings, onSettingsChange }: ExportPanelProps) {
  const { jobs, exportDocument, batchExport, cancelJob, clearJobs, isExporting } = exportEngine;
  const [batchFormats, setBatchFormats] = useState<Set<ExportFormat>>(new Set(['pdf']));

  const toggleBatchFormat = (format: ExportFormat) => {
    setBatchFormats((prev) => {
      const next = new Set(prev);
      if (next.has(format)) next.delete(format);
      else next.add(format);
      return next;
    });
  };

  const handleSingleExport = async (format: ExportFormat) => {
    const job = await exportDocument(format, exportSettings);
    if (job.status === 'done' && job.url) {
      const link = window.document.createElement('a');
      link.href = job.url;
      link.download = `calisma-sayfasi.${format}`;
      link.click();
    }
  };

  const handleBatchExport = async () => {
    const formats = Array.from(batchFormats);
    const completedJobs = await batchExport(formats);
    completedJobs.forEach((job) => {
      if (job.status === 'done' && job.url) {
        const link = window.document.createElement('a');
        link.href = job.url;
        link.download = `calisma-sayfasi.${job.format}`;
        link.click();
      }
    });
  };

  return (
    <aside className={styles.exportPanel} aria-label="Dışa aktarma paneli">
      <h2 className={styles.exportPanelTitle}>Dışa Aktar</h2>

      {/* Format buttons */}
      <section className={styles.exportSection} aria-labelledby="export-formats-label">
        <h3 id="export-formats-label" className={styles.exportSectionTitle}>Hızlı Dışa Aktar</h3>
        <div className={styles.exportFormatGrid} role="list">
          {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((format) => (
            <button
              key={format}
              className={styles.exportFormatBtn}
              onClick={() => handleSingleExport(format)}
              disabled={isExporting}
              aria-label={`${FORMAT_LABELS[format]} olarak dışa aktar`}
              role="listitem"
            >
              <span className={styles.exportFormatIcon} aria-hidden="true">{FORMAT_ICONS[format]}</span>
              <span className={styles.exportFormatLabel}>{FORMAT_LABELS[format]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Export settings */}
      <section className={styles.exportSection} aria-labelledby="export-settings-label">
        <h3 id="export-settings-label" className={styles.exportSectionTitle}>Ayarlar</h3>
        <div className={styles.exportSettingsGrid}>
          <label className={styles.exportSettingLabel}>
            Sayfa Boyutu
            <select
              className={styles.exportSettingSelect}
              value={exportSettings.pageSize}
              onChange={(e) => onSettingsChange({ pageSize: e.target.value as typeof exportSettings.pageSize })}
              aria-label="Sayfa boyutu"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className={styles.exportSettingLabel}>
            Yönlendirme
            <select
              className={styles.exportSettingSelect}
              value={exportSettings.orientation}
              onChange={(e) => onSettingsChange({ orientation: e.target.value as typeof exportSettings.orientation })}
              aria-label="Yönlendirme"
            >
              {ORIENTATIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className={`${styles.exportSettingLabel} ${styles.exportCheckLabel}`}>
            <input
              type="checkbox"
              checked={exportSettings.includeAnswerKey}
              onChange={(e) => onSettingsChange({ includeAnswerKey: e.target.checked })}
              aria-label="Cevap anahtarı dahil et"
            />
            Cevap Anahtarı
          </label>
        </div>
      </section>

      {/* Batch export */}
      <section className={styles.exportSection} aria-labelledby="batch-export-label">
        <h3 id="batch-export-label" className={styles.exportSectionTitle}>Toplu Dışa Aktar</h3>
        <div className={styles.batchFormatPicker} role="group" aria-label="Toplu format seçimi">
          {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((format) => (
            <label key={format} className={styles.batchFormatOption}>
              <input
                type="checkbox"
                checked={batchFormats.has(format)}
                onChange={() => toggleBatchFormat(format)}
                aria-label={FORMAT_LABELS[format]}
              />
              {FORMAT_ICONS[format]} {FORMAT_LABELS[format]}
            </label>
          ))}
        </div>
        <button
          className={styles.batchExportBtn}
          onClick={handleBatchExport}
          disabled={isExporting || batchFormats.size === 0}
          aria-label="Seçili formatları dışa aktar"
        >
          {isExporting ? 'Dışa Aktarılıyor...' : `${batchFormats.size} Format Dışa Aktar`}
        </button>
      </section>

      {/* Job history */}
      {jobs.length > 0 && (
        <section className={styles.exportSection} aria-labelledby="export-jobs-label">
          <div className={styles.exportJobsHeader}>
            <h3 id="export-jobs-label" className={styles.exportSectionTitle}>İşlem Geçmişi</h3>
            <button className={styles.clearJobsBtn} onClick={clearJobs} aria-label="Geçmişi temizle">
              Temizle
            </button>
          </div>
          <ul className={styles.exportJobList} aria-label="Dışa aktarma işleri" role="list">
            {jobs.map((job) => (
              <li key={job.id} className={styles.exportJobItem} role="listitem">
                <span className={styles.exportJobFormat}>{FORMAT_ICONS[job.format]} {FORMAT_LABELS[job.format]}</span>
                <span className={`${styles.exportJobStatus} ${styles[`jobStatus_${job.status}`]}`} aria-label={`Durum: ${job.status}`}>
                  {job.status === 'done' && '✓ Tamamlandı'}
                  {job.status === 'error' && `✗ Hata: ${job.error}`}
                  {(job.status === 'pending' || job.status === 'processing') && (
                    <>
                      <span className={styles.exportProgressBar} role="progressbar" aria-valuenow={job.progress} aria-valuemin={0} aria-valuemax={100}>
                        <span style={{ width: `${job.progress}%` }} className={styles.exportProgressFill} />
                      </span>
                      {job.progress}%
                    </>
                  )}
                </span>
                {(job.status === 'pending' || job.status === 'processing') && (
                  <button
                    className={styles.cancelJobBtn}
                    onClick={() => cancelJob(job.id)}
                    aria-label="İptal et"
                  >
                    İptal
                  </button>
                )}
                {job.status === 'done' && job.url && (
                  <a
                    href={job.url}
                    download={`calisma-sayfasi.${job.format}`}
                    className={styles.downloadLink}
                    aria-label="İndir"
                  >
                    İndir
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
