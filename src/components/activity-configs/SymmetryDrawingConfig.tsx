
import React from 'react';
import { GeneratorOptions } from '../../types';

export const SymmetryDrawingConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Matris ve Varyasyon Kontrolü */}
            <div className="p-4 bg-zinc-900 text-white rounded-[2rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className="fa-solid fa-mirror text-4xl"></i>
                </div>
                <label className="text-[10px] font-black text-rose-400 uppercase mb-3 block text-center tracking-widest">Matris ve Varyasyon</label>
                
                <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-4 gap-2">
                        {[6, 8, 10, 12].map(n => (
                            <button
                                key={n}
                                onClick={() => onChange('gridSize', n)}
                                className={`py-2 text-[10px] font-black rounded-xl border-2 transition-all ${options.gridSize === n ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'}`}
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
                                className={`flex-1 py-2 rounded-xl border-2 font-black text-[10px] transition-all ${options.puzzleCount === count ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                            >
                                {count} {count === 1 ? 'Görev' : 'Görev'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Simetri Ekseni Ayarları */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase block tracking-widest pl-1">Simetri Ekseni (Yön)</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => onChange('concept', 'mirror_v')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'mirror_v' || !options.concept ? 'bg-white border-rose-500 text-rose-600 shadow-sm' : 'bg-white/50 border-zinc-100 text-zinc-400 opacity-60'}`}
                        >
                            <div className="w-1 h-6 bg-current rounded-full"></div>
                            Dikey
                        </button>
                        <button 
                            onClick={() => onChange('concept', 'mirror_h')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'mirror_h' ? 'bg-white border-rose-500 text-rose-600 shadow-sm' : 'bg-white/50 border-zinc-100 text-zinc-400 opacity-60'}`}
                        >
                            <div className="w-6 h-1 bg-current rounded-full"></div>
                            Yatay
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => onChange('concept', 'diagonal')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'diagonal' ? 'bg-white border-rose-500 text-rose-600 shadow-sm' : 'bg-white/50 border-zinc-100 text-zinc-400 opacity-60'}`}
                        >
                            <div className="w-6 h-6 border-b-4 border-r-4 border-current rounded-bl-sm rotate-45 scale-50"></div>
                            Diyagonal
                        </button>
                        <button 
                            onClick={() => onChange('concept', 'both')}
                            className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${options.concept === 'both' ? 'bg-white border-rose-500 text-rose-600 shadow-sm' : 'bg-white/50 border-zinc-100 text-zinc-400 opacity-60'}`}
                        >
                            <div className="relative w-6 h-6 flex items-center justify-center">
                                <div className="absolute w-1 h-full bg-current rounded-full"></div>
                                <div className="absolute w-full h-1 bg-current rounded-full"></div>
                            </div>
                            Karma (Artı)
                        </button>
                    </div>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-700 mx-2"></div>

                <div className="flex items-center justify-between px-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Bilişsel İskele</span>
                        <span className="text-[8px] font-bold text-zinc-400 mt-1 uppercase">Hayalet Noktaları Göster</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={(options as any).showGhostPoints === true}
                            onChange={e => onChange('showGhostPoints', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-rose-600"></div>
                    </label>
                </div>
            </div>

            {/* Professional Info */}
            <div className="p-4 bg-rose-950 text-white rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30 flex-shrink-0">
                    <i className="fa-solid fa-dna text-rose-400 text-sm"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Visuo-Spatial v2</p>
                  <p className="text-[7px] font-bold text-rose-300 uppercase opacity-60 mt-1 leading-tight">Mekansal bütünleme ve ayna nöron aktivasyonu odaklı klinik motor planlama.</p>
                </div>
            </div>
        </div>
    );
};
