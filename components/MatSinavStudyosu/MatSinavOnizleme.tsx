/**
 * MatSinavOnizleme — A4 Sınav Kağıdı Önizleme
 * Sorular + grafik render + inline editing desteği + format toolbar support
 */

import React from 'react';
import type { MatSinav, MatSoru } from '../../src/types/matSinav';
import { MatSoruCard } from './components/MatSoruCard';
import { PrintConfig } from '../../src/utils/sinavPdfGenerator';

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
    const lineHeight = config ? config.lineHeight : 1.6;
    const textAlign = config ? config.textAlign : 'left';
    const marginMm = config ? config.marginMm : 18;
    const columns = config ? config.columns : 1;

    return (
        <div
            className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-[800px] mx-auto"
            style={{
                fontFamily,
                fontSize: fontSizePx,
                lineHeight,
                textAlign,
                padding: `${marginMm}px`,
                columnCount: columns,
                columnGap: '12mm'
            }}
        >
            {/* Sınav Başlığı */}
            <div className="border-2 border-indigo-500 rounded-xl mx-6 mt-6 p-4">
                <h1 className="text-lg font-extrabold text-indigo-800 mb-1">{sinav.baslik}</h1>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{sinav.sinif}. Sınıf</span>
                    <span>·</span>
                    <span>{sinav.sorular.length} Soru</span>
                    <span>·</span>
                    <span>{sinav.toplamPuan} Puan</span>
                    <span>·</span>
                    <span>~{Math.ceil(sinav.tahminiSure / 60)} dakika</span>
                </div>
            </div>

            {/* Öğrenci Bilgi Satırı */}
            <div className="mx-6 mt-3 pb-3 border-b border-gray-200 text-xs text-gray-400">
                <span>Ad Soyad: _________________________________ &nbsp;&nbsp; </span>
                <span>Sınıf/Şube: _________ &nbsp;&nbsp; </span>
                <span>Tarih: _________</span>
            </div>

            {/* Sorular */}
            <div className="px-6 py-4 space-y-3">
                {sinav.sorular.map((soru, index) => (
                    <MatSoruCard
                        key={soru.id || index}
                        soru={soru}
                        index={index}
                        onUpdate={onUpdateSoru}
                        onRefresh={onRefreshSoru}
                        isRefreshing={refreshingIndex === index}
                    />
                ))}
            </div>

            {/* Alt Bilgi */}
            <div className="mx-6 mb-6 mt-2 pt-3 border-t border-gray-100 text-center">
                <span className="text-[9px] text-gray-300">Oogmatik Süper Matematik Sınav Stüdyosu — MEB 2024-2025</span>
            </div>
        </div>
    );
};
