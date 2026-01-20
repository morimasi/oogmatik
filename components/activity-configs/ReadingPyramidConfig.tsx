
import React from 'react';
import { GeneratorOptions } from '../../types';

export const ReadingPyramidConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                <label className="text-[10px] font-black text-indigo-600 uppercase mb-3 block text-center tracking-widest">Piramit Yüksekliği</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        {v: 3, l: 'Kısa (3 Basamak)'},
                        {v: 5, l: 'Orta (5 Basamak)'},
                        {v: 7, l: 'Uzun (7 Basamak)'},
                        {v: 9, l: 'Dev (9 Basamak)'}
                    ].map(t => (
                        <button 
                            key={t.v}
                            onClick={() => onChange('pyramidHeight', t.v)}
                            className={`py-2 px-1 rounded-xl text-[9px] font-black border transition-all ${options.pyramidHeight === t.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}
                        >
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block">Konu</label>
                    <input 
                        type="text" 
                        value={options.topic || ''}
                        onChange={e => onChange('topic', e.target.value)}
                        placeholder="Örn: Uzay, Deniz, Orman"
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm focus:border-indigo-500 outline-none font-bold"
                    />
                </div>
            </div>
        </div>
    );
};
