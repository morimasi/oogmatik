import React, { useRef } from 'react';
import { GeneratorOptions } from '../../types';

interface ArchCloneConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: any) => void;
}

const BLUEPRINT_TEMPLATES = [
    { id: 'cloze', label: 'Boşluk Doldurma', icon: 'fa-pen-nib' },
    { id: 'match', label: 'Sütun Eşleştirme', icon: 'fa-link' },
    { id: 'sort', label: 'Kategorik Sınıflandırma', icon: 'fa-layer-group' },
    { id: 'table', label: 'Tablo/Matris', icon: 'fa-table-cells' },
    { id: 'logic', label: 'Mantık Kartları', icon: 'fa-brain' }
];

const THEMES = [
    { id: 'TR', label: 'Türkçe', icon: 'fa-book-open' },
    { id: 'MATH', label: 'Matematik', icon: 'fa-calculator' },
    { id: 'FEN', label: 'Fen Bilimleri', icon: 'fa-flask' },
    { id: 'SOS', label: 'Sosyal Bilgiler', icon: 'fa-globe' },
    { id: 'LOGIC', label: 'Bilişsel Beceri', icon: 'fa-puzzle-piece' }
];

export const ArchCloneConfig: React.FC<ArchCloneConfigProps> = ({ options, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            onChange('customInput', ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        onChange('customInput', undefined);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

            {/* Kaynak Seçimi: Şablon veya Görsel */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-700">
                <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-3 tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-microchip"></i> Klon Kaynağı
                </h4>

                <div className="flex gap-2 p-1 bg-zinc-200/50 dark:bg-zinc-900/50 rounded-xl mb-4">
                    <button
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!options.customInput ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                        onClick={() => clearImage()}
                    >
                        Hazır Blueprint
                    </button>
                    <button
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${options.customInput ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Görselden Klonla
                    </button>
                </div>

                {!options.customInput ? (
                    <div className="grid grid-cols-2 gap-2">
                        {BLUEPRINT_TEMPLATES.map(temp => (
                            <button
                                key={temp.id}
                                onClick={() => onChange('variant', temp.id)}
                                className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col gap-2 ${options.variant === temp.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 bg-white dark:bg-zinc-900/50'}`}
                            >
                                <i className={`fa-solid ${temp.icon} ${options.variant === temp.id ? 'text-indigo-500' : 'text-zinc-400'} text-lg`}></i>
                                <span className="text-[10px] font-bold leading-tight uppercase text-zinc-700 dark:text-zinc-300">{temp.label}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-indigo-300 bg-indigo-50/50 min-h-[120px] flex items-center justify-center p-2 group">
                        <img src={options.customInput} alt="Klon Kaynağı" className="max-h-[200px] object-contain rounded-xl opacity-80" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={clearImage} className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>

            {/* İçerik Ayarları */}
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Ders / Alan</label>
                    <div className="flex flex-wrap gap-2">
                        {THEMES.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => onChange('topic', theme.id)}
                                className={`px-4 py-2.5 rounded-xl border-2 font-bold text-xs flex items-center gap-2 transition-all ${options.topic === theme.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'}`}
                            >
                                <i className={`fa-solid ${theme.icon}`}></i>
                                {theme.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">İstediğiniz Konu İçeriği</label>
                    <textarea
                        value={options.concept || ''}
                        onChange={e => onChange('concept', e.target.value)}
                        placeholder="Örn: Hücrenin yapısı, Kesirlerle toplama işlemi, Yakın anlamlı sözcükler..."
                        className="w-full p-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium resize-none focus:border-indigo-500 outline-none transition-colors min-h-[80px]"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Soru / Öğe Sayısı</label>
                    <input
                        type="number"
                        min={3} max={20}
                        value={options.itemCount}
                        onChange={e => onChange('itemCount', parseInt(e.target.value))}
                        className="w-full p-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>

            {options.customInput && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start animate-in zoom-in-95">
                    <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5"></i>
                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                        Görsel yüklendiğinde AI önce görselin mimari şemasını (blueprint) çıkarır, ardından girdiğiniz konu odağına uygun yeni sorular yerleştirecektir.
                    </p>
                </div>
            )}
        </div>
    );
};
