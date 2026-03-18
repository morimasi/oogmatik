
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
        <div className="grid grid-cols-3 gap-1 w-8 h-8 md:w-10 md:h-10 p-1.5 bg-slate-100 rounded-lg shadow-inner border border-slate-200">
            {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`flex items-center justify-center`}>
                    {dots.includes(i) && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-700 rounded-full" />}
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

            <div className="flex-1 flex items-center justify-center mt-10 print:mt-3">
                <div
                    className="relative bg-white/50 backdrop-blur-sm border-[4px] border-slate-200 rounded-[2.5rem] shadow-xl p-8 print:p-2 print:p-3"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridDim}, minmax(0, 1fr))`,
                        gap: gridDim > 6 ? '8px' : '16px',
                        width: '100%',
                        maxWidth: '600px',
                        aspectRatio: '1/1'
                    }}
                >
                    {/* Background Dot Grid */}
                    <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                        backgroundImage: 'radial-gradient(circle, #64748b 2px, transparent 2.5px)',
                        backgroundSize: `${100 / gridDim}% ${100 / gridDim}%`,
                        backgroundPosition: 'center center'
                    }} />

                    {Array.from({ length: gridDim * gridDim }).map((_, index) => {
                        const x = index % gridDim;
                        const y = Math.floor(index / gridDim);

                        const startPath = paths.find((p) => p.start.x === x && p.start.y === y);
                        const endPath = paths.find((p) => p.end.x === x && p.end.y === y);

                        const isStart = !!startPath;
                        const isEnd = !!endPath;
                        const path = startPath || endPath;

                        if (!path) {
                            return (
                                <div key={index} className="flex items-center justify-center opacity-40">
                                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                                </div>
                            );
                        }

                        const content = isStart ? path.value : path.matchValue;
                        const isDots = typeof content === 'string' && content.startsWith('dots-');
                        const displayValue = isDots ? parseInt(content.split('-')[1]) : content;

                        return (
                            <div key={index} className="relative flex items-center justify-center z-10 transition-transform hover:scale-110">
                                <div className={`
                                    w-12 h-12 md:w-16 md:h-16 
                                    ${isStart ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200' : 'bg-white text-slate-800 shadow-slate-100'} 
                                    rounded-2xl flex items-center justify-center 
                                    text-xl md:text-2xl font-black 
                                    shadow-lg border-2 
                                    ${isStart ? 'border-blue-400' : 'border-slate-200'}
                                `}>
                                    {isDots ? (
                                        <DieDots value={displayValue as number} />
                                    ) : (
                                        displayValue
                                    )}
                                </div>
                                <div className="absolute -top-2 -right-2 bg-amber-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white shadow-sm">
                                    {path.id.split('-')[1]}
                                </div>
                            </div>
                        );
                    })}
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


