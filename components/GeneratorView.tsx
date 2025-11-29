
import React, { useState, useEffect } from 'react';
import { Activity, GeneratorOptions, ActivityType } from '../types';
import { statsService } from '../services/statsService';

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

    const getFields = (type: ActivityType) => {
        switch (type) {
            case 'CODE_READING':
                return [
                    { key: 'symbolType', label: 'Sembol Tipi', type: 'select', defaultValue: 'arrows', options: ['arrows', 'shapes', 'colors'], width: 'half' },
                    { key: 'codeLength', label: 'Kod Uzunluğu', type: 'number', defaultValue: 4, min: 3, max: 6, width: 'half' },
                    { key: 'itemCount', label: 'Soru Sayısı', type: 'number', defaultValue: 5, min: 3, max: 8, width: 'full' }
                ];
            case 'ATTENTION_TO_QUESTION':
                return [
                    { key: 'subType', label: 'Alt Tip', type: 'select', defaultValue: 'letter-cancellation', options: ['letter-cancellation', 'path-finding', 'visual-logic'], width: 'full' },
                    { key: 'gridSize', label: 'Izgara Boyutu (Sadece Harf)', type: 'number', defaultValue: 10, min: 5, max: 15, width: 'half' },
                    { key: 'itemCount', label: 'Soru Sayısı', type: 'number', defaultValue: 4, min: 1, max: 10, width: 'half' }
                ];
            case 'ATTENTION_DEVELOPMENT':
                return [
                    { key: 'difficulty', label: 'Zorluk Seviyesi', type: 'select', defaultValue: 'Orta', options: ['Başlangıç', 'Orta', 'Zor', 'Uzman'], width: 'half' },
                    { key: 'concept', label: 'Konsept', type: 'select', defaultValue: 'numeric', options: ['numeric', 'verbal'], width: 'half' },
                    { key: 'itemCount', label: 'Soru Sayısı', type: 'number', defaultValue: 4, min: 1, max: 6, width: 'full' }
                ];
            default:
                return [
                    { key: 'difficulty', label: 'Zorluk Seviyesi', type: 'select', defaultValue: 'Orta', options: ['Başlangıç', 'Orta', 'Zor', 'Uzman'], width: 'half' },
                    { key: 'itemCount', label: 'Öğe Sayısı', type: 'number', defaultValue: 10, min: 1, max: 50, width: 'half' },
                    { key: 'topic', label: 'Konu (İsteğe Bağlı)', type: 'text', placeholder: 'Örn: Uzay, Doğa...', width: 'full' }
                ];
        }
    };

    const fields = getFields(activity.id);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex justify-between items-start">
                    <button onClick={onBack} className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 mb-4 flex items-center">
                        <i className="fa-solid fa-arrow-left mr-2"></i> Geri
                    </button>
                    <button 
                        onClick={handleToggleFavorite}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isFavorite ? 'bg-rose-100 text-rose-500' : 'bg-zinc-200 text-zinc-400 hover:bg-zinc-300'}`}
                        title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                    >
                        <i className={`fa-solid fa-heart ${isFavorite ? 'animate-pulse' : ''}`}></i>
                    </button>
                </div>
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
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Üretim Modu</label>
                            <div className="flex bg-zinc-100 dark:bg-zinc-700 p-1 rounded-xl">
                                <button
                                    onClick={() => handleChange('mode', 'fast')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${options.mode === 'fast' ? 'bg-white dark:bg-zinc-600 text-indigo-600 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                                >
                                    <i className="fa-solid fa-bolt mr-2"></i>Hızlı
                                </button>
                                <button
                                    onClick={() => handleChange('mode', 'ai')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${options.mode === 'ai' ? 'bg-white dark:bg-zinc-600 text-purple-600 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                                >
                                    <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Yapay Zeka
                                </button>
                                <button
                                    onClick={() => handleChange('mode', 'manual')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${options.mode === 'manual' ? 'bg-white dark:bg-zinc-600 text-emerald-600 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                                >
                                    <i className="fa-solid fa-keyboard mr-2"></i>Manuel
                                </button>
                            </div>
                            <p className="text-xs text-zinc-400 mt-2 ml-1">
                                {options.mode === 'fast' ? 'Şablon tabanlı, anında üretim.' : options.mode === 'ai' ? 'Yapay zeka ile özgün ve yaratıcı içerik.' : 'Kendi kelime veya sayılarınızı girerek içerik oluşturun.'}
                            </p>
                        </div>

                        {options.mode === 'manual' && (
                            <div className="col-span-2 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    <i className="fa-solid fa-list-ul mr-1 text-emerald-500"></i> İçerik Girişi
                                </label>
                                <textarea
                                    className="w-full p-4 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none font-mono text-sm"
                                    placeholder="Kelimeleri veya sayıları virgül ile ayırarak giriniz.&#10;Örnek: Elma, Armut, Kiraz, Kavun"
                                    value={options.customInput}
                                    onChange={(e) => handleChange('customInput', e.target.value)}
                                ></textarea>
                                <p className="text-xs text-zinc-400 mt-1">Öğeler virgül (,) veya yeni satır ile ayrılmalıdır.</p>
                            </div>
                        )}

                        <div className="col-span-2 sm:col-span-1 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800">
                            <label className="block text-sm font-bold text-emerald-800 dark:text-emerald-200 mb-1">
                                <i className="fa-solid fa-copy mr-1"></i> Adet (Varyasyon)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={options.worksheetCount}
                                onChange={(e) => handleChange('worksheetCount', parseInt(e.target.value))}
                                className="w-full p-2 border border-emerald-300 dark:border-emerald-700 rounded-md bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-center"
                            />
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Kaç adet farklı çalışma üretilsin?</p>
                        </div>

                        {options.mode !== 'manual' && fields.map((field, idx) => (
                            <div key={idx} className={`col-span-2 ${field.width === 'half' ? 'sm:col-span-1' : ''}`}>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{field.label}</label>
                                {field.type === 'select' ? (
                                    <select
                                        value={options[field.key] || field.defaultValue}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                        className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {field.options?.map((opt: string) => (
                                            <option key={opt} value={opt}>{opt === 'letter-cancellation' ? 'Harf Eleme (Şifre)' : opt === 'path-finding' ? 'Yol Takibi (Yıldız)' : opt === 'visual-logic' ? 'Görsel Mantık (Şekil)' : opt === 'numeric' ? 'Sayısal Mantık' : opt === 'verbal' ? 'Sözel Mantık' : opt}</option>
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
                    disabled={isLoading || (options.mode === 'manual' && (!options.customInput || options.customInput.trim().length < 2))}
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
