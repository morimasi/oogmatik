
import React from 'react';
import { GeneratorOptions } from '../../types';

export const FindDifferenceConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-[2rem] border border-rose-100 dark:border-rose-800/30">
                <label className="text-[10px] font-black text-rose-600 uppercase mb-3 block text-center">Fark Türü</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        {v: 'linguistic', l: 'Harf (b-d)'},
                        {v: 'numeric', l: 'Sayı (6-9)'},
                        {v: 'semantic', l: 'Kelime'},
                        {v: 'shape', l: 'Şekil'}
                    ].map(t => (
                        <button 
                            key={t.v}
                            onClick={() => onChange('findDiffType', t.v)}
                            className={`py-2 rounded-xl text-[10px] font-black border transition-all ${options.findDiffType === t.v ? 'bg-rose-600 text-white border-rose-600' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200'}`}
                        >
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block">Çeldirici Zorluğu</label>
                <div className="flex bg-zinc-200 dark:bg-zinc-700 rounded-lg p-1">
                    {['low', 'medium', 'high', 'extreme'].map(l => (
                        <button
                            key={l}
                            onClick={() => onChange('distractionLevel', l)}
                            className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${options.distractionLevel === l ? 'bg-white text-rose-600 shadow-sm' : 'text-zinc-500'}`}
                        >
                            {l === 'extreme' ? 'Max' : l}
                        </button>
                    ))}
                </div>
                
                <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Satır Başına Öğe</span>
                    <div className="flex gap-2">
                        {[4, 5, 6, 8].map(n => (
                            <button 
                                key={n}
                                onClick={() => onChange('gridSize', n)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border ${options.gridSize === n ? 'bg-rose-600 text-white border-rose-600' : 'bg-white border-zinc-200 text-zinc-400'}`}
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
