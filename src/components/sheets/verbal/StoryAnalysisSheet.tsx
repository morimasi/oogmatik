import React from 'react';
import { StoryAnalysisData } from '../../../types';
import { PedagogicalHeader, ReadingRuler, ImageDisplay } from '../common';

export const StoryAnalysisSheet: React.FC<{ data: StoryAnalysisData }> = ({ data }) => {
    const { content } = data;

    return (
        <div className="flex flex-col h-full bg-white relative font-lexend p-2">
            <ReadingRuler />
            <PedagogicalHeader 
                title={content.title} 
                instruction={data.instruction || "Hikayeyi derinlemesine analiz et."} 
                note={data.pedagogicalNote} 
            />

            <div className="flex gap-4 mb-6">
                <div className="flex-1 p-6 bg-zinc-50 rounded-[2rem] border-2 border-zinc-200 text-zinc-800 leading-relaxed text-lg text-justify">
                    {content.story}
                </div>
                {data.imagePrompt && (
                    <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                        <ImageDisplay prompt={data.imagePrompt} description={content.title} className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-rose-50 rounded-2xl border-2 border-rose-100">
                    <h4 className="text-xs font-black text-rose-600 uppercase mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-users"></i> Karakterler
                    </h4>
                    <div className="space-y-2">
                        {content.analysis.characters.map((c, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="font-bold text-sm">{c.name}</span>
                                <span className="text-[10px] text-zinc-500 italic">{c.traits.join(', ')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100">
                    <h4 className="text-xs font-black text-indigo-600 uppercase mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-map-location-dot"></i> Yer ve Zaman
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-zinc-400">YER</span>
                            <span className="font-medium">{content.analysis.setting.place}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-zinc-400">ZAMAN</span>
                            <span className="font-medium">{content.analysis.setting.time}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-100 col-span-2">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-xs font-black text-amber-600 uppercase mb-2">Çatışma (Olay)</h4>
                            <p className="text-sm font-medium leading-tight">{content.analysis.conflict}</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-emerald-600 uppercase mb-2">Çözüm</h4>
                            <p className="text-sm font-medium leading-tight">{content.analysis.resolution}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-black text-zinc-800 uppercase border-b-2 border-zinc-800 pb-1">Analitik Sorular</h4>
                <div className="grid grid-cols-1 gap-4">
                    {data.questions.map((q, i) => (
                        <div key={i} className="text-sm">
                            <p className="font-bold mb-2">{i + 1}. {q.question}</p>
                            <div className="border-b-2 border-dashed border-zinc-200 h-10 w-full mt-1"></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-100 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <span>Hikaye Analizi • Ultra Pro Modülü</span>
                <span>Ana Fikir: {content.analysis.mainIdea}</span>
            </div>
        </div>
    );
};
