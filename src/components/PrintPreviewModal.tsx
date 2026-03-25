
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { printService } from '../utils/printService';
import { snapshotService } from '../utils/snapshotService';
import { WorksheetData, StyleSettings } from '../types';
import { usePaperSizeStore } from '../store/usePaperSizeStore';
import { ExportProgressModal } from './ExportProgressModal';

interface PrintPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    worksheetData?: WorksheetData;
    title?: string;
    settings?: StyleSettings;
}

export const PrintPreviewModal = ({ isOpen, onClose, worksheetData, title, settings }: PrintPreviewModalProps) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [exportProgress, setExportProgress] = useState({ open: false, percent: 0, message: '' });
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const { paperSize, setPaperSize } = usePaperSizeStore();

    useEffect(() => {
        if (isOpen) {
            // DOM'da kaç tane worksheet-page veya a4-page varsa say
            const pages = document.querySelectorAll('.worksheet-page, .a4-page, .universal-mode-canvas');
            setTotalPages(Math.max(1, pages.length));
            setCurrentPage(1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAction = async (action: 'print' | 'pdf' | 'zip') => {
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 50)); // UI thread'a nefes aldır

        const targetSelector = document.getElementById('print-container')
            ? '#print-container'
            : '.worksheet-page, .a4-page, .universal-mode-canvas';

        try {
            if (action === 'print') {
                await printService.generatePdf(targetSelector, title, {
                    action: 'print',
                    paperSize: paperSize,
                });
            } else if (action === 'pdf') {
                setExportProgress({ open: true, percent: 0, message: 'PDF Hazırlanıyor...' });
                await printService.generateRealPdf(targetSelector, title, {
                    paperSize: paperSize,
                    quality: 'print',
                    onProgress: (percent, msg) => setExportProgress({ open: true, percent, message: msg })
                });
            } else if (action === 'zip') {
                setExportProgress({ open: true, percent: 40, message: 'Görüntüler sıkıştırılıyor...' });
                await snapshotService.takeSnapshot(targetSelector, title || 'etkinlik', 'download_zip', 2);
            }
        } catch (e) {
            console.error("Print/Export error:", e);
        } finally {
            setIsProcessing(false);
            setExportProgress({ open: false, percent: 0, message: '' });
            if (action !== 'pdf' && action !== 'zip') {
                // PDF ve ZIP indirmede modalı kapatmıyoruz, print'te kapatabiliriz
                // onClose();
            }
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative outline outline-1 outline-white/10">

                    {/* Sol Panel: Ayarlar ve Eylemler */}
                    <div className="w-full md:w-80 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col border-r border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                                    <i className="fa-solid fa-print text-indigo-500"></i> Dışa Aktar
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400 font-medium">Platform Baskı Merkezi</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Kağıt Boyutu</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['A4', 'Letter', 'Legal'] as const).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPaperSize(p)}
                                            className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${paperSize === p
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-300 shadow-sm'
                                                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-800/80 dark:border-zinc-700 dark:text-zinc-300'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Baskı Ayarları</label>
                                <div className="bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 space-y-4 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Yüksek Kalite (3x)</span>
                                        <i className="fa-solid fa-check-circle text-emerald-500"></i>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Arka Plan Renkleri</span>
                                        <i className="fa-solid fa-check-circle text-emerald-500"></i>
                                    </div>
                                    <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Siyah/Beyaz</span>
                                        <i className="fa-solid fa-circle-xmark text-zinc-400"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/50">
                                <div className="flex items-start gap-3">
                                    <i className="fa-solid fa-circle-info text-emerald-600 dark:text-emerald-400 mt-0.5"></i>
                                    <div>
                                        <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">Mizanpaj İpucu</h4>
                                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                            Uzun içerikler otomatik olarak sonraki sayfalara bölünür. Etkinliğin hiçbir parçası kesilmez.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                            <button
                                onClick={() => handleAction('pdf')}
                                disabled={isProcessing}
                                className="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                            >
                                <i className="fa-solid fa-file-pdf"></i>
                                PREMIUM PDF İNDİR
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleAction('print')}
                                    disabled={isProcessing}
                                    className="w-full py-2.5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 text-sm"
                                >
                                    <i className="fa-solid fa-print"></i>
                                    Yazdır
                                </button>
                                <button
                                    onClick={() => handleAction('zip')}
                                    disabled={isProcessing}
                                    className="w-full py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 text-sm"
                                >
                                    <i className="fa-solid fa-file-zipper"></i>
                                    Tümünü İndir (ZIP)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sağ Panel: Önizleme Alanı */}
                    <div className="flex-1 bg-zinc-200/50 dark:bg-black/50 overflow-hidden flex flex-col relative">
                        {/* Önizleme Araç Çubuğu */}
                        <div className="h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 z-10">
                            <div className="flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-300">
                                <i className="fa-regular fa-file-lines text-indigo-500"></i>
                                Toplam {totalPages} Sayfa
                            </div>
                            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage <= 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors shadow-sm"
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                <span className="text-xs font-mono font-bold px-2 text-zinc-700 dark:text-zinc-300">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors shadow-sm"
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>

                        {/* Önizleme İçeriği */}
                        <div className="flex-1 overflow-auto p-8 flex justify-center items-start custom-scrollbar relative" ref={previewContainerRef}>
                            {/* Fake A4 Preview - In a real scenario we'd clone the DOM here or create an iframe */}
                            <div
                                className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col relative overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800/50 origin-top"
                                style={{
                                    width: paperSize === 'A4' ? '210mm' : paperSize === 'Letter' ? '216mm' : '216mm',
                                    minHeight: paperSize === 'A4' ? '297mm' : paperSize === 'Letter' ? '279mm' : '356mm',
                                    transform: 'scale(1)', // Responsive scaling could be implemented here
                                }}
                            >
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-zinc-50/80 dark:bg-zinc-900/80 z-20 backdrop-blur-sm">
                                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 flex items-center justify-center mb-4">
                                        <i className="fa-solid fa-eye text-2xl"></i>
                                    </div>
                                    <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">Canlı Önizleme Aktif Değil</h3>
                                    <p className="text-sm text-zinc-500 max-w-[280px]">
                                        Gerçek çözünürlükte çıktıyı almak için sol taraftaki eylem düğmelerini kullanın. İçeriğiniz arka planda güvenle işlenir.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Loading Overlay */}
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500 mb-4"></i>
                                <div className="text-lg font-bold text-zinc-800 dark:text-white">İşleniyor...</div>
                                <div className="text-sm text-zinc-500 mt-1">Lütfen bekleyin, yüksek kalite render uzun sürebilir.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ExportProgressModal
                isOpen={exportProgress.open}
                percent={exportProgress.percent}
                message={exportProgress.message}
            />
        </>
    );
};

