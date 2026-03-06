import React from 'react';
import { MorphologyMatrixData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const MorphologyMatrixSheet = ({ data }: { data: MorphologyMatrixData }) => {
    const settings = data?.settings;
    const isGrid = settings?.layout === 'grid_2x1';

    return (
        <div className="flex flex-col h-full bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader
                title={data.title || "MORFOLOJİ MATRİSİ"}
                instruction={data.instruction}
                note={data.pedagogicalNote}
            />

            <div className={`flex-1 grid ${isGrid ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mt-8 content-start pb-10`}>
                {(data.items || []).map((item, idx) => (
                    <EditableElement key={idx} className="flex flex-col gap-3 p-5 border-2 border-zinc-100 rounded-[2rem] bg-zinc-50/50 shadow-sm break-inside-avoid relative hover:border-indigo-200 hover:bg-white transition-all group">

                        <div className="flex items-center gap-4">
                            {/* KÖK KELİME - Premium Badge */}
                            <div className="bg-zinc-900 text-white px-6 py-2 rounded-2xl shadow-lg relative shrink-0">
                                <span className="text-[7px] font-black absolute -top-2 left-4 bg-indigo-600 px-2 py-0.5 rounded-full text-white uppercase tracking-widest ring-2 ring-white">KÖK</span>
                                <span className="text-xl font-black tracking-tighter"><EditableText value={item.root} tag="span" /></span>
                            </div>

                            <div className="flex-1 flex flex-wrap gap-2">
                                {item.suffixes.map((s, sIdx) => (
                                    <div key={sIdx} className="bg-white border-2 border-zinc-200 rounded-xl px-3 py-1 text-center font-bold text-xs text-zinc-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer">
                                        <EditableText value={`- ${s}`} tag="span" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* YAZMA ALANI */}
                        <div className="grid gap-2">
                            {item.suffixes.map((_, sIdx) => (
                                <div key={sIdx} className="h-10 border-b-2 border-zinc-200 flex items-end pb-1 px-4 text-xs font-handwriting text-zinc-300 pointer-events-none select-none">
                                    {item.root} + ...
                                </div>
                            ))}
                        </div>

                        {item.hint && (
                            <div className="absolute top-2 right-4 text-[8px] font-black text-indigo-400/50 uppercase tracking-tighter italic">
                                <i className="fa-solid fa-lightbulb mr-1"></i> <EditableText value={item.hint} tag="span" />
                            </div>
                        )}
                    </EditableElement>
                ))}
            </div>

            {/* Klinik Analiz Paneli */}
            {settings?.showClinicalNotes && data.clinicalMeta && (
                <div className="mt-auto p-6 bg-zinc-900 text-white rounded-[2.5rem] border-4 border-white shadow-2xl flex justify-between items-center mx-4 mb-2">
                    <div className="flex gap-10">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Morfolojik Karmaşıklık</span>
                            <span className="text-lg font-black">{data.clinicalMeta.morphologicalComplexity}/10</span>
                        </div>
                        <div className="flex flex-col border-l border-white/10 pl-10">
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Türetme Çeşitliliği</span>
                            <span className="text-lg font-black">{data.clinicalMeta.derivationalVariety} varyasyon</span>
                        </div>
                    </div>
                    <div className="text-[9px] font-bold text-zinc-500 text-right opacity-60">
                        PROFESYONEL DİLBİLGİSİ PROTOKOLÜ v4.0
                    </div>
                </div>
            )}
        </div>
    );
};
