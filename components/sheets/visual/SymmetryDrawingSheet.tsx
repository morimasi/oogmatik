
import React from 'react';
import { SymmetryDrawingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement } from '../../Editable';

export const SymmetryDrawingSheet: React.FC<{ data: SymmetryDrawingData }> = ({ data }) => {
    const gridDim = data?.gridDim || 10;
    const maxAvailableWidth = 680;
    const maxAvailableHeight = 780;
    const cellSize = Math.min(45, Math.floor(maxAvailableWidth / gridDim), Math.floor(maxAvailableHeight / gridDim));
    const totalSize = gridDim * cellSize;
    const showCoords = data?.showCoordinates;
    const axis = data?.axis || 'vertical';
    const offset = showCoords ? 25 : 10;

    return (
        <div className="flex flex-col h-full bg-white p-2 font-sans">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
            
            <div className="flex-1 flex flex-col items-center justify-center py-6">
                <EditableElement className="relative p-10 bg-[#f8fafc] rounded-[3.5rem] border-4 border-zinc-200 shadow-xl overflow-visible">
                    <div className="bg-white p-4 border-[6px] border-zinc-900 shadow-2xl relative overflow-visible rounded-xl">
                        <svg width={totalSize + offset * 2} height={totalSize + offset * 2} className="overflow-visible">
                            <g transform={`translate(${offset}, ${offset})`}>
                                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} stroke="#e2e8f0" strokeWidth="1" />
                                        <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} stroke="#e2e8f0" strokeWidth="1" />
                                    </React.Fragment>
                                ))}
                                {(data?.lines || []).map((l, i) => (
                                    <line key={i} x1={l.x1 * cellSize} y1={l.y1 * cellSize} x2={l.x2 * cellSize} y2={l.y2 * cellSize} stroke={l.color || "#0f172a"} strokeWidth={cellSize > 30 ? "5" : "4"} strokeLinecap="round" fill="none" />
                                ))}
                                {(data?.dots || []).map((dot, i) => (
                                    <circle key={i} cx={dot.x * cellSize} cy={dot.y * cellSize} r={cellSize > 30 ? "6" : "4"} fill={dot.color || "#4f46e5"} />
                                ))}
                                {axis === 'vertical' ? (
                                    <line x1={(gridDim / 2) * cellSize} y1="-15" x2={(gridDim / 2) * cellSize} y2={totalSize + 15} stroke="#f43f5e" strokeWidth="5" strokeDasharray="10,5" />
                                ) : (
                                    <line x1="-15" y1={(gridDim / 2) * cellSize} x2={totalSize + 15} y2={(gridDim / 2) * cellSize} stroke="#f43f5e" strokeWidth="5" strokeDasharray="10,5" />
                                )}
                            </g>
                        </svg>
                    </div>
                </EditableElement>
            </div>
        </div>
    );
};
