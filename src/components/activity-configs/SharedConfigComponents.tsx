import React from 'react';

/**
 * BDMIND - Shared Config Components
 * Tüm jeneratör ayar panellerinde kullanılan ortak, tema uyumlu bileşenler.
 */

interface ToggleOption {
    value: string;
    label: string;
}

interface CompactToggleGroupProps {
    label: string;
    selected: string;
    onChange: (value: string) => void;
    options: ToggleOption[];
}

export const CompactToggleGroup: React.FC<CompactToggleGroupProps> = ({ label, selected, onChange, options }) => (
    <div className="space-y-1 font-lexend">
        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block ml-1">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)] shadow-inner">
            {options.map((opt: ToggleOption) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider ${selected === opt.value ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)] border border-[var(--border-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

interface CompactCounterProps {
    label?: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    icon?: string;
}

export const CompactCounter: React.FC<CompactCounterProps> = ({ label, value, onChange, min, max, icon }) => (
    <div className="space-y-1 font-lexend">
        {label && <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block ml-1">{icon && <i className={`fa-solid ${icon} mr-1`}></i>}{label}</label>}
        <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-1 shadow-inner">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"
                disabled={value <= min}
            >
                <i className="fa-solid fa-minus text-[10px]"></i>
            </button>
            <span className="flex-1 text-center text-xs font-black text-[var(--text-primary)]">{value}</span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + 1))}
                className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"
                disabled={value >= max}
            >
                <i className="fa-solid fa-plus text-[10px]"></i>
            </button>
        </div>
    </div>
);

interface CompactSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    unit?: string;
}

export const CompactSlider: React.FC<CompactSliderProps> = ({ label, value, onChange, min, max, unit = '' }) => (
    <div className="space-y-1 font-lexend">
        <div className="flex justify-between items-center text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
            <span>{label}</span>
            <span className="text-[var(--accent-color)]">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)] border border-[var(--border-color)]"
        />
    </div>
);

// ─── 10 YENİ TEMA-UYUMLU BİLEŞEN ─────────────────────────────────────────────

interface SectionTitleProps {
    icon?: string;
    label: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ icon, label }) => (
    <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3 font-lexend">
        {icon && <i className={`fa-solid ${icon} text-[var(--accent-color)]`} />}
        {label}
    </label>
);

interface ConfigSectionProps {
    icon?: string;
    label?: string;
    children: React.ReactNode;
    accent?: boolean;
    className?: string;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({ icon, label, children, accent = false, className = '' }) => (
    <div className={`p-5 ${accent ? 'bg-[var(--accent-muted)] border-[var(--accent-color)]/20' : 'bg-[var(--bg-paper)] border-[var(--border-color)]'} rounded-[2rem] border shadow-sm font-lexend space-y-3 ${className}`}>
        {label && <SectionTitle icon={icon} label={label} />}
        {children}
    </div>
);

interface ConfigToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const ConfigToggle: React.FC<ConfigToggleProps> = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
            checked ? 'bg-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
        }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-[var(--bg-paper)] shadow-md transition-transform duration-300 ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

interface ConfigToggleRowProps {
    icon?: React.ReactNode | string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const ConfigToggleRow: React.FC<ConfigToggleRowProps> = ({ icon, label, description, checked, onChange }) => (
    <div className="flex items-center justify-between font-lexend">
        <div>
            <p className="text-[11px] font-black text-[var(--text-primary)] flex items-center gap-1.5">
                {typeof icon === 'string' ? <span>{icon}</span> : icon}
                {label}
            </p>
            {description && <p className="text-[8px] text-[var(--text-muted)] font-medium">{description}</p>}
        </div>
        <ConfigToggle checked={checked} onChange={onChange} />
    </div>
);

interface ConfigOption {
    value: string;
    label: string;
}

interface ConfigSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: ConfigOption[];
    icon?: string;
}

export const ConfigSelect: React.FC<ConfigSelectProps> = ({ label, value, onChange, options, icon }) => (
    <div className="space-y-1 font-lexend">
        {label && (
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block ml-1">
                {icon && <i className={`fa-solid ${icon} mr-1 text-[var(--accent-color)]`} />}
                {label}
            </label>
        )}
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:border-[var(--accent-color)] text-[var(--text-primary)] transition-all"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[var(--bg-paper)] text-[var(--text-primary)]">
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

interface ConfigInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: string;
}

export const ConfigInput: React.FC<ConfigInputProps> = ({ label, value, onChange, placeholder, icon }) => (
    <div className="space-y-1 font-lexend">
        {label && (
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block ml-1">
                {icon && <i className={`fa-solid ${icon} mr-1 text-[var(--accent-color)]`} />}
                {label}
            </label>
        )}
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-colors shadow-inner placeholder:text-[var(--text-muted)]"
        />
    </div>
);

interface ConfigGridButtonProps {
    isActive: boolean;
    onClick: () => void;
    icon?: string;
    label: string;
    description?: string;
}

export const ConfigGridButton: React.FC<ConfigGridButtonProps> = ({ isActive, onClick, icon, label, description }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 font-lexend ${
            isActive
                ? 'bg-[var(--accent-color)] text-[var(--text-primary)] shadow-lg scale-[1.04]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
        }`}
    >
        {icon && <i className={`fa-solid ${icon} text-base`} />}
        <span>{label}</span>
        {description && <span className="text-[8px] opacity-80 normal-case font-normal">{description}</span>}
    </button>
);

interface ConfigCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
}

export const ConfigCheckbox: React.FC<ConfigCheckboxProps> = ({ checked, onChange, label, description }) => (
    <label className="flex items-start gap-3 cursor-pointer group font-lexend">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
        />
        <div
            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                checked
                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
            }`}
        >
            {checked && <i className="fa-solid fa-check text-[var(--text-primary)] text-[9px]" />}
        </div>
        <div>
            <span className="text-[11px] font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">
                {label}
            </span>
            {description && <p className="text-[8px] text-[var(--text-muted)] font-medium">{description}</p>}
        </div>
    </label>
);

interface ConfigRadioCardProps {
    isActive: boolean;
    onClick: () => void;
    icon?: string;
    label: string;
    description?: string;
    gradient?: string;
}

export const ConfigRadioCard: React.FC<ConfigRadioCardProps> = ({ isActive, onClick, icon, label, description, gradient }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 border font-lexend ${
            isActive
                ? 'border-[var(--accent-color)] bg-[var(--accent-muted)] shadow-md'
                : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-muted)]'
        }`}
    >
        {icon && (
            <div className={`w-8 h-8 rounded-lg ${gradient || 'bg-[var(--accent-color)]'} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <i className={`fa-solid ${icon} text-[var(--text-primary)] text-xs`} />
            </div>
        )}
        <div>
            <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]'}`}>
                {label}
            </p>
            {description && <p className="text-[8px] text-[var(--text-muted)] font-medium">{description}</p>}
        </div>
    </button>
);

interface ConfigColorDotProps {
    isActive: boolean;
    onClick: () => void;
    label: string;
    dotColor: string;
}

export const ConfigColorDot: React.FC<ConfigColorDotProps> = ({ isActive, onClick, label, dotColor }) => (
    <button
        type="button"
        onClick={onClick}
        title={label}
        className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl text-[9px] font-black uppercase transition-all duration-200 font-lexend ${
            isActive
                ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] ring-2 ring-[var(--accent-color)]/40 border border-[var(--accent-color)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border-color)]'
        }`}
    >
        <span
            className="w-5 h-5 rounded-full border-2 border-white/30 shadow-md"
            style={{ backgroundColor: dotColor }}
        />
        <span>{label}</span>
    </button>
);
