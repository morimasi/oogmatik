import React from 'react';
import { OddEvenSudokuData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const OddEvenSudokuSheet = ({ data }: { data: OddEvenSudokuData }) => {
    const settings = (data as any).settings || {};
    const aestheticMode = settings.aestheticMode || 'standard';
    const showPositionNumbers = settings.showPositionNumbers ?? true;

    const themeStyles: Record<string, { bg: string; gridBorder: string; accentOdd: string; accentEven: string; textColor: string }> = {
        standard: {
            bg: 'bg-white',
            gridBorder: 'border-slate-700 bg-slate-700',
            accentOdd: 'bg-emerald-100/80',
            accentEven: 'bg-sky-100/80',
            textColor: 'text-slate-800'
        },
        premium: {
            bg: 'bg-slate-50',
            gridBorder: 'border-indigo-900 bg-indigo-900',
            accentOdd: 'bg-emerald-200/90',
            accentEven: 'bg-blue-200/90',
            textColor: 'text-indigo-950'
        },
        'high-contrast': {
            bg: 'bg-white',
            gridBorder: 'border-black bg-black',
            accentOdd: 'bg-zinc-200',
            accentEven: 'bg-zinc-100',
            textColor: 'text-black'
        }
    };

    const style = themeStyles[aestheticMode] || themeStyles.standard;

    return (
        <div className={`w-full flex flex-col gap-4 print:gap-1 p-4 print:p-1 ${style.bg} min-h-screen transition-colors duration-300`}>
            <PedagogicalHeader
                title={data.title}
                instruction={data.instruction || "Yeşil kutulara SADECE TEK sayılar, Mavi kutulara SADECE ÇİFT sayılar gelmelidir."}
                data={data}
            />

            <div className="w-full grid grid-cols-2 gap-8 print:gap-4 print:gap-y-6 print:p-1 justify-items-center">
                {data.puzzles?.map((puzzle, pIndex) => {
                    const boxSizeR = puzzle.size === 6 ? 2 : (puzzle.size === 9 ? 3 : 2);
                    const boxSizeC = puzzle.size === 6 ? 3 : (puzzle.size === 9 ? 3 : 2);

                    return (
                        <div key={pIndex} className="flex flex-col items-center w-full max-w-[320px] print:max-w-[280px]">
                            <div className="w-full flex justify-between items-center mb-2 px-1">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Puzzle #{pIndex + 1}</span>
                                <span className="text-[10px] font-bold text-slate-400">{puzzle.size}x{puzzle.size}</span>
                            </div>
                            
                            <div className="relative w-full">
                                {showPositionNumbers && (
                                    <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around py-2">
                                        {Array.from({ length: puzzle.size }).map((_, i) => (
                                            <span key={i} className="text-[8px] font-bold text-slate-300">{i + 1}</span>
                                        ))}
                                    </div>
                                )}
                                {showPositionNumbers && (
                                    <div className="absolute -top-5 left-0 right-0 flex justify-around px-2">
                                        {Array.from({ length: puzzle.size }).map((_, i) => (
                                            <span key={i} className="text-[8px] font-bold text-slate-300">{String.fromCharCode(65 + i)}</span>
                                        ))}
                                    </div>
                                )}

                                <div
                                    className={`border-[4px] ${style.gridBorder} gap-[1px] shadow-xl w-full rounded-lg overflow-hidden`}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
                                        aspectRatio: '1/1'
                                    }}
                                >
                                    {puzzle.grid.map((row, rIndex) => (
                                        row.map((cellValue, cIndex) => {
                                            const maskType = puzzle.oddEvenMask[rIndex][cIndex];
                                            let cellBg = 'bg-white';

                                            if (maskType === 'odd') cellBg = style.accentOdd;
                                            if (maskType === 'even') cellBg = style.accentEven;

                                            const borderClasses = [];
                                            if ((cIndex + 1) % boxSizeC === 0 && cIndex !== puzzle.size - 1) borderClasses.push('border-r-[3px] border-r-inherit');
                                            if ((rIndex + 1) % boxSizeR === 0 && rIndex !== puzzle.size - 1) borderClasses.push('border-b-[3px] border-b-inherit');

                                            return (
                                                <div
                                                    key={`${rIndex}-${cIndex}`}
                                                    className={`
                                                        ${cellBg} ${borderClasses.join(' ')}
                                                        flex items-center justify-center text-2xl font-black font-lexend
                                                        ${cellValue !== null ? style.textColor : 'text-transparent'}
                                                    `}
                                                >
                                                    {cellValue || <EditableText value="" tag="span" />}
                                                </div>
                                            );
                                        })
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Renk Lejantı */}
            <div className="mt-8 print:mt-4 flex flex-wrap gap-6 print:gap-4 justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-emerald-100 rounded-2xl shadow-sm">
                    <span className="w-4 h-4 rounded-lg bg-emerald-100 border-2 border-emerald-400"></span>
                    <span className="text-xs font-black text-emerald-800 uppercase tracking-tight">TEK SAYILAR</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-sky-100 rounded-2xl shadow-sm">
                    <span className="w-4 h-4 rounded-lg bg-sky-100 border-2 border-sky-400"></span>
                    <span className="text-xs font-black text-sky-800 uppercase tracking-tight">ÇİFT SAYILAR</span>
                </div>
            </div>
        </div>
    );
};



