
import React from 'react';
import { NumberPatternData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const NumberPatternSheet: React.FC<{ data: NumberPatternData }> = ({ data }) => (
    <div className="flex flex-col">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        <div className="space-y-4 mt-4">
            {(data?.patterns || []).map((pattern, index) => (
                <EditableElement key={index} className="flex items-center gap-6 p-6 border-2 border-zinc-100 bg-white rounded-2xl break-inside-avoid shadow-sm hover:border-indigo-200 transition-colors">
                    <span className="font-black text-xl text-zinc-300 w-8">{index+1}.</span>
                    <p className="font-mono text-2xl tracking-[0.3em] font-black flex-1 text-center text-zinc-800"><EditableText value={pattern?.sequence} tag="span" /></p>
                    <div className="w-24 h-14 border-4 border-indigo-500 rounded-xl bg-indigo-50 flex items-center justify-center shadow-inner">?</div>
                </EditableElement>
            ))}
        </div>
    </div>
);
