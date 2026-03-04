
import React from 'react';
import { ConceptMatchData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const ConceptMatchSheet: React.FC<{ data: ConceptMatchData }> = ({ data }) => (
    <div className="font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-6 mt-10 max-w-4xl mx-auto">
            {(data.pairs || []).map((pair, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-white rounded-3xl border-[3px] border-zinc-900 shadow-sm break-inside-avoid group hover:border-indigo-50 transition-all">
                    <div className="flex-1 text-center font-black text-3xl text-zinc-800"><EditableText value={pair.item1} tag="span" /></div>
                    <div className="w-24 flex items-center justify-center px-4"><div className="w-full h-1 border-t-4 border-dotted border-zinc-200"></div></div>
                    <div className="flex-1 flex justify-center">
                        <div className="w-32 h-16 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center text-xl font-bold text-zinc-300">?</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
