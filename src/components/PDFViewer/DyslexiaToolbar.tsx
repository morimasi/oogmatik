import React from 'react';
import styles from './PDFViewer.module.css';
import { DYSLEXIA_FONT_FAMILIES, LINE_HEIGHT_RANGE, LETTER_SPACING_RANGE } from './constants/pdfConfig';
import type { DyslexiaFontFamily } from './constants/pdfConfig';
import type { DyslexiaSettings, DyslexiaSettingsActions } from './hooks/useDyslexiaSettings';

type DyslexiaToolbarProps = DyslexiaSettings & Pick<DyslexiaSettingsActions, 'setFontFamily' | 'setHighContrast' | 'setLineHeight' | 'setLetterSpacing' | 'setBackgroundColor' | 'resetDyslexiaSettings'>;

const fontFamilyLabels: Record<DyslexiaFontFamily, string> = {
  default: 'Varsayılan',
  OpenDyslexic: 'OpenDyslexic',
  ReadingFont: 'Okuma Fontu',
};

const backgroundColorOptions = [
  { label: 'Beyaz', value: '#ffffff' },
  { label: 'Krem', value: '#fef9e7' },
  { label: 'Açık Mavi', value: '#e8f4f8' },
  { label: 'Açık Sarı', value: '#fffde7' },
  { label: 'Açık Yeşil', value: '#f1f8e9' },
];

export const DyslexiaToolbar: React.FC<DyslexiaToolbarProps> = React.memo(({
  fontFamily,
  highContrast,
  lineHeight,
  letterSpacing,
  backgroundColor,
  setFontFamily,
  setHighContrast,
  setLineHeight,
  setLetterSpacing,
  setBackgroundColor,
  resetDyslexiaSettings,
}) => {
  return (
    <div
      className={styles.dyslexiaToolbar}
      role="toolbar"
      aria-label="Disleksi erişilebilirlik ayarları"
    >
      <span className={styles.dyslexiaLabel}>
        <i className="fa-solid fa-universal-access mr-1" aria-hidden="true" />
        Disleksi
      </span>

      {/* Font family */}
      <label htmlFor="dyslexia-font" className="sr-only">
        Yazı tipi
      </label>
      <select
        id="dyslexia-font"
        className={styles.dyslexiaSelect}
        value={fontFamily}
        onChange={(e) => setFontFamily(e.target.value as DyslexiaFontFamily)}
        aria-label="Yazı tipi seçin"
        title="Yazı tipi"
      >
        {DYSLEXIA_FONT_FAMILIES.map((f) => (
          <option key={f} value={f}>
            {fontFamilyLabels[f]}
          </option>
        ))}
      </select>

      {/* Line height */}
      <label htmlFor="dyslexia-line-height" className={styles.dyslexiaLabel}>
        Satır
      </label>
      <input
        id="dyslexia-line-height"
        className={styles.dyslexiaSlider}
        type="range"
        min={LINE_HEIGHT_RANGE.min}
        max={LINE_HEIGHT_RANGE.max}
        step={LINE_HEIGHT_RANGE.step}
        value={lineHeight}
        onChange={(e) => setLineHeight(parseFloat(e.target.value))}
        aria-label={`Satır yüksekliği: ${lineHeight}`}
        aria-valuemin={LINE_HEIGHT_RANGE.min}
        aria-valuemax={LINE_HEIGHT_RANGE.max}
        aria-valuenow={lineHeight}
      />
      <span className="text-xs font-bold text-green-700 w-6" aria-hidden="true">
        {lineHeight.toFixed(1)}
      </span>

      {/* Letter spacing */}
      <label htmlFor="dyslexia-letter-spacing" className={styles.dyslexiaLabel}>
        Aralık
      </label>
      <input
        id="dyslexia-letter-spacing"
        className={styles.dyslexiaSlider}
        type="range"
        min={LETTER_SPACING_RANGE.min}
        max={LETTER_SPACING_RANGE.max}
        step={LETTER_SPACING_RANGE.step}
        value={letterSpacing}
        onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
        aria-label={`Harf aralığı: ${letterSpacing}px`}
        aria-valuemin={LETTER_SPACING_RANGE.min}
        aria-valuemax={LETTER_SPACING_RANGE.max}
        aria-valuenow={letterSpacing}
      />
      <span className="text-xs font-bold text-green-700 w-8" aria-hidden="true">
        {letterSpacing}px
      </span>

      {/* Background color */}
      <label htmlFor="dyslexia-bg-color" className={styles.dyslexiaLabel}>
        Arka Plan
      </label>
      <select
        id="dyslexia-bg-color"
        className={styles.dyslexiaSelect}
        value={backgroundColor}
        onChange={(e) => setBackgroundColor(e.target.value)}
        aria-label="Arka plan rengi seçin"
        title="Arka plan rengi"
      >
        {backgroundColorOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* High contrast toggle */}
      <label className={styles.dyslexiaToggle} htmlFor="dyslexia-high-contrast">
        <input
          id="dyslexia-high-contrast"
          type="checkbox"
          checked={highContrast}
          onChange={(e) => setHighContrast(e.target.checked)}
          aria-label="Yüksek kontrast modu"
        />
        Yüksek Kontrast
      </label>

      {/* Reset */}
      <button
        className="ml-auto text-xs font-bold text-green-700 hover:text-green-900 transition-colors px-2 py-1 rounded"
        onClick={resetDyslexiaSettings}
        aria-label="Disleksi ayarlarını sıfırla"
        title="Sıfırla"
      >
        <i className="fa-solid fa-rotate-left mr-1" aria-hidden="true" />
        Sıfırla
      </button>
    </div>
  );
});

DyslexiaToolbar.displayName = 'DyslexiaToolbar';
