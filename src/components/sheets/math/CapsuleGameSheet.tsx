import React from 'react';
import { NumberCapsuleData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const CapsuleGameSheet = ({ data }: { data: NumberCapsuleData }) => {
    // Normalise puzzles structure
    const puzzles = data.puzzles && data.puzzles.length > 0 
        ? data.puzzles 
        : (data.grid ? [{ grid: data.grid, capsules: data.capsules || [], rowTargets: data.rowTargets, colTargets: data.colTargets }] : []);

    // Determine grid layout based on number of puzzles
    let gridColsClass = 'grid-cols-1';
    if (puzzles.length >= 5) {
        gridColsClass = 'grid-cols-2 md:grid-cols-3';
    } else if (puzzles.length >= 2) {
        gridColsClass = 'grid-cols-2';
    }

    return (
        <div className="flex flex-col font-lexend mt-4 print:mt-1 h-full w-full">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} data={data} />

            <div className={`grid ${gridColsClass} gap-6 print:gap-4 mt-6 print:mt-3 mb-4 print:mb-2 flex-1 place-content-center items-center justify-items-center break-inside-avoid`}>
                {puzzles.map((puzzle, pIndex) => (
                    <div key={pIndex} className="flex flex-col items-center scale-90 md:scale-100 print:scale-[0.85] origin-top">
                        <div
                            className="bg-zinc-50 border-4 border-slate-700 p-4 print:p-2 rounded-3xl relative shadow-md"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${puzzle.grid[0]?.length || 4}, 1fr)`,
                                gap: '4px'
                            }}
                        >
                            {/* Headers For Columns */}
                            <div className="col-span-full grid" style={{ gridTemplateColumns: `repeat(${puzzle.grid[0]?.length || 4}, 1fr)`, gap: '4px', marginBottom: '8px' }}>
                                {puzzle.colTargets?.map((target, idx) => (
                                    <div key={`col-${idx}`} className="text-center font-black text-lg md:text-xl text-teal-600 bg-teal-50 py-1.5 md:py-2 rounded-xl border-b-2 border-teal-200">
                                        {target}
                                    </div>
                                ))}
                            </div>

                            {puzzle.grid.map((row, rIndex) => (
                                <React.Fragment key={rIndex}>
                                    {row.map((_, cIndex) => {
                                        // Find if this cell is part of a capsule
                                        const capsule = puzzle.capsules?.find((cap) => cap.cells.some((c) => c.y === rIndex && c.x === cIndex));
                                        const isFirstInCapsule = capsule?.cells[0].y === rIndex && capsule?.cells[0].x === cIndex;

                                        const inCapsuleClass = capsule ? 'bg-amber-100/50 border-amber-300' : 'bg-white border-slate-200';

                                        return (
                                            <div
                                                key={`${rIndex}-${cIndex}`}
                                                className={`relative w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 border-2 rounded-xl flex items-center justify-center shadow-sm ${inCapsuleClass}`}
                                            >
                                                <EditableText value="" tag="span" className="text-2xl md:text-3xl font-black text-slate-800" />
                                                {isFirstInCapsule && (
                                                    <div className="absolute -top-3 -left-2 bg-indigo-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10 border border-indigo-700">
                                                        {capsule.target}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {/* Row Target on the Right */}
                                    <div className="flex items-center justify-center font-black text-lg md:text-xl text-indigo-600 bg-indigo-50 px-2 md:px-4 print:px-2 rounded-xl border-l-2 border-indigo-200 ml-1 md:ml-2">
                                        {puzzle.rowTargets?.[rIndex]}
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                        {puzzles.length > 1 && (
                            <div className="mt-3 font-bold text-slate-400 text-sm">Bulmaca #{pIndex + 1}</div>
                        )}
                    </div>
                ))}
            </div>

            {puzzles.length > 0 && (
                <div className="mt-auto print:mt-4 flex gap-3 text-xs md:text-sm font-medium text-slate-500 bg-slate-50 px-4 md:px-6 print:px-3 py-2 md:py-3 rounded-2xl border border-slate-200 w-full mb-4">
                    <i className="fa-solid fa-circle-info text-indigo-400 mt-0.5 md:mt-1"></i>
                    <p>Satırdaki ve sütundaki sayıların toplamı mavi kutuları; kapsül (sarı) içindeki sayıların toplamı ise kapsülün sol üstündeki sayıyı vermelidir.</p>
                </div>
            )}
        </div>
    );
};

