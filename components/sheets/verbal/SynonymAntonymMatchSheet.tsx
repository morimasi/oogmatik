
import React from 'react';
import { SynonymAntonymMatchData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const SynonymAntonymMatchSheet: React.FC<{ data: SynonymAntonymMatchData }> = ({ data }) => {
    const shuffledTargets = [...data.pairs].sort(() => Math.random() - 0.5);

    return (
        <div className="flex flex-col h-full bg-white font-lexend text-black p-2">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="grid grid-cols-2 gap-x-20 gap-y-6 mt-10 pb-10 border-b-2 border-zinc-100">
                <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">KELİMELER</h5>
                    {data.pairs.map((pair, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border-2 border-zinc-800 rounded-2xl bg-zinc-50 relative group">
                            <span className="font-black text-xl uppercase"><EditableText value={pair.source} tag="span" /></span>
                            <div className="w-5 h-5 rounded-full border-2 border-zinc-800 bg-white absolute -right-2.5 top-1/2 -translate-y-1/2 group-hover:bg-indigo-500 transition-colors shadow-sm"></div>
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">ANLAMLAR</h5>
                    {shuffledTargets.map((pair, idx) => (
                        <div key={idx} className="flex items-center justify-start p-4 border-2 border-zinc-200 border-dashed rounded-2xl bg-white relative group hover:border-emerald-500 transition-all cursor-default">
                            <div className="w-5 h-5 rounded-full border-2 border-zinc-200 bg-white absolute -left-2.5 top-1/2 -translate-y-1/2 group-hover:border-emerald-500 transition-colors shadow-sm"></div>
                            <span className="font-bold text-xl uppercase ml-6 text-zinc-500 group-hover:text-zinc-900"><EditableText value={pair.target} tag="span" /></span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12 space-y-6">
                <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">BAĞLAMSAL KULLANIM</h5>
                {data.sentences.map((sent, idx) => (
                    <EditableElement key={idx} className="p-5 bg-indigo-50/30 border-l-8 border-indigo-500 rounded-r-3xl">
                         <p className="text-xl leading-relaxed italic text-zinc-800">
                             {sent.text.split('_______').map((part, i, arr) => (
                                 <React.Fragment key={i}>
                                     {part}
                                     {i < arr.length - 1 && (
                                         <span className="inline-block min-w-[140px] border-b-2 border-dashed border-indigo-400 mx-2 text-transparent">..........</span>
                                     )}
                                 </React.Fragment>
                             ))}
                         </p>
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};
