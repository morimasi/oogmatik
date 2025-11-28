
import React, { useState } from 'react';
import { Activity, GeneratorOptions, ActivityType } from '../types';

interface GeneratorViewProps {
    activity: Activity;
    onGenerate: (options: GeneratorOptions) => void;
    onBack: () => void;
    isLoading: boolean;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading }) => {
    const [options, setOptions] = useState<any>({
        worksheetCount: 1,
        mode: 'fast',
        difficulty: 'Orta',
        itemCount: 10
    });

    const handleChange = (key: string, value: any) => {
        setOptions((prev: any) => ({ ...prev, [key]: value }));
    };

    const getFields = (type: ActivityType) => {
        switch (type) {
            case ActivityType.CODE_READING:
                return [
                    { key: 'symbolType', label: 'Sembol Tipi', type: 'select', defaultValue: 'arrows', options: ['arrows', 'shapes', 'colors'], width: 'half' },
                    { key: 'codeLength', label: 'Kod Uzunluğu', type: 'number', defaultValue: 4, min: 3, max: 6, width: 'half' },
                    { key: 'itemCount', label: 'Soru Sayısı', type: 'number', defaultValue: 5, min: 3, max: 8, width: 'full' }
                ];
            // ... (other specific fields can be added here)
            default:
                return [
                    { key: 'difficulty', label: 'Zorluk Seviyesi', type: 'select', defaultValue: 'Orta', options: ['Başlangıç', 'Orta', 'Zor', 'Uzman'], width: 'half' },
                    { key: 'itemCount', label: 'Öğe Sayısı', type: 'number', defaultValue: 10, min: 1, max: 20, width: 'half' },
                    { key: 'topic', label: 'Konu (İsteğe Bağlı)', type: 'text', placeholder: 'Örn: Uzay, Doğa...', width: 'full' }
                ];
        }
    };

    const fields = getFields(activity.id);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                <button onClick={onBack} className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 mb-4 flex items-center">
                    <i className="fa-solid fa-arrow-left mr-2"></i> Geri
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-xl">
                        <i className={activity.icon}></i>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{activity.title}</h2>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{activity.description}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700 pb-2">Ayarlar</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Üretim Modu</label>
                            <div className="flex bg-zinc-100 dark:bg-zinc-700 p-1 rounded-lg">
                                <button
                                    onClick={() => handleChange('mode', 'fast')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${options.mode === 'fast' ? 'bg-white dark:bg-zinc-600 text-indigo-600 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                                >
                                    <i className="fa-solid fa-bolt mr-2"></i>Hızlı
                                </button>
                                <button
                                    onClick={() => handleChange('mode', 'ai')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${options.mode === 'ai' ? 'bg-white dark:bg-zinc-600 text-purple-600 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                                >
                                    <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Yapay Zeka
                                </button>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 ml-1">
                                {options.mode === 'fast' ? 'Şablon tabanlı, anında üretim.' : 'Yapay zeka ile özgün ve yaratıcı içerik.'}
                            </p>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Sayfa Sayısı</label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={options.worksheetCount}
                                onChange={(e) => handleChange('worksheetCount', parseInt(e.target.value))}
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {fields.map((field, idx) => (
                            <div key={idx} className={`col-span-2 ${field.width === 'half' ? 'sm:col-span-1' : ''}`}>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{field.label}</label>
                                {field.type === 'select' ? (
                                    <select
                                        value={options[field.key] || field.defaultValue}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                        className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {field.options?.map((opt: string) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        min={field.min}
                                        max={field.max}
                                        placeholder={field.placeholder}
                                        value={options[field.key] || (field.defaultValue !== undefined ? field.defaultValue : '')}
                                        onChange={(e) => handleChange(field.key, field.type === 'number' ? parseInt(e.target.value) : e.target.value)}
                                        className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                <button
                    onClick={() => onGenerate(options)}
                    disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <i className="fa-solid fa-circle-notch fa-spin"></i> Hazırlanıyor...
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-print"></i> Oluştur
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
