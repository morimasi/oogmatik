
import React from 'react';
import { GridDrawingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement } from '../../Editable';

export const GridDrawingSheet = ({ data }: { data: GridDrawingData }) => {
    const settings = data?.settings;
    const gridDim = data?.gridDim || 10;
    const puzzleCount = settings?.puzzleCount || 1;
    const gridType = settings?.gridType || 'squares';
    const isUltraDense = puzzleCount > 1;

    // A4 Alan hesaplaması
    const availableWidth = 520;
    const cellSize = puzzleCount >= 4 
        ? Math.min(20, Math.floor(availableWidth / (gridDim * 2.5)))
        : puzzleCount === 2
        ? Math.min(28, Math.floor(availableWidth / (gridDim * 2)))
        : Math.min(34, Math.floor(availableWidth / (gridDim * 1.5)));

    const totalSize = gridDim * cellSize;
    const showCoords = settings?.showCoordinates;
    const offset = showCoords ? 15 : 8;

    const renderGrid = (lines: [number, number][][] | null, label: string, isReference: boolean) => {
        const sanitizedId = `grid-${isReference}-${label.replace(/\s+/g, '-')}-${Math.random()}`;

        return (
            <div className="flex flex-col items-center group/grid shrink-0">
                <div className={`
                    mb-1 px-2 py-0.5 rounded border font-black text-[6px] uppercase tracking-widest shadow-sm
                    ${isReference ? 'bg-zinc-900 text-white border-white' : 'bg-white text-zinc-300 border-zinc-100'}
                `}>
                    {label}
                </div>
                <div className={`
                    relative p-2 bg-white border rounded-2xl transition-all
                    ${isReference ? 'border-zinc-200 shadow-md ring-2 ring-zinc-50' : 'border-zinc-100 border-dashed shadow-sm'}
                `}>
                    <svg width={totalSize + offset * 2} height={totalSize + offset * 2} className="overflow-visible">
                        <defs>
                            <pattern id={sanitizedId} width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                                {gridType === 'squares' && (
                                    <rect width={cellSize} height={cellSize} fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
                                )}
                            </pattern>
                        </defs>
                        <rect x={offset} y={offset} width={totalSize} height={totalSize} fill={`url(#${sanitizedId})`} />

                        <g transform={`translate(${offset}, ${offset})`}>
                            {/* Precision Points */}
                            {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                const r = Math.floor(i / (gridDim + 1));
                                const c = i % (gridDim + 1);
                                if (gridType === 'dots') return <circle key={i} cx={c * cellSize} cy={r * cellSize} r={isUltraDense ? "0.6" : "1"} className={isReference ? "fill-zinc-400" : "fill-zinc-200"} />;
                                return null;
                            })}

                            {/* Reference Lines */}
                            {(lines || []).map((line, index) => (
                                <line
                                    key={index}
                                    x1={line[0][0] * cellSize} y1={line[0][1] * cellSize}
                                    x2={line[1][0] * cellSize} y2={line[1][1] * cellSize}
                                    stroke="#0f172a"
                                    strokeWidth={isUltraDense ? "2.5" : "4"}
                                    strokeLinecap="round"
                                />
                            ))}
                        </g>
                    </svg>
                </div>
            </div>
        );
    };

    const gridLayoutClass = puzzleCount > 1 ? 'grid grid-cols-2' : 'flex flex-col';

    return (
        <div className="flex flex-col h-full bg-white font-['Lexend'] text-black overflow-hidden professional-worksheet p-6 print:p-2 max-w-full">
            <PedagogicalHeader
                title={data?.title || "KARE KOPYALAMA & MOTOR PLANLAMA"}
                instruction={data?.instruction || "Örnek çizimi boş ızgaraya kopyalayın."}
                note={data?.pedagogicalNote}
                data={data}
            />

            <div className={`${gridLayoutClass} gap-4 print:gap-1.5 mt-4 print:mt-1 flex-1 content-center items-center justify-items-center w-full`}>
                {(data?.drawings || []).map((drawing, index) => (
                    <div
                        key={index}
                        className={`
                            relative flex flex-col items-center justify-center p-3 print:p-1 border border-zinc-100 rounded-3xl bg-zinc-50/20 break-inside-avoid w-full group
                            gap-2 print:gap-1
                        `}
                    >
                        <div className="flex flex-row gap-4 print:gap-2 items-center">
                            {renderGrid(drawing.lines, `REFERANS`, true)}
                            <div className="opacity-10 shrink-0">
                                <i className="fa-solid fa-chevron-right text-lg"></i>
                            </div>
                            {renderGrid(null, `UYGULAMA`, false)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Compact Footer */}
            <div className="mt-auto p-4 print:p-1 bg-zinc-900 text-white rounded-xl flex justify-between items-center shadow-lg mx-1">
                <div className="flex flex-col">
                    <span className="text-[6px] font-black text-indigo-400 uppercase tracking-widest tracking-[0.2em]">MOTOR PRECISION PROTOCOL</span>
                    <span className="text-[10px] font-black uppercase tracking-tight">{gridDim}x{gridDim} GRID • {puzzleCount} VARYASYON</span>
                </div>
                <div className="opacity-40">
                    <i className="fa-solid fa-pen-nib text-xs"></i>
                </div>
            </div>
        </div>
    );
};




