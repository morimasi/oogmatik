
import React from 'react';
import { SymmetryDrawingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const SymmetryDrawingSheet = ({ data }: { data: SymmetryDrawingData }) => {
    const settings = data?.settings;
    const gridDim = data?.gridDim || 10;
    const axis = settings?.axis || 'vertical';
    const gridType = settings?.gridType || 'squares';
    const showGhostPoints = settings?.showGhostPoints;

    // A4 Alan hesaplaması
    const availableWidth = 180 * 3.78; // mm to px approx
    const layout = settings?.layout || 'single';

    let cellSize = 45;
    if (layout === 'grid_2x1') cellSize = Math.min(38, Math.floor(availableWidth / (gridDim * 2 + 2)));
    else if (layout === 'grid_2x2') cellSize = Math.min(32, Math.floor(availableWidth / (gridDim * 2 + 2)));
    else cellSize = Math.min(48, Math.floor(availableWidth / (gridDim + 4)));

    const totalSize = gridDim * cellSize;
    const showCoords = settings?.showCoordinates;
    const offset = showCoords ? 25 : 10;

    const renderSVG = (lines: SymmetryDrawingData['drawings'][0]['lines'], dots: SymmetryDrawingData['drawings'][0]['dots'], title: string, clinicalMeta?: any) => {
        return (
            <div className="flex flex-col items-center group">
                <div className="mb-4 print:mb-1 px-4 print:px-1 py-1.5 bg-zinc-900 text-white rounded-xl border-2 border-white font-black text-[9px] uppercase tracking-widest shadow-lg transform group-hover:-translate-y-1 transition-transform">
                    {title}
                </div>
                <div className="relative p-3 bg-white border-2 border-zinc-100 rounded-[2.5rem] shadow-xl overflow-visible ring-8 ring-zinc-50 group-hover:ring-indigo-50 transition-all">
                    <svg width={totalSize + offset * 2} height={totalSize + offset * 2} className="overflow-visible">
                        <g transform={`translate(${offset}, ${offset})`}>
                            {/* Kare Izgara - Ultra Light */}
                            {gridType === 'squares' && Array.from({ length: gridDim + 1 }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} stroke="#e2e8f0" strokeWidth="0.5" />
                                    <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} stroke="#e2e8f0" strokeWidth="0.5" />
                                </React.Fragment>
                            ))}

                            {/* Koordinat Metinleri - Modern Mono */}
                            {showCoords && Array.from({ length: gridDim + 1 }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <text x={i * cellSize} y="-15" textAnchor="middle" fontSize="9" fontWeight="900" className="fill-zinc-400 font-mono tracking-tighter">{String.fromCharCode(65 + i)}</text>
                                    <text x="-15" y={i * cellSize} dominantBaseline="middle" textAnchor="end" fontSize="9" fontWeight="900" className="fill-zinc-400 font-mono tracking-tighter">{i + 1}</text>
                                </React.Fragment>
                            ))}

                            {/* Izgara Noktaları - Precision Dots */}
                            {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                const r = Math.floor(i / (gridDim + 1));
                                const c = i % (gridDim + 1);
                                if (gridType === 'dots') return <circle key={i} cx={c * cellSize} cy={r * cellSize} r="1.5" className="fill-zinc-300" />;
                                if (gridType === 'crosses') return (
                                    <g key={i}>
                                        <line x1={c * cellSize - 3} y1={r * cellSize} x2={c * cellSize + 3} y2={r * cellSize} stroke="#e2e8f0" strokeWidth="1" />
                                        <line x1={c * cellSize} y1={r * cellSize - 3} x2={c * cellSize} y2={r * cellSize + 3} stroke="#e2e8f0" strokeWidth="1" />
                                    </g>
                                );
                                return null;
                            })}

                            {/* Ghost Points (Bilişsel İskele) */}
                            {showGhostPoints && (dots || []).map((dot, i) => {
                                let mx = dot.x, my = dot.y;
                                if (axis === 'vertical') mx = gridDim - dot.x;
                                else if (axis === 'horizontal') my = gridDim - dot.y;
                                else if (axis === 'diagonal') { mx = dot.y; my = dot.x; }
                                return <circle key={`g-${i}`} cx={mx * cellSize} cy={my * cellSize} r="4" className="fill-indigo-50 stroke-indigo-200 stroke-1 opacity-50" />;
                            })}

                            {/* Orijinal Çizim - High Contrast */}
                            {(lines || []).map((l, i) => (
                                <line key={i} x1={l.x1 * cellSize} y1={l.y1 * cellSize} x2={l.x2 * cellSize} y2={l.y2 * cellSize} stroke="#0f172a" strokeWidth="5" strokeLinecap="round" className="drop-shadow-sm" />
                            ))}
                            {(dots || []).map((d, i) => (
                                <circle key={i} cx={d.x * cellSize} cy={d.y * cellSize} r="5" fill="#0f172a" />
                            ))}

                            {/* Simetri Ekseni - High Vis */}
                            {axis === 'vertical' && (
                                <line x1={(gridDim / 2) * cellSize} y1="-15" x2={(gridDim / 2) * cellSize} y2={totalSize + 15} stroke="#f43f5e" strokeWidth="4" strokeDasharray="8,4" />
                            )}
                            {axis === 'horizontal' && (
                                <line x1="-15" y1={(gridDim / 2) * cellSize} x2={totalSize + 15} y2={(gridDim / 2) * cellSize} stroke="#f43f5e" strokeWidth="4" strokeDasharray="8,4" />
                            )}
                            {axis === 'diagonal' && (
                                <line x1="-15" y1="-15" x2={totalSize + 15} y2={totalSize + 15} stroke="#f43f5e" strokeWidth="4" strokeDasharray="8,4" />
                            )}
                        </g>
                    </svg>
                </div>

                {/* Klinik Analiz Metrikleri */}
                {settings?.showClinicalNotes && clinicalMeta && (
                    <div className="mt-4 print:mt-1 w-full bg-zinc-50 rounded-2xl p-3 border border-zinc-100 flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-zinc-400">
                            <span>Karmaşıklık</span>
                            <span className="text-zinc-900">{clinicalMeta.complexity || '5'}/10</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
<<<<<<< HEAD
                            <div className="h-full  bg-indigo-500" style={{ width: `${(clinicalMeta.complexity || 5) * 10}%` }}></div>
=======
                            <div className="h-full print:h-0 bg-indigo-500" style={{ width: `${(clinicalMeta.complexity || 5) * 10}%` }}></div>
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                        </div>
                        <span className="text-[6px] font-bold text-indigo-400 uppercase mt-1">Hedef: {clinicalMeta.targetCognitiveSkill || 'Uzamsal Planlama'}</span>
                    </div>
                )}
            </div>
        );
    };

    const containerGridCols = layout === 'grid_2x1' ? 'grid-cols-2' : (layout === 'grid_2x2' ? 'grid-cols-2' : 'grid-cols-1');

    return (
<<<<<<< HEAD
        <div className="flex flex-col h-full  bg-white font-sans text-black overflow-visible professional-worksheet">
=======
        <div className="flex flex-col h-full print:h-0 bg-white font-sans text-black overflow-visible professional-worksheet">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
            <PedagogicalHeader
                title={data?.title || "SİMETRİ & MEKANSAL BÜTÜNLEME"}
                instruction={data?.instruction || "Kırmızı kesikli çizgiye göre şeklin aynadaki görüntüsünü diğer tarafa çizin."}
                note={data?.pedagogicalNote}
            />

            <div className={`grid ${containerGridCols} gap-12 print:gap-3 print:gap-4 print:gap-1 mt-10 print:mt-3 flex-1 content-start items-start justify-items-center pb-20 print:pb-4`}>
                {(data?.drawings || []).map((draw, i) => (
                    <EditableElement key={i} className="break-inside-avoid">
                        {renderSVG(draw.lines, draw.dots, draw.title, draw.clinicalMeta)}
                    </EditableElement>
                ))}
            </div>

            {/* Premium Footer Protokolü */}
            <div className="mt-auto p-6 print:p-2 bg-zinc-900 text-white rounded-t-[3rem] border-x-4 border-t-4 border-white flex justify-between items-center shadow-2xl mx-1">
                <div className="flex gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">PROTOKOL ADI</span>
                        <span className="text-xs font-black uppercase">Uzamsal Barkod & Simetri</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                    <span className="text-[8px] font-bold tracking-[0.2em]">MEKANSAL ALGI MATRİSİ v3.1</span>
                    <i className="fa-solid fa-shapes text-rose-400 text-xs shadow-glow"></i>
                </div>
            </div>
        </div>
    );
};



<<<<<<< HEAD

=======
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
