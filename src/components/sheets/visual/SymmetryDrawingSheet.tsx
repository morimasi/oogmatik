
import React from 'react';
import { SymmetryDrawingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const SymmetryDrawingSheet = ({ data }: { data: SymmetryDrawingData }) => {
    const settings = data?.settings;
    const gridDim = data?.gridDim || 10;
    const layout = settings?.layout || 'single';

    // A4 Alan hesaplaması - Daha kompakt
    const availableWidth = 190 * 3.78; 
    
    let cellSize = 45;
    if (layout === 'grid_2x1') cellSize = Math.min(32, Math.floor(availableWidth / (gridDim * 2.5)));
    else if (layout === 'grid_2x2') cellSize = Math.min(26, Math.floor(availableWidth / (gridDim * 2.5)));
    else cellSize = Math.min(42, Math.floor(availableWidth / (gridDim * 1.5)));

    const totalSize = gridDim * cellSize;
    const showCoords = settings?.showCoordinates;
    const offset = showCoords ? 20 : 10;

    const renderSVG = (lines: any[], dots: any[], title: string, drawAxis?: string, clinicalMeta?: any) => {
        const currentAxis = drawAxis || settings?.axis || 'vertical';
        return (
            <div className="flex flex-col items-center group">
                <div className="mb-2 print:mb-0.5 px-3 print:px-1 py-1 bg-zinc-900 text-white rounded border-2 border-white font-black text-[7px] uppercase tracking-widest shadow shadow-indigo-100">
                    {title}
                </div>
                <div className="relative p-2 bg-white border border-zinc-200 rounded-3xl shadow-lg ring-4 ring-zinc-50 transition-all">
                    <svg width={totalSize + offset * 2} height={totalSize + offset * 2} className="overflow-visible">
                        <g transform={`translate(${offset}, ${offset})`}>
                            {/* Kare Izgara */}
                            {settings?.gridType === 'squares' && Array.from({ length: gridDim + 1 }).map((_, i) => (
                                <React.Fragment key={i}>
                                    <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} stroke="#f1f5f9" strokeWidth="0.5" />
                                    <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} stroke="#f1f5f9" strokeWidth="0.5" />
                                </React.Fragment>
                            ))}

                            {/* Nokta Izgara */}
                            {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                const r = Math.floor(i / (gridDim + 1));
                                const c = i % (gridDim + 1);
                                return <circle key={i} cx={c * cellSize} cy={r * cellSize} r={layout === 'grid_2x2' ? "0.8" : "1.2"} className="fill-zinc-300" />;
                            })}

                            {/* Orijinal Çizim */}
                            {(lines || []).map((l, i) => (
                                <line key={i} x1={l.x1 * cellSize} y1={l.y1 * cellSize} x2={l.x2 * cellSize} y2={l.y2 * cellSize} stroke="#0f172a" strokeWidth={layout === 'grid_2x2' ? "3" : "4.5"} strokeLinecap="round" />
                            ))}

                            {/* Simetri Ekseni */}
                            {currentAxis === 'vertical' && (
                                <line x1={(gridDim / 2) * cellSize} y1="-10" x2={(gridDim / 2) * cellSize} y2={totalSize + 10} stroke="#f43f5e" strokeWidth="3" strokeDasharray="6,3" />
                            )}
                            {currentAxis === 'horizontal' && (
                                <line x1="-10" y1={(gridDim / 2) * cellSize} x2={totalSize + 10} y2={(gridDim / 2) * cellSize} stroke="#f43f5e" strokeWidth="3" strokeDasharray="6,3" />
                            )}
                            {currentAxis === 'diagonal' && (
                                <line x1="-10" y1="-10" x2={totalSize + 10} y2={totalSize + 10} stroke="#f43f5e" strokeWidth="3" strokeDasharray="6,3" />
                            )}
                        </g>
                    </svg>
                </div>
            </div>
        );
    };

    const containerGridCols = layout === 'grid_2x2' ? 'grid-cols-2' : (layout === 'grid_2x1' ? 'grid-cols-2' : 'grid-cols-1');

    return (
        <div className="flex flex-col h-full bg-white font-['Lexend'] text-black overflow-hidden professional-worksheet p-6 print:p-2">
            <PedagogicalHeader
                title={data?.title || "SİMETRİ & MEKANSAL BÜTÜNLEME"}
                instruction={data?.instruction || "Şeklin simetriğini diğer tarafa çizin."}
                note={data?.pedagogicalNote}
                data={data}
            />

            <div className={`grid ${containerGridCols} gap-4 print:gap-1 mt-6 print:mt-1 flex-1 content-center items-center justify-items-center`}>
                {(data?.drawings || []).map((draw: any, i: number) => (
                    <EditableElement key={i} className="break-inside-avoid">
                        {renderSVG(draw.lines, draw.dots, draw.title, draw.axis, draw.clinicalMeta)}
                    </EditableElement>
                ))}
            </div>

            {/* Compact Footer */}
            <div className={`mt-auto p-4 print:p-1.5 bg-zinc-900 text-white rounded-2xl flex justify-between items-center shadow-xl mb-1 ${layout === 'grid_2x2' ? 'print:scale-90' : ''}`}>
                <div className="flex flex-col">
                    <span className="text-[6px] font-black text-indigo-400 uppercase tracking-widest">SİMETRİ ARŞİVİ</span>
                    <span className="text-[10px] font-black uppercase tracking-tight">{gridDim}x{gridDim} MATRİS • {settings?.puzzleCount || 1} GÖREV</span>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                    <i className="fa-solid fa-shapes text-rose-400 text-[10px]"></i>
                </div>
            </div>
        </div>
    );
};




