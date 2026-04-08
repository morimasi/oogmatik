
import React from 'react';
import { GeneratorOptions } from '../../types';

export const ShapeCountingConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    const shapes = [
        { v: 'triangle', l: 'Üçgen', i: 'fa-play fa-rotate-270' },
        { v: 'circle', l: 'Daire', i: 'fa-circle' },
        { v: 'square', l: 'Kare', i: 'fa-square' },
        { v: 'star', l: 'Yıldız', i: 'fa-star' },
        { v: 'hexagon', l: 'Altıgen', i: 'fa-draw-polygon' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Hedef Şekil Seçimi */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/30">
                <label className="text-[10px] font-black text-amber-600 uppercase mb-3 block text-center tracking-widest">Aranacak Hedef</label>
                <div className="grid grid-cols-5 gap-2">
                    {shapes.map(s => (
                        <button 
                            key={s.v}
                            onClick={() => onChange('targetShape', s.v)}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${options.targetShape === s.v ? 'border-amber-500 bg-white shadow-md text-amber-600' : 'border-zinc-100 bg-zinc-50 text-zinc-400'}`}
                            title={s.l}
                        >
                            <i className={`fa-solid ${s.i} text-lg`}></i>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-6">
                {/* Yerleşim Tipi */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Yerleşim Mimarisi</label>
                    <div className="flex bg-zinc-200 dark:bg-zinc-700 rounded-xl p-1">
                        {[
                            { v: 'standard', l: 'Grid (Düzenli)' },
                            { v: 'mixed', l: 'Kaotik (Karma)' }
                        ].map(t => (
                            <button 
                                key={t.v}
                                onClick={() => onChange('variant', t.v)}
                                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${options.variant === t.v ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'}`}
                            >
                                {t.l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Yoğunluk */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                        <span>Nesne Yoğunluğu</span>
                        <span className="text-amber-600 font-black">{options.itemCount || 24}</span>
                    </div>
                    <input 
                        type="range" min={10} max={80} step={5}
                        value={options.itemCount || 24} 
                        onChange={e => onChange('itemCount', parseInt(e.target.value))} 
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                    />
                </div>

                {/* Gelişmiş Ayarlar */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-700 space-y-5">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest cursor-pointer flex items-center gap-3">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    checked={options.overlapping !== false} 
                                    onChange={e => onChange('overlapping', e.target.checked)} 
                                    className="sr-only" 
                                />
                                <div className={`w-10 h-5 rounded-full transition-colors ${options.overlapping !== false ? 'bg-amber-500' : 'bg-zinc-300'}`}></div>
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${options.overlapping !== false ? 'translate-x-5' : ''}`}></div>
                            </div>
                            Nesneler Üst Üste Binmeli mi?
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Görsel Stil</label>
                        <div className="flex gap-1.5">
                            {['standard', 'premium', 'glassmorphism'].map(style => (
                                <button
                                    key={style}
                                    onClick={() => onChange('aestheticMode', style)}
                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border-2 ${options.aestheticMode === style ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500'}`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Sayfa Yerleşimi</label>
                        <select
                            value={options.layout || 'single'}
                            onChange={e => onChange('layout', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-bold outline-none"
                        >
                            <option value="single">Standart (Tam Sayfa)</option>
                            <option value="grid_2x1">2'li Kompakt (Dikey)</option>
                            <option value="grid_2x2">4'lü Ultra Kompakt (Matrix)</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase">Analiz Derinliği</span>
                        <div className="flex gap-2">
                            {['Başlangıç', 'Orta', 'Zor', 'Uzman'].map(lvl => (
                                <button 
                                    key={lvl}
                                    onClick={() => onChange('difficulty', lvl)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[8px] transition-all border ${options.difficulty === lvl ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg' : 'bg-white border-zinc-100 text-zinc-400'}`}
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
