
import React from 'react';
import { GridDrawingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement } from '../../Editable';

export const GridDrawingSheet = ({ data }: { data: GridDrawingData }) => {
    const settings = data?.settings;
    const gridDim = data?.gridDim || 6;
    const puzzleCount = settings?.puzzleCount || data?.drawings?.length || 1;
    const isStacked = settings?.layout === 'stacked' || gridDim >= 10;
    const gridType = settings?.gridType || 'dots';
    
    // Layout logic: Tüm görevler TEK SÜTUN alt alta (2, 3, 4 görevler için)
    const isGridMode = false; // Artık grid mod yok, hep tek sütun

    // A4 Baskı Alanı Optimizasyonu (Kullanılabilir Ortalama Alan: Yükseklik 840px, Genişlik 700px)
    const usableHeight = 840;
    const usableWidth = 700;

    let calcCell = 24;
    
    if (isStacked) {
        // Tek sütun alt alta puzzle (yüksek ızgaralar için)
        calcCell = Math.floor((usableHeight / (puzzleCount * 2)) / (gridDim + 1.2));
        const limitW = Math.floor(usableWidth / (gridDim + 2));
        calcCell = Math.min(calcCell, limitW);
    } else {
        // Yan yana (Referans // Uygulama) tek sütun alt alta
        calcCell = Math.floor((usableHeight / puzzleCount) / (gridDim + 1.5));
        const limitW = Math.floor((usableWidth / 2) / (gridDim + 2));
        calcCell = Math.min(calcCell, limitW);
    }

    // A4 tam sığdırma ve gereksiz boşlukları/küçülmeleri önleme sınırları
    const cellSize = Math.max(18, Math.min(36, calcCell));

    const totalSize = gridDim * cellSize;
    const showCoords = settings?.showCoordinates;
    const offset = showCoords ? 20 : 10;

    const renderGrid = (lines: [number, number][][] | null, label: string, isReference: boolean) => {
        const sanitizedId = `grid-${isReference}-${label.replace(/\s+/g, '-')}-${Math.random()}`;

        return (
            <div className="flex flex-col items-center group/grid shrink-0">
                <div className={`
                    mb-2 print:mb-1 px-3 print:px-1 py-1 rounded-lg border-[1.5px] font-black text-[8px] uppercase tracking-wider
                    ${isReference ? 'bg-zinc-900 text-white border-zinc-800 shadow-sm' : 'bg-white text-zinc-400 border-zinc-100 group-hover/grid:border-indigo-200 group-hover/grid:text-indigo-400'}
                `}>
                    {label}
                </div>
                <div className={`
                    relative p-2 print:p-1 bg-white border-[1.5px] rounded-[1.5rem] transition-all overflow-visible
                    ${isReference ? 'border-zinc-200 shadow-lg ring-4 ring-zinc-50' : 'border-zinc-100 border-dashed group-hover:border-indigo-100 group-hover:shadow-md'}
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
                                        <text x={i * cellSize + offset} y={offset - 8} textAnchor="middle" fontSize="7" fontWeight="900" className="fill-zinc-300 font-mono italic">{String.fromCharCode(65 + i)}</text>
                                        <text x={offset - 8} y={i * cellSize + offset} dominantBaseline="middle" textAnchor="end" fontSize="7" fontWeight="900" className="fill-zinc-300 font-mono italic">{i + 1}</text>
                                    </React.Fragment>
                                ))}
                            </g>
                        )}

                        <g transform={`translate(${offset}, ${offset})`}>
                            {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                const r = Math.floor(i / (gridDim + 1));
                                const c = i % (gridDim + 1);
                                if (gridType === 'dots') return <circle key={i} cx={c * cellSize} cy={r * cellSize} r="1" className={isReference ? "fill-zinc-400" : "fill-zinc-200"} />;
                                return null;
                            })}

                            {(lines || []).map((line, index) => {
                                if (!line || line.length < 2) return null;
                                return (
                                    <line
                                        key={index}
                                        x1={line[0][0] * cellSize} y1={line[0][1] * cellSize}
                                        x2={line[1][0] * cellSize} y2={line[1][1] * cellSize}
                                        stroke="#0f172a"
                                        strokeWidth="4"
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
        <div className="flex flex-col h-full bg-white font-['Lexend'] text-black overflow-visible professional-worksheet max-w-full">
            <PedagogicalHeader
                title={data?.title || "KARE KOPYALAMA & MOTOR PREZİSYON"}
                instruction={data?.instruction || "Sol taraftaki örnek çizimi sağ taraftaki boş ızgaraya aynı koordinatları kullanarak kopyalayın."}
            />

            <div className={`
                flex-1 grid gap-4 print:gap-2 p-6 print:p-2 items-center justify-center content-center
                grid-cols-1
            `}>
                {(data?.drawings || []).map((drawing, index) => (
                    <div
                        key={index}
                        className="
                            relative flex items-center justify-center p-3 print:p-1 border-[1.5px] border-zinc-100 rounded-[2rem] bg-zinc-50/20 break-inside-avoid w-full group overflow-hidden
                            flex-row gap-6 print:gap-2
                        "
                    >
                        {renderGrid(drawing.lines, `REFERANS`, true)}

                        <div className="flex flex-col items-center opacity-10 group-hover:opacity-30 transition-opacity">
                            <i className="fa-solid fa-chevron-right text-2xl text-zinc-400"></i>
                        </div>

                        {renderGrid(null, `UYGULAMA`, false)}
                    </div>
                ))}
            </div>

            {/* Premium Footer */}
            <div className="mt-auto p-5 print:p-2 bg-zinc-950 text-white rounded-t-[2.5rem] flex justify-between items-center shadow-2xl">
                <div className="flex gap-6 items-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <i className="fa-solid fa-bezier-curve text-indigo-400"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[6px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">PROGRAMMATİK ODAK</span>
                        <span className="text-[10px] font-black uppercase">Visuo-Motor Precision Engine v2</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col">
                        <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest">KOORDİNAT SİSTEMİ</span>
                        <span className="text-[9px] font-black opacity-60">MATRİS: {gridDim}x{gridDim}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10 mx-2"></div>
                    <i className="fa-solid fa-shield-halved text-zinc-700 text-lg"></i>
                </div>
            </div>
        </div>
    );
};




