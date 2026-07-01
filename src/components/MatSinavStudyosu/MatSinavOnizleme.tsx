import React from 'react';
import { MatSinav, MatSoru } from '../../types/matSinav';
import { PrintConfig } from '../../types/sinav';
import { MatSoruCard } from './components/MatSoruCard';

interface MatSinavOnizlemeProps {
    sinav: MatSinav;
    onUpdateSoru: (index: number, updated: MatSoru) => void;
    onRefreshSoru: (index: number) => void;
    refreshingIndex: number | null;
    config?: PrintConfig;
    isPrinting?: boolean;
    showAnswers?: boolean;
}

export const MatSinavOnizleme: React.FC<MatSinavOnizlemeProps> = ({
    sinav,
    onUpdateSoru,
    onRefreshSoru,
    refreshingIndex,
    config,
    isPrinting = false,
    showAnswers = false,
}) => {
    const fontSizePx = config ? `${config.fontSize}pt` : '12pt';
    const fontFamily = config?.fontFamily === 'times' ? 'Times New Roman, Times, serif' : (config?.fontFamily === 'helvetica' ? 'Inter, Helvetica, Arial, sans-serif' : 'Lexend, Inter, sans-serif');
    const questionGap = config ? `${config.questionSpacingMm * 2}px` : '16px';
    const lineHeight = config ? config.lineHeight : 1.6;
    const textAlign = config ? config.textAlign : 'left';
    const marginMm = config ? config.marginMm : 18;
    const columnsCount = config ? config.columns : 1;
    const mmToPx = 3.7795275591; // 1 mm ≈ 3.78 px

    return (
        <div
            id={isPrinting ? 'mat-sinav-print-inner' : undefined}
            className={`mat-sinav-onizleme bg-white print-exact ${isPrinting ? 'is-printing p-0 shadow-none ring-0' : 'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5'}`}
            style={{
                fontFamily,
                color: '#000',
                textAlign,
                fontSize: fontSizePx,
                lineHeight,
                padding: isPrinting ? `${marginMm}mm` : `${marginMm * mmToPx}px`,
                minHeight: isPrinting ? 'auto' : '297mm',
                width: '100%',
                boxSizing: 'border-box'
            }}
        >
            {/* Sınav Başlığı */}
            {!isPrinting ? (
                <div
                    className="rounded-2xl p-6 mb-6 shadow-lg text-white"
                    style={{ 
                        background: 'linear-gradient(135deg, hsl(var(--accent-h) var(--accent-s) calc(var(--accent-l) - 8%)) 0%, hsl(var(--accent-h) var(--accent-s) var(--accent-l)) 100%)',
                    }}
                >
                    <h1 className="text-2xl font-extrabold mb-4 tracking-tight drop-shadow-sm">
                        {sinav.baslik}
                    </h1>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        {[
                            { label: 'SINIF', val: `${sinav.sinif}. Sınıf` },
                            { label: 'SORU', val: `${sinav.sorular.length} Adet` },
                            { label: 'PUAN', val: `${sinav.toplamPuan} Toplam` },
                            { label: 'SÜRE', val: `~${Math.ceil(sinav.tahminiSure / 60)} dk` },
                        ].map(({ label, val }) => (
                            <div key={label} className="flex flex-col">
                                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{label}</span>
                                <span className="text-white font-extrabold text-base">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mat-sinav-print-header" style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '1px solid #000', paddingBottom: '5px' }}>
                    <h1 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '3px' }}>{sinav.baslik}</h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '10pt', fontWeight: 'bold' }}>
                        <span>SINIF: {sinav.sinif}</span>
                        <span>SORU: {sinav.sorular.length}</span>
                        <span>PUAN: {sinav.toplamPuan}</span>
                        <span>SÜRE: {Math.ceil(sinav.tahminiSure / 60)} DK</span>
                    </div>
                </div>
            )}

            {/* MEB Kazanımları */}
            {!isPrinting && sinav.secilenKazanimlar && sinav.secilenKazanimlar.length > 0 && (
                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4" style={{ breakInside: 'avoid' }}>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        MEB Matematik Kazanımları
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {sinav.secilenKazanimlar.map((kod) => (
                            <span
                                key={kod}
                                className="px-2.5 py-1 bg-white border border-gray-200 text-black text-[11px] font-mono font-bold rounded-lg shadow-sm"
                            >
                                {kod}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Öğrenci Bilgi Satırı */}
            <div className={`flex flex-wrap gap-4 text-xs font-bold mb-3 ${isPrinting ? 'border border-black px-3 py-2 text-black' : 'border-2 border-gray-100 rounded-2xl px-6 py-4 shadow-sm text-gray-600'}`} style={{ breakInside: 'avoid' }}>
                <span>Ad Soyad: <span className={`border-b inline-block ${isPrinting ? 'border-black w-32' : 'border-gray-300 w-48 h-6'}`}></span></span>
                <span>Sınıf/Şube: <span className={`border-b inline-block ${isPrinting ? 'border-black w-16' : 'border-gray-300 w-24 h-6'}`}></span></span>
                <span>Tarih: <span className={`border-b inline-block ${isPrinting ? 'border-black w-20' : 'border-gray-300 w-28 h-6'}`}></span></span>
                {isPrinting && <span className="ml-auto">Puan: ________ / {sinav.toplamPuan}</span>}
            </div>

            {/* Sorular Listesi */}
            <div 
                className="sorular-container" 
                style={{ 
                    columnCount: columnsCount,
                    columnGap: isPrinting ? '4mm' : questionGap,
                    gap: isPrinting ? '4mm' : questionGap,
                    width: '100%'
                }}
            >
                {sinav.sorular.map((soru, index) => (
                    <div key={soru.id || index} className="mat-sinav-soru-wrapper" style={{ breakInside: 'avoid', marginBottom: isPrinting ? '4mm' : questionGap, display: 'inline-block', width: '100%' }}>
                        <MatSoruCard
                            soru={soru}
                            index={index}
                            onUpdate={onUpdateSoru}
                            onRefresh={onRefreshSoru}
                            isRefreshing={refreshingIndex === index}
                            isPrinting={isPrinting}
                            showAnswers={showAnswers}
                        />
                    </div>
                ))}
            </div>
            
            {/* Yazdırma için özel CSS — compact layout + sayfa bölünmez sorular */}
            {isPrinting && (
                <style>{`
                    .mat-sinav-onizleme.is-printing {
                        padding: 5mm 7mm !important;
                        font-size: 8.5pt !important;
                    }
                    .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper,
                    .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper > div {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .mat-sinav-onizleme.is-printing .sorular-container {
                        gap: 3mm !important;
                        column-gap: 4mm !important;
                    }
                    .mat-sinav-onizleme.is-printing .mat-sinav-print-header {
                        margin-bottom: 5px !important;
                        padding-bottom: 3px !important;
                    }
                    .mat-sinav-onizleme.is-printing .mat-sinav-print-header h1 {
                        font-size: 14pt !important;
                    }
                    .mat-sinav-onizleme.is-printing .mat-sinav-print-header div {
                        font-size: 8.5pt !important;
                        gap: 10px !important;
                    }
                    .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper > div {
                        padding: 1.5mm 2mm !important;
                        margin: 0 !important;
                        border: none !important;
                        border-bottom: 0.5px dashed #ccc !important;
                        border-radius: 0 !important;
                    }
                    .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper > div .soru-label {
                        font-size: 10pt !important;
                    }
                    .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper > div .soru-text {
                        font-size: 8.5pt !important;
                        line-height: 1.3 !important;
                        margin-bottom: 1mm !important;
                    }
                    .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper > div .secenek {
                        font-size: 8pt !important;
                        line-height: 1.2 !important;
                        padding: 0.3mm 1mm !important;
                    }
                `}</style>
            )}

            {/* Alt Bilgi */}
            <div className={`mt-12 pt-6 border-t ${isPrinting ? 'border-black/20 text-black font-bold' : 'border-gray-100 text-gray-400'}`}>
                <p className="text-[10px] text-center uppercase tracking-[0.2em]">
                    bdmind Süper Matematik Sınav Stüdyosu — MEB 2024-2025
                </p>
            </div>
        </div>
    );
};
