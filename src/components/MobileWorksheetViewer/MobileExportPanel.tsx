import React, { useState, useCallback } from 'react';
import styles from './MobileWorksheetViewer.module.css';
import type { ExportFormat } from '../UniversalWorksheetViewer/types/worksheet';

interface MobileExportPanelProps {
  worksheetTitle: string;
  onExport: (format: ExportFormat) => void;
  isExporting?: boolean;
  onClose: () => void;
}

const QUICK_FORMATS: Array<{ format: ExportFormat; label: string; icon: string; description: string }> = [
  { format: 'pdf', label: 'PDF', icon: '📄', description: 'Yazdırmaya uygun' },
  { format: 'png', label: 'PNG', icon: '🖼️', description: 'Görsel paylaşım' },
  { format: 'docx', label: 'Metin', icon: '📝', description: 'Düzenlenebilir' },
  { format: 'json', label: 'Veri', icon: '💾', description: 'Yedekleme' },
];

export const MobileExportPanel: React.FC<MobileExportPanelProps> = ({
  worksheetTitle,
  onExport,
  isExporting = false,
  onClose,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [hasShared, setHasShared] = useState(false);

  const handleExport = useCallback(() => {
    onExport(selectedFormat);
  }, [onExport, selectedFormat]);

  const handleShare = useCallback(async () => {
    if (!navigator.share) {
      handleExport();
      return;
    }
    try {
      await navigator.share({
        title: worksheetTitle,
        text: `${worksheetTitle} - Oogmatik Çalışma Kağıdı`,
      });
      setHasShared(true);
    } catch {
      // Share cancelled or not supported
      handleExport();
    }
  }, [worksheetTitle, handleExport]);

  const hasNativeShare = Boolean(navigator.share);

  return (
    <div className={styles.mobileExportPanel} role="dialog" aria-label="Dışa aktarma">
      <div className={styles.mobileExportHandle} />

      <div className={styles.mobileExportHeader}>
        <h3 className={styles.mobileExportTitle}>Dışa Aktar</h3>
        <button className={styles.mobileCloseBtn} onClick={onClose} aria-label="Kapat">
          ✕
        </button>
      </div>

      <p className={styles.mobileExportSubtitle}>{worksheetTitle}</p>

      {/* Format grid */}
      <div className={styles.mobileFormatGrid} role="radiogroup" aria-label="Format seçin">
        {QUICK_FORMATS.map(({ format, label, icon, description }) => (
          <button
            key={format}
            className={`${styles.mobileFormatBtn} ${selectedFormat === format ? styles.mobileFormatBtnActive : ''}`}
            onClick={() => setSelectedFormat(format)}
            role="radio"
            aria-checked={selectedFormat === format}
          >
            <span className={styles.mobileFormatIcon}>{icon}</span>
            <span className={styles.mobileFormatLabel}>{label}</span>
            <span className={styles.mobileFormatDesc}>{description}</span>
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className={styles.mobileExportActions}>
        <button
          className={styles.mobileExportBtn}
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? '🔄 İşleniyor...' : '⬇ İndir'}
        </button>

        {hasNativeShare && (
          <button
            className={`${styles.mobileExportBtn} ${styles.mobileShareBtn}`}
            onClick={handleShare}
            disabled={isExporting}
          >
            {hasShared ? '✅ Paylaşıldı' : '↗ Paylaş'}
          </button>
        )}
      </div>
    </div>
  );
};

MobileExportPanel.displayName = 'MobileExportPanel';
