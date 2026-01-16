
import React from 'react';
import { GeneratorOptions } from '../../types';

export const DrawingSkillConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-zinc-900 text-white rounded-[2rem] border border-zinc-800 shadow-2xl">
                <label className="text-[10px] font-black text-indigo-400 uppercase mb-3 block text-center tracking-widest">Matris Yapısı</label>
                <div className="flex gap-2">
                    {[6, 8, 10, 12].map(n => (
                        <button 
                            key={n} 
                            onClick={() => onChange('gridSize', n)}
                            className={`flex-1 py-3 text-xs font-black rounded-xl border-2 transition-all ${options.gridSize === n ? 'bg-indigo-600 border-indigo-600 text-white scale-110' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                        >
                            {n}x{n}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Koordinat Sistemi</span>
                    <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${options.showCoordinates !== false ? 'bg-indigo-600' : 'bg-zinc-300'}`} onClick={() => onChange('showCoordinates', options.showCoordinates === false)}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${options.showCoordinates !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block">Transformasyon</label>
                    <select 
                        value={options.concept || 'copy'} 
                        onChange={e => onChange('concept', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold"
                    >
                        <option value="copy">Birebir Kopyalama</option>
                        <option value="mirror_v">Dikey Simetri (Ayna)</option>
                        <option value="mirror_h">Yatay Simetri</option>
                        <option value="rotate_90">90 Derece Döndürme</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
