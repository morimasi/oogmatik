
import React from 'react';
import { OddOneOutData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const OddOneOutSheet: React.FC<{ data: OddOneOutData }> = ({ data }) => (
    <div className="flex flex-col font-lexend">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} data={data} />
        <div className="space-y-6 mt-6">
            {(data?.groups || []).map((g, i) => (
                <EditableElement key={i} className="border-2 border-zinc-100 p-8 rounded-[2.5rem] flex gap-8 justify-center flex-wrap items-center bg-white shadow-sm break-inside-avoid hover:border-indigo-200 transition-all group">
                    <span className="font-black text-2xl text-zinc-200 group-hover:text-indigo-200 transition-colors w-10">{i+1}.</span>
                    {(g?.words || []).map((w, j) => (
                        <div key={j} className="px-8 py-3 border-[3px] border-zinc-900 bg-white rounded-2xl font-black text-xl text-zinc-800 hover:bg-zinc-900 hover:text-white cursor-pointer transition-all shadow-md">
                            <EditableText value={w} tag="span" />
                        </div>
                    ))}
                </EditableElement>
            ))}
        </div>
    </div>
);
