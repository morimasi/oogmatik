import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * UniversalPreviewFrame v2.0: Premium A4/PDF önizleme çerçevesi.
 * - Export Dropdown Menü (PNG, PDF, Panoya Kopyala)
 * - Akıllı Zoom Bar (slider + presetler + sayfaya sığdır)
 * - Sayfa Navigasyonu (thumbnail strip)
 * - Responsive zoom (tablet / mobil uyumlu)
 */

interface UniversalPreviewFrameProps {
    children: React.ReactNode;
    showDownload?: boolean;
    downloadLink?: React.ReactNode;
    printSelector?: string;
    printFileName?: string;
    bgClass?: string;
    title?: string;
    zoom?: number;
    onZoomChange?: (newZoom: number) => void;
    mode?: 'pdf' | 'html';
}

const ZOOM_PRESETS = [
    { label: '%50', value: 0.5 },
    { label: '%75', value: 0.75 },
    { label: '%100', value: 1 },
    { label: '%125', value: 1.25 },
    { label: '%150', value: 1.5 },
];

export const UniversalPreviewFrame: React.FC<UniversalPreviewFrameProps> = ({
    children,
    showDownload = true,
    downloadLink,
    printSelector,
    printFileName = 'Oogmatik_Etkinlik',
    bgClass = "bg-slate-200/50",
    title,
    zoom = 1,
    onZoomChange,
    mode = 'html'
}) => {
    const [exportOpen, setExportOpen] = useState(false);
    const [zoomBarOpen, setZoomBarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [copySuccess, setCopySuccess] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Sayfa sayısını hesapla
    useEffect(() => {
        const timer = setTimeout(() => {
            const pages = document.querySelectorAll('.worksheet-page');
            if (pages.length > 0) setTotalPages(pages.length);
        }, 500);
        return () => clearTimeout(timer);
    }, [children]);

    // Scroll'da aktif sayfayı takip et
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        const handleScroll = () => {
            const pages = container.querySelectorAll('.worksheet-page');
            if (pages.length === 0) return;
            const containerTop = container.scrollTop + container.offsetTop;
            let closest = 0;
            let minDist = Infinity;
            pages.forEach((page, i) => {
                const el = page as HTMLElement;
                const dist = Math.abs(el.offsetTop - containerTop - 80);
                if (dist < minDist) { minDist = dist; closest = i; }
            });
            setCurrentPage(closest);
        };
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // Dışarı tıklayınca dropdown kapat
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
                setExportOpen(false);
            }
        };
        if (exportOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [exportOpen]);

    const handleCapturePrint = () => {
        setExportOpen(false);
        if (!printSelector) { window.print(); return; }
        // KRİTİK DÜZELTME: useCapture:false → eski DOM klon yolu bozuk (font şişme, grid çöküşü).
        // captureAndPrint html2canvas kullanır → Pixel Lock, allowTaint:false, @font-face enjeksiyonu aktif.
        import('../../utils/printService').then((m) =>
            m.printService.captureAndPrint(printSelector, printFileName, 'print', 'A4')
        );
    };


    const handleCaptureDownload = () => {
        setExportOpen(false);
        if (!printSelector) return;
        import('../../utils/printService').then((m) =>
            m.printService.captureAndPrint(printSelector, printFileName, 'download', 'A4')
        );
    };

    const handleCopyToClipboard = async () => {
        setExportOpen(false);
        try {
            const { default: html2canvas } = await import('html2canvas');
            const target = document.querySelector(printSelector || '.worksheet-page') as HTMLElement;
            if (!target) return;

            // ADIM 1: Ebeveyn zoom/scale soy
            const scaleBackups = new Map<HTMLElement, { zoom: string; transform: string }>();
            let cur: HTMLElement | null = target.parentElement;
            while (cur && cur !== document.body) {
                if (cur.style) {
                    scaleBackups.set(cur, { zoom: cur.style.zoom, transform: cur.style.transform });
                    cur.style.zoom = '1';
                    cur.style.transform = 'none';
                }
                cur = cur.parentElement;
            }

            // ADIM 2: Pixel Lock — tüm child elementlerin gerçek px boyutlarını kilitle
            const pixelBackups: Array<{ el: HTMLElement; w: string; h: string; fs: string; lh: string; ls: string }> = [];
            const allEls = [target, ...Array.from(target.querySelectorAll('*'))] as HTMLElement[];
            for (const el of allEls) {
                if (!el.style) continue;
                const cs = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                pixelBackups.push({ el, w: el.style.width, h: el.style.height, fs: el.style.fontSize, lh: el.style.lineHeight, ls: el.style.letterSpacing });
                if (rect.width > 0) el.style.width = `${rect.width}px`;
                if (rect.height > 0) el.style.height = `${rect.height}px`;
                const fontSize = parseFloat(cs.fontSize);
                if (fontSize > 0) el.style.fontSize = `${fontSize}px`;
                el.style.lineHeight = cs.lineHeight;
                el.style.letterSpacing = '0px';
            }

            document.body.offsetHeight;
            await new Promise<void>((r) => requestAnimationFrame(() => r()));

            const canvas = await html2canvas(target, {
              scale: 2,
              useCORS: true,
              allowTaint: false,          // KRİTİK: true canvas'ı kirletip boş PNG verir
              logging: false,
              backgroundColor: '#fff',
              foreignObjectRendering: false,
              windowWidth: target.scrollWidth,
              windowHeight: target.scrollHeight,
              width: target.offsetWidth,
              height: target.offsetHeight,
              x: 0, y: 0,
              onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
                try {
                  clonedDoc.body.classList.add('is-exporting');
                  document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => clonedDoc.head.appendChild(l.cloneNode(true)));
                  document.querySelectorAll('style').forEach((s) => clonedDoc.head.appendChild(s.cloneNode(true)));
                  clonedEl.style.transform = 'none';
                  clonedEl.style.zoom = '1';
                } catch { /* devam et */ }
              },
            });

            // ADIM 3: Geri yükle
            for (const b of pixelBackups) {
              b.el.style.width = b.w; b.el.style.height = b.h;
              b.el.style.fontSize = b.fs; b.el.style.lineHeight = b.lh;
              b.el.style.letterSpacing = b.ls;
            }
            for (const [el, styles] of scaleBackups.entries()) {
              el.style.zoom = styles.zoom;
              el.style.transform = styles.transform;
            }

            canvas.toBlob(async (blob) => {
                if (!blob) return;
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            }, 'image/png');
        } catch { /* clipboard API desteklenmiyor */ }
    };


    const scrollToPage = (pageIdx: number) => {
        const container = scrollRef.current;
        if (!container) return;
        const pages = container.querySelectorAll('.worksheet-page');
        if (pages[pageIdx]) {
            (pages[pageIdx] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Sayfaya sığdır hesabı
    const handleFitToPage = useCallback(() => {
        const container = scrollRef.current;
        if (!container) return;
        const containerWidth = container.clientWidth - 64; // padding
        const pageWidthMM = 210; // A4 portrait mm
        const pageWidthPx = pageWidthMM * 3.7795; // mm -> px approx
        const fitZoom = Math.min(containerWidth / pageWidthPx, 1.5);
        onZoomChange?.(Math.round(fitZoom * 100) / 100);
    }, [onZoomChange]);

    const handleZoomIn = () => onZoomChange?.(Math.min(zoom + 0.1, 2));
    const handleZoomOut = () => onZoomChange?.(Math.max(zoom - 0.1, 0.3));

    // Responsive: tablet'te transform: scale, PC'de zoom
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const previewStageStyle: React.CSSProperties = mode === 'html'
        ? isTouchDevice
            ? { transform: `scale(${zoom})`, transformOrigin: 'top center', width: `${100 / zoom}%` }
            : { zoom, transformOrigin: 'top center' }
        : { transformOrigin: 'top center', transform: `scale(${zoom})`, height: '100%' };

    return (
        <div className={`flex-1 ${bgClass} h-full relative flex flex-col items-center overflow-hidden transition-all duration-500`}>

            {/* ═══ ÜST ARAÇ ÇUBUĞU ═══ */}
            <div className="absolute top-4 right-4 left-4 flex items-center justify-between z-40 animate-in slide-in-from-top-2 pointer-events-none">

                {/* Sol: Belge Bilgisi + Sayfa Nav */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    {title && (
                        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/40 px-3 py-1.5 flex items-center gap-2">
                            <i className="fa-solid fa-file-lines text-indigo-400 text-xs"></i>
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{title}</span>
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/40 px-2 py-1 flex items-center gap-1">
                            <button
                                onClick={() => scrollToPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-all"
                            >
                                <i className="fa-solid fa-chevron-up text-[10px]"></i>
                            </button>
                            <span className="text-[10px] font-black text-slate-600 min-w-[36px] text-center">
                                {currentPage + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => scrollToPage(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-all"
                            >
                                <i className="fa-solid fa-chevron-down text-[10px]"></i>
                            </button>
                        </div>
                    )}
                </div>

                {/* Sağ: Zoom + Export */}
                <div className="flex items-center gap-2 pointer-events-auto">

                    {/* Zoom Bar */}
                    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/40 p-1 flex items-center gap-0.5 relative">
                        <button
                            onClick={handleZoomOut}
                            disabled={zoom <= 0.3}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-all"
                            title="Uzaklaştır"
                        >
                            <i className="fa-solid fa-minus text-[10px]"></i>
                        </button>

                        {/* Zoom yüzde — tıklayınca preset menü */}
                        <div className="relative">
                            <button
                                onClick={() => setZoomBarOpen(!zoomBarOpen)}
                                className="px-2 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 text-[10px] font-black min-w-[42px] transition-all"
                                title="Zoom preset seç"
                            >
                                %{Math.round(zoom * 100)}
                            </button>
                            {zoomBarOpen && (
                                <div className="absolute top-full mt-1 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 p-1 min-w-[120px] z-50 animate-in fade-in zoom-in-95 duration-150">
                                    {ZOOM_PRESETS.map((p) => (
                                        <button
                                            key={p.value}
                                            onClick={() => { onZoomChange?.(p.value); setZoomBarOpen(false); }}
                                            className={`w-full px-3 py-1.5 text-left text-xs font-bold rounded-lg transition-all ${zoom === p.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                    <div className="border-t border-slate-100 mt-1 pt-1">
                                        <button
                                            onClick={() => { handleFitToPage(); setZoomBarOpen(false); }}
                                            className="w-full px-3 py-1.5 text-left text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-2"
                                        >
                                            <i className="fa-solid fa-expand text-[10px]"></i>
                                            Sayfaya Sığdır
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleZoomIn}
                            disabled={zoom >= 2}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-all"
                            title="Yakınlaştır"
                        >
                            <i className="fa-solid fa-plus text-[10px]"></i>
                        </button>

                        {/* Zoom slider (geniş ekranlarda) */}
                        <div className="hidden md:flex items-center px-1">
                            <input
                                type="range"
                                min="30"
                                max="200"
                                value={Math.round(zoom * 100)}
                                onChange={(e) => onZoomChange?.(parseInt(e.target.value) / 100)}
                                className="w-20 h-1 accent-indigo-500 cursor-pointer"
                                title={`Zoom: %${Math.round(zoom * 100)}`}
                            />
                        </div>
                    </div>

                    {/* Export Dropdown */}
                    <div className="relative" ref={exportRef}>
                        {showDownload && downloadLink && !exportOpen && downloadLink}

                        {!downloadLink && printSelector && mode === 'html' && (
                            <>
                                <button
                                    onClick={() => setExportOpen(!exportOpen)}
                                    className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/40 px-3 py-1.5 flex items-center gap-2 text-xs font-black text-slate-700 hover:bg-white transition-all"
                                >
                                    <i className="fa-solid fa-share-from-square text-indigo-500"></i>
                                    Dışa Aktar
                                    <i className={`fa-solid fa-chevron-down text-[8px] text-slate-400 transition-transform ${exportOpen ? 'rotate-180' : ''}`}></i>
                                </button>

                                {exportOpen && (
                                    <div className="absolute top-full mt-1.5 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-1.5 min-w-[200px] z-50 animate-in fade-in zoom-in-95 duration-150">
                                        <button
                                            onClick={handleCapturePrint}
                                            className="w-full px-3 py-2.5 flex items-center gap-3 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                <i className="fa-solid fa-print text-indigo-600 text-[10px]"></i>
                                            </div>
                                            <div className="text-left">
                                                <div>Yazdır</div>
                                                <div className="text-[9px] text-slate-400 font-normal">PDF olarak yazdır</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleCaptureDownload}
                                            className="w-full px-3 py-2.5 flex items-center gap-3 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                <i className="fa-solid fa-download text-emerald-600 text-[10px]"></i>
                                            </div>
                                            <div className="text-left">
                                                <div>PNG İndir</div>
                                                <div className="text-[9px] text-slate-400 font-normal">Görüntü olarak kaydet</div>
                                            </div>
                                        </button>
                                        <div className="border-t border-slate-100 my-1"></div>
                                        <button
                                            onClick={handleCopyToClipboard}
                                            className="w-full px-3 py-2.5 flex items-center gap-3 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-all"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                                                <i className={`fa-solid ${copySuccess ? 'fa-check' : 'fa-copy'} text-amber-600 text-[10px]`}></i>
                                            </div>
                                            <div className="text-left">
                                                <div>{copySuccess ? 'Kopyalandı!' : 'Panoya Kopyala'}</div>
                                                <div className="text-[9px] text-slate-400 font-normal">Görüntüyü panoya kopyala</div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ A4 "MASA ÜSTÜ" ALANI ═══ */}
            <div
                ref={scrollRef}
                className="w-full h-full flex flex-col items-center justify-start overflow-auto custom-scrollbar pt-14 pb-32 transition-all duration-300 scroll-smooth"
                style={{ perspective: '1000px' }}
            >
                <div
                    className={`
                        transition-transform duration-200 ease-out will-change-transform
                        ${mode === 'html' ? 'inline-flex flex-col items-center justify-start w-fit max-w-none overflow-visible' : 'w-full h-full max-w-5xl'}
                    `}
                    style={previewStageStyle}
                >
                    {children}
                </div>
            </div>

            {/* ═══ ALT SAYFA THUMBNAIL STRIP ═══ */}
            {totalPages > 1 && (
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/40 px-2 py-1.5 z-30">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollToPage(i)}
                            className={`w-6 h-8 rounded border transition-all flex items-center justify-center text-[7px] font-black ${
                                currentPage === i
                                    ? 'bg-indigo-500 text-white border-indigo-600 shadow-md scale-110'
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-500'
                            }`}
                            title={`Sayfa ${i + 1}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* ═══ ALT BİLGİ (WATERMARK) ═══ */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-20 select-none grayscale pointer-events-none">
                <img src="/assets/logo.png" alt="Oogmatik" className="h-3.5 w-auto" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-800">Oogmatik Production Engine</span>
            </div>

            {/* Copy success toast */}
            {copySuccess && (
                <div className="fixed bottom-8 right-8 bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-bold z-50 animate-in slide-in-from-bottom-4">
                    <i className="fa-solid fa-check mr-2"></i>Panoya kopyalandı!
                </div>
            )}
        </div>
    );
};
