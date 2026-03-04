
import React from 'react';
import { EstimationData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const EstimationSheet: React.FC<{ data: EstimationData }> = ({ data }) => (
    <div className="font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {(data.items || []).map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-8 p-10 bg-white border-[3px] border-zinc-900 rounded-[3rem] shadow-sm break-inside-avoid group hover:border-indigo-50 transition-all">
                    <div className="w-56 h-56 border-[6px] border-zinc-100 rounded-full bg-zinc-50 relative overflow-hidden shadow-inner flex items-center justify-center">
                        <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-3 p-6">
                            {Array.from({length: item.count}).map((_, i) => <div key={i} className="w-4 h-4 bg-indigo-500 rounded-full shadow-md transform hover:scale-125 transition-transform"></div>)}
                        </div>
                    </div>
                    <div className="w-full text-center">
                        <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Tahminin Hangisi?</p>
                        <div className="flex justify-center gap-4">
                            {item.options.map((opt, i) => (
                                <div key={i} className="w-16 h-16 rounded-2xl border-[3px] border-zinc-900 hover:bg-zinc-900 hover:text-white font-black text-2xl text-zinc-900 transition-all flex items-center justify-center cursor-pointer shadow-md">
                                    <EditableText value={opt} tag="span" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
