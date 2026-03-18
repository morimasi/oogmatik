
import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>{opt.label}</button>
            ))}
        </div>
    </div>
);

export const SyllableMasterLabConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 gap-3">
                <CompactToggleGroup 
                    label="Çalışma Modu" 
                    selected={options.variant || 'split'} 
                    onChange={(v: string) => onChange('variant', v)} 
                    options={[
                        { value: 'split', label: 'Ayır' },
                        { value: 'combine', label: 'Birleştir' },
                        { value: 'rainbow', label: 'Gökkuşağı' }
                    ]} 
                />
                <CompactToggleGroup 
                    label="Hece Yoğunluğu" 
                    selected={options.syllableRange || '2-3'} 
                    onChange={(v: string) => onChange('syllableRange', v)} 
                    options={[
                        { value: '1-2', label: 'Kısa' },
                        { value: '2-3', label: 'Orta' },
                        { value: '3-5', label: 'Uzun' }
                    ]} 
                />
            </div>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/30">
                <label className="text-[10px] font-black text-amber-600 uppercase mb-2 block text-center">Öğe Adedi (A4 Yoğunluğu)</label>
                <div className="flex gap-2">
                    {[12, 24, 32, 40].map(n => (
                        <button 
                            key={n} 
                            onClick={() => onChange('itemCount', n)}
                            className={`flex-1 py-2 text-xs font-black rounded-xl border-2 transition-all ${options.itemCount === n ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
