
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { printService, PrintSettings } from '../utils/printService';

interface PrintSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTitle: string;
}

export const PrintSettingsModal: React.FC<PrintSettingsModalProps> = ({ isOpen, onClose, defaultTitle }) => {
    const [settings, setSettings] = useState<PrintSettings>({
        title: defaultTitle,
        showStudentInfo: true,
        showTitle: true,
        showInstructions: true,
        showWatermark: true,
        showPageNumbers: true,
        scale: 100,
        ecoMode: false,
        includeAnswerKeyPlaceholder: false,
        copies: 1,
        orientation: 'portrait'
    });

    if (!isOpen) return null;

    const handlePrint = () => {
        printService.printWorksheet(settings);
    };

    // Use Portal to render outside of parent container stacking contexts
    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden transform transition-all scale-100 max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-print text-indigo-600"></i> Yazdırma Merkezi
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Belge düzeni ve baskı ayarlarını yapılandırın.</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Left Column: Basic Info & Scale */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Belge Başlığı</label>
                                <input 
                                    type="text" 
                                    value={settings.title}
                                    onChange={(e) => setSettings({...settings, title: e.target.value})}
                                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-zinc-900 dark:text-white font-medium transition-all"
                                    placeholder="Belge Adı"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Sayfa Yönü</label>
                                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                                    <button 
                                        onClick={() => setSettings({...settings, orientation: 'portrait'})}
                                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${settings.orientation === 'portrait' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400 ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-700'}`}
                                    >
                                        <i className="fa-regular fa-file"></i> Dikey
                                    </button>
                                    <button 
                                        onClick={() => setSettings({...settings, orientation: 'landscape'})}
                                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${settings.orientation === 'landscape' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400 ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-700'}`}
                                    >
                                        <i className="fa-regular fa-file fa-rotate-90"></i> Yatay
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Sayfa Ölçeği</label>
                                    <span className="text-xs font-mono font-bold bg-zinc-100 px-2 rounded text-zinc-700">{settings.scale}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="50" 
                                    max="150" 
                                    step="5"
                                    value={settings.scale}
                                    onChange={(e) => setSettings({...settings, scale: parseInt(e.target.value)})}
                                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                    <span>Küçük (%50)</span>
                                    <span>Büyük (%150)</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Visibility & Toggles */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Görünüm Seçenekleri</label>
                            
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { key: 'showStudentInfo', label: 'Öğrenci Bilgisi', icon: 'fa-user-graduate' },
                                    { key: 'showTitle', label: 'Ana Başlık', icon: 'fa-heading' },
                                    { key: 'showInstructions', label: 'Yönergeler', icon: 'fa-info-circle' },
                                    { key: 'showWatermark', label: 'Filigran', icon: 'fa-stamp' },
                                    { key: 'showPageNumbers', label: 'Sayfa No', icon: 'fa-list-ol' },
                                ].map((opt) => (
                                    <div 
                                        key={opt.key}
                                        onClick={() => setSettings({...settings, [opt.key]: !settings[opt.key as keyof PrintSettings]})}
                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${settings[opt.key as keyof PrintSettings] ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-900 dark:text-indigo-300' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 text-zinc-500'}`}
                                    >
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${settings[opt.key as keyof PrintSettings] ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-300 bg-white'}`}>
                                            {settings[opt.key as keyof PrintSettings] && <i className="fa-solid fa-check text-[10px]"></i>}
                                        </div>
                                        <span className="text-xs font-bold flex items-center gap-2"><i className={`fa-solid ${opt.icon}`}></i> {opt.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-zinc-100 dark:border-zinc-800 my-3"></div>

                            <div 
                                onClick={() => setSettings({...settings, ecoMode: !settings.ecoMode})}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${settings.ecoMode ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${settings.ecoMode ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                                        <i className="fa-solid fa-leaf"></i>
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${settings.ecoMode ? 'text-emerald-900 dark:text-emerald-300' : 'text-zinc-600 dark:text-zinc-400'}`}>Eco Mode</p>
                                        <p className="text-[10px] text-zinc-500">Mürekkep tasarrufu</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${settings.ecoMode ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300'}`}>
                                    {settings.ecoMode && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                                </div>
                            </div>

                            <div 
                                onClick={() => setSettings({...settings, includeAnswerKeyPlaceholder: !settings.includeAnswerKeyPlaceholder})}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${settings.includeAnswerKeyPlaceholder ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${settings.includeAnswerKeyPlaceholder ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-400'}`}>
                                        <i className="fa-solid fa-note-sticky"></i>
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${settings.includeAnswerKeyPlaceholder ? 'text-amber-900 dark:text-amber-300' : 'text-zinc-600 dark:text-zinc-400'}`}>Not Sayfası</p>
                                        <p className="text-[10px] text-zinc-500">Sona boş sayfa ekler</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${settings.includeAnswerKeyPlaceholder ? 'border-amber-500 bg-amber-500' : 'border-zinc-300'}`}>
                                    {settings.includeAnswerKeyPlaceholder && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
                    <div className="text-xs text-zinc-500">
                        <i className="fa-solid fa-circle-info mr-1"></i>
                        Tarayıcı yazdırma penceresi açılacaktır.
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-3 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors">
                            Vazgeç
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="px-8 py-3 bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                        >
                            <i className="fa-solid fa-print"></i>
                            Yazdır
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
