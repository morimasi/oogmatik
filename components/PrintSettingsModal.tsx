
import React, { useState } from 'react';
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
        ecoMode: false,
        includeAnswerKeyPlaceholder: false,
        copies: 1,
        orientation: 'portrait'
    });

    if (!isOpen) return null;

    const handlePrint = () => {
        printService.printWorksheet(settings);
        // We don't close immediately so user can print again if needed, or close manually
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="bg-zinc-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <i className="fa-solid fa-print"></i> Yazdırma Ayarları
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Title Input */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Belge Başlığı</label>
                        <input 
                            type="text" 
                            value={settings.title}
                            onChange={(e) => setSettings({...settings, title: e.target.value})}
                            className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700 text-sm font-bold"
                        />
                    </div>

                    {/* Toggles Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Eco Mode Toggle */}
                        <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${settings.ecoMode ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-zinc-200 hover:border-zinc-300'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${settings.ecoMode ? 'bg-green-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                    <i className="fa-solid fa-leaf"></i>
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-zinc-800 dark:text-zinc-100">Eco Mode</p>
                                    <p className="text-xs text-zinc-500">Mürekkep Tasarrufu</p>
                                </div>
                            </div>
                            <input type="checkbox" checked={settings.ecoMode} onChange={(e) => setSettings({...settings, ecoMode: e.target.checked})} className="hidden" />
                            {settings.ecoMode && <i className="fa-solid fa-check-circle text-green-500"></i>}
                        </label>

                        {/* Student Info Toggle */}
                        <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${settings.showStudentInfo ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 hover:border-zinc-300'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${settings.showStudentInfo ? 'bg-indigo-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                    <i className="fa-solid fa-user-graduate"></i>
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-zinc-800 dark:text-zinc-100">Öğrenci Bilgisi</p>
                                    <p className="text-xs text-zinc-500">İsim/Tarih Alanı</p>
                                </div>
                            </div>
                            <input type="checkbox" checked={settings.showStudentInfo} onChange={(e) => setSettings({...settings, showStudentInfo: e.target.checked})} className="hidden" />
                            {settings.showStudentInfo && <i className="fa-solid fa-check-circle text-indigo-500"></i>}
                        </label>

                        {/* Answer Key Toggle */}
                        <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${settings.includeAnswerKeyPlaceholder ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-zinc-200 hover:border-zinc-300'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${settings.includeAnswerKeyPlaceholder ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                                    <i className="fa-solid fa-key"></i>
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-zinc-800 dark:text-zinc-100">Not Sayfası</p>
                                    <p className="text-xs text-zinc-500">Sonuna boş sayfa ekle</p>
                                </div>
                            </div>
                            <input type="checkbox" checked={settings.includeAnswerKeyPlaceholder} onChange={(e) => setSettings({...settings, includeAnswerKeyPlaceholder: e.target.checked})} className="hidden" />
                            {settings.includeAnswerKeyPlaceholder && <i className="fa-solid fa-check-circle text-amber-500"></i>}
                        </label>

                         {/* Orientation Toggle */}
                         <div className="flex bg-zinc-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setSettings({...settings, orientation: 'portrait'})}
                                className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${settings.orientation === 'portrait' ? 'bg-white shadow text-black' : 'text-zinc-500'}`}
                            >
                                <i className="fa-regular fa-file"></i> Dikey
                            </button>
                            <button 
                                onClick={() => setSettings({...settings, orientation: 'landscape'})}
                                className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${settings.orientation === 'landscape' ? 'bg-white shadow text-black' : 'text-zinc-500'}`}
                            >
                                <i className="fa-regular fa-file fa-rotate-90"></i> Yatay
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-colors">Vazgeç</button>
                        <button 
                            onClick={handlePrint}
                            className="px-6 py-2 bg-zinc-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                        >
                            <i className="fa-solid fa-print"></i> Yazdır
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
