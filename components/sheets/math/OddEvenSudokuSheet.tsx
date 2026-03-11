import React from 'react';
import { OddEvenSudokuData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const OddEvenSudokuSheet = ({ data }: { data: OddEvenSudokuData }) => {
    return (
        <div className="w-full flex flex-col gap-6 p-4">
            <PedagogicalHeader
                title={data.title}
                instruction={data.instruction || "Yeşil kutulara SADECE TEK sayılar, Mavi kutulara SADECE ÇİFT sayılar gelmelidir."}
                data={data}
            />

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 print:p-3">
                {data.puzzles?.map((puzzle, pIndex) => {
                    const boxSizeR = puzzle.size === 6 ? 2 : 2;
                    const boxSizeC = puzzle.size === 6 ? 3 : 2;

                    return (
                        <div key={pIndex} className="flex flex-col items-center">
                            <h3 className="text-lg font-bold text-slate-700 mb-4 font-serif">Bulmaca {pIndex + 1}</h3>
                            <div
                                className="border-4 border-slate-700 bg-slate-700 gap-[2px] shadow-sm"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
                                    width: '100%',
                                    maxWidth: '350px',
                                    aspectRatio: '1/1'
                                }}
                            >
                                {puzzle.grid.map((row, rIndex) => (
                                    row.map((cellValue, cIndex) => {
                                        const maskType = puzzle.oddEvenMask[rIndex][cIndex];
                                        let bgColor = 'bg-white';

                                        // Tek / Çift renk kısıtlaması
                                        if (maskType === 'odd') bgColor = 'bg-emerald-100/80'; // Tek sayılar yeşil
                                        if (maskType === 'even') bgColor = 'bg-sky-100/80'; // Çift sayılar mavi

                                        // Sudoku kalın bölmeleri (box borders)
                                        const borderClasses = [];
                                        if ((cIndex + 1) % boxSizeC === 0 && cIndex !== puzzle.size - 1) borderClasses.push('border-r-[3px] border-r-slate-700');
                                        if ((rIndex + 1) % boxSizeR === 0 && rIndex !== puzzle.size - 1) borderClasses.push('border-b-[3px] border-b-slate-700');

                                        return (
                                            <div
                                                key={`${rIndex}-${cIndex}`}
                                                className={`
                                                    ${bgColor} ${borderClasses.join(' ')}
                                                    flex items-center justify-center text-2xl font-bold font-serif
                                                    ${cellValue !== null ? 'text-slate-800' : 'text-transparent'}
                                                `}
                                            >
                                                {cellValue || <EditableText value="" tag="span" />}
                                            </div>
                                        );
                                    })
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Renk Lejantı */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300"></span>
                    <span className="text-sm font-medium text-slate-700">Tek Sayı (1, 3, 5...)</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="w-4 h-4 rounded bg-sky-100 border border-sky-300"></span>
                    <span className="text-sm font-medium text-slate-700">Çift Sayı (2, 4, 6...)</span>
                </div>
            </div>
        </div>
    );
};

