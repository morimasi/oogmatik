import React from 'react';
import { GeneratorOptions } from '../../types';

export const DrawingSkillConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Izgara Boyutu (Kare Sayısı) */}
            <div className="p-4 bg-[var(--bg-inset)] text-[var(--text-primary)] rounded-[2rem] border border-[var(--border-color)] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className="fa-solid fa-border-all text-4xl"></i>
                </div>
                <label className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-3 block text-center tracking-widest">Izgara Boyutu (Kare Sayısı)</label>
                <div className="grid grid-cols-4 gap-2 relative z-10">
                    {[6, 8, 10, 12].map(n => (
                        <button
                            key={n}
                            onClick={() => onChange('gridSize', n)}
                            className={`py-3 text-[10px] font-black rounded-xl border-2 transition-all ${options.gridSize === n ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--text-primary)] shadow-lg scale-105' : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--border-color)]'}`}
                        >
                            {n}x{n}
                        </button>
                    ))}
                </div>
                <p className="text-[8px] text-[var(--text-muted)] mt-2 text-center uppercase font-bold tracking-tighter">İnce motor becerisi ve uzamsal algı zorluğunu belirler.</p>
            </div>

            {/* Varyasyon Sayısı (Sayfa Düzeni) */}
            <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-[2rem] border border-violet-100 dark:border-violet-800/30">
                <label className="text-[10px] font-black text-violet-600 uppercase mb-3 block text-center tracking-widest">Etkinlik Varyasyon Sayısı</label>
                <div className="flex gap-2">
                    {[1, 2, 4].map(count => (
                        <button
                            key={count}
                            onClick={() => onChange('puzzleCount', count)}
                            className={`flex-1 py-2.5 rounded-xl border-2 font-black text-xs transition-all ${options.puzzleCount === count ? 'bg-[var(--accent-color)] border-violet-600 text-[var(--text-primary)] shadow-md' : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
                        >
                            {count} {count === 1 ? 'Görev' : 'Görev'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Diğer Ayarlar */}
            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-5">
                <div className="flex items-center justify-between bg-[var(--bg-paper)] bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border-color)]">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Koordinat Sistemi</span>
                        <span className="text-[8px] font-bold text-[var(--text-muted)] mt-1 uppercase">A-B-C / 1-2-3 Rehberi</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={options.showCoordinates !== false}
                            onChange={e => onChange('showCoordinates', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-[var(--surface-elevated)] peer-focus:outline-none rounded-full peer bg-[var(--bg-secondary)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-paper)] after:border-[var(--border-color)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-[var(--border-color)] peer-checked:bg-[var(--accent-color)]"></div>
                    </label>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase block tracking-widest pl-1">Transformasyon Modu</label>
                    <div className="grid grid-cols-1 gap-2">
                        <select
                            value={options.concept || 'copy'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('concept', e.target.value)}
                            className="w-full p-3 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase outline-none focus:border-[var(--accent-color)] transition-colors"
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
            <div className="p-4 bg-[var(--accent-muted)] text-[var(--text-primary)] rounded-2xl flex items-center justify-between group overflow-hidden relative">
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-color)]/20 flex items-center justify-center border border-[var(--accent-color)]/30">
                        <i className="fa-solid fa-microchip text-[var(--accent-color)] text-xs translate-y-[-1px]"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-tight leading-none">Motor-Precision v2</p>
                        <p className="text-[7px] font-bold text-[var(--accent-color)] uppercase opacity-70 mt-1">Görsel-Motor Entegrasyon Odaklı</p>
                    </div>
                </div>
                <div className="h-6 w-[1.5px] bg-[var(--accent-color)] hidden sm:block"></div>
                <div className="hidden sm:block text-right">
                    <span className="text-[6px] font-black text-[var(--accent-color)] uppercase block">Stabilizasyon</span>
                    <span className="text-[9px] font-black">AKTİF</span>
                </div>
            </div>
        </div>
    );
};
