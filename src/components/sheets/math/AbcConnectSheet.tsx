
import React from 'react';
import { AbcConnectData } from '../../../types';
import { PedagogicalHeader } from '../common';

// Helper for rendering die dots
// Helper for rendering die dots
const DieDots = ({ value }: { value: number }) => {
    const dotPositions: Record<number, number[]> = {
        1: [4],
        2: [0, 8],
        3: [0, 4, 8],
        4: [0, 2, 6, 8],
        5: [0, 2, 4, 6, 8],
        6: [0, 2, 3, 5, 6, 8],
        7: [0, 2, 3, 4, 5, 6, 8],
        8: [0, 1, 2, 3, 5, 6, 7, 8],
        9: [0, 1, 2, 3, 4, 5, 6, 7, 8]
    };

    const dots = dotPositions[value % 10] || [4];

    return (
        <div className="grid grid-cols-3 gap-0.5 w-[80%] h-[80%] p-1 bg-slate-100 rounded-lg shadow-inner border border-slate-200">
            {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`flex items-center justify-center`}>
                    {dots.includes(i) && <div className="w-[60%] h-[60%] bg-slate-700 rounded-full" />}
                </div>
            ))}
        </div>
    );
};

export const AbcConnectSheet = ({ data }: { data: AbcConnectData }) => {
    const { gridDim, paths, variant } = data;

    return (
        <div className="w-full flex flex-col gap-6 print:gap-2 font-lexend mt-8 print:mt-2">
            <PedagogicalHeader
                title={data.title}
                instruction={data.instruction}
                data={data}
            />

            <div className="flex-1 flex items-center justify-center mt-10 print:mt-3 px-4">
                <div className="relative bg-white/50 backdrop-blur-sm border-[4px] border-slate-200 rounded-[2.5rem] shadow-xl p-6 print:p-4 w-full max-w-[600px]">
                    
                    <div 
                        className="w-full aspect-square border-t-[3px] border-l-[3px] border-slate-300"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${gridDim}, 1fr)`,
                            gridTemplateRows: `repeat(${gridDim}, 1fr)`,
                        }}
                    >
                        {Array.from({ length: gridDim * gridDim }).map((_, index) => {
                            const x = index % gridDim;
                            const y = Math.floor(index / gridDim);

                            const startPath = paths.find((p) => p.start.x === x && p.start.y === y);
                            const endPath = paths.find((p) => p.end.x === x && p.end.y === y);

                            const isStart = !!startPath;
                            const path = startPath || endPath;

                            return (
                                <div 
                                    key={index} 
                                    className="relative border-b-[3px] border-r-[3px] border-slate-300 flex items-center justify-center"
                                >
                                    {!path ? (
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 opacity-40" />
                                    ) : (
                                        <div className="relative z-10 transition-transform hover:scale-110 flex items-center justify-center w-full h-full">
                                            <div className={`
                                                w-[80%] h-[80%] max-w-[64px] max-h-[64px] min-w-[32px] min-h-[32px]
                                                ${isStart ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-800 shadow-sm'} 
                                                rounded-2xl flex items-center justify-center 
                                                text-lg sm:text-xl md:text-2xl font-black 
                                                border-2 
                                                ${isStart ? 'border-blue-400' : 'border-slate-200'}
                                            `}>
                                                {(() => {
                                                    const content = isStart ? path.value : path.matchValue;
                                                    const isDots = typeof content === 'string' && content.startsWith('dots-');
                                                    const displayValue = isDots ? parseInt(content.split('-')[1]) : content;
                                                    
                                                    return isDots ? (
                                                        <DieDots value={displayValue as number} />
                                                    ) : (
                                                        <span>{displayValue}</span>
                                                    );
                                                })()}
                                            </div>
                                            <div className="absolute top-[2%] right-[2%] bg-amber-400 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs text-white font-black border-2 border-white shadow-sm z-20">
                                                {path.id.split('-')[1]}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Premium Info Panel */}
            <div className="mt-12 print:mt-3 p-6 print:p-2 bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200 rounded-[1.5rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 print:gap-1">
                <div className="flex flex-wrap gap-4 print:gap-1 items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Klavuz:</span>
                    {variant === 'roman' && (
                        <div className="flex gap-4 print:gap-1 text-sm font-black text-slate-600">
                            <span className="bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">I = 1</span>
                            <span className="bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">V = 5</span>
                            <span className="bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">X = 10</span>
                        </div>
                    )}
                    {variant === 'case' && (
                        <div className="flex gap-2 text-sm text-slate-600 italic">
                            Örn: A ↔ a, B ↔ b ...
                        </div>
                    )}
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-500 max-w-xs">
                    <i className="fa-solid fa-wand-magic-sparkles text-amber-500 mt-0.5" />
                    <p>Yolları yatay veya dikey çizerek aynı numaralı sembolleri birbirine bağla. Yollar asla kesişmemeli!</p>
                </div>
            </div>
        </div>
    );
};


