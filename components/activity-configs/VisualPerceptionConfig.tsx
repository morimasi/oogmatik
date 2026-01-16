
import React from 'react';
import { GeneratorOptions } from '../../types';

export const VisualPerceptionConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-[2rem] border border-violet-100 dark:border-violet-800/30">
                <label className="text-[10px] font-black text-violet-600 uppercase mb-3 block text-center">Analiz Tipi</label>
                <select 
                    value={options.visualType || 'geometric'} 
                    onChange={e => onChange('visualType', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-violet-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                >
                    <option value="geometric">Geometrik Şekiller</option>
                    <option value="abstract">Soyut Desenler</option>
                    <option value="character">Harf ve Rakamlar</option>
                </select>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase">
                        <span>Çeldirici Seviyesi</span>
                        <span className="text-violet-600">{options.distractionLevel?.toUpperCase() || 'MEDIUM'}</span>
                    </div>
                    <div className="flex gap-1">
                        {['low', 'medium', 'high', 'extreme'].map(level => (
                            <button 
                                key={level}
                                onClick={() => onChange('distractionLevel', level)}
                                className={`flex-1 h-2 rounded-full transition-all ${options.distractionLevel === level ? 'bg-violet-600 scale-y-125' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center py-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Izgara Yoğunluğu</span>
                    <div className="flex items-center gap-2">
                        {[4, 6, 8].map(n => (
                            <button 
                                key={n}
                                onClick={() => onChange('gridSize', n)}
                                className={`w-8 h-8 rounded-lg text-xs font-black border transition-all ${options.gridSize === n ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}
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
