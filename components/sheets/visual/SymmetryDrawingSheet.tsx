
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
    const isProfessionalMode = settings?.isProfessionalMode;

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
        const sanitizedId = `symmetry-${title.replace(/\s+/g, '-')}`;

        return (
            <div className="flex flex-col items-center">
                <div className="mb-2 px-3 py-1 bg-zinc-900 text-white rounded-lg border font-black text-[8px] uppercase tracking-tighter shadow-sm">
                    {title}
                </div>
                <div className="relative p-2 bg-white border-2 border-zinc-900 rounded-2xl shadow-sm overflow-visible">
                    <svg width={totalSize + offset * 2} height={totalSize + offset * 2} className="overflow-visible">
                        <g transform={`translate(${offset}, ${offset})`}>
                            {/* Kare Izgara */}
                            {gridType === 'squares' && Array.from({ length: gridDim + 1 }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} stroke="#f1f5f9" strokeWidth="1" />
                                    <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} stroke="#f1f5f9" strokeWidth="1" />
                                </React.Fragment>
                            ))}

                            {/* Koordinat Metinleri */}
                            {showCoords && Array.from({ length: gridDim + 1 }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <text x={i * cellSize} y="-12" textAnchor="middle" fontSize="8" fontWeight="900" className="fill-zinc-300 font-mono">{String.fromCharCode(65 + i)}</text>
                                    <text x="-12" y={i * cellSize} dominantBaseline="middle" textAnchor="end" fontSize="8" fontWeight="900" className="fill-zinc-300 font-mono">{i + 1}</text>
                                </React.Fragment>
                            ))}

                            {/* Izgara Noktaları */}
                            {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                const r = Math.floor(i / (gridDim + 1));
                                const c = i % (gridDim + 1);
                                if (gridType === 'dots') return <circle key={i} cx={c * cellSize} cy={r * cellSize} r="1.5" className="fill-zinc-200" />;
                                if (gridType === 'crosses') return (
                                    <g key={i}>
                                        <line x1={c * cellSize - 2} y1={r * cellSize} x2={c * cellSize + 2} y2={r * cellSize} stroke="#f1f5f9" strokeWidth="1" />
                                        <line x1={c * cellSize} y1={r * cellSize - 2} x2={c * cellSize} y2={r * cellSize + 2} stroke="#f1f5f9" strokeWidth="1" />
                                    </g>
                                );
                                return null;
                            })}

                            {/* Ghost Points (Pedagojik Destek) */}
                            {showGhostPoints && (dots || []).map((dot, i) => {
                                let mx = dot.x, my = dot.y;
                                if (axis === 'vertical') mx = gridDim - dot.x;
                                else if (axis === 'horizontal') my = gridDim - dot.y;
                                else if (axis === 'diagonal') { mx = dot.y; my = dot.x; }
                                return <circle key={`g-${i}`} cx={mx * cellSize} cy={my * cellSize} r="3" className="fill-indigo-50 stroke-indigo-100 stroke-1" />;
                            })}

                            {/* Orijinal Çizim */}
                            {(lines || []).map((l, i) => (
                                <line key={i} x1={l.x1 * cellSize} y1={l.y1 * cellSize} x2={l.x2 * cellSize} y2={l.y2 * cellSize} stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                            ))}
                            {(dots || []).map((d, i) => (
                                <circle key={i} cx={d.x * cellSize} cy={d.y * cellSize} r="4" fill="#0f172a" />
                            ))}

                            {/* Simetri Ekseni */}
                            {axis === 'vertical' && (
                                <line x1={(gridDim / 2) * cellSize} y1="-10" x2={(gridDim / 2) * cellSize} y2={totalSize + 10} stroke="#f43f5e" strokeWidth="3" strokeDasharray="6,3" />
                            )}
                            {axis === 'horizontal' && (
                                <line x1="-10" y1={(gridDim / 2) * cellSize} x2={totalSize + 10} y2={(gridDim / 2) * cellSize} stroke="#f43f5e" strokeWidth="3" strokeDasharray="6,3" />
                            )}
                            {axis === 'diagonal' && (
                                <line x1="-10" y1="-10" x2={totalSize + 10} y2={totalSize + 10} stroke="#f43f5e" strokeWidth="3" strokeDasharray="6,3" />
                            )}
                        </g>
                    </svg>
                </div>
                {settings?.showClinicalNotes && clinicalMeta && (
                    <div className="mt-2 w-full text-center">
                        <span className="text-[6px] font-black uppercase text-zinc-300 tracking-widest">
                            Heuristic: {clinicalMeta.targetCognitiveSkill} | Complex: {clinicalMeta.complexity}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const containerGridCols = layout === 'grid_2x1' ? 'grid-cols-2' : (layout === 'grid_2x2' ? 'grid-cols-2' : 'grid-cols-1');

    return (
        <div className="flex flex-col h-full bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader title={data?.title || "SİMETRİ TAMAMLAMA"} instruction={data?.instruction} note={data?.pedagogicalNote} />

            <div className={`grid ${containerGridCols} gap-8 mt-6 flex-1 content-start items-start justify-items-center`}>
                {(data?.drawings || []).map((draw, i) => (
                    <EditableElement key={i} className="break-inside-avoid">
                        {renderSVG(draw.lines, draw.dots, draw.title, draw.clinicalMeta)}
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};
