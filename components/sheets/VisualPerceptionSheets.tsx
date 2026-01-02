
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
                            fill={p.fill || "transparent"} 
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
    const isExpert = data.difficultyLevel === 'Uzman' || data.distractionLevel === 'extreme';
    
    return (
        <div className="flex flex-col h-full bg-white p-2 font-sans text-black">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex-1 space-y-8 mt-4 content-start">
                {(data.rows || []).map((row, i) => (
                    <EditableElement 
                        key={i} 
                        className={`flex flex-col p-6 border-2 border-zinc-100 rounded-[3rem] bg-zinc-50/50 relative overflow-hidden transition-all hover:bg-white hover:border-indigo-100 hover:shadow-xl group break-inside-avoid shadow-sm`}
                    >
                        <div className="absolute top-0 left-0 bg-zinc-900 text-white w-10 h-10 flex items-center justify-center font-black text-sm rounded-br-3xl shadow-lg transition-transform group-hover:scale-110">
                            {i + 1}
                        </div>

                        <div className="flex-1 flex items-center justify-around gap-4 py-4 px-6 mt-2">
                            {(row.items || []).map((item, j) => (
                                <div key={j} className="flex flex-col items-center gap-4 group/item">
                                    <div className={`
                                        w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2rem] border-2 border-dashed border-zinc-200 flex items-center justify-center shadow-sm transition-all duration-500
                                        group-hover/item:border-indigo-500 group-hover/item:rotate-3 group-hover/item:scale-105
                                        ${isExpert ? 'p-2' : 'p-4'}
                                    `}>
                                        <ComplexShapeRenderer item={item} size={isExpert ? 100 : 80} />
                                    </div>
                                    <div className="w-8 h-8 rounded-2xl border-4 border-zinc-200 cursor-pointer hover:border-indigo-600 transition-colors bg-white shadow-inner flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-transparent group-hover/item:bg-indigo-100"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {isExpert && (
                            <div className="mt-2 flex justify-end">
                                <div className="text-[8px] font-black text-zinc-300 uppercase tracking-widest border border-zinc-200 px-3 py-1 rounded-full flex items-center gap-2">
                                    <i className="fa-solid fa-microscope"></i> Dikkatli Gözlem Gerekli
                                </div>
                            </div>
                        )}
                    </EditableElement>
                ))}
            </div>

            <div className="mt-auto pt-8 flex justify-between items-end border-t border-zinc-100 px-6">
                 <div className="flex gap-12">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kategori</span>
                        <span className="text-[10px] font-bold text-zinc-800 uppercase">Görsel Ayrıştırma</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Batarya</span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">Şekil-Zemin Algısı</span>
                     </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.5em] mb-1">Bursa Disleksi AI • Görsel Muhakeme Serisi</p>
                    <div className="flex gap-2">
                         <i className="fa-solid fa-eye text-zinc-200"></i>
                         <i className="fa-solid fa-brain text-zinc-200"></i>
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
    const cellSize = Math.min(35, Math.floor(320 / gridDim));
    const totalSize = gridDim * cellSize;
    const showCoords = data?.showCoordinates;

    const renderGrid = (lines: [number, number][][] | null, label: string, isTarget: boolean) => {
        const offset = showCoords ? 20 : 0;
        return (
            <div className="flex flex-col items-center group/grid">
                <div className={`mb-3 px-4 py-1.5 rounded-2xl border-2 font-black text-[9px] uppercase tracking-[0.1em] transition-all shadow-sm ${isTarget ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200 group-hover/grid:border-indigo-400 group-hover/grid:text-indigo-600'}`}>
                    {label}
                </div>
                <div className="relative p-1.5 bg-white border-[4px] border-zinc-900 shadow-xl rounded-lg">
                    <svg width={totalSize + offset} height={totalSize + offset} className="overflow-visible">
                        <defs>
                            <pattern id={`grid-${isTarget}`} width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                                <rect width={cellSize} height={cellSize} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect x={offset} y={offset} width={totalSize} height={totalSize} fill={`url(#grid-${isTarget})`} />

                        {showCoords && (
                            <g>
                                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <text x={i * cellSize + offset} y={offset - 8} textAnchor="middle" fontSize="9" fontWeight="black" className="fill-zinc-400 font-mono">{String.fromCharCode(65 + i)}</text>
                                        <text x={offset - 8} y={i * cellSize + offset} dominantBaseline="middle" textAnchor="end" fontSize="9" fontWeight="black" className="fill-zinc-400 font-mono">{i + 1}</text>
                                    </React.Fragment>
                                ))}
                            </g>
                        )}

                        <g transform={`translate(${offset}, ${offset})`}>
                            {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                const r = Math.floor(i / (gridDim + 1));
                                const c = i % (gridDim + 1);
                                return <circle key={i} cx={c * cellSize} cy={r * cellSize} r={isTarget ? "2" : "1.5"} className={isTarget ? "fill-zinc-800" : "fill-zinc-200"} />
                            })}

                            {(lines || []).map((line, index) => (
                                line && line.length >= 2 && (
                                    <line
                                        key={index}
                                        x1={line[0][0] * cellSize} y1={line[0][1] * cellSize}
                                        x2={line[1][0] * cellSize} y2={line[1][1] * cellSize}
                                        className="stroke-zinc-900"
                                        strokeWidth={Math.max(2, 4 - Math.floor(gridDim / 4))}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )
                            ))}
                        </g>
                    </svg>
                </div>
            </div>
        );
    };

    const getTransformLabel = (mode: string) => {
        switch(mode) {
            case 'mirror_v': return 'DİKEY AYNA';
            case 'mirror_h': return 'YATAY AYNA';
            case 'rotate_90': return '90° DÖNÜŞ';
            case 'rotate_180': return '180° TERS';
            default: return 'KOPYA MODU';
        }
    }

    return (
        <div className="flex flex-col h-full bg-white p-2">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
            
            <div className="flex-1 flex flex-col gap-8 py-4">
                {(data?.drawings || []).map((drawing, index) => (
                    <EditableElement key={index} className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center p-8 bg-[#fcfcfc] rounded-[3rem] border-2 border-zinc-100 break-inside-avoid relative overflow-hidden group shadow-inner">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none transform rotate-12"><i className="fa-solid fa-compass-drafting text-[8rem]"></i></div>
                        
                        {renderGrid(drawing.lines, "REFERANS DESEN", true)}
                        
                        <div className="flex flex-row md:flex-col items-center justify-center gap-3 text-zinc-300">
                             <div className="w-12 h-12 rounded-2xl border-[3px] border-zinc-200 flex items-center justify-center text-xl font-black italic shadow-sm bg-white">
                                 <i className="fa-solid fa-wand-magic-sparkles text-indigo-500 animate-pulse"></i>
                             </div>
                             <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">
                                 {getTransformLabel(data.transformMode)}
                             </div>
                             <i className="fa-solid fa-arrow-right md:rotate-0 rotate-90 text-2xl text-zinc-200"></i>
                        </div>

                        {renderGrid(null, "ÇİZİM ALANI", false)}
                    </EditableElement>
                ))}
            </div>

            <div className="mt-auto pt-4 flex justify-between items-center px-10 border-t border-zinc-100">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Metodoloji</span>
                    <span className="text-[10px] font-bold text-zinc-800">CRA (Somuttan Soyuta) Model</span>
                </div>
                <p className="text-[7px] text-zinc-300 font-bold uppercase tracking-[0.4em]">Bursa Disleksi AI • Görsel-Uzamsal Laboratuvarı</p>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
                </div>
            </div>
        </div>
    );
};

export const SymmetryDrawingSheet: React.FC<{ data: SymmetryDrawingData }> = ({ data }) => {
    const gridDim = data?.gridDim || 10;
    // Dinamik Hücre Boyutu
    const cellSize = Math.min(35, Math.floor(450 / gridDim));
    const totalSize = gridDim * cellSize;
    const showCoords = data?.showCoordinates;
    const axis = data?.axis || 'vertical';
    const offset = showCoords ? 20 : 10;

    return (
        <div className="flex flex-col h-full bg-white p-2 font-sans">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
            
            <div className="flex-1 flex flex-col items-center justify-center py-4">
                <EditableElement className="relative p-8 bg-[#f8fafc] rounded-[2.5rem] border-4 border-zinc-200 shadow-xl overflow-visible">
                    <div className="absolute -top-3 -left-3 bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg transform -rotate-2 z-20">
                        {axis === 'vertical' ? 'DİKEY SİMETRİ' : 'YATAY SİMETRİ'}
                    </div>

                    <div className="bg-white p-3 border-[5px] border-zinc-900 shadow-2xl relative overflow-visible rounded-lg">
                        <svg width={totalSize + offset * 2} height={totalSize + offset * 2} className="overflow-visible">
                            <g transform={`translate(${offset}, ${offset})`}>
                                {/* Grid Arka Planı */}
                                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} stroke="#e2e8f0" strokeWidth="1" />
                                        <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} stroke="#e2e8f0" strokeWidth="1" />
                                        
                                        {showCoords && (
                                            <>
                                                <text x={i * cellSize} y="-10" textAnchor="middle" fontSize="9" fontWeight="black" className="fill-zinc-400 font-mono">
                                                    {String.fromCharCode(65 + i)}
                                                </text>
                                                <text x="-10" y={i * cellSize} dominantBaseline="middle" textAnchor="end" fontSize="9" fontWeight="black" className="fill-zinc-400 font-mono">
                                                    {i + 1}
                                                </text>
                                            </>
                                        )}
                                    </React.Fragment>
                                ))}

                                {/* Simetri Kılavuz Noktaları */}
                                {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                    const r = Math.floor(i / (gridDim + 1));
                                    const c = i % (gridDim + 1);
                                    return <circle key={i} cx={c * cellSize} cy={r * cellSize} r="1.2" className="fill-zinc-300" />
                                })}

                                {/* Referans Çizimler */}
                                {(data?.lines || []).map((l, i) => (
                                    <line 
                                        key={i} 
                                        x1={l.x1 * cellSize} y1={l.y1 * cellSize} 
                                        x2={l.x2 * cellSize} y2={l.y2 * cellSize} 
                                        stroke={l.color || "#0f172a"} 
                                        strokeWidth={Math.max(2, 4 - Math.floor(gridDim / 5))} 
                                        strokeLinecap="round"
                                        className="drop-shadow-sm"
                                    />
                                ))}

                                {/* Referans Noktalar */}
                                {(data?.dots || []).map((dot, i) => (
                                    <circle key={i} cx={dot.x * cellSize} cy={dot.y * cellSize} r="4" fill={dot.color || "#4f46e5"} className="shadow-sm" />
                                ))}

                                {/* Simetri Ekseni */}
                                {axis === 'vertical' ? (
                                    <line x1={(gridDim / 2) * cellSize} y1="-10" x2={(gridDim / 2) * cellSize} y2={totalSize + 10} stroke="#f43f5e" strokeWidth="4" strokeDasharray="8,4" className="drop-shadow-md" />
                                ) : (
                                    <line x1="-10" y1={(gridDim / 2) * cellSize} x2={totalSize + 10} y2={(gridDim / 2) * cellSize} stroke="#f43f5e" strokeWidth="4" strokeDasharray="8,4" className="drop-shadow-md" />
                                )}
                            </g>
                        </svg>

                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-zinc-900 -translate-x-1.5 -translate-y-1.5"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-zinc-900 translate-x-1.5 translate-y-1.5"></div>
                    </div>

                    <div className="mt-6 flex justify-center gap-10 opacity-50">
                        <div className="flex flex-col items-center">
                            <i className="fa-solid fa-compass-drafting text-lg text-zinc-400 mb-1"></i>
                            <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Denge</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <i className="fa-solid fa-eye text-lg text-zinc-400 mb-1"></i>
                            <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Odak</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <i className="fa-solid fa-brain text-lg text-zinc-400 mb-1"></i>
                            <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Biliş</span>
                        </div>
                    </div>
                </EditableElement>

                <div className="mt-8 grid grid-cols-2 gap-8 w-full max-w-2xl border-t border-zinc-100 pt-6">
                    <div className="space-y-3">
                        <h4 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b pb-1">Hata Analizi</h4>
                        <div className="space-y-1.5">
                             <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded border border-zinc-200"></div><span className="text-[11px] text-zinc-500">Yön Karıştırma (Ayna Hatası)</span></div>
                             <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded border border-zinc-200"></div><span className="text-[11px] text-zinc-500">Koordinat Kaydırma</span></div>
                        </div>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                         <h4 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Uzman Gözlemi</h4>
                         <div className="h-14 border-b border-zinc-200 border-dashed"></div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 flex justify-between items-end border-t border-zinc-100 px-6">
                <p className="text-[7px] text-zinc-300 font-bold uppercase tracking-[0.4em]">Bursa Disleksi AI • Uzamsal-Motor Entegrasyon Laboratuvarı</p>
                <div className="flex gap-1.5">
                     <div className="w-4 h-1 bg-indigo-500 rounded-full"></div>
                     <div className="w-4 h-1 bg-zinc-200 rounded-full"></div>
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
