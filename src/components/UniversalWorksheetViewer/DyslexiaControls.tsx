import React from 'react';
import styles from './UniversalWorksheetViewer.module.css';
import type { DyslexiaSettings, WorksheetFontFamily, ContrastMode } from './types/worksheet';
import {
  WORKSHEET_FONT_FAMILIES,
  CONTRAST_MODES,
} from './types/worksheet';
import {
  FONT_FAMILY_LABELS,
  BACKGROUND_COLOR_PRESETS,
  DEFAULT_DYSLEXIA_SETTINGS,
} from './constants/templates';

interface DyslexiaControlsProps {
  settings: DyslexiaSettings;
  onUpdate: (patch: Partial<DyslexiaSettings>) => void;
  onReset: () => void;
}

const CONTRAST_LABELS: Record<ContrastMode, string> = {
  normal: 'Normal',
  high: 'Yüksek Kontrast',
  inverted: 'Ters Çevrilmiş',
};

export const DyslexiaControls: React.FC<DyslexiaControlsProps> = React.memo(
  ({ settings, onUpdate, onReset }) => {
    return (
      <div
        className={styles.dyslexiaControls}
        role="region"
        aria-label="Disleksi erişilebilirlik ayarları"
      >
        <h3 className={styles.panelTitle}>
          <i className="fa-solid fa-universal-access" aria-hidden="true" /> Erişilebilirlik
        </h3>

        {/* Font family */}
        <div className={styles.controlGroup}>
          <label htmlFor="uwv-font" className={styles.controlLabel}>
            Yazı Tipi
          </label>
          <select
            id="uwv-font"
            className={styles.select}
            value={settings.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value as WorksheetFontFamily })}
            aria-label="Yazı tipi seçin"
          >
            {WORKSHEET_FONT_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {FONT_FAMILY_LABELS[f] ?? f}
              </option>
            ))}
          </select>
        </div>

        {/* Font size */}
        <div className={styles.controlGroup}>
          <label htmlFor="uwv-font-size" className={styles.controlLabel}>
            Yazı Boyutu: {settings.fontSize}px
          </label>
          <input
            id="uwv-font-size"
            type="range"
            className={styles.slider}
            min={12}
            max={32}
            step={1}
            value={settings.fontSize}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            aria-label={`Yazı boyutu: ${settings.fontSize}px`}
            aria-valuemin={12}
            aria-valuemax={32}
            aria-valuenow={settings.fontSize}
          />
        </div>

        {/* Line height */}
        <div className={styles.controlGroup}>
          <label htmlFor="uwv-line-height" className={styles.controlLabel}>
            Satır Yüksekliği: {settings.lineHeight.toFixed(1)}
          </label>
          <input
            id="uwv-line-height"
            type="range"
            className={styles.slider}
            min={1.0}
            max={2.0}
            step={0.1}
            value={settings.lineHeight}
            onChange={(e) => onUpdate({ lineHeight: parseFloat(e.target.value) })}
            aria-label={`Satır yüksekliği: ${settings.lineHeight}`}
            aria-valuemin={1.0}
            aria-valuemax={2.0}
            aria-valuenow={settings.lineHeight}
          />
        </div>

        {/* Letter spacing */}
        <div className={styles.controlGroup}>
          <label htmlFor="uwv-letter-spacing" className={styles.controlLabel}>
            Harf Aralığı: {settings.letterSpacing}px
          </label>
          <input
            id="uwv-letter-spacing"
            type="range"
            className={styles.slider}
            min={0}
            max={10}
            step={0.5}
            value={settings.letterSpacing}
            onChange={(e) => onUpdate({ letterSpacing: parseFloat(e.target.value) })}
            aria-label={`Harf aralığı: ${settings.letterSpacing}px`}
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={settings.letterSpacing}
          />
        </div>

        {/* Contrast mode */}
        <div className={styles.controlGroup}>
          <label htmlFor="uwv-contrast" className={styles.controlLabel}>
            Kontrast Modu
          </label>
          <select
            id="uwv-contrast"
            className={styles.select}
            value={settings.contrastMode}
            onChange={(e) => onUpdate({ contrastMode: e.target.value as ContrastMode })}
            aria-label="Kontrast modu seçin"
          >
            {CONTRAST_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {CONTRAST_LABELS[mode]}
              </option>
            ))}
          </select>
        </div>

        {/* Background color */}
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Arka Plan Rengi</span>
          <div className={styles.colorSwatches}>
            {BACKGROUND_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                className={`${styles.colorSwatch} ${settings.backgroundColor === preset.value ? styles.colorSwatchActive : ''}`}
                style={{ backgroundColor: preset.value }}
                onClick={() => onUpdate({ backgroundColor: preset.value })}
                aria-label={preset.label}
                title={preset.label}
              />
            ))}
            <label className={styles.customColorLabel} title="Özel renk seç">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className={styles.colorPickerInput}
                aria-label="Özel arka plan rengi"
              />
              <span>🎨</span>
            </label>
          </div>
        </div>

        {/* Reset */}
        <button
          className={styles.resetBtn}
          onClick={onReset}
          aria-label="Erişilebilirlik ayarlarını sıfırla"
        >
          ↺ Varsayılana Sıfırla
        </button>

        {/* Live preview sample */}
        <div
          className={styles.dyslexiaSample}
          style={{
            fontFamily:
              settings.fontFamily === 'default'
                ? 'inherit'
                : `"${settings.fontFamily}", sans-serif`,
            lineHeight: settings.lineHeight,
            letterSpacing: `${settings.letterSpacing}px`,
            fontSize: `${settings.fontSize}px`,
            backgroundColor: settings.backgroundColor,
            filter:
              settings.contrastMode === 'high'
                ? 'contrast(1.5)'
                : settings.contrastMode === 'inverted'
                ? 'invert(1)'
                : undefined,
          }}
          aria-label="Yazı tipi önizlemesi"
        >
          Örnek Metin: Disleksi dostu yazı tipi ile okuma kolaylaşır.
        </div>
      </div>
    );
  },
);

DyslexiaControls.displayName = 'DyslexiaControls';

// Default settings re-export for convenience
export { DEFAULT_DYSLEXIA_SETTINGS };
