import React from 'react';
import type { DyslexiaSettings } from './types/worksheet';
import styles from './UniversalWorksheetViewer.module.css';

interface DyslexiaControlsProps {
  settings: DyslexiaSettings;
  onChange: (updates: Partial<DyslexiaSettings>) => void;
}

const FONT_OPTIONS = [
  { value: 'default', label: 'Varsayılan' },
  { value: 'OpenDyslexic', label: 'OpenDyslexic' },
  { value: 'ReadingFont', label: 'Okuma Fontu' },
] as const;

const BG_COLORS = [
  { value: '#ffffff', label: 'Beyaz' },
  { value: '#fffde7', label: 'Sarı' },
  { value: '#f1f8e9', label: 'Yeşil' },
  { value: '#e3f2fd', label: 'Mavi' },
  { value: '#fce4ec', label: 'Pembe' },
  { value: '#000000', label: 'Siyah' },
] as const;

export function DyslexiaControls({ settings, onChange }: DyslexiaControlsProps) {
  return (
    <aside className={styles.dyslexiaControls} aria-label="Disleksi erişilebilirlik ayarları">
      <h2 className={styles.dyslexiaTitle}>Erişilebilirlik</h2>

      {/* Font family */}
      <fieldset className={styles.dyslexiaFieldset}>
        <legend className={styles.dyslexiaLegend}>Yazı Tipi</legend>
        <div className={styles.dyslexiaFontOptions} role="radiogroup" aria-label="Yazı tipi seçimi">
          {FONT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`${styles.dyslexiaFontOption} ${settings.fontFamily === opt.value ? styles.dyslexiaFontOptionActive : ''}`}
            >
              <input
                type="radio"
                name="dyslexia-font"
                value={opt.value}
                checked={settings.fontFamily === opt.value}
                onChange={() => onChange({ fontFamily: opt.value })}
                className={styles.srOnly}
                aria-label={opt.label}
              />
              <span
                style={{
                  fontFamily:
                    opt.value === 'default'
                      ? 'inherit'
                      : opt.value === 'OpenDyslexic'
                        ? '"OpenDyslexic", sans-serif'
                        : '"Arial", sans-serif',
                }}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Line height */}
      <fieldset className={styles.dyslexiaFieldset}>
        <legend className={styles.dyslexiaLegend}>
          Satır Yüksekliği: <strong>{settings.lineHeight.toFixed(1)}</strong>
        </legend>
        <input
          type="range"
          className={styles.dyslexiaSlider}
          min={1.0}
          max={2.0}
          step={0.1}
          value={settings.lineHeight}
          onChange={(e) => onChange({ lineHeight: parseFloat(e.target.value) })}
          aria-label={`Satır yüksekliği: ${settings.lineHeight.toFixed(1)}`}
          aria-valuemin={1.0}
          aria-valuemax={2.0}
          aria-valuenow={settings.lineHeight}
        />
        <div className={styles.dyslexiaSliderLabels} aria-hidden="true">
          <span>1.0</span>
          <span>2.0</span>
        </div>
      </fieldset>

      {/* Letter spacing */}
      <fieldset className={styles.dyslexiaFieldset}>
        <legend className={styles.dyslexiaLegend}>
          Harf Aralığı: <strong>{settings.letterSpacing}px</strong>
        </legend>
        <input
          type="range"
          className={styles.dyslexiaSlider}
          min={0}
          max={10}
          step={0.5}
          value={settings.letterSpacing}
          onChange={(e) => onChange({ letterSpacing: parseFloat(e.target.value) })}
          aria-label={`Harf aralığı: ${settings.letterSpacing}px`}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={settings.letterSpacing}
        />
        <div className={styles.dyslexiaSliderLabels} aria-hidden="true">
          <span>0px</span>
          <span>10px</span>
        </div>
      </fieldset>

      {/* High contrast toggle */}
      <fieldset className={styles.dyslexiaFieldset}>
        <legend className={styles.dyslexiaLegend}>Yüksek Kontrast</legend>
        <label className={styles.dyslexiaToggleLabel}>
          <input
            type="checkbox"
            className={styles.dyslexiaToggle}
            checked={settings.highContrast}
            onChange={(e) => onChange({ highContrast: e.target.checked })}
            aria-label="Yüksek kontrast modu"
          />
          <span className={styles.dyslexiaToggleSlider} aria-hidden="true" />
          <span className={styles.dyslexiaToggleText}>
            {settings.highContrast ? 'Açık' : 'Kapalı'}
          </span>
        </label>
      </fieldset>

      {/* Background color */}
      <fieldset className={styles.dyslexiaFieldset}>
        <legend className={styles.dyslexiaLegend}>Arka Plan Rengi</legend>
        <div className={styles.dyslexiaBgColors} role="radiogroup" aria-label="Arka plan rengi seçimi">
          {BG_COLORS.map((c) => (
            <label
              key={c.value}
              className={`${styles.dyslexiaBgSwatch} ${settings.backgroundColor === c.value ? styles.dyslexiaBgSwatchActive : ''}`}
              title={c.label}
            >
              <input
                type="radio"
                name="dyslexia-bg"
                value={c.value}
                checked={settings.backgroundColor === c.value}
                onChange={() => onChange({ backgroundColor: c.value })}
                className={styles.srOnly}
                aria-label={c.label}
              />
              <span
                className={styles.dyslexiaBgSwatchColor}
                style={{ backgroundColor: c.value, border: c.value === '#ffffff' ? '1px solid #d1d5db' : undefined }}
              />
            </label>
          ))}
          {/* Custom color picker */}
          <label className={styles.dyslexiaBgCustomLabel} title="Özel renk">
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className={styles.dyslexiaBgCustomInput}
              aria-label="Özel arka plan rengi"
            />
            <span className={styles.dyslexiaBgCustomIcon} aria-hidden="true">🎨</span>
          </label>
        </div>
      </fieldset>

      {/* Reduced motion */}
      <fieldset className={styles.dyslexiaFieldset}>
        <legend className={styles.dyslexiaLegend}>Azaltılmış Hareket</legend>
        <label className={styles.dyslexiaToggleLabel}>
          <input
            type="checkbox"
            className={styles.dyslexiaToggle}
            checked={settings.reducedMotion}
            onChange={(e) => onChange({ reducedMotion: e.target.checked })}
            aria-label="Azaltılmış hareket modu"
          />
          <span className={styles.dyslexiaToggleSlider} aria-hidden="true" />
          <span className={styles.dyslexiaToggleText}>
            {settings.reducedMotion ? 'Açık' : 'Kapalı'}
          </span>
        </label>
      </fieldset>

      {/* Reset */}
      <button
        className={styles.dyslexiaResetBtn}
        onClick={() =>
          onChange({
            fontFamily: 'default',
            lineHeight: 1.5,
            letterSpacing: 0,
            highContrast: false,
            backgroundColor: '#ffffff',
            reducedMotion: false,
          })
        }
        aria-label="Erişilebilirlik ayarlarını sıfırla"
      >
        Sıfırla
      </button>
    </aside>
  );
}
