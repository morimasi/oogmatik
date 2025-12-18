
import React, { useState, useEffect, useRef } from 'react';
import { printService } from '../utils/printService';
import { WorksheetData } from '../types';

interface PrintPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    worksheetData: WorksheetData;
    title?: string;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ isOpen, onClose, worksheetData, title }) => {
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [isGrayscale, setIsGrayscale] = useState(false);
    const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Select all pages by default
            setSelectedPages(worksheetData.map((_, i) => i));
        }
    }, [isOpen, worksheetData]);

    const togglePage = (index: number) => {
        setSelectedPages(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index].sort((a,b)=>a-b)
        );
    };

    const handlePrint = async () => {
        setIsPrinting(true);
        try {
            await printService.generatePdf(
                '.worksheet-page', 
                title, 
                { 
                    action: 'print',
                    selectedPages,
                    grayscale: isGrayscale,
                    includeAnswerKey,
                    worksheetData
                }
            );
            onClose();
        } catch (e) {
            console.error(e);
            alert("Yazdırma hatası");
        } finally {
            setIsPrinting(false);
        }
    };

    // React-driven render for previews is cleaner than cloning DOM manually here
    // However, the worksheet content is complex React components. 
    // To show a true preview, we'd need to render the Worksheet component again in small scale.
    // BUT we already have the rendered DOM. Let's use a trick: Scale existing DOM clones.
    
    const PageThumbnail = ({ index }: { index: number }) => {
        const containerRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            // Find the specific page based on index (assuming sequential order in DOM)
            const pages = document.querySelectorAll('.worksheet-page');
            const targetPage = pages[index];

            if (targetPage && containerRef.current) {
                containerRef.current.innerHTML = '';
                
                const clone = targetPage.cloneNode(true) as HTMLElement;
                
                // Cleanup clone visual for thumbnail
                clone.style.width = '210mm';
                clone.style.height = '297mm';
                clone.style.transform = 'scale(0.2)'; 
                clone.style.transformOrigin = 'top left';
                clone.style.margin = '0';
                clone.style.boxShadow = 'none';
                clone.style.position = 'absolute';
                clone.style.top = '0';
                clone.style.left = '0';
                clone.style.pointerEvents = 'none'; // No interaction
                
                if (isGrayscale) {
                    clone.style.filter = 'grayscale(100%)';
                }

                clone.querySelectorAll('.edit-handle, .page-navigator, .no-print').forEach(el => el.remove());
                
                containerRef.current.appendChild(clone);
            }
        }, [index, isGrayscale, isOpen]); 

        return (
            <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-white">
                {/* Clone injected here */}
            </div>
        );
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                
                {/* LEFT: SETTINGS PANEL */}
                <div className="w-full md:w-80 bg-zinc-50 dark:bg-zinc-800/50 border-r border-zinc-200 dark:border-zinc-700 p-6 flex flex-col gap-6 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">Baskı Önizleme</h2>
                        <p className="text-sm text-zinc-500">Ayarları yapılandırın.</p>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto">
                        
                        {/* Page Selection Stats */}
                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3">Sayfa Seçimi</h4>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{selectedPages.length} / {worksheetData.length} Sayfa</span>
                                <button 
                                    onClick={() => setSelectedPages(selectedPages.length === worksheetData.length ? [] : worksheetData.map((_, i) => i))}
                                    className="text-xs text-indigo-600 font-bold hover:underline"
                                >
                                    {selectedPages.length === worksheetData.length ? 'Temizle' : 'Tümü'}
                                </button>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${(selectedPages.length / worksheetData.length) * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer group hover:border-indigo-300 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isGrayscale ? 'bg-zinc-200 text-zinc-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'}`}>
                                        <i className="fa-solid fa-palette"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Siyah-Beyaz</p>
                                        <p className="text-[10px] text-zinc-500">Mürekkep tasarrufu</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${isGrayscale ? 'bg-indigo-600' : 'bg-zinc-300'}`}>
                                    <input type="checkbox" checked={isGrayscale} onChange={e => setIsGrayscale(e.target.checked)} className="hidden" />
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isGrayscale ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer group hover:border-indigo-300 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600`}>
                                        <i className="fa-solid fa-key"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Cevap Anahtarı</p>
                                        <p className="text-[10px] text-zinc-500">Sona ekle</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${includeAnswerKey ? 'bg-indigo-600' : 'bg-zinc-300'}`}>
                                    <input type="checkbox" checked={includeAnswerKey} onChange={e => setIncludeAnswerKey(e.target.checked)} className="hidden" />
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${includeAnswerKey ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </label>
                        </div>

                    </div>

                    <div className="flex flex-col gap-3 mt-auto">
                        <button 
                            onClick={handlePrint}
                            disabled={isPrinting || selectedPages.length === 0}
                            className="w-full py-4 bg-zinc-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-black font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-print"></i>}
                            YAZDIR ({selectedPages.length})
                        </button>
                        <button onClick={onClose} className="w-full py-3 text-zinc-500 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors">
                            Vazgeç
                        </button>
                    </div>
                </div>

                {/* RIGHT: PREVIEW GRID */}
                <div className="flex-1 bg-zinc-100 dark:bg-black/50 p-8 overflow-y-auto custom-scrollbar relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                        {worksheetData.map((_, index) => (
                            <div 
                                key={index}
                                onClick={() => togglePage(index)}
                                className={`relative cursor-pointer transition-all duration-200 border-4 rounded-xl overflow-hidden aspect-[210/297] bg-white shadow-sm group ${selectedPages.includes(index) ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-zinc-200 opacity-60 grayscale'}`}
                            >
                                <PageThumbnail index={index} />
                                
                                <div className={`absolute inset-0 bg-indigo-900/10 transition-opacity ${selectedPages.includes(index) ? 'opacity-0' : 'opacity-100 group-hover:opacity-50'}`}></div>
                                
                                <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${selectedPages.includes(index) ? 'bg-indigo-600 text-white scale-100' : 'bg-zinc-300 text-zinc-500 scale-90'}`}>
                                    {selectedPages.includes(index) ? <i className="fa-solid fa-check"></i> : index + 1}
                                </div>
                            </div>
                        ))}
                        
                        {/* Answer Key Preview Placeholder */}
                        {includeAnswerKey && (
                            <div className="relative border-4 border-dashed border-emerald-300 rounded-xl overflow-hidden aspect-[210/297] bg-emerald-50 flex flex-col items-center justify-center text-center p-4">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-2">
                                    <i className="fa-solid fa-key"></i>
                                </div>
                                <p className="font-bold text-emerald-800 text-sm">Cevap Anahtarı</p>
                                <p className="text-xs text-emerald-600 mt-1">Otomatik oluşturulacak</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
