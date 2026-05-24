import React, { useState } from 'react';
import { GeneratorOptions } from '../../types';
import { CompactToggleGroup } from './SharedConfigComponents';

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

export const ShortAnswerConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    const [activeTab, setActiveTab] = useState<'temel' | 'soru' | 'gorsel' | 'ozel'>('temel');

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Sekme Çubuğu */}
            <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
                {[
                    { id: 'temel', label: 'Temel', icon: 'fa-sliders' },
                    { id: 'soru', label: 'Sorular', icon: 'fa-question-circle' },
                    { id: 'gorsel', label: 'Görsel', icon: 'fa-palette' },
                    { id: 'ozel', label: 'Özel', icon: 'fa-star' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as string)}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                            activeTab === tab.id
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 scale-105'
                                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                        }`}
                    >
                        <i className={`fa-solid ${tab.icon} text-xs`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TEMEL AYARLAR */}
            {activeTab === 'temel' && (
                <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/30 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <i className="fa-solid fa-crown text-amber-500"></i>
                            <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                                Ultra Premium Ayarlar
                            </span>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2 block">
                                Etkinlik Başlığı / Konu
                            </label>
                            <input
                                type="text"
                                value={options.topic || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('topic', e.target.value)}
                                placeholder="Örn: Doğa, Hayvanlar, Mevsimler, Matematik..."
                                className="w-full p-4 bg-white dark:bg-zinc-800 border-2 border-amber-200 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-amber-500 dark:text-zinc-100 placeholder-zinc-400 shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase block">Yaş Grubu</label>
                                <select
                                    value={options.ageGroup || '8-10'}
                                    onChange={(e) => onChange('ageGroup', e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                                >
                                    <option value="okul_oncesi">Okul Öncesi</option>
                                    <option value="5-7">5-7 Yaş</option>
                                    <option value="8-10">8-10 Yaş</option>
                                    <option value="11-13">11-13 Yaş</option>
                                    <option value="14+">14+ Yaş</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase block">Zorluk</label>
                                <select
                                    value={options.difficulty || 'Orta'}
                                    onChange={(e) => onChange('difficulty', e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                                >
                                    <option value="çok kolay">Çok Kolay</option>
                                    <option value="kolay">Kolay</option>
                                    <option value="Orta">Orta</option>
                                    <option value="Zor">Zor</option>
                                    <option value="uzman">Uzman</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase block">Sınıf</label>
                                <select
                                    value={options.gradeLevel || 3}
                                    onChange={(e) => onChange('gradeLevel', parseInt(e.target.value))}
                                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                                >
                                    <option value={0}>Okul Öncesi</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(grade => (
                                        <option key={grade} value={grade}>{grade}. Sınıf</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <i className="fa-solid fa-bolt text-indigo-500"></i>
                            <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">Üretim Modu</span>
                        </div>
                        <CompactToggleGroup
                            label="Mod Seçimi"
                            selected={options.mode || 'ai'}
                            onChange={(v: string) => onChange('mode', v)}
                            options={[
                                { value: 'fast', label: '⚡ Hızlı' },
                                { value: 'ai', label: '🤖 AI' }
                            ]}
                        />
                    </div>
                </div>
            )}

            {/* SORU AYARLARI */}
            {activeTab === 'soru' && (
                <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <i className="fa-solid fa-pencil text-emerald-500"></i>
                            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Soru Türleri</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Soru Türü</label>
                                <select
                                    value={options.questionType || 'open_ended'}
                                    onChange={(e) => onChange('questionType', e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                                >
                                    <option value="open_ended">Açık Uçlu</option>
                                    <option value="fill_in_blank">Boşluk Doldurma</option>
                                    <option value="two_choice">İki Seçenekli</option>
                                    <option value="visual_analysis">Görsel Analiz</option>
                                    <option value="scenario_based">Senaryo Tabanlı</option>
                                    <option value="creative_thinking">Yaratıcı Düşünme</option>
                                    <option value="mixed">Karışık</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Soru Sayısı</label>
                                <input
                                    type="number"
                                    min={3}
                                    max={50}
                                    value={options.itemCountShort || 16}
                                    onChange={(e) => onChange('itemCountShort', parseInt(e.target.value))}
                                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                            {[
                                { key: 'includeAnswerLines', label: 'Cevap Satırları' },
                                { key: 'includeHints', label: 'İpuçları' },
                                { key: 'includeExamples', label: 'Örnekler' },
                                { key: 'includePoints', label: 'Puanlama' },
                                { key: 'includeScenarios', label: 'Senaryolar' },
                                { key: 'includeVisualAnalysis', label: 'Görsel Analiz' },
                                { key: 'includeCreativeThinking', label: 'Yaratıcı Düşünme' },
                                { key: 'includeVisualHints', label: 'Görsel İpuçları' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2.5 p-3 bg-white dark:bg-zinc-800 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all border border-emerald-100 dark:border-zinc-700">
                                    <input
                                        type="checkbox"
                                        checked={options[key as keyof GeneratorOptions] !== false}
                                        onChange={(e) => onChange(key as keyof GeneratorOptions, e.target.checked)}
                                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300"
                                    />
                                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-[2rem] border border-purple-100 dark:border-purple-800/30 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <i className="fa-solid fa-align-left text-purple-500"></i>
                            <span className="text-[10px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest">Satır Ayarları</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-purple-700 dark:text-purple-400 uppercase block">Satır Sayısı</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={options.answerLineCount || 3}
                                    onChange={(e) => onChange('answerLineCount', parseInt(e.target.value))}
                                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-purple-700 dark:text-purple-400 uppercase block">Satır Stili</label>
                                <select
                                    value={options.lineStyle || 'single'}
                                    onChange={(e) => onChange('lineStyle', e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                                >
                                    <option value="single">Tek Çizgi</option>
                                    <option value="double">Çift Çizgi</option>
                                    <option value="dotted">Noktalı</option>
                                    <option value="dashed">Kesik Çizgi</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-purple-700 dark:text-purple-400 uppercase block">Çizgi Rengi</label>
                                <select
                                    value={options.lineColor || 'standard'}
                                    onChange={(e) => onChange('lineColor', e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                                >
                                    <option value="standard">Standart</option>
                                    <option value="light">Açık</option>
                                    <option value="dark">Koyu</option>
                                    <option value="blue">Mavi</option>
                                    <option value="green">Yeşil</option>
                                    <option value="red">Kırmızı</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GÖRSEL & DÜZEN AYARLARI */}
            {activeTab === 'gorsel' && (
                <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/10 dark:to-orange-900/10 rounded-[2rem] border border-rose-100 dark:border-rose-800/30 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <i className="fa-solid fa-expand text-rose-500"></i>
                            <span className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest">Düzen Ayarları</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-rose-700 dark:text-rose-400 uppercase block">Font Boyutu</label>
                                <select
                                    value={options.fontSize || 'medium'}
                                    onChange={(e) => onChange('fontSize', e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                                >
                                    <option value="small">Küçük</option>
                                    <option value="medium">Orta</option>
                                    <option value="large">Büyük</option>
                                    <option value="xl">Çok Büyük</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-rose-700 dark:text-rose-400 uppercase block">Satır Yüksekliği</label>
                                <select
                                    value={options.lineHeight || 'normal'}
                                    onChange={(e) => onChange('lineHeight', e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                                >
                                    <option value="tight">Sık</option>
                                    <option value="normal">Normal</option>
                                    <option value="relaxed">Geniş</option>
                                    <option value="very_relaxed">Çok Geniş</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-rose-700 dark:text-rose-400 uppercase block">Kenar Boşlukları</label>
                                <select
                                    value={options.marginSize || 'normal'}
                                    onChange={(e) => onChange('marginSize', e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                                >
                                    <option value="narrow">Dar</option>
                                    <option value="normal">Normal</option>
                                    <option value="wide">Geniş</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                            {[
                                { key: 'compactLayout', label: 'Kompakt Düzen' },
                                { key: 'useIcons', label: 'İkon Kullan' },
                                { key: 'showBorders', label: 'Kenarlıkları Göster' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2.5 p-3 bg-white dark:bg-zinc-800 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-rose-100 dark:border-zinc-700">
                                    <input
                                        type="checkbox"
                                        checked={options[key as keyof GeneratorOptions] !== false}
                                        onChange={(e) => onChange(key as keyof GeneratorOptions, e.target.checked)}
                                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-300"
                                    />
                                    <span className="text-[9px] font-bold text-rose-700 dark:text-rose-300">{label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-rose-700 dark:text-rose-400 uppercase block">Sütun Düzeni</label>
                            <select
                                value={options.columnLayout || 'two-column'}
                                onChange={(e) => onChange('columnLayout', e.target.value)}
                                className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                            >
                                <option value="single">Tek Sütun</option>
                                <option value="two-column">İki Sütun</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-rose-700 dark:text-rose-400 uppercase block">Renk Teması</label>
                            <select
                                value={options.colorTheme || 'classic'}
                                onChange={(e) => onChange('colorTheme', e.target.value)}
                                className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 rounded-xl text-[10px] font-black"
                            >
                                <option value="classic">Klasik</option>
                                <option value="blue">Mavi</option>
                                <option value="green">Yeşil</option>
                                <option value="purple">Mor</option>
                                <option value="amber">Amber</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* ÖZEL AYARLAR */}
            {activeTab === 'ozel' && (
                <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-[2rem] border border-cyan-100 dark:border-cyan-800/30 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <i className="fa-solid fa-child-reaching text-cyan-500"></i>
                            <span className="text-[10px] font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-widest">Okul Öncesi Özel</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { key: 'isPreschoolMode', label: 'Okul Öncesi Mod' },
                                { key: 'usePictures', label: 'Resim Kullan' },
                                { key: 'largeButtons', label: 'Büyük Düğmeler' },
                                { key: 'simpleWords', label: 'Basit Kelimeler' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2.5 p-3 bg-white dark:bg-zinc-800 rounded-xl cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all border border-cyan-100 dark:border-zinc-700">
                                    <input
                                        type="checkbox"
                                        checked={options[key as keyof GeneratorOptions] !== false}
                                        onChange={(e) => onChange(key as keyof GeneratorOptions, e.target.checked)}
                                        className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-cyan-300"
                                    />
                                    <span className="text-[9px] font-bold text-cyan-700 dark:text-cyan-300">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 rounded-[2rem] border border-teal-100 dark:border-teal-800/30 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <i className="fa-solid fa-graduation-cap text-teal-500"></i>
                            <span className="text-[10px] font-black text-teal-700 dark:text-teal-400 uppercase tracking-widest">İlkokul Özel</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { key: 'isElementaryMode', label: 'İlkokul Mod' },
                                { key: 'showReadingRuler', label: 'Okuma Cetveli' },
                                { key: 'syllableColoring', label: 'Hece Renklendirme' },
                                { key: 'vocabularySupport', label: 'Kelime Desteği' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2.5 p-3 bg-white dark:bg-zinc-800 rounded-xl cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all border border-teal-100 dark:border-zinc-700">
                                    <input
                                        type="checkbox"
                                        checked={options[key as keyof GeneratorOptions] !== false}
                                        onChange={(e) => onChange(key as keyof GeneratorOptions, e.target.checked)}
                                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-teal-300"
                                    />
                                    <span className="text-[9px] font-bold text-teal-700 dark:text-teal-300">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 rounded-[2rem] border border-amber-100 dark:border-purple-800/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <i className="fa-solid fa-gem text-lg"></i>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-purple-700 dark:from-amber-400 dark:to-purple-400 uppercase tracking-tighter">
                                Premium Kısa Cevaplı Sorular
                            </span>
                            <span className="text-[9px] text-zinc-500 dark:text-zinc-400">
                                Tamamen özelleştirilebilir, profesyonel, A4 boyutunda, iki sütunlu, boşluksuz, dolu dolu bir etkinlik sayfası.
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
