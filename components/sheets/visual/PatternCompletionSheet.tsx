import React from 'react';
import { PatternCompletionData, PatternCell } from '../../../types/visual';
import { ShapeType } from '../../../types/core';

interface Props {
    data: PatternCompletionData;
}

export const PatternCompletionSheet: React.FC<Props> = ({ data }) => {
    const gridSize = data.settings?.gridSize || 3;
    const patternType = data.settings?.patternType || 'geometric';
    const matrix = data.content?.matrix || [];
    const options = data.content?.options || [];

    const renderShape = (type: ShapeType, color: string) => {
        switch (type) {
            case 'circle': return <circle cx="50" cy="50" r="40" fill={color} stroke="black" strokeWidth="2" />;
            case 'square': return <rect x="15" y="15" width="70" height="70" fill={color} stroke="black" strokeWidth="2" rx="5" />;
            case 'triangle': return <polygon points="50,15 85,85 15,85" fill={color} stroke="black" strokeWidth="2" strokeLinejoin="round" />;
            case 'diamond': return <polygon points="50,10 90,50 50,90 10,50" fill={color} stroke="black" strokeWidth="2" strokeLinejoin="round" />;
            case 'hexagon': return <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill={color} stroke="black" strokeWidth="2" strokeLinejoin="round" />;
            case 'star': return <polygon points="50,10 61,35 88,35 66,51 75,76 50,60 25,76 34,51 12,35 39,35" fill={color} stroke="black" strokeWidth="2" strokeLinejoin="round" />;
            default: return <circle cx="50" cy="50" r="40" fill={color} />; // Fallback
        }
    };

    const renderCellContent = (cell: PatternCell) => {
        if (cell.isMissing) {
<<<<<<< HEAD
            return <div className="w-full h-full  flex flex-col items-center justify-center bg-zinc-100 rounded-xl border-4 border-dashed border-zinc-300 text-5xl text-zinc-300"><i className="fa-solid fa-question"></i></div>;
=======
            return <div className="w-full h-full print:h-0 flex flex-col items-center justify-center bg-zinc-100 rounded-xl border-4 border-dashed border-zinc-300 text-5xl text-zinc-300"><i className="fa-solid fa-question"></i></div>;
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
        }

        if (patternType === 'geometric' && cell.shapes) {
            return (
<<<<<<< HEAD
                <div className="w-full h-full  flex items-center justify-center p-2 relative bg-white border-2 border-slate-200 rounded-xl shadow-sm">
                    <svg viewBox="0 0 100 100" className="w-full h-full  max-w-[80%] max-h-[80%] overflow-visible drop-shadow-sm">
=======
                <div className="w-full h-full print:h-0 flex items-center justify-center p-2 relative bg-white border-2 border-slate-200 rounded-xl shadow-sm">
                    <svg viewBox="0 0 100 100" className="w-full h-full print:h-0 max-w-[80%] max-h-[80%] overflow-visible drop-shadow-sm">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                        {cell.shapes.map((shape, i) => (
                            <g key={i} style={{ transformOrigin: '50% 50%', transform: `rotate(${shape.rotation || 0}deg)` }}>
                                {renderShape(shape.type, shape.color)}
                            </g>
                        ))}
                    </svg>
                </div >
            );
        }

        if (patternType === 'color_blocks') {
            return (
                <div
<<<<<<< HEAD
                    className="w-full h-full  rounded-xl border-4 border-slate-800 shadow-[2px_2px_0px_#1e293b]"
=======
                    className="w-full h-full print:h-0 rounded-xl border-4 border-slate-800 shadow-[2px_2px_0px_#1e293b]"
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                    style={{ backgroundColor: cell.color || '#fff' }}
                ></div>
            );
        }

        if (patternType === 'logic_sequence') {
            return (
<<<<<<< HEAD
                <div className="w-full h-full  flex items-center justify-center bg-blue-50 border-4 border-blue-900 rounded-xl shadow-[4px_4px_0px_#1e3a8a]">
=======
                <div className="w-full h-full print:h-0 flex items-center justify-center bg-blue-50 border-4 border-blue-900 rounded-xl shadow-[4px_4px_0px_#1e3a8a]">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                    <span className="text-4xl lg:text-5xl font-black text-blue-900">{cell.content}</span>
                </div>
            );
        }

<<<<<<< HEAD
        return <div className="w-full h-full  bg-slate-100 rounded-xl border-2 border-slate-300"></div>;
    };

    return (
        <div className="w-full h-full  p-8 print:p-2 print:p-3 flex flex-col bg-white overflow-hidden text-zinc-900 print:p-0 print:border-none border border-zinc-200">
=======
        return <div className="w-full h-full print:h-0 bg-slate-100 rounded-xl border-2 border-slate-300"></div>;
    };

    return (
        <div className="w-full h-full print:h-0 p-8 print:p-2 print:p-3 flex flex-col bg-white overflow-hidden text-zinc-900 print:p-0 print:border-none border border-zinc-200">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
            {/* BAŞLIK */}
            <div className="flex justify-between items-center border-b-4 border-sky-500 pb-4 print:pb-1 mb-8 print:mb-2">
                <div>
                    <h1 className="text-4xl font-black text-sky-900 tracking-tighter uppercase">{data.content?.title || "Kafayı Çalıştır!"}</h1>
                    <p className="text-sm font-bold text-sky-600 mt-1 uppercase tracking-widest">{data.content?.instruction || "Eksik parçayı bul ve işaretle."}</p>
                </div>
                <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-sky-100">
                    <i className="fa-solid fa-puzzle-piece"></i>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 print:gap-3 print:gap-4 print:gap-1 page-break-inside-avoid px-8 print:px-2">

                {/* MATRIX (IZGARA) ALANI */}
                <div className="w-full lg:w-1/2 max-w-[400px] aspect-square bg-slate-50 border-8 border-slate-300 rounded-[2rem] p-4 print:p-1 shadow-md page-break-inside-avoid flex items-center justify-center shrink-0">

                    <div
<<<<<<< HEAD
                        className="grid gap-3 w-full h-full "
=======
                        className="grid gap-3 w-full h-full print:h-0"
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
                        }}
                    >
                        {/* 1D array to Grid render */}
                        {matrix.map((cell, idx) => (
<<<<<<< HEAD
                            <div key={idx} style={{ gridColumn: cell.x + 1, gridRow: cell.y + 1 }} className="h-full  w-full">
=======
                            <div key={idx} style={{ gridColumn: cell.x + 1, gridRow: cell.y + 1 }} className="h-full print:h-0 w-full">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                                {renderCellContent(cell)}
                            </div>
                        ))}
                    </div>

                </div>

                {/* SEÇENEKLER (A, B, C, D) OY KUTUSU GİBİ */}
                <div className="w-full lg:w-1/2 flex flex-col gap-6 print:gap-2 max-w-[400px]">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest text-center mb-2">Şıklar</h3>
                    <div className="grid grid-cols-2 gap-6 print:gap-2 w-full">
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-3 group relative cursor-pointer">
                                {/* Şık Kutusu */}
                                <div className="w-full aspect-square border-4 border-slate-200 rounded-2xl p-2 transition-all group-hover:border-sky-500 bg-white shadow-sm flex items-center justify-center relative pointer-events-none">
                                    {renderCellContent(opt.cell)}
                                    {/* İşaretleme Çemberi (Fiziksel kağıt için) */}
                                    <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full border-4 border-sky-200 bg-white z-10"></div>
                                </div>

                                {/* A, B, C Harfleri Alt etiket */}
                                <div className="text-2xl font-black text-slate-400 group-hover:text-sky-600 transition-colors">
                                    {opt.id}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <div className="pt-4 print:pt-1 mt-auto border-t-2 border-zinc-100 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <span>Neuro-Oogmatik Özel Eğitim Teknolojileri</span>
                <span>Modül: Kafayı Çalıştır • IQ Matrisi: {gridSize}x{gridSize}</span>
            </div>
        </div >
    );
};



<<<<<<< HEAD

=======
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
