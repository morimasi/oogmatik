
import React, { useRef } from 'react';
import { GeneratorOptions } from '../../types';

export const MapInstructionConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const regions = [
        { value: 'all', label: 'TÜRKİYE' },
        { value: 'Marmara', label: 'MARMARA' },
        { value: 'Ege', label: 'EGE' },
        { value: 'Akdeniz', label: 'AKDENİZ' },
        { value: 'Karadeniz', label: 'KARADENİZ' },
        { value: 'İç Anadolu', label: 'İÇ ANADOLU' }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onChange('customInput', event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Manuel Harita Yükleme */}
            <div className="p-4 bg-indigo-900/20 rounded-[2rem] border border-indigo-500/30">
                <label className="text-[10px] font-black text-indigo-400 uppercase mb-3 block text-center tracking-widest">
                    <i className="fa-solid fa-upload mr-2"></i>Özel Harita / Kroki
                </label>
                
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video border-2 border-dashed border-indigo-500/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-500/10 transition-all group overflow-hidden"
                >
                    {options.customInput ? (
                        <div className="relative w-full h-full">
                            <img src={options.customInput} className="w-full h-full object-cover" alt="Custom Map" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[10px] font-bold text-white">DEĞİŞTİR</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <i className="fa-solid fa-map-location-dot text-2xl text-indigo-500/40 mb-2 group-hover:scale-110 transition-transform"></i>
                            <span className="text-[10px] font-bold text-zinc-500 text-center px-4">Görsel Yükle (JPG/PNG)</span>
                        </>
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                
                {options.customInput && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onChange('customInput', undefined); }}
                        className="w-full mt-3 py-1.5 text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-colors"
                    >
                        Görseli Kaldır
                    </button>
                )}
            </div>

            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-800/30">
                <label className="text-[10px] font-black text-blue-600 uppercase mb-3 block text-center">Bölgesel Odak (Hazır Harita)</label>
                <div className="grid grid-cols-2 gap-2">
                    {regions.map(r => (
                        <button 
                            key={r.value}
                            onClick={() => onChange('emphasizedRegion', r.value)}
                            disabled={!!options.customInput}
                            className={`py-2 rounded-xl text-[10px] font-black border transition-all ${options.emphasizedRegion === r.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'} ${options.customInput ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block">Yönerge Karmaşıklığı</label>
                    <select 
                        value={options.difficulty} 
                        onChange={e => onChange('difficulty', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-500"
                    >
                        <option value="Başlangıç">Sadece Konum</option>
                        <option value="Orta">Konum + Yön</option>
                        <option value="Zor">Mantıksal Çıkarım</option>
                        <option value="Uzman">Tam Algoritmik İzleme</option>
                    </select>
                </div>
                
                <div className="flex items-center justify-between p-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Şehir İsimleri</span>
                    <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${options.showCityNames !== false ? 'bg-indigo-600' : 'bg-zinc-300'}`} onClick={() => onChange('showCityNames', options.showCityNames === false)}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${options.showCityNames !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
