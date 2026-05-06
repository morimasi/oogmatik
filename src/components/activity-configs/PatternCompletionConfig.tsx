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
// PATTERN COMPLETION CONFIG — Ultra Özelleştirilebilir
// ══════════════════════════════════════════════════════════════════════════
export const PatternCompletionConfig = ({
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
          <i className="fa-solid fa-puzzle-piece" /> Desen Bulmacası Ayarları
        </h4>

        <PremiumSlider
          label="Bulmaca Sayısı (Sayfadaki)"
          icon="fa-th-large"
          value={(opts.puzzleCount as number) || 4}
          min={1}
          max={8}
          onChange={(v) => onChange('puzzleCount' as keyof GeneratorOptions, v)}
          suffix=" adet"
        />

        <ToggleGroup
          label="Matris Boyutu"
          icon="fa-border-all"
          selected={(opts.gridSize as number) || 3}
          onChange={(v) => onChange('gridSize', v)}
          options={[
            { value: 2, label: '2×2', icon: 'fa-square' },
            { value: 3, label: '3×3', icon: 'fa-grip' },
            { value: 4, label: '4×4', icon: 'fa-table-cells' },
          ]}
        />

        <ToggleGroup
          label="Desen Formatı"
          icon="fa-shapes"
          selected={(opts.patternType as string) || 'geometric'}
          onChange={(v) => onChange('patternType', v)}
          options={[
            { value: 'geometric', label: 'Geometrik' },
            { value: 'color_blocks', label: 'Renk Blokları' },
            { value: 'logic_sequence', label: 'Diziler' },
          ]}
        />
      </div>

      {/* Gelişmiş Ayarlar */}
      <div className="p-3 bg-[var(--surface-glass)] rounded-2xl border border-[var(--border-color)] space-y-3">
        <h4 className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-1.5">
          <i className="fa-solid fa-sliders" /> Gelişmiş
        </h4>

        <ToggleGroup
          label="Seçenek Sayısı"
          icon="fa-list-ol"
          selected={(opts.optionCount as number) || 4}
          onChange={(v) => onChange('optionCount' as keyof GeneratorOptions, v)}
          options={[
            { value: 3, label: '3 Şık' },
            { value: 4, label: '4 Şık' },
            { value: 5, label: '5 Şık' },
          ]}
        />

        <ToggleGroup
          label="Zorluk Artışı"
          icon="fa-chart-line"
          selected={(opts.difficultyProgression as string) || 'static'}
          onChange={(v) => onChange('difficultyProgression' as keyof GeneratorOptions, v)}
          options={[
            { value: 'static', label: 'Sabit' },
            { value: 'gradual', label: 'Kademeli' },
          ]}
        />

        <ToggleSwitch
          label="Kompakt Düzen"
          description="Bulmacalar arası boşluğu minimuma indir"
          checked={(opts.compactLayout as boolean) ?? true}
          onChange={(v) => onChange('compactLayout' as keyof GeneratorOptions, v)}
        />

        <ToggleSwitch
          label="Sayfa Numaralandırma"
          description="Her bulmacaya sıra numarası ekle"
          checked={(opts.showNumbers as boolean) ?? true}
          onChange={(v) => onChange('showNumbers', v)}
        />
      </div>
    </div>
  );
};
