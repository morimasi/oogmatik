
import React from 'react';
import { FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, SyllableWordBuilderData } from '../../types';
import { PedagogicalHeader, GridComponent, ImageDisplay } from './common';
import { EditableElement, EditableText } from '../Editable';

// HECE DEDEKTİFİ BİLEŞENİ
export const SyllableWordBuilderSheet: React.FC<{ data: SyllableWordBuilderData }> = ({ data }) => {
    return (
        <div className="flex flex-col h-full bg-white p-2 text-black font-lexend">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            <div className="flex-1 flex flex-col gap-8 mt-4">
                {/* Kelime İnşa Alanları */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(data.words || []).map((word, idx) => (
                        <EditableElement key={idx} className="flex items-center gap-4 p-4 border-[3px] border-zinc-900 rounded-[2rem] bg-white shadow-sm break-inside-avoid group hover:border-indigo-500 transition-all">
                            <div className="w-20 h-20 rounded-2xl bg-zinc-50 border border-zinc-100 shrink-0 overflow-hidden shadow-inner">
                                <ImageDisplay prompt={word.imagePrompt} description={word.targetWord} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex gap-1.5 flex-wrap">
                                    {word.syllables.map((_, sIdx) => (
                                        <div key={sIdx} className="w-12 h-10 border-b-[3px] border-dashed border-zinc-300 bg-zinc-50/50 rounded-t-lg flex items-center justify-center font-black text-lg text-zinc-200">
                                            ?
                                        </div>
                                    ))}
                                </div>
                                <div className="h-px bg-zinc-100 w-full"></div>
                                <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">KELİME İNŞA ALANI</div>
                            </div>
                        </EditableElement>
                    ))}
                </div>

                {/* Hece Bankası (Bento Box style) */}
                <div className="mt-6 p-6 bg-zinc-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden break-inside-avoid border-4 border-zinc-100">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><i className="fa-solid fa-puzzle-piece text-8xl"></i></div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-5 flex items-center gap-2">
                        <i className="fa-solid fa-layer-group"></i> HECE HAVUZU
                    </h4>
                    <div className="flex flex-wrap justify-center gap-3 relative z-10">
                        {(data.syllableBank || []).map((syllable, idx) => (
                            <EditableElement key={idx} className="px-4 py-2 bg-white text-zinc-900 rounded-xl font-black text-lg shadow-md border-2 border-transparent hover:border-indigo-500 hover:scale-105 transition-all cursor-default">
                                <EditableText value={syllable} tag="span" />
                            </EditableElement>
                        ))}
                    </div>
                    <div className="mt-6 text-[9px] text-zinc-500 font-bold text-center uppercase tracking-widest opacity-60 italic">
                        Doğru heceleri havuzdan bul ve resmin yanındaki kutucuklara sırasıyla yaz.
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-100 flex justify-between items-center px-6">
                <p className="text-[7px] text-zinc-300 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Fonolojik Sentez Bataryası v2.0</p>
                <div className="flex gap-4 opacity-20">
                     <i className="fa-solid fa-ear-listen"></i>
                     <i className="fa-solid fa-brain"></i>
                </div>
            </div>
        </div>
    );
};
// ... (rest of file remains same)
