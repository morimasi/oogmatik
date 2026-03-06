import React from 'react';
import { AbcConnectData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const AbcConnectSheet: React.FC<{ data: AbcConnectData }> = ({ data }) => {
    return (
        <div className="w-full flex flex-col gap-6 p-4">
            <PedagogicalHeader
                title={data.title}
                instruction={data.instruction || "Verilen Romen rakamlarını doğal sayılarla çizgiler kullanarak birbirlerinin yolunu kesmeden eşleştirin."}
                data={data}
            />

            <div className="flex-1 flex items-center justify-center">
                <div
                    className="relative bg-white border-2 border-slate-700/30 rounded-2xl shadow-sm p-4"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${data.gridDim}, minmax(0, 1fr))`,
                        gap: '2px',
                        width: '100%',
                        maxWidth: '500px',
                        aspectRatio: '1/1'
                    }}
                >
                    {/* Arka Plan Noktaları (Kılavuz Izgara) */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(circle, #cbd5e1 2px, transparent 2.5px)',
                        backgroundSize: `${100 / data.gridDim}% ${100 / data.gridDim}%`,
                        backgroundPosition: 'center center'
                    }} />

                    {/* Hücreler ve İçerikler */}
                    {Array.from({ length: data.gridDim * data.gridDim }).map((_, index) => {
                        const x = index % data.gridDim;
                        const y = Math.floor(index / data.gridDim);

                        // Bu hücrede bir başlangıç veya bitiş noktası var mı?
                        const startPath = data.paths.find(p => p.start.x === x && p.start.y === y);
                        const endPath = data.paths.find(p => p.end.x === x && p.end.y === y);

                        const content = startPath ? startPath.value : (endPath ? endPath.matchValue : null);
                        const isStart = !!startPath;
                        const colorClass = isStart ? 'text-blue-600 font-bold' : 'text-slate-800 font-bold font-serif';

                        return (
                            <div key={index} className="relative flex items-center justify-center z-10 w-full h-full">
                                {content ? (
                                    <div className={`w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center text-lg md:text-2xl shadow-sm border border-slate-200 ${colorClass}`}>
                                        {content}
                                    </div>
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Referans Kartı */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center text-sm text-slate-600 mt-4">
                <div className="flex gap-4">
                    <span><strong className="text-blue-500">I</strong> = 1</span>
                    <span><strong className="text-blue-500">V</strong> = 5</span>
                    <span><strong className="text-blue-500">X</strong> = 10</span>
                </div>
                <div className="flex gap-2 text-xs italic">
                    <i className="fa-solid fa-circle-exclamation text-amber-500 mt-1"></i>
                    Yollar çapraz gidemez ve birbirini kesemez!
                </div>
            </div>
        </div>
    );
};
