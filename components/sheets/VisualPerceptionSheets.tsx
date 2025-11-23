
import React from 'react';
import { 
    FindTheDifferenceData, ShapeMatchingData, GridDrawingData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, AbcConnectData
} from '../../types';
import { ShapeDisplay, SegmentDisplay, ImageDisplay, PedagogicalHeader } from './common';
import { CONNECT_COLORS } from '../../services/offlineGenerators/helpers';

export const FindTheDifferenceSheet: React.FC<{ data: FindTheDifferenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-6 max-w-3xl mx-auto">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex items-center justify-between p-6 border-2 rounded-xl bg-white dark:bg-zinc-700/50 shadow-sm hover:shadow-md transition-shadow" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <div className="w-8 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 rounded-full font-bold mr-4">{index + 1}</div>
                    <div className="flex-1 flex justify-around">
                        {(row.items || []).map((item, itemIndex) => (
                            <div key={itemIndex} className="px-4 py-2 border border-dashed border-zinc-300 rounded cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                                <span className="text-2xl font-mono tracking-wider">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ShapeMatchingSheet: React.FC<{ data: ShapeMatchingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex justify-center gap-24 mt-8 relative">
             {/* Connector Lines Placeholder (Visual only, printed lines are drawn by user) */}
            <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none">
                <svg className="w-full h-full"><line x1="30%" y1="10%" x2="70%" y2="90%" stroke="black" strokeWidth="2" strokeDasharray="5,5" /></svg>
            </div>

            <div className="space-y-8">
                {(data.leftColumn || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-bold">{item.id}</span>
                        <div className="p-4 border-2 border-indigo-200 rounded-lg bg-white shadow-sm w-32 h-32 flex items-center justify-center">
                            <ShapeDisplay shapes={item.shapes} />
                        </div>
                        <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                    </div>
                ))}
            </div>
            <div className="space-y-8">
                {(data.rightColumn || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-4 flex-row-reverse">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 text-rose-800 font-bold">{item.id}</span>
                        <div className="p-4 border-2 border-rose-200 rounded-lg bg-white shadow-sm w-32 h-32 flex items-center justify-center">
                            <ShapeDisplay shapes={item.shapes} />
                        </div>
                         <div className="w-4 h-4 bg-rose-500 rounded-full"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const GridDrawingSheet: React.FC<{ data: GridDrawingData }> = ({ data }) => {
    const gridDim = data.gridDim;
    const cellSize = 30;
    const totalSize = gridDim * cellSize;

    const renderGrid = (lines: [number, number][][] | null, isTarget: boolean) => (
        <div className="flex flex-col items-center">
            <span className="mb-2 font-semibold text-zinc-500">{isTarget ? "Örnek" : "Senin Çizimin"}</span>
            <svg width={totalSize} height={totalSize} className={`bg-white dark:bg-zinc-800 border-2 ${isTarget ? 'border-indigo-400' : 'border-zinc-300'}`}>
                {/* Grid */}
                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                    <g key={i}>
                        <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
                        <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
                    </g>
                ))}
                {/* Lines */}
                {(lines || []).map((line, index) => (
                    <line
                        key={index}
                        x1={line[0][0] * cellSize} y1={line[0][1] * cellSize}
                        x2={line[1][0] * cellSize} y2={line[1][1] * cellSize}
                        className="stroke-indigo-600 dark:stroke-indigo-400"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                ))}
                {/* Dots at intersections */}
                {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                     const r = Math.floor(i / (gridDim + 1));
                     const c = i % (gridDim + 1);
                     return <circle key={i} cx={c*cellSize} cy={r*cellSize} r="2" className="fill-zinc-300" />
                })}
            </svg>
        </div>
    );

    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            <div className="space-y-12">
                {(data.drawings || []).map((drawing, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-12 items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
                        {renderGrid(drawing.lines, true)}
                        <i className="fa-solid fa-arrow-right text-3xl text-zinc-300 hidden md:block"></i>
                        {renderGrid(null, false)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const BlockPaintingSheet: React.FC<{ data: BlockPaintingData }> = ({ data }) => {
    const { grid: { rows, cols }, shapes } = data;
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            <div className="flex flex-col md:flex-row gap-12 justify-center items-start">
                <div className="flex-1">
                    <h4 className="font-bold text-center mb-4">Boyama Alanı</h4>
                    <div className="border-2 border-black p-1 inline-block bg-white">
                        <div className={`grid gap-px bg-zinc-200`} style={{gridTemplateColumns: `repeat(${cols}, 30px)`}}>
                            {Array.from({length: rows * cols}).map((_, i) => (
                                <div key={i} className="w-[30px] h-[30px] bg-white border border-zinc-100"></div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="w-full md:w-1/3">
                    <h4 className="font-bold text-center mb-4">Kullanılacak Bloklar</h4>
                    <div className="space-y-6">
                        {(shapes || []).map((shape, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white rounded shadow-sm border">
                                <div className={`grid gap-0.5`} style={{gridTemplateColumns: `repeat(${(shape.pattern || [[]])[0].length}, 12px)`}}>
                                    {(shape.pattern || []).flat().map((cell, j) => (
                                        <div key={j} className="w-[12px] h-[12px]" style={{backgroundColor: cell ? shape.color : 'transparent'}}></div>
                                    ))}
                                </div>
                                <div className="text-sm font-bold">x {shape.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};

export const VisualOddOneOutSheet: React.FC<{ data: VisualOddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-6">
             {data.rows.map((row, i) => (
                 <div key={i} className="flex justify-around p-4 border rounded-lg bg-white">
                     {row.items.map((item, j) => (
                         <div key={j} className="flex flex-col gap-2 items-center cursor-pointer hover:bg-zinc-50 p-2 rounded">
                             <SegmentDisplay segments={item.segments} />
                             <div className="w-4 h-4 border rounded-full"></div>
                         </div>
                     ))}
                 </div>
             ))}
        </div>
    </div>
);

export const SymmetryDrawingSheet: React.FC<{ data: SymmetryDrawingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
         <div className="flex justify-center">
            <svg width={data.gridDim * 30} height={data.gridDim * 30} className="border border-zinc-400 bg-white">
                {/* Grid */}
                {Array.from({length: data.gridDim + 1}).map((_, i) => (
                    <React.Fragment key={i}>
                        <line x1={i*30} y1="0" x2={i*30} y2={data.gridDim*30} stroke="#e4e4e7" />
                        <line x1="0" y1={i*30} x2={data.gridDim*30} y2={i*30} stroke="#e4e4e7" />
                    </React.Fragment>
                ))}
                {/* Axis */}
                <line x1={data.gridDim*15} y1="0" x2={data.gridDim*15} y2={data.gridDim*30} stroke="red" strokeWidth="2" strokeDasharray="5,5" />
                
                {/* Dots */}
                {data.dots.map((dot, i) => (
                    <circle key={i} cx={dot.x * 30 + 15} cy={dot.y * 30 + 15} r="4" fill={dot.color || 'black'} />
                ))}
            </svg>
         </div>
    </div>
);

export const AbcConnectSheet: React.FC<{ data: AbcConnectData }> = ({ data }) => {
    const puzzles = data.puzzles;
    
    return (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Çiftleri birleştirin."} note={data.pedagogicalNote} />
        {puzzles.map((puzzle: any, i: number) => (
             <div key={i} className="flex flex-col items-center mb-8">
                {/* Professional Grid Visual */}
                <div className="relative bg-white border-2 border-zinc-800 dark:border-zinc-500 shadow-lg rounded-lg overflow-hidden" 
                     style={{ width: '100%', maxWidth: '600px', aspectRatio: '1/1' }}>
                     
                    <svg viewBox={`0 0 ${puzzle.gridDim * 50} ${puzzle.gridDim * 50}`} className="w-full h-full">
                         {/* Grid Lines */}
                         <defs>
                             <pattern id={`grid-${i}`} width="50" height="50" patternUnits="userSpaceOnUse">
                                 <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
                             </pattern>
                         </defs>
                         <rect width="100%" height="100%" fill={`url(#grid-${i})`} />
                         
                         {/* Points */}
                         {puzzle.points.map((p: any, k: number) => {
                             // Dynamic Color Assignment if not present
                             const color = p.color || CONNECT_COLORS[p.pairId % CONNECT_COLORS.length] || '#3B82F6';
                             
                             return (
                                <g key={k} transform={`translate(${p.x * 50 + 25}, ${p.y * 50 + 25})`}>
                                    {/* Outer Glow/Border */}
                                    <circle r="22" fill={color} opacity="0.2" />
                                    <circle r="18" fill="white" stroke={color} strokeWidth="2.5" />
                                    
                                    <text 
                                        y="1" 
                                        textAnchor="middle" 
                                        dominantBaseline="middle" 
                                        fontSize="16"
                                        fontWeight="bold" 
                                        fill="#333"
                                        fontFamily="monospace"
                                    >
                                        {p.label}
                                    </text>
                                </g>
                             );
                         })}
                    </svg>
                </div>
             </div>
        ))}
    </div>
    );
};
