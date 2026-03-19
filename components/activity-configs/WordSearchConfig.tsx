
import React from 'react';
import { GeneratorOptions } from '../../types';

export const WordSearchConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    
    const rows = options.gridRows || options.gridSize || 12;
    const cols = options.gridCols || options.gridSize || 12;

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Konu ve İçerik */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                <label className="text-[10px] font-black text-indigo-600 uppercase mb-3 block text-center tracking-widest">KELİME HAVUZU</label>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        value={options.topic || ''} 
                        onChange={e => onChange('topic', e.target.value)}
                        placeholder="Örn: Meyveler, Okul, Uzay..."
                        className="w-full p-3 bg-white dark:bg-zinc-800 border border-indigo-200 rounded-xl text-sm font-bold outline-none text-center focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onChange('case', 'upper')}
                            className={`flex-1 py-2 text-[10px] font-black rounded-xl border transition-all ${options.case !== 'lower' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-500 border-zinc-200'}`}
                        >
                            BÜYÜK HARF
                        </button>
                        <button 
                            onClick={() => onChange('case', 'lower')}
                            className={`flex-1 py-2 text-[10px] font-black rounded-xl border transition-all ${options.case === 'lower' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-500 border-zinc-200'}`}
                        >
                            küçük harf
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Ayarları */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
                
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Bulmaca Boyutu</label>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase">
                            <span>Satır</span>
                            <span className="text-indigo-600 font-black">{rows}</span>
                        </div>
                        <input 
                            type="range" min={8} max={20} 
                            value={rows} 
                            onChange={e => onChange('gridRows', parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase">
                            <span>Sütun</span>
                            <span className="text-indigo-600 font-black">{cols}</span>
                        </div>
                        <input 
                            type="range" min={8} max={20} 
                            value={cols} 
                            onChange={e => onChange('gridCols', parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Gizlenecek Kelime</label>
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{options.itemCount || 10}</span>
                    </div>
                    <input 
                        type="range" min={5} max={15} 
                        value={options.itemCount || 10} 
                        onChange={e => onChange('itemCount', parseInt(e.target.value))} 
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                    />
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase mb-2 block">Yönlendirme Zorluğu</label>
                    <div className="grid grid-cols-3 gap-1">
                        {['Başlangıç', 'Orta', 'Zor'].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => onChange('difficulty', lvl)}
                                className={`py-1.5 text-[9px] font-bold rounded-lg transition-all ${options.difficulty === lvl ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-500'}`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
