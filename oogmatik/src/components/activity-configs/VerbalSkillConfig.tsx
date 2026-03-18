
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

export const VerbalSkillConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30">
                <CompactToggleGroup 
                    label="Çalışma Türü" 
                    selected={options.variant || 'mixed'} 
                    onChange={(v: string) => onChange('variant', v)} 
                    options={[
                        { value: 'synonym', label: 'Eş Anlam' },
                        { value: 'antonym', label: 'Zıt Anlam' },
                        { value: 'mixed', label: 'Karışık' }
                    ]} 
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block">Öğe Sayısı</label>
                    <div className="flex gap-2">
                        {[6, 12, 18].map(n => (
                            <button 
                                key={n} 
                                onClick={() => onChange('itemCount', n)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg border ${options.itemCount === n ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-900'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
