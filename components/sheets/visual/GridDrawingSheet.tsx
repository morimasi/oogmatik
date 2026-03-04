
import React from 'react';
import { GridDrawingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement } from '../../Editable';

export const GridDrawingSheet: React.FC<{ data: GridDrawingData }> = ({ data }) => {
    const gridDim = data?.gridDim || 6;
    const isStackView = gridDim > 7;
    const targetCellSize = gridDim > 10 ? 30 : 45;
    const maxSafeWidth = 750;
    
    const cellSize = isStackView 
        ? Math.min(targetCellSize, Math.floor(650 / gridDim))
        : Math.min(targetCellSize, Math.floor((maxSafeWidth - 100) / (gridDim * 2)));

    const totalSize = gridDim * cellSize;
    const showCoords = data?.showCoordinates;
    const offset = showCoords ? 25 : 5;

    const renderGrid = (lines: [number, number][][] | null, label: string, isReference: boolean) => {
        const sanitizedId = `pattern-${isReference}-${label.replace(/[^a-z0-9]/gi, '-')}`;
        
        return (
            <div className="flex flex-col items-center">
                <div className={`mb-3 px-5 py-1.5 rounded-2xl border-2 font-black text-[9px] uppercase tracking-widest transition-all shadow-sm ${isReference ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}>
                    {label}
                </div>
                <div className="relative p-2 bg-white border-[4px] border-zinc-900 shadow-xl rounded-2xl overflow-visible">
                    <svg width={totalSize + offset + 10} height={totalSize + offset + 10} className="overflow-visible">
                        <defs>
                            <pattern id={sanitizedId} width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                                <rect width={cellSize} height={cellSize} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect x={offset} y={offset} width={totalSize} height={totalSize} fill={`url(#${sanitizedId})`} />

                        {showCoords && (
                            <g>
                                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <text x={i * cellSize + offset} y={offset - 10} textAnchor="middle" fontSize="9" fontWeight="900" className="fill-zinc-400 font-mono">{String.fromCharCode(65 + i)}</text>
                                        <text x={offset - 10} y={i * cellSize + offset} dominantBaseline="middle" textAnchor="end" fontSize="9" fontWeight="900" className="fill-zinc-400 font-mono">{i + 1}</text>
                                    </React.Fragment>
                                ))}
                            </g>
                        )}

                        <g transform={`translate(${offset}, ${offset})`}>
                            {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                const r = Math.floor(i / (gridDim + 1));
                                const c = i % (gridDim + 1);
                                return <circle key={i} cx={c * cellSize} cy={r * cellSize} r={cellSize > 30 ? "2.5" : "1.8"} className={`${isReference ? "fill-zinc-800" : "fill-zinc-200"}`} />
                            })}

                            {(lines || []).map((line, index) => {
                                if (!line || line.length < 2) return null;
                                return (
                                    <g key={index}>
                                        <line
                                            x1={line[0][0] * cellSize} y1={line[0][1] * cellSize}
                                            x2={line[1][0] * cellSize} y2={line[1][1] * cellSize}
                                            stroke="#000"
                                            strokeWidth={cellSize > 30 ? "5" : "3.5"}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="none"
                                        />
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white p-2">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
            <div className="flex-1 flex flex-col gap-10 py-6 items-center justify-center">
                {(data?.drawings || []).map((drawing, index) => (
                    <EditableElement key={index} className={`flex ${isStackView ? 'flex-col gap-12' : 'flex-row gap-[75px]'} items-center justify-center p-8 bg-zinc-50/20 rounded-[3rem] border border-zinc-100 break-inside-avoid w-full transition-all`}>
                        {renderGrid(drawing.lines, `ÖRNEK`, true)}
                        {renderGrid(null, `ÇİZİM ALANI`, false)}
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};
