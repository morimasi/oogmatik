
import React from 'react';
import { 
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, CoordinateCipherData, WordConnectData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeCountingData, ShapeType,
    GeneratorOptions,
    VisualOddOneOutItem
} from '../../types';
import { ShapeDisplay, SegmentDisplay, GridComponent, ImageDisplay, PedagogicalHeader, Matchstick, ConnectionDot, Shape, CubeStack } from './common';
import { CONNECT_COLORS } from '../../services/offlineGenerators/helpers';
import { EditableElement, EditableText } from '../Editable';

const ComplexShapeRenderer = ({ item, size = 80 }: { item: VisualOddOneOutItem, size?: number }) => {
    if (!item) return null;
    
    return (
        <div 
            className="transition-all duration-300 flex items-center justify-center"
            style={{ 
                transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1}) ${item.isMirrored ? 'scaleX(-1)' : ''}`,
                width: size,
                height: size
            }}
        >
            {item.label ? (
                <span className="text-5xl font-black text-zinc-900 select-none font-mono">
                    {item.label}
                </span>
            ) : item.svgPaths ? (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {item.svgPaths.map((p, i) => (
                        <path 
                            key={i} 
                            d={p.d} 
                            fill={p.fill || "none"} 
                            stroke={p.stroke || "#0f172a"} 
                            strokeWidth={p.strokeWidth || 3} 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                    ))}
                </svg>
            ) : item.segments ? (
                <SegmentDisplay segments={item.segments} />
            ) : (
                <div className="w-10 h-10 border-4 border-zinc-200 rounded-full animate-pulse"></div>
            )}
        </div>
    );
};

export const VisualOddOneOutSheet: React.FC<{ data: VisualOddOneOutData }> = ({ data }) => {
    const isExtreme = data.distractionLevel === 'extreme';
    const itemsPerRow = data.rows?.[0]?.items?.length || 4;
    
    const containerClass = itemsPerRow > 12 ? 'gap-1' : (itemsPerRow > 6 ? 'gap-3' : 'gap-6');
    const itemBoxSize = itemsPerRow > 15 ? 'w-8 h-8' : (itemsPerRow > 10 ? 'w-12 h-12' : 'w-24 h-24');
    const rendererSize = itemsPerRow > 15 ? 24 : (itemsPerRow > 10 ? 40 : 80);

    return (
        <div className="flex flex-col h-full bg-white p-2 font-sans text-black overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex-1 space-y-4 mt-2 content-start">
                {(data.rows || []).map((row, i) => (
                    <EditableElement 
                        key={i} 
                        className={`flex flex-col p-4 border-[2px] border-zinc-900 rounded-[2.5rem] bg-white relative overflow-visible transition-all hover:bg-zinc-50 hover:border-indigo-600 group break-inside-avoid shadow-sm`}
                    >
                        <div className="absolute -top-3 -left-3 bg-zinc-900 text-white w-8 h-8 flex items-center justify-center font-black text-xs rounded-xl shadow-lg border-2 border-white z-10">
                            {i + 1}
                        </div>

                        <div className={`flex flex-wrap items-center justify-around py-2 px-2 ${containerClass}`}>
                            {(row.items || []).map((item, j) => (
                                <div key={j} className="flex flex-col items-center gap-2 group/item">
                                    <div className={`
                                        ${itemBoxSize} bg-white rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center shadow-xs transition-all duration-500
                                        group-hover/item:border-indigo-500 group-hover/item:scale-110
                                    `}>
                                        <ComplexShapeRenderer item={item} size={rendererSize} />
                                    </div>
                                    <div className="w-5 h-5 rounded-lg border-2 border-zinc-200 cursor-pointer hover:border-indigo-600 transition-colors bg-white shadow-inner flex items-center justify-center">
                                        <div className="w-1 h-1 rounded-full bg-transparent group-hover/item:bg-indigo-600"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {isExtreme && (
                            <div className="absolute top-2 right-4">
                                <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Klinik Zorluk</span>
                            </div>
                        )}
                    </EditableElement>
                ))}
            </div>

            <div className="mt-auto pt-4 flex justify-between items-end border-t border-zinc-100 px-6">
                 <div className="flex gap-12">
                     <div className="flex flex-col">
                        <span className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kategori</span>
                        <span className="text-[9px] font-bold text-zinc-800 uppercase">Görsel Ayrıştırma</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kapasite</span>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase">Max {itemsPerRow} Öğre/Satır</span>
                     </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-[7px] text-zinc-300 font-bold uppercase tracking-[0.5em] mb-1">Bursa Disleksi AI • Uzman Serisi</p>
                    <div className="flex gap-3">
                         <i className="fa-solid fa-eye text-zinc-100"></i>
                         <i className="fa-solid fa-brain text-zinc-100"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const FindTheDifferenceSheet: React.FC<{ data: FindTheDifferenceData }> = ({ data }) => {
    const rows = data?.rows || [];
    const isSingleColumn = rows.length <= 6;

    return (
        <div className="flex flex-col h-full bg-white p-2">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
            
            <div className={`grid ${isSingleColumn ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mt-2 flex-1 content-start`}>
                {rows.map((row, index) => {
                    const items = row?.items || [];
                    const isHard = row?.visualDistractionLevel === 'high' || row?.visualDistractionLevel === 'extreme';
                    
                    return (
                        <EditableElement 
                            key={index} 
                            className={`flex flex-col p-6 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm hover:shadow-md transition-all break-inside-avoid relative group`}
                        >
                            <div className="absolute -top-3 -left-2 w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg text-sm border-4 border-white">
                                {index + 1}
                            </div>

                            <div className="flex-1 flex items-center justify-around w-full gap-4 py-2">
                                {items.map((item, itemIndex) => (
                                    <div 
                                        key={itemIndex} 
                                        className={`
                                            flex-1 aspect-square max-h-24 flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-colors relative group/item
                                            ${isHard ? 'bg-zinc-50' : 'bg-white'}
                                        `}
                                    >
                                        <span className={`
                                            font-black leading-none select-none text-zinc-900
                                            ${item.length > 5 ? 'text-lg' : item.length > 3 ? 'text-2xl' : 'text-4xl'}
                                            ${isHard ? 'tracking-tighter' : 'tracking-normal'}
                                            font-mono
                                        `}>
                                            <EditableText value={item} tag="span" />
                                        </span>
                                        <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full border-2 border-zinc-200 bg-white group-hover/item:border-indigo-500 transition-colors shadow-sm"></div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-1 flex-1 bg-zinc-100 rounded-full overflow-hidden">
                                    <div className={`h-full w-1/4 ${isHard ? 'bg-amber-400' : 'bg-indigo-400'} opacity-20`}></div>
                                </div>
                                <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">{isHard ? 'Yüksek Odak' : 'Standart'}</span>
                            </div>
                        </EditableElement>
                    );
                })}
            </div>
            <div className="mt-auto pt-6 flex justify-between items-center px-6 border-t border-zinc-100">
                <div className="flex gap-8">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Kategori</span>
                        <span className="text-[10px] font-bold text-zinc-800 uppercase">Görsel Ayrıştırma</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Batarya</span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">Dikkati Sürdürme</span>
                     </div>
                </div>
                <div className="text-right">
                    <p className="text-[8px] text-zinc-300 font-bold uppercase tracking-[0.3em]">Bursa Disleksi AI • Uzman Serisi</p>
                </div>
            </div>
        </div>
    );
};

export const GridDrawingSheet: React.FC<{ data: GridDrawingData }> = ({ data }) => {
    const gridDim = data?.gridDim || 6;
    const drawingsCount = data?.drawings?.length || 1;
    
    // Proportional Scaling Logic:
    // We want cell size to be fixed where possible so box grows with gridDim.
    // However, we must not exceed A4 bounds.
    // Safe drawing area width on A4 is ~750px. 
    const maxSafeWidth = 750;
    
    // If gridDim is small (e.g. 5x5), we can afford large cells (50px).
    // If gridDim is large (e.g. 12x12), we must shrink to fit side-by-side or stack.
    const isStackView = gridDim > 7; // More than 7x7 needs stack to keep cells large
    
    // Calculate cell size so it doesn't squish. 
    // Target cell size is 45px for drawing comfort.
    const targetCellSize = gridDim > 10 ? 30 : 45;
    const cellSize = isStackView 
        ? Math.min(targetCellSize, Math.floor(650 / gridDim)) // Stack view allows wider grids
        : Math.min(targetCellSize, Math.floor((maxSafeWidth - 100) / (gridDim * 2))); // Side-by-side needs sharing width

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
                                return (
                                    <circle 
                                        key={i} 
                                        cx={c * cellSize} cy={r * cellSize} 
                                        r={cellSize > 30 ? "2.5" : "1.8"} 
                                        className={`${isReference ? "fill-zinc-800" : "fill-zinc-200"}`} 
                                    />
                                );
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
                                        {index === 0 && (
                                            <circle cx={line[0][0] * cellSize} cy={line[0][1] * cellSize} r="3.5" fill="#10b981" stroke="white" strokeWidth="1.5" />
                                        )}
                                        {index === lines.length - 1 && (
                                            <circle cx={line[1][0] * cellSize} cy={line[1][1] * cellSize} r="3.5" fill="#f43f5e" stroke="white" strokeWidth="1.5" />
                                        )}
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
                    <EditableElement key={index} className={`flex ${isStackView ? 'flex-col gap-12' : 'flex-row gap-[75px]'} items-center justify-center p-8 bg-zinc-50/20 rounded-[3rem] border border-zinc-100 break-inside-avoid relative overflow-hidden group w-full transition-all`}>
                        {renderGrid(drawing.lines, `ÖRNEK`, true)}
                        {isStackView && <div className="w-full h-px border-b-2 border-dashed border-zinc-200"></div>}
                        {renderGrid(null, `ÇİZİM ALANI`, false)}
                    </EditableElement>
                ))}
            </div>

            <div className="mt-auto pt-6 flex justify-between items-center px-10 border-t border-zinc-100">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Metodoloji</span>
                    <span className="text-[11px] font-bold text-zinc-800">Görsel-Motor Entegrasyon (CRA)</span>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    </div>
                    <span className="text-[7px] font-black text-zinc-300 uppercase tracking-widest">Başlangıç ve Bitiş</span>
                </div>
                <p className="text-[8px] text-zinc-300 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • {gridDim}x{gridDim} Matris</p>
            </div>
        </div>
    );
};

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
                    <div className="absolute -top-5 -left-5 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg transform -rotate-3 z-20">
                        {axis === 'vertical' ? 'DİKEY SİMETRİ' : 'YATAY SİMETRİ'}
                    </div>

                    <div className="bg-white p-4 border-[6px] border-zinc-900 shadow-2xl relative overflow-visible rounded-xl">
                        <svg width={totalSize + offset * 2} height={totalSize + offset * 2} className="overflow-visible">
                            <g transform={`translate(${offset}, ${offset})`}>
                                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} stroke="#e2e8f0" strokeWidth="1" />
                                        <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} stroke="#e2e8f0" strokeWidth="1" />
                                        
                                        {showCoords && (
                                            <>
                                                <text x={i * cellSize} y="-12" textAnchor="middle" fontSize="11" fontWeight="black" className="fill-zinc-400 font-mono">
                                                    {String.fromCharCode(65 + i)}
                                                </text>
                                                <text x="-12" y={i * cellSize} dominantBaseline="middle" textAnchor="end" fontSize="11" fontWeight="black" className="fill-zinc-400 font-mono">
                                                    {i + 1}
                                                </text>
                                            </>
                                        )}
                                    </React.Fragment>
                                ))}

                                {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                    const r = Math.floor(i / (gridDim + 1));
                                    const c = i % (gridDim + 1);
                                    return <circle key={i} cx={c * cellSize} cy={r * cellSize} r={cellSize > 30 ? "2" : "1.2"} className="fill-zinc-300" />
                                })}

                                {(data?.lines || []).map((l, i) => (
                                    <line 
                                        key={i} 
                                        x1={l.x1 * cellSize} y1={l.y1 * cellSize} 
                                        x2={l.x2 * cellSize} y2={l.y2 * cellSize} 
                                        stroke={l.color || "#0f172a"} 
                                        strokeWidth={cellSize > 30 ? "5" : "4"} 
                                        strokeLinecap="round"
                                        fill="none"
                                        className="drop-shadow-sm"
                                    />
                                ))}

                                {(data?.dots || []).map((dot, i) => (
                                    <circle key={i} cx={dot.x * cellSize} cy={dot.y * cellSize} r={cellSize > 30 ? "6" : "4"} fill={dot.color || "#4f46e5"} className="shadow-sm" />
                                ))}

                                {axis === 'vertical' ? (
                                    <line x1={(gridDim / 2) * cellSize} y1="-15" x2={(gridDim / 2) * cellSize} y2={totalSize + 15} stroke="#f43f5e" strokeWidth="5" strokeDasharray="10,5" className="drop-shadow-md" />
                                ) : (
                                    <line x1="-15" y1={(gridDim / 2) * cellSize} x2={totalSize + 15} y2={(gridDim / 2) * cellSize} stroke="#f43f5e" strokeWidth="5" strokeDasharray="10,5" className="drop-shadow-md" />
                                )}
                            </g>
                        </svg>

                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-zinc-900 -translate-x-2 -translate-y-2"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-zinc-900 translate-x-2 translate-y-2"></div>
                    </div>

                    <div className="mt-8 flex justify-center gap-12 opacity-50">
                        <div className="flex flex-col items-center">
                            <i className="fa-solid fa-compass-drafting text-2xl text-zinc-400 mb-1"></i>
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Denge</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <i className="fa-solid fa-eye text-2xl text-zinc-400 mb-1"></i>
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Odak</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <i className="fa-solid fa-brain text-2xl text-zinc-400 mb-1"></i>
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Biliş</span>
                        </div>
                    </div>
                </EditableElement>

                <div className="mt-10 grid grid-cols-2 gap-10 w-full max-w-3xl border-t border-zinc-100 pt-8">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b pb-1">Hata Analizi</h4>
                        <div className="space-y-2">
                             <div className="flex items-center gap-3"><div className="w-4 h-4 rounded border-2 border-zinc-200"></div><span className="text-xs text-zinc-500">Yön Karıştırma (Ayna Hatası)</span></div>
                             <div className="flex items-center gap-3"><div className="w-4 h-4 rounded border-2 border-zinc-200"></div><span className="text-xs text-zinc-500">Koordinat Kaydırma</span></div>
                        </div>
                    </div>
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                         <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Uzman Gözlemi</h4>
                         <div className="h-20 border-b border-zinc-200 border-dashed"></div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 flex justify-between items-end border-t border-zinc-100 px-6">
                <p className="text-[7px] text-zinc-300 font-bold uppercase tracking-[0.4em]">Bursa Disleksi AI • Uzamsal-Motor Entegrasyon Laboratuvarı</p>
                <div className="flex gap-2">
                     <div className="w-6 h-1.5 bg-indigo-500 rounded-full"></div>
                     <div className="w-6 h-1.5 bg-zinc-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export const ShapeMatchingSheet = ({ data }: { data: ShapeMatchingData }) => (
    <div className="flex flex-col h-full bg-white p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex-1 flex items-center justify-around gap-12 mt-4">
            <div className="flex flex-col gap-6">
                {data.leftColumn.map((item) => (
                    <div key={item.id} className="w-24 h-24 border-2 border-zinc-200 rounded-xl flex items-center justify-center bg-zinc-50 relative">
                        <ShapeDisplay shapes={item.shapes || []} />
                        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-sm"></div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-6">
                {data.rightColumn.map((item) => (
                    <div key={item.id} className="w-24 h-24 border-2 border-zinc-200 rounded-xl flex items-center justify-center bg-zinc-50 relative">
                        <ShapeDisplay shapes={item.shapes || []} />
                        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-sm"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const FindIdenticalWordSheet = ({ data }: { data: FindIdenticalWordData }) => (
    <div className="flex flex-col h-full bg-white p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex-1 space-y-4 mt-6">
            {data.groups.map((group, i) => (
                <div key={i} className="flex items-center gap-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                    <div className="w-24 text-lg font-black text-indigo-600">{group.words[0]}</div>
                    <div className="flex-1 flex justify-around gap-4">
                        {[...group.distractors, group.words[1]].sort().map((word, j) => (
                            <div key={j} className="px-4 py-1.5 bg-white border-2 border-zinc-100 rounded-xl font-bold hover:border-indigo-400 cursor-pointer transition-all">{word}</div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const FindDifferentStringSheet = ({ data }: { data: FindDifferentStringData }) => (
    <div className="flex flex-col h-full bg-white p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex-1 space-y-4 mt-6">
            {data.rows.map((row, i) => (
                <div key={i} className="flex items-center justify-around p-4 bg-zinc-50 rounded-2xl border border-zinc-200 gap-4">
                    {row.items.map((item, j) => (
                        <div key={j} className="flex-1 text-center font-mono font-black text-xl tracking-widest bg-white py-3 rounded-xl border-2 border-zinc-100 hover:border-indigo-400 cursor-pointer">{item}</div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);
