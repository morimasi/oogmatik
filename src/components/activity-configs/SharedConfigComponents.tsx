import React from 'react';

/**
 * OOGMATIK - Shared Config Components
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

export const CompactToggleGroup = ({ label, selected, onChange, options }: CompactToggleGroupProps) => (
    <div className="space-y-1 font-lexend">
        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block ml-1">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)] shadow-inner">
            {options.map((opt: ToggleOption) => (
                <button
                    key={opt.value}
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

export const CompactCounter = ({ label, value, onChange, min, max, icon }: CompactCounterProps) => (
    <div className="space-y-1 font-lexend">
        {label && <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block ml-1">{icon && <i className={`fa-solid ${icon} mr-1`}></i>}{label}</label>}
        <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-1 shadow-inner">
            <button
                onClick={() => onChange(Math.max(min, value - 1))}
                className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"
                disabled={value <= min}
            >
                <i className="fa-solid fa-minus text-[10px]"></i>
            </button>
            <span className="flex-1 text-center text-xs font-black text-[var(--text-primary)]">{value}</span>
            <button
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

export const CompactSlider = ({ label, value, onChange, min, max, unit = '' }: CompactSliderProps) => (
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)] border border-[var(--border-color)]"
        />
    </div>
);

