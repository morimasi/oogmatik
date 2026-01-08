
import React from 'react';
import { SyllableMasterLabData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const SyllableMasterLabSheet: React.FC<{ data: SyllableMasterLabData }> = ({ data }) => {
    const { mode, items } = data;

    const renderItem = (item: any, idx: number) => {
        const isSplit = mode === 'split';
        const isCombine = mode === 'combine';
        const isComplete = mode === 'complete';
        const isRainbow = mode === 'rainbow';
        const isScrambled = mode === 'scrambled';

        return (
            <EditableElement key={idx} className="flex flex-col gap-1 p-3 border-[2px] border-zinc-900 rounded-[1.5rem] bg-white group hover:border-indigo-500 transition-all shadow-sm break-inside-avoid relative overflow-hidden">
                <div className="flex-1">
                    {isSplit && (
                        <div className="flex flex-col gap-2">
                            <h4 className="text-lg font-black tracking-widest text-zinc-800 uppercase text-center">{item.word}</h4>
                            <div className="flex gap-1.5 justify-center">
                                {item.syllables.map((_: any, sIdx: number) => (
                                    <div key={sIdx} className="w-10 h-8 border-[1.5px] border-zinc-900 rounded-md flex items-center justify-center bg-zinc-50">
                                        <div className="w-4 h-0.5 bg-zinc-200"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isCombine && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-1 flex-wrap justify-center">
                                {item.syllables.map((s: string, sIdx: number) => (
                                    <div key={sIdx} className="px-3 py-1 bg-zinc-900 text-white rounded-md font-black text-sm uppercase">
                                        <EditableText value={s} tag="span" />
                                    </div>
                                ))}
                            </div>
                            <div className="w-full h-8 border-b-[1.5px] border-dashed border-zinc-300 bg-zinc-50 rounded-t-md"></div>
                        </div>
                    )}

                    {isRainbow && (
                        <div className="flex items-center justify-center gap-1.5 flex-wrap py-1">
                            {item.syllables.map((s: string, sIdx: number) => {
                                const colors = ['#be123c', '#1d4ed8', '#047857', '#b45309', '#6d28d9', '#0e7490'];
                                const color = colors[sIdx % colors.length];
                                return (
                                    <div key={sIdx} className="px-3 py-1.5 rounded-lg border-[2.5px] flex items-center justify-center min-w-[35px]" style={{ backgroundColor: `${color}10`, borderColor: color }}>
                                        <span className="text-sm font-black uppercase" style={{ color: color }}>
                                            <EditableText value={s} tag="span" />
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {isScrambled && (
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-1 flex-wrap justify-center">
                                {item.scrambledIndices?.map((origIdx: number) => (
                                    <div key={origIdx} className="px-2.5 py-1 bg-white border-2 border-zinc-300 rounded-full font-bold text-xs text-zinc-800 shadow-sm uppercase">
                                        {item.syllables[origIdx]}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-1.5 px-1">
                                {item.syllables.map((_: any, i: number) => (
                                    <div key={i} className="flex-1 h-7 border-b-[2px] border-zinc-900 bg-zinc-50/50"></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </EditableElement>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white font-lexend p-1">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 content-start">
                {items.map((item: any, i: number) => renderItem(item, i))}
            </div>
            <div className="mt-10 pt-6 border-t border-zinc-100 flex justify-between items-center opacity-40">
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Bilişsel Dil Laboratuvarı</p>
                <i className="fa-solid fa-spell-check text-zinc-300"></i>
            </div>
        </div>
    );
};
