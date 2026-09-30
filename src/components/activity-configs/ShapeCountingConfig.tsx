
import React from 'react';
import { GeneratorOptions } from '../../types';

export const ShapeCountingConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    const shapes = [
        { v: 'triangle', l: 'Üçgen', i: 'fa-play fa-rotate-270' },
        { v: 'circle', l: 'Daire', i: 'fa-circle' },
        { v: 'square', l: 'Kare', i: 'fa-square' },
        { v: 'star', l: 'Yıldız', i: 'fa-star' },
        { v: 'hexagon', l: 'Altıgen', i: 'fa-draw-polygon' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300 bg-white/10 backdrop-blur-xl border border-amber-200/30 rounded-[2.5rem] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)]" style={{ fontFamily: 'Lexend, sans-serif' }}>
            {/* Hedef Şekil Seçimi */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/30">
                <label className="text-[10px] font-black text-amber-600 uppercase mb-3 block text-center tracking-widest">Aranacak Hedef</label>
                <div className="grid grid-cols-5 gap-2">
                    {shapes.map(s => (
                        <button 
                            key={s.v}
                            onClick={() => onChange('targetShape', s.v)}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${options.targetShape === s.v ? 'border-amber-500 bg-[var(--bg-paper)] shadow-md text-amber-600' : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
                            title={s.l}
                        >
                            <i className={`fa-solid ${s.i} text-lg`}></i>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-6">
                {/* Yerleşim Tipi */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Yerleşim Mimarisi</label>
                    <div className="flex bg-[var(--surface-elevated)] bg-[var(--bg-secondary)] rounded-xl p-1">
                        {[
                            { v: 'standard', l: 'Grid (Düzenli)' },
                            { v: 'mixed', l: 'Kaotik (Karma)' }
                        ].map(t => (
                            <button 
                                key={t.v}
                                onClick={() => onChange('variant', t.v)}
                                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${options.variant === t.v ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm' : 'text-[var(--text-muted)]'}`}
                            >
                                {t.l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Yoğunluk */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] uppercase">
                        <span>Nesne Yoğunluğu</span>
                        <span className="text-amber-600 font-black">{options.itemCount || 24}</span>
                    </div>
                    <input 
                        type="range" min={5} max={50} step={1}
                        value={options.itemCount || 24} 
                        onChange={e => onChange('itemCount', parseInt(e.target.value))} 
                        className="w-full h-1.5 bg-[var(--surface-elevated)] bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-amber-500" 
                    />
                </div>

                {/* Gelişmiş Ayarlar */}
                <div className="pt-4 border-t border-[var(--border-color)] space-y-5">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest cursor-pointer flex items-center gap-3">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    checked={(options as Record<string, unknown>).overlapping !== false} 
                                    onChange={e => onChange('overlapping', e.target.checked)} 
                                    className="sr-only" 
                                />
                                <div className={`w-10 h-5 rounded-full transition-colors ${(options as Record<string, unknown>).overlapping !== false ? 'bg-amber-500' : 'bg-[var(--surface-elevated)]'}`}></div>
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-[var(--bg-paper)] rounded-full transition-transform ${(options as Record<string, unknown>).overlapping !== false ? 'translate-x-5' : ''}`}></div>
                            </div>
                            Nesneler Üst Üste Binmeli mi?
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block">Görsel Stil</label>
                        <div className="flex gap-1.5">
                            {['glassmorphism', 'premium', 'standard'].map(style => (
                                <button
                                    key={style}
                                    onClick={() => onChange('aestheticMode', style)}
                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border-2 ${((options as Record<string, unknown>).aestheticMode) === style ? 'bg-amber-500 border-amber-500 text-[var(--text-primary)] shadow-md' : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block">Sayfa Yerleşimi</label>
                        <select
                            value={options.layout || 'single'}
                            onChange={e => onChange('layout', e.target.value)}
                            className="w-full p-2 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[10px] font-bold outline-none"
                        >
                            <option value="single">Standart (Tam Sayfa)</option>
                            <option value="grid_2x1">2'li Kompakt (Dikey)</option>
                            <option value="grid_2x2">4'lü Ultra Kompakt (Matrix)</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase">Analiz Derinliği</span>
                        <div className="flex gap-2">
                            {['Başlangıç', 'Orta', 'Zor', 'Uzman'].map(lvl => (
                                <button 
                                    key={lvl}
                                    onClick={() => onChange('difficulty', lvl)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[8px] transition-all border ${options.difficulty === lvl ? 'bg-[var(--bg-inset)] text-[var(--text-primary)] border-[var(--border-color)] shadow-lg' : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
                                >
                                    {lvl.substring(0, 1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
