
import React from 'react';
import { GeneratorOptions } from '../../types';

interface ToggleOption {
    value: unknown;
    label: string;
}

interface ToggleGroupProps {
    label: string;
    selected: unknown;
    onChange: (val: unknown) => void;
    options: ToggleOption[];
}

const CompactToggleGroup = ({ label, selected, onChange, options }: ToggleGroupProps) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
            {options.map((opt: ToggleOption, idx: number) => (
                <button key={idx} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-secondary)]'}`}>{opt.label}</button>
            ))}
        </div>
    </div>
);

export const HiddenPasswordConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] dark:border-[var(--accent-color)]">
                <CompactToggleGroup
                    label="Harf Karakteri"
                    selected={options.case || 'upper'}
                    onChange={(v: unknown) => onChange('case', v as string)}
                    options={[{ value: 'upper', label: 'BÜYÜK' }, { value: 'lower', label: 'küçük' }]}
                />
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-4 shadow-inner">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Izgara Boyutu</label>
                        <select value={options.gridSize || 5} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('gridSize', Number(e.target.value))} className="w-full p-2 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs font-bold">
                            {[4, 5, 6, 8].map((n: number) => <option key={n} value={n}>{n}x{n}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Blok Sayısı</label>
                        <input type="number" min={1} max={12} value={options.itemCount || 9} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('itemCount', Number(e.target.value))} className="w-full p-2 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs font-bold" />
                    </div>
                </div>

                <CompactToggleGroup
                    label="Hücre Stili"
                    selected={options.variant || 'square'}
                    onChange={(v: unknown) => onChange('variant', v as string)}
                    options={[
                        { value: 'square', label: 'Kare' },
                        { value: 'rounded', label: 'Oval' },
                        { value: 'minimal', label: 'Sade' }
                    ]}
                />
            </div>
        </div>
    );
};
