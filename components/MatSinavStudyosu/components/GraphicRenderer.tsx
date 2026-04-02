/**
 * GraphicRenderer — HD Kalite Matematik Görsel Motoru
 *
 * Desteklenen 28 tip:
 *   Veri:      siklik_tablosu · cetele_tablosu · sutun_grafigi · pasta_grafigi · cizgi_grafigi
 *   Geometri:  ucgen · dik_ucgen · kare · dikdortgen · paralel_kenar · cokgen · daire
 *              dogru_parcasi · aci · simetri · kesisen_dogrular · paralel_dogrular
 *   3D Geometri: kup · silindir · koni · piramit · dikdortgenler_prizmasi
 *   Analitik:  koordinat_sistemi · koordinat_grafigi · sayi_dogrusu
 *   Kavramsal: kesir_modeli · venn_diyagrami · olaslik_cark
 *
 * Tasarım: Lexend font · gradient fills · drop-shadow filtresi · yüksek kontrast
 */

import React from 'react';
import type { GrafikVerisi } from '../../../src/types/matSinav';

// ── Ortak sabitler ───────────────────────────────────────────────────────────

const FONT = 'Lexend, system-ui, sans-serif';

const COLORS = [
    '#4f46e5', // indigo-600
    '#0ea5e9', // sky-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ec4899', // pink-500
    '#8b5cf6', // violet-500
    '#ef4444', // red-500
    '#14b8a6', // teal-500
];

// Şekil dolgu opaklıkları için sabitler (hex renk kodu sonekinde kullanılır)
// 16 hex ≈ %9 opaklık (çok hafif dolgu), 18 hex ≈ %10 opaklık
const FILL_OPACITY_LIGHT = '16';   // ~9% — neredeyse şeffaf dolgu
const FILL_OPACITY_MED = '20';     // ~12%

// ── Shared SVG primitives ────────────────────────────────────────────────────

const SvgDefs: React.FC<{ id: string; color: string }> = ({ id, color }) => (
    <defs>
        <filter id={`shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor={color} floodOpacity="0.15" />
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.06" />
        </filter>
        <linearGradient id={`gradV-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`shapeFill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
        <marker id={`arrow-${id}`} markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto-start-reverse">
            <path d="M0,1 L0,7 L8,4 Z" fill={color} />
        </marker>
        <marker id={`arrowL-${id}`} markerWidth="10" markerHeight="10" refX="2" refY="4" orient="auto-start-reverse">
            <path d="M0,1 L0,7 L8,4 Z" fill={color} />
        </marker>
    </defs>
);

const GridLines: React.FC<{ x1: number; x2: number; yValues: number[] }> = ({ x1, x2, yValues }) => (
    <>
        {yValues.map((y, i) => (
            <line key={i} x1={x1} y1={y} x2={x2} y2={y}
                stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3" />
        ))}
    </>
);

// ── Ana bileşen ──────────────────────────────────────────────────────────────

export const GraphicRenderer: React.FC<{ grafik?: GrafikVerisi; className?: string }> = ({
    grafik,
    className = '',
}) => {
    if (!grafik) return null;

    const { tip, baslik, veri, ozellikler, not } = grafik;
    const anaRenk = ozellikler?.renk || COLORS[0];
    const uid = tip.replace(/_/g, '-');

    const renderContent = (): React.ReactNode => {

        /* ── SIKLIK TABLOSU ─────────────────────────────────────────────── */
        if (tip === 'siklik_tablosu') {
            const toplam = veri.reduce((s, v) => s + (v.deger || 0), 0) || 1;
            return (
                <div className="w-full overflow-hidden rounded-xl border border-indigo-100 shadow-sm mt-3">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: `linear-gradient(90deg,${anaRenk}22,${anaRenk}0a)` }}>
                                <th className="px-4 py-2.5 text-left font-bold text-gray-700" style={{ fontFamily: FONT }}>Kategori</th>
                                <th className="px-4 py-2.5 text-right font-bold text-gray-700" style={{ fontFamily: FONT }}>Sıklık</th>
                                <th className="px-4 py-2.5 text-right font-bold text-gray-700" style={{ fontFamily: FONT }}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {veri.map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                    <td className="px-4 py-2 font-medium text-gray-800" style={{ fontFamily: FONT }}>
                                        <span className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                                            style={{ background: COLORS[idx % COLORS.length] }} />
                                        {item.etiket}{item.nesne ? ` (${item.nesne})` : ''}
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold" style={{ color: COLORS[idx % COLORS.length], fontFamily: FONT }}>
                                        {item.deger}{item.birim ? ` ${item.birim}` : ''}
                                    </td>
                                    <td className="px-4 py-2 text-right text-xs text-gray-500" style={{ fontFamily: FONT }}>
                                        {Math.round(((item.deger || 0) / toplam) * 100)}%
                                    </td>
                                </tr>
                            ))}
                            <tr className="border-t-2 border-gray-200">
                                <td className="px-4 py-2 font-extrabold text-gray-700" style={{ fontFamily: FONT }}>Toplam</td>
                                <td className="px-4 py-2 text-right font-extrabold" style={{ color: anaRenk, fontFamily: FONT }}>{toplam}</td>
                                <td className="px-4 py-2 text-right font-bold text-gray-500" style={{ fontFamily: FONT }}>100%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }

        /* ── ÇETELE TABLOSU ─────────────────────────────────────────────── */
        if (tip === 'cetele_tablosu') {
            const renderTally = (n: number) => {
                const groups = Math.floor(n / 5);
                const rem = n % 5;
                return (
                    <span className="inline-flex items-center gap-1 flex-wrap">
                        {Array.from({ length: groups }).map((_, gi) => (
                            <span key={gi} className="inline-flex items-center" style={{ color: '#059669', fontFamily: 'monospace', fontSize: '15px', fontWeight: 700, letterSpacing: '-2px' }}>
                                <span>||||</span>
                                <span style={{ display: 'inline-block', width: '10px', height: '2px', background: '#059669', transform: 'rotate(-70deg)', transformOrigin: 'center', marginLeft: '-2px', marginRight: '4px' }} />
                            </span>
                        ))}
                        {rem > 0 && (
                            <span style={{ color: '#059669', fontFamily: 'monospace', fontSize: '15px', fontWeight: 700, letterSpacing: '-2px' }}>
                                {'|'.repeat(rem)}
                            </span>
                        )}
                        {n === 0 && <span className="text-gray-300 text-sm">—</span>}
                    </span>
                );
            };
            return (
                <div className="w-full overflow-hidden rounded-xl border border-emerald-100 shadow-sm mt-3">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: 'linear-gradient(90deg,#d1fae522,#d1fae508)' }}>
                                <th className="px-4 py-2.5 text-left font-bold text-emerald-800" style={{ fontFamily: FONT }}>Kategori</th>
                                <th className="px-4 py-2.5 text-left font-bold text-emerald-800" style={{ fontFamily: FONT }}>Çetele</th>
                                <th className="px-4 py-2.5 text-right font-bold text-emerald-800" style={{ fontFamily: FONT }}>Sayı</th>
                            </tr>
                        </thead>
                        <tbody>
                            {veri.map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}>
                                    <td className="px-4 py-2.5 font-semibold text-gray-700" style={{ fontFamily: FONT }}>{item.etiket}</td>
                                    <td className="px-4 py-3">{renderTally(item.deger || 0)}</td>
                                    <td className="px-4 py-2.5 text-right font-extrabold" style={{ color: '#059669', fontFamily: FONT }}>{item.deger}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        /* ── SÜTUN GRAFİĞİ ──────────────────────────────────────────────── */
        if (tip === 'sutun_grafigi') {
            const maxVal = Math.max(...veri.map(v => v.deger || 0), 1);
            const W = 460, H = 240, PL = 50, PR = 12, PT = 22, PB = 56;
            const cW = W - PL - PR, cH = H - PT - PB;
            const barW = Math.min(52, (cW / veri.length) * 0.58);
            const ySteps = 5;
            return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-xl mx-auto mt-3"
                    style={{ fontFamily: FONT }} preserveAspectRatio="xMidYMid meet">
                    <SvgDefs id={uid} color={anaRenk} />
                    <GridLines x1={PL} x2={W - PR}
                        yValues={Array.from({ length: ySteps + 1 }, (_, i) => H - PB - (cH / ySteps) * i)} />
                    <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#94a3b8" strokeWidth="2" />
                    <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#94a3b8" strokeWidth="2" />
                    {Array.from({ length: ySteps + 1 }, (_, i) => (
                        <text key={i} x={PL - 7} y={H - PB - (cH / ySteps) * i + 4}
                            fontSize="10" fill="#64748b" textAnchor="end">
                            {Math.round((maxVal / ySteps) * i)}
                        </text>
                    ))}
                    {veri.map((item, idx) => {
                        const val = item.deger || 0;
                        const bH = (val / maxVal) * cH;
                        const slotW = cW / veri.length;
                        const bx = PL + slotW * idx + (slotW - barW) / 2;
                        const by = H - PB - bH;
                        const col = COLORS[idx % COLORS.length];
                        return (
                            <g key={idx}>
                                <rect x={bx} y={by} width={barW} height={bH}
                                    fill={col} rx="3" opacity="0.87"
                                    filter={`url(#shadow-${uid})`} />
                                {/* Gradient overlay */}
                                <rect x={bx} y={by} width={barW} height={Math.min(bH * 0.35, 18)}
                                    fill="white" rx="3" opacity="0.15" />
                                <text x={bx + barW / 2} y={H - PB + 15} fontSize="11" fill="#475569" textAnchor="middle">{item.etiket}</text>
                                {item.birim && (
                                    <text x={bx + barW / 2} y={H - PB + 27} fontSize="9" fill="#94a3b8" textAnchor="middle">{item.birim}</text>
                                )}
                                <text x={bx + barW / 2} y={by - 6} fontSize="11" fill={col} fontWeight="700" textAnchor="middle">{val}</text>
                            </g>
                        );
                    })}
                </svg>
            );
        }

        /* ── PASTA GRAFİĞİ ──────────────────────────────────────────────── */
        if (tip === 'pasta_grafigi') {
            const total = veri.reduce((s, v) => s + (v.deger || 0), 0) || 1;
            const cx = 100, cy = 100, R = 82, Ri = 30;
            let startAngle = -90;
            return (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-3">
                    <svg viewBox="0 0 200 200" className="w-44 h-44 flex-shrink-0"
                        style={{ fontFamily: FONT, filter: 'drop-shadow(0 4px 10px #0002)' }}>
                        <SvgDefs id={uid} color={anaRenk} />
                        {veri.map((item, idx) => {
                            const val = item.deger || 0;
                            const angle = (val / total) * 360;
                            const endAngle = startAngle + angle;
                            const midAngle = startAngle + angle / 2;
                            const rad = Math.PI / 180;
                            const x1 = cx + R * Math.cos(startAngle * rad);
                            const y1 = cy + R * Math.sin(startAngle * rad);
                            const x2 = cx + R * Math.cos(endAngle * rad);
                            const y2 = cy + R * Math.sin(endAngle * rad);
                            const ix1 = cx + Ri * Math.cos(endAngle * rad);
                            const iy1 = cy + Ri * Math.sin(endAngle * rad);
                            const ix2 = cx + Ri * Math.cos(startAngle * rad);
                            const iy2 = cy + Ri * Math.sin(startAngle * rad);
                            const large = angle > 180 ? 1 : 0;
                            const path = `M${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${ix1},${iy1} A${Ri},${Ri} 0 ${large} 0 ${ix2},${iy2} Z`;
                            const pct = Math.round((val / total) * 100);
                            const midR = (R + Ri) / 2;
                            const lx = cx + midR * Math.cos(midAngle * rad);
                            const ly = cy + midR * Math.sin(midAngle * rad);
                            const col = COLORS[idx % COLORS.length];
                            startAngle = endAngle;
                            return (
                                <g key={idx}>
                                    <path d={path} fill={col} stroke="#fff" strokeWidth="2" opacity="0.9" />
                                    {pct >= 8 && (
                                        <text x={lx} y={ly + 4} fontSize="9" fill="#fff" fontWeight="700" textAnchor="middle">{pct}%</text>
                                    )}
                                </g>
                            );
                        })}
                        <text x={cx} y={cy - 5} fontSize="9" fill="#64748b" textAnchor="middle">Toplam</text>
                        <text x={cx} y={cy + 9} fontSize="13" fill="#1e293b" fontWeight="700" textAnchor="middle">{total}</text>
                    </svg>
                    <div className="flex flex-col gap-1.5 text-xs">
                        {veri.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                                <span style={{ fontFamily: FONT, color: '#374151' }}>
                                    {item.etiket}: <strong>{item.deger}</strong>{item.birim ? ` ${item.birim}` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        /* ── ÇİZGİ GRAFİĞİ ──────────────────────────────────────────────── */
        if (tip === 'cizgi_grafigi') {
            const maxVal = Math.max(...veri.map(v => v.deger || 0), 1);
            const W = 460, H = 240, PL = 50, PR = 16, PT = 22, PB = 56;
            const cW = W - PL - PR, cH = H - PT - PB;
            const stepX = veri.length > 1 ? cW / (veri.length - 1) : cW;
            const pts = veri.map((v, i) => ({
                x: PL + stepX * i,
                y: H - PB - ((v.deger || 0) / maxVal) * cH,
            }));
            const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const areaPath = pts.length > 1
                ? `${linePath} L${pts[pts.length - 1].x},${H - PB} L${pts[0].x},${H - PB} Z`
                : '';
            return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-xl mx-auto mt-3"
                    style={{ fontFamily: FONT }} preserveAspectRatio="xMidYMid meet">
                    <SvgDefs id={uid} color={anaRenk} />
                    <defs>
                        <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={anaRenk} stopOpacity="0.22" />
                            <stop offset="100%" stopColor={anaRenk} stopOpacity="0.02" />
                        </linearGradient>
                    </defs>
                    <GridLines x1={PL} x2={W - PR}
                        yValues={Array.from({ length: 6 }, (_, i) => H - PB - (cH / 5) * i)} />
                    <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#94a3b8" strokeWidth="2" />
                    <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#94a3b8" strokeWidth="2" />
                    {Array.from({ length: 6 }, (_, i) => (
                        <text key={i} x={PL - 7} y={H - PB - (cH / 5) * i + 4} fontSize="10" fill="#64748b" textAnchor="end">
                            {Math.round(maxVal / 5 * i)}
                        </text>
                    ))}
                    {areaPath && <path d={areaPath} fill={`url(#area-${uid})`} />}
                    <path d={linePath} fill="none" stroke={anaRenk} strokeWidth="2.5"
                        strokeLinejoin="round" strokeLinecap="round" />
                    {pts.map((p, idx) => (
                        <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="5.5" fill="white" stroke={anaRenk} strokeWidth="2.5" />
                            <circle cx={p.x} cy={p.y} r="2.5" fill={anaRenk} />
                            <text x={p.x} y={H - PB + 15} fontSize="11" fill="#475569" textAnchor="middle">{veri[idx].etiket}</text>
                            {veri[idx].birim && (
                                <text x={p.x} y={H - PB + 27} fontSize="9" fill="#94a3b8" textAnchor="middle">{veri[idx].birim}</text>
                            )}
                            <text x={p.x} y={p.y - 9} fontSize="10" fill={anaRenk} fontWeight="700" textAnchor="middle">{veri[idx].deger}</text>
                        </g>
                    ))}
                </svg>
            );
        }

        /* ── ÜÇGEN ──────────────────────────────────────────────────────── */
        if (tip === 'ucgen') {
            const pts_raw = ozellikler?.etiketler ?? ['A', 'B', 'C'];
            const sides = ozellikler?.kenarlar;
            return (
                <svg viewBox="0 0 240 180" className="w-full max-w-xs mx-auto mt-2"
                    style={{ fontFamily: FONT, filter: 'drop-shadow(0 3px 6px #0001)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <polygon points="120,16 24,160 216,160"
                        fill={`url(#shapeFill-${uid})`} stroke={anaRenk} strokeWidth="2.5" strokeLinejoin="round" />
                    {[{ x: 120, y: 16 }, { x: 24, y: 160 }, { x: 216, y: 160 }].map((v, i) => (
                        <g key={i}>
                            <circle cx={v.x} cy={v.y} r="4" fill={anaRenk} />
                            <text x={v.x + (i === 0 ? 0 : i === 1 ? -13 : 13)} y={v.y + (i === 0 ? -9 : 17)}
                                fontSize="13" fill="#1e293b" fontWeight="700" textAnchor="middle">
                                {pts_raw[i] ?? String.fromCharCode(65 + i)}
                            </text>
                        </g>
                    ))}
                    {sides && sides.length >= 1 && (
                        <text x="64" y="96" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle" transform="rotate(-56,64,96)">{sides[0]}</text>
                    )}
                    {sides && sides.length >= 2 && (
                        <text x="176" y="96" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle" transform="rotate(56,176,96)">{sides[1]}</text>
                    )}
                    {sides && sides.length >= 3 && (
                        <text x="120" y="175" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle">{sides[2]}</text>
                    )}
                </svg>
            );
        }

        /* ── DİK ÜÇGEN ──────────────────────────────────────────────────── */
        if (tip === 'dik_ucgen') {
            const sides = ozellikler?.kenarlar;
            const pts_raw = ozellikler?.etiketler ?? ['A', 'B', 'C'];
            return (
                <svg viewBox="0 0 240 180" className="w-full max-w-xs mx-auto mt-2"
                    style={{ fontFamily: FONT, filter: 'drop-shadow(0 3px 6px #0001)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <polygon points="24,160 24,30 216,160"
                        fill={`url(#shapeFill-${uid})`} stroke={anaRenk} strokeWidth="2.5" strokeLinejoin="round" />
                    <polyline points="24,148 36,148 36,160" fill="none" stroke={anaRenk} strokeWidth="2" />
                    {[{ x: 24, y: 160 }, { x: 24, y: 30 }, { x: 216, y: 160 }].map((v, i) => (
                        <g key={i}>
                            <circle cx={v.x} cy={v.y} r="4" fill={anaRenk} />
                            <text x={v.x + (i === 0 ? -13 : i === 1 ? -13 : 13)} y={v.y + (i === 2 ? 17 : i === 1 ? -9 : 17)}
                                fontSize="13" fill="#1e293b" fontWeight="700" textAnchor="middle">
                                {pts_raw[i] ?? String.fromCharCode(65 + i)}
                            </text>
                        </g>
                    ))}
                    {sides && sides.length >= 1 && (
                        <text x="9" y="100" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle">{sides[0]}</text>
                    )}
                    {sides && sides.length >= 2 && (
                        <text x="120" y="176" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle">{sides[1]}</text>
                    )}
                    {sides && sides.length >= 3 && (
                        <text x="132" y="89" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle" transform="rotate(35,132,89)">{sides[2]}</text>
                    )}
                </svg>
            );
        }

        /* ── KARE / DİKDÖRTGEN ──────────────────────────────────────────── */
        if (tip === 'kare' || tip === 'dikdortgen') {
            const rW = tip === 'kare' ? 130 : 180;
            const rH = tip === 'kare' ? 130 : 90;
            const ox = (240 - rW) / 2, oy = (180 - rH) / 2;
            const sides = ozellikler?.kenarlar;
            return (
                <svg viewBox="0 0 240 180" className="w-full max-w-xs mx-auto mt-2"
                    style={{ fontFamily: FONT, filter: 'drop-shadow(0 3px 6px #0001)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <rect x={ox} y={oy} width={rW} height={rH}
                        fill={`url(#shapeFill-${uid})`} stroke={anaRenk} strokeWidth="2.5" rx="3" />
                    {/* Right-angle markers */}
                    <polyline points={`${ox + 11},${oy} ${ox + 11},${oy + 11} ${ox},${oy + 11}`}
                        fill="none" stroke={anaRenk} strokeWidth="1.5" opacity="0.5" />
                    <polyline points={`${ox + rW - 11},${oy} ${ox + rW - 11},${oy + 11} ${ox + rW},${oy + 11}`}
                        fill="none" stroke={anaRenk} strokeWidth="1.5" opacity="0.5" />
                    {sides && sides.length >= 1 && (
                        <text x={ox + rW / 2} y={oy - 8} fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="middle">{sides[0]}</text>
                    )}
                    {sides && sides.length >= 2 && tip === 'dikdortgen' && (
                        <text x={ox + rW + 13} y={oy + rH / 2 + 5} fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="start">{sides[1]}</text>
                    )}
                    {tip === 'kare' && sides && (
                        <text x={ox + rW + 13} y={oy + rH / 2 + 5} fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="start">{sides[0]}</text>
                    )}
                    {/* Equal side tick marks for square */}
                    {tip === 'kare' && (
                        <>
                            {[[ox + rW / 2 - 5, oy + 7, ox + rW / 2 + 5, oy + 7],
                              [ox + rW / 2 - 5, oy + rH - 7, ox + rW / 2 + 5, oy + rH - 7],
                              [ox + 7, oy + rH / 2 - 5, ox + 7, oy + rH / 2 + 5],
                              [ox + rW - 7, oy + rH / 2 - 5, ox + rW - 7, oy + rH / 2 + 5],
                            ].map(([x1, y1, x2, y2], i) => (
                                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={anaRenk} strokeWidth="2" />
                            ))}
                        </>
                    )}
                </svg>
            );
        }

        /* ── PARALEL KENAR ──────────────────────────────────────────────── */
        if (tip === 'paralel_kenar') {
            const sides = ozellikler?.kenarlar;
            const skew = 34;
            return (
                <svg viewBox="0 0 280 165" className="w-full max-w-sm mx-auto mt-2"
                    style={{ fontFamily: FONT, filter: 'drop-shadow(0 3px 6px #0001)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <polygon points={`${skew},28 ${246},28 ${246 - skew},136 ${10},136`}
                        fill={`url(#shapeFill-${uid})`} stroke={anaRenk} strokeWidth="2.5" />
                    {/* Parallel arrows on top/bottom */}
                    {[{ x1: 108, y1: 23, x2: 138, y2: 23 }, { x1: 100, y1: 141, x2: 130, y2: 141 }].map((l, i) => (
                        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                            stroke={anaRenk} strokeWidth="2" markerEnd={`url(#arrow-${uid})`} />
                    ))}
                    {/* Parallel arrows on left/right */}
                    {[{ x1: 26, y1: 100, x2: 22, y2: 76 }, { x1: 238, y1: 100, x2: 234, y2: 76 }].map((l, i) => (
                        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                            stroke={anaRenk} strokeWidth="2" markerEnd={`url(#arrow-${uid})`} />
                    ))}
                    {/* Dimension labels */}
                    {sides && sides.length >= 1 && (
                        <text x="140" y="18" fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="middle">{sides[0]}</text>
                    )}
                    {sides && sides.length >= 2 && (
                        <text x="13" y="84" fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="middle" transform="rotate(-58,13,84)">{sides[1]}</text>
                    )}
                    {ozellikler?.acilar && ozellikler.acilar.length >= 1 && (
                        <text x="52" y="136" fontSize="12" fill="#64748b" textAnchor="middle">{ozellikler.acilar[0]}°</text>
                    )}
                </svg>
            );
        }

        /* ── ÇOKGEN ─────────────────────────────────────────────────────── */
        if (tip === 'cokgen') {
            // kenarSayisi tercih edilir; yoksa veri array uzunluğu fallback olarak kullanılır
            // (AI her köşeye bir veri öğesi döndürebilir; örn. 5 veri → beşgen)
            const n = Math.max(3, Math.min(12, ozellikler?.kenarSayisi ?? veri.length ?? 6));
            const cx = 120, cy = 90, R = 72;
            const polyPts = Array.from({ length: n }, (_, i) => {
                const angle = ((2 * Math.PI * i) / n) - Math.PI / 2;
                return { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
            });
            const polyStr = polyPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
            const vertexLabels = ozellikler?.etiketler ?? polyPts.map((_, i) => String.fromCharCode(65 + i));
            const side = ozellikler?.kenarlar?.[0];
            return (
                <svg viewBox="0 0 240 180" className="w-full max-w-xs mx-auto mt-2"
                    style={{ fontFamily: FONT, filter: 'drop-shadow(0 3px 6px #0001)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <polygon points={polyStr} fill={`url(#shapeFill-${uid})`} stroke={anaRenk} strokeWidth="2.5" />
                    {polyPts.map((p, i) => {
                        const labelR = R + 15;
                        const angle = ((2 * Math.PI * i) / n) - Math.PI / 2;
                        const lx = cx + labelR * Math.cos(angle);
                        const ly = cy + labelR * Math.sin(angle);
                        return (
                            <g key={i}>
                                <circle cx={p.x} cy={p.y} r="3.5" fill={anaRenk} />
                                {n <= 9 && (
                                    <text x={lx} y={ly + 4} fontSize="11" fill="#1e293b" fontWeight="700" textAnchor="middle">
                                        {vertexLabels[i] ?? ''}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                    {side && (
                        <text x={cx} y={cy + 5} fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle">a = {side}</text>
                    )}
                    <text x={cx} y="172" fontSize="11" fill="#64748b" textAnchor="middle">{n}-gen</text>
                </svg>
            );
        }

        /* ── DAİRE ──────────────────────────────────────────────────────── */
        if (tip === 'daire') {
            const r = 72;
            const yaricap = ozellikler?.yaricap;
            const cap = ozellikler?.kenarlar?.[0];
            return (
                <svg viewBox="0 0 240 200" className="w-full max-w-xs mx-auto mt-2"
                    style={{ fontFamily: FONT, filter: 'drop-shadow(0 4px 10px #0002)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <defs>
                        <radialGradient id={`radGrad-${uid}`} cx="38%" cy="33%" r="58%">
                            <stop offset="0%" stopColor={anaRenk} stopOpacity="0.22" />
                            <stop offset="100%" stopColor={anaRenk} stopOpacity="0.06" />
                        </radialGradient>
                    </defs>
                    <circle cx="120" cy="100" r={r} fill={`url(#radGrad-${uid})`} stroke={anaRenk} strokeWidth="2.5" />
                    <circle cx="120" cy="100" r="3.5" fill={anaRenk} />
                    <line x1="120" y1="100" x2={120 + r} y2="100"
                        stroke={anaRenk} strokeWidth="2" strokeDasharray="5 3" />
                    {yaricap && (
                        <text x={120 + r / 2} y="90" fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="middle">r = {yaricap}</text>
                    )}
                    {cap && (
                        <>
                            <line x1={120 - r} y1="100" x2={120 + r} y2="100"
                                stroke={anaRenk} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.45" />
                            <text x="120" y="116" fontSize="11" fill={anaRenk} textAnchor="middle">d = {cap}</text>
                        </>
                    )}
                    <text x="127" y="115" fontSize="12" fill={anaRenk} fontWeight="700">O</text>
                </svg>
            );
        }

        /* ── DOĞRU PARÇASI ──────────────────────────────────────────────── */
        if (tip === 'dogru_parcasi') {
            const uzunluk = ozellikler?.kenarlar?.[0];
            const birim = ozellikler?.birim ?? '';
            const A = veri[0]?.etiket ?? 'A';
            const B = veri[1]?.etiket ?? 'B';
            return (
                <svg viewBox="0 0 340 96" className="w-full max-w-sm mx-auto mt-2" style={{ fontFamily: FONT }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <line x1="28" y1="46" x2="312" y2="46"
                        stroke={anaRenk} strokeWidth="3" strokeLinecap="round"
                        markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
                    <circle cx="52" cy="46" r="5.5" fill={anaRenk} stroke="white" strokeWidth="1.5" />
                    <circle cx="288" cy="46" r="5.5" fill={anaRenk} stroke="white" strokeWidth="1.5" />
                    <text x="52" y="30" fontSize="14" fill="#1e293b" fontWeight="700" textAnchor="middle">{A}</text>
                    <text x="288" y="30" fontSize="14" fill="#1e293b" fontWeight="700" textAnchor="middle">{B}</text>
                    {uzunluk && (
                        <>
                            <line x1="52" y1="68" x2="288" y2="68" stroke="#94a3b8" strokeWidth="1" />
                            <line x1="52" y1="62" x2="52" y2="74" stroke="#94a3b8" strokeWidth="1" />
                            <line x1="288" y1="62" x2="288" y2="74" stroke="#94a3b8" strokeWidth="1" />
                            <text x="170" y="86" fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="middle">{uzunluk} {birim}</text>
                        </>
                    )}
                </svg>
            );
        }

        /* ── AÇI ────────────────────────────────────────────────────────── */
        if (tip === 'aci') {
            const deg = ozellikler?.acilar?.[0] ?? 60;
            const rad = (deg * Math.PI) / 180;
            const cx = 64, cy = 136, len = 116, arcR = 38;
            const x1 = cx + len, y1 = cy;
            const x2 = cx + len * Math.cos(-rad), y2 = cy + len * Math.sin(-rad);
            const ax1 = cx + arcR, ay1 = cy;
            const ax2 = cx + arcR * Math.cos(-rad), ay2 = cy + arcR * Math.sin(-rad);
            const large = deg > 180 ? 1 : 0;
            const midA = -rad / 2;
            const lx = cx + (arcR + 16) * Math.cos(midA);
            const ly = cy + (arcR + 16) * Math.sin(midA);
            const vs = veri.slice(0, 3);
            return (
                <svg viewBox="0 0 300 170" className="w-full max-w-sm mx-auto mt-2"
                    style={{ fontFamily: FONT, filter: 'drop-shadow(0 2px 4px #0001)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <path d={`M${cx},${cy} L${ax1},${ay1} A${arcR},${arcR} 0 ${large} 0 ${ax2},${ay2} Z`}
                        fill={`${anaRenk}${FILL_OPACITY_LIGHT}`} />
                    <line x1={cx} y1={cy} x2={x1} y2={y1} stroke={anaRenk} strokeWidth="2.5" strokeLinecap="round" />
                    <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={anaRenk} strokeWidth="2.5" strokeLinecap="round" />
                    <path d={`M${ax1},${ay1} A${arcR},${arcR} 0 ${large} 0 ${ax2},${ay2}`}
                        fill="none" stroke={anaRenk} strokeWidth="2" />
                    <text x={lx} y={ly} fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="middle">{deg}°</text>
                    <text x={cx - 13} y={cy + 8} fontSize="13" fill="#1e293b" fontWeight="700">{vs[0]?.etiket ?? 'O'}</text>
                    <text x={x1 + 9} y={y1 + 5} fontSize="13" fill="#1e293b">{vs[1]?.etiket ?? 'A'}</text>
                    <text x={x2 + 7} y={y2 - 5} fontSize="13" fill="#1e293b">{vs[2]?.etiket ?? 'B'}</text>
                    {deg === 90 && (
                        <polyline points={`${cx + 14},${cy} ${cx + 14},${cy - 14} ${cx},${cy - 14}`}
                            fill="none" stroke={anaRenk} strokeWidth="1.5" />
                    )}
                </svg>
            );
        }

        /* ── KESİR MODELİ ───────────────────────────────────────────────── */
        if (tip === 'kesir_modeli') {
            const payda = Math.max(2, ozellikler?.kenarlar?.[0] ?? veri.length);
            const pay = Math.max(0, ozellikler?.kenarlar?.[1] ?? veri.filter(v => v.deger === 1 || v.nesne === 'dolu').length);
            const sliceA = 360 / payda;
            const cx = 100, cy = 100, R = 86;
            return (
                <div className="flex flex-col items-center gap-3 mt-3">
                    <svg viewBox="0 0 200 200" className="w-40 h-40"
                        style={{ fontFamily: FONT, filter: 'drop-shadow(0 4px 10px #0002)' }}>
                        <SvgDefs id={uid} color={anaRenk} />
                        {Array.from({ length: payda }).map((_, i) => {
                            const sA = (i * sliceA - 90) * (Math.PI / 180);
                            const eA = ((i + 1) * sliceA - 90) * (Math.PI / 180);
                            const x1 = cx + R * Math.cos(sA), y1 = cy + R * Math.sin(sA);
                            const x2 = cx + R * Math.cos(eA), y2 = cy + R * Math.sin(eA);
                            const dolu = i < pay;
                            return (
                                <path key={i}
                                    d={`M${cx},${cy} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} Z`}
                                    fill={dolu ? anaRenk : `${anaRenk}${FILL_OPACITY_LIGHT}`}
                                    stroke="white" strokeWidth="2"
                                    opacity={dolu ? 0.88 : 1} />
                            );
                        })}
                    </svg>
                    <div className="inline-flex flex-col items-center bg-white border-2 rounded-xl px-5 py-2 shadow-sm"
                        style={{ borderColor: anaRenk }}>
                        <span className="text-2xl font-extrabold leading-none pb-1 border-b-2"
                            style={{ color: anaRenk, borderColor: anaRenk, fontFamily: FONT }}>{pay}</span>
                        <span className="text-2xl font-extrabold leading-none pt-1"
                            style={{ color: anaRenk, fontFamily: FONT }}>{payda}</span>
                    </div>
                </div>
            );
        }

        /* ── SİMETRİ ────────────────────────────────────────────────────── */
        if (tip === 'simetri') {
            return (
                <svg viewBox="0 0 310 175" className="w-full max-w-sm mx-auto mt-2"
                    style={{ fontFamily: FONT, filter: 'drop-shadow(0 2px 5px #0001)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <polygon points="28,142 28,50 102,50 102,82 70,82 70,112 102,112 102,142"
                        fill={`${anaRenk}${FILL_OPACITY_MED}`} stroke={anaRenk} strokeWidth="2.5" />
                    <line x1="155" y1="12" x2="155" y2="164"
                        stroke="#ef4444" strokeWidth="2.5" strokeDasharray="7 4" />
                    <text x="155" y="9" fontSize="10" fill="#ef4444" textAnchor="middle" fontWeight="700">Simetri Ekseni</text>
                    <polygon points="282,142 282,50 208,50 208,82 240,82 240,112 208,112 208,142"
                        fill={`${anaRenk}${FILL_OPACITY_MED}`} stroke={anaRenk} strokeWidth="2.5" />
                    <line x1="60" y1="158" x2="250" y2="158"
                        stroke={anaRenk} strokeWidth="1.5" markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
                    {veri[0] && <text x="75" y="150" fontSize="11" fill="#475569" textAnchor="middle">{veri[0].etiket}</text>}
                    {veri[1] && <text x="235" y="150" fontSize="11" fill="#475569" textAnchor="middle">{veri[1].etiket}</text>}
                </svg>
            );
        }

        /* ── SAYI DOĞRUSU ───────────────────────────────────────────────── */
        if (tip === 'sayi_dogrusu') {
            const ptVals = veri.filter(v => v.deger !== undefined).map(v => v.deger as number);
            const marked = veri.filter(v => v.deger !== undefined);
            const minVal = Math.min(-5, ...ptVals);
            const maxValD = Math.max(5, ...ptVals);
            const range = maxValD - minVal || 10;
            const W = 460, H = 80, y0 = 44, xL = 24, xR = W - 24;
            const toX = (v: number) => xL + ((v - minVal) / range) * (xR - xL);
            const intSteps: number[] = [];
            for (let v = Math.ceil(minVal); v <= Math.floor(maxValD); v++) intSteps.push(v);
            return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-xl mx-auto mt-2"
                    style={{ fontFamily: FONT }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <line x1={xL} y1={y0} x2={xR} y2={y0}
                        stroke="#334155" strokeWidth="2.5"
                        markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
                    {intSteps.map(v => {
                        const x = toX(v);
                        const isZero = v === 0;
                        return (
                            <g key={v}>
                                <line x1={x} y1={y0 - (isZero ? 10 : 6)} x2={x} y2={y0 + (isZero ? 10 : 6)}
                                    stroke={isZero ? '#ef4444' : '#64748b'} strokeWidth={isZero ? 2.5 : 1.5} />
                                <text x={x} y={y0 + 20} fontSize="11"
                                    fill={isZero ? '#ef4444' : '#64748b'}
                                    fontWeight={isZero ? '700' : '400'} textAnchor="middle">{v}</text>
                            </g>
                        );
                    })}
                    {marked.map((v, idx) => {
                        const x = toX(v.deger as number);
                        return (
                            <g key={`m${idx}`}>
                                <circle cx={x} cy={y0} r="7.5" fill={anaRenk} stroke="white" strokeWidth="2"
                                    filter={`url(#shadow-${uid})`} />
                                <text x={x} y={y0 - 14} fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle">
                                    {v.etiket}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            );
        }

        /* ── KOORDİNAT SİSTEMİ ──────────────────────────────────────────── */
        if (tip === 'koordinat_sistemi') {
            const range = 5;
            const W = 270, H = 270, cx = 135, cy = 135, step = 23;
            return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs mx-auto mt-2"
                    style={{ fontFamily: FONT, filter: 'drop-shadow(0 2px 5px #0001)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    {/* Grid */}
                    {Array.from({ length: range * 2 + 1 }, (_, i) => i - range).flatMap(v => [
                        <line key={`gv${v}`} x1={cx + v * step} y1={8} x2={cx + v * step} y2={H - 8} stroke="#f1f5f9" strokeWidth="1" />,
                        <line key={`gh${v}`} x1={8} y1={cy + v * step} x2={W - 8} y2={cy + v * step} stroke="#f1f5f9" strokeWidth="1" />,
                    ])}
                    {/* Axes */}
                    <line x1={8} y1={cy} x2={W - 8} y2={cy} stroke="#94a3b8" strokeWidth="2"
                        markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
                    <line x1={cx} y1={H - 8} x2={cx} y2={8} stroke="#94a3b8" strokeWidth="2"
                        markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
                    {/* Tick labels */}
                    {Array.from({ length: range * 2 + 1 }, (_, i) => i - range).filter(v => v !== 0).map(v => (
                        <React.Fragment key={`tl${v}`}>
                            <text x={cx + v * step} y={cy + 14} fontSize="9" fill="#94a3b8" textAnchor="middle">{v}</text>
                            <text x={cx - 11} y={cy - v * step + 4} fontSize="9" fill="#94a3b8" textAnchor="end">{v}</text>
                        </React.Fragment>
                    ))}
                    <text x={W - 8} y={cy + 14} fontSize="10" fill="#64748b">x</text>
                    <text x={cx + 6} y={12} fontSize="10" fill="#64748b">y</text>
                    <text x={cx - 9} y={cy + 14} fontSize="9" fill="#94a3b8" textAnchor="end">0</text>
                    {/* Points */}
                    {veri.map((v, idx) => {
                        if (v.x === undefined || v.y === undefined) return null;
                        const px = cx + v.x * step, py = cy - v.y * step;
                        const col = COLORS[idx % COLORS.length];
                        return (
                            <g key={idx}>
                                <circle cx={px} cy={py} r="6.5" fill={col} stroke="white" strokeWidth="2"
                                    filter={`url(#shadow-${uid})`} />
                                <text x={px + 10} y={py - 5} fontSize="11" fill={col} fontWeight="700">{v.etiket}</text>
                            </g>
                        );
                    })}
                </svg>
            );
        }

        /* ── KOORDİNAT GRAFİĞİ (Fonksiyon) ─────────────────────────────── */
        if (tip === 'koordinat_grafigi') {
            const pts = veri.filter(v => v.x !== undefined && v.y !== undefined) as Array<{ x: number; y: number; etiket: string; deger?: number }>;
            if (pts.length === 0) return null;
            const allX = pts.map(p => p.x);
            const allY = pts.map(p => p.y);
            const minX = Math.min(...allX), maxX = Math.max(...allX, minX + 1);
            const minY = Math.min(...allY), maxY = Math.max(...allY, minY + 1);
            const W = 320, H = 250, PL = 48, PR = 16, PT = 18, PB = 48;
            const cW = W - PL - PR, cH = H - PT - PB;
            const toSvgX = (x: number) => PL + ((x - minX) / (maxX - minX)) * cW;
            const toSvgY = (y: number) => H - PB - ((y - minY) / (maxY - minY)) * cH;
            const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ');
            return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto mt-2"
                    style={{ fontFamily: FONT }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <GridLines x1={PL} x2={W - PR}
                        yValues={Array.from({ length: 5 }, (_, i) => H - PB - (cH / 4) * i)} />
                    <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#94a3b8" strokeWidth="2" />
                    <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#94a3b8" strokeWidth="2" />
                    {pts.length >= 2 && (
                        <path d={linePath} fill="none" stroke={anaRenk} strokeWidth="2.5" strokeLinejoin="round" />
                    )}
                    {pts.map((p, idx) => (
                        <g key={idx}>
                            <circle cx={toSvgX(p.x)} cy={toSvgY(p.y)} r="5.5" fill={anaRenk} stroke="white" strokeWidth="2" />
                            <text x={toSvgX(p.x)} y={H - PB + 15} fontSize="10" fill="#475569" textAnchor="middle">{p.x}</text>
                            <text x={PL - 7} y={toSvgY(p.y) + 4} fontSize="10" fill="#475569" textAnchor="end">{p.y}</text>
                        </g>
                    ))}
                </svg>
            );
        }

        /* ── VENN DİYAGRAMI ─────────────────────────────────────────────── */
        if (tip === 'venn_diyagrami') {
            const setA = veri.filter(v => v.nesne === 'A' || v.nesne === 'sadece_A' || v.nesne === 'sol');
            const setB = veri.filter(v => v.nesne === 'B' || v.nesne === 'sadece_B' || v.nesne === 'sag');
            const setAB = veri.filter(v => v.nesne === 'AB' || v.nesne === 'kesisim' || v.nesne === 'ortak');
            const labelA = ozellikler?.etiketler?.[0] ?? 'A';
            const labelB = ozellikler?.etiketler?.[1] ?? 'B';
            return (
                <svg viewBox="0 0 330 210" className="w-full max-w-sm mx-auto mt-2"
                    style={{ fontFamily: FONT, filter: 'drop-shadow(0 3px 8px #0002)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    <defs>
                        <clipPath id={`clipA-${uid}`}><circle cx="125" cy="108" r="76" /></clipPath>
                    </defs>
                    <circle cx="125" cy="108" r="76" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" opacity="0.78" />
                    <circle cx="205" cy="108" r="76" fill="#fce7f3" stroke="#ec4899" strokeWidth="2.5" opacity="0.78" />
                    <circle cx="205" cy="108" r="76" fill="#e9d5ff" stroke="none" opacity="0.5"
                        clipPath={`url(#clipA-${uid})`} />
                    <text x="90" y="42" fontSize="14" fill="#1d4ed8" fontWeight="700" textAnchor="middle">{labelA}</text>
                    <text x="240" y="42" fontSize="14" fill="#be185d" fontWeight="700" textAnchor="middle">{labelB}</text>
                    {setA.map((item, i) => (
                        <text key={i} x="94" y={84 + i * 17} fontSize="11" fill="#1e3a8a" textAnchor="middle">{item.etiket}</text>
                    ))}
                    {setAB.map((item, i) => (
                        <text key={i} x="165" y={90 + i * 17} fontSize="11" fill="#4c1d95" fontWeight="700" textAnchor="middle">{item.etiket}</text>
                    ))}
                    {setB.map((item, i) => (
                        <text key={i} x="236" y={84 + i * 17} fontSize="11" fill="#831843" textAnchor="middle">{item.etiket}</text>
                    ))}
                    {ozellikler?.kenarlar?.[0] !== undefined && (
                        <text x="94" y="164" fontSize="12" fill="#1d4ed8" fontWeight="700" textAnchor="middle">n={ozellikler.kenarlar[0]}</text>
                    )}
                    {ozellikler?.kenarlar?.[1] !== undefined && (
                        <text x="236" y="164" fontSize="12" fill="#be185d" fontWeight="700" textAnchor="middle">n={ozellikler.kenarlar[1]}</text>
                    )}
                </svg>
            );
        }

        /* ── OLASILIK ÇARKI ─────────────────────────────────────────────── */
        if (tip === 'olaslik_cark') {
            const total = veri.reduce((s, v) => s + (v.deger || 0), 0) || 1;
            const cx = 110, cy = 110, R = 92;
            let startA = -90;
            return (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-3">
                    <svg viewBox="0 0 220 220" className="w-44 h-44 flex-shrink-0"
                        style={{ fontFamily: FONT, filter: 'drop-shadow(0 5px 14px #0003)' }}>
                        <SvgDefs id={uid} color={anaRenk} />
                        {veri.map((item, idx) => {
                            const val = item.deger || 0;
                            const angle = (val / total) * 360;
                            const endA = startA + angle;
                            const midA = startA + angle / 2;
                            const rad = Math.PI / 180;
                            const x1 = cx + R * Math.cos(startA * rad);
                            const y1 = cy + R * Math.sin(startA * rad);
                            const x2 = cx + R * Math.cos(endA * rad);
                            const y2 = cy + R * Math.sin(endA * rad);
                            const large = angle > 180 ? 1 : 0;
                            const col = COLORS[idx % COLORS.length];
                            const lx = cx + (R * 0.62) * Math.cos(midA * rad);
                            const ly = cy + (R * 0.62) * Math.sin(midA * rad);
                            const pctVal = Math.round((val / total) * 100);
                            startA = endA;
                            return (
                                <g key={idx}>
                                    <path d={`M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} Z`}
                                        fill={col} stroke="white" strokeWidth="2.5" opacity="0.88" />
                                    {pctVal >= 6 && (
                                        <text x={lx} y={ly + 4} fontSize="10" fill="white"
                                            fontWeight="700" textAnchor="middle">{pctVal}%</text>
                                    )}
                                </g>
                            );
                        })}
                        {/* Spinner needle */}
                        <line x1={cx} y1={cy} x2={cx} y2={cy - R + 10}
                            stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round"
                            markerEnd={`url(#arrow-${uid})`} />
                        <circle cx={cx} cy={cy} r="7" fill="#1e293b" />
                        <circle cx={cx} cy={cy} r="3" fill="white" />
                    </svg>
                    <div className="flex flex-col gap-1.5 text-xs">
                        {veri.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                                <span style={{ fontFamily: FONT, color: '#374151' }}>
                                    {item.etiket}: <strong>{item.deger}</strong> ({Math.round(((item.deger || 0) / total) * 100)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        /* ── KESİŞEN DOĞRULAR / AÇILAR KAVŞAĞI ────────────────────────────────────────── */
        if (tip === 'kesisen_dogrular' || tip === 'acilar_kavsagi') {
            const aciDegerleri = ozellikler?.acilar || [];
            const isimler = ozellikler?.etiketler || ['d1', 'd2'];
            return (
                <svg viewBox="0 0 240 200" className="w-full max-w-xs mx-auto mt-2" style={{ fontFamily: FONT, filter: 'drop-shadow(0 2px 4px #0001)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    {/* Doğrular */}
                    <line x1="20" y1="40" x2="220" y2="160" stroke={anaRenk} strokeWidth="2.5" markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
                    <line x1="40" y1="170" x2="200" y2="30" stroke={anaRenk} strokeWidth="2.5" markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
                    
                    {/* Doğru İsimleri */}
                    <text x="30" y="30" fontSize="12" fill={anaRenk} fontWeight="bold">{isimler[0] || 'd1'}</text>
                    <text x="200" y="20" fontSize="12" fill={anaRenk} fontWeight="bold">{isimler[1] || 'd2'}</text>

                    {/* Merkez Kesişim Noktası */}
                    <circle cx="120" cy="100" r="4" fill="#0f172a" />
                    <text x="120" y="90" fontSize="12" fill="#0f172a" fontWeight="bold" textAnchor="middle">O</text>

                    {/* Açı Yayları ve Değerleri */}
                    {aciDegerleri[0] && (
                        <>
                            <path d="M 135 109 A 20 20 0 0 0 135 91" fill="none" stroke="#ef4444" strokeWidth="2" />
                            <text x="155" y="105" fontSize="11" fill="#ef4444" fontWeight="bold">{aciDegerleri[0]}°</text>
                        </>
                    )}
                    {aciDegerleri[1] && (
                        <>
                            <path d="M 105 109 A 20 20 0 0 1 105 91" fill="none" stroke="#3b82f6" strokeWidth="2" />
                            <text x="85" y="105" fontSize="11" fill="#3b82f6" fontWeight="bold">{aciDegerleri[1]}°</text>
                        </>
                    )}
                    {aciDegerleri[2] && (
                        <>
                            <path d="M 109 85 A 20 20 0 0 1 131 85" fill="none" stroke="#10b981" strokeWidth="2" />
                            <text x="120" y="75" fontSize="11" fill="#10b981" fontWeight="bold" textAnchor="middle">{aciDegerleri[2]}°</text>
                        </>
                    )}
                    {aciDegerleri[3] && (
                        <>
                            <path d="M 109 115 A 20 20 0 0 0 131 115" fill="none" stroke="#f59e0b" strokeWidth="2" />
                            <text x="120" y="135" fontSize="11" fill="#f59e0b" fontWeight="bold" textAnchor="middle">{aciDegerleri[3]}°</text>
                        </>
                    )}
                </svg>
            );
        }

        /* ── PARALEL DOĞRULAR ────────────────────────────────────────── */
        if (tip === 'paralel_dogrular') {
            const isimler = ozellikler?.etiketler || ['d1', 'd2'];
            const kesen = ozellikler?.kenarlar?.[0] ? true : false; // Eğer bir özellik varsa kesen doğru çiz
            const aci = ozellikler?.acilar?.[0];

            return (
                <svg viewBox="0 0 240 180" className="w-full max-w-xs mx-auto mt-2" style={{ fontFamily: FONT, filter: 'drop-shadow(0 2px 4px #0001)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    {/* Paralel Doğrular */}
                    <line x1="20" y1="60" x2="220" y2="60" stroke={anaRenk} strokeWidth="2.5" markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
                    <line x1="20" y1="120" x2="220" y2="120" stroke={anaRenk} strokeWidth="2.5" markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
                    
                    <text x="25" y="50" fontSize="12" fill={anaRenk} fontWeight="bold">{isimler[0] || 'd1'}</text>
                    <text x="25" y="110" fontSize="12" fill={anaRenk} fontWeight="bold">{isimler[1] || 'd2'}</text>
                    <text x="200" y="95" fontSize="14" fill={anaRenk} fontWeight="bold">d1 // d2</text>

                    {/* Kesen Doğru (varsa) */}
                    {kesen && (
                        <>
                            <line x1="80" y1="20" x2="160" y2="160" stroke="#0f172a" strokeWidth="2" markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
                            <text x="75" y="15" fontSize="12" fill="#0f172a" fontWeight="bold">d3</text>
                            
                            {/* Açı (varsa) */}
                            {aci && (
                                <>
                                    <path d="M 115 60 A 15 15 0 0 0 105 45" fill="none" stroke="#ef4444" strokeWidth="2" />
                                    <text x="120" y="45" fontSize="11" fill="#ef4444" fontWeight="bold">{aci}°</text>
                                </>
                            )}
                        </>
                    )}
                </svg>
            );
        }

        /* ── KÜP ────────────────────────────────────────── */
        if (tip === 'kup' || tip === 'dikdortgenler_prizmasi') {
            const isRect = tip === 'dikdortgenler_prizmasi';
            const w = isRect ? 120 : 80;
            const h = 80;
            const d = 40; // derinlik
            const ox = 60;
            const oy = 60;
            const kenarlar = ozellikler?.kenarlar || [];

            return (
                <svg viewBox="0 0 240 220" className="w-full max-w-xs mx-auto mt-2" style={{ fontFamily: FONT, filter: 'drop-shadow(0 4px 10px #0002)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    
                    {/* Arka Yüz (Noktalı Çizgiler) */}
                    <rect x={ox + d} y={oy - d} width={w} height={h} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1={ox} y1={oy + h} x2={ox + d} y2={oy + h - d} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1={ox + w} y1={oy + h} x2={ox + w + d} y2={oy + h - d} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1={ox} y1={oy} x2={ox + d} y2={oy - d} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                    
                    {/* Ön Yüz ve Üst/Yan Yüzeyler (Katı Çizgiler & Gradient) */}
                    <polygon points={`${ox},${oy} ${ox+w},${oy} ${ox+w+d},${oy-d} ${ox+d},${oy-d}`} fill={`${anaRenk}33`} stroke={anaRenk} strokeWidth="2" strokeLinejoin="round" />
                    <polygon points={`${ox+w},${oy} ${ox+w},${oy+h} ${ox+w+d},${oy+h-d} ${ox+w+d},${oy-d}`} fill={`${anaRenk}1A`} stroke={anaRenk} strokeWidth="2" strokeLinejoin="round" />
                    <rect x={ox} y={oy} width={w} height={h} fill={`url(#shapeFill-${uid})`} stroke={anaRenk} strokeWidth="2.5" strokeLinejoin="round" />
                    
                    {/* Ölçüler */}
                    {kenarlar[0] && (
                        <text x={ox + w/2} y={oy + h + 15} fontSize="12" fill="#1e293b" fontWeight="bold" textAnchor="middle">{kenarlar[0]}</text>
                    )}
                    {kenarlar[1] && (
                        <text x={ox - 15} y={oy + h/2 + 5} fontSize="12" fill="#1e293b" fontWeight="bold" textAnchor="end">{kenarlar[1]}</text>
                    )}
                    {kenarlar[2] && (
                        <text x={ox + w + d/2 + 10} y={oy + h - d/2} fontSize="12" fill="#1e293b" fontWeight="bold" transform={`rotate(-45, ${ox + w + d/2 + 10}, ${oy + h - d/2})`}>{kenarlar[2]}</text>
                    )}
                </svg>
            );
        }

        /* ── SİLİNDİR ────────────────────────────────────────── */
        if (tip === 'silindir') {
            const ox = 120;
            const oy = 60;
            const w = 80; // Elips genişliği
            const h = 25; // Elips yüksekliği
            const bodyH = 100;
            const r = ozellikler?.yaricap;
            const yukseklik = ozellikler?.kenarlar?.[0];

            return (
                <svg viewBox="0 0 240 240" className="w-full max-w-xs mx-auto mt-2" style={{ fontFamily: FONT, filter: 'drop-shadow(0 4px 10px #0002)' }}>
                    <SvgDefs id={uid} color={anaRenk} />
                    
                    {/* Arka Alt Elips Yayı (Noktalı) */}
                    <path d={`M ${ox-w/2} ${oy+bodyH} A ${w/2} ${h/2} 0 0 1 ${ox+w/2} ${oy+bodyH}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                    
                    {/* Ön Alt Elips Yayı */}
                    <path d={`M ${ox-w/2} ${oy+bodyH} A ${w/2} ${h/2} 0 0 0 ${ox+w/2} ${oy+bodyH}`} fill={`${anaRenk}1A`} stroke={anaRenk} strokeWidth="2.5" />
                    
                    {/* Gövde */}
                    <path d={`M ${ox-w/2} ${oy} L ${ox-w/2} ${oy+bodyH} A ${w/2} ${h/2} 0 0 0 ${ox+w/2} ${oy+bodyH} L ${ox+w/2} ${oy} Z`} fill={`url(#shapeFill-${uid})`} opacity="0.6" />
                    <line x1={ox-w/2} y1={oy} x2={ox-w/2} y2={oy+bodyH} stroke={anaRenk} strokeWidth="2.5" />
                    <line x1={ox+w/2} y1={oy} x2={ox+w/2} y2={oy+bodyH} stroke={anaRenk} strokeWidth="2.5" />
                    
                    {/* Üst Elips */}
                    <ellipse cx={ox} cy={oy} rx={w/2} ry={h/2} fill={`${anaRenk}33`} stroke={anaRenk} strokeWidth="2.5" />
                    
                    {/* Yarıçap Çizgisi ve Etiketi */}
                    <circle cx={ox} cy={oy} r="3" fill="#1e293b" />
                    <line x1={ox} y1={oy} x2={ox+w/2} y2={oy} stroke="#1e293b" strokeWidth="1.5" strokeDasharray="2 2" />
                    {r && <text x={ox + w/4} y={oy - 5} fontSize="12" fill="#1e293b" fontWeight="bold" textAnchor="middle">r = {r}</text>}
                    
                    {/* Yükseklik Etiketi */}
                    {yukseklik && (
                        <>
                            <line x1={ox+w/2 + 10} y1={oy} x2={ox+w/2 + 10} y2={oy+bodyH} stroke="#94a3b8" strokeWidth="1.5" markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
                            <text x={ox+w/2 + 20} y={oy + bodyH/2} fontSize="12" fill="#1e293b" fontWeight="bold">h = {yukseklik}</text>
                        </>
                    )}
                </svg>
            );
        }

        /* ── DEFAULT fallback ───────────────────────────────────────────── */
        return (
            <div className="flex flex-wrap gap-2 mt-3">
                {veri.map((v, idx) => (
                    <div key={idx} className="rounded-xl px-3 py-2 text-sm border shadow-sm"
                        style={{ borderColor: COLORS[idx % COLORS.length] + '50', background: COLORS[idx % COLORS.length] + '10', fontFamily: FONT }}>
                        <span className="font-bold" style={{ color: COLORS[idx % COLORS.length] }}>{v.etiket}:</span>{' '}
                        <span className="text-gray-700">{v.deger}{v.birim ? ` ${v.birim}` : ''}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={`relative my-5 p-6 bg-gradient-to-b from-slate-50/80 to-white backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] print:shadow-none print:border-slate-300 print:bg-transparent overflow-hidden ${className}`}>
            {/* Ultra Premium Background Grid Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] print:hidden" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            <div className="relative z-10">
                {baslik && (
                    <h4 className="text-[15px] font-extrabold text-center text-slate-800 tracking-tight mb-1" style={{ fontFamily: FONT }}>{baslik}</h4>
                )}
                {not && (
                    <p className="text-[11px] font-medium text-center text-slate-500 mb-4 bg-slate-100/50 inline-block px-3 py-1 rounded-full mx-auto block max-w-fit" style={{ fontFamily: FONT }}>{not}</p>
                )}
                <div className="bg-white/40 rounded-2xl p-2 shadow-inner border border-slate-50/50">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
