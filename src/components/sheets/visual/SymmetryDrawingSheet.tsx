
import React from 'react';
import { SymmetryDrawingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const SymmetryDrawingSheet = ({ data }: { data: SymmetryDrawingData }) => {
    const settings = data?.settings;
    const gridDim = data?.gridDim || 10;
    const axis = settings?.axis || 'vertical';
    const gridType = settings?.gridType || 'dots';
    const showGhostPoints = settings?.showGhostPoints;
    const puzzleCount = settings?.puzzleCount || data?.drawings?.length || 1;

    // Layout configuration
    const isGridMode = puzzleCount > 1;
    const containerCols = puzzleCount === 2 ? 1 : (puzzleCount > 2 ? 2 : 1);
    
    // A4 Alan hesaplaması (Print-ready optimization)
    const availableWidth = isGridMode ? (puzzleCount === 2 ? 520 : 340) : 520;
    
    let cellSize = 45;
    if (puzzleCount === 2) cellSize = Math.min(32, Math.floor(availableWidth / (gridDim * 1.5)));
    else if (puzzleCount > 2) cellSize = Math.min(24, Math.floor(availableWidth / (gridDim * 1.2)));
    else cellSize = Math.min(42, Math.floor(availableWidth / (gridDim + 4)));

    const totalSize = gridDim * cellSize;
    const showCoords = settings?.showCoordinates;
    const offset = showCoords ? 20 : 10;

    const renderSVG = (lines: SymmetryDrawingData['drawings'][0]['lines'], dots: SymmetryDrawingData['drawings'][0]['dots'], title: string, clinicalMeta?: any) => {
        const sanitizedId = `sym-${title.replace(/\s+/g, '-')}-${Math.random()}`;

        return (
            <div className="flex flex-col items-center group shrink-0 break-inside-avoid">
                <div className="mb-2 print:mb-1 px-3 py-1 bg-zinc-900 text-white rounded-lg border-[1.5px] border-zinc-800 font-black text-[8px] uppercase tracking-wider shadow-sm">
                    {title}
                </div>
                <div className={`
                    relative p-2 print:p-1 bg-white border-[1.5px] border-zinc-100 rounded-[2rem] shadow-md overflow-visible transition-all
                    ${isGridMode ? 'ring-4 ring-zinc-50' : 'ring-8 ring-zinc-50'}
                `}>
                    <svg width={totalSize + offset * 2} height={totalSize + offset * 2} className="overflow-visible max-w-full h-auto">
                        <g transform={`translate(${offset}, ${offset})`}>
                            {/* Modern Grid */}
                            {gridType === 'squares' && Array.from({ length: gridDim + 1 }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} stroke="#f1f5f9" strokeWidth="0.5" />
                                    <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} stroke="#f1f5f9" strokeWidth="0.5" />
                                </React.Fragment>
                            ))}

                            {/* Coordinates */}
                            {showCoords && Array.from({ length: gridDim + 1 }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <text x={i * cellSize} y="-8" textAnchor="middle" fontSize="7" fontWeight="900" className="fill-zinc-300 font-mono italic">{String.fromCharCode(65 + i)}</text>
                                    <text x="-8" y={i * cellSize} dominantBaseline="middle" textAnchor="end" fontSize="7" fontWeight="900" className="fill-zinc-300 font-mono italic">{i + 1}</text>
                                </React.Fragment>
                            ))}

                            {/* Precision Dots */}
                            {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                const r = Math.floor(i / (gridDim + 1));
                                const c = i % (gridDim + 1);
                                if (gridType === 'dots') return <circle key={i} cx={c * cellSize} cy={r * cellSize} r="1" className="fill-zinc-200" />;
                                return null;
                            })}

                            {/* Ghost Points */}
                            {showGhostPoints && (dots || []).map((dot, i) => {
                                let coords = [{ x: dot.x, y: dot.y }];
                                if (axis === 'vertical' || axis === 'both') coords.push({ x: gridDim - dot.x, y: dot.y });
                                if (axis === 'horizontal' || axis === 'both') coords.push({ x: dot.x, y: gridDim - dot.y });
                                if (axis === 'diagonal') coords.push({ x: dot.y, y: dot.x });
                                if (axis === 'both') coords.push({ x: gridDim - dot.x, y: gridDim - dot.y });

                                return coords.map((c, ci) => (
                                    <circle key={`g-${i}-${ci}`} cx={c.x * cellSize} cy={c.y * cellSize} r={cellSize/5} className="fill-rose-50 stroke-rose-100 stroke-[0.5] opacity-40" />
                                ));
                            })}

                            {/* Original Drawing */}
                            {(lines || []).map((l, i) => (
                                <line key={i} x1={l.x1 * cellSize} y1={l.y1 * cellSize} x2={l.x2 * cellSize} y2={l.y2 * cellSize} stroke="#0f172a" strokeWidth="4" strokeLinecap="round" className="drop-shadow-sm" />
                            ))}
                            {(dots || []).map((d, i) => (
                                <circle key={i} cx={d.x * cellSize} cy={d.y * cellSize} r="4" fill="#0f172a" />
                            ))}

                            {/* Symmetry Axis */}
                            {(axis === 'vertical' || axis === 'both') && (
                                <line x1={(gridDim / 2) * cellSize} y1="-5" x2={(gridDim / 2) * cellSize} y2={totalSize + 5} stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4,2" />
                            )}
                            {(axis === 'horizontal' || axis === 'both') && (
                                <line x1="-5" y1={(gridDim / 2) * cellSize} x2={totalSize + 5} y2={(gridDim / 2) * cellSize} stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4,2" />
                            )}
                            {axis === 'diagonal' && (
                                <line x1="-5" y1="-5" x2={totalSize + 5} y2={totalSize + 5} stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4,2" />
                            )}
                        </g>
                    </svg>
                </div>

                {/* Clinical Micro-Panel */}
                {settings?.showClinicalNotes && clinicalMeta && (
                    <div className="mt-2 w-full max-w-[140px] px-2 py-1 bg-zinc-50 rounded-lg border border-zinc-100 flex justify-between items-center opacity-60">
                        <span className="text-[6px] font-black uppercase text-zinc-400">Node complexity</span>
                        <span className="text-[7px] font-black text-rose-500">{clinicalMeta.complexity} pts</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white font-['Lexend'] text-black overflow-visible professional-worksheet max-w-full">
            <PedagogicalHeader
                title={data?.title || "SİMETRİ & MEKANSAL BÜTÜNLEME"}
                instruction={data?.instruction || "Kırmızı kesikli çizgiye göre şeklin aynadaki görüntüsünü diğer tarafa çizerek tasarımı tamamlayın."}
            />

            <div className={`
                flex-1 grid gap-8 print:gap-4 p-8 print:p-2 items-center justify-center content-center
                ${containerCols === 2 ? 'grid-cols-2' : 'grid-cols-1'}
            `}>
                {(data?.drawings || []).map((draw, i) => (
                    <EditableElement key={i}>
                        {renderSVG(draw.lines, draw.dots, draw.title, draw.clinicalMeta)}
                    </EditableElement>
                ))}
            </div>

            {/* Premium Footer */}
            <div className="mt-auto p-5 print:p-2 bg-zinc-950 text-white rounded-t-[2.5rem] flex justify-between items-center shadow-2xl">
                <div className="flex gap-6 items-center">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                        <i className="fa-solid fa-clone text-rose-400"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[6px] font-black text-rose-400 uppercase tracking-[0.4em] mb-1">KLİNİK PROTOKOL</span>
                        <span className="text-[10px] font-black uppercase">Visuo-Spatial Mapping Engine v2.1</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col">
                        <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest">EKSEN MODU</span>
                        <span className="text-[9px] font-black opacity-60 italic">{axis.toUpperCase()}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10 mx-2"></div>
                    <i className="fa-solid fa-fingerprint text-zinc-700 text-lg"></i>
                </div>
            </div>
        </div>
    );
};
        </div>
    );
};




