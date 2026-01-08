
import React from 'react';
import { RealLifeProblemData } from '../../../types';
import { PedagogicalHeader, ImageDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const RealLifeMathProblemsSheet: React.FC<{ data: RealLifeProblemData }> = ({ data }) => (
    <div className="flex flex-col font-lexend">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        <div className="space-y-10 mt-6">
            {(data?.problems || []).map((problem, index) => (
                <EditableElement key={index} className="border-b-2 border-zinc-100 pb-8 break-inside-avoid flex flex-col gap-4 group">
                    <div className="flex gap-6">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black shrink-0 shadow-lg">
                            {index + 1}
                        </div>
                        <div className="flex-1">
                             <div className="text-xl font-bold text-zinc-800 leading-relaxed text-justify mb-6">
                                 <EditableText value={problem?.text} tag="p" />
                             </div>
                             {problem.imagePrompt && (
                                 <div className="w-full h-56 bg-zinc-50 rounded-[2.5rem] border-2 border-zinc-100 mb-6 overflow-hidden shadow-inner">
                                     <ImageDisplay prompt={problem.imagePrompt} description={problem.text.substring(0,30)} className="w-full h-full object-contain mix-blend-multiply" />
                                 </div>
                             )}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6 ml-16">
                        <div className="flex-1 h-32 border-2 border-zinc-200 border-dashed rounded-[2rem] p-4 text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] flex items-start justify-center bg-zinc-50/30">Çözüm Alanı</div>
                        <div className="w-48 h-32 border-2 border-indigo-200 border-dashed rounded-[2rem] p-4 text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] flex items-start justify-center bg-indigo-50/30">Sonuç</div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);
