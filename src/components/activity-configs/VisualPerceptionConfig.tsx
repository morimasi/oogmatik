
import React from 'react';
import { GeneratorOptions } from '../../types';

export const VisualPerceptionConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Analiz Tipi & Tema Selection */}
            <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-[2rem] border border-violet-100 dark:border-violet-800/30">
                <label className="text-[10px] font-black text-violet-600 uppercase mb-3 block text-center tracking-widest">İçerik Teması</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'character', label: 'Harf/Rakam', icon: 'fa-font' },
                        { id: 'emoji', label: 'Emojiler', icon: 'fa-face-smile' },
                        { id: 'abstract', label: 'Soyut Şekil', icon: 'fa-shapes' },
                        { id: 'mixed', label: 'Karışık', icon: 'fa-layer-group' },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => onChange('visualType', t.id)}
                            className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${options.visualType === t.id ? 'bg-violet-600 border-violet-600 text-white shadow-md' : 'bg-white dark:bg-zinc-800 border-zinc-100 text-zinc-500'}`}
                        >
                            <i className={`fa-solid ${t.icon} text-xs`}></i>
                            <span className="text-[10px] font-black uppercase whitespace-nowrap">{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sayfa Yapısı Konfigürasyonu */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">
                            <span>Satır Sayısı</span>
                            <span className="text-indigo-600">{(options as any).rowCount || 14}</span>
                        </div>
                        <input
                            type="range" min="4" max="25"
                            value={(options as any).rowCount || 14}
                            onChange={e => onChange('rowCount' as any, parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">
                            <span>Satır Başı Öğe</span>
                            <span className="text-emerald-600">{options.itemCount || 6}</span>
                        </div>
                        <input
                            type="range" min="4" max="10"
                            value={options.itemCount || 6}
                            onChange={e => onChange('itemCount', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        <span><i className="fa-solid fa-brain mr-1"></i> Bilişsel Yük</span>
                        <span className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full text-[9px]">{options.cognitiveLoad || 5} / 10</span>
                    </div>
                    <input
                        type="range" min="1" max="10"
                        value={options.cognitiveLoad || 5}
                        onChange={e => onChange('cognitiveLoad', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <span>Çeldirici Hassasiyeti</span>
                        <span className="text-violet-600 font-black">{options.distractionLevel?.toUpperCase() || 'MEDIUM'}</span>
                    </div>
                    <div className="flex gap-1.5">
                        {['low', 'medium', 'high', 'extreme'].map(level => (
                            <button
                                key={level}
                                onClick={() => onChange('distractionLevel', level)}
                                title={level.toUpperCase()}
                                className={`flex-1 h-3 rounded-full transition-all border-2 ${options.distractionLevel === level ? 'bg-violet-600 border-violet-600 scale-y-110 shadow-lg' : 'bg-white dark:bg-zinc-900 border-zinc-200'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700 space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase mb-2 block tracking-widest">Görsel Stil</label>
                        <div className="flex gap-2">
                            {['standard', 'premium', 'glassmorphism'].map(style => (
                                <button
                                    key={style}
                                    onClick={() => onChange('aestheticMode', style)}
                                    className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${((options as Record<string, unknown>).aestheticMode || 'premium') === style ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500'}`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Klinik Metrikler</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={options.includeClinicalNotes}
                                onChange={e => onChange('includeClinicalNotes', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-indigo-950 text-white rounded-2xl flex items-center justify-between group cursor-default overflow-hidden relative">
                <div className="relative z-10">
                    <p className="text-[11px] font-black uppercase tracking-tight">V2 Professional</p>
                    <p className="text-[8px] font-bold text-indigo-300 uppercase opacity-70">A4 Optimizasyonu Aktif</p>
                </div>
                <i className="fa-solid fa-bolt-lightning text-indigo-400/30 text-3xl absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform"></i>
            </div>
        </div>
    );
};
