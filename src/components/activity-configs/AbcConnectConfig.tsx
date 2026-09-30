
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
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block tracking-wider">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
            {options.map((opt: ToggleOption, idx: number) => (
                <button
                    key={idx}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-md text-cyan-600 dark:text-cyan-200' : 'text-[var(--text-muted)] hover:text-[var(--text-muted)] dark:hover:text-[var(--text-secondary)]'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export const AbcConnectConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }) => {
    const o = (options as any).abcConnect || {};
    
    const update = (key: keyof GeneratorOptions, val: unknown) => {
        // Hem nested objeyi hem de top-level options'ı güncelle ki jeneratörler her iki yerden de okuyabilsin
        onChange('abcConnect' as any, { ...o, [key]: val });
        onChange(key, val);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-5 bg-cyan-50/30 dark:bg-cyan-900/10 rounded-[2.5rem] border border-cyan-100 dark:border-cyan-800/30 shadow-sm">
                <CompactToggleGroup
                    label="EŞLEŞTİRME TÜRÜ (VARYANT)"
                    selected={options.variant || o.variant || 'roman'}
                    onChange={(v: unknown) => update('variant', v as string)}
                    options={[
                        { value: 'roman', label: 'Romen' },
                        { value: 'case', label: 'Harf' },
                        { value: 'dots', label: 'Nokta' },
                        { value: 'math', label: 'İşlem' }
                    ]}
                />
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-5 shadow-inner">
                <CompactToggleGroup
                    label="IZGARA BOYUTU"
                    selected={options.gridSize || o.gridSize || 5}
                    onChange={(v: unknown) => update('gridSize', v as number)}
                    options={[
                        { value: 4, label: '4x4' },
                        { value: 5, label: '5x5' },
                        { value: 6, label: '6x6' },
                        { value: 8, label: '8x8' }
                    ]}
                />

                <CompactToggleGroup
                    label="YOL KARMAŞIKLIĞI"
                    selected={options.density || o.density || 'medium'}
                    onChange={(v: unknown) => update('density', v as string)}
                    options={[
                        { value: 'low', label: 'Seyrek' },
                        { value: 'medium', label: 'Normal' },
                        { value: 'high', label: 'Yoğun' }
                    ]}
                />
            </div>

            <div className="px-4 text-center">
                <p className="text-[10px] text-[var(--text-muted)] italic leading-relaxed">
                    "İşlem" modunda öğrenci toplama yaparak eşleştirme yapar.
                </p>
            </div>
        </div>
    );
};
