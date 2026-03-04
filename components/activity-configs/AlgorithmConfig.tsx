
import React from 'react';
import { GeneratorOptions } from '../../types';

export const AlgorithmConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-5 bg-zinc-900 text-white rounded-[2.5rem] border border-white/10 shadow-2xl">
                <label className="text-[10px] font-black text-indigo-400 uppercase mb-3 block tracking-[0.2em]">Sistem Senaryosu</label>
                <input 
                    type="text" 
                    value={options.topic || ''} 
                    onChange={e => onChange('topic', e.target.value)}
                    placeholder="Örn: Kek Yapımı, Robot Kontrol..."
                    className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-sm font-bold text-white outline-none focus:border-indigo-500 shadow-inner"
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block">Mantıksal Derinlik</label>
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                        {['Lineer', 'Karar Destekli', 'Karmaşık'].map(l => (
                            <button 
                                key={l}
                                onClick={() => onChange('difficulty', l === 'Lineer' ? 'Başlangıç' : l === 'Karar Destekli' ? 'Orta' : 'Zor')}
                                className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${
                                    (options.difficulty === 'Başlangıç' && l === 'Lineer') || 
                                    (options.difficulty === 'Orta' && l === 'Karar Destekli') ||
                                    (options.difficulty === 'Zor' && l === 'Karmaşık')
                                    ? 'bg-white dark:bg-zinc-700 shadow text-indigo-600' : 'text-zinc-400'
                                }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
