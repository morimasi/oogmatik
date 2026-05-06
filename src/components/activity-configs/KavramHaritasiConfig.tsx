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

// ══════════════════════════════════════════════════════════════════════════
// KAVRAM HARITASI CONFIG — Ultra Özelleştirilebilir
// ══════════════════════════════════════════════════════════════════════════
export const KavramHaritasiConfig = ({
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
          <i className="fa-solid fa-sitemap" /> Kavram Haritası Ayarları
        </h4>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] flex items-center gap-1.5">
            <i className="fa-solid fa-font text-[var(--accent-color)]" /> Ana Kavram
          </label>
          <input
            type="text"
            value={(opts.topic as string) || (opts.concept as string) || ''}
            onChange={(e) => onChange('topic', e.target.value)}
            placeholder="Örn: Canlılar, Ekosistem..."
            className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] shadow-inner"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PremiumSlider
            label="Derinlik"
            icon="fa-layer-group"
            value={(opts.depth as number) || 2}
            min={1}
            max={3}
            onChange={(v) => onChange('depth' as keyof GeneratorOptions, v)}
          />
          <PremiumSlider
            label="Dal Sayısı"
            icon="fa-code-branch"
            value={(opts.branchCount as number) || 3}
            min={2}
            max={6}
            onChange={(v) => onChange('branchCount' as keyof GeneratorOptions, v)}
          />
        </div>
      </div>

      {/* Görsel ve Tasarım Ayarları */}
      <div className="p-3 bg-[var(--surface-glass)] rounded-2xl border border-[var(--border-color)] space-y-3">
        <h4 className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-1.5">
          <i className="fa-solid fa-palette" /> Tasarım ve Stil
        </h4>

        <ToggleGroup
          label="Yerleşim Tipi"
          icon="fa-arrows-split-up-and-left"
          selected={(opts.layoutType as string) || 'tree'}
          onChange={(v) => onChange('layoutType' as keyof GeneratorOptions, v)}
          options={[
            { value: 'tree', label: 'Ağaç', icon: 'fa-tree' },
            { value: 'radial', label: 'Merkez', icon: 'fa-circle-dot' },
            { value: 'horizontal', label: 'Yatay', icon: 'fa-arrows-left-right' },
          ]}
        />

        <ToggleGroup
          label="Düğüm Stili"
          icon="fa-shapes"
          selected={(opts.nodeStyle as string) || 'rounded'}
          onChange={(v) => onChange('nodeStyle' as keyof GeneratorOptions, v)}
          options={[
            { value: 'rounded', label: 'Yuvarlak' },
            { value: 'sharp', label: 'Keskin' },
            { value: 'circle', label: 'Daire' },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
           <PremiumSlider
             label="Doluluk"
             icon="fa-fill-drip"
             value={(opts.fillRatio as number) || 60}
             min={20}
             max={100}
             step={10}
             onChange={(v) => onChange('fillRatio' as keyof GeneratorOptions, v)}
             suffix="%"
           />
           <ToggleGroup
             label="Renk"
             icon="fa-droplet"
             selected={(opts.colorPalette as string) || 'pastel'}
             onChange={(v) => onChange('colorPalette' as keyof GeneratorOptions, v)}
             options={[
               { value: 'mono', label: 'S/B' },
               { value: 'pastel', label: 'Pastel' },
             ]}
           />
        </div>
      </div>
    </div>
  );
};
