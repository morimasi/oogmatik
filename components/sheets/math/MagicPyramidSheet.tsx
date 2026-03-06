import React from 'react';
import { MagicPyramidData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const MagicPyramidSheet: React.FC<{ data: MagicPyramidData }> = ({ data }) => {
    return (
        <div className="w-full flex flex-col gap-8 p-4">
            <PedagogicalHeader
                title={data.title}
                instruction={data.instruction || "En üstte verilen sayıdan başlayarak, yukarıdan aşağıya doğru ritmik sayma kurallarına uyarak ilerleyin. Her satırda sadece 1 hücre seçmelisiniz."}
                data={data}
            />

            {data.pyramids.map((pyramid, pIndex) => (
                <div key={pIndex} className="flex flex-col items-center bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                    <div className="mb-6 px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-medium text-sm flex items-center gap-2 shadow-sm">
                        <i className="fa-solid fa-arrow-down-1-9"></i>
                        {data.instructionPrefix || `${pyramid.step}'er ritmik sayma`}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        {pyramid.grid.map((row, rIndex) => (
                            <div key={rIndex} className="flex justify-center" style={{ gap: '0.5rem' }}>
                                {row.map((cellValue, cIndex) => {
                                    // Tepedeki ilk eleman belirgin olmalı
                                    const isApex = rIndex === 0;
                                    return (
                                        <div
                                            key={cIndex}
                                            className={`
                                                w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center
                                                text-xl md:text-2xl font-bold shadow-sm border-2
                                                ${isApex
                                                    ? 'bg-amber-400 text-amber-900 border-amber-500' // Tepe blok
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400' // Normal blok
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
    );
};
