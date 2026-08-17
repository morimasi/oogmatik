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
        <div className={`w-full flex flex-col gap-4 print:gap-1 p-3 print:p-0.5 ${style.bg} transition-all duration-300`}>
            <PedagogicalHeader
                title={data.title}
                instruction={data.instruction || "En üstte verilen sayıdan başlayarak, kurallara uyarak aşağı doğru ilerleyin."}
                data={data}
            />

            <div className={`w-full grid ${data.pyramids.length >= 6 ? 'grid-cols-2 md:grid-cols-3 print:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 print:grid-cols-2'} gap-4 print:gap-2 print:p-0.5`}>
                {data.pyramids.map((pyramid, pIndex) => (
                    <div key={pIndex} className={`flex flex-col items-center rounded-2xl p-4 print:p-1.5 border-2 ${style.card} shadow-sm relative overflow-hidden`}>
                        <div className={`mb-3 print:mb-1 px-3 py-1 ${style.accent} rounded-full font-black text-[10px] flex items-center gap-1.5 shadow-sm uppercase tracking-wider`}>
                            <i className={`fa-solid ${style.icon}`}></i>
                            {data.instructionPrefix || `${pyramid.step}'er ritmik sayma`}
                        </div>

                        <div className="flex flex-col items-center gap-1 print:gap-0.5 w-full justify-center">
                            {pyramid.grid.map((row, rIndex) => (
                                <div key={rIndex} className="flex justify-center gap-1 print:gap-0.5 w-full">
                                    {row.map((cellValue, cIndex) => {
                                        const isApex = rIndex === 0;
                                        const isHint = pyramid.hints?.some(h => h.row === rIndex && h.col === cIndex);
                                        // Katman sayısına ve kompakt moda göre hücre boyutlarını otomatik ölçeklendir
                                        const sizeClass = pyramid.layers >= 6
                                            ? "w-8 h-8 print:w-7 print:h-7 text-xs"
                                            : (data.pyramids.length >= 6 ? "w-9 h-9 print:w-7.5 print:h-7.5 text-xs" : "w-10 h-10 print:w-9 print:h-9 text-sm");

                                        return (
                                            <div
                                                key={cIndex}
                                                className={`
                                                    ${sizeClass} rounded-full flex items-center justify-center
                                                    font-black shadow-sm border-2 transition-all
                                                    ${isApex ? style.apex : (isHint ? 'bg-amber-100 text-amber-900 border-amber-400 font-black ring-2 ring-amber-300/50' : style.cell)}
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



