import React from 'react';
import { GeneratorOptions } from '../../types';
import { CompactToggleGroup } from './SharedConfigComponents';

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: any) => void;
}

/**
 * Hikaye Analizi Ultra Pro - Profesyonel Ayar Paneli
 */
export const StoryAnalysisConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* TEMEL AYARLAR */}
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-circle-info text-emerald-500 text-sm"></i>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Temel Ayarlar</span>
                </div>
                
                <div>
                    <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 block">Hikaye Konusu</label>
                    <input
                        type="text"
                        value={options.topic || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('topic', e.target.value)}
                        placeholder="Örn: Uzay yolculuğu, Krallık macerası, Köpekler..."
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

            {/* ANALİZ AYARLARI */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-magnifying-glass text-emerald-500 text-sm"></i>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Analiz Ayarları</span>
                </div>
                
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Analiz Derinliği</label>
                        <select
                            value={options.analysisDepth || 'detaylı'}
                            onChange={(e) => onChange('analysisDepth', e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-[10px] font-bold"
                        >
                            <option value="temel">Temel</option>
                            <option value="detaylı">Detaylı</option>
                            <option value="akademik">Akademik</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { key: 'showStoryMap', label: 'Hikaye Haritası' },
                            { key: 'includeCharacterAnalysis', label: 'Karakter Analizi' },
                            { key: 'includeSettingAnalysis', label: 'Mekan Analizi' },
                            { key: 'includeConflictResolution', label: 'Çözüm Süreci' },
                            { key: 'includeMainIdea', label: 'Ana Fikir' },
                            { key: 'includeSubThemes', label: 'Alt Temalar' },
                            { key: 'includeThematicQuestions', label: 'Tematik Sorular' },
                            { key: 'includeInferentialQuestions', label: 'Çıkarım Soruları' },
                            { key: 'includeCreativeQuestions', label: 'Yaratıcı Sorular' },
                            { key: 'includeVocabularyList', label: 'Kelime Listesi' }
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-700 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={options[key as keyof GeneratorOptions] !== false}
                                    onChange={(e) => onChange(key as keyof GeneratorOptions, e.target.checked)}
                                    className="w-3.5 h-3.5 rounded text-emerald-600 border-zinc-300"
                                />
                                <span className="text-[9px] font-bold text-zinc-600 dark:text-zinc-300">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-book-open text-indigo-500 text-sm"></i>
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Metin Ayarları</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Hikaye Uzunluğu</label>
                            <select
                                value={options.storyLength || 'orta'}
                                onChange={(e) => onChange('storyLength', e.target.value)}
                                className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-[10px] font-bold"
                            >
                                <option value="kısa">Kısa</option>
                                <option value="orta">Orta</option>
                                <option value="uzun">Uzun</option>
                                <option value="çok uzun">Çok Uzun</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Soru Sayısı</label>
                            <input
                                type="number"
                                min={3}
                                max={15}
                                value={options.questionCount || 8}
                                onChange={(e) => onChange('questionCount', parseInt(e.target.value))}
                                className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-[10px] font-bold"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Kelime Seviyesi</label>
                            <select
                                value={options.vocabularyLevel || 'orta'}
                                onChange={(e) => onChange('vocabularyLevel', e.target.value)}
                                className="w-full p-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-[9px] font-bold"
                            >
                                <option value="basit">Basit</option>
                                <option value="orta">Orta</option>
                                <option value="zor">Zor</option>
                                <option value="akademik">Akademik</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Cümle Yapısı</label>
                            <select
                                value={options.sentenceComplexity || 'birleşik'}
                                onChange={(e) => onChange('sentenceComplexity', e.target.value)}
                                className="w-full p-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-[9px] font-bold"
                            >
                                <option value="basit">Basit</option>
                                <option value="birleşik">Birleşik</option>
                                <option value="karmaşık">Karmaşık</option>
                            </select>
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
                            { key: 'syllableColoring', label: 'Hece Renklendirme' }
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
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-900/20 dark:to-indigo-900/20 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-800/30">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <i className="fa-solid fa-book text-xs"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-600 dark:from-emerald-400 dark:to-indigo-400 uppercase tracking-tighter">
                            Ultra Pro Story Analysis
                        </span>
                        <span className="text-[9px] text-zinc-500 dark:text-zinc-400">
                            Derinlemesine hikaye analizi ve metin çalışması. Tamamen özelleştirilebilir.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
