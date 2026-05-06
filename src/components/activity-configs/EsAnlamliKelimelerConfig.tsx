import React from 'react';
import { GeneratorOptions } from '../../types';

// ── Premium Toggle Group ────────────────────────────────────────────────
const ToggleGroup = ({
  label,
  icon,
  selected,
  onChange,
  options,
}: {
  label: string;
  icon?: string;
  selected: unknown;
  onChange: (v: unknown) => void;
  options: { value: unknown; label: string; icon?: string }[];
}) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] flex items-center gap-1.5">
      {icon && <i className={`fa-solid ${icon} text-[var(--accent-color)]`} />}
      {label}
    </label>
    <div className="flex bg-[var(--surface-glass)] p-0.5 rounded-xl border border-[var(--border-color)]">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1 ${
            selected === opt.value
              ? 'bg-[var(--accent-color)] text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
          }`}
        >
          {opt.icon && <i className={`fa-solid ${opt.icon} text-[8px]`} />}
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

// ── Premium Slider ──────────────────────────────────────────────────────
const PremiumSlider = ({
  label,
  icon,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  label: string;
  icon?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] flex items-center gap-1.5">
        {icon && <i className={`fa-solid ${icon} text-[var(--accent-color)]`} />}
        {label}
      </label>
      <span className="text-[11px] font-black text-[var(--accent-color)] bg-[var(--accent-muted)] px-2 py-0.5 rounded-lg">
        {value}{suffix || ''}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step || 1}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[var(--accent-color)] h-1.5"
    />
    <div className="flex justify-between text-[8px] text-[var(--text-muted)]">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

// ── Premium Toggle Switch ───────────────────────────────────────────────
const ToggleSwitch = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between p-2.5 bg-[var(--surface-glass)] rounded-xl border border-[var(--border-color)]">
    <div>
      <p className="text-[11px] font-black text-[var(--text-primary)]">{label}</p>
      {description && <p className="text-[9px] text-[var(--text-muted)]">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full transition-all duration-200 relative shrink-0 ${
        checked ? 'bg-[var(--accent-color)]' : 'bg-[var(--text-muted)]/30'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
          checked ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// ES ANLAMLI KELIMELER CONFIG — Ultra Özelleştirilebilir
// ══════════════════════════════════════════════════════════════════════════
export const EsAnlamliKelimelerConfig = ({
  options,
  onChange,
}: {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}) => {
  const opts = options as Record<string, unknown>;

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Ana Ayarlar */}
      <div className="p-3 bg-[var(--accent-muted)] rounded-2xl border border-[var(--accent-color)]/20 space-y-3">
        <h4 className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] flex items-center gap-1.5">
          <i className="fa-solid fa-link" /> Kelime Bağlama Ayarları
        </h4>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] flex items-center gap-1.5">
            <i className="fa-solid fa-tags text-[var(--accent-color)]" /> Kelime Teması
          </label>
          <input
            type="text"
            value={(opts.topic as string) || ''}
            onChange={(e) => onChange('topic', e.target.value)}
            placeholder="Örn: Doğa, Spor, Duygular..."
            className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] shadow-inner"
          />
        </div>

        <PremiumSlider
          label="Kelime Sayısı"
          icon="fa-list-numeric"
          value={(opts.itemCount as number) || (opts.wordCount as number) || 8}
          min={4}
          max={15}
          onChange={(v) => onChange('itemCount', v)}
          suffix=" kelime"
        />
      </div>

      {/* Gelişmiş Özellikler */}
      <div className="p-3 bg-[var(--surface-glass)] rounded-2xl border border-[var(--border-color)] space-y-3">
        <h4 className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-1.5">
          <i className="fa-solid fa-sliders" /> İçerik Detayları
        </h4>

        <ToggleSwitch
          label="Antonym (Zıt) Dahil Et"
          description="Eş anlamlılarla birlikte zıt anlamlıları da sor"
          checked={(opts.includeAntonyms as boolean) ?? false}
          onChange={(v) => onChange('includeAntonyms' as keyof GeneratorOptions, v)}
        />

        <ToggleSwitch
          label="Örnek Cümleler"
          description="Kelimeleri cümle içinde kullan"
          checked={(opts.includeExamples as boolean) ?? true}
          onChange={(v) => onChange('includeExamples' as keyof GeneratorOptions, v)}
        />

        <ToggleGroup
          label="Sayfa Düzeni"
          icon="fa-table-columns"
          selected={(opts.layoutType as string) || 'match_columns'}
          onChange={(v) => onChange('layoutType' as keyof GeneratorOptions, v)}
          options={[
            { value: 'match_columns', label: 'Eşleştirme', icon: 'fa-grip-lines' },
            { value: 'card_grid', label: 'Kartlar', icon: 'fa-grip' },
            { value: 'list', label: 'Liste', icon: 'fa-list' },
          ]}
        />
        
        <ToggleSwitch
           label="Syllable Coloring"
           description="Heceleri renklendir (Disleksi Dostu)"
           checked={(opts.syllableColoring as boolean) ?? false}
           onChange={(v) => onChange('syllableColoring' as keyof GeneratorOptions, v)}
        />
      </div>
    </div>
  );
};
