
import React, { useState, useEffect } from 'react';
import { Activity, ActivityType, GeneratorOptions } from '../types';

interface OptionField {
    key: string;
    label: string;
    type: 'number' | 'text' | 'select' | 'checkbox';
    defaultValue: any;
    min?: number;
    max?: number;
    options?: string[];
    width?: 'full' | 'half';
    description?: string;
}

interface GeneratorViewProps {
    activity: Activity;
    onGenerate: (options: GeneratorOptions) => void;
    onBack: () => void;
    isLoading: boolean;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading }) => {
    const [formValues, setFormValues] = useState<any>({});

    const getFields = (type: ActivityType): OptionField[] => {
        switch (type) {
            case ActivityType.FAMILY_RELATIONS:
                return [
                    { key: 'itemCount', label: 'Soru Sayısı', type: 'number', defaultValue: 10, min: 5, max: 20, width: 'half' },
                    { key: 'topic', label: 'Tema', type: 'text', defaultValue: 'Akrabalık', width: 'half', description: 'Örn: Akrabalık, Eş Anlam' }
                ];
            case ActivityType.LOGIC_DEDUCTION:
                return [
                    { key: 'itemCount', label: 'Soru Sayısı', type: 'number', defaultValue: 4, min: 2, max: 8, width: 'full' },
                    { key: 'topic', label: 'Kategori', type: 'text', defaultValue: 'Karışık', width: 'full', description: 'Örn: Meyve, Eşya, Hayvan' }
                ];
            case ActivityType.NUMBER_BOX_LOGIC:
                return [
                    { key: 'itemCount', label: 'Soru Grubu Sayısı', type: 'number', defaultValue: 2, min: 1, max: 4, width: 'half' },
                    { key: 'numberRange', label: 'Sayı Aralığı', type: 'select', defaultValue: '1-20', width: 'half', options: ['1-20', '1-50', '1-100'] }
                ];
            case ActivityType.MAP_INSTRUCTION:
                return [
                    { key: 'itemCount', label: 'Yönerge Sayısı', type: 'number', defaultValue: 8, min: 4, max: 12, width: 'full' }
                ];
            case ActivityType.NUMBER_GROUPING:
                return [
                    { key: 'groupCount', label: 'Grup Sayısı (Kaç tabak?)', type: 'number', defaultValue: 3, min: 2, max: 5, width: 'half' },
                    { key: 'groupSize', label: 'Nesne Sayısı (Her tabakta?)', type: 'number', defaultValue: 4, min: 2, max: 6, width: 'half' },
                    { key: 'visualType', label: 'Görsel Tipi', type: 'select', defaultValue: 'objects', options: ['objects', 'dice', 'blocks'], width: 'full' }
                ];
            case ActivityType.TIME_MEASUREMENT_GEOMETRY:
                return [
                    { key: 'subType', label: 'Alt Kategori', type: 'select', defaultValue: 'time', options: ['time', 'money', 'measurement', 'geometry'], width: 'full' },
                    { key: 'difficulty', label: 'Zorluk', type: 'select', defaultValue: 'Başlangıç', options: ['Başlangıç', 'Orta', 'Zor'], width: 'full' }
                ];
            case ActivityType.FRACTIONS_DECIMALS:
                return [
                    { key: 'conceptType', label: 'Kavram', type: 'select', defaultValue: 'fraction', options: ['fraction', 'decimal', 'percentage'], width: 'half', description: 'Kesir, Ondalık veya Yüzde' },
                    { key: 'visualStyle', label: 'Görsel Model', type: 'select', defaultValue: 'pie', options: ['pie', 'bar', 'grid'], width: 'half', description: 'Pasta, Şerit veya 100\'lük Tablo' },
                    { key: 'difficulty', label: 'Zorluk', type: 'select', defaultValue: 'Orta', options: ['Başlangıç', 'Orta', 'Zor'], width: 'full' }
                ];
            case ActivityType.SPATIAL_REASONING:
                return [
                    { key: 'concept', label: 'Görev Tipi', type: 'select', defaultValue: 'count-cubes', options: ['count-cubes', 'copy', 'path'], width: 'full', description: 'Küp Sayma, Desen Kopyalama veya Yön Takibi' },
                    { key: 'gridSize', label: 'Izgara Boyutu', type: 'number', defaultValue: 4, min: 3, max: 6, width: 'half' },
                    { key: 'difficulty', label: 'Karmaşıklık', type: 'select', defaultValue: 'Orta', options: ['Başlangıç', 'Orta', 'Zor'], width: 'half' }
                ];
            case ActivityType.VISUAL_ARITHMETIC:
                return [
                    { key: 'operation', label: 'İşlem Türü', type: 'select', defaultValue: 'addition', options: ['addition', 'subtraction', 'multiplication'], width: 'half' },
                    { key: 'visualStyle', label: 'Görsel Model', type: 'select', defaultValue: 'objects', options: ['objects', 'ten-frame', 'number-bond', 'dice'], width: 'half', description: 'Nesne, 10\'luk Çerçeve, Sayı Bağı, Domino' },
                    { key: 'numberRange', label: 'Sayı Aralığı', type: 'select', defaultValue: '1-10', options: ['1-10', '1-20'], width: 'full' }
                ];
            // Default fields for other activities can be customized here
            default:
                return [
                    { key: 'difficulty', label: 'Zorluk Seviyesi', type: 'select', defaultValue: 'Orta', options: ['Başlangıç', 'Orta', 'Zor', 'Uzman'], width: 'full' },
                    // worksheetCount is handled globally below to ensure consistent 1-20 range
                    { key: 'topic', label: 'Konu (Opsiyonel)', type: 'text', defaultValue: '', width: 'full', description: 'Örn: Doğa, Okul, Uzay' }
                ];
        }
    };

    // Initialize form values when activity changes
    useEffect(() => {
        const fields = getFields(activity.id);
        const defaults: any = {};
        fields.forEach(f => defaults[f.key] = f.defaultValue);
        
        // Ensure common defaults are set if not in specific fields
        if (!defaults.difficulty) defaults.difficulty = 'Orta';
        if (!defaults.worksheetCount) defaults.worksheetCount = 1;
        if (!defaults.mode) defaults.mode = 'fast'; // Default mode
        
        setFormValues(defaults);
    }, [activity]);

    const handleChange = (key: string, value: any) => {
        setFormValues((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        onGenerate(formValues);
    };

    const fields = getFields(activity.id);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
                <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <h2 className="font-bold text-lg truncate">{activity.title}</h2>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm text-indigo-800 dark:text-indigo-200 mb-4 border border-indigo-100 dark:border-indigo-800">
                    {activity.description}
                </div>

                {/* Generation Mode Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">Üretim Modu</label>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                        <button 
                            onClick={() => handleChange('mode', 'fast')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formValues.mode === 'fast' ? 'bg-white dark:bg-zinc-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400'}`}
                        >
                            <i className="fa-solid fa-bolt mr-2"></i>Hızlı Mod
                        </button>
                        <button 
                            onClick={() => handleChange('mode', 'ai')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formValues.mode === 'ai' ? 'bg-white dark:bg-zinc-700 shadow text-purple-600 dark:text-purple-400' : 'text-zinc-500 dark:text-zinc-400'}`}
                        >
                            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Yapay Zeka
                        </button>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 px-1">
                        {formValues.mode === 'fast' ? 'Şablon tabanlı anında üretim (Offline çalışır).' : 'Yapay zeka ile özgün içerik üretimi (İnternet gerekir).'}
                    </p>
                </div>

                {fields.filter(f => f.key !== 'worksheetCount').map(field => (
                    <div key={field.key} className={`mb-3 ${field.width === 'half' ? 'inline-block w-[48%] mr-[2%] last:mr-0' : 'w-full'}`}>
                        <label className="block text-sm font-bold mb-1 text-zinc-700 dark:text-zinc-300">{field.label}</label>
                        {field.type === 'select' ? (
                            <select 
                                value={formValues[field.key]} 
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            >
                                {field.options?.map(opt => <option key={opt} value={opt}>{
                                    opt === 'time' ? 'Zaman (Saatler)' : 
                                    opt === 'money' ? 'Para (TL)' : 
                                    opt === 'measurement' ? 'Ölçme (Uzunluk)' : 
                                    opt === 'geometry' ? 'Geometri' : 
                                    opt === 'count-cubes' ? 'Küp Sayma (3D)' :
                                    opt === 'copy' ? 'Desen Kopyalama' :
                                    opt === 'path' ? 'Yön Takibi' : 
                                    opt === 'fraction' ? 'Kesir' :
                                    opt === 'decimal' ? 'Ondalık Sayı' :
                                    opt === 'percentage' ? 'Yüzde (%)' :
                                    opt === 'pie' ? 'Pasta Grafiği' :
                                    opt === 'bar' ? 'Şerit Model' :
                                    opt === 'grid' ? '100\'lük Tablo' : 
                                    opt === 'addition' ? 'Toplama' :
                                    opt === 'subtraction' ? 'Çıkarma' :
                                    opt === 'multiplication' ? 'Çarpma' :
                                    opt === 'objects' ? 'Nesneler (Standart)' :
                                    opt === 'ten-frame' ? '10\'luk Çerçeve' :
                                    opt === 'number-bond' ? 'Sayı Bağı (Parça-Bütün)' :
                                    opt === 'dice' ? 'Domino / Zar' : opt
                                }</option>)}
                            </select>
                        ) : field.type === 'number' ? (
                            <input 
                                type="number" 
                                value={formValues[field.key]}
                                min={field.min}
                                max={field.max}
                                onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        ) : (
                            <input 
                                type="text" 
                                value={formValues[field.key]}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        )}
                        {field.description && <p className="text-xs text-zinc-400 mt-1">{field.description}</p>}
                    </div>
                ))}
                
                {/* Default fields if not present in custom fields */}
                {!fields.find(f => f.key === 'difficulty') && (
                     <div className="mb-3">
                        <label className="block text-sm font-bold mb-1 text-zinc-700 dark:text-zinc-300">Zorluk Seviyesi</label>
                        <select 
                            value={formValues.difficulty} 
                            onChange={(e) => handleChange('difficulty', e.target.value)}
                            className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        >
                            <option value="Başlangıç">Başlangıç</option>
                            <option value="Orta">Orta</option>
                            <option value="Zor">Zor</option>
                            <option value="Uzman">Uzman</option>
                        </select>
                    </div>
                )}

                {/* GLOBAL WORKSHEET COUNT - VARIATIONS */}
                <div className="mb-3 p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                    <label className="block text-sm font-bold mb-2 text-indigo-600 dark:text-indigo-400 flex justify-between items-center">
                        <span><i className="fa-solid fa-layer-group mr-2"></i>Çalışma Sayısı (Varyasyon)</span>
                        <span className="bg-white dark:bg-zinc-700 px-2 py-0.5 rounded border text-xs shadow-sm">{formValues.worksheetCount} Adet</span>
                    </label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            step="1"
                            value={formValues.worksheetCount}
                            onChange={(e) => handleChange('worksheetCount', parseInt(e.target.value))}
                            className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <input 
                            type="number" 
                            value={formValues.worksheetCount}
                            min={1}
                            max={20}
                            onChange={(e) => handleChange('worksheetCount', Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="w-16 p-2 text-center border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                        />
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">
                        Seçilen sayıda, birbirinden farklı içeriğe sahip etkinlik üretilir. <strong>Yazdırırken kağıt tasarrufu için sığabildiği kadar etkinlik bir sayfaya yerleştirilir ve gerekirse sonraki sayfaya taşar.</strong>
                    </p>
                </div>

            </div>

            {/* Actions */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                <button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex justify-center items-center gap-2 transition-all active:scale-95"
                >
                    {isLoading ? (
                        <>
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            Hazırlanıyor...
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-print"></i>
                            Etkinlik Oluştur ({formValues.worksheetCount} Adet)
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
