import React from 'react';
import { MagicPyramidData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const MagicPyramidSheet = ({ data }: { data: MagicPyramidData }) => {
    return (
        <div className="w-full flex flex-col gap-6 print:gap-1 p-4 print:p-1">
            <PedagogicalHeader
                title={data.title}
                instruction={data.instruction || "En üstte verilen sayıdan başlayarak, ritmik sayma kurallarına uyarak aşağı doğru ilerleyin."}
                data={data}
            />

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-1 print:p-1">
                {data.pyramids.map((pyramid, pIndex) => (
                    <div key={pIndex} className="flex flex-col items-center bg-slate-50/50 rounded-xl p-4 print:p-1 border border-slate-100">
                        <div className="mb-4 print:mb-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-medium text-xs flex items-center gap-2 shadow-sm">
                            <i className="fa-solid fa-arrow-down-1-9"></i>
                            {data.instructionPrefix || `${pyramid.step}'er ritmik sayma`}
                        </div>

                        <div className="flex flex-col items-center gap-[2px] print:gap-0" style={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
                            {pyramid.grid.map((row, rIndex) => (
                                <div key={rIndex} className="flex justify-center" style={{ gap: '0.25rem' }}>
                                    {row.map((cellValue, cIndex) => {
                                        const isApex = rIndex === 0;
                                        // 6 katmanlıda daireler daha küçük olmalı ki sığsın
                                        const sizeClass = pyramid.layers === 6 
                                            ? "w-10 h-10 print:w-9 print:h-9 text-base" 
                                            : "w-12 h-12 print:w-10 print:h-10 text-lg";

                                        return (
                                            <div
                                                key={cIndex}
                                                className={`
                                                    ${sizeClass} rounded-full flex items-center justify-center
                                                    font-bold shadow-sm border-2
                                                    ${isApex
                                                        ? 'bg-amber-400 text-amber-900 border-amber-500' // Tepe blok
                                                        : 'bg-white text-slate-700 border-slate-200' // Normal blok
                                                    }
                                                `}
                                            >
                                                {cellValue}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};



