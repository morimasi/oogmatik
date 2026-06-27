
import React from 'react';
import { GeneratorOptions } from '../../types';

export const FindDifferenceConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }) => {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Izgara ve Varyasyon Sistemi */}
            <div className="p-4 bg-zinc-900 text-white rounded-[2rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className="fa-solid fa-border-all text-4xl"></i>
                </div>
                <label className="text-[10px] font-black text-indigo-400 uppercase mb-3 block text-center tracking-widest">Izgara Sistemi</label>
                
                <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-4 gap-2">
                        {[4, 5, 6, 8].map(n => (
                            <button
                                key={n}
                                onClick={() => onChange('gridSize', n)}
                                className={`py-2 text-[10px] font-black rounded-xl border-2 transition-all ${options.gridSize === n || (!options.gridSize && n === 5) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'}`}
                            >
                                {n}x{n}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {[1, 2, 4].map(count => (
                            <button
                                key={count}
                                onClick={() => onChange('puzzleCount', count)}
                                className={`flex-1 py-2 rounded-xl border-2 font-black text-[10px] transition-all ${options.puzzleCount === count || (!options.puzzleCount && count === 1) ? 'bg-rose-600 border-rose-600 text-white shadow-md' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'}`}
                            >
                                {count} Görev
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Uyaran Kategorisi */}
            <div className="p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase block tracking-widest pl-1 text-center">Uyaran Kategorisi (Fark Tipi)</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => onChange('concept', 'visual')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'visual' || !options.concept ? 'bg-zinc-50 border-indigo-500 text-indigo-600 shadow-sm' : 'bg-zinc-50/50 border-zinc-100 text-zinc-400 opacity-60'}`}
                        >
                            <i className="fa-solid fa-shapes text-lg"></i>
                            Görsel / Emoji
                        </button>
                        <button 
                            onClick={() => onChange('concept', 'mirror')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'mirror' ? 'bg-zinc-50 border-indigo-500 text-indigo-600 shadow-sm' : 'bg-zinc-50/50 border-zinc-100 text-zinc-400 opacity-60'}`}
                        >
                            <i className="fa-solid fa-arrows-left-right text-lg"></i>
                            Mirror (b/d, p/q)
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => onChange('concept', 'number')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'number' ? 'bg-zinc-50 border-indigo-500 text-indigo-600 shadow-sm' : 'bg-zinc-50/50 border-zinc-100 text-zinc-400 opacity-60'}`}
                        >
                            Sayısal
                        </button>
                        <button 
                            onClick={() => onChange('concept', 'abstract')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'abstract' ? 'bg-zinc-50 border-indigo-500 text-indigo-600 shadow-sm' : 'bg-zinc-50/50 border-zinc-100 text-zinc-400 opacity-60'}`}
                        >
                            Sembolik
                        </button>
                        <button 
                            onClick={() => onChange('concept', 'word')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'word' ? 'bg-zinc-50 border-indigo-500 text-indigo-600 shadow-sm' : 'bg-zinc-50/50 border-zinc-100 text-zinc-400 opacity-60'}`}
                        >
                            Sözel
                        </button>
                    </div>
                </div>

                <div className="h-px bg-zinc-100 dark:bg-zinc-700 mx-2"></div>

                {/* Akıllı A4 Bilgi */}
                <div className="p-4 bg-indigo-50 rounded-2xl flex items-center gap-4 border border-indigo-100 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                        <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-indigo-950 uppercase leading-none">Smart-A4 Protokolü</p>
                        <p className="text-[7px] font-bold text-indigo-600 uppercase mt-1 leading-tight italic">
                            Seçilen görev sayısına göre hücre boyutları ve sayfa yerleşimi otomatik milimetrik hesaplanacaktır.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
