
import React from 'react';
import { MoneyCountingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

const MoneyIcon: React.FC<{ value: number, type: 'coin' | 'note' }> = ({ value, type }) => (
    <div className={`flex items-center justify-center font-bold shadow-sm relative ${type === 'coin' ? 'w-14 h-14 rounded-full bg-amber-400 border-4 border-amber-600 text-amber-900' : 'w-24 h-12 bg-emerald-100 border-2 border-emerald-600 text-emerald-800 rounded'}`}>
        {value} {type === 'coin' ? '' : 'TL'}
        {type === 'coin' && <span className="absolute bottom-1.5 text-[8px] font-black uppercase">TL</span>}
    </div>
);

export const MoneyCountingSheet: React.FC<{ data: MoneyCountingData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-10 mt-8 flex-1 content-start">
            {(data.puzzles || []).map((puzzle, idx) => (
                <div key={idx} className="p-8 bg-white border-[3px] border-zinc-900 rounded-[3rem] flex flex-col gap-8 break-inside-avoid shadow-sm group hover:border-indigo-50 transition-all">
                    <div className="flex flex-wrap gap-6 items-center justify-center p-6 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200 shadow-inner">
                        {puzzle.notes?.map((n, ni) => Array.from({length: n.count}).map((_, i) => <MoneyIcon key={`n-${ni}-${i}`} value={n.value} type="note" />))}
                        {puzzle.coins?.map((c, ci) => Array.from({length: c.count}).map((_, i) => <MoneyIcon key={`c-${ci}-${i}`} value={c.value} type="coin" />))}
                    </div>
                    <div className="flex flex-col items-center gap-6">
                        <p className="text-xl font-black text-zinc-800 text-center"><EditableText value={puzzle.question} tag="span" /></p>
                        <div className="flex gap-4">
                            {puzzle.options.map((opt, i) => (
                                <div key={i} className="px-8 py-3 border-[3px] border-zinc-900 rounded-2xl font-black text-2xl hover:bg-zinc-900 hover:text-white transition-all cursor-pointer shadow-md">
                                    <EditableText value={opt} tag="span" /> TL
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
