import React, { useRef } from 'react';
import { GeneratorOptions } from '../../types';
import { TurkeyMapSVG } from '../sheets/visual/TurkeyMapSVG';

export const MapInstructionConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const regions = [
        { value: 'all', label: 'TÜRKİYE', icon: 'fa-globe' },
        { value: 'Marmara', label: 'MARMARA', icon: 'fa-water' },
        { value: 'Ege', label: 'EGE', icon: 'fa-sun' },
        { value: 'Akdeniz', label: 'AKDENİZ', icon: 'fa-umbrella-beach' },
        { value: 'İç Anadolu', label: 'İÇ ANADOLU', icon: 'fa-wheat-awn' },
        { value: 'Karadeniz', label: 'KARADENİZ', icon: 'fa-cloud-rain' },
        { value: 'Doğu Anadolu', label: 'DOĞU ANADOLU', icon: 'fa-mountain-sun' },
        { value: 'Güneydoğu', label: 'GÜNEYDOĞU', icon: 'fa-sun-plant-wilt' }
    ];

    const questionTypes = [
        { value: 'spatial_logic', label: 'Uzamsal Mantık', icon: 'fa-compass', desc: 'Yön + konum' },
        { value: 'linguistic_geo', label: 'Dilsel Coğrafya', icon: 'fa-spell-check', desc: 'Harf + bölge' },
        { value: 'attribute_search', label: 'Özellik Arama', icon: 'fa-filter', desc: 'Kıyı + nitelik' },
        { value: 'neighbor_path', label: 'Komşu Yolu', icon: 'fa-route', desc: 'İl → il takip' },
        { value: 'route_planning', label: 'Rota Planı', icon: 'fa-map-location-dot', desc: 'A→B rota çizme' }
    ];

    const difficulties = [
        { value: 'Başlangıç', label: 'K-1', desc: 'Sadece Konum', color: 'emerald' },
        { value: 'Orta', label: 'K-2', desc: 'Konum + Yön', color: 'blue' },
        { value: 'Zor', label: 'K-3', desc: 'Mantıksal Çıkarım', color: 'amber' },
        { value: 'Uzman', label: 'K-4', desc: 'Algoritmik İzleme', color: 'orange' },
        { value: 'Klinik', label: 'K-5', desc: 'Dikkat Testi', color: 'rose' }
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

    const toggleQuestionType = (type: string) => {
        const current: string[] = options.mapInstructionTypes || [];
        const updated = current.includes(type)
            ? current.filter(t => t !== type)
            : [...current, type];
        onChange('mapInstructionTypes', updated.length > 0 ? updated : ['spatial_logic']);
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
                            <span className="text-[8px] text-zinc-600 mt-1">veya standart Türkiye haritası kullanılır</span>
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

            {/* Bölgesel Odak — İnteraktif Harita Seçimi */}
            <div className="p-4 bg-blue-900/10 rounded-[2rem] border border-blue-800/30">
                <label className="text-[10px] font-black text-blue-400 uppercase mb-3 flex items-center justify-between tracking-widest">
                    <span><i className="fa-solid fa-map mr-2"></i>Bölgesel Odak</span>
                    {options.emphasizedRegion && options.emphasizedRegion !== 'all' && (
                        <button
                            onClick={() => onChange('emphasizedRegion', 'all')}
                            className="text-blue-400 hover:text-blue-300 text-[9px] bg-blue-900/30 px-2 py-1 rounded"
                        >
                            TÜM TÜRKİYE
                        </button>
                    )}
                </label>

                <div className={`relative w-full aspect-[2/1] bg-black/20 rounded-xl overflow-hidden border border-zinc-800/50 ${options.customInput ? 'opacity-30 pointer-events-none' : ''}`}>
                    <TurkeyMapSVG
                        emphasizedRegion={options.emphasizedRegion || 'all'}
                        interactive={!options.customInput}
                        onRegionClick={(r) => onChange('emphasizedRegion', r)}
                        showRegionLabels={false}
                    />

                    {!options.customInput && (!options.emphasizedRegion || options.emphasizedRegion === 'all') && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white/50 tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                SEÇMEK İÇİN BÖLGEYE TIKLAYIN
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Soru Tipleri */}
            <div className="p-4 bg-violet-900/10 rounded-[2rem] border border-violet-800/30">
                <label className="text-[10px] font-black text-violet-400 uppercase mb-3 block text-center tracking-widest">
                    <i className="fa-solid fa-puzzle-piece mr-2"></i>Soru Tipleri
                </label>
                <div className="space-y-2">
                    {questionTypes.map(qt => {
                        const isActive = (options.mapInstructionTypes || []).includes(qt.value);
                        return (
                            <button
                                key={qt.value}
                                onClick={() => toggleQuestionType(qt.value)}
                                className={`w-full py-2.5 px-4 rounded-xl text-left flex items-center gap-3 transition-all border ${isActive
                                    ? 'bg-violet-600/15 border-violet-500/40 text-violet-300'
                                    : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:border-violet-500/30'
                                    }`}
                            >
                                <i className={`fa-solid ${qt.icon} text-xs ${isActive ? 'text-violet-400' : 'text-zinc-600'}`}></i>
                                <div className="flex-1">
                                    <span className="text-[10px] font-black uppercase">{qt.label}</span>
                                    <span className="text-[8px] ml-2 opacity-60">{qt.desc}</span>
                                </div>
                                {isActive && <i className="fa-solid fa-check text-violet-400 text-xs"></i>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Zorluk Kademesi */}
            <div className="p-5 bg-zinc-800/50 rounded-[2.5rem] border border-zinc-700/50 space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase block text-center tracking-widest">
                    <i className="fa-solid fa-gauge-high mr-2"></i>Klinik Zorluk Kademesi
                </label>
                <div className="space-y-2">
                    {difficulties.map(d => (
                        <button
                            key={d.value}
                            onClick={() => onChange('difficulty', d.value)}
                            className={`w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all border ${options.difficulty === d.value
                                ? `bg-${d.color}-600/15 border-${d.color}-500/40 text-white shadow-lg`
                                : 'bg-zinc-900/50 border-zinc-700/30 text-zinc-500 hover:border-zinc-500'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-[11px] font-black ${options.difficulty === d.value ? `text-${d.color}-400` : 'text-zinc-600'}`}>{d.label}</span>
                                <span className="text-[10px] font-bold">{d.desc}</span>
                            </div>
                            {options.difficulty === d.value && <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>}
                        </button>
                    ))}
                </div>

                {/* Şehir İsimleri Toggle */}
                <div className="flex items-center justify-between px-2 pt-3 border-t border-zinc-700/30">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Şehir İsimleri</span>
                    <div
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${options.showCityNames !== false ? 'bg-indigo-600' : 'bg-zinc-600'}`}
                        onClick={() => onChange('showCityNames', options.showCityNames === false)}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${options.showCityNames !== false ? 'left-5' : 'left-0.5'}`}></div>
                    </div>
                </div>

                {/* İşaretçi Stili */}
                <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">İşaretçi</span>
                    <div className="flex gap-1.5">
                        {(['circle', 'star', 'target', 'dot', 'none'] as const).map(ms => (
                            <button
                                key={ms}
                                onClick={() => onChange('markerStyle', ms)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] transition-all ${(options.markerStyle || 'circle') === ms
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-zinc-800 text-zinc-500'
                                    }`}
                                title={ms}
                            >
                                {ms === 'circle' && '●'}
                                {ms === 'star' && '★'}
                                {ms === 'target' && '◎'}
                                {ms === 'dot' && '·'}
                                {ms === 'none' && '∅'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Harita Tipi */}
                <div className="flex items-center justify-between px-2 pt-3 border-t border-zinc-700/30">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Harita Tipi</span>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {(['turkey', 'world', 'treasure'] as const).map(type => (
                            <button key={type} onClick={() => onChange('mapType', type)} className={`flex-1 py-1 text-[10px] font-bold rounded-md ${options.mapType === type ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500'}`}>
                                {type === 'turkey' ? 'Türkiye' : type === 'world' ? 'Dünya' : 'Hazine'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pusula Eklensin mi? */}
                <div className="mt-4 pt-4 border-t border-zinc-700/30 flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-400 uppercase"><i className="fa-solid fa-compass text-sky-500 mr-2"></i> Pusula Eklensin mi?</span>
                    <div
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${options.includeCompass ? 'bg-indigo-600' : 'bg-zinc-600'}`}
                        onClick={() => onChange('includeCompass', !options.includeCompass)}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${options.includeCompass ? 'left-5' : 'left-0.5'}`}></div>
                    </div>
                </div>

                {/* Koordinat Izgarası (Grid) Açılsın mı? */}
                <div className="mt-4 pt-4 border-t border-zinc-700/30 flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-400 uppercase"><i className="fa-solid fa-border-all text-sky-500 mr-2"></i> Koordinat Izgarası (Grid) Açılsın mı?</span>
                    <div
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${options.useGridSystem ? 'bg-indigo-600' : 'bg-zinc-600'}`}
                        onClick={() => onChange('useGridSystem', !options.useGridSystem)}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${options.useGridSystem ? 'left-5' : 'left-0.5'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
