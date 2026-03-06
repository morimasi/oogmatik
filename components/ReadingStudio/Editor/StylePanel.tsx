
import React from 'react';
import { useReadingStudio } from '../../../context/ReadingStudioContext';

export const StylePanel = () => {
    const { layout, selectedId, updateComponent } = useReadingStudio();

    const selectedItem = layout.find((item: any) => item.instanceId === selectedId);

    if (!selectedItem) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700 mb-4 border border-zinc-800">
                    <i className="fa-solid fa-i-cursor text-2xl"></i>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Bileşen Seçilmedi</p>
                <p className="text-[10px] text-zinc-600 mt-2 italic">Düzenlemek istediğiniz bloğa tıklayın.</p>
            </div>
        );
    }

    const s = selectedItem.style;

    const updateStyle = (updates: any) => {
        updateComponent(selectedItem.instanceId, {
            style: { ...s, ...updates }
        }, true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <i className="fa-solid fa-palette text-xs"></i>
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Stil Ayarları</h3>
            </div>

            {/* Typography Section */}
            <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-font"></i> Tipografi
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Yazı Tipi</label>
                        <select
                            value={s.fontFamily}
                            onChange={(e: any) => updateStyle({ fontFamily: e.target.value })}
                            className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-2.5 text-xs text-white"
                        >
                            <option value="OpenDyslexic">OpenDyslexic</option>
                            <option value="Inter">Inter</option>
                            <option value="Comic Sans MS">Comic Sans</option>
                            <option value="Roboto">Roboto</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Boyut</label>
                        <input
                            type="number"
                            value={s.fontSize}
                            onChange={(e: any) => updateStyle({ fontSize: parseInt(e.target.value) })}
                            className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-2.5 text-xs text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Satır Aralığı</label>
                        <input
                            type="number" step="0.1"
                            value={s.lineHeight}
                            onChange={(e: any) => updateStyle({ lineHeight: parseFloat(e.target.value) })}
                            className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-2.5 text-xs text-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Hizalama</label>
                        <div className="flex bg-zinc-900 border border-zinc-700/50 rounded-xl overflow-hidden p-0.5">
                            {['left', 'center', 'right'].map((align: any) => (
                                <button
                                    key={align}
                                    onClick={() => updateStyle({ textAlign: align })}
                                    className={`flex-1 py-1.5 text-[10px] rounded-lg transition-all ${s.textAlign === align ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <i className={`fa-solid fa-align-${align}`}></i>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Colors & Appearance Section */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-droplet"></i> Görünüm
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Yazı Rengi</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={s.color}
                                onChange={(e: any) => updateStyle({ color: e.target.value })}
                                className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/50 overflow-hidden cursor-pointer"
                            />
                            <input
                                type="text"
                                value={s.color}
                                onChange={(e: any) => updateStyle({ color: e.target.value })}
                                className="flex-1 bg-zinc-900 border border-zinc-700/50 rounded-xl p-2 text-[10px] text-zinc-400 font-mono"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Arka Plan</label>
                        <input
                            type="color"
                            value={s.backgroundColor === 'transparent' ? '#ffffff' : s.backgroundColor}
                            onChange={(e: any) => updateStyle({ backgroundColor: e.target.value })}
                            className="w-full h-10 rounded-xl bg-zinc-900 border border-zinc-700/50 overflow-hidden cursor-pointer"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Köşe Karakteri (Radius)</label>
                    <input
                        type="range" min="0" max="40"
                        value={s.borderRadius}
                        onChange={(e: any) => updateStyle({ borderRadius: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-2"
                    />
                </div>
            </div>

            {/* Layout Section */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-arrows-up-down-left-right"></i> Boyut ve Yerleşim
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Genişlik (px)</label>
                        <input
                            type="number"
                            value={s.w}
                            onChange={(e: any) => updateStyle({ w: parseInt(e.target.value) })}
                            className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-2.5 text-xs text-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Döndürme (Derece)</label>
                        <input
                            type="number"
                            value={s.rotation || 0}
                            onChange={(e: any) => updateStyle({ rotation: parseInt(e.target.value) })}
                            className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-2.5 text-xs text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Kenarlık (px)</label>
                        <input
                            type="number" min="0" max="10"
                            value={s.borderWidth}
                            onChange={(e: any) => updateStyle({ borderWidth: parseInt(e.target.value) })}
                            className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-2.5 text-xs text-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Gölge (Shadow)</label>
                        <select
                            value={s.boxShadow || 'none'}
                            onChange={(e: any) => updateStyle({ boxShadow: e.target.value })}
                            className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-2.5 text-xs text-white"
                        >
                            <option value="none">Yok</option>
                            <option value="sm">Hafif</option>
                            <option value="md">Orta</option>
                            <option value="lg">Belirgin</option>
                            <option value="xl">Büyük</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Şeffaflık (%)</label>
                        <input
                            type="range" min="0" max="100"
                            value={(s.opacity || 1) * 100}
                            onChange={(e: any) => updateStyle({ opacity: parseInt(e.target.value) / 100 })}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-2"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Katman (Z-Index)</label>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateStyle({ zIndex: Math.max(0, (s.zIndex || 1) - 1) })} className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-800"><i className="fa-solid fa-minus text-xs"></i></button>
                            <span className="flex-1 text-center font-bold text-sm text-white">{s.zIndex || 1}</span>
                            <button onClick={() => updateStyle({ zIndex: (s.zIndex || 1) + 1 })} className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-800"><i className="fa-solid fa-plus text-xs"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
