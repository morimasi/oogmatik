
import React from 'react';
import { GeneratorOptions } from '../../types';

export const MorphologyConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                <label className="text-[10px] font-black text-indigo-600 uppercase mb-3 block text-center tracking-widest">Yapısal Derinlik</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        {v: 'Başlangıç', l: 'Bileşik Kelimeler (Hanımeli)'},
                        {v: 'Orta', l: 'Çekim Ekleri (-lar, -den)'},
                        {v: 'Zor', l: 'Yapım Ekleri (-lik, -ci)'},
                        {v: 'Uzman', l: 'Ses Olayları (Dönüşümler)'}
                    ].map(t => (
                        <button 
                            key={t.v}
                            onClick={() => onChange('difficulty', t.v)}
                            className={`py-2 px-1 rounded-xl text-[9px] font-black border transition-all ${options.difficulty === t.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}
                        >
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase mb-2">
                    <span>Satır Sayısı</span>
                    <span className="text-indigo-600 font-black">{options.itemCount || 10}</span>
                </div>
                <input 
                    type="range" min={6} max={14} 
                    value={options.itemCount || 10} 
                    onChange={e => onChange('itemCount', parseInt(e.target.value))} 
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none accent-indigo-600" 
                />
            </div>
        </div>
    );
};
