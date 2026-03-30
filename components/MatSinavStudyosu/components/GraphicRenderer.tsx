import React from 'react';
import type { GrafikVerisi } from '../../../src/types/matSinav';

export const GraphicRenderer: React.FC<{ grafik?: GrafikVerisi; className?: string }> = ({ grafik, className = '' }) => {
    if (!grafik) return null;

    const { tip, baslik, veri, ozellikler, not } = grafik;

    // Renk paleti
    const colors = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6', '#8b5cf6'];
    const anaRenk = ozellikler?.renk || '#4f46e5';

    const renderContent = () => {
        switch (tip) {
            case 'siklik_tablosu':
                return (
                    <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm mt-3">
                        <table className="w-full text-sm text-left align-middle">
                            <thead className="bg-indigo-50 border-b border-indigo-100 text-indigo-800">
                                <tr>
                                    <th className="px-4 py-2 font-semibold">Kategori</th>
                                    <th className="px-4 py-2 font-semibold text-right">Değer</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {veri.map((item, idx) => (
                                    <tr key={idx} className="bg-white hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium text-gray-700">{item.etiket} {item.nesne || ''}</td>
                                        <td className="px-4 py-2 text-right font-bold text-indigo-600">{item.deger} {item.birim || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'sutun_grafigi': {
                const maxDeger = Math.max(...veri.map(v => v.deger || 0), 10);
                const w = 400, h = 200, pl = 40, pr = 10, pt = 10, pb = 40;
                const chartW = w - pl - pr;
                const chartH = h - pt - pb;
                const barW = Math.min(40, chartW / veri.length - 10);

                return (
                    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto max-w-sm mx-auto mt-3 font-sans" preserveAspectRatio="xMidYMid meet">
                        {/* Grid & Eksenler */}
                        <line x1={pl} y1={pt} x2={pl} y2={h - pb} stroke="#e5e7eb" strokeWidth="2" />
                        <line x1={pl} y1={h - pb} x2={w - pr} y2={h - pb} stroke="#9ca3af" strokeWidth="2" />

                        {/* Y ekseni etiketleri (3 adım) */}
                        {[0, 0.5, 1].map(step => {
                            const y = h - pb - (chartH * step);
                            const val = Math.round(maxDeger * step);
                            return (
                                <g key={step}>
                                    <line x1={pl - 3} y1={y} x2={w - pr} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                                    <text x={pl - 8} y={y + 4} fontSize="10" fill="#6b7280" textAnchor="end">{val}</text>
                                </g>
                            );
                        })}

                        {/* Sütunlar */}
                        {veri.map((item, idx) => {
                            const val = item.deger || 0;
                            const barH = (val / maxDeger) * chartH;
                            const x = pl + (chartW / veri.length) * idx + (chartW / veri.length - barW) / 2;
                            const y = h - pb - barH;
                            return (
                                <g key={idx}>
                                    <rect x={x} y={y} width={barW} height={barH} fill={colors[idx % colors.length]} rx="2" />
                                    <text x={x + barW / 2} y={h - pb + 14} fontSize="10" fill="#4b5563" textAnchor="middle" className="truncate" width={barW}>{item.etiket}</text>
                                    <text x={x + barW / 2} y={y - 5} fontSize="10" fill="#111827" fontWeight="bold" textAnchor="middle">{val}</text>
                                </g>
                            );
                        })}
                    </svg>
                );
            }

            case 'pasta_grafigi': {
                const total = veri.reduce((sum, v) => sum + (v.deger || 0), 0) || 1;
                let startAngle = -90;
                const cx = 100, cy = 100, r = 80;

                return (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-3">
                        <svg viewBox="0 0 200 200" className="w-40 h-40 flex-shrink-0">
                            {veri.map((item, idx) => {
                                const val = item.deger || 0;
                                const angle = (val / total) * 360;
                                const endAngle = startAngle + angle;

                                const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
                                const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
                                const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
                                const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
                                const largeArc = angle > 180 ? 1 : 0;
                                const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                                startAngle = endAngle;
                                return <path key={idx} d={pathData} fill={colors[idx % colors.length]} stroke="#fff" strokeWidth="2" />;
                            })}
                        </svg>
                        <div className="flex flex-col gap-1.5 text-xs">
                            {veri.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                                    <span className="text-gray-700">{item.etiket}: <strong>{item.deger}</strong> ({Math.round(((item.deger || 0) / total) * 100)}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            case 'ucgen':
                return (
                    <svg viewBox="0 0 200 150" className="w-full max-w-[200px] mx-auto mt-2 drop-shadow-sm">
                        <polygon points="100,20 20,130 180,130" fill={`${anaRenk}20`} stroke={anaRenk} strokeWidth="3" strokeLinejoin="round" />
                        <text x="100" y="15" fontSize="12" fill="#4b5563" textAnchor="middle">A</text>
                        <text x="15" y="140" fontSize="12" fill="#4b5563" textAnchor="middle">B</text>
                        <text x="185" y="140" fontSize="12" fill="#4b5563" textAnchor="middle">C</text>
                        {ozellikler?.kenarlar && ozellikler.kenarlar.length >= 3 && (
                            <>
                                <text x="50" y="70" fontSize="11" fill={anaRenk} textAnchor="end">{ozellikler.kenarlar[0]}</text>
                                <text x="150" y="70" fontSize="11" fill={anaRenk} textAnchor="start">{ozellikler.kenarlar[1]}</text>
                                <text x="100" y="145" fontSize="11" fill={anaRenk} textAnchor="middle">{ozellikler.kenarlar[2]}</text>
                            </>
                        )}
                    </svg>
                );

            case 'kare':
            case 'dikdortgen': {
                const w = tip === 'kare' ? 120 : 160;
                const h = tip === 'kare' ? 120 : 80;
                return (
                    <svg viewBox={`0 0 200 150`} className="w-full max-w-[200px] mx-auto mt-2 drop-shadow-sm">
                        <rect x={(200 - w) / 2} y={(150 - h) / 2} width={w} height={h} fill={`${anaRenk}20`} stroke={anaRenk} strokeWidth="3" rx="4" />
                        {ozellikler?.kenarlar && (
                            <>
                                <text x="100" y={(150 - h) / 2 - 8} fontSize="12" fill={anaRenk} textAnchor="middle">{ozellikler.kenarlar[0]}</text>
                                <text x={(200 + w) / 2 + 8} y="75" fontSize="12" fill={anaRenk} dominantBaseline="middle">{ozellikler.kenarlar[1] || ozellikler.kenarlar[0]}</text>
                            </>
                        )}
                        {/* Dik açılar */}
                        <polyline points={`${(200 - w) / 2},${(150 - h) / 2 + 10} ${(200 - w) / 2 + 10},${(150 - h) / 2 + 10} ${(200 - w) / 2 + 10},${(150 - h) / 2}`} fill="none" stroke={anaRenk} strokeWidth="1" />
                    </svg>
                );
            }

            case 'daire': {
                const r = 60;
                return (
                    <svg viewBox="0 0 200 150" className="w-full max-w-[200px] mx-auto mt-2 drop-shadow-sm">
                        <circle cx="100" cy="75" r={r} fill={`${anaRenk}20`} stroke={anaRenk} strokeWidth="3" />
                        <circle cx="100" cy="75" r="3" fill={anaRenk} />
                        <line x1="100" y1="75" x2="160" y2="75" stroke={anaRenk} strokeWidth="2" strokeDasharray="4 2" />
                        <text x="130" y="68" fontSize="12" fill={anaRenk} textAnchor="middle">{ozellikler?.yaricap ? `r = ${ozellikler.yaricap}` : 'r'}</text>
                    </svg>
                );
            }

            case 'sayi_dogrusu': {
                const pts = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
                return (
                    <div className="w-full overflow-x-auto py-2">
                        <svg viewBox="0 0 400 60" className="w-full min-w-[300px] h-16 mx-auto mt-2">
                            <line x1="20" y1="30" x2="380" y2="30" stroke="#4b5563" strokeWidth="2" />
                            <polygon points="380,25 390,30 380,35" fill="#4b5563" />
                            <polygon points="20,25 10,30 20,35" fill="#4b5563" />
                            {pts.map((p, i) => {
                                const x = 30 + (340 / (pts.length - 1)) * i;
                                return (
                                    <g key={p}>
                                        <line x1={x} y1="25" x2={x} y2="35" stroke="#4b5563" strokeWidth="2" />
                                        <text x={x} y="50" fontSize="12" fill={p === 0 ? '#ef4444' : '#6b7280'} fontWeight={p === 0 ? 'bold' : 'normal'} textAnchor="middle">{p}</text>
                                    </g>
                                );
                            })}
                            {/* Varsa noktaları işaretle */}
                            {veri.map((v, idx) => {
                                if (v.deger !== undefined && v.deger >= -5 && v.deger <= 5) {
                                    const x = 30 + (340 / (pts.length - 1)) * (v.deger + 5);
                                    return (
                                        <g key={`m-${idx}`}>
                                            <circle cx={x} cy="30" r="5" fill={anaRenk} />
                                            <text x={x} y="15" fontSize="12" fill={anaRenk} fontWeight="bold" textAnchor="middle">{v.etiket}</text>
                                        </g>
                                    );
                                }
                                return null;
                            })}
                        </svg>
                    </div>
                );
            }

            case 'koordinat_sistemi': {
                return (
                    <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto mt-2 drop-shadow-sm">
                        {/* Grid */}
                        {[...Array(11)].map((_, i) => (
                            <React.Fragment key={`grid-${i}`}>
                                <line x1="0" y1={i * 20} x2="200" y2={i * 20} stroke="#f3f4f6" strokeWidth="1" />
                                <line x1={i * 20} y1="0" x2={i * 20} y2="200" stroke="#f3f4f6" strokeWidth="1" />
                            </React.Fragment>
                        ))}
                        {/* Axes */}
                        <line x1="100" y1="0" x2="100" y2="200" stroke="#9ca3af" strokeWidth="2" />
                        <line x1="0" y1="100" x2="200" y2="100" stroke="#9ca3af" strokeWidth="2" />
                        <text x="190" y="112" fontSize="10" fill="#6b7280">x</text>
                        <text x="105" y="10" fontSize="10" fill="#6b7280">y</text>

                        {/* Points */}
                        {veri.map((v, idx) => {
                            if (v.x !== undefined && v.y !== undefined) {
                                const px = 100 + v.x * 20;
                                const py = 100 - v.y * 20;
                                return (
                                    <g key={`pt-${idx}`}>
                                        <circle cx={px} cy={py} r="4" fill={anaRenk} />
                                        <text x={px + 6} y={py - 6} fontSize="11" fill={anaRenk} fontWeight="bold">{v.etiket}</text>
                                    </g>
                                );
                            }
                            return null;
                        })}
                    </svg>
                );
            }

            case 'cetele_tablosu': {
                // Çetele çizgilerini gruplar halinde göster (||||  = 5)
                const renderTallyMarks = (count: number) => {
                    const full = Math.floor(count / 5);
                    const remainder = count % 5;
                    const marks: React.ReactNode[] = [];
                    for (let g = 0; g < full; g++) {
                        marks.push(
                            <span key={`g${g}`} className="inline-flex items-center mr-1.5 text-indigo-700 font-bold tracking-tighter text-base">
                                {'||||'}
                                <span className="inline-block w-3 h-0.5 bg-indigo-700 -rotate-[65deg] mx-0.5" />
                            </span>
                        );
                    }
                    if (remainder > 0) {
                        marks.push(
                            <span key="rem" className="inline-flex items-center mr-1.5 text-indigo-700 font-bold tracking-tighter text-base">
                                {'|'.repeat(remainder)}
                            </span>
                        );
                    }
                    return marks.length > 0 ? marks : <span className="text-gray-400">—</span>;
                };

                return (
                    <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm mt-3">
                        <table className="w-full text-sm text-left align-middle">
                            <thead className="bg-green-50 border-b border-green-100 text-green-800">
                                <tr>
                                    <th className="px-4 py-2 font-semibold">Kategori</th>
                                    <th className="px-4 py-2 font-semibold">Çetele</th>
                                    <th className="px-4 py-2 font-semibold text-right">Sayı</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {veri.map((item, idx) => (
                                    <tr key={idx} className="bg-white hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium text-gray-700">{item.etiket} {item.nesne || ''}</td>
                                        <td className="px-4 py-2">{renderTallyMarks(item.deger || 0)}</td>
                                        <td className="px-4 py-2 text-right font-bold text-green-700">{item.deger} {item.birim || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }

            case 'cizgi_grafigi': {
                const maxVal = Math.max(...veri.map(v => v.deger || 0), 1);
                const w = 400, h = 200, pl = 44, pr = 16, pt = 16, pb = 44;
                const chartW = w - pl - pr;
                const chartH = h - pt - pb;
                const stepX = veri.length > 1 ? chartW / (veri.length - 1) : chartW;

                const pointCoords = veri.map((item, i) => ({
                    x: pl + stepX * i,
                    y: h - pb - ((item.deger || 0) / maxVal) * chartH,
                }));
                const linePath = pointCoords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                return (
                    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto max-w-sm mx-auto mt-3 font-sans" preserveAspectRatio="xMidYMid meet">
                        {/* Grid & Axes */}
                        <line x1={pl} y1={pt} x2={pl} y2={h - pb} stroke="#e5e7eb" strokeWidth="2" />
                        <line x1={pl} y1={h - pb} x2={w - pr} y2={h - pb} stroke="#9ca3af" strokeWidth="2" />
                        {[0, 0.25, 0.5, 0.75, 1].map(step => {
                            const y = h - pb - chartH * step;
                            return (
                                <g key={step}>
                                    <line x1={pl} y1={y} x2={w - pr} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                                    <text x={pl - 6} y={y + 4} fontSize="10" fill="#6b7280" textAnchor="end">{Math.round(maxVal * step)}</text>
                                </g>
                            );
                        })}
                        {/* Line */}
                        <path d={linePath} fill="none" stroke={anaRenk} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                        {/* Points & Labels */}
                        {pointCoords.map((p, idx) => (
                            <g key={idx}>
                                <circle cx={p.x} cy={p.y} r="4" fill={anaRenk} stroke="#fff" strokeWidth="1.5" />
                                <text x={p.x} y={h - pb + 16} fontSize="10" fill="#4b5563" textAnchor="middle">{veri[idx].etiket}</text>
                                <text x={p.x} y={p.y - 8} fontSize="10" fill={anaRenk} fontWeight="bold" textAnchor="middle">{veri[idx].deger}</text>
                            </g>
                        ))}
                    </svg>
                );
            }

            case 'dogru_parcasi': {
                // Doğru parçası, doğru veya ışın
                const uzunluk = ozellikler?.kenarlar?.[0];
                return (
                    <svg viewBox="0 0 300 80" className="w-full max-w-xs mx-auto mt-2">
                        {/* Çift ok — doğru */}
                        <defs>
                            <marker id="arrow-l" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                                <path d="M8,0 L0,4 L8,8" fill="none" stroke={anaRenk} strokeWidth="1.5" />
                            </marker>
                            <marker id="arrow-r" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                                <path d="M0,0 L8,4 L0,8" fill="none" stroke={anaRenk} strokeWidth="1.5" />
                            </marker>
                        </defs>
                        <line
                            x1="20" y1="40" x2="280" y2="40"
                            stroke={anaRenk} strokeWidth="2.5"
                            markerStart="url(#arrow-l)" markerEnd="url(#arrow-r)"
                        />
                        {/* Uç noktalar */}
                        {veri.length > 0 && (
                            <>
                                <circle cx="40" cy="40" r="4" fill={anaRenk} />
                                <text x="40" y="28" fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">{veri[0].etiket}</text>
                            </>
                        )}
                        {veri.length > 1 && (
                            <>
                                <circle cx="260" cy="40" r="4" fill={anaRenk} />
                                <text x="260" y="28" fontSize="13" fill="#374151" fontWeight="bold" textAnchor="middle">{veri[1].etiket}</text>
                            </>
                        )}
                        {uzunluk && (
                            <>
                                <line x1="40" y1="55" x2="260" y2="55" stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 2" />
                                <text x="150" y="68" fontSize="12" fill={anaRenk} fontWeight="bold" textAnchor="middle">{uzunluk} {ozellikler?.birim || ''}</text>
                            </>
                        )}
                    </svg>
                );
            }

            case 'aci': {
                const aciDerece = ozellikler?.acilar?.[0] ?? 60;
                const rad = (aciDerece * Math.PI) / 180;
                const cx = 100, cy = 100, r = 65;
                // İlk kol yatay sağa
                const x1 = cx + r;
                const y1 = cy;
                // İkinci kol açı kadar döndürülmüş
                const x2 = cx + r * Math.cos(-rad);
                const y2 = cy + r * Math.sin(-rad);
                // Yay için
                const arcR = 28;
                const arcX = cx + arcR * Math.cos(-rad / 2);
                const arcY = cy + arcR * Math.sin(-rad / 2);
                const largeArc = aciDerece > 180 ? 1 : 0;
                const ax1 = cx + arcR;
                const ay1 = cy;
                const ax2 = cx + arcR * Math.cos(-rad);
                const ay2 = cy + arcR * Math.sin(-rad);

                return (
                    <svg viewBox="0 0 200 180" className="w-full max-w-[200px] mx-auto mt-2 drop-shadow-sm">
                        {/* Kollar */}
                        <line x1={cx} y1={cy} x2={x1} y2={y1} stroke={anaRenk} strokeWidth="2.5" strokeLinecap="round" />
                        <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={anaRenk} strokeWidth="2.5" strokeLinecap="round" />
                        {/* Yay */}
                        <path d={`M ${ax1} ${ay1} A ${arcR} ${arcR} 0 ${largeArc} 0 ${ax2} ${ay2}`} fill="none" stroke={anaRenk} strokeWidth="1.5" opacity="0.6" />
                        {/* Açı etiketi */}
                        <text x={arcX} y={arcY - 4} fontSize="11" fill={anaRenk} fontWeight="bold" textAnchor="middle">{aciDerece}°</text>
                        {/* Köşe noktaları */}
                        {veri.length > 0 && <text x={cx - 12} y={cy + 4} fontSize="12" fill="#374151" fontWeight="bold">{veri[0]?.etiket || ''}</text>}
                        {veri.length > 1 && <text x={x1 + 6} y={y1 + 4} fontSize="12" fill="#374151">{veri[1]?.etiket || ''}</text>}
                        {veri.length > 2 && <text x={x2 + 4} y={y2 - 4} fontSize="12" fill="#374151">{veri[2]?.etiket || ''}</text>}
                    </svg>
                );
            }

            case 'kesir_modeli': {
                // Pasta dilimi modeli (daire üzerinde kesir)
                const payda = ozellikler?.kenarlar?.[0] ?? veri.length ?? 4;
                const pay = Math.max(1, Math.round(veri.filter(v => v.deger === 1 || v.nesne === 'dolu').length));
                const dilimAcisi = 360 / payda;

                return (
                    <div className="flex flex-col items-center gap-3 mt-3">
                        <svg viewBox="0 0 200 200" className="w-36 h-36">
                            {Array.from({ length: payda }).map((_, i) => {
                                const startA = (i * dilimAcisi - 90) * (Math.PI / 180);
                                const endA = ((i + 1) * dilimAcisi - 90) * (Math.PI / 180);
                                const r = 85;
                                const x1 = 100 + r * Math.cos(startA);
                                const y1 = 100 + r * Math.sin(startA);
                                const x2 = 100 + r * Math.cos(endA);
                                const y2 = 100 + r * Math.sin(endA);
                                const dolu = i < pay;
                                return (
                                    <path
                                        key={i}
                                        d={`M 100 100 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                                        fill={dolu ? anaRenk : `${anaRenk}22`}
                                        stroke="#fff"
                                        strokeWidth="2"
                                    />
                                );
                            })}
                        </svg>
                        <div className="text-center">
                            <div className="inline-flex flex-col items-center bg-indigo-50 rounded-xl px-4 py-2">
                                <span className="text-xl font-extrabold text-indigo-700 leading-none border-b-2 border-indigo-400 px-2">{pay}</span>
                                <span className="text-xl font-extrabold text-indigo-700 leading-none px-2">{payda}</span>
                            </div>
                        </div>
                    </div>
                );
            }

            case 'simetri': {
                // Şekil simetri ekseni ile gösterilir
                const bW = 60, bH = 80;
                return (
                    <svg viewBox="0 0 260 160" className="w-full max-w-xs mx-auto mt-2 drop-shadow-sm">
                        {/* Sol şekil */}
                        <rect x="20" y="40" width={bW} height={bH} fill={`${anaRenk}30`} stroke={anaRenk} strokeWidth="2" rx="3" />
                        {/* Simetri ekseni */}
                        <line x1="130" y1="10" x2="130" y2="150" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 4" />
                        <text x="130" y="8" fontSize="10" fill="#ef4444" textAnchor="middle" fontWeight="bold">Simetri Ekseni</text>
                        {/* Sağ şekil (ayna) */}
                        <rect x="180" y="40" width={bW} height={bH} fill={`${anaRenk}30`} stroke={anaRenk} strokeWidth="2" rx="3" />
                        {/* Yansıma oku */}
                        <text x="130" y="100" fontSize="10" fill={anaRenk} textAnchor="middle">↔</text>
                        {/* Etiketler */}
                        {veri[0] && <text x="50" y={40 + bH + 16} fontSize="11" fill="#374151" textAnchor="middle">{veri[0].etiket}</text>}
                        {veri[1] && <text x="210" y={40 + bH + 16} fontSize="11" fill="#374151" textAnchor="middle">{veri[1].etiket}</text>}
                    </svg>
                );
            }

            default:
                // Bilinmeyen tip için basit metin listesi fallback
                return (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {veri.map((v, idx) => (
                            <div key={idx} className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 text-sm">
                                <span className="font-semibold text-indigo-800">{v.etiket}:</span> <span className="text-gray-700">{v.deger} {v.birim}</span>
                            </div>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className={`my-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm print:shadow-none print:border-gray-200 ${className}`}>
            <h4 className="text-sm font-bold text-center text-gray-800 mb-1">{baslik}</h4>
            {not && <p className="text-xs text-center text-gray-500 mb-2 italic">{not}</p>}
            {renderContent()}
        </div>
    );
};
