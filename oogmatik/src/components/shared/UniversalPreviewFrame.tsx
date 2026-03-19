import React, { useState } from 'react';

/**
 * UniversalPreviewFrame: Uygulamanın her yerinde kullanılacak premium A4/PDF önizleme çerçevesi.
 * 
 * Bu bileşen:
 * 1.  PDFViewer (React-PDF) barındırabilir.
 * 2.  Normal HTML/React bileşenlerini (A4 simülasyonu) barındırabilir.
 */

interface UniversalPreviewFrameProps {
    /** İçerik: <PDFViewer> veya herhangi bir <div /> */
    children: React.ReactNode;
    /** PDF indirme butonu gösterilsin mi? (Sadece mod: 'pdf' ise anlamlıdır) */
    showDownload?: boolean;
    /** İndirme butonu için React-PDF'in <PDFDownloadLink> bileşeni (Opsiyonel) */
    downloadLink?: React.ReactNode;
    /** Arka plan rengi sınıfı (Tailwind) */
    bgClass?: string;
    /** Sayfa başlığı */
    title?: string;
    /** Zoom değeri (1 = %100) */
    zoom?: number;
    /** Zoom değişim callback'i */
    onZoomChange?: (newZoom: number) => void;
    /** PDF modu mu? (Iframe/Viewer yönetimi için) */
    mode?: 'pdf' | 'html';
}

export const UniversalPreviewFrame: React.FC<UniversalPreviewFrameProps> = ({
    children,
    showDownload = true,
    downloadLink,
    bgClass = "bg-slate-200/50",
    title,
    zoom = 1,
    onZoomChange,
    mode = 'html'
}) => {

    const handleZoomIn = () => onZoomChange?.(Math.min(zoom + 0.1, 2));
    const handleZoomOut = () => onZoomChange?.(Math.max(zoom - 0.1, 0.5));
    const handleResetZoom = () => onZoomChange?.(1);

    return (
        <div className={`flex-1 ${bgClass} h-full relative flex flex-col items-center p-8 overflow-hidden transition-all duration-500`}>

            {/* Üst Araç Çubuğu (Toolbar) */}
            <div className="absolute top-6 right-8 flex items-center bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-1.5 z-40 animate-in slide-in-from-right-4">

                {/* Sol Taraf: Bilgi */}
                {title && (
                    <>
                        <div className="px-3 py-1 flex flex-col justify-center border-r border-slate-200">
                            <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Belge</span>
                            <span className="text-xs font-bold text-slate-700 leading-none truncate max-w-[120px]">{title}</span>
                        </div>
                    </>
                )}

                {/* Orta: Zoom Kontrolleri */}
                <div className="flex items-center gap-1 px-2">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 0.5}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-all"
                        title="Uzaklaştır"
                    >
                        <i className="fa-solid fa-minus text-xs"></i>
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="px-2 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 text-[10px] font-black min-w-[50px] transition-all"
                        title="Sıfırla"
                    >
                        %{Math.round(zoom * 100)}
                    </button>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoom >= 2}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-all"
                        title="Yakınlaştır"
                    >
                        <i className="fa-solid fa-plus text-xs"></i>
                    </button>
                </div>

                <div className="w-px h-6 bg-slate-200 mx-1"></div>

                {/* Sağ: Aksiyonlar */}
                <div className="flex items-center gap-1 px-1">
                    {showDownload && downloadLink}

                    {!downloadLink && showDownload && (
                        <button className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
                            <i className="fa-solid fa-download"></i>
                            İndir
                        </button>
                    )}
                </div>
            </div>

            {/* A4 "Masa Üstü" Alanı */}
            <div
                className={`w-full h-full flex flex-col items-center justify-start overflow-auto custom-scrollbar pt-16 pb-32 transition-all duration-300`}
                style={{ perspective: '1000px' }}
            >
                <div
                    className={`
                        transition-transform duration-200 ease-out will-change-transform
                        ${mode === 'html' ? 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-sm' : 'w-full h-full max-w-5xl'}
                    `}
                    style={{
                        transformOrigin: 'top center',
                        transform: `scale(${zoom})`,
                        ...(mode === 'html' ? { width: '210mm', minHeight: '297mm' } : { height: '100%' })
                    }}
                >
                    {children}
                </div>
            </div>

            {/* Alt Bilgi (Watermark/Brand) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30 select-none grayscale pointer-events-none">
                <img src="/assets/logo.png" alt="Oogmatik" className="h-4 w-auto" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Oogmatik Production Engine</span>
            </div>

        </div>
    );
};
