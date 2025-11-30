import React, { useState, useEffect } from 'react';
import { Activity, GeneratorOptions, ActivityType, StudentProfile } from '../types';
import { statsService } from '../services/statsService';

interface GeneratorViewProps {
    activity: Activity;
    onGenerate: (options: GeneratorOptions) => void;
    onBack: () => void;
    isLoading: boolean;
    isExpanded?: boolean;
    onOpenStudentModal?: () => void;
    studentProfile?: StudentProfile | null;
}

// Profesyonel Ayar Tanımı Arayüzü
interface FieldDefinition {
    key: string;
    label: string;
    type: 'select' | 'number' | 'text';
    width: 'full' | 'half'; // Izgara yerleşimi için
    defaultValue?: any;
    options?: string[];
    min?: number;
    max?: number;
    placeholder?: string;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading, isExpanded = true, onOpenStudentModal, studentProfile }) => {
    const [options, setOptions] = useState<any>({
        worksheetCount: 1,
        mode: 'fast',
        difficulty: 'Orta',
        itemCount: 10,
        customInput: ''
    });
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        setIsFavorite(statsService.isFavorite(activity.id));
    }, [activity.id]);

    const handleToggleFavorite = () => {
        statsService.toggleFavorite(activity.id);
        setIsFavorite(!isFavorite);
    };

    const handleChange = (key: string, value: any) => {
        setOptions((prev: any) => ({ ...prev, [key]: value }));
    };

    // Dinamik alanları belirle (Profesyonel Ayarlar)
    const getFields = (type: ActivityType): FieldDefinition[] => {
        const commonFields: FieldDefinition[] = [
            { key: 'difficulty', label: 'Zorluk', type: 'select', defaultValue: 'Orta', options: ['Başlangıç', 'Orta', 'Zor', 'Uzman'], width: 'half' },
            { key: 'itemCount', label: 'Soru Sayısı', type: 'number', defaultValue: 10, min: 1, max: 50, width: 'half' }
        ];

        switch (type) {
            case 'CODE_READING':
                return [
                    { key: 'difficulty', label: 'Zorluk', type: 'select', defaultValue: 'Orta', options: ['Başlangıç', 'Orta', 'Zor', 'Uzman'], width: 'half' },
                    { key: 'itemCount', label: 'Soru Sayısı', type: 'number', defaultValue: 5, min: 3, max: 12, width: 'half' },
                    { key: 'symbolType', label: 'Sembol Tipi', type: 'select', defaultValue: 'arrows', options: ['arrows', 'shapes', 'colors'], width: 'full' },
                    { key: 'codeLength', label: 'Kod Uzunluğu', type: 'number', defaultValue: 4, min: 3, max: 8, width: 'full' },
                ];
            case 'ATTENTION_TO_QUESTION':
                return [
                    { key: 'itemCount', label: 'Adet', type: 'number', defaultValue: 4, min: 1, max: 10, width: 'half' },
                    { key: 'gridSize', label: 'Izgara Boyutu', type: 'number', defaultValue: 10, min: 5, max: 20, width: 'half' },
                    { key: 'subType', label: 'Etkinlik Tipi', type: 'select', defaultValue: 'letter-cancellation', options: ['letter-cancellation', 'path-finding', 'visual-logic'], width: 'full' },
                ];
            case 'ATTENTION_DEVELOPMENT':
                return [
                    { key: 'difficulty', label: 'Zorluk', type: 'select', defaultValue: 'Orta', options: ['Başlangıç', 'Orta', 'Zor', 'Uzman'], width: 'half' },
                    { key: 'itemCount', label: 'Soru Sayısı', type: 'number', defaultValue: 4, min: 1, max: 8, width: 'half' },
                    { key: 'concept', label: 'İçerik Türü', type: 'select', defaultValue: 'numeric', options: ['numeric', 'verbal'], width: 'full' },
                ];
            // Diğer özel durumlar buraya eklenebilir
            default:
                return [
                    ...commonFields,
                    { key: 'topic', label: 'Konu / Tema (Opsiyonel)', type: 'text', placeholder: 'Örn: Doğa, Uzay...', width: 'full' }
                ];
        }
    };

    const fields = getFields(activity.id);

    // KÜÇÜLTÜLMÜŞ GÖRÜNÜM (Sidebar Kapalıyken - Minimal Icon View)
    if (!isExpanded) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-zinc-800 items-center py-2 border-r border-zinc-200 dark:border-zinc-700 w-[72px]">
                <button onClick={onBack} className="mb-4 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 p-2" title="Geri">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-lg mb-4 shadow-sm">
                    <i className={activity.icon}></i>
                </div>
                
                <div className="flex-1 w-full flex flex-col items-center gap-4 mt-2">
                    <div className="w-1 px-2 h-full bg-zinc-100 dark:bg-zinc-700/50 rounded-full mx-auto relative group cursor-help">
                         <div className="absolute top-1/2 left-8 -translate-y-1/2 bg-zinc-800 text-white text-xs p-2 rounded hidden group-hover:block whitespace-nowrap z-50 shadow-lg border border-zinc-600">
                             Ayarlar Gizli (Genişletin)
                         </div>
                    </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 items-center pb-2">
                     <button
                        onClick={() => onGenerate(options)}
                        disabled={isLoading}
                        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg flex items-center justify-center transition-all disabled:opacity-50"
                        title="Oluştur"
                    >
                        {isLoading ? <i className="fa-solid fa-circle-notch fa-spin text-sm"></i> : <i className="fa-solid fa-play text-sm"></i>}
                    </button>
                </div>
            </div>
        );
    }

    // GENİŞLETİLMİŞ GÖRÜNÜM (Sidebar Açıkken - Professional Panel)
    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden w-80">
            {/* 1. HEADER - Ultra Compact & Sticky */}
            <div className="px-3 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/90 backdrop-blur-sm shrink-0 flex items-center justify-between z-10">
                <div className="flex items-center gap-2 overflow-hidden">
                    <button onClick={onBack} className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 text-xs">
                             <i className={activity.icon}></i>
                        </div>
                        <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate uppercase tracking-tight leading-none" title={activity.title}>{activity.title}</h2>
                    </div>
                </div>
                <button 
                    onClick={handleToggleFavorite}
                    className={`text-sm transition-all p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isFavorite ? 'text-rose-500' : 'text-zinc-300 hover:text-zinc-500'}`}
                >
                    <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart`}></i>
                </button>
            </div>

            {/* 2. SCROLLABLE SETTINGS AREA */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-4">
                
                {/* Mode Selector - Segmented Control Style */}
                <div>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        {['fast', 'ai', 'manual'].map((m) => (
                            <button
                                key={m}
                                onClick={() => handleChange('mode', m)}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-[4px] transition-all flex items-center justify-center gap-1.5 ${options.mode === m 
                                    ? 'bg-white dark:bg-zinc-600 text-indigo-600 shadow-sm ring-1 ring-black/5' 
                                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                            >
                                <i className={`fa-solid ${m === 'fast' ? 'fa-bolt' : m === 'ai' ? 'fa-wand-magic-sparkles' : 'fa-keyboard'}`}></i>
                                {m === 'fast' ? 'Hızlı' : m === 'ai' ? 'AI' : 'Manuel'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Settings Grid */}
                <div className="space-y-4">
                    {/* General Config Group */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Yapılandırma</span>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {/* Worksheet Count - Always full width or special */}
                            <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">Sayfa Sayısı</label>
                                <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg h-9 px-1">
                                    <button onClick={() => handleChange('worksheetCount', Math.max(1, options.worksheetCount - 1))} className="w-8 h-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"><i className="fa-solid fa-minus text-[10px]"></i></button>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={options.worksheetCount}
                                        onChange={(e) => handleChange('worksheetCount', Math.max(1, parseInt(e.target.value) || 1))}
                                        className="flex-1 text-center bg-transparent font-bold text-xs outline-none appearance-none"
                                    />
                                    <button onClick={() => handleChange('worksheetCount', Math.min(20, options.worksheetCount + 1))} className="w-8 h-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"><i className="fa-solid fa-plus text-[10px]"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Specific Config Group */}
                    {options.mode !== 'manual' && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">İçerik Ayarları</span>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {fields.map((field, idx) => (
                                <div key={idx} className={`${field.width === 'full' ? 'col-span-2' : 'col-span-1'}`}>
                                    <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1 truncate" title={field.label}>{field.label}</label>
                                    {field.type === 'select' ? (
                                        <div className="relative">
                                            <select
                                                value={options[field.key] || field.defaultValue}
                                                onChange={(e) => handleChange(field.key, e.target.value)}
                                                className="w-full h-9 pl-2 pr-6 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer transition-all"
                                            >
                                                {field.options?.map((opt: string) => (
                                                    <option key={opt} value={opt}>
                                                        {opt === 'letter-cancellation' ? 'Harf Eleme' : 
                                                         opt === 'path-finding' ? 'Yol Takibi' : 
                                                         opt === 'visual-logic' ? 'Görsel Mantık' : opt}
                                                    </option>
                                                ))}
                                            </select>
                                            <i className="fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
                                        </div>
                                    ) : field.type === 'text' ? (
                                        <input
                                            type="text"
                                            placeholder={field.placeholder}
                                            value={options[field.key] || ''}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            className="w-full h-9 px-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-300"
                                        />
                                    ) : (
                                        <input
                                            type="number"
                                            min={field.min}
                                            max={field.max}
                                            value={options[field.key] || field.defaultValue}
                                            onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                                            className="w-full h-9 px-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    )}
                </div>

                {/* Manual Input Area */}
                {options.mode === 'manual' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Manuel Veri</span>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                        </div>
                        <textarea
                            className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-1 focus:ring-emerald-500 outline-none h-32 resize-none font-mono text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-200"
                            placeholder="Her satıra bir kelime veya virgülle ayırarak yazın..."
                            value={options.customInput}
                            onChange={(e) => handleChange('customInput', e.target.value)}
                        ></textarea>
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <i className="fa-solid fa-circle-info"></i> En az 2 öğe giriniz.
                        </p>
                    </div>
                )}
            </div>

            {/* 3. FOOTER - Sticky Bottom */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 space-y-2 z-20">
                {onOpenStudentModal && (
                    <button 
                        onClick={onOpenStudentModal}
                        className={`w-full py-1.5 rounded-lg border border-dashed transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider ${studentProfile ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-zinc-300 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600'}`}
                    >
                        <i className={`fa-solid ${studentProfile ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                        {studentProfile ? studentProfile.name : 'Öğrenci Bilgisi Ekle'}
                    </button>
                )}

                <button
                    onClick={() => onGenerate(options)}
                    disabled={isLoading || (options.mode === 'manual' && (!options.customInput || options.customInput.trim().length < 2))}
                    className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                    {isLoading ? (
                        <>
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            <span>Hazırlanıyor...</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            <span>OLUŞTUR</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};