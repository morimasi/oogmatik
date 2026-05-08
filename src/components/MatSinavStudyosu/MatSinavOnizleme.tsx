/**
 * MatSinavOnizleme — A4 Sınav Kağıdı Önizleme
 * Sorular + grafik render + inline editing desteği + format toolbar support
 */

import React from 'react';
import type { MatSinav, MatSoru } from '../../types/matSinav';
import { MatSoruCard } from './components/MatSoruCard';
import { PrintConfig } from '../../types/sinav';

interface MatSinavOnizlemeProps {
    sinav: MatSinav;
    onUpdateSoru: (index: number, updated: MatSoru) => void;
    onRefreshSoru: (index: number) => void;
    refreshingIndex: number | null;
    config?: PrintConfig;
    isPrinting?: boolean;
}

export const MatSinavOnizleme: React.FC<MatSinavOnizlemeProps> = ({
    sinav,
    onUpdateSoru,
    onRefreshSoru,
    refreshingIndex,
    config,
    isPrinting = false,
}) => {
    const fontSizePx = config ? `${config.fontSize + 2}px` : '14px';
    const fontFamily = config?.fontFamily === 'times' ? 'Times New Roman, serif' : 'Lexend, Inter, sans-serif';
    const questionGap = config ? `${config.questionSpacingMm * 2}px` : '16px';
    const lineHeight = config ? config.lineHeight : 1.6;
    const textAlign = config ? config.textAlign : 'left';
    const marginMm = config ? config.marginMm : 18;
    const columns = config ? config.columns : 1;

    return (
        <div
            id="mat-sinav-print-target"
            className={`mat-sinav-onizleme bg-white ${isPrinting ? 'p-0 shadow-none ring-0' : 'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5'}`}
            style={{
                fontFamily,
                color: '#000',
                textAlign,
                fontSize: fontSizePx,
                lineHeight,
                padding: isPrinting ? '0' : `${marginMm}px`,
                columnCount: columns,
                columnGap: '12mm',
                minHeight: isPrinting ? 'auto' : '297mm',
            }}
        >
            {/* Sınav Başlığı */}
            {!isPrinting ? (
                <div
                    className="rounded-2xl p-6 mb-6 shadow-lg text-white"
                    style={{ 
                        background: 'linear-gradient(135deg, hsl(var(--accent-h) var(--accent-s) calc(var(--accent-l) - 8%)) 0%, hsl(var(--accent-h) var(--accent-s) var(--accent-l)) 100%)',
                        columnSpan: 'all'
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
                <div style={{ columnSpan: 'all', textAlign: 'center', marginBottom: '25px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px' }}>{sinav.baslik}</h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '15px', fontWeight: 'bold' }}>
                        <span>SINIF: {sinav.sinif}</span>
                        <span>TOPLAM SORU: {sinav.sorular.length}</span>
                        <span>TOPLAM PUAN: {sinav.toplamPuan}</span>
                        <span>SÜRE: {Math.ceil(sinav.tahminiSure / 60)} DK</span>
                    </div>
                </div>
            )}

            {/* MEB Kazanımları - Yazdırmada Gizle */}
            {!isPrinting && sinav.secilenKazanimlar && sinav.secilenKazanimlar.length > 0 && (
                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4" style={{ columnSpan: 'all', breakInside: 'avoid' }}>
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
            <div className={`border-2 rounded-2xl px-6 py-4 mb-8 flex flex-wrap gap-8 text-sm font-bold shadow-sm ${isPrinting ? 'border-black text-black' : 'border-gray-100 text-gray-600'}`} style={{ columnSpan: 'all', breakInside: 'avoid' }}>
                <div className="flex items-center gap-2">
                    <span>Ad Soyad:</span>
                    <span className="border-b-2 border-gray-300 w-48 h-6"></span>
                </div>
                <div className="flex items-center gap-2">
                    <span>Sınıf/Şube:</span>
                    <span className="border-b-2 border-gray-300 w-24 h-6"></span>
                </div>
                <div className="flex items-center gap-2">
                    <span>Tarih:</span>
                    <span className="border-b-2 border-gray-300 w-28 h-6"></span>
                </div>
                {isPrinting && <div className="ml-auto">Puan: ________ / {sinav.toplamPuan}</div>}
            </div>

            {/* Sorular Listesi */}
            <div className="sorular-container" style={{ display: 'block' }}>
                {sinav.sorular.map((soru, index) => (
                    <div key={soru.id || index} style={{ marginBottom: isPrinting ? '30px' : questionGap, breakInside: 'avoid' }}>
                        <MatSoruCard
                            soru={soru}
                            index={index}
                            onUpdate={onUpdateSoru}
                            onRefresh={onRefreshSoru}
                            isRefreshing={refreshingIndex === index}
                            isPrinting={isPrinting}
                        />
                    </div>
                ))}
            </div>

            {/* Alt Bilgi */}
            <div className={`mt-12 pt-6 border-t ${isPrinting ? 'border-black/20 text-black font-bold' : 'border-gray-100 text-gray-400'}`}>
                <p className="text-[10px] text-center uppercase tracking-[0.2em]">
                    Oogmatik Süper Matematik Sınav Stüdyosu — MEB 2024-2025
                </p>
            </div>
        </div>
    );
};
