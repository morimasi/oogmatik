
import React from 'react';
import { GeneratorOptions } from '../../types';

export const ShapeCountingConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/30">
                <label className="text-[10px] font-black text-amber-600 uppercase mb-3 block text-center">Şekil Geometrisi</label>
                <div className="flex gap-2">
                    <button onClick={() => onChange('visualType', 'triangle')} className={`flex-1 py-2 rounded-xl border-2 font-black text-xs ${options.visualType !== 'square' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-zinc-200 bg-white text-zinc-400'}`}>
                        <i className="fa-solid fa-play fa-rotate-270 mr-2"></i> Üçgen Piramit
                    </button>
                    <button disabled className={`flex-1 py-2 rounded-xl border-2 font-black text-xs border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed`}>
                        <i className="fa-regular fa-square mr-2"></i> Kare (Yakında)
                    </button>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Karmaşıklık Seviyesi</label>
                        <span className="text-[10px] font-black text-amber-600">{options.difficulty || 'Orta'}</span>
                    </div>
                    <input 
                        type="range" min="1" max="3" 
                        value={options.difficulty === 'Başlangıç' ? 1 : options.difficulty === 'Orta' ? 2 : 3} 
                        onChange={e => {
                            const val = parseInt(e.target.value);
                            onChange('difficulty', val === 1 ? 'Başlangıç' : val === 2 ? 'Orta' : 'Zor');
                        }}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none accent-amber-500" 
                    />
                    <div className="flex justify-between text-[9px] text-zinc-400 font-medium">
                        <span>Basit</span>
                        <span>Katmanlı</span>
                        <span>Karmaşık</span>
                    </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-600">Sayfa Başı Soru</span>
                    <div className="flex gap-2">
                        {[2, 4, 6].map(n => (
                            <button key={n} onClick={() => onChange('itemCount', n)} className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${options.itemCount === n ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
