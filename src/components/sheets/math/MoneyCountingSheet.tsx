
import React from 'react';
import { MoneyCountingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

const MONEY_CONFIG: Record<number, { bg: string, border: string, text: string, type: 'note' | 'coin' }> = {
    200: { bg: 'bg-[#f5d0e9]', border: 'border-[#b666a3]', text: 'text-[#8b3d75]', type: 'note' },
    100: { bg: 'bg-[#d0e5f5]', border: 'border-[#66a3b6]', text: 'text-[#3d758b]', type: 'note' },
    50: { bg: 'bg-[#f5e0d0]', border: 'border-[#b68a66]', text: 'text-[#8b5a3d]', type: 'note' },
    20: { bg: 'bg-[#d0f5d5]', border: 'border-[#66b670]', text: 'text-[#3d8b45]', type: 'note' },
    10: { bg: 'bg-[#f5d0d0]', border: 'border-[#b66666]', text: 'text-[#8b3d3d]', type: 'note' },
    5: { bg: 'bg-[#e5e5e5]', border: 'border-[#999999]', text: 'text-[#666666]', type: 'note' },
    1: { bg: 'bg-[#fbbf24]', border: 'border-[#b45309]', text: 'text-[#78350f]', type: 'coin' },
    0.5: { bg: 'bg-[#fcd34d]', border: 'border-[#d97706]', text: 'text-[#92400e]', type: 'coin' },
    0.25: { bg: 'bg-[#d1d5db]', border: 'border-[#4b5563]', text: 'text-[#1f2937]', type: 'coin' },
    0.1: { bg: 'bg-[#e5e7eb]', border: 'border-[#6b7280]', text: 'text-[#374151]', type: 'coin' },
    0.05: { bg: 'bg-[#f3f4f6]', border: 'border-[#9ca3af]', text: 'text-[#4b5563]', type: 'coin' },
};

const MoneyIcon = ({ value }: { value: number }) => {
    const config = MONEY_CONFIG[value] || { bg: 'bg-zinc-100', border: 'border-zinc-400', text: 'text-zinc-800', type: 'note' };
    
    if (config.type === 'coin') {
        return (
            <div className={`w-9 h-9 rounded-full ${config.bg} border-[2px] ${config.border} flex flex-col items-center justify-center font-black ${config.text} shadow-sm relative shrink-0 transform hover:rotate-12 transition-transform`}>
                <span className="text-[10px] leading-none">{value < 1 ? value * 100 : value}</span>
                <span className="text-[5px] font-black uppercase leading-none">{value < 1 ? 'KR' : 'TL'}</span>
                <div className="absolute inset-0.5 border border-white/20 rounded-full"></div>
            </div>
        );
    }
    
    return (
        <div className={`w-14 h-7 ${config.bg} border-[1.5px] ${config.border} rounded-sm flex items-center justify-center gap-1 font-black ${config.text} shadow-sm relative shrink-0 transform hover:-rotate-2 transition-transform overflow-hidden`}>
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,_currentColor_1px,_transparent_1px)] bg-[length:4px_4px]"></div>
            <span className="text-[10px] relative z-10">{value}</span>
            <span className="text-[6px] uppercase relative z-10">TL</span>
        </div>
    );
};

export const MoneyCountingSheet = ({ data }: { data: MoneyCountingData }) => {
    const itemCount = data.puzzles?.length || 8;
    const gridCols = 'grid-cols-2';
    
    return (
        <div className="flex flex-col h-full font-lexend p-2 bg-white">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            <div className={`grid ${gridCols} gap-2 print:gap-1 mt-2 flex-1 content-start w-full max-w-full mx-auto`}>
                {(data.puzzles || []).map((puzzle, idx) => (
                    <div key={idx} className="p-2 print:p-1 bg-white border-[2px] border-zinc-900 rounded-[1.5rem] flex flex-col gap-2 print:gap-1 break-inside-avoid shadow-sm group hover:border-indigo-200 transition-all relative">
                        <div className="absolute top-1 left-1 w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center font-black text-[8px] z-10 shadow-sm">{idx + 1}</div>
                        <div className="flex flex-wrap gap-1 print:gap-0.5 items-center justify-center p-2 print:p-1 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 shadow-inner min-h-[90px]">
                            {puzzle.notes?.map((n, ni) => Array.from({ length: n.count }).map((_, i) => <MoneyIcon key={`n-${ni}-${i}`} value={n.value} />))}
                            {puzzle.coins?.map((c, ci) => Array.from({ length: c.count }).map((_, i) => <MoneyIcon key={`c-${ci}-${i}`} value={c.value} />))}
                        </div>
                        <div className="flex flex-col items-center gap-1.5 print:gap-1">
                            <p className="text-[9px] font-black text-zinc-800 text-center uppercase tracking-tight"><EditableText value={puzzle.question} tag="span" /></p>
                            <div className="flex flex-wrap justify-center gap-1 print:gap-0.5 w-full">
                                {puzzle.options.map((opt, i) => (
                                    <div key={i} className="px-2 py-1 border border-zinc-900 rounded-lg font-black text-[9px] hover:bg-zinc-900 hover:text-white transition-all cursor-pointer shadow-sm text-center flex-1 min-w-[45%]">
                                        <EditableText value={opt.replace(' TL', '')} tag="span" /> <span className="text-[6px]">TL</span>
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



