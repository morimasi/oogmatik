
import React from 'react';
import { GeneratorOptions } from '../../types';

export const DirectionalTrackingConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    
    // Varsayılan değerleri kontrol et
    const currentRows = options.gridRows || options.gridSize || 5;
    const currentCols = options.gridCols || options.gridSize || 5;

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                <label className="text-[10px] font-black text-indigo-600 uppercase mb-4 block text-center tracking-widest">Matris Yapısı</label>
                
                <div className="grid grid-cols-2 gap-4">
                    {/* Satır Sayısı */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                            <span>Satır</span>
                            <span className="text-indigo-600 font-black bg-white dark:bg-zinc-800 px-2 py-0.5 rounded shadow-sm border">{currentRows}</span>
                        </div>
                        <input 
                            type="range" min={4} max={10} 
                            value={currentRows} 
                            onChange={e => onChange('gridRows', parseInt(e.target.value))} 
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                    </div>

                    {/* Sütun Sayısı */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                            <span>Sütun</span>
                            <span className="text-indigo-600 font-black bg-white dark:bg-zinc-800 px-2 py-0.5 rounded shadow-sm border">{currentCols}</span>
                        </div>
                        <input 
                            type="range" min={4} max={10} 
                            value={currentCols} 
                            onChange={e => onChange('gridCols', parseInt(e.target.value))} 
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-center">
                    <div className="flex items-center gap-2 text-[9px] text-zinc-400 font-medium bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        <i className="fa-solid fa-vector-square"></i>
                        <span>{currentRows} x {currentCols} Hücre</span>
                    </div>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block">Kelime Teması</label>
                    <input 
                        type="text" 
                        value={options.topic || ''}
                        onChange={e => onChange('topic', e.target.value)}
                        placeholder="Örn: Meyveler, Okul..."
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm focus:border-indigo-500 outline-none font-bold"
                    />
                </div>
                
                <div className="flex items-center justify-between p-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Soru Adedi</span>
                    <div className="flex gap-2">
                        {[4, 6, 8].map(n => (
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
