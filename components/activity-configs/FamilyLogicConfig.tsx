
import React from 'react';
import { GeneratorOptions } from '../../types';

export const FamilyLogicConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-[2rem] border border-rose-100 dark:border-rose-800/30">
                <label className="text-[10px] font-black text-rose-600 uppercase mb-3 block text-center">İlişki Derinliği</label>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        {v: 'basic', l: '1. Derece (Anne-Baba-Kardeş)'},
                        {v: 'extended', l: '2. Derece (Hala-Amca-Kuzen)'},
                        {v: 'complex', l: 'Tam Soy Ağacı Mantığı'}
                    ].map(t => (
                        <button 
                            key={t.v}
                            onClick={() => onChange('variant', t.v)}
                            className={`w-full py-2.5 rounded-xl text-xs font-black border transition-all ${options.variant === t.v ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}
                        >
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block">Soru Sayısı</label>
                    <input type="range" min={4} max={12} value={options.itemCount || 8} onChange={e => onChange('itemCount', parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none accent-rose-500" />
                    <div className="flex justify-between text-[9px] text-zinc-400 font-bold mt-1"><span>Az</span><span>Yoğun</span></div>
                </div>
            </div>
        </div>
    );
};
