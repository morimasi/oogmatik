
import React from 'react';
import { AlgorithmData, AlgorithmStep } from '../../types';
import { PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

const StepIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'start': return <i className="fa-solid fa-play text-green-500"></i>;
        case 'end': return <i className="fa-solid fa-stop text-red-500"></i>;
        case 'decision': return <i className="fa-solid fa-code-branch text-amber-500"></i>;
        case 'process': return <i className="fa-solid fa-gear text-blue-500"></i>;
        default: return <i className="fa-solid fa-arrow-right text-zinc-400"></i>;
    }
};

const FlowStep: React.FC<{ step: AlgorithmStep }> = ({ step }) => {
    const baseClass = "p-4 border-2 rounded-2xl flex items-center gap-3 shadow-sm min-h-[60px] transition-all hover:shadow-md";
    let typeClass = "border-zinc-200 bg-white";
    
    if (step.type === 'start' || step.type === 'end') typeClass = "border-zinc-800 bg-zinc-50 font-black uppercase tracking-widest";
    if (step.type === 'decision') typeClass = "border-amber-400 bg-amber-50 rounded-[2.5rem]";

    return (
        <EditableElement className={`${baseClass} ${typeClass}`}>
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                <StepIcon type={step.type} />
            </div>
            <p className="text-sm font-bold flex-1"><EditableText value={step.text} tag="span" /></p>
            {step.type === 'decision' && (
                <div className="flex gap-1 absolute -bottom-6 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-black border border-emerald-200">EVET</span>
                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[8px] font-black border border-rose-200">HAYIR</span>
                </div>
            )}
        </EditableElement>
    );
};

export const AlgorithmSheet: React.FC<{ data: AlgorithmData }> = ({ data }) => {
    return (
        <div className="h-full flex flex-col">
            <PedagogicalHeader title={data.title} instruction={data.instruction || "Algoritmanın adımlarını takip et ve çöz."} note={data.pedagogicalNote} />
            
            <div className="mb-10 p-6 bg-zinc-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><i className="fa-solid fa-brain text-8xl"></i></div>
                <h4 className="text-xs font-black uppercase text-indigo-400 mb-2">Problem Senaryosu</h4>
                <p className="text-lg font-bold leading-relaxed"><EditableText value={data.challenge} tag="span" /></p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-8 relative max-w-lg mx-auto py-4">
                {(data.steps || []).map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="w-full relative">
                            <FlowStep step={step} />
                        </div>
                        {idx < data.steps.length - 1 && (
                            <div className="h-8 w-1 bg-zinc-200 relative">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-zinc-200"></div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-auto p-6 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl text-center">
                 <h4 className="text-xs font-black text-zinc-400 uppercase mb-4 tracking-widest">Senin Algoritman</h4>
                 <div className="grid grid-cols-4 gap-4">
                     {[1, 2, 3, 4].map(i => (
                         <div key={i} className="aspect-square bg-white border-2 border-zinc-200 rounded-xl flex items-center justify-center font-bold text-zinc-300 text-2xl">?</div>
                     ))}
                 </div>
            </div>
        </div>
    );
};
