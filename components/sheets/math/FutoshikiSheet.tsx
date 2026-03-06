
import React from 'react';
import { FutoshikiData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FutoshikiSheet: React.FC<{ data: FutoshikiData }> = ({ data }) => {
    const puzzles = data?.puzzles || [];
    const gridCols = puzzles.length > 2 ? 'grid-cols-2' : 'grid-cols-1';

    return (
        <div className="flex flex-col font-lexend mt-8">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} data={data} />
            <div className={`grid ${gridCols} gap-16 mt-12 mb-8`}>
                {puzzles.map((p, i) => (
                    <div key={i} className="flex flex-col items-center break-inside-avoid">
                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-cyan-700 mb-6 bg-cyan-50 px-4 py-1 rounded-full border border-cyan-100">BULMACA #{i + 1}</span>

                        <div
                            className="bg-white p-6 rounded-[2.5rem] border-[3px] border-slate-200 relative shadow-md"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${p.size * 2 - 1}, auto)`,
                                gap: '4px',
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

                                    // Kutu (Hücre)
                                    if (isNumberRow && isNumberCol) {
                                        const val = p.grid?.[gridRow]?.[gridCol];
                                        return (
                                            <div
                                                key={`${rIdx}-${cIdx}`}
                                                className="w-14 h-14 md:w-16 md:h-16 bg-zinc-50 border-2 border-zinc-200 shadow-inner rounded-2xl flex items-center justify-center text-3xl font-black text-slate-700"
                                            >
                                                {val || ''}
                                            </div>
                                        );
                                    }

                                    // Yatay sembol (< veya >)
                                    if (isNumberRow && !isNumberCol) {
                                        const constraint = p.constraints?.find(c => c.r1 === gridRow && Math.min(c.c1, c.c2) === gridCol && c.r1 === c.r2);
                                        if (constraint) {
                                            const sym = (constraint.c1 < constraint.c2 && constraint.type === 'greater') ||
                                                (constraint.c1 > constraint.c2 && constraint.type === 'less') ? '>' : '<';
                                            return <div key={`${rIdx}-${cIdx}`} className="text-2xl font-black text-amber-500 px-1">{sym}</div>;
                                        }
                                        return <div key={`${rIdx}-${cIdx}`} className="w-4"></div>;
                                    }

                                    // Dikey sembol (^ veya v simülasyonu)
                                    if (!isNumberRow && isNumberCol) {
                                        const constraint = p.constraints?.find(c => Math.min(c.r1, c.r2) === gridRow && c.c1 === gridCol && c.c1 === c.c2);
                                        if (constraint) {
                                            const sym = (constraint.r1 < constraint.r2 && constraint.type === 'greater') ||
                                                (constraint.r1 > constraint.r2 && constraint.type === 'less') ? 'v' : '^';
                                            return <div key={`${rIdx}-${cIdx}`} className="text-2xl font-black text-amber-500 py-1">{sym}</div>;
                                        }
                                        return <div key={`${rIdx}-${cIdx}`} className="h-4"></div>;
                                    }

                                    // Çapraz boşluk
                                    return <div key={`${rIdx}-${cIdx}`}></div>;
                                });
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
