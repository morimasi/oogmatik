
import React from 'react';
import { AlgorithmData, AlgorithmStep } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const StepIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'start': return <i className="fa-solid fa-play text-emerald-500"></i>;
        case 'end': return <i className="fa-solid fa-stop text-rose-500"></i>;
        case 'decision': return <i className="fa-solid fa-code-branch text-amber-500"></i>;
        case 'process': return <i className="fa-solid fa-gear text-blue-500"></i>;
        case 'input': return <i className="fa-solid fa-right-to-bracket text-indigo-500"></i>;
        case 'output': return <i className="fa-solid fa-right-from-bracket text-purple-500"></i>;
        default: return <i className="fa-solid fa-arrow-right text-zinc-400"></i>;
    }
};

export const AlgorithmSheet: React.FC<{ data: AlgorithmData }> = ({ data }) => {
    return (
        <div className="h-full flex flex-col text-black font-lexend p-2 overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            <div className="mb-8 p-8 bg-zinc-900 text-white rounded-[3rem] shadow-xl relative overflow-hidden border-4 border-white">
                <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-[0.4em]">PROBLEM SENARYOSU</h4>
                    <p className="text-xl font-black leading-snug"><EditableText value={data.challenge} tag="span" /></p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-12 relative max-w-xl mx-auto py-4 w-full">
                {(data.steps || []).map((step, idx) => (
                    <React.Fragment key={idx}>
                        <EditableElement className={`p-5 border-[3px] rounded-[2rem] flex items-center gap-6 shadow-sm w-full bg-white ${step.type === 'decision' ? 'border-amber-500 bg-amber-50' : 'border-zinc-800'}`}>
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                                <StepIcon type={step.type} />
                            </div>
                            <p className="text-base font-bold text-zinc-800">
                                <EditableText value={step.text} tag="span" />
                            </p>
                        </EditableElement>
                        {idx < data.steps.length - 1 && <div className="h-10 w-1 bg-zinc-200"></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
