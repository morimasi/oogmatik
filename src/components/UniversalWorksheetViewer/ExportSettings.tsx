import React, { useState, useCallback } from 'react';
import styles from './UniversalWorksheetViewer.module.css';
import type { ExportSettings, ExportFormat, PageSize, PageOrientation, ExportPreset } from './types/worksheet';

const DPI_OPTIONS = [72, 96, 150, 300] as const;

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

const MARGIN_LABELS = ['Yok', 'Dar (5mm)', 'Normal (15mm)', 'Geniş (25mm)'] as const;
const MARGIN_VALUES = [0, 5, 15, 25] as const;

interface ExportSettingsProps {
  settings: ExportSettings;
  onUpdate: (patch: Partial<ExportSettings>) => void;
  onSavePreset?: (name: string, settings: ExportSettings) => void;
  presets?: ExportPreset[];
  onLoadPreset?: (preset: ExportPreset) => void;
  onDeletePreset?: (id: string) => void;
}

export const ExportSettingsPanel: React.FC<ExportSettingsProps> = React.memo(
  ({ settings, onUpdate, onSavePreset, presets = [], onLoadPreset, onDeletePreset }) => {
    const [presetName, setPresetName] = useState('');
    const [showPresetSave, setShowPresetSave] = useState(false);

    const handleSavePreset = useCallback(() => {
      if (!presetName.trim() || !onSavePreset) return;
      onSavePreset(presetName.trim(), settings);
      setPresetName('');
      setShowPresetSave(false);
    }, [presetName, settings, onSavePreset]);

    const marginIndex = MARGIN_VALUES.indexOf(settings.marginMm as (typeof MARGIN_VALUES)[number]);
    const currentMarginIndex = marginIndex >= 0 ? marginIndex : 2;

    return (
      <div className={styles.exportSettings} role="region" aria-label="Dışa aktarma ayarları">
        {/* Format */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.fieldsetLegend}>Format</legend>
          <div className={styles.radioGroup}>
            {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((fmt) => (
              <label key={fmt} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="es-format"
                  value={fmt}
                  checked={settings.format === fmt}
                  onChange={() => onUpdate({ format: fmt })}
                />
                {FORMAT_LABELS[fmt]}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Page Size (PDF only) */}
        {settings.format === 'pdf' && (
          <>
            <fieldset className={styles.fieldset}>
              <legend className={styles.fieldsetLegend}>Sayfa Boyutu</legend>
              <select
                className={styles.select}
                value={settings.pageSize}
                onChange={(e) => onUpdate({ pageSize: e.target.value as PageSize })}
                aria-label="Sayfa boyutu seçin"
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
                    Gen.
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={settings.customWidth ?? 210}
                      min={50}
                      max={1000}
                      onChange={(e) => onUpdate({ customWidth: Number(e.target.value) })}
                    />
                  </label>
                  <label className={styles.inputLabel}>
                    Yük.
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={settings.customHeight ?? 297}
                      min={50}
                      max={1500}
                      onChange={(e) => onUpdate({ customHeight: Number(e.target.value) })}
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
                      name="es-orientation"
                      value={o}
                      checked={settings.orientation === o}
                      onChange={() => onUpdate({ orientation: o })}
                    />
                    {o === 'portrait' ? '↕ Dikey' : '↔ Yatay'}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Margins */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.fieldsetLegend}>Kenar Boşluğu</legend>
              <select
                className={styles.select}
                value={currentMarginIndex}
                onChange={(e) => onUpdate({ marginMm: MARGIN_VALUES[Number(e.target.value)] })}
                aria-label="Kenar boşluğu seçin"
              >
                {MARGIN_LABELS.map((label, i) => (
                  <option key={i} value={i}>
                    {label}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* Header / Footer */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.fieldsetLegend}>Üst / Alt Bilgi</legend>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.includeHeader}
                  onChange={(e) => onUpdate({ includeHeader: e.target.checked })}
                />
                Üst bilgi
              </label>
              {settings.includeHeader && (
                <input
                  className={styles.textInput}
                  value={settings.headerText ?? ''}
                  onChange={(e) => onUpdate({ headerText: e.target.value })}
                  placeholder="Üst bilgi metni..."
                  aria-label="Üst bilgi"
                />
              )}
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={settings.includeFooter}
                  onChange={(e) => onUpdate({ includeFooter: e.target.checked })}
                />
                Alt bilgi
              </label>
              {settings.includeFooter && (
                <input
                  className={styles.textInput}
                  value={settings.footerText ?? ''}
                  onChange={(e) => onUpdate({ footerText: e.target.value })}
                  placeholder="Alt bilgi metni..."
                  aria-label="Alt bilgi"
                />
              )}
            </fieldset>
          </>
        )}

        {/* DPI (PNG only) */}
        {settings.format === 'png' && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.fieldsetLegend}>Çözünürlük (DPI)</legend>
            <div className={styles.radioGroup}>
              {DPI_OPTIONS.map((dpi) => (
                <label key={dpi} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="es-dpi"
                    value={dpi}
                    checked={(settings.pngDpi ?? 150) === dpi}
                    onChange={() => onUpdate({ pngDpi: dpi })}
                  />
                  {dpi} DPI
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Presets */}
        {(presets.length > 0 || onSavePreset) && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.fieldsetLegend}>Ön Ayarlar</legend>

            {presets.length > 0 && (
              <div className={styles.presetList}>
                {presets.map((p) => (
                  <div key={p.id} className={styles.presetItem}>
                    <button
                      className={styles.presetLoadBtn}
                      onClick={() => onLoadPreset?.(p)}
                      title={`${p.name} ön ayarını yükle`}
                    >
                      📋 {p.name}
                    </button>
                    {onDeletePreset && (
                      <button
                        className={styles.presetDeleteBtn}
                        onClick={() => onDeletePreset(p.id)}
                        aria-label={`${p.name} ön ayarını sil`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {onSavePreset && (
              <div>
                {showPresetSave ? (
                  <div className={styles.row}>
                    <input
                      className={styles.textInput}
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="Ön ayar adı..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                      autoFocus
                    />
                    <button className={styles.exportBtn} onClick={handleSavePreset} disabled={!presetName.trim()}>
                      Kaydet
                    </button>
                    <button className={styles.cancelBtn} onClick={() => setShowPresetSave(false)}>
                      İptal
                    </button>
                  </div>
                ) : (
                  <button className={styles.toolbarBtn} onClick={() => setShowPresetSave(true)}>
                    + Ön ayar olarak kaydet
                  </button>
                )}
              </div>
            )}
          </fieldset>
        )}
      </div>
    );
  },
);

ExportSettingsPanel.displayName = 'ExportSettingsPanel';
