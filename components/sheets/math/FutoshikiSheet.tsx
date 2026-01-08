
import React from 'react';
import { FutoshikiData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FutoshikiSheet: React.FC<{ data: FutoshikiData }> = ({ data }) => {
    const puzzles = data?.puzzles || [];
    const gridCols = puzzles.length > 2 ? 'grid-cols-2' : 'grid-cols-1';

    return (
        <div className="flex flex-col font-lexend">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} data={data} />
            <div className={`grid ${gridCols} gap-12 mt-10`}>
                {puzzles.map((p, i) => (
                    <div key={i} className="flex flex-col items-center break-inside-avoid">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-6">BULMACA #{i+1}</span>
                        <div className="border-[4px] border-zinc-900 p-6 bg-white shadow-xl rounded-[3rem] group hover:border-indigo-500 transition-all">
                            <div className="grid gap-3" style={{gridTemplateColumns: `repeat(${p?.size || 4}, 1fr)`}}>
                                 {Array.from({length: (p?.size || 4) * (p?.size || 4)}).map((_, k) => (
                                     <div key={k} className="w-16 h-16 border-2 border-zinc-100 bg-zinc-50 rounded-2xl flex items-center justify-center text-3xl font-black text-zinc-800 shadow-inner group-hover:bg-white transition-colors">
                                         <EditableText value="" tag="span" />
                                     </div>
                                 ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
