
import React from 'react';
import { FutoshikiData } from '../../../types';
import { PedagogicalHeader } from '../common';

// Premium SVG Arrows for cleaner look
const GreaterIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-500 drop-shadow-sm">
        <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const LessIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-500 drop-shadow-sm">
        <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DownIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-500 drop-shadow-sm">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const UpIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-500 drop-shadow-sm">
        <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const FutoshikiSheet = ({ data }: { data: FutoshikiData }) => {
    const puzzles = data?.puzzles || [];
    // If size is large (>= 6), use col-1, otherwise grid-2 possible
    const firstSize = puzzles[0]?.size || 4;
    const gridCols = firstSize > 5 ? 'grid-cols-1' : (puzzles.length > 1 ? 'grid-cols-2' : 'grid-cols-1');

    return (
        <div className="flex flex-col font-lexend mt-8">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} data={data} />
            <div className={`grid ${gridCols} gap-12 mt-12 mb-8 items-start`}>
                {puzzles.map((p, i: number) => (
                    <div key={i} className="flex flex-col items-center break-inside-avoid">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-6 bg-indigo-50 px-4 py-1.5 rounded-2xl border border-indigo-100 shadow-sm">
                            SEVİYE #{i + 1} • {p.size}x{p.size} IZGARA
                        </span>

                        <div
                            className="bg-white/40 backdrop-blur-md p-8 rounded-[3rem] border-4 border-slate-100 relative shadow-xl"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${p.size * 2 - 1}, auto)`,
                                gap: p.size > 5 ? '2px' : '4px',
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

                                    // Kutu (Hücre) - GLASSMORPHISM STYLE
                                    if (isNumberRow && isNumberCol) {
                                        const val = p.grid?.[gridRow]?.[gridCol];
                                        const cellSize = p.size > 5 ? 'w-12 h-12 text-2xl' : 'w-16 h-16 text-3xl';
                                        return (
                                            <div
                                                key={`${rIdx}-${cIdx}`}
                                                className={`${cellSize} bg-gradient-to-br from-white to-slate-50 border-[3px] border-slate-200 shadow-lg rounded-[1.2rem] flex items-center justify-center font-black text-slate-800 transition-all hover:scale-105 hover:border-indigo-300`}
                                            >
                                                {val || ''}
                                            </div>
                                        );
                                    }

                                    // Yatay sembol (< veya >)
                                    if (isNumberRow && !isNumberCol) {
                                        const constraint = p.constraints?.find((c: { r1: number, c1: number, c2: number, r2: number, type: string }) => c.r1 === gridRow && Math.min(c.c1, c.c2) === gridCol && c.r1 === c.r2);
                                        if (constraint) {
                                            const isGreater = (constraint.c1 < constraint.c2 && constraint.type === 'greater') ||
                                                (constraint.c1 > constraint.c2 && constraint.type === 'less');
                                            return <div key={`${rIdx}-${cIdx}`} className="px-1 transform scale-90">{isGreater ? <GreaterIcon /> : <LessIcon />}</div>;
                                        }
                                        return <div key={`${rIdx}-${cIdx}`} className="w-6"></div>;
                                    }

                                    // Dikey sembol (^ veya v)
                                    if (!isNumberRow && isNumberCol) {
                                        const constraint = p.constraints?.find((c: { r1: number, c1: number, c2: number, r2: number, type: string }) => Math.min(c.r1, c.r2) === gridRow && c.c1 === gridCol && c.c1 === c.c2);
                                        if (constraint) {
                                            const isDown = (constraint.r1 < constraint.r2 && constraint.type === 'greater') ||
                                                (constraint.r1 > constraint.r2 && constraint.type === 'less');
                                            return <div key={`${rIdx}-${cIdx}`} className="py-1 transform scale-90">{isDown ? <DownIcon /> : <UpIcon />}</div>;
                                        }
                                        return <div key={`${rIdx}-${cIdx}`} className="h-6"></div>;
                                    }

                                    // Çapraz boşluk (spacer)
                                    return <div key={`${rIdx}-${cIdx}`} className="w-6 h-6"></div>;
                                });
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
