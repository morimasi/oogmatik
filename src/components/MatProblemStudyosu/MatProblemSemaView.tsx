/**
 * MatProblemSemaView — Gerçek SVG Şekil, Tablo ve Grafik Render Motoru
 * Geometrik Şekiller (Üçgen, Dikdörtgen, Kare, Çember, Yamuk, Açı, Koordinat),
 * Tablolar, Sütun/Pasta/Çizgi Grafikleri, Sayı Doğrusu, Kesir Modelleri
 */

import React from 'react';
import type { MatProblem } from '../../types/matProblem';

interface MatProblemSemaViewProps {
    problem: MatProblem;
}

export const MatProblemSemaView: React.FC<MatProblemSemaViewProps> = ({ problem }) => {
    const text = problem.soruMetni || '';
    const given = problem.verilenler || [];
    const lowerText = text.toLowerCase();

    // AI'dan gelen veriler
    const semaTipi = problem.semaTipi;
    const sv = problem.semaVerisi || {};
    const tv = (problem as any).tabloVerisi;
    const gv = problem.grafikVerisi || (sv as any).grafikVerisi;

    // ─── Otomatik Tip Tespiti (AI semaTipi 'yok' desede metinden anlama) ───
    let resolvedType: string = semaTipi && semaTipi !== 'yok' ? semaTipi : '';

    if (!resolvedType) {
        if (lowerText.includes('dikdörtgen') || lowerText.includes('kare') || lowerText.includes('üçgen') || lowerText.includes('çember') || lowerText.includes('daire') || lowerText.includes('yamuk') || lowerText.includes('paralelkenar') || lowerText.includes('açı')) {
            resolvedType = 'geometrik-sekil';
        } else if (lowerText.includes('tablo') || lowerText.includes('çetele') || lowerText.includes('sıklık') || lowerText.includes('fiyat listesi')) {
            resolvedType = 'tablo';
        } else if (lowerText.includes('grafik') || lowerText.includes('sütun') || lowerText.includes('pasta') || lowerText.includes('çizgi grafiği')) {
            resolvedType = 'grafik';
        } else if (lowerText.includes('sayı doğrusu')) {
            resolvedType = 'sayı-doğrusu';
        } else if (lowerText.includes('kesir') || lowerText.includes('pay') || lowerText.includes('kaçta kaçı')) {
            resolvedType = 'kesir-blokları';
        } else if (lowerText.includes('saat') || lowerText.includes('dakika') || lowerText.includes('başla') || lowerText.includes('bitiş')) {
            resolvedType = 'zaman-tüneli';
        } else if (lowerText.includes('para') || lowerText.includes('tl') || lowerText.includes('ücret') || lowerText.includes('satın al')) {
            resolvedType = 'para-matrisi';
        } else if (lowerText.includes('denklem') || lowerText.includes('terazi') || lowerText.includes('kefe')) {
            resolvedType = 'denklem-şeması';
        } else {
            resolvedType = 'kutu-modeli'; // Varsayılan görsel parça-bütün şeması
        }
    }

    // ─── 1. GERÇEK GEOMETRİK SVG ŞEKİLLER ──────────────────────────
    if (resolvedType === 'geometrik-sekil') {
        const shapeType = (sv.sekilTipi || (lowerText.includes('kare') ? 'kare' : lowerText.includes('dikdörtgen') ? 'dikdortgen' : lowerText.includes('çember') || lowerText.includes('daire') ? 'cember' : lowerText.includes('açı') ? 'aci' : lowerText.includes('yamuk') ? 'yamuk' : lowerText.includes('paralelkenar') ? 'paralelkenar' : 'dik-ucgen')).toLowerCase();

        const etiketler = sv.etiketler || {};
        const tabanEtiket = etiketler.taban || given[0] || 'Taban (a)';
        const yukseklikEtiket = etiketler.yukseklik || given[1] || 'Yükseklik (h)';
        const hipotenusEtiket = etiketler.hipotenus || 'Hipotenüs (c)';
        const aciEtiket = etiketler.aci || '90°';

        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-cyan-700 uppercase tracking-wider mb-2">
                    <span>📐 Geometric Model (SVG):</span>
                    <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-md font-mono">{shapeType.toUpperCase()}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 py-2 bg-white rounded-lg border border-slate-100 p-3">
                    {/* DİK ÜÇGEN */}
                    {shapeType.includes('ucgen') || shapeType.includes('üçgen') ? (
                        <svg width="180" height="110" viewBox="0 0 180 110" className="overflow-visible drop-shadow-sm">
                            {/* Üçgen Yüzeyi */}
                            <polygon points="20,95 150,95 150,20" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" strokeLinejoin="round" />
                            {/* Dik Açı Sembolü */}
                            <path d="M 138,95 L 138,83 L 150,83" fill="none" stroke="#0369a1" strokeWidth="2" />
                            <circle cx="143" cy="89" r="2" fill="#0369a1" />
                            {/* Köşe Etiketleri */}
                            <text x="10" y="105" fontSize="10" fontWeight="bold" fill="#0369a1">A</text>
                            <text x="158" y="105" fontSize="10" fontWeight="bold" fill="#0369a1">B</text>
                            <text x="158" y="15" fontSize="10" fontWeight="bold" fill="#0369a1">C</text>
                            {/* Kenar Ölçü Etiketleri */}
                            <text x="85" y="107" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">{tabanEtiket}</text>
                            <text x="162" y="60" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="start">{yukseklikEtiket}</text>
                            <text x="75" y="50" fontSize="9" fontWeight="bold" fill="#0284c7" textAnchor="end">{hipotenusEtiket}</text>
                        </svg>
                    ) : null}

                    {/* DİKDÖRTGEN */}
                    {shapeType.includes('dikdortgen') || shapeType.includes('dikdörtgen') ? (
                        <svg width="190" height="100" viewBox="0 0 190 100" className="overflow-visible drop-shadow-sm">
                            <rect x="25" y="15" width="140" height="70" rx="3" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                            {/* Dik köşe işaretleri */}
                            <path d="M 25,25 L 35,25 L 35,15" fill="none" stroke="#0369a1" strokeWidth="1.5" />
                            <path d="M 155,25 L 155,25 L 155,15" fill="none" stroke="#0369a1" strokeWidth="1.5" />
                            {/* Köşeler */}
                            <text x="12" y="15" fontSize="10" fontWeight="bold" fill="#0369a1">A</text>
                            <text x="172" y="15" fontSize="10" fontWeight="bold" fill="#0369a1">B</text>
                            <text x="172" y="95" fontSize="10" fontWeight="bold" fill="#0369a1">C</text>
                            <text x="12" y="95" fontSize="10" fontWeight="bold" fill="#0369a1">D</text>
                            {/* Kenarlar */}
                            <text x="95" y="10" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">Uzun Kenar: {tabanEtiket}</text>
                            <text x="95" y="97" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">{tabanEtiket}</text>
                            <text x="170" y="53" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="start">{yukseklikEtiket}</text>
                            <text x="18" y="53" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="end">{yukseklikEtiket}</text>
                        </svg>
                    ) : null}

                    {/* KARE */}
                    {shapeType.includes('kare') ? (
                        <svg width="120" height="110" viewBox="0 0 120 110" className="overflow-visible drop-shadow-sm">
                            <rect x="20" y="15" width="80" height="80" rx="2" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                            {/* Eşitlik çizgileri */}
                            <line x1="60" y1="11" x2="60" y2="19" stroke="#0284c7" strokeWidth="2" />
                            <line x1="60" y1="91" x2="60" y2="99" stroke="#0284c7" strokeWidth="2" />
                            <line x1="16" y1="55" x2="24" y2="55" stroke="#0284c7" strokeWidth="2" />
                            <line x1="96" y1="55" x2="104" y2="55" stroke="#0284c7" strokeWidth="2" />
                            <text x="60" y="8" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">Kenar (a): {tabanEtiket}</text>
                            <text x="60" y="107" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">a = {tabanEtiket}</text>
                        </svg>
                    ) : null}

                    {/* ÇEMBER / DAİRE */}
                    {shapeType.includes('cember') || shapeType.includes('daire') ? (
                        <svg width="140" height="120" viewBox="0 0 140 120" className="overflow-visible drop-shadow-sm">
                            <circle cx="70" cy="60" r="45" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2.5" />
                            {/* Merkez Noktası O */}
                            <circle cx="70" cy="60" r="3" fill="#0369a1" />
                            <text x="70" y="54" fontSize="9" fontWeight="bold" fill="#0369a1" textAnchor="middle">O</text>
                            {/* Yarıçap Çizgisi */}
                            <line x1="70" y1="60" x2="115" y2="60" stroke="#0284c7" strokeWidth="2" strokeDasharray="3,3" />
                            <text x="92" y="55" fontSize="8" fontWeight="bold" fill="#0284c7" textAnchor="middle">r (Yarıçap)</text>
                            <text x="70" y="116" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">Yarıçap r: {tabanEtiket}</text>
                        </svg>
                    ) : null}

                    {/* AÇI ŞEMASI */}
                    {shapeType.includes('aci') || shapeType.includes('açı') ? (
                        <svg width="160" height="110" viewBox="0 0 160 110" className="overflow-visible drop-shadow-sm">
                            <line x1="20" y1="90" x2="140" y2="90" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="20" y1="90" x2="110" y2="20" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                            {/* Açı Yayı */}
                            <path d="M 50,90 A 30 30 0 0 0 43,67" fill="none" stroke="#0369a1" strokeWidth="2" />
                            <circle cx="20" cy="90" r="3" fill="#0369a1" />
                            <text x="12" y="102" fontSize="9" fontWeight="bold" fill="#0369a1">O</text>
                            <text x="60" y="75" fontSize="9" fontWeight="bold" fill="#0e7490">{aciEtiket}</text>
                        </svg>
                    ) : null}

                    {/* Şekil Detay Bilgileri */}
                    <div className="text-[10px] text-slate-700 space-y-1 bg-slate-50 p-2.5 rounded-md border border-slate-200 min-w-[150px]">
                        <div className="font-bold text-cyan-700 text-[11px] border-b border-slate-200 pb-1 mb-1">📋 Problem Verileri</div>
                        <div>• Taban / Genişlik: <strong className="text-slate-900">{tabanEtiket}</strong></div>
                        <div>• Yükseklik / Derinlik: <strong className="text-slate-900">{yukseklikEtiket}</strong></div>
                        {given[0] && <div>• Verilen A: <span className="text-slate-600">{given[0]}</span></div>}
                        {given[1] && <div>• Verilen B: <span className="text-slate-600">{given[1]}</span></div>}
                        <div className="text-cyan-600 font-semibold pt-1">🎯 İstenen: {problem.istenenler}</div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── 2. GERÇEK DİNAMİK TABLO (TABLE RENDERER) ──────────────────
    if (resolvedType === 'tablo') {
        const sutunlar = tv?.sutunlar || ['Öğe / Kategori', 'Miktar / Değer', 'Birim Fiyat', 'Toplam'];
        const satirData = tv?.satirData || [
            [given[0] || '1. Veri Grubu', '12', '15 TL', '180 TL'],
            [given[1] || '2. Veri Grubu', '8', '25 TL', '200 TL'],
            [given[2] || '3. Veri Grubu', '5', '40 TL', '200 TL'],
            ['GENEL TOPLAM', '-', '-', problem.istenenler || '🎯 Hesaplayınız (?)'],
        ];

        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-2 shadow-sm">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-cyan-700 uppercase tracking-wider mb-2">
                    <span>📊 Problem Veri Tablosu:</span>
                    <span className="text-slate-500 font-normal">Soru İle Uyumlu Veriler</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-left text-[10px] border-collapse">
                        <thead>
                            <tr className="bg-cyan-600 text-white font-bold">
                                {sutunlar.map((s: string, idx: number) => (
                                    <th key={idx} className="p-2 border-b border-cyan-700">{s}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {satirData.map((row: string[], rIdx: number) => (
                                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                    {row.map((cell: string, cIdx: number) => (
                                        <td key={cIdx} className={`p-2 border-b border-slate-100 ${cIdx === row.length - 1 ? 'font-bold text-cyan-800' : 'text-slate-700'}`}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // ─── 3. GERÇEK SÜTUN / PASTA / ÇİZGİ GRAFİĞİ (CHART RENDERER) ──
    if (resolvedType === 'grafik') {
        const veriler = gv?.veriler || [
            { etiket: given[0]?.split(':')[0] || 'Ocak', deger: 40, renk: '#0284c7' },
            { etiket: given[1]?.split(':')[0] || 'Şubat', deger: 75, renk: '#0d9488' },
            { etiket: given[2]?.split(':')[0] || 'Mart', deger: 55, renk: '#6366f1' },
            { etiket: 'Nisan (?)', deger: 90, renk: '#f59e0b' },
        ];

        const maxVal = Math.max(...veriler.map((v: any) => v.deger || 10), 100);

        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-2 shadow-sm">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-cyan-700 uppercase tracking-wider mb-2">
                    <span>📈 Sütun Grafiği (SVG):</span>
                    <span className="text-slate-500 font-normal">{gv?.baslik || 'Veri Dağılım Grafiği'}</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-100 flex justify-center">
                    <svg width="280" height="140" viewBox="0 0 280 140" className="overflow-visible">
                        {/* Y-Eksen Çizgileri */}
                        <line x1="35" y1="20" x2="35" y2="110" stroke="#cbd5e1" strokeWidth="2" />
                        <line x1="35" y1="110" x2="260" y2="110" stroke="#cbd5e1" strokeWidth="2" />
                        {/* Izgara Çizgileri */}
                        <line x1="35" y1="35" x2="260" y2="35" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="35" y1="70" x2="260" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                        {/* Sütunlar */}
                        {veriler.map((item: any, idx: number) => {
                            const barHeight = Math.round((item.deger / maxVal) * 80);
                            const xPos = 55 + idx * 52;
                            const yPos = 110 - barHeight;
                            return (
                                <g key={idx}>
                                    <rect x={xPos} y={yPos} width="32" height={barHeight} fill={item.renk || '#0284c7'} rx="3" />
                                    <text x={xPos + 16} y={yPos - 5} fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">{item.deger}</text>
                                    <text x={xPos + 16} y="125" fontSize="8" fontWeight="bold" fill="#64748b" textAnchor="middle">{item.etiket}</text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        );
    }

    // ─── 4. SAYI DOĞRUSU (NUMBER LINE RENDERER) ─────────────────────
    if (resolvedType === 'sayı-doğrusu') {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-2 shadow-sm">
                <div className="text-[10px] font-extrabold text-cyan-700 uppercase tracking-wider mb-2">
                    📏 Sayı Doğrusu Modeli (SVG):
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 flex justify-center">
                    <svg width="320" height="60" viewBox="0 0 320 60">
                        {/* Ana Çizgi ve Oklar */}
                        <line x1="15" y1="35" x2="305" y2="35" stroke="#0284c7" strokeWidth="2.5" />
                        <polygon points="10,35 18,30 18,40" fill="#0284c7" />
                        <polygon points="310,35 302,30 302,40" fill="#0284c7" />
                        {/* Çentikler */}
                        {[0, 1, 2, 3, 4, 5].map((num, i) => {
                            const x = 35 + i * 50;
                            return (
                                <g key={i}>
                                    <line x1={x} y1="28" x2={x} y2="42" stroke="#0369a1" strokeWidth="2" />
                                    <text x={x} y="55" fontSize="10" fontWeight="bold" fill="#334155" textAnchor="middle">{num}</text>
                                </g>
                            );
                        })}
                        {/* Atlama Yayı */}
                        <path d="M 35,28 Q 85,5 135,28" fill="none" stroke="#e11d48" strokeWidth="2" strokeDasharray="3,3" />
                        <text x="85" y="12" fontSize="9" fontWeight="bold" fill="#e11d48" textAnchor="middle">+2 Birim</text>
                    </svg>
                </div>
            </div>
        );
    }

    // ─── 5. KESİR BLOKLARI (FRACTION MODEL) ────────────────────────
    if (resolvedType === 'kesir-blokları') {
        const pay = sv.kesirOrani?.pay || 3;
        const paydaya = sv.kesirOrani?.paydaya || 5;

        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-2 shadow-sm">
                <div className="text-[10px] font-extrabold text-cyan-700 uppercase tracking-wider mb-2">
                    🍰 Kesir Modeli ({pay} / {paydaya}):
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-2">
                    <div className="flex border-2 border-cyan-600 rounded-lg overflow-hidden h-9 shadow-inner">
                        {Array.from({ length: paydaya }).map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 border-r last:border-r-0 border-cyan-400 flex items-center justify-center font-bold text-xs ${i < pay ? 'bg-cyan-500 text-white' : 'bg-slate-50 text-slate-400'
                                    }`}
                            >
                                {i < pay ? `${i + 1}/${paydaya}` : '?'}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 px-1">
                        <span>Boyalı Kısım (Pay): <strong className="text-cyan-700">{pay}</strong></span>
                        <span>Toplam Parça (Payda): <strong className="text-cyan-700">{paydaya}</strong></span>
                    </div>
                </div>
            </div>
        );
    }

    // ─── 6. ZAMAN TÜNELİ (TIMELINE RENDERER) ───────────────────────
    if (resolvedType === 'zaman-tüneli') {
        const baslangic = sv.zamanAkisi?.baslangic || '09:00';
        const bitis = sv.zamanAkisi?.bitis || '___ : ___';
        const sure = sv.zamanAkisi?.gecenSure || given[0] || 'Geçen Süre';

        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-2 shadow-sm">
                <div className="text-[10px] font-extrabold text-cyan-700 uppercase tracking-wider mb-2">
                    ⏱️ Zaman Akış Tüneli:
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="text-center">
                        <span className="text-xs font-bold text-slate-500 block">Başlangıç</span>
                        <span className="text-sm font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{baslangic}</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-4">
                        <span className="text-[10px] font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200 mb-1">⏳ {sure}</span>
                        <div className="w-full h-1 bg-cyan-500 relative flex items-center justify-end">
                            <div className="w-2 h-2 bg-cyan-600 rotate-45 transform translate-x-1"></div>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="text-xs font-bold text-slate-500 block">Bitiş</span>
                        <span className="text-sm font-extrabold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-300">{bitis}</span>
                    </div>
                </div>
            </div>
        );
    }

    // ─── 7. KUTU MODELİ (BOX MODEL - PARÇA BÜTÜN) ─────────────────
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-2 shadow-sm">
            <div className="text-[10px] font-extrabold text-cyan-700 uppercase tracking-wider mb-2">
                🧩 Parça - Bütün Kutu Modeli:
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
                <div className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1.5 rounded-lg shadow-sm">
                    {sv.kutuModeli?.parcaA || given[0] || 'Parça A'}
                </div>
                <span className="text-slate-400 font-extrabold text-sm">+</span>
                <div className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1.5 rounded-lg shadow-sm">
                    {sv.kutuModeli?.parcaB || given[1] || 'Parça B'}
                </div>
                <span className="text-slate-400 font-extrabold text-sm">=</span>
                <div className="bg-amber-50 text-amber-800 border-2 border-dashed border-amber-400 px-4 py-1.5 rounded-lg shadow-sm">
                    {sv.kutuModeli?.toplam || problem.istenenler || 'Toplam (?)'}
                </div>
            </div>
        </div>
    );
};
