import React from 'react';

/**
 * A4 Tasarımcısı ortak kontrolleri.
 * Tümü uygulamanın tema token'larını (--bg-paper, --text-primary, --accent-color ...)
 * kullanır; sabit renk yoktur. Böylece açık/koyu tüm temalarda panel uyumlu kalır.
 */

const inputClass =
  'w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-colors';

export const Section = ({
  title,
  icon,
  description,
  action,
  children,
}: {
  title: string;
  icon?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-glass)]/40 p-3">
    <header className="flex items-center justify-between gap-2 mb-2.5">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <i className={`fa-solid ${icon} text-[10px] text-[var(--accent-color)]`}></i>}
        <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-secondary)] truncate">
          {title}
        </h3>
      </div>
      {action}
    </header>
    {description && (
      <p className="mb-2 text-[9px] leading-relaxed text-[var(--text-muted)]">{description}</p>
    )}
    <div className="space-y-2.5">{children}</div>
  </section>
);

export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <div className="flex items-baseline justify-between gap-2">
      <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </label>
      {hint && <span className="text-[8px] text-[var(--text-muted)] opacity-80">{hint}</span>}
    </div>
    {children}
  </div>
);

export const TextField = ({
  value,
  onChange,
  placeholder,
  multiline,
  rows = 4,
  mono,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  mono?: boolean;
}) =>
  multiline ? (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputClass} resize-y custom-scrollbar leading-relaxed ${mono ? 'font-mono text-[10px]' : ''}`}
    />
  ) : (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  );

export const NumberField = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  placeholder,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
}) => (
  <div className="relative">
    <input
      type="number"
      value={value === undefined || Number.isNaN(value) ? '' : value}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      onChange={(event) => {
        const raw = event.target.value;
        if (raw === '') {
          onChange(undefined);
          return;
        }
        const parsed = Number(raw);
        onChange(Number.isNaN(parsed) ? undefined : parsed);
      }}
      className={`${inputClass} ${unit ? 'pr-7' : ''}`}
    />
    {unit && (
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[var(--text-muted)]">
        {unit}
      </span>
    )}
  </div>
);

export const RangeField = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = 'px',
  onReset,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onReset?: () => void;
}) => (
  <Field
    label={label}
    hint={`${value ?? '—'}${unit}`}
  >
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? min}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 flex-1 cursor-pointer accent-[var(--accent-color)]"
        aria-label={label}
      />
      <button
        type="button"
        onClick={() => (onReset ? onReset() : onChange(min))}
        title="Varsayılana döndür"
        className="w-6 h-6 rounded-md border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-colors"
      >
        <i className="fa-solid fa-rotate-left text-[9px]"></i>
      </button>
    </div>
  </Field>
);

export const ColorField = ({
  label,
  value,
  onChange,
  fallback = '#000000',
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  fallback?: string;
}) => (
  <Field label={label}>
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={value || fallback}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 w-8 shrink-0 cursor-pointer overflow-hidden rounded-md border border-[var(--border-color)] bg-transparent"
        aria-label={`${label} renk seçici`}
      />
      <input
        type="text"
        value={value ?? ''}
        placeholder="devralınan"
        onChange={(event) => onChange(event.target.value || undefined)}
        className={`${inputClass} font-mono`}
      />
      <button
        type="button"
        onClick={() => onChange(undefined)}
        title="Rengi temizle (devralınan stil)"
        className="h-7 w-7 shrink-0 rounded-md border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
      >
        <i className="fa-solid fa-xmark text-[10px]"></i>
      </button>
    </div>
  </Field>
);

export const Segmented = <T extends string,>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T | undefined;
  options: Array<{ value: T; label?: string; icon?: string; title?: string }>;
  onChange: (value: T) => void;
  ariaLabel?: string;
}) => (
  <div
    role="group"
    aria-label={ariaLabel}
    className="flex overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-0.5"
  >
    {options.map((option) => {
      const active = value === option.value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          title={option.title ?? option.label ?? option.value}
          aria-pressed={active}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1 text-[9px] font-black uppercase tracking-wide transition-colors ${
            active
              ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
          }`}
        >
          {option.icon && <i className={`fa-solid ${option.icon} text-[10px]`}></i>}
          {option.label && <span>{option.label}</span>}
        </button>
      );
    })}
  </div>
);

export const ToggleRow = ({
  label,
  checked,
  onChange,
  icon,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: string;
  hint?: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between gap-2 rounded-xl border border-transparent px-1 py-1.5 text-left transition-colors hover:border-[var(--border-color)] hover:bg-[var(--surface-elevated)]/60"
  >
    <span className="flex min-w-0 items-center gap-2">
      {icon && (
        <i
          className={`fa-solid ${icon} text-[10px] ${
            checked ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'
          }`}
        ></i>
      )}
      <span className="min-w-0">
        <span className="block truncate text-[10px] font-bold text-[var(--text-secondary)]">{label}</span>
        {hint && <span className="block truncate text-[8px] text-[var(--text-muted)]">{hint}</span>}
      </span>
    </span>
    <span
      className={`relative h-4 w-8 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]'
      }`}
    >
      <span
        className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${
          checked ? 'left-4' : 'left-0.5'
        }`}
      />
    </span>
  </button>
);

export const MiniButton = ({
  icon,
  label,
  title,
  onClick,
  active,
  danger,
  disabled,
}: {
  icon: string;
  label?: string;
  title: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    aria-pressed={active}
    disabled={disabled}
    className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[9px] font-black uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
      active
        ? 'border-[var(--accent-color)] bg-[var(--accent-muted)] text-[var(--accent-color)]'
        : danger
          ? 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-red-400 hover:text-red-500'
          : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--text-primary)]'
    }`}
  >
    <i className={`fa-solid ${icon} text-[10px]`}></i>
    {label && <span>{label}</span>}
  </button>
);

export const EmptyState = ({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--surface-glass)] text-[var(--text-muted)] shadow-sm">
      <i className={`fa-solid ${icon} text-lg`}></i>
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-secondary)]">
      {title}
    </p>
    <p className="mt-1.5 max-w-[220px] text-[10px] leading-relaxed text-[var(--text-muted)]">
      {description}
    </p>
    {children && <div className="mt-4 w-full">{children}</div>}
  </div>
);
