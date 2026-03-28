import React from 'react';
import { GeneratorOptions } from '../../types';

interface ToggleOption {
    value: any;
    label: string;
}

interface ToggleGroupProps {
    label: string;
    selected: any;
    onChange: (val: any) => void;
    options: ToggleOption[];
}

const CompactToggleGroup = ({ label, selected, onChange, options }: ToggleGroupProps) => (
    <div className="space-y-1 mt-4">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-sky-600 dark:text-sky-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

interface _ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: any) => void;
}

export const PatternCompletionConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: any) => void }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-sky-50/50 dark:bg-sky-900/10 rounded-[2rem] border border-sky-100 dark:border-sky-800/30">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-black text-sky-800 uppercase tracking-widest"><i className="fa-solid fa-puzzle-piece mr-1"></i> Desen Ayarları</h4>
                </div>

                <CompactToggleGroup
                    label="Matris (Izgara) Boyutu"
                    selected={options.gridSize || 3}
                    onChange={(v: number) => onChange('gridSize', v)}
                    options={[
                        { value: 2, label: '2x2 (Kolay)' },
                        { value: 3, label: '3x3 (Orta)' },
                        { value: 4, label: '4x4 (Zor)' }
                    ]}
                />

                <CompactToggleGroup
                    label="Desen Formatı"
                    selected={options.patternType || 'geometric'}
                    onChange={(v: string) => onChange('patternType', v)}
                    options={[
                        { value: 'geometric', label: 'Geometrik Şekiller' },
                        { value: 'color_blocks', label: 'Renk/Piksel Blokları' },
                        { value: 'logic_sequence', label: 'Dizisel Mantık' }
                    ]}
                />

            </div>
        </div>
    );
};
