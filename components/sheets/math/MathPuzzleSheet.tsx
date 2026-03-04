
import React from 'react';
import { MathPuzzleData } from '../../../types';
import { ImageDisplay, PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const EquationRow: React.FC<{ eq: any, objects: any[], fontSize?: string }> = ({ eq, objects, fontSize = "text-xl" }) => {
    return (
        <div className="flex items-center justify-center gap-4 py-3 border-b border-zinc-50 last:border-0 group-hover:bg-zinc-50/50 transition-colors rounded-xl">
            <div className="flex items-center gap-2">
                {eq.leftSide.map((item: any, i: number) => {
                    const obj = objects.find(o => o.name === item.objectName);
                    return (
                        <React.Fragment key={i}>
                            {i > 0 && <span className="text-zinc-400 font-bold">+</span>}
                            <div className="flex items-center gap-1">
                                {item.multiplier > 1 && <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-1.5 rounded">{item.multiplier}x</span>}
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <ImageDisplay prompt={obj?.imagePrompt} description={obj?.name} className="w-full h-full object-contain" />
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            <span className="text-2xl font-black text-zinc-900">=</span>
            <div className={`font-mono font-black ${fontSize} bg-zinc-900 text-white px-4 py-1.5 rounded-2xl shadow-lg`}>
                {eq.rightSide}
            </div>
        </div>
    );
};

export const MathPuzzleSheet: React.FC<{ data: MathPuzzleData }> = ({ data }) => (
    <div className="flex flex-col h-full font-lexend text-black bg-white">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 flex-1 content-start">
            {(data?.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="flex flex-col border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden group hover:shadow-xl transition-all duration-500 break-inside-avoid">
                    <div className="bg-zinc-900 px-6 py-3 flex justify-between items-center text-white">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">GİZEMLİ DENKLEM #{index + 1}</span>
                    </div>
                    <div className="p-8 flex-1 flex flex-col gap-4">
                        <div className="space-y-2">
                            {puzzle.equations.map((eq, eIdx) => (
                                <EquationRow key={eIdx} eq={eq} objects={puzzle.objects} />
                            ))}
                        </div>
                        <div className="mt-8 p-6 bg-indigo-50 rounded-[2rem] border-2 border-indigo-100 flex flex-col items-center gap-4 relative overflow-hidden">
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest leading-none">Hedef İşlem</p>
                            <div className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                                <EditableText value={puzzle.finalQuestion} tag="span" />
                                <span className="text-indigo-600">=</span>
                                <div className="w-20 h-12 border-b-4 border-indigo-600 bg-white rounded-t-xl shadow-inner flex items-center justify-center text-3xl text-transparent">
                                    {puzzle.answer}
                                </div>
                            </div>
                        </div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);
