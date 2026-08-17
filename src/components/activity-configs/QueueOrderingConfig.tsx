import React from 'react';
import { GeneratorOptions } from '../../types';

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

export const QueueOrderingConfig = ({ options, onChange }: ConfigProps) => {
    const o = (options as any).queueOrdering || {};

    const update = (key: string, val: unknown) => {
        onChange('queueOrdering' as any, { ...o, [key]: val });
        onChange(key as any, val);
    };

    const problemCount = o.problemCount || options.problemCount || 6;

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-3">
                    <i className="fa-solid fa-users-line mr-1 text-indigo-600"></i> Sıralama Becerisi Ayarları
                </h4>

                <div className="grid grid-cols-2 gap-3">
                    {/* Mekan Seçimi */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                            Senaryo Mekanı
                        </label>
                        <select
                            value={o.locationType || options.locationType || 'school'}
                            onChange={(e) => update('locationType', e.target.value)}
                            className="w-full bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="school">Okul / Kantin / Yemekhane</option>
                            <option value="bus">Otobüs Durağı / Turnike</option>
                            <option value="market">Market / Fırın / Kasalar</option>
                            <option value="amusement">Lunapark / Tren / Gişe</option>
                        </select>
                    </div>

                    {/* Zorluk */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                            Zorluk Seviyesi
                        </label>
                        <select
                            value={options.difficulty || 'medium'}
                            onChange={(e) => onChange('difficulty', e.target.value)}
                            className="w-full bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="easy">Kolay (Hemen önü/arkası)</option>
                            <option value="medium">Orta (Sondan sıra / Ortada olma)</option>
                            <option value="hard">Zor (Çoklu yön ipucu zinciri)</option>
                        </select>
                    </div>
                </div>

                {/* Soru Sayısı Slider */}
                <div className="mt-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase mb-1">
                        <span>A4 Soru Miktarı</span>
                        <span className="text-indigo-600 font-black">{problemCount} Soru</span>
                    </div>
                    <input
                        type="range"
                        min={2}
                        max={8}
                        step={2}
                        value={problemCount}
                        onChange={(e) => update('problemCount', parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                    />
                </div>
            </div>

            {/* İpuçları & Görsel Karakter Ayarları */}
            <div className="space-y-2">
                <div
                    className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                    onClick={() => update('showVisualClues', o.showVisualClues === false ? true : false)}
                >
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Görsel Kuyruk Treni Şeması</span>
                        <span className="text-[9px] text-zinc-400">Kişileri A4 kartı üstünde şematik çiz</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${o.showVisualClues !== false ? 'bg-indigo-600' : 'bg-zinc-300'}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${o.showVisualClues !== false ? 'left-5.5' : 'left-0.75'}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};
