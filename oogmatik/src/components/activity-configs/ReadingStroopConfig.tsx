
import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[9px] font-black rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700'}`}>{opt.label}</button>
            ))}
        </div>
    </div>
);

export const ReadingStroopConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-[2rem] border border-rose-100 dark:border-rose-800/30">
                <CompactToggleGroup 
                    label="Kelime Havuzu" 
                    selected={options.variant || 'colors'} 
                    onChange={(v: string) => onChange('variant', v)} 
                    options={[
                        { value: 'colors', label: 'RENK' },
                        { value: 'semantic', label: 'DOĞA' },
                        { value: 'mirror_chars', label: 'AYNA' },
                        { value: 'verbs', label: 'FİİL' }
                    ]} 
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                    <span>Sütun Sayısı</span>
                    <span className="text-indigo-600 font-black">{options.gridSize || 4}x</span>
                </div>
                <input type="range" min={3} max={6} value={options.gridSize || 4} onChange={e => onChange('gridSize', parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none accent-indigo-600" />
                
                <CompactToggleGroup 
                    label="Sayfa Yoğunluğu" 
                    selected={options.itemCount === 48 ? 'high' : 'standard'} 
                    onChange={(v: string) => onChange('itemCount', v === 'high' ? 48 : 24)} 
                    options={[
                        { value: 'standard', label: 'Seyrek' },
                        { value: 'high', label: 'Yoğun (A4)' }
                    ]} 
                />
            </div>
        </div>
    );
};
