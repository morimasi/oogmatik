
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { printService, PrintOptions } from '../utils/printService';
import { WorksheetData } from '../types';

interface PrintPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    worksheetData: WorksheetData;
    title?: string;
}

// ─── Thumbnail Bileşeni ──────────────────────────────────────
const PageThumbnail = React.memo(({ index, isGrayscale, isOpen }: { index: number; isGrayscale: boolean; isOpen: boolean }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect((): void => {
        const pages = document.querySelectorAll('.worksheet-page');
        const targetPage = pages[index];
        if (targetPage && containerRef.current) {
            containerRef.current.innerHTML = '';
            const clone = targetPage.cloneNode(true) as HTMLElement;

            // A4 oranı: 210/297 = 0.707. Thumbnail genişliği ~160px
            // scale = 160 / 794px(A4@96dpi) ≈ 0.202
            clone.style.width = '210mm';
            clone.style.minHeight = '297mm';
            clone.style.transform = 'scale(0.202)';
            clone.style.transformOrigin = 'top left';
            clone.style.margin = '0';
            clone.style.boxShadow = 'none';
            clone.style.position = 'absolute';
            clone.style.top = '0';
            clone.style.left = '0';
            clone.style.pointerEvents = 'none';
            clone.style.overflow = 'hidden';
            if (isGrayscale) clone.style.filter = 'grayscale(100%)';

            clone.querySelectorAll('.edit-handle, .page-navigator, .no-print, button').forEach(el => el.remove());
            containerRef.current.appendChild(clone);
        }
    }, [index, isGrayscale, isOpen]);

    return <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-white" />;
});

// ─── Toggle Bileşeni ─────────────────────────────────────────
const ToggleOption = ({
    icon, label, sublabel, active, iconBg, onChange
}: {
    readonly icon: string;
    readonly label: string;
    readonly sublabel: string;
    readonly active: boolean;
    readonly iconBg: string;
    readonly onChange: (v: boolean) => void;
}) => (
    <label className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 transition-all">
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBg}`}>
                <i className={`fa-solid ${icon} text-sm`}></i>
            </div>
            <div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{label}</p>
                <p className="text-[10px] text-zinc-500">{sublabel}</p>
            </div>
        </div>
        <div
            className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-600'} cursor-pointer`}
            onClick={() => onChange(!active)}
        >
            <input type="checkbox" checked={active} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)} className="hidden" />
            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all shadow ${active ? 'left-6' : 'left-1'}`}></div>
        </div>
    </label>
);

// ─── Ana Modal ───────────────────────────────────────────────
export const PrintPreviewModal = ({ isOpen, onClose, worksheetData, title }: PrintPreviewModalProps) => {
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [isGrayscale, setIsGrayscale] = useState(false);
    const [compact, setCompact] = useState(false);
    const [columnsPerPage, setColumnsPerPage] = useState<1 | 2>(1);
    const [fontSize, setFontSize] = useState<10 | 11 | 12>(11);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect((): void => {
        if (isOpen) {
            setSelectedPages((worksheetData || []).map((_: unknown, i: number) => i));
        }
    }, [isOpen, worksheetData]);

    const togglePage = useCallback((index: number): void => {
        setSelectedPages((prev: number[]) =>
            prev.includes(index) ? prev.filter((i: number) => i !== index) : [...prev, index].sort((a: number, b: number) => a - b)
        );
    }, []);

    const selectAll = useCallback((): void => {
        setSelectedPages((worksheetData || []).map((_: unknown, i: number) => i));
    }, [worksheetData]);

    const clearAll = useCallback((): void => setSelectedPages([]), []);

    const handlePrint = async (): Promise<void> => {
        setIsPrinting(true);
        try {
            const printOptions: PrintOptions = {
                action: 'print',
                selectedPages,
                grayscale: isGrayscale,
                worksheetData: worksheetData as any[],
                compact,
                columnsPerPage,
                fontSize,
            };
            await printService.generatePdf('.worksheet-page', title, printOptions);
            onClose();
        } catch (e: unknown) {
            console.error('[PrintModal] Yazdırma hatası:', e);
            alert('Yazdırma sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsPrinting(false);
        }
    };

    if (!isOpen) return null;

    const pageCount = worksheetData?.length || 0;
    const selCount = selectedPages.length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                {/* ═══════ SOL: AYARLAR PANELİ ═══════ */}
                <div className="w-full md:w-80 bg-zinc-50 dark:bg-zinc-800/50 border-r border-zinc-200 dark:border-zinc-700 p-6 flex flex-col gap-5 shrink-0 overflow-y-auto custom-scrollbar">

                    {/* Başlık */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-0.5">
                                <i className="fa-solid fa-print mr-2 text-indigo-500"></i>Baskı Önizleme
                            </h2>
                            <p className="text-xs text-zinc-500">Ayarları yapılandırın ve yazdırın.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                        >
                            <i className="fa-solid fa-xmark text-sm"></i>
                        </button>
                    </div>

                    {/* Sayfa Seçimi */}
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sayfa Seçimi</h4>
                            <div className="flex gap-2">
                                <button onClick={selectAll} className="text-[10px] text-indigo-600 font-bold hover:underline">Tümü</button>
                                <span className="text-zinc-300">|</span>
                                <button onClick={clearAll} className="text-[10px] text-zinc-400 font-bold hover:underline">Temizle</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                {selCount} / {pageCount} Sayfa
                            </span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full transition-all duration-300"
                                style={{ width: `${pageCount > 0 ? (selCount / pageCount) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Temel Seçenekler */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Görünüm</h4>

                        <ToggleOption
                            icon="fa-palette"
                            label="Siyah-Beyaz"
                            sublabel="Mürekkep tasarrufu"
                            active={isGrayscale}
                            iconBg={isGrayscale ? 'bg-zinc-200 text-zinc-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'}
                            onChange={setIsGrayscale}
                        />

                        <ToggleOption
                            icon="fa-compress"
                            label="Kompakt Mod"
                            sublabel="Daha fazla içerik sığdır"
                            active={compact}
                            iconBg={compact ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-500'}
                            onChange={setCompact}
                        />
                    </div>

                    {/* Düzen Seçenekleri */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Düzen</h4>

                        {/* Sütun Seçimi */}
                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-2">
                                <i className="fa-solid fa-table-columns mr-1.5 text-indigo-400"></i>Sütun Düzeni
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {([1, 2] as (1 | 2)[]).map(col => (
                                    <button
                                        key={col}
                                        onClick={() => setColumnsPerPage(col)}
                                        className={`py-2 rounded-lg text-xs font-black transition-all border-2 ${columnsPerPage === col
                                            ? 'border-indigo-600 bg-indigo-600 text-white'
                                            : 'border-zinc-200 dark:border-zinc-600 text-zinc-500 hover:border-indigo-300'
                                            }`}
                                    >
                                        {col === 1
                                            ? <><i className="fa-solid fa-grip-lines mr-1"></i>Tek Sütun</>
                                            : <><i className="fa-solid fa-columns mr-1"></i>Çift Sütun</>
                                        }
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Yazı Boyutu */}
                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                    <i className="fa-solid fa-text-height mr-1.5 text-indigo-400"></i>Yazı Boyutu
                                </p>
                                <span className="text-xs font-black text-indigo-600">{fontSize}pt</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {([10, 11, 12] as (10 | 11 | 12)[]).map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setFontSize(size)}
                                        className={`py-1.5 rounded-lg text-xs font-black transition-all border-2 ${fontSize === size
                                            ? 'border-indigo-600 bg-indigo-600 text-white'
                                            : 'border-zinc-200 dark:border-zinc-600 text-zinc-500 hover:border-indigo-300'
                                            }`}
                                    >
                                        {size}pt
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Baskı Özeti */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">Baskı Özeti</p>
                        <div className="space-y-1 text-[10px] text-indigo-700 dark:text-indigo-300">
                            <div className="flex justify-between"><span>Toplam sayfa:</span><span className="font-black">{selCount}</span></div>
                            <div className="flex justify-between"><span>Düzen:</span><span className="font-black">{columnsPerPage === 2 ? '2 Sütun' : 'Tek Sütun'}</span></div>
                            <div className="flex justify-between"><span>Font:</span><span className="font-black">{fontSize}pt {compact ? '(Kompakt)' : ''}</span></div>
                            <div className="flex justify-between"><span>Renk:</span><span className="font-black">{isGrayscale ? 'Siyah-Beyaz' : 'Renkli'}</span></div>
                        </div>
                    </div>

                    {/* Butonlar */}
                    <div className="flex flex-col gap-2 mt-auto">
                        <button
                            onClick={handlePrint}
                            disabled={isPrinting || selCount === 0}
                            className="w-full py-4 bg-zinc-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-black font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPrinting ? (
                                <><i className="fa-solid fa-circle-notch fa-spin"></i> Hazırlanıyor...</>
                            ) : (
                                <><i className="fa-solid fa-print"></i> YAZDIR ({selCount})</>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 text-zinc-500 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors text-sm"
                        >
                            Vazgeç
                        </button>
                    </div>
                </div>

                {/* ═══════ SAĞ: ÖNIZLEME GRİDİ ═══════ */}
                <div className="flex-1 bg-zinc-100 dark:bg-black/50 p-6 overflow-y-auto custom-scrollbar relative">
                    {/* Arka plan desen */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>

                    <div className="relative z-10">
                        {pageCount === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                                <i className="fa-solid fa-file-slash text-4xl mb-3"></i>
                                <p className="font-bold">Yazdırılacak sayfa yok</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                                    {pageCount} Sayfa — Seçmek için tıklayın
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {(worksheetData || []).map((_: unknown, index: number) => (
                                        <div
                                            key={index}
                                            onClick={() => togglePage(index)}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-xl overflow-hidden group ${selectedPages.includes(index)
                                                ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-zinc-100 dark:ring-offset-black'
                                                : 'opacity-50 grayscale hover:opacity-75 hover:grayscale-0'
                                                }`}
                                            style={{ aspectRatio: '210/297' }}
                                        >
                                            {/* Beyaz A4 arka planı */}
                                            <div className="absolute inset-0 bg-white border-2 rounded-xl border-zinc-200 shadow-sm">
                                                <PageThumbnail index={index} isGrayscale={isGrayscale} isOpen={isOpen} />
                                            </div>

                                            {/* Seçim göstergesi */}
                                            <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shadow transition-all z-10 ${selectedPages.includes(index)
                                                ? 'bg-indigo-600 text-white scale-100'
                                                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 scale-90'
                                                }`}>
                                                {selectedPages.includes(index) ? <i className="fa-solid fa-check"></i> : index + 1}
                                            </div>

                                            {/* Sayfa numarası */}
                                            <div className="absolute bottom-1.5 left-0 right-0 flex justify-center z-10">
                                                <span className="text-[8px] font-black bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                                                    S.{index + 1}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
