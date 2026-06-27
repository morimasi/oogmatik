import React from 'react';
import { GeneratorOptions } from '../../types';

export const DrawingSkillConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Izgara Boyutu (Kare Sayısı) */}
            <div className="p-4 bg-zinc-900 text-white rounded-[2rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className="fa-solid fa-border-all text-4xl"></i>
                </div>
                <label className="text-[10px] font-black text-indigo-400 uppercase mb-3 block text-center tracking-widest">Izgara Boyutu (Kare Sayısı)</label>
                <div className="grid grid-cols-4 gap-2 relative z-10">
                    {[6, 8, 10, 12].map(n => (
                        <button
                            key={n}
                            onClick={() => onChange('gridSize', n)}
                            className={`py-3 text-[10px] font-black rounded-xl border-2 transition-all ${options.gridSize === n ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'}`}
                        >
                            {n}x{n}
                        </button>
                    ))}
                </div>
                <p className="text-[8px] text-zinc-500 mt-2 text-center uppercase font-bold tracking-tighter">İnce motor becerisi ve uzamsal algı zorluğunu belirler.</p>
            </div>

            {/* Varyasyon Sayısı (Sayfa Düzeni) */}
            <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-[2rem] border border-violet-100 dark:border-violet-800/30">
                <label className="text-[10px] font-black text-violet-600 uppercase mb-3 block text-center tracking-widest">Etkinlik Varyasyon Sayısı</label>
                <div className="flex gap-2">
                    {[1, 2, 4].map(count => (
                        <button
                            key={count}
                            onClick={() => onChange('puzzleCount', count)}
                            className={`flex-1 py-2.5 rounded-xl border-2 font-black text-xs transition-all ${options.puzzleCount === count ? 'bg-violet-600 border-violet-600 text-white shadow-md' : 'bg-white dark:bg-zinc-800 border-zinc-100 text-zinc-400'}`}
                        >
                            {count} {count === 1 ? 'Görev' : 'Görev'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Diğer Ayarlar */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5">
                <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Koordinat Sistemi</span>
                        <span className="text-[8px] font-bold text-zinc-400 mt-1 uppercase">A-B-C / 1-2-3 Rehberi</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={options.showCoordinates !== false}
                            onChange={e => onChange('showCoordinates', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase block tracking-widest pl-1">Transformasyon Modu</label>
                    <div className="grid grid-cols-1 gap-2">
                        <select
                            value={options.concept || 'copy'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('concept', e.target.value)}
                            className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="copy">Birebir Kopyalama</option>
                            <option value="mirror_v">Dikey Simetri (Ayna Efekti)</option>
                            <option value="mirror_h">Yatay Simetri</option>
                            <option value="rotate_90">90° Saat Yönünde Döndürme</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* V2 Professional Badge */}
            <div className="p-4 bg-indigo-950 text-white rounded-2xl flex items-center justify-between group overflow-hidden relative">
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <i className="fa-solid fa-microchip text-indigo-400 text-xs translate-y-[-1px]"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-tight leading-none">Motor-Precision v2</p>
                        <p className="text-[7px] font-bold text-indigo-300 uppercase opacity-70 mt-1">Görsel-Motor Entegrasyon Odaklı</p>
                    </div>
                </div>
                <div className="h-6 w-[1.5px] bg-indigo-800 hidden sm:block"></div>
                <div className="hidden sm:block text-right">
                    <span className="text-[6px] font-black text-indigo-400 uppercase block">Stabilizasyon</span>
                    <span className="text-[9px] font-black">AKTİF</span>
                </div>
            </div>
        </div>
    );
};
