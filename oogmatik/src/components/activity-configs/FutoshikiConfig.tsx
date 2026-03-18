
import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block tracking-wider">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-md text-indigo-600 dark:text-indigo-200' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export const FutoshikiConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: any, v: any) => void }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-5 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
                <CompactToggleGroup
                    label="Izgara Boyutu (Zorluk Etkisi)"
                    selected={options.gridSize || 4}
                    onChange={(v: number) => onChange('gridSize', v)}
                    options={[
                        { value: 4, label: '4x4' },
                        { value: 5, label: '5x5' },
                        { value: 6, label: '6x6' },
                        { value: 7, label: '7x7' }
                    ]}
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
                <CompactToggleGroup
                    label="İşaret Yoğunluğu"
                    selected={options.density || 'medium'}
                    onChange={(v: string) => onChange('density', v)}
                    options={[
                        { value: 'low', label: 'Az' },
                        { value: 'medium', label: 'Orta' },
                        { value: 'high', label: 'Çok' }
                    ]}
                />

                <CompactToggleGroup
                    label="Başlangıç İpuçları"
                    selected={options.hintLevel || 'medium'}
                    onChange={(v: string) => onChange('hintLevel', v)}
                    options={[
                        { value: 'low', label: 'Minimum' },
                        { value: 'medium', label: 'Standart' },
                        { value: 'high', label: 'Kolaylaştırıcı' }
                    ]}
                />
            </div>

            <div className="px-4">
                <p className="text-[10px] text-zinc-400 italic leading-relaxed text-center">
                    Futoşhiki'de ultra profesyonel modda, 7x7 boyutunda mantıksal kısıtlar maksimum seviyeye çıkarılır.
                </p>
            </div>
        </div>
    );
};
