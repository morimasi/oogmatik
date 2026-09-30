
import React from 'react';
import { GeneratorOptions } from '../../types';

export const FindDifferenceConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }) => {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Izgara ve Varyasyon Sistemi */}
            <div className="p-4 bg-[var(--bg-inset)] text-[var(--text-primary)] rounded-[2rem] border border-[var(--border-color)] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className="fa-solid fa-border-all text-4xl"></i>
                </div>
                <label className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-3 block text-center tracking-widest">Izgara Sistemi</label>
                
                <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-4 gap-2">
                        {[4, 5, 6, 8].map(n => (
                            <button
                                key={n}
                                onClick={() => onChange('gridSize', n)}
                                className={`py-2 text-[10px] font-black rounded-xl border-2 transition-all ${options.gridSize === n || (!options.gridSize && n === 5) ? 'bg-[var(--accent-color)] border-indigo-600 text-[var(--text-primary)] shadow-lg' : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--border-color)]'}`}
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
                                className={`flex-1 py-2 rounded-xl border-2 font-black text-[10px] transition-all ${options.puzzleCount === count || (!options.puzzleCount && count === 1) ? 'bg-rose-600 border-rose-600 text-[var(--text-primary)] shadow-md' : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--border-color)]'}`}
                            >
                                {count} Görev
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Uyaran Kategorisi */}
            <div className="p-5 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] border-[var(--border-color)] space-y-5">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase block tracking-widest pl-1 text-center">Uyaran Kategorisi (Fark Tipi)</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => onChange('concept', 'visual')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'visual' || !options.concept ? 'bg-[var(--bg-secondary)] border-[var(--accent-color)] text-[var(--accent-color)] shadow-sm' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)] text-[var(--text-muted)] opacity-60'}`}
                        >
                            <i className="fa-solid fa-shapes text-lg"></i>
                            Görsel / Emoji
                        </button>
                        <button 
                            onClick={() => onChange('concept', 'mirror')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'mirror' ? 'bg-[var(--bg-secondary)] border-[var(--accent-color)] text-[var(--accent-color)] shadow-sm' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)] text-[var(--text-muted)] opacity-60'}`}
                        >
                            <i className="fa-solid fa-arrows-left-right text-lg"></i>
                            Mirror (b/d, p/q)
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => onChange('concept', 'number')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'number' ? 'bg-[var(--bg-secondary)] border-[var(--accent-color)] text-[var(--accent-color)] shadow-sm' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)] text-[var(--text-muted)] opacity-60'}`}
                        >
                            Sayısal
                        </button>
                        <button 
                            onClick={() => onChange('concept', 'abstract')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'abstract' ? 'bg-[var(--bg-secondary)] border-[var(--accent-color)] text-[var(--accent-color)] shadow-sm' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)] text-[var(--text-muted)] opacity-60'}`}
                        >
                            Sembolik
                        </button>
                        <button 
                            onClick={() => onChange('concept', 'word')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'word' ? 'bg-[var(--bg-secondary)] border-[var(--accent-color)] text-[var(--accent-color)] shadow-sm' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)] text-[var(--text-muted)] opacity-60'}`}
                        >
                            Sözel
                        </button>
                    </div>
                </div>

                <div className="h-px bg-zinc-100 bg-[var(--bg-secondary)] mx-2"></div>

                {/* Akıllı A4 Bilgi */}
                <div className="p-4 bg-[var(--accent-muted)] rounded-2xl flex items-center gap-4 border border-[var(--border-color)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-color)]"></div>
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-color)] text-[var(--text-primary)] flex items-center justify-center flex-shrink-0 shadow-lg">
                        <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-[var(--accent-color)] uppercase leading-none">Smart-A4 Protokolü</p>
                        <p className="text-[7px] font-bold text-[var(--accent-color)] uppercase mt-1 leading-tight italic">
                            Seçilen görev sayısına göre hücre boyutları ve sayfa yerleşimi otomatik milimetrik hesaplanacaktır.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
