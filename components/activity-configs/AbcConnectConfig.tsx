
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
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block tracking-wider">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-md text-cyan-600 dark:text-cyan-200' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export const AbcConnectConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: any) => void }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-5 bg-cyan-50/30 dark:bg-cyan-900/10 rounded-[2.5rem] border border-cyan-100 dark:border-cyan-800/30 shadow-sm">
                <CompactToggleGroup
                    label="Eşleştirme Türü (Varyant)"
                    selected={options.variant || 'roman'}
                    onChange={(v: string) => onChange('variant', v)}
                    options={[
                        { value: 'roman', label: 'Romen' },
                        { value: 'case', label: 'Harf' },
                        { value: 'dots', label: 'Nokta' },
                        { value: 'math', label: 'İşlem' }
                    ]}
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
                <CompactToggleGroup
                    label="Izgara Boyutu"
                    selected={options.gridSize || 5}
                    onChange={(v: number) => onChange('gridSize', v)}
                    options={[
                        { value: 4, label: '4x4' },
                        { value: 5, label: '5x5' },
                        { value: 6, label: '6x6' },
                        { value: 8, label: '8x8' }
                    ]}
                />

                <CompactToggleGroup
                    label="Yol Karmaşıklığı"
                    selected={options.density || 'medium'}
                    onChange={(v: string) => onChange('density', v)}
                    options={[
                        { value: 'low', label: 'Seyrek' },
                        { value: 'medium', label: 'Normal' },
                        { value: 'high', label: 'Yoğun' }
                    ]}
                />
            </div>

            <div className="px-4 text-center">
                <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                    "İşlem" modunda öğrenci toplama yaparak eşleştirme yapar.
                </p>
            </div>
        </div>
    );
};
