
// @ts-nocheck
import React, { useState } from 'react';
import { printService } from '../utils/printService';
import { WorksheetData } from '../types';

interface PrintPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    worksheetData: WorksheetData;
    title?: string;
}

export const PrintPreviewModal = ({ isOpen, onClose, worksheetData, title }: PrintPreviewModalProps) => {
    const [isPrinting, setIsPrinting] = useState(false);

    if (!isOpen) return null;

    const pageCount = Array.isArray(worksheetData) ? worksheetData.length : 1;

    const handlePrint = async () => {
        setIsPrinting(true);
        // Wait for UI to update before blocking
        await new Promise(resolve => setTimeout(resolve, 50));
        
        try {
            printService.print();
        } catch (error) {
            console.error("Print error:", error);
        } finally {
            setIsPrinting(false);
            // Optional: onClose(); // Keep open or close? Usually keep open in case they want to try again.
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors z-10"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                {/* Header Image / Icon */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 flex flex-col items-center justify-center text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-white/10">
                        <i className="fa-solid fa-print text-4xl"></i>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Baskıya Hazır</h2>
                    <p className="text-indigo-100 text-sm font-medium mt-1">Premium Yazdırma Modülü v5.0</p>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col gap-6">
                    
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/50">
                        <div className="flex items-start gap-3">
                            <i className="fa-solid fa-circle-info text-indigo-500 mt-1"></i>
                            <div>
                                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1">Yazdırma İpuçları</h4>
                                <ul className="text-xs text-indigo-700 dark:text-indigo-400 space-y-1.5 list-disc list-inside">
                                    <li>Kağıt boyutu olarak <b>A4</b> seçili olduğundan emin olun.</li>
                                    <li><b>Arka plan grafikleri</b> seçeneğini aktif hale getirin.</li>
                                    <li>Kenar boşluklarını <b>Varsayılan</b> veya <b>Minimum</b> yapın.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Toplam <span className="font-black text-zinc-900 dark:text-white">{pageCount}</span> sayfa yazdırılacak.
                        </p>
                    </div>

                    <button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="w-full py-4 bg-zinc-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-black font-black rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isPrinting ? (
                            <><i className="fa-solid fa-circle-notch fa-spin"></i> Hazırlanıyor...</>
                        ) : (
                            <>
                                <i className="fa-solid fa-print group-hover:animate-bounce"></i> 
                                YAZDIRMAYI BAŞLAT
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};
