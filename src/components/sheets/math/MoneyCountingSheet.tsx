
import React from 'react';
import { MoneyCountingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

const MoneyIcon = ({ value, type }: { value: number, type: 'coin' | 'note' }) => {
    if (type === 'coin') {
        return (
            <div className="w-10 h-10 rounded-full bg-amber-400 border-[3px] border-amber-600 flex flex-col items-center justify-center font-black text-amber-900 shadow-sm relative shrink-0">
                <span className="text-sm leading-none">{value}</span>
                <span className="text-[6px] font-black uppercase mt-0.5 leading-none">TL</span>
            </div>
        );
    }
    
    // Notes
    return (
        <div className="w-16 h-8 bg-emerald-100 border-2 border-emerald-600 rounded flex items-center justify-center gap-1 font-black text-emerald-800 shadow-sm relative shrink-0">
            <span className="text-xs">{value}</span>
            <span className="text-[8px] uppercase">TL</span>
        </div>
    );
};

export const MoneyCountingSheet = ({ data }: { data: MoneyCountingData }) => {
    const itemCount = data.puzzles?.length || 6;
    const gridCols = itemCount > 6 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2';
    
    return (
        <div className="flex flex-col h-full font-lexend p-2 bg-white">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            <div className={`grid ${gridCols} gap-4 print:gap-2 mt-4 flex-1 content-start w-full max-w-full mx-auto`}>
                {(data.puzzles || []).map((puzzle, idx) => (
                    <div key={idx} className="p-4 print:p-2 bg-white border-[3px] border-zinc-900 rounded-[2rem] flex flex-col gap-4 print:gap-2 break-inside-avoid shadow-sm group hover:border-indigo-50 transition-all">
                        <div className="flex flex-wrap gap-2 print:gap-1 items-center justify-center p-3 print:p-2 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 shadow-inner min-h-[120px]">
                            {puzzle.notes?.map((n, ni) => Array.from({ length: n.count }).map((_, i) => <MoneyIcon key={`n-${ni}-${i}`} value={n.value} type="note" />))}
                            {puzzle.coins?.map((c, ci) => Array.from({ length: c.count }).map((_, i) => <MoneyIcon key={`c-${ci}-${i}`} value={c.value} type="coin" />))}
                        </div>
                        <div className="flex flex-col items-center gap-3 print:gap-2">
                            <p className="text-[11px] font-black text-zinc-800 text-center uppercase tracking-wider"><EditableText value={puzzle.question} tag="span" /></p>
                            <div className="flex flex-wrap justify-center gap-2 print:gap-1 w-full">
                                {puzzle.options.map((opt, i) => (
                                    <div key={i} className="px-3 py-1.5 border-[2px] border-zinc-900 rounded-xl font-black text-xs hover:bg-zinc-900 hover:text-white transition-all cursor-pointer shadow-sm text-center flex-1 min-w-[30%]">
                                        <EditableText value={opt.replace(' TL', '')} tag="span" /> <span className="text-[8px]">TL</span>
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



