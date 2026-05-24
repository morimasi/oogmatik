import React from 'react';
import { GeneratorOptions } from '../../types';
import { CompactToggleGroup } from './SharedConfigComponents';

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

/**
 * Eksik Parçaları Tamamlama - Ultra Profesyonel Ayar Paneli
 */
export const MissingPartsConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* TEMEL AYARLAR */}
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-circle-info text-emerald-500 text-sm"></i>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Temel Ayarlar</span>
                </div>

                <div>
                    <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 block">Metin Teması</label>
                    <input
                        type="text"
                        value={options.topic || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('topic', e.target.value)}
                        placeholder="Örn: Uzay yolculuğu, Deniz altı dünyası, Hayvanlar..."
                        className="w-full p-4 bg-white dark:bg-zinc-800 border-2 border-emerald-100 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 dark:text-zinc-100 placeholder-zinc-400 shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Zorluk</label>
                        <select
                            value={options.difficulty || 'Orta'}
                            onChange={(e) => onChange('difficulty', e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-xs font-bold"
                        >
                            <option value="çok kolay">Çok Kolay</option>
                            <option value="kolay">Kolay</option>
                            <option value="Orta">Orta</option>
                            <option value="Zor">Zor</option>
                            <option value="uzman">Uzman</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Yaş</label>
                        <select
                            value={options.ageGroup || '8-10'}
                            onChange={(e) => onChange('ageGroup', e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-xs font-bold"
                        >
                            <option value="5-7">5-7</option>
                            <option value="8-10">8-10</option>
                            <option value="11-13">11-13</option>
                            <option value="14+">14+</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Sınıf</label>
                        <select
                            value={options.gradeLevel || 3}
                            onChange={(e) => onChange('gradeLevel', parseInt(e.target.value))}
                            className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-xs font-bold"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(grade => (
                                <option key={grade} value={grade}>{grade}. Sınıf</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ÜRETİM MODU */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-bolt text-indigo-500 text-sm"></i>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Üretim Modu</span>
                </div>
                <CompactToggleGroup
                    label="Mod Seçimi"
                    selected={options.mode || 'ai'}
                    onChange={(v: string) => onChange('mode', v)}
                    options={[
                        { value: 'fast', label: 'Hızlı' },
                        { value: 'ai', label: 'AI' }
                    ]}
                />
            </div>

            {/* BOŞLUK AYARLARI */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-eraser text-emerald-500 text-sm"></i>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Boşluk Ayarları</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Boşluk Türü</label>
                        <select
                            value={options.blankType || 'word'}
                            onChange={(e) => onChange('blankType', e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-[10px] font-bold"
                        >
                            <option value="word">Kelime</option>
                            <option value="phrase">Kelime Grubu</option>
                            <option value="sentence">Cümle</option>
                            <option value="number">Sayı</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Boşluk Sayısı</label>
                        <input
                            type="number"
                            min={5}
                            max={25}
                            value={options.blankCount || 10}
                            onChange={(e) => onChange('blankCount', parseInt(e.target.value))}
                            className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-[10px] font-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Boşluk Boyutu</label>
                        <select
                            value={options.blankSize || 'medium'}
                            onChange={(e) => onChange('blankSize', e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-[10px] font-bold"
                        >
                            <option value="small">Küçük</option>
                            <option value="medium">Orta</option>
                            <option value="large">Büyük</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Boşluk Stili</label>
                        <select
                            value={options.blankStyle || 'underline'}
                            onChange={(e) => onChange('blankStyle', e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-[10px] font-bold"
                        >
                            <option value="underline">Alt Çizgi</option>
                            <option value="dashed">Kesik Çizgi</option>
                            <option value="solid">Dolu</option>
                            <option value="dotted">Nokta</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-key text-indigo-500 text-sm"></i>
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Kelime Havuzu</span>
                    </div>

                    <label className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-700 rounded-xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors border border-zinc-200 dark:border-zinc-600">
                        <input
                            type="checkbox"
                            checked={options.showWordBank !== false}
                            onChange={(e) => onChange('showWordBank', e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
                        />
                        <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">Kelime Havuzu Göster</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-700 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                            <input
                                type="checkbox"
                                checked={options.includeDistractors !== false}
                                onChange={(e) => onChange('includeDistractors', e.target.checked)}
                                className="w-3.5 h-3.5 rounded text-indigo-600 border-zinc-300"
                            />
                            <span className="text-[9px] font-bold text-zinc-600 dark:text-zinc-300">Çeldirici Ekle</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase">Sayısı:</label>
                            <input
                                type="number"
                                min={1}
                                max={10}
                                value={options.distractorCount || 4}
                                onChange={(e) => onChange('distractorCount', parseInt(e.target.value))}
                                className="flex-1 p-1.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-[9px] font-bold"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-palette text-amber-500 text-sm"></i>
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Görsel & Düzen</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'compactLayout', label: 'Kompakt Layout' },
                            { key: 'useIcons', label: 'İkon Kullan' },
                            { key: 'showReadingRuler', label: 'Okuma Cetveli' },
                            { key: 'syllableColoring', label: 'Hece Renklendirme' },
                            { key: 'showVisualHints', label: 'Görsel İpuçları' },
                            { key: 'showExamples', label: 'Örnek Göster' }
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-700 rounded-xl cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors border border-zinc-200 dark:border-zinc-600">
                                <input
                                    type="checkbox"
                                    checked={options[key as keyof GeneratorOptions] !== false}
                                    onChange={(e) => onChange(key as keyof GeneratorOptions, e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-zinc-300"
                                />
                                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">{label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Font</label>
                            <select
                                value={options.fontSize || 'medium'}
                                onChange={(e) => onChange('fontSize', e.target.value)}
                                className="w-full p-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-[9px] font-bold"
                            >
                                <option value="small">Küçük</option>
                                <option value="medium">Orta</option>
                                <option value="large">Büyük</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Satır</label>
                            <select
                                value={options.lineHeight || 'normal'}
                                onChange={(e) => onChange('lineHeight', e.target.value)}
                                className="w-full p-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-[9px] font-bold"
                            >
                                <option value="tight">Sık</option>
                                <option value="normal">Normal</option>
                                <option value="relaxed">Geniş</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Sütun</label>
                            <select
                                value={options.columnLayout || 'single'}
                                onChange={(e) => onChange('columnLayout', e.target.value)}
                                className="w-full p-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-[9px] font-bold"
                            >
                                <option value="single">Tek</option>
                                <option value="two-column">İki</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-900/20 dark:to-indigo-900/20 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-800/30">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <i className="fa-solid fa-puzzle-piece text-xs"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-600 dark:from-emerald-400 dark:to-indigo-400 uppercase tracking-tighter">
                            Ultra Pro Cloze
                        </span>
                        <span className="text-[9px] text-zinc-500 dark:text-zinc-400">
                            Okuma akıcılığı ve bağlam analisti. Tamamen özelleştirilebilir.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
