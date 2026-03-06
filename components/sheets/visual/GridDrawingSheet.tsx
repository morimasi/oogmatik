
import React from 'react';
import { GridDrawingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement } from '../../Editable';

export const GridDrawingSheet = ({ data }: { data: GridDrawingData }) => {
    const settings = data?.settings;
    const gridDim = data?.gridDim || 6;
    const isStacked = settings?.layout === 'stacked' || gridDim > 8;
    const gridType = settings?.gridType || 'squares';

    // Hücre boyutu hesaplama (A4 yan boşluklar 15mm, toplam 210mm)
    const availableWidth = 180 * 3.78; // mm to px approx
    const cellSize = isStacked
        ? Math.min(45, Math.floor(availableWidth / (gridDim + 2)))
        : Math.min(38, Math.floor(availableWidth / (gridDim * 2 + 3)));

    const totalSize = gridDim * cellSize;
    const showCoords = settings?.showCoordinates;
    const offset = showCoords ? 20 : 5;

    const renderGrid = (lines: [number, number][][] | null, label: string, isReference: boolean) => {
        const sanitizedId = `grid-${isReference}-${label.replace(/\s+/g, '-')}`;

        return (
            <div className="flex flex-col items-center">
                <div className={`
                    mb-2 px-3 py-1 rounded-lg border font-black text-[8px] uppercase tracking-tighter
                    ${isReference ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-400 border-zinc-200'}
                `}>
                    {label}
                </div>
                <div className="relative p-1.5 bg-white border-2 border-zinc-900 rounded-xl shadow-sm overflow-visible">
                    <svg width={totalSize + offset + 10} height={totalSize + offset + 10} className="overflow-visible">
                        <defs>
                            <pattern id={sanitizedId} width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                                {gridType === 'squares' && (
                                    <rect width={cellSize} height={cellSize} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                                )}
                            </pattern>
                        </defs>
                        <rect x={offset} y={offset} width={totalSize} height={totalSize} fill={`url(#${sanitizedId})`} />

                        {showCoords && (
                            <g>
                                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <text x={i * cellSize + offset} y={offset - 8} textAnchor="middle" fontSize="8" fontWeight="900" className="fill-zinc-400 font-mono">{String.fromCharCode(65 + i)}</text>
                                        <text x={offset - 8} y={i * cellSize + offset} dominantBaseline="middle" textAnchor="end" fontSize="8" fontWeight="900" className="fill-zinc-400 font-mono">{i + 1}</text>
                                    </React.Fragment>
                                ))}
                            </g>
                        )}

                        <g transform={`translate(${offset}, ${offset})`}>
                            {/* Izgara Noktaları/Artıları */}
                            {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                const r = Math.floor(i / (gridDim + 1));
                                const c = i % (gridDim + 1);
                                if (gridType === 'dots') {
                                    return <circle key={i} cx={c * cellSize} cy={r * cellSize} r="1.5" className={isReference ? "fill-zinc-400" : "fill-zinc-200"} />
                                }
                                if (gridType === 'crosses') {
                                    return (
                                        <g key={i}>
                                            <line x1={c * cellSize - 2} y1={r * cellSize} x2={c * cellSize + 2} y2={r * cellSize} stroke="#e2e8f0" strokeWidth="1" />
                                            <line x1={c * cellSize} y1={r * cellSize - 2} x2={c * cellSize} y2={r * cellSize + 2} stroke="#e2e8f0" strokeWidth="1" />
                                        </g>
                                    )
                                }
                                return null;
                            })}

                            {/* Çizgiler */}
                            {(lines || []).map((line, index) => {
                                if (!line || line.length < 2) return null;
                                return (
                                    <line
                                        key={index}
                                        x1={line[0][0] * cellSize} y1={line[0][1] * cellSize}
                                        x2={line[1][0] * cellSize} y2={line[1][1] * cellSize}
                                        stroke="#000"
                                        strokeWidth={cellSize > 30 ? "4" : "2.5"}
                                        strokeLinecap="round"
                                        fill="none"
                                    />
                                );
                            })}
                        </g>
                    </svg>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader title={data?.title || "KARE KOPYALAMA"} instruction={data?.instruction} note={data?.pedagogicalNote} />
            <div className={`flex-1 flex flex-col gap-6 py-4 items-center`}>
                {(data?.drawings || []).map((drawing, index) => (
                    <EditableElement
                        key={index}
                        className={`
                            flex items-center justify-center p-6 border-2 border-zinc-100 rounded-[2rem] bg-white break-inside-avoid w-full
                            ${isStacked ? 'flex-col gap-8' : 'flex-row gap-12'}
                        `}
                    >
                        {renderGrid(drawing.lines, `ÖRNEK`, true)}
                        {renderGrid(null, `ÇİZİM`, false)}

                        {settings?.showClinicalNotes && drawing.clinicalMeta && (
                            <div className="absolute bottom-2 right-4 text-[6px] font-bold text-zinc-300 uppercase tracking-widest">
                                Kesişim: {drawing.clinicalMeta.crossingPoints} | Simetrik: {drawing.clinicalMeta.isSymmetric ? 'EVET' : 'HAYIR'}
                            </div>
                        )}
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};
