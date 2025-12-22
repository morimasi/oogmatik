
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
        case 'input': return <i className="fa-solid fa-right-to-bracket text-indigo-500"></i>;
        case 'output': return <i className="fa-solid fa-right-from-bracket text-purple-500"></i>;
        default: return <i className="fa-solid fa-arrow-right text-zinc-400"></i>;
    }
};

const FlowStep: React.FC<{ step: AlgorithmStep }> = ({ step }) => {
    const baseClass = "p-4 border-2 rounded-2xl flex items-center gap-3 shadow-sm min-h-[60px] transition-all hover:shadow-md relative w-full";
    let typeClass = "border-zinc-200 bg-white";
    
    if (step.type === 'start' || step.type === 'end') typeClass = "border-zinc-800 bg-zinc-50 font-black uppercase tracking-widest";
    if (step.type === 'decision') typeClass = "border-amber-400 bg-amber-50 rounded-[2.5rem]";
    if (step.type === 'input' || step.type === 'output') typeClass = "border-indigo-200 bg-indigo-50 italic";

    return (
        <EditableElement className={`${baseClass} ${typeClass}`}>
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <StepIcon type={step.type} />
            </div>
            <p className="text-sm font-bold flex-1"><EditableText value={step.text} tag="span" /></p>
            
            {step.type === 'decision' && (
                <div className="flex gap-4 absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex flex-col items-center">
                        <div className="w-0.5 h-4 bg-amber-400"></div>
                        <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px] font-black shadow-sm">EVET</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-0.5 h-4 bg-amber-400"></div>
                        <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-[8px] font-black shadow-sm">HAYIR</span>
                    </div>
                </div>
            )}
        </EditableElement>
    );
};

export const AlgorithmSheet: React.FC<{ data: AlgorithmData }> = ({ data }) => {
    return (
        <div className="h-full flex flex-col text-black">
            <PedagogicalHeader title={data.title} instruction={data.instruction || "Algoritmanın adımlarını takip et ve çöz."} note={data.pedagogicalNote} />
            
            <div className="mb-10 p-6 bg-zinc-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><i className="fa-solid fa-brain text-8xl"></i></div>
                <h4 className="text-xs font-black uppercase text-indigo-400 mb-2 tracking-widest">Problem Senaryosu</h4>
                <p className="text-lg font-bold leading-relaxed font-dyslexic"><EditableText value={data.challenge} tag="span" /></p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-10 relative max-w-md mx-auto py-8">
                {(data.steps || []).map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="w-full relative">
                            <FlowStep step={step} />
                        </div>
                        {idx < data.steps.length - 1 && (
                            <div className="h-10 w-1 bg-zinc-300 relative">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-0 h-0 border-l-6 border-r-6 border-t-8 border-transparent border-t-zinc-300"></div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-12 p-8 bg-zinc-50 border-4 border-dashed border-zinc-200 rounded-[3rem] text-center">
                 <h4 className="text-xs font-black text-zinc-400 uppercase mb-6 tracking-widest">Senin Çözüm Algoritman</h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     {[1, 2, 3, 4].map(i => (
                         <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-full aspect-video bg-white border-2 border-zinc-200 rounded-2xl flex items-center justify-center font-bold text-zinc-200 text-3xl shadow-inner italic">
                                {i}
                            </div>
                            <div className="w-full h-2 border-b border-zinc-300 border-dashed"></div>
                         </div>
                     ))}
                 </div>
                 <p className="mt-6 text-[10px] text-zinc-400 font-bold uppercase">Kendi çözüm adımlarını yukarıdaki kutulara çizerek veya yazarak anlat.</p>
            </div>
        </div>
    );
};
