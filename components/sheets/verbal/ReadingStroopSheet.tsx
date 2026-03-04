
import React from 'react';
import { ReadingStroopData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ReadingStroopSheet: React.FC<{ data: ReadingStroopData }> = ({ data }) => {
    const { cols, fontSize } = data.settings;

    return (
        <div className="flex flex-col h-full w-full bg-white font-lexend text-black relative p-2">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex-1 w-full grid gap-y-12 gap-x-4 mt-12 content-start" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {(data.grid || []).map((item, idx) => (
                    <EditableElement key={idx} className="flex justify-center items-center">
                        <span className="font-black tracking-widest uppercase text-center" style={{ color: item.color, fontSize: `${fontSize}px` }}>
                            <EditableText value={item.text} tag="span" />
                        </span>
                    </EditableElement>
                ))}
            </div>

            {data.evaluationBox && (
                <div className="mt-auto pt-10 border-t-4 border-zinc-900 break-inside-avoid">
                    <div className="grid grid-cols-4 gap-6 mb-4">
                        {['SÜRE', 'HATA', 'DÜZELTME', 'PUAN'].map(label => (
                            <div key={label} className={`p-4 rounded-2xl border-2 ${label === 'PUAN' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                                <h5 className="text-[10px] font-black uppercase mb-2 tracking-widest">{label}</h5>
                                <div className={`h-8 border-b-2 border-dashed ${label === 'PUAN' ? 'border-indigo-400' : 'border-zinc-300'}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
