
import React from 'react';
import { SyllableWordBuilderData } from '../../../types';
import { PedagogicalHeader, ImageDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const SyllableWordBuilderSheet: React.FC<{ data: SyllableWordBuilderData }> = ({ data }) => (
    <div className="flex flex-col h-full bg-white p-2 text-black font-lexend">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="flex-1 flex flex-col gap-10 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(data.words || []).map((word, idx) => (
                    <EditableElement key={idx} className="flex items-center gap-6 p-5 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm break-inside-avoid group hover:border-indigo-500 transition-all">
                        <div className="w-24 h-24 rounded-3xl bg-zinc-50 border border-zinc-100 shrink-0 overflow-hidden shadow-inner">
                            <ImageDisplay prompt={word.imagePrompt} description={word.targetWord} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex gap-2 flex-wrap">
                                {word.syllables.map((_, sIdx) => (
                                    <div key={sIdx} className="w-14 h-12 border-b-[4px] border-dashed border-zinc-300 bg-zinc-50/50 rounded-t-xl flex items-center justify-center font-black text-2xl text-zinc-200">?</div>
                                ))}
                            </div>
                        </div>
                    </EditableElement>
                ))}
            </div>

            <div className="mt-8 p-8 bg-zinc-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden break-inside-avoid border-4 border-white">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><i className="fa-solid fa-puzzle-piece text-[10rem]"></i></div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-8 flex items-center gap-3">
                    <i className="fa-solid fa-layer-group"></i> HECE HAVUZU
                </h4>
                <div className="flex flex-wrap justify-center gap-4 relative z-10">
                    {(data.syllableBank || []).map((syllable, idx) => (
                        <EditableElement key={idx} className="px-6 py-3 bg-white text-zinc-900 rounded-2xl font-black text-xl shadow-lg border-2 border-transparent hover:border-indigo-500 hover:scale-105 transition-all cursor-default uppercase">
                            <EditableText value={syllable} tag="span" />
                        </EditableElement>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
