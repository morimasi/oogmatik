
import React from 'react';
import { ShapeCountingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => {
    return (
        <div className="flex flex-col h-full bg-white p-2 font-lexend text-black">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="grid grid-cols-2 gap-10 mt-10 flex-1 content-start">
                {(data.figures || []).map((fig, idx) => (
                    <EditableElement key={idx} className="flex flex-col items-center gap-6 p-8 border-[3px] border-zinc-900 rounded-[3rem] bg-white shadow-sm break-inside-avoid hover:border-indigo-500 transition-all group">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-lg">
                                {fig.svgPaths.map((p, i) => (
                                    <path 
                                        key={i} 
                                        d={p.d} 
                                        fill="none" 
                                        stroke={p.stroke || "#1e293b"} 
                                        strokeWidth={p.strokeWidth || 2} 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                    />
                                ))}
                                {/* Köşe Noktalarını Vurgula (Pedagojik) */}
                                <circle cx="50" cy="10" r="3" fill="#ef4444" />
                                <circle cx="10" cy="90" r="3" fill="#3b82f6" />
                                <circle cx="90" cy="90" r="3" fill="#3b82f6" />
                            </svg>
                        </div>
                        
                        <div className="flex flex-col items-center w-full">
                             <div className="flex items-center gap-3 mb-2 opacity-50">
                                 <i className="fa-solid fa-play fa-rotate-270 text-xs"></i>
                                 <span className="text-[10px] font-black uppercase tracking-widest">TOPLAM ÜÇGEN?</span>
                             </div>
                             <div className="w-24 h-14 border-b-4 border-dashed border-zinc-300 bg-zinc-50 rounded-t-xl flex items-center justify-center font-black text-3xl text-zinc-800">
                                 <EditableText value="" tag="span" />
                             </div>
                             
                             {/* Cevap Anahtarı (Gizli/Ters) */}
                             <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-zinc-300 font-bold rotate-180 select-none">
                                 Cevap: {fig.correctCount}
                             </div>
                        </div>
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};
