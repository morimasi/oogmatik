
import React from 'react';
import { ReadingPyramidData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ReadingPyramidSheet: React.FC<{ data: ReadingPyramidData }> = ({ data }) => {
    // Determine grid layout based on number of pyramids
    const count = data.pyramids?.length || 0;
    const gridClass = count === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2';

    return (
        <div className="flex flex-col h-full bg-white p-2 font-lexend text-black overflow-visible">
            <PedagogicalHeader 
                title={data.title} 
                instruction={data.instruction} 
                note={data.pedagogicalNote} 
            />
            
            <div className={`grid ${gridClass} gap-12 mt-6 content-start flex-1`}>
                {(data.pyramids || []).map((pyramid, pIdx) => (
                    <EditableElement key={pIdx} className="flex flex-col items-center break-inside-avoid">
                        <div className="bg-zinc-900 text-white px-8 py-2 rounded-full font-black text-sm uppercase tracking-widest mb-6 shadow-lg border-4 border-zinc-100">
                            <EditableText value={pyramid.title} tag="span" />
                        </div>
                        
                        <div className="flex flex-col items-center gap-1 w-full">
                            {pyramid.levels.map((line, lIdx) => {
                                // Visual aid: Alternating colors or subtle borders
                                const isOdd = lIdx % 2 !== 0;
                                return (
                                    <div 
                                        key={lIdx} 
                                        className={`
                                            py-2 px-4 rounded-xl text-center transition-all hover:scale-105 cursor-default
                                            ${isOdd ? 'bg-indigo-50 border-indigo-100 text-indigo-900' : 'bg-white border-zinc-100 text-zinc-800'}
                                            border-2 shadow-sm
                                        `}
                                        style={{ 
                                            // Dynamic width increase to emphasize pyramid shape visually
                                            minWidth: `${100 + (lIdx * 30)}px`,
                                            maxWidth: '100%'
                                        }}
                                    >
                                        <p className="text-lg font-bold leading-none tracking-wide">
                                            <EditableText value={line} tag="span" />
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </EditableElement>
                ))}
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-100 flex justify-between items-center px-6 opacity-40">
                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Akıcı Okuma Modülü</p>
                <i className="fa-solid fa-layer-group text-zinc-300"></i>
            </div>
        </div>
    );
};
