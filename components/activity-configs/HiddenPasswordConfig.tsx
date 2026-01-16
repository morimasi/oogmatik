
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

export const HiddenPasswordConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                <CompactToggleGroup 
                    label="Harf Karakteri" 
                    selected={options.case || 'upper'} 
                    onChange={(v: string) => onChange('case', v)} 
                    options={[{ value: 'upper', label: 'BÜYÜK' }, { value: 'lower', label: 'küçük' }]} 
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4 shadow-inner">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Izgara Boyutu</label>
                        <select value={options.gridSize || 5} onChange={e => onChange('gridSize', Number(e.target.value))} className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold">
                            {[4, 5, 6, 8].map(n => <option key={n} value={n}>{n}x{n}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Blok Sayısı</label>
                        <input type="number" min={1} max={12} value={options.itemCount || 9} onChange={e => onChange('itemCount', Number(e.target.value))} className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold" />
                    </div>
                </div>
                
                <CompactToggleGroup 
                    label="Hücre Stili" 
                    selected={options.variant || 'square'} 
                    onChange={(v: string) => onChange('variant', v)} 
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
