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
}

export const MatSinavOnizleme: React.FC<MatSinavOnizlemeProps> = ({
    sinav,
    onUpdateSoru,
    onRefreshSoru,
    refreshingIndex,
    config,
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
            className="mat-sinav-onizleme bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
            style={{
                fontFamily,
                color: '#1e293b', // slate-800 for high contrast
                textAlign,
                fontSize: fontSizePx,
                lineHeight,
                padding: `${marginMm}px`,
                columnCount: columns,
                columnGap: '12mm',
                minHeight: '297mm', // A4 height approximation
            }}
        >
            {/* Sınav Başlığı - Premium Gradient */}
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

            {/* MEB Kazanımları - Badge Style */}
            {sinav.secilenKazanimlar && sinav.secilenKazanimlar.length > 0 && (
                <div className="mb-6 bg-[var(--bg-secondary)]/80 border border-[var(--border-color)]/60 rounded-xl p-4 backdrop-blur-sm" style={{ columnSpan: 'all', breakInside: 'avoid' }}>
                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="p-1 bg-sky-100 rounded-lg text-sky-600">
                            <i className="fa-solid fa-layer-group text-[10px]"></i>
                        </span>
                        MEB Matematik Kazanımları
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {sinav.secilenKazanimlar.map((kod) => (
                            <span
                                key={kod}
                                className="px-2.5 py-1 bg-white border border-[var(--border-color)] text-[var(--text-primary)] text-[11px] font-mono font-bold rounded-lg shadow-sm"
                            >
                                {kod}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Öğrenci Bilgi Satırı - High Contrast */}
            <div className="bg-white border-2 border-[var(--border-color)] rounded-2xl px-6 py-4 mb-8 flex flex-wrap gap-8 text-sm text-[var(--text-muted)] font-medium shadow-sm" style={{ columnSpan: 'all', breakInside: 'avoid' }}>
                <div className="flex items-center gap-2">
                    <span>Ad Soyad:</span>
                    <span className="border-b-2 border-[var(--border-color)] w-48 h-6"></span>
                </div>
                <div className="flex items-center gap-2">
                    <span>Sınıf/Şube:</span>
                    <span className="border-b-2 border-[var(--border-color)] w-24 h-6"></span>
                </div>
                <div className="flex items-center gap-2">
                    <span>Tarih:</span>
                    <span className="border-b-2 border-[var(--border-color)] w-28 h-6"></span>
                </div>
            </div>

            {/* Sorular Listesi */}
            <div className="sorular-container" style={{ display: 'block' }}>
                {sinav.sorular.map((soru, index) => (
                    <div key={soru.id || index} style={{ marginBottom: questionGap, breakInside: 'avoid' }}>
                        <MatSoruCard
                            soru={soru}
                            index={index}
                            onUpdate={onUpdateSoru}
                            onRefresh={onRefreshSoru}
                            isRefreshing={refreshingIndex === index}
                        />
                    </div>
                ))}
            </div>


            {/* Alt Bilgi */}
            <div className="mt-12 pt-6 border-t border-[var(--border-color)] text-center opacity-40">
                <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-[0.2em]">
                    Oogmatik Süper Matematik Sınav Stüdyosu — MEB 2024-2025
                </p>
            </div>
        </div>
    );
};
