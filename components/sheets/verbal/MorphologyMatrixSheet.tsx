
import React from 'react';
import { MorphologyMatrixData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const MorphologyMatrixSheet: React.FC<{ data: MorphologyMatrixData }> = ({ data }) => {
    return (
        <div className="flex flex-col h-full bg-white p-2 font-lexend text-black overflow-visible">
            <PedagogicalHeader 
                title={data.title} 
                instruction={data.instruction} 
                note={data.pedagogicalNote} 
            />
            
            <div className="flex-1 flex flex-col gap-6 mt-6 content-start">
                {(data.items || []).map((item, idx) => (
                    <EditableElement key={idx} className="flex items-center gap-4 p-4 border-[3px] border-zinc-900 rounded-[1.5rem] bg-white shadow-sm break-inside-avoid group hover:border-indigo-500 transition-all">
                        
                        {/* KÖK KELİME */}
                        <div className="w-32 bg-zinc-900 text-white p-3 rounded-xl text-center shadow-lg relative shrink-0">
                            <span className="text-[10px] font-black absolute top-1 left-2 opacity-50 uppercase tracking-widest">KÖK</span>
                            <span className="text-xl font-black tracking-wide"><EditableText value={item.root} tag="span" /></span>
                        </div>

                        {/* BAĞLANTI İKONU */}
                        <i className="fa-solid fa-plus text-zinc-300"></i>

                        {/* EK HAVUZU */}
                        <div className="flex flex-col gap-1 w-24">
                            {item.suffixes.map((s, sIdx) => (
                                <div key={sIdx} className="bg-zinc-100 border border-zinc-200 rounded-lg px-2 py-1 text-center font-bold text-sm text-zinc-600 hover:bg-indigo-100 hover:text-indigo-700 cursor-pointer transition-colors">
                                    <EditableText value={`- ${s}`} tag="span" />
                                </div>
                            ))}
                        </div>

                        {/* EŞİTTİR */}
                        <i className="fa-solid fa-arrow-right-long text-zinc-800 text-2xl"></i>

                        {/* YAZMA ALANI */}
                        <div className="flex-1 flex flex-col justify-center h-full relative">
                            <div className="h-12 border-b-4 border-dashed border-zinc-300 bg-indigo-50/30 rounded-t-xl flex items-end px-4">
                                <span className="text-2xl font-handwriting opacity-20 text-zinc-400 select-none pointer-events-none mb-1">
                                    ..................................................
                                </span>
                            </div>
                            {item.hint && (
                                <span className="text-[9px] font-bold text-indigo-400 mt-1 italic flex items-center gap-1">
                                    <i className="fa-solid fa-lightbulb"></i> <EditableText value={item.hint} tag="span" />
                                </span>
                            )}
                        </div>
                    </EditableElement>
                ))}
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-100 flex justify-between items-center px-6 opacity-40">
                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Morfolojik Farkındalık</p>
                <i className="fa-solid fa-cubes-stacked text-zinc-300"></i>
            </div>
        </div>
    );
};
