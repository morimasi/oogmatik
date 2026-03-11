import React from 'react';
import { NumberCapsuleData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const CapsuleGameSheet = ({ data }: { data: NumberCapsuleData }) => {
    return (
        <div className="flex flex-col font-lexend mt-8 print:mt-2">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} data={data} />

            <div className="flex justify-center mt-12 print:mt-3 mb-8 print:mb-2 break-inside-avoid">
                <div className="flex flex-col items-center">
                    <div
                        className="bg-zinc-50 border-4 border-slate-700 p-6 print:p-2 rounded-3xl relative shadow-md"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${data.grid[0]?.length || 4}, 1fr)`,
                            gap: '4px'
                        }}
                    >
                        {/* Headers For Columns */}
                        <div className="col-span-full grid" style={{ gridTemplateColumns: `repeat(${data.grid[0]?.length || 4}, 1fr)`, gap: '4px', marginBottom: '8px' }}>
                            {data.colTargets?.map((target, idx) => (
                                <div key={`col-${idx}`} className="text-center font-black text-xl text-teal-600 bg-teal-50 py-2 rounded-xl border-b-2 border-teal-200">
                                    {target}
                                </div>
                            ))}
                        </div>

                        {data.grid.map((row, rIndex) => (
                            <React.Fragment key={rIndex}>
                                {row.map((_, cIndex) => {
                                    // Find if this cell is part of a capsule
                                    const capsule = data.capsules?.find((cap) => cap.cells.some((c) => c.y === rIndex && c.x === cIndex));
                                    const isFirstInCapsule = capsule?.cells[0].y === rIndex && capsule?.cells[0].x === cIndex;

                                    // Determine capsule shape logic (horizontal or vertical merge visuals loosely mapped via CSS)
                                    // Normally we would use precise absolute positioning for capsules, but grid item styling is safer for now.
                                    const inCapsuleClass = capsule ? 'bg-amber-100/50 border-amber-300' : 'bg-white border-slate-200';

                                    return (
                                        <div
                                            key={`${rIndex}-${cIndex}`}
                                            className={`relative w-16 h-16 md:w-20 md:h-20 border-2 rounded-xl flex items-center justify-center shadow-sm ${inCapsuleClass}`}
                                        >
                                            <EditableText value="" tag="span" className="text-3xl font-black text-slate-800" />
                                            {isFirstInCapsule && (
                                                <div className="absolute -top-3 -left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 border border-indigo-700">
                                                    {capsule.target}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {/* Row Target on the Right */}
                                <div className="flex items-center justify-center font-black text-xl text-indigo-600 bg-indigo-50 px-4 print:px-1 rounded-xl border-l-2 border-indigo-200 ml-2">
                                    {data.rowTargets?.[rIndex]}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="mt-8 print:mt-2 flex gap-3 text-sm font-medium text-slate-500 bg-slate-50 px-6 print:px-2 py-3 rounded-2xl border border-slate-200">
                        <i className="fa-solid fa-circle-info text-indigo-400 mt-1"></i>
                        <p>Satırdaki ve sütundaki sayıların toplamı mavi kutuları; kapsül (sarı) içindeki sayıların toplamı ise kapsülün sol üstündeki sayıyı vermelidir.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

