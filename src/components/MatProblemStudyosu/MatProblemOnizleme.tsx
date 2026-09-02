/**
 * MatProblemStudyosu — A4 Önizleme
 * Açık uçlu problemlerin A4 formatında canlı önizlemesi
 *
 * v2 — Düzeltmeler:
 *  - `ayarlar` prop'u eklendi: `verilenlerGosterilsinMi` ve
 *    `cozumKutusuGosterilsinMi` artık gerçekten UI'a yansıyor.
 *  - `kazanimMetni` (kazanım açıklaması) kazanimKodu'nun yanında gösteriliyor
 *    (MEB 2024-2025 öğretmen/veli bilgi kartı uyumu).
 *  - A4 sayfa bölmeleri için `break-after: page` kuralları eklendi
 *    (her 3 problemde bir yumuşak sayfa sonu).
 */

import React from 'react';
import type { MatProblemSeti, ProblemDizgiAyarlari, MatProblemAyarlari } from '../../types/matProblem';
import { MatProblemSemaView } from './MatProblemSemaView';

interface MatProblemOnizlemeProps {
    problemSeti: MatProblemSeti;
    dizgiAyarlari: ProblemDizgiAyarlari;
    /** Üretim ayarları — kutu görünürlük kontrolü için */
    ayarlar?: MatProblemAyarlari;
    isPrinting?: boolean;
}

const fontSizeMap: Record<string, string> = { '9pt': '9px', '10pt': '10px', '11pt': '11px', '12pt': '12px' };
const lineHeightMap: Record<string, string> = { siki: '1.3', normal: '1.6', ayrik: '2.0' };
const paddingMap: Record<string, string> = { dar: '12mm', orta: '18mm', genis: '25mm' };

export const MatProblemOnizleme: React.FC<MatProblemOnizlemeProps> = ({
    problemSeti,
    dizgiAyarlari,
    ayarlar,
    isPrinting,
}) => {
    const verilenlerGoster = ayarlar?.verilenlerGosterilsinMi ?? true;
    const cozumKutusuGoster = ayarlar?.cozumKutusuGosterilsinMi ?? true;

    const style: React.CSSProperties = {
        fontFamily: dizgiAyarlari.fontAilesi === 'Times New Roman' ? '"Times New Roman", Times, serif' : dizgiAyarlari.fontAilesi === 'Inter' ? 'Inter, sans-serif' : 'Lexend, sans-serif',
        fontSize: fontSizeMap[dizgiAyarlari.fontBoyutu] || '11px',
        lineHeight: lineHeightMap[dizgiAyarlari.satirAraligi] || '1.6',
        textAlign: dizgiAyarlari.metinHizalama || 'left',
        padding: paddingMap[dizgiAyarlari.kenarBoslugu] || '18mm',
    };

    const isDouble = dizgiAyarlari.sutunDuzeni === 'cift';

    return (
        <>
            {/* Yazdırma için gerekli sayfa bölme CSS'i */}
            <style>{`
                .mat-problem-onizleme .mp-problem-card {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                .mat-problem-onizleme .mp-page-break {
                    break-after: page;
                    page-break-after: always;
                }
                @media print {
                    .mat-problem-onizleme {
                        box-shadow: none !important;
                        margin: 0 !important;
                    }
                }
            `}</style>
            <div
                className={`mat-problem-onizleme bg-white ${isPrinting ? 'is-printing print-exact p-0 shadow-none ring-0' : 'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5'}`}
                style={{ width: '210mm', minHeight: '297mm', color: '#1f2937', ...style }}
            >
                {/* Başlık */}
                <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '2px solid #0891b2', paddingBottom: '8px' }}>
                    <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0e7490', margin: 0 }}>
                        {problemSeti.baslik}
                    </h1>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <span>📅 Tarih: ___/___/______</span>
                        <span>👤 Ad Soyad: _________________</span>
                        <span>📐 {problemSeti.problemler.length} Problem • Toplam {problemSeti.toplamPuan} Puan</span>
                    </div>
                </div>

                {/* Problemler */}
                <div className={isDouble ? 'columns-2 gap-6' : ''}>
                    {problemSeti.problemler.map((problem, index) => (
                        <div
                            key={problem.id}
                            className={`mp-problem-card ${((index + 1) % 3 === 0 && index < problemSeti.problemler.length - 1) ? 'mp-page-break' : ''}`}
                            style={{ breakInside: 'avoid', marginBottom: '16px', display: 'inline-block', width: '100%' }}
                        >
                            {/* Problem Başlığı */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                <span style={{ background: '#0891b2', color: 'white', fontWeight: 800, fontSize: '11px', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {index + 1}
                                </span>
                                <span style={{ fontSize: '9px', background: '#f0f9ff', color: '#0e7490', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                                    {problem.kazanimKodu} • {problem.zorluk} • {problem.puan} Puan
                                </span>
                                {/* Kazanım Metni (MEB 2024-2025 öğretmen/veli bilgi kartı) */}
                                {problem.kazanimMetni && (
                                    <span
                                        style={{ fontSize: '8px', background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: '10px', fontWeight: 600, border: '1px solid #fde68a' }}
                                        title={problem.kazanimMetni}
                                    >
                                        📚 {problem.kazanimMetni.length > 60 ? `${problem.kazanimMetni.slice(0, 60)}…` : problem.kazanimMetni}
                                    </span>
                                )}
                            </div>

                            {/* Problem Metni */}
                            <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>
                                {problem.soruMetni}
                            </p>

                            {/* Dinamik Gerçek SVG Şekil, Tablo ve Grafik Motoru */}
                            <MatProblemSemaView problem={problem} />

                            {/* Alt Sorular (Çoklu Soru Formatı) */}
                            {problem.altSorular && problem.altSorular.length > 0 && (
                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                                    <div style={{ fontSize: '8px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px' }}>
                                        ❓ Görsele Ait Alt Sorular
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {problem.altSorular.map((altSoru, altIdx) => (
                                            <div key={altIdx} style={{ fontSize: '10px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                                <span style={{ background: '#0284c7', color: 'white', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                                    {String.fromCharCode(97 + altIdx)})
                                                </span>
                                                <span style={{ flex: 1 }}>{altSoru}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Verilenler & İstenenler Kutusu — sadece ayar açıksa */}
                            {verilenlerGoster && (
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px' }}>
                                        <div style={{ fontSize: '8px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', marginBottom: '4px' }}>📋 Verilenler</div>
                                        {problem.verilenler.map((v, vi) => (
                                            <div key={vi} style={{ fontSize: '10px', color: '#166534' }}>• {v}</div>
                                        ))}
                                    </div>
                                    <div style={{ flex: 1, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px' }}>
                                        <div style={{ fontSize: '8px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '4px' }}>🎯 İstenen</div>
                                        <div style={{ fontSize: '10px', color: '#1e40af' }}>{problem.istenenler}</div>
                                    </div>
                                </div>
                            )}

                            {/* Çözüm Kutusu — sadece ayar açıksa */}
                            {cozumKutusuGoster && (
                                <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '10px', minHeight: '80px', background: '#fafafa' }}>
                                    <div style={{ fontSize: '8px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>✏️ Çözümünü Yaz</div>
                                    <div style={{ borderBottom: '1px dashed #e5e7eb', height: '20px', width: '100%' }} />
                                    <div style={{ borderBottom: '1px dashed #e5e7eb', height: '20px', width: '100%' }} />
                                    <div style={{ borderBottom: '1px dashed #e5e7eb', height: '20px', width: '100%' }} />
                                </div>
                            )}

                            {/* Cevap Kutusu — her zaman gösterilir (öğrenci cevabı için kritik) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                <span style={{ fontSize: '9px', fontWeight: 800, color: '#0e7490' }}>Cevap:</span>
                                <div style={{ flex: 1, borderBottom: '2px solid #0891b2', minWidth: '100px' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
