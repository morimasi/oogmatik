import React from 'react';
import { GeneratorOptions } from '../../types';

export const ReadingPyramidConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Temel Ayarlar - Piramit Yapısı */}
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl space-y-6">
                <div>
                    <label className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-4 block tracking-[0.2em]">Piramit Yüksekliği</label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { v: 3, l: 'Kısa (3)' },
                            { v: 5, l: 'Orta (5)' },
                            { v: 7, l: 'Uzun (7)' },
                            { v: 10, l: 'Pro (10)' }
                        ].map(t => (
                            <button
                                key={t.v}
                                onClick={() => onChange('pyramidHeight', t.v)}
                                className={`py-3 px-2 rounded-2xl text-[10px] font-black border transition-all duration-300 hover:scale-[1.02] active:scale-95 ${options.pyramidHeight === t.v ? 'bg-[var(--accent-color)] text-[var(--text-primary)] border-[var(--accent-color)] shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-[var(--text-muted)] border-white/5 hover:bg-white/10'}`}
                            >
                                {t.l}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-[var(--accent-color)] uppercase block tracking-[0.2em]">Konu / Tema</label>
                    <input
                        type="text"
                        value={options.topic || ''}
                        onChange={e => onChange('topic', e.target.value)}
                        placeholder="Örn: Uzay, Deniz, Robotlar..."
                        className="w-full p-4 rounded-2xl bg-black/20 border border-white/5 text-[var(--text-primary)] text-sm focus:border-[var(--accent-color)]/50 outline-none transition-all placeholder:text-[var(--text-muted)] font-bold shadow-inner"
                    />
                </div>
            </div>

            {/* Premium Stil Ayarları */}
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl space-y-6">
                {/* Renk Paleti */}
                <div>
                    <label className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-4 block tracking-[0.2em]">Renk Paleti</label>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { id: 'indigo', color: 'bg-[var(--accent-color)]' },
                            { id: 'rose', color: 'bg-rose-500' },
                            { id: 'emerald', color: 'bg-emerald-500' },
                            { id: 'amber', color: 'bg-amber-500' },
                            { id: 'slate', color: 'bg-[var(--surface-elevated)]' },
                            { id: 'colorful', color: 'bg-gradient-to-tr from-indigo-500 via-rose-500 to-amber-500' }
                        ].map(p => (
                            <button
                                key={p.id}
                                onClick={() => onChange('colorPalette', p.id)}
                                title={p.id}
                                className={`w-8 h-8 rounded-full border-2 transition-all duration-300 hover:scale-110 ${p.color} ${options.colorPalette === p.id ? 'border-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-60'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Font ve Yerleşim */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-3 block tracking-[0.1em]">Yazı Tipi Boyutu</label>
                        <select
                            value={(options.fontSize as string) || 'medium'}
                            onChange={e => onChange('fontSize', e.target.value)}
                            className="w-full p-3 rounded-xl bg-black/20 border border-white/5 text-[var(--text-primary)] text-[10px] font-bold outline-none cursor-pointer"
                        >
                            <option value="small">Küçük</option>
                            <option value="medium">Orta</option>
                            <option value="large">Büyük</option>
                            <option value="xl">Çok Büyük</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-3 block tracking-[0.1em]">Yerleşim</label>
                        <select
                            value={(options.layoutDensity as string) || 'normal'}
                            onChange={e => onChange('layoutDensity', e.target.value)}
                            className="w-full p-3 rounded-xl bg-black/20 border border-white/5 text-[var(--text-primary)] text-[10px] font-bold outline-none cursor-pointer"
                        >
                            <option value="compact">Kompakt (A4 Dolu)</option>
                            <option value="normal">Normal</option>
                            <option value="relaxed">Geniş</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bilgi Notu */}
            <div className="px-4 py-3 bg-[var(--accent-color)]/10 rounded-2xl border border-[var(--accent-color)]/20">
                <p className="text-[9px] text-[var(--accent-color)]/80 leading-relaxed text-center font-medium">
                    Zorluk seviyesi arttıkça piramit cümleleri "tekrar" yerine bağlamsal olarak genişletilir. 
                    Kompakt yerleşim A4 sayfasını maksimum verimle doldurur.
                </p>
            </div>
        </div>
    );
};
