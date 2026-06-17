import React from 'react';
import { MagicPyramidData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const MagicPyramidSheet = ({ data }: { data: MagicPyramidData }) => {
    const theme = data.theme || 'classic';
    
    const themeStyles: Record<string, { bg: string; card: string; apex: string; cell: string; accent: string; icon: string }> = {
        classic: {
            bg: 'bg-white',
            card: 'bg-slate-50/50 border-slate-100',
            apex: 'bg-amber-400 text-amber-900 border-amber-500',
            cell: 'bg-white text-slate-700 border-slate-200',
            accent: 'bg-amber-100 text-amber-800',
            icon: 'fa-arrow-down-1-9'
        },
        forest: {
            bg: 'bg-emerald-50/30',
            card: 'bg-emerald-100/20 border-emerald-200',
            apex: 'bg-emerald-600 text-white border-emerald-700',
            cell: 'bg-white text-emerald-900 border-emerald-100',
            accent: 'bg-emerald-200 text-emerald-900',
            icon: 'fa-tree'
        },
        desert: {
            bg: 'bg-orange-50/30',
            card: 'bg-orange-100/20 border-orange-200',
            apex: 'bg-orange-500 text-white border-orange-600',
            cell: 'bg-white text-orange-900 border-orange-100',
            accent: 'bg-orange-200 text-orange-900',
            icon: 'fa-sun'
        },
        ocean: {
            bg: 'bg-cyan-50/30',
            card: 'bg-cyan-100/20 border-cyan-200',
            apex: 'bg-cyan-600 text-white border-cyan-700',
            cell: 'bg-white text-cyan-900 border-cyan-100',
            accent: 'bg-cyan-200 text-cyan-900',
            icon: 'fa-water'
        }
    };

    const style = themeStyles[theme] || themeStyles.classic;

    return (
        <div className={`w-full flex flex-col gap-6 print:gap-1 p-4 print:p-1 ${style.bg} transition-all duration-300`}>
            <PedagogicalHeader
                title={data.title}
                instruction={data.instruction || "En üstte verilen sayıdan başlayarak, ritmik sayma kurallarına uyarak aşağı doğru ilerleyin."}
                data={data}
            />

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4 print:p-1">
                {data.pyramids.map((pyramid, pIndex) => (
                    <div key={pIndex} className={`flex flex-col items-center rounded-[2rem] p-6 print:p-2 border-2 ${style.card} shadow-sm`}>
                        <div className={`mb-6 print:mb-2 px-4 py-1.5 ${style.accent} rounded-full font-black text-xs flex items-center gap-2 shadow-sm uppercase tracking-wider`}>
                            <i className={`fa-solid ${style.icon}`}></i>
                            {data.instructionPrefix || `${pyramid.step}'er ritmik sayma`}
                        </div>

                        <div className="flex flex-col items-center gap-1 print:gap-0.5" style={{ transform: 'scale(1)', transformOrigin: 'top center' }}>
                            {pyramid.grid.map((row, rIndex) => (
                                <div key={rIndex} className="flex justify-center gap-1 print:gap-0.5">
                                    {row.map((cellValue, cIndex) => {
                                        const isApex = rIndex === 0;
                                        // 6 katmanlıda daireler daha küçük olmalı ki sığsın
                                        const sizeClass = pyramid.layers >= 6 
                                            ? "w-9 h-9 print:w-8 print:h-8 text-sm" 
                                            : "w-11 h-11 print:w-10 print:h-10 text-base";

                                        return (
                                            <div
                                                key={cIndex}
                                                className={`
                                                    ${sizeClass} rounded-full flex items-center justify-center
                                                    font-black shadow-md border-2 transition-all hover:scale-110
                                                    ${isApex ? style.apex : style.cell}
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



