
import React from 'react';
import { GridDrawingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement } from '../../Editable';

export const GridDrawingSheet = ({ data }: { data: GridDrawingData }) => {
    const settings = data?.settings;
    const gridDim = data?.gridDim || 6;
    const isStacked = settings?.layout === 'stacked' || gridDim >= 8;
    const gridType = settings?.gridType || 'squares';

    // Hücre boyutu hesaplama (Taşmayı önlemek için available width daraltıldı)
    const availableWidth = 520;
    const cellSize = isStacked
        ? Math.min(38, Math.floor(availableWidth / (gridDim + 1)))
        : Math.min(26, Math.floor(availableWidth / (gridDim * 2 + 2)));

    const totalSize = gridDim * cellSize;
    const showCoords = settings?.showCoordinates;
    const offset = showCoords ? 20 : 10;

    const renderGrid = (lines: [number, number][][] | null, label: string, isReference: boolean) => {
        const sanitizedId = `grid-${isReference}-${label.replace(/\s+/g, '-')}`;

        return (
            <div className="flex flex-col items-center group/grid shrink-0">
                <div className={`
                    mb-4 print:mb-1 px-4 print:px-1 py-1.5 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest shadow-md transition-all
                    ${isReference ? 'bg-zinc-900 text-white border-white scale-105' : 'bg-white text-zinc-400 border-zinc-100 group-hover/grid:border-indigo-200 group-hover/grid:text-indigo-400'}
                `}>
                    {label}
                </div>
                <div className={`
                    relative p-3 bg-white border-2 rounded-[2.5rem] transition-all overflow-visible
                    ${isReference ? 'border-zinc-200 shadow-xl ring-8 ring-zinc-50' : 'border-zinc-100 border-dashed shadow-sm group-hover:border-indigo-200 group-hover:shadow-lg'}
                `}>
                    <svg width={totalSize + offset * 2} height={totalSize + offset * 2} className="overflow-visible max-w-full h-auto">
                        <defs>
                            <pattern id={sanitizedId} width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                                {gridType === 'squares' && (
                                    <rect width={cellSize} height={cellSize} fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
                                )}
                            </pattern>
                        </defs>
                        <rect x={offset} y={offset} width={totalSize} height={totalSize} fill={`url(#${sanitizedId})`} />

                        {showCoords && (
                            <g>
                                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <text x={i * cellSize + offset} y={offset - 12} textAnchor="middle" fontSize="9" fontWeight="900" className="fill-zinc-400 font-mono tracking-tighter">{String.fromCharCode(65 + i)}</text>
                                        <text x={offset - 12} y={i * cellSize + offset} dominantBaseline="middle" textAnchor="end" fontSize="9" fontWeight="900" className="fill-zinc-400 font-mono tracking-tighter">{i + 1}</text>
                                    </React.Fragment>
                                ))}
                            </g>
                        )}

                        <g transform={`translate(${offset}, ${offset})`}>
                            {/* Precision Points */}
                            {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                const r = Math.floor(i / (gridDim + 1));
                                const c = i % (gridDim + 1);
                                if (gridType === 'dots') return <circle key={i} cx={c * cellSize} cy={r * cellSize} r="1.5" className={isReference ? "fill-zinc-400" : "fill-zinc-200"} />;
                                if (gridType === 'crosses') return (
                                    <g key={i}>
                                        <line x1={c * cellSize - 3} y1={r * cellSize} x2={c * cellSize + 3} y2={r * cellSize} stroke="#e2e8f0" strokeWidth="1" />
                                        <line x1={c * cellSize} y1={r * cellSize - 3} x2={c * cellSize} y2={r * cellSize + 3} stroke="#e2e8f0" strokeWidth="1" />
                                    </g>
                                );
                                return null;
                            })}

                            {/* Reference Lines - High Performance */}
                            {(lines || []).map((line, index) => {
                                if (!line || line.length < 2) return null;
                                return (
                                    <line
                                        key={index}
                                        x1={line[0][0] * cellSize} y1={line[0][1] * cellSize}
                                        x2={line[1][0] * cellSize} y2={line[1][1] * cellSize}
                                        stroke="#0f172a"
                                        strokeWidth={cellSize > 30 ? "6" : "4.5"}
                                        strokeLinecap="round"
                                        className="print:drop-shadow-none drop-shadow-sm"
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
        <div className="flex flex-col h-full  bg-white font-sans text-black overflow-visible professional-worksheet max-w-full">
            <PedagogicalHeader
                title={data?.title || "KARE KOPYALAMA & MOTOR PLANLAMA"}
                instruction={data?.instruction || "Sol taraftaki örnek çizimi sağ taraftaki boş ızgaraya aynı koordinatları kullanarak kopyalayın."}
                note={data?.pedagogicalNote}
            />

            <div className={`flex-1 flex flex-col gap-12 print:gap-3 print:gap-4 print:gap-1 py-8 print:py-2 items-center overflow-x-hidden`}>
                {(data?.drawings || []).map((drawing, index) => (
                    <div
                        key={index}
                        className={`
                            relative flex items-center justify-center p-4 print:p-1 sm:p-8 print:p-2 print:p-3 border-2 border-zinc-100 rounded-[2.5rem] bg-zinc-50/30 break-inside-avoid w-full max-w-full group overflow-hidden
                            ${isStacked ? 'flex-col gap-8 print:gap-2 print:gap-3 print:p-3' : 'flex-row gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1'}
                        `}
                    >
                        {renderGrid(drawing.lines, `REFERANS MODEL`, true)}

                        {!isStacked && (
                            <div className="flex flex-col items-center opacity-20 group-hover:opacity-40 transition-opacity shrink-0">
                                <i className="fa-solid fa-arrow-right-long text-4xl text-zinc-300"></i>
                                <span className="text-[7px] font-black uppercase tracking-widest mt-2">KOPYALA</span>
                            </div>
                        )}

                        {renderGrid(null, `UYGULAMA ALANI`, false)}

                        {/* Klinik Metrikler */}
                        {settings?.showClinicalNotes && drawing.clinicalMeta && (
                            <div className="absolute top-6 right-10 text-right opacity-40 group-hover:opacity-100 transition-opacity hidden sm:block">
                                <span className="text-[7px] font-black uppercase text-indigo-400 block tracking-widest">Görsel-Motor Entegrasyon</span>
                                <div className="flex gap-4 print:gap-1 mt-1 justify-end">
                                    <span className="text-[8px] font-bold text-zinc-500">Kesişim: {drawing.clinicalMeta.crossingPoints}</span>
                                    <span className="text-[8px] font-bold text-zinc-500">Uzamsal: {Math.round((drawing.lines?.length || 0) * 0.8)} Unit</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Premium Footer Protokolü */}
            <div className="mt-auto p-6 print:p-2 bg-zinc-900 text-white rounded-t-[3rem] border-x-4 border-t-4 border-white flex justify-between items-center shadow-2xl mx-1">
                <div className="flex gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">PROTOKOL</span>
                        <span className="text-xs font-black uppercase">Visuo-Motor Precision Engine</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 opacity-60 text-right">
                    <span className="text-[8px] font-bold tracking-[0.2em]">KOORDİNAT SİSTEMİ v5.0</span>
                    <i className="fa-solid fa-pen-nib text-indigo-400 text-xs shadow-glow"></i>
                </div>
            </div>
        </div>
    );
};




