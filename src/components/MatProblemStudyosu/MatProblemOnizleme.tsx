/**
 * MatProblemStudyosu — A4 Önizleme
 * Açık uçlu problemlerin A4 formatında canlı önizlemesi
 */

import React from 'react';
import type { MatProblemSeti, ProblemDizgiAyarlari } from '../../types/matProblem';

interface MatProblemOnizlemeProps {
    problemSeti: MatProblemSeti;
    dizgiAyarlari: ProblemDizgiAyarlari;
    isPrinting?: boolean;
}

const fontSizeMap: Record<string, string> = { '9pt': '9px', '10pt': '10px', '11pt': '11px', '12pt': '12px' };
const lineHeightMap: Record<string, string> = { siki: '1.3', normal: '1.6', ayrik: '2.0' };
const paddingMap: Record<string, string> = { dar: '12mm', orta: '18mm', genis: '25mm' };

export const MatProblemOnizleme: React.FC<MatProblemOnizlemeProps> = ({ problemSeti, dizgiAyarlari, isPrinting }) => {
    const style: React.CSSProperties = {
        fontFamily: dizgiAyarlari.fontAilesi === 'Times New Roman' ? '"Times New Roman", Times, serif' : dizgiAyarlari.fontAilesi === 'Inter' ? 'Inter, sans-serif' : 'Lexend, sans-serif',
        fontSize: fontSizeMap[dizgiAyarlari.fontBoyutu] || '11px',
        lineHeight: lineHeightMap[dizgiAyarlari.satirAraligi] || '1.6',
        textAlign: dizgiAyarlari.metinHizalama || 'left',
        padding: paddingMap[dizgiAyarlari.kenarBoslugu] || '18mm',
    };

    const isDouble = dizgiAyarlari.sutunDuzeni === 'cift';

    return (
        <div
            className={`mat-problem-onizleme bg-white ${isPrinting ? 'is-printing print-exact p-0 shadow-none ring-0' : 'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5'}`}
            style={{ width: '210mm', minHeight: '297mm', color: '#1f2937', ...style }}
        >
            {/* Başlık */}
            <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '2px solid #0891b2', paddingBottom: '8px' }}>
                <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0e7490', margin: 0 }}>
                    {problemSeti.baslik}
                </h1>
                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <span>📅 Tarih: ___/___/______</span>
                    <span>👤 Ad Soyad: _________________</span>
                    <span>📐 {problemSeti.problemler.length} Problem • Toplam {problemSeti.toplamPuan} Puan</span>
                </div>
            </div>

            {/* Problemler */}
            <div className={isDouble ? 'columns-2 gap-6' : ''} style={{ breakInside: 'avoid' }}>
                {problemSeti.problemler.map((problem, index) => (
                    <div key={problem.id} style={{ breakInside: 'avoid', marginBottom: '16px', display: 'inline-block', width: '100%' }}>
                        {/* Problem Başlığı */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ background: '#0891b2', color: 'white', fontWeight: 800, fontSize: '11px', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {index + 1}
                            </span>
                            <span style={{ fontSize: '9px', background: '#f0f9ff', color: '#0e7490', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                                {problem.kazanimKodu} • {problem.zorluk} • {problem.puan} Puan
                            </span>
                        </div>

                        {/* Problem Metni */}
                        <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>
                            {problem.soruMetni}
                        </p>

                        {/* Dinamik Şema Rendering — Problem Verilerine %100 Bağlı */}
                        {problem.semaTipi && problem.semaTipi !== 'yok' && (
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                                <div style={{ fontSize: '9px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>🧩 Şema / Model:</span>
                                    <span style={{ color: '#0284c7' }}>{problem.semaTipi}</span>
                                </div>

                                {problem.semaTipi === 'kutu-modeli' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                                        <div style={{ border: '2px solid #0284c7', background: '#e0f2fe', padding: '6px 12px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                                            {problem.semaVerisi?.kutuModeli?.parcaA || problem.verilenler[0] || 'Parça A'}
                                        </div>
                                        <span style={{ fontWeight: 800 }}>+</span>
                                        <div style={{ border: '2px solid #0284c7', background: '#e0f2fe', padding: '6px 12px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                                            {problem.semaVerisi?.kutuModeli?.parcaB || problem.verilenler[1] || 'Parça B'}
                                        </div>
                                        <span style={{ fontWeight: 800 }}>=</span>
                                        <div style={{ border: '2px dashed #0369a1', background: '#bae6fd', padding: '6px 16px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, color: '#0369a1' }}>
                                            {problem.semaVerisi?.kutuModeli?.toplam || problem.istenenler || 'Toplam (?)'}
                                        </div>
                                    </div>
                                )}

                                {problem.semaTipi === 'kesir-blokları' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '4px 0' }}>
                                        <div style={{ display: 'flex', border: '1px solid #0284c7', borderRadius: '4px', overflow: 'hidden', height: '24px' }}>
                                            <div style={{ flex: problem.semaVerisi?.kesirOrani?.pay || 1, background: '#38bdf8', color: 'white', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {problem.semaVerisi?.kesirOrani?.pay || 1} / {problem.semaVerisi?.kesirOrani?.paydaya || 4} ({problem.semaVerisi?.kesirOrani?.etiket || 'Pay'})
                                            </div>
                                            <div style={{ flex: Math.max(1, (problem.semaVerisi?.kesirOrani?.paydaya || 4) - (problem.semaVerisi?.kesirOrani?.pay || 1)), background: '#f1f5f9', color: '#64748b', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                Kalan Parça (?)
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {problem.semaTipi === 'zaman-tüneli' && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '2px solid #0284c7', paddingTop: '8px', marginTop: '6px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#0369a1' }}>Başlangıç</div>
                                            <div style={{ fontSize: '10px', fontWeight: 800 }}>{problem.semaVerisi?.zamanAkisi?.baslangic || '08:30'}</div>
                                        </div>
                                        <div style={{ fontSize: '9px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                                            ⏱️ {problem.semaVerisi?.zamanAkisi?.gecenSure || 'Geçen Süre'}
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#0369a1' }}>Bitiş</div>
                                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#0284c7' }}>{problem.semaVerisi?.zamanAkisi?.bitis || '___ : ___'}</div>
                                        </div>
                                    </div>
                                )}

                                {problem.semaTipi === 'denklem-şeması' && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '6px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#0f172a' }}>⚖️ [ {problem.semaVerisi?.denklemSol || problem.verilenler[0] || 'Sol Kefe'} ]</span>
                                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#0284c7' }}>═ EQUAL ═</span>
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#0f172a' }}>[ {problem.semaVerisi?.denklemSag || problem.istenenler || 'Sağ Kefe'} ]</span>
                                    </div>
                                )}

                                {problem.semaTipi === 'para-matrisi' && (
                                    <div style={{ display: 'flex', gap: '10px', fontSize: '9.5px', fontWeight: 700 }}>
                                        <div style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '4px 8px', borderRadius: '4px' }}>
                                            🪙 Verilen: {problem.semaVerisi?.paraMatrisi?.verilen || '50 TL'}
                                        </div>
                                        <div style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '4px' }}>
                                            🛒 Tutar: {problem.semaVerisi?.paraMatrisi?.tutar || '32 TL'}
                                        </div>
                                        <div style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', padding: '4px 8px', borderRadius: '4px' }}>
                                            💵 Para Üstü: {problem.semaVerisi?.paraMatrisi?.paraUstu || '(?)'}
                                        </div>
                                    </div>
                                )}

                                {problem.semaTipi === 'geometrik-sekil' && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '6px 0', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px' }}>
                                        <svg width="130" height="85" viewBox="0 0 130 85" style={{ overflow: 'visible' }}>
                                            <polygon points="10,75 115,75 115,10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                                            <path d="M 105,75 L 105,65 L 115,65" fill="none" stroke="#0369a1" strokeWidth="1.5" />
                                            <circle cx="109" cy="70" r="1.5" fill="#0369a1" />
                                            <text x="62" y="84" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                                                {problem.semaVerisi?.etiketler?.taban || 'Taban (a)'}
                                            </text>
                                            <text x="120" y="45" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="start">
                                                {problem.semaVerisi?.etiketler?.yukseklik || 'Yükseklik (h)'}
                                            </text>
                                            <text x="58" y="38" fontSize="8" fontWeight="bold" fill="#0284c7" textAnchor="middle">
                                                {problem.semaVerisi?.etiketler?.hipotenus || 'Hipotenüs (c)'}
                                            </text>
                                        </svg>
                                        <div style={{ fontSize: '9px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontWeight: 800, color: '#0284c7' }}>📐 Problem Verileri:</span>
                                            <span>• Açı: {problem.semaVerisi?.etiketler?.aci || '90° Dik Açı'}</span>
                                            <span>• Verilen: {problem.verilenler[0] || 'Kenar Bilgileri'}</span>
                                            <span>• İstenen: {problem.istenenler}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Verilenler & İstenenler Kutusu */}
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

                        {/* Çözüm Kutusu */}
                        <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '10px', minHeight: '80px', background: '#fafafa' }}>
                            <div style={{ fontSize: '8px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>✏️ Çözümünü Yaz</div>
                            <div style={{ borderBottom: '1px dashed #e5e7eb', height: '20px', width: '100%' }} />
                            <div style={{ borderBottom: '1px dashed #e5e7eb', height: '20px', width: '100%' }} />
                            <div style={{ borderBottom: '1px dashed #e5e7eb', height: '20px', width: '100%' }} />
                        </div>

                        {/* Cevap Kutusu */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#0e7490' }}>Cevap:</span>
                            <div style={{ flex: 1, borderBottom: '2px solid #0891b2', minWidth: '100px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
