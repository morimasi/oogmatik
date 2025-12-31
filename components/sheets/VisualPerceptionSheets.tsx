import React from 'react';
import { 
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, RomanNumeralConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, WordConnectData, CoordinateCipherData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeCountingData, ShapeType,
    GeneratorOptions
} from '../../types';
import { ShapeDisplay, SegmentDisplay, GridComponent, ImageDisplay, PedagogicalHeader, Matchstick, ConnectionDot, Shape, CubeStack } from './common';
import { CONNECT_COLORS } from '../../services/offlineGenerators/helpers';
import { EditableElement, EditableText } from '../Editable';

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
    const cellSize = gridDim > 8 ? 20 : 30;
    const totalSize = gridDim * cellSize;
    const showCoords = data?.showCoordinates;

    const renderGrid = (lines: [number, number][][] | null, label: string, isTarget: boolean) => {
        const offset = showCoords ? 25 : 0;
        return (
            <div className="flex flex-col items-center group/grid">
                <span className="mb-4 font-black text-zinc-900 text-[10px] uppercase tracking-widest bg-zinc-100 px-4 py-1.5 rounded-full border border-zinc-200 shadow-sm transition-all group-hover/grid:bg-indigo-600 group-hover/grid:text-white group-hover/grid:border-indigo-700">
                    {label}
                </span>
                <div className="relative p-1 bg-white border-[4px] border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                    <svg width={totalSize + offset} height={totalSize + offset} className="overflow-visible">
                        {/* Koordinat Etiketleri */}
                        {showCoords && (
                            <g>
                                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <text x={i * cellSize + offset} y={offset - 10} textAnchor="middle" fontSize="9" fontWeight="black" className="fill-zinc-400">{String.fromCharCode(65 + i)}</text>
                                        <text x={offset - 10} y={i * cellSize + offset} dominantBaseline="middle" textAnchor="end" fontSize="9" fontWeight="black" className="fill-zinc-400">{i + 1}</text>
                                    </React.Fragment>
                                ))}
                            </g>
                        )}

                        <g transform={`translate(${offset}, ${offset})`}>
                            {/* Kılavuz Noktalar */}
                            {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                const r = Math.floor(i / (gridDim + 1));
                                const c = i % (gridDim + 1);
                                return <circle key={i} cx={c * cellSize} cy={r * cellSize} r={isTarget ? "2" : "1.5"} className={isTarget ? "fill-zinc-400" : "fill-zinc-200"} />
                            })}

                            {/* Çizim Hatları */}
                            {(lines || []).map((line, index) => (
                                line && line.length >= 2 && (
                                    <line
                                        key={index}
                                        x1={line[0][0] * cellSize} y1={line[0][1] * cellSize}
                                        x2={line[1][0] * cellSize} y2={line[1][1] * cellSize}
                                        className="stroke-zinc-900"
                                        strokeWidth={gridDim > 8 ? "2" : "3"}
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
            case 'mirror_v': return 'Dikey Ayna';
            case 'mirror_h': return 'Yatay Ayna';
            case 'rotate_90': return '90° Dönmüş';
            case 'rotate_180': return '180° Ters';
            default: return 'Kopya';
        }
    }

    return (
        <div className="flex flex-col h-full bg-white p-2">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
            <div className="space-y-16 mt-4 flex-1 content-start">
                {(data?.drawings || []).map((drawing, index) => (
                    <EditableElement key={index} className="flex flex-col md:flex-row gap-16 items-center justify-center p-8 bg-zinc-50 rounded-[3rem] border-2 border-zinc-100 break-inside-avoid relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform rotate-12"><i className="fa-solid fa-clone text-8xl"></i></div>
                        {renderGrid(drawing.lines, "Referans Şekil", true)}
                        <div className="flex flex-col items-center justify-center gap-3 text-zinc-300">
                             <div className="w-12 h-12 rounded-full border-4 border-zinc-200 flex items-center justify-center text-xl font-black italic">!</div>
                             <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">{getTransformLabel(data.transformMode)}</span>
                             <i className="fa-solid fa-arrow-right text-2xl animate-pulse"></i>
                        </div>
                        {renderGrid(null, "Çizim Alanı", false)}
                    </EditableElement>
                ))}
            </div>
             <div className="mt-auto pt-6 text-center border-t border-zinc-100">
                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Uzamsal-Motor Entegrasyon Laboratuvarı</p>
            </div>
        </div>
    );
};

export const SymmetryDrawingSheet: React.FC<{ data: SymmetryDrawingData }> = ({ data }) => {
    const gridDim = data?.gridDim || 10;
    const cellSize = gridDim > 10 ? 20 : 30;
    const totalSize = gridDim * cellSize;
    const showCoords = data?.showCoordinates;
    const axis = data?.axis || 'vertical';
    const offset = showCoords ? 25 : 10;

    return (
        <div className="flex flex-col h-full bg-white p-2 font-sans">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
            
            <div className="flex-1 flex flex-col items-center justify-center py-6">
                <EditableElement className="relative p-10 bg-[#f8fafc] rounded-[3.5rem] border-4 border-zinc-200 shadow-xl overflow-visible">
                    {/* Klinik Etiketler */}
                    <div className="absolute -top-4 -left-4 bg-indigo-600 text-white px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transform -rotate-3 z-20">
                        {axis === 'vertical' ? 'DİKEY SİMETRİ' : 'YATAY SİMETRİ'}
                    </div>

                    <div className="bg-white p-4 border-[6px] border-zinc-900 shadow-2xl relative overflow-visible rounded-xl">
                        <svg width={totalSize + offset * 2} height={totalSize + offset * 2} className="overflow-visible">
                            <g transform={`translate(${offset}, ${offset})`}>
                                {/* Grid Arka Planı */}
                                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} stroke="#e2e8f0" strokeWidth="1" />
                                        <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} stroke="#e2e8f0" strokeWidth="1" />
                                        
                                        {showCoords && (
                                            <>
                                                {/* Yatay Harf Etiketleri (A, B, C...) */}
                                                <text x={i * cellSize} y="-12" textAnchor="middle" fontSize="10" fontWeight="black" className="fill-zinc-400 font-mono">
                                                    {String.fromCharCode(65 + i)}
                                                </text>
                                                {/* Dikey Sayı Etiketleri (1, 2, 3...) */}
                                                <text x="-12" y={i * cellSize} dominantBaseline="middle" textAnchor="end" fontSize="10" fontWeight="black" className="fill-zinc-400 font-mono">
                                                    {i + 1}
                                                </text>
                                            </>
                                        )}
                                    </React.Fragment>
                                ))}

                                {/* Simetri Kılavuz Noktaları (Tüm Grid Üzerinde) */}
                                {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                    const r = Math.floor(i / (gridDim + 1));
                                    const c = i % (gridDim + 1);
                                    return <circle key={i} cx={c * cellSize} cy={r * cellSize} r="1.5" className="fill-zinc-300" />
                                })}

                                {/* Hazır Çizim Hatları (Referans Taraf) */}
                                {(data?.lines || []).map((l, i) => (
                                    <line 
                                        key={i} 
                                        x1={l.x1 * cellSize} y1={l.y1 * cellSize} 
                                        x2={l.x2 * cellSize} y2={l.y2 * cellSize} 
                                        stroke={l.color || "#0f172a"} 
                                        strokeWidth="4" 
                                        strokeLinecap="round"
                                        className="drop-shadow-sm"
                                    />
                                ))}

                                {/* Referans Noktalar */}
                                {(data?.dots || []).map((dot, i) => (
                                    <circle key={i} cx={dot.x * cellSize} cy={dot.y * cellSize} r="5" fill={dot.color || "#4f46e5"} className="shadow-sm" />
                                ))}

                                {/* Simetri Ekseni (Kritik Vurgu) */}
                                {axis === 'vertical' ? (
                                    <line x1={totalSize / 2} y1="-15" x2={totalSize / 2} y2={totalSize + 15} stroke="#f43f5e" strokeWidth="5" strokeDasharray="10,5" className="drop-shadow-md" />
                                ) : (
                                    <line x1="-15" y1={totalSize / 2} x2={totalSize + 15} y2={totalSize / 2} stroke="#f43f5e" strokeWidth="5" strokeDasharray="10,5" className="drop-shadow-md" />
                                )}
                            </g>
                        </svg>

                        {/* Köşe Süsleri */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-zinc-900 -translate-x-2 -translate-y-2"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-zinc-900 translate-x-2 translate-y-2"></div>
                    </div>

                    {/* Klinik Yönergeler Alt Bilgi */}
                    <div className="mt-8 flex justify-center gap-12 opacity-50">
                        <div className="flex flex-col items-center">
                            <i className="fa-solid fa-compass-drafting text-xl text-zinc-400 mb-1"></i>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Denge</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <i className="fa-solid fa-eye text-xl text-zinc-400 mb-1"></i>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Odak</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <i className="fa-solid fa-brain text-xl text-zinc-400 mb-1"></i>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Biliş</span>
                        </div>
                    </div>
                </EditableElement>

                {/* Geri Bildirim ve Not Alanı */}
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
                     <div className="w-6 h-1 bg-indigo-500 rounded-full"></div>
                     <div className="w-6 h-1 bg-zinc-200 rounded-full"></div>
                     <div className="w-6 h-1 bg-zinc-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export const WordComparisonSheet: React.FC<{ data: WordComparisonData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
            <EditableElement className="flex-1 bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full">
                <h4 className="font-bold text-center mb-4 text-white bg-black py-1 rounded uppercase tracking-wider"><EditableText value={data?.box1Title} tag="span" /></h4>
                <ul className="space-y-3">
                    {(data?.wordList1 || []).map((word, i) => (
                        <li key={i} className="font-mono text-lg flex items-center gap-3 border-b border-zinc-200 pb-1">
                            <div className="w-4 h-4 border border-black rounded-full"></div>
                            <EditableText value={word} tag="span" />
                        </li>
                    ))}
                </ul>
            </EditableElement>
            
            <div className="hidden md:flex flex-col justify-center self-center text-zinc-300">
                <i className="fa-solid fa-right-left text-4xl"></i>
            </div>

            <EditableElement className="flex-1 bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full">
                <h4 className="font-bold text-center mb-4 text-black bg-zinc-200 py-1 rounded uppercase tracking-wider"><EditableText value={data?.box2Title} tag="span" /></h4>
                <ul className="space-y-3">
                    {(data?.wordList2 || []).map((word, i) => (
                        <li key={i} className="font-mono text-lg flex items-center gap-3 border-b border-zinc-200 pb-1">
                            <div className="w-4 h-4 border border-black rounded-full"></div>
                            <EditableText value={word} tag="span" />
                        </li>
                    ))}
                </ul>
            </EditableElement>
        </div>
        
        <EditableElement className="mt-8 p-6 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-400 text-center">
            <p className="text-zinc-500 mb-4 font-bold uppercase text-xs tracking-widest">Farklı Olan Kelimeler</p>
            <div className="flex gap-4 justify-center flex-wrap">
                {Array.from({length: Math.max(3, (data?.correctDifferences || []).length)}).map((_, i) => (
                    <div key={i} className="w-32 h-10 border-b-2 border-black bg-white/50"><EditableText value="" tag="div" className="w-full h-full" /></div>
                ))}
            </div>
        </EditableElement>
    </div>
);

export const ShapeMatchingSheet: React.FC<{ data: ShapeMatchingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="flex justify-between gap-12 mt-8 relative max-w-3xl mx-auto">
            <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none">
                <div className="h-full border-r-2 border-dashed border-black"></div>
            </div>

            <div className="space-y-8 flex-1">
                {(data?.leftColumn || []).map((item, i) => (
                    <EditableElement key={i} className="flex items-center gap-4 relative">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white font-bold"><EditableText value={item.id} tag="span" /></span>
                        <div className="flex-1 p-4 border-2 border-black rounded-xl bg-white shadow-sm h-24 flex items-center justify-center">
                            <div style={{transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`}}>
                                {item.imageBase64 ? (
                                    <ImageDisplay base64={item.imageBase64} className="w-full h-full object-contain" />
                                ) : (
                                    <ShapeDisplay shapes={item.shapes || []} />
                                )}
                            </div>
                        </div>
                        <ConnectionDot side="right" />
                    </EditableElement>
                ))}
            </div>
            <div className="space-y-8 flex-1">
                {(data?.rightColumn || []).map((item, i) => (
                    <EditableElement key={i} className="flex items-center gap-4 flex-row-reverse relative">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white border-2 border-black text-black font-bold"><EditableText value={item.id} tag="span" /></span>
                        <div className="flex-1 p-4 border-2 border-black rounded-xl bg-white shadow-sm h-24 flex items-center justify-center">
                            <div style={{transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`}}>
                                {item.imageBase64 ? (
                                    <ImageDisplay base64={item.imageBase64} className="w-full h-full object-contain" />
                                ) : (
                                    <ShapeDisplay shapes={item.shapes || []} />
                                )}
                            </div>
                        </div>
                        <ConnectionDot side="left" />
                    </EditableElement>
                ))}
            </div>
        </div>
    </div>
);

// Fix: Renamed FindIdenticalWordData component to FindIdenticalWordSheet to avoid collision with interface name
export const FindIdenticalWordSheet: React.FC<{ data: FindIdenticalWordData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data?.groups || []).map((group, index) => (
                <EditableElement key={index} className="bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] break-inside-avoid">
                    <div className="mb-4 text-center">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Aranan</span>
                        <div className="mt-1 p-2 bg-black text-white rounded-lg text-2xl font-black tracking-widest uppercase inline-block px-6">
                            <EditableText value={group.words[0]} tag="span" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {[...group.distractors, group.words[1]].sort().map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center justify-center p-3 border-2 border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors">
                                <span className="text-lg font-mono font-bold text-zinc-700"><EditableText value={option} tag="span" /></span>
                            </div>
                        ))}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const SymbolCipherSheet: React.FC<{ data: SymbolCipherData }> = ({ data }) => (
    <div>
         <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
         
         <EditableElement className="mb-10 p-4 bg-black rounded-2xl border-4 border-zinc-200 shadow-xl">
            <h4 className="text-center font-bold mb-4 uppercase tracking-[0.3em] text-white text-sm">ŞİFRE ÇÖZÜCÜ</h4>
            <div className="flex flex-wrap justify-center gap-2">
                {(data?.cipherKey || []).map((item, i) => (
                    <div key={i} className="flex flex-col items-center bg-white border-2 border-zinc-600 rounded w-14 overflow-hidden">
                        <div className="w-full h-10 flex items-center justify-center bg-zinc-100 border-b-2 border-zinc-600">
                            <div className="transform scale-75"><ShapeDisplay shapes={[item.shape as ShapeType]} /></div>
                        </div>
                        <div className="w-full h-8 flex items-center justify-center font-black text-xl text-black">
                            <EditableText value={item.letter.toUpperCase()} tag="span" />
                        </div>
                    </div>
                ))}
            </div>
         </EditableElement>

         <div className="space-y-8">
             {(data?.wordsToSolve || []).map((puzzle, index) => (
                 <EditableElement key={index} className="flex flex-wrap justify-center gap-4 p-6 border-b-2 border-dashed border-zinc-300">
                     {puzzle.shapeSequence.map((shape, sIdx) => (
                         <div key={sIdx} className="flex flex-col items-center gap-3">
                             <div className="w-14 h-14 bg-white border-4 border-black rounded-xl flex items-center justify-center shadow-sm">
                                 <ShapeDisplay shapes={[shape as ShapeType]} />
                             </div>
                             <div className="w-14 h-12 border-b-4 border-black bg-zinc-50 rounded-t-lg flex items-center justify-center font-bold"><EditableText value="" tag="span" /></div>
                         </div>
                     ))}
                 </EditableElement>
             ))}
         </div>
    </div>
);

export const BlockPaintingSheet: React.FC<{ data: BlockPaintingData }> = ({ data }) => {
    const { grid: { rows, cols } = {rows: 5, cols: 5}, targetPattern, shapes } = data || {};
    const activeColor = shapes?.[0]?.color || '#000000';
    const cellDisplaySize = 30; 

    return (
        <div>
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
            <EditableElement className="flex flex-col md:flex-row gap-12 justify-center items-start break-inside-avoid mt-8">
                
                <div className="flex flex-col items-center">
                    <h4 className="font-bold text-center mb-2 text-zinc-500 uppercase tracking-widest text-xs bg-white px-3 py-1 border border-zinc-300 rounded-full">Örnek</h4>
                    <div className="border-4 border-black p-1 bg-white inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className={`grid gap-px bg-zinc-300 border border-zinc-300`} style={{gridTemplateColumns: `repeat(${cols}, ${cellDisplaySize}px)`}}>
                            {(targetPattern || []).flat().map((cell, i) => (
                                <div key={i} className="w-full h-[30px]" style={{backgroundColor: cell ? activeColor : 'white'}}></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-zinc-300 hidden md:flex flex-col justify-center h-full pt-16">
                    <i className="fa-solid fa-paintbrush text-2xl"></i>
                </div>
                
                <div className="flex flex-col items-center">
                    <h4 className="font-bold text-center mb-2 text-zinc-500 uppercase tracking-widest text-xs bg-white px-3 py-1 border border-zinc-300 rounded-full">Senin Eserin</h4>
                    <div className="border-4 border-black p-1 bg-white inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className={`grid gap-px bg-zinc-300 border border-zinc-300`} style={{gridTemplateColumns: `repeat(${cols}, ${cellDisplaySize}px)`}}>
                            {Array.from({length: rows * cols}).map((_, i) => (
                                <div key={i} className="w-full h-[30px] bg-white hover:bg-zinc-100 cursor-pointer"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </EditableElement>
        </div>
    )
};

export const VisualOddOneOutSheet: React.FC<{ data: VisualOddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="dynamic-grid">
             {(data?.rows || []).map((row, i) => (
                 <EditableElement key={i} className="flex justify-around p-4 border-2 border-black rounded-xl bg-white break-inside-avoid shadow-sm items-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 bg-black text-white w-6 h-6 flex items-center justify-center font-bold text-xs rounded-br-lg">{i+1}</div>
                     {row.items.map((item, j) => {
                         const hasSegments = item.segments && item.segments.length > 0;
                         const rotation = item.rotation || 0;
                         
                         return (
                             <div key={j} className="flex flex-col gap-2 items-center cursor-pointer hover:bg-zinc-50 p-4 rounded border-2 border-transparent hover:border-black transition-all">
                                 <div style={{transform: `rotate(${rotation}deg)`}} className="transition-transform origin-center">
                                    {hasSegments ? (
                                        <SegmentDisplay segments={item.segments} />
                                    ) : (
                                        <div className="w-8 h-8 bg-black"></div>
                                    )}
                                 </div>
                                 <div className="w-5 h-5 border-2 border-black rounded mt-2"></div>
                             </div>
                         )
                     })}
                 </EditableElement>
             ))}
        </div>
    </div>
);

export const FindDifferentStringSheet: React.FC<{ data: FindDifferentStringData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="dynamic-grid font-mono text-xl tracking-widest">
            {(data?.rows || []).map((row, i) => (
                <EditableElement key={i} className="flex justify-between items-center p-4 bg-white rounded-xl border-2 border-zinc-200 break-inside-avoid shadow-sm">
                    <span className="w-6 h-6 flex items-center justify-center bg-black text-white text-xs font-bold rounded-full mr-4">{i+1}</span>
                    <div className="flex-1 flex justify-between">
                    {row.items.map((item, j) => (
                        <span key={j} className="cursor-pointer hover:bg-yellow-200 px-2 rounded transition-colors text-black font-bold"><EditableText value={item} tag="span" /></span>
                    ))}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const DotPaintingSheet: React.FC<{ data: DotPaintingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <EditableElement className="flex justify-center my-8">
            <div className="relative p-2 border-2 border-black rounded-lg inline-block">
                <div className="absolute top-0 left-0 w-full flex justify-between px-2 text-[8px] font-mono text-zinc-400 -mt-3">
                    <span>A</span><span>B</span><span>C</span><span>D</span><span>E</span><span>F</span><span>G</span><span>H</span><span>I</span><span>J</span>
                </div>
                <div className="absolute top-0 left-0 h-full flex flex-col justify-between py-2 text-[8px] font-mono text-zinc-400 -ml-3">
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
                </div>

                <svg viewBox="0 0 100 100" className="w-full max-w-lg bg-white">
                    {Array.from({length: 100}).map((_, i) => {
                        const x = (i % 10) * 10 + 5;
                        const y = Math.floor(i / 10) * 10 + 5;
                        return <circle key={i} cx={x} cy={y} r="1" fill="#e4e4e7" />
                    })}
                    {(data?.dots || []).map((dot, i) => (
                        <circle key={i} cx={dot.cx} cy={dot.cy} r="3" fill={dot.color} />
                    ))}
                </svg>
            </div>
        </EditableElement>
        <EditableElement className="mt-4 p-6 border-2 border-black rounded-xl text-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-bold text-lg mb-2"><EditableText value={data?.prompt1} tag="span" /></h4>
            <p className="text-zinc-600"><EditableText value={data?.prompt2} tag="span" /></p>
        </EditableElement>
    </div>
);

export const AbcConnectSheet: React.FC<{ data: AbcConnectData | RomanNumeralConnectData | RomanArabicMatchConnectData | WeightConnectData | LengthConnectData }> = ({ data }) => {
    const puzzles = 'puzzles' in data ? data.puzzles : (data as any).numbers ? [{gridDim: 10, points: (data as any).numbers}] : (data as any).expressions ? [{gridDim: 10, points: (data as any).expressions}] : [{ id: 1, gridDim: (data as any).gridDim || 6, points: (data as any).points || [] }];
    
    return (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction || "Çiftleri birleştirin."} note={data?.pedagogicalNote} />
        {(puzzles || []).map((puzzle: any, i: number) => (
             <EditableElement key={i} className="flex flex-col items-center mb-8">
                <div className="relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden" 
                     style={{ width: '100%', maxWidth: '500px', aspectRatio: '1/1' }}>
                     
                    <svg viewBox={`0 0 ${puzzle.gridDim * 50} ${puzzle.gridDim * 50}`} className="w-full h-full">
                         <defs>
                             <pattern id={`grid-${i}`} width="50" height="50" patternUnits="userSpaceOnUse">
                                 <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e4e4e7" strokeWidth="2"/>
                             </pattern>
                         </defs>
                         <rect width="100%" height="100%" fill={`url(#grid-${i})`} />
                         
                         {puzzle.points.map((p: any, k: number) => {
                             const color = p.color || (p.group !== undefined ? CONNECT_COLORS[p.group % CONNECT_COLORS.length] : CONNECT_COLORS[p.pairId % CONNECT_COLORS.length]) || '#3B82F6';
                             const isImage = p.imagePrompt && p.imagePrompt.length > 0;
                             
                             return (
                                <g key={k} transform={`translate(${p.x * 50 + 25}, ${p.y * 50 + 25})`}>
                                    <circle r="20" fill={color} />
                                    <circle r="16" fill="white" />
                                    
                                    {isImage ? (
                                        <text y="2" textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="#333">
                                            {p.label || '?'}
                                        </text>
                                    ) : (
                                        <text 
                                            y="1" 
                                            textAnchor="middle" 
                                            dominantBaseline="middle" 
                                            fontSize={String(p.label || p.text || p.value).length > 2 ? "10" : "14"} 
                                            fontWeight="black" 
                                            fill="#000"
                                            fontFamily="monospace"
                                        >
                                            {p.label || p.text || p.value}
                                        </text>
                                    )}
                                </g>
                             );
                         })}
                    </svg>
                </div>
             </EditableElement>
        ))}
    </div>
    );
};

export const WordConnectSheet: React.FC<{ data: WordConnectData }> = ({ data }) => {
    const leftPoints = (data?.points || []).filter(p => p.x === 0).sort((a, b) => a.y - b.y);
    const rightPoints = (data?.points || []).filter(p => p.x === 1).sort((a, b) => a.y - b.y);

    return (
        <div>
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
            
            <div className="flex justify-between items-stretch gap-12 mt-8 relative max-w-4xl mx-auto">
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <div className="h-full border-r-2 border-dashed border-zinc-300"></div>
                </div>

                <div className="flex-1 space-y-6">
                    {leftPoints.map((point, i) => (
                        <EditableElement key={i} className="flex items-center group relative h-20">
                            <div className="flex-1 bg-white border-2 border-black rounded-xl p-3 flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 transition-transform">
                                {point.imagePrompt && (
                                    <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center mr-4 text-2xl border border-zinc-200">
                                        <ImageDisplay base64={point.imagePrompt.length > 50 ? point.imagePrompt : undefined} description={point.word} className="w-full h-full object-contain" />
                                        {point.imagePrompt.length <= 50 && point.imagePrompt}
                                    </div>
                                )}
                                <span className="font-bold text-lg text-black"><EditableText value={point.word} tag="span" /></span>
                            </div>
                            <ConnectionDot side="right" />
                        </EditableElement>
                    ))}
                </div>

                <div className="flex-1 space-y-6">
                    {rightPoints.map((point, i) => (
                        <EditableElement key={i} className="flex items-center group relative h-20">
                            <ConnectionDot side="left" />
                            <div className="flex-1 bg-white border-2 border-black rounded-xl p-3 flex items-center flex-row-reverse shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 transition-transform ml-4">
                                {point.imagePrompt && (
                                    <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center ml-4 text-2xl border border-zinc-200">
                                        <ImageDisplay base64={point.imagePrompt.length > 50 ? point.imagePrompt : undefined} description={point.word} className="w-full h-full object-contain" />
                                        {point.imagePrompt.length <= 50 && point.imagePrompt}
                                    </div>
                                )}
                                <span className="font-bold text-lg text-black"><EditableText value={point.word} tag="span" /></span>
                            </div>
                        </EditableElement>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const CoordinateCipherSheet: React.FC<{ data: CoordinateCipherData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <EditableElement className="flex justify-center">
            <table className="border-collapse border-4 border-black bg-white shadow-lg rounded-lg overflow-hidden">
                <tbody>
                    {(data?.grid || []).map((row, i) => (
                        <tr key={i}>
                            <td className="border border-black p-3 font-black bg-zinc-200 text-lg text-center w-12">{String.fromCharCode(65+i)}</td>
                            {row && row.map((cell, j) => (
                                <td key={j} className="border border-black w-14 h-14 text-center font-mono text-2xl font-bold"><EditableText value={cell} tag="span" /></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td className="bg-zinc-200 border-t-2 border-black"></td>
                        {data?.grid && data.grid.length > 0 && data.grid[0] && data.grid[0].map((_, j) => <td key={j} className="text-center font-black p-2 bg-zinc-200 border-t-2 border-r border-black text-lg">{j+1}</td>)}
                    </tr>
                </tfoot>
            </table>
        </EditableElement>
        <div className="mt-10 flex flex-wrap gap-4 justify-center p-6 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-300">
            {(data?.cipherCoordinates || []).map((coord, i) => (
                <EditableElement key={i} className="flex flex-col items-center">
                    <div className="w-12 h-12 border-b-4 border-black mb-1 flex items-end justify-center pb-2 font-bold text-2xl"><EditableText value="" tag="span" /></div>
                    <span className="text-lg font-black text-zinc-500 bg-white px-2 rounded border border-zinc-200"><EditableText value={coord} tag="span" /></span>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ProfessionConnectSheet: React.FC<{ data: ProfessionConnectData }> = ({ data }) => (
     <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="grid grid-cols-2 gap-12 max-w-4xl mx-auto relative mt-8">
            <div className="space-y-8">
                {(data?.points || []).filter(p => p.x === 0).map((p, i) => (
                    <EditableElement key={i} className="flex items-center gap-4 p-4 border-2 border-black rounded-xl bg-white relative shadow-sm h-24">
                        <span className="text-lg font-bold text-black flex-1"><EditableText value={p.label} tag="span" /></span>
                        <div className="w-6 h-6 bg-black rounded-full absolute -right-3 border-4 border-white"></div>
                    </EditableElement>
                ))}
            </div>
            <div className="space-y-8">
                 {(data?.points || []).filter(p => p.x > 0).map((p, i) => (
                    <EditableElement key={i} className="flex items-center gap-4 p-4 border-2 border-black rounded-xl bg-white relative justify-end h-24">
                        <div className="w-6 h-6 bg-black rounded-full absolute -left-3 border-4 border-white"></div>
                        <span className="text-lg font-bold text-zinc-500 text-right flex-1 italic"><EditableText value={p.imageDescription} tag="span" /></span> 
                    </EditableElement>
                ))}
            </div>
        </div>
    </div>
);

export const MatchstickSymmetrySheet: React.FC<{ data: MatchstickSymmetryData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <EditableElement className="flex justify-center mt-8">
            <div className="relative p-8 bg-amber-50 rounded-3xl border-4 border-amber-200 shadow-xl">
                <svg width="400" height="400" className="bg-white border-2 border-amber-100 rounded-xl overflow-visible">
                    {Array.from({length: 36}).map((_, i) => {
                        const x = (i % 6) * 50 + 25;
                        const y = Math.floor(i / 6) * 50 + 25;
                        return <circle key={i} cx={x} cy={y} r="2" fill="#d6d3d1" />
                    })}
                    
                    <line x1="200" y1="0" x2="200" y2="400" stroke="#ef4444" strokeWidth="2" strokeDasharray="8,4" />
                    
                    {(data?.puzzles?.[0]?.lines || []).map((l, i) => (
                        <Matchstick 
                            key={i} 
                            x1={l.x1 * 50 + 25} y1={l.y1 * 50 + 25} 
                            x2={l.x2 * 50 + 25} y2={l.y2 * 50 + 25} 
                            color="#f59e0b"
                        />
                    ))}
                </svg>
            </div>
        </EditableElement>
    </div>
);

export const VisualOddOneOutThemedSheet: React.FC<{ data: VisualOddOneOutThemedData }> = ({ data }) => (
    <div>
         <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
         <div className="dynamic-grid">
             {(data?.rows || []).map((row, i) => (
                 <EditableElement key={i} className="border-2 border-black p-6 rounded-2xl bg-white break-inside-avoid shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                     <h4 className="text-xs font-black text-white bg-black inline-block px-3 py-1 rounded mb-4 uppercase tracking-widest"><EditableText value={row.theme} tag="span" /></h4>
                     <div className="flex justify-around items-center">
                         {row.items.map((item, j) => (
                             <div key={j} className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-24 h-24 border-2 border-zinc-200 rounded-xl flex items-center justify-center text-center text-xs p-2 bg-zinc-50 group-hover:bg-white group-hover:border-black transition-all">
                                    {item.imageBase64 ? <ImageDisplay base64={item.imageBase64} className="w-full h-full" /> : <EditableText value={item.description} tag="span" className="font-bold text-zinc-600 group-hover:text-black" />}
                                </div>
                                <div className="w-6 h-6 border-2 border-zinc-300 rounded-full group-hover:border-black"></div>
                             </div>
                         ))}
                     </div>
                 </EditableElement>
             ))}
         </div>
    </div>
);

export const StarHuntSheet: React.FC<{ data: StarHuntData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="flex flex-col items-center justify-center mt-8">
            <div className="bg-slate-900 p-8 rounded-3xl border-4 border-slate-700 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl"></div>
                <GridComponent grid={data?.grid || []} cellClassName="w-12 h-12 border-slate-700 bg-slate-800 text-yellow-400 text-2xl" />
            </div>
            <p className="text-center mt-6 font-bold text-black bg-yellow-100 px-6 py-2 rounded-full border border-yellow-300 shadow-sm">
                <i className="fa-solid fa-star text-yellow-500 mr-2"></i>
                Toplam Yıldız Hedefi: <EditableText value={data?.targetCount} tag="span" />
            </p>
        </div>
    </div>
);

export const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="flex flex-col items-center gap-12 mt-8">
            {(data?.figures || []).map((fig, index) => {
                const isCubeStack = !!(fig as any).cubeData;

                return (
                    <EditableElement key={index} className="p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center break-inside-avoid border-4 border-black bg-white w-full max-w-lg">
                        {isCubeStack ? (
                            <div className="w-full flex justify-center mb-6">
                                <CubeStack counts={(fig as any).cubeData} />
                            </div>
                        ) : (
                            <svg viewBox="0 0 100 100" className="w-64 h-64 mb-8 overflow-visible">
                                {(fig.svgPaths || []).map((path, pIndex) => (
                                    <path 
                                        key={pIndex} 
                                        d={path.d} 
                                        fill={path.fill || 'transparent'} 
                                        stroke={path.stroke || 'black'} 
                                        strokeWidth="1.5" 
                                        fillOpacity="0.5" 
                                    />
                                ))}
                            </svg>
                        )}
                        <div className="flex items-center gap-4 p-4 bg-zinc-100 border-2 border-black rounded-xl w-full">
                            <span className="font-bold text-black text-lg">Toplam {isCubeStack ? 'Küp' : (fig.targetShape === 'triangle' ? 'Üçgen' : 'Şekil')} Sayısı:</span>
                            <div className="w-20 h-10 border-b-4 border-black border-dashed flex items-center justify-center font-bold text-xl"><EditableText value="" tag="span" /></div>
                        </div>
                    </EditableElement>
                );
            })}
        </div>
    </div>
);

const createSimpleSheet = (compName: string) => ({ data }: { data: any }) => (
  <div>
      <PedagogicalHeader title={data?.title || compName} instruction={data?.instruction || data?.prompt || ""} note={data?.pedagogicalNote} />
      <div className="p-4 text-center text-zinc-500 italic">Görsel içerik oluşturuldu.</div>
  </div>
);
export const PunctuationColoringSheet = createSimpleSheet('Noktalama Boyama');
export const SynonymAntonymColoringSheet = createSimpleSheet('Eş/Zıt Anlam Boyama');
export const RomanNumeralConnectSheet = AbcConnectSheet;
export const WeightConnectSheet = AbcConnectSheet;
export const LengthConnectSheet = AbcConnectSheet;
