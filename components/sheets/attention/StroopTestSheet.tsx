
import React from 'react';
import { StroopTestData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const StroopTestSheet: React.FC<{ data: StroopTestData }> = ({ data }) => (
    <div className="flex flex-col h-full font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex-1 grid grid-cols-4 gap-y-10 gap-x-4 items-center content-start mt-8">
            {(data.items || []).map((item, i) => (
                <div key={i} className="flex justify-center break-inside-avoid">
                    <span className="text-3xl font-black tracking-widest uppercase text-center" style={{ color: item.color }}>
                        <EditableText value={item.text} tag="span" />
                    </span>
                </div>
            ))}
        </div>
        <div className="mt-auto pt-8 border-t-4 border-zinc-900 grid grid-cols-4 gap-4 break-inside-avoid">
            {['SÜRE', 'HATA', 'DÜZELTME', 'PUAN'].map(l => (
                <div key={l} className="p-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl">
                    <h5 className="text-[9px] font-black text-zinc-400 uppercase mb-2">{l}</h5>
                    <div className="h-6 border-b border-zinc-300 border-dashed"></div>
                </div>
            ))}
        </div>
    </div>
);
