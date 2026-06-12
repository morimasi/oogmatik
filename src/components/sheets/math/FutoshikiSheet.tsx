
import React from 'react';
import { FutoshikiData } from '../../../types';
import { PedagogicalHeader } from '../common';

// Premium SVG Arrows for cleaner look - Larger and more bold
const GreaterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-800 print:text-black">
        <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const LessIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-800 print:text-black">
        <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-800 print:text-black">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const UpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-800 print:text-black">
        <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const FutoshikiSheet = ({ data }: { data: FutoshikiData }) => {
    const puzzles = data?.puzzles || [];
    const firstSize = puzzles[0]?.size || 4;
    
    // Auto-compact logic: if puzzles are many, use tighter grid
    const gridCols = firstSize > 4 ? 'grid-cols-1' : (puzzles.length > 2 ? 'grid-cols-2' : 'grid-cols-1');

    return (
        <div className="flex flex-col font-lexend mt-4 print:mt-0 px-2 print:px-0">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} data={data} />
            
            <div className={`grid ${gridCols} gap-8 print:gap-6 mt-6 print:mt-4 items-start`}>
                {puzzles.map((p, i: number) => (
                    <div key={i} className="flex flex-col items-center break-inside-avoid bg-zinc-50/50 print:bg-white p-4 print:p-2 rounded-[2rem] border border-zinc-200/50 print:border-zinc-300">
                        <div className="flex items-center gap-3 mb-4 print:mb-2">
                             <div className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[10px] font-black">
                                {i + 1}
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                                {p.size}x{p.size} FUTOSHİKİ IZGARA
                            </span>
                        </div>

                        <div
                            className="bg-white p-6 print:p-2 rounded-[1.5rem] border-2 border-zinc-200 print:border-zinc-400 relative shadow-sm"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${p.size * 2 - 1}, auto)`,
                                gap: '2px',
                                alignItems: 'center',
                                justifyItems: 'center'
                            }}
                        >
                            {Array.from({ length: p.size * 2 - 1 }).map((_, rIdx) => {
                                const isNumberRow = rIdx % 2 === 0;
                                const gridRow = Math.floor(rIdx / 2);

                                return Array.from({ length: p.size * 2 - 1 }).map((_, cIdx) => {
                                    const isNumberCol = cIdx % 2 === 0;
                                    const gridCol = Math.floor(cIdx / 2);

                                    // Kutu (Hücre) - HIGH CONTRAST & MINIMAL
                                    if (isNumberRow && isNumberCol) {
                                        const val = p.grid?.[gridRow]?.[gridCol];
                                        const cellSize = p.size > 5 ? 'w-10 h-10 text-xl' : 'w-14 h-14 text-2xl';
                                        return (
                                            <div
                                                key={`${rIdx}-${cIdx}`}
                                                className={`${cellSize} bg-white border-[2.5px] border-zinc-800 print:border-black rounded-xl flex items-center justify-center font-black text-zinc-900 shadow-sm`}
                                            >
                                                {val || ''}
                                            </div>
                                        );
                                    }

                                    // Yatay sembol (< veya >)
                                    if (isNumberRow && !isNumberCol) {
                                        const constraint = (p.constraints as any[])?.find(c => c.r1 === gridRow && Math.min(c.c1, c.c2) === gridCol && c.r1 === c.r2);
                                        if (constraint) {
                                            const isGreater = (constraint.c1 < constraint.c2 && constraint.type === 'greater') ||
                                                (constraint.c1 > constraint.c2 && constraint.type === 'less');
                                            return <div key={`${rIdx}-${cIdx}`} className="px-1">{isGreater ? <GreaterIcon /> : <LessIcon />}</div>;
                                        }
                                        return <div key={`${rIdx}-${cIdx}`} className="w-5"></div>;
                                    }

                                    // Dikey sembol (^ veya v)
                                    if (!isNumberRow && isNumberCol) {
                                        const constraint = (p.constraints as any[])?.find(c => Math.min(c.r1, c.r2) === gridRow && c.c1 === gridCol && c.c1 === c.c2);
                                        if (constraint) {
                                            const isDown = (constraint.r1 < constraint.r2 && constraint.type === 'greater') ||
                                                (constraint.r1 > constraint.r2 && constraint.type === 'less');
                                            return <div key={`${rIdx}-${cIdx}`} className="py-1">{isDown ? <DownIcon /> : <UpIcon />}</div>;
                                        }
                                        return <div key={`${rIdx}-${cIdx}`} className="h-5"></div>;
                                    }

                                    return <div key={`${rIdx}-${cIdx}`} className="w-4 h-4"></div>;
                                });
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};



