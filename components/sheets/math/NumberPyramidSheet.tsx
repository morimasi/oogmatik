
import React from 'react';
import { NumberPyramidData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const NumberPyramidSheet: React.FC<{ data: NumberPyramidData }> = ({ data }) => (
     <div className="flex flex-col font-lexend">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} data={data} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
            {(data?.pyramids || []).map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-3 break-inside-avoid group">
                     <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-4">PİRAMİT #{i+1}</span>
                     {(p?.rows || []).map((row, r) => (
                         <div key={r} className="flex gap-3">
                             {(row || []).map((cell, c) => (
                                 <div key={c} className="w-16 h-16 border-[3px] border-zinc-900 flex items-center justify-center text-2xl font-black bg-white shadow-lg rounded-2xl transform group-hover:scale-105 transition-all">
                                     <EditableText value={cell || ''} tag="span" />
                                 </div>
                             ))}
                         </div>
                     ))}
                </div>
            ))}
        </div>
    </div>
);
