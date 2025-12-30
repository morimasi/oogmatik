
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
    const baseClass = "p-4 border-4 rounded-2xl flex items-center gap-4 shadow-md min-h-[70px] transition-all hover:scale-[1.02] relative w-full";
    let typeClass = "border-zinc-800 bg-white";
    
    if (step.type === 'start') typeClass = "border-green-600 bg-green-50 font-black uppercase text-green-800 rounded-full";
    if (step.type === 'end') typeClass = "border-red-600 bg-red-50 font-black uppercase text-red-800 rounded-full";
    if (step.type === 'decision') typeClass = "border-amber-500 bg-amber-50 rounded-[3rem] shadow-amber-200/50";
    if (step.type === 'input' || step.type === 'output') typeClass = "border-indigo-500 bg-indigo-50 italic";
    if (step.type === 'process') typeClass = "border-blue-600 bg-blue-50 font-bold";

    return (
        <EditableElement className={`${baseClass} ${typeClass}`}>
            <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0 shadow-inner">
                <StepIcon type={step.type} />
            </div>
            <div className="flex-1">
                {step.type === 'decision' && <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-0.5">KARAR NOKTASI</span>}
                <p className="text-sm md:text-base font-bold text-zinc-800 leading-tight"><EditableText value={step.text} tag="span" /></p>
            </div>
            
            {step.type === 'decision' && (
                <div className="flex gap-6 absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex flex-col items-center">
                        <div className="w-0.5 h-6 bg-amber-500"></div>
                        <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-lg">EVET</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-0.5 h-6 bg-amber-500"></div>
                        <span className="bg-rose-600 text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-lg">HAYIR</span>
                    </div>
                </div>
            )}
        </EditableElement>
    );
};

export const AlgorithmSheet: React.FC<{ data: AlgorithmData }> = ({ data }) => {
    return (
        <div className="h-full flex flex-col text-black font-lexend">
            <PedagogicalHeader title={data.title} instruction={data.instruction || "Algoritmanın mantığını çöz ve adımları takip et."} note={data.pedagogicalNote} />
            
            <div className="mb-12 p-8 bg-zinc-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden border-4 border-indigo-500/30">
                <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><i className="fa-solid fa-microchip text-9xl"></i></div>
                <div className="relative z-10">
                    <h4 className="text-xs font-black uppercase text-indigo-400 mb-3 tracking-[0.2em] flex items-center gap-2">
                        <i className="fa-solid fa-puzzle-piece"></i> PROBLEM SENARYOSU
                    </h4>
                    <p className="text-xl font-bold leading-relaxed italic"><EditableText value={data.challenge} tag="span" /></p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-12 relative max-w-lg mx-auto py-10">
                {(data.steps || []).map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="w-full relative">
                            <FlowStep step={step} />
                        </div>
                        {idx < data.steps.length - 1 && (
                            <div className="h-12 w-1 bg-zinc-800 relative">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1.5 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[14px] border-transparent border-t-zinc-800"></div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-16 p-10 bg-indigo-50 border-4 border-dashed border-indigo-200 rounded-[4rem] text-center shadow-inner">
                 <h4 className="text-sm font-black text-indigo-800 uppercase mb-8 tracking-[0.3em]">SENİN ÇÖZÜM ALGORİTMAN</h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                     {[1, 2, 3, 4].map(i => (
                         <div key={i} className="flex flex-col items-center gap-4">
                            <div className="w-full aspect-square bg-white border-4 border-indigo-100 rounded-3xl flex items-center justify-center font-black text-indigo-200 text-5xl shadow-sm italic transition-all hover:border-indigo-400 hover:text-indigo-400 cursor-text">
                                {i}
                            </div>
                            <div className="w-full h-0.5 border-b-2 border-indigo-200 border-dashed"></div>
                         </div>
                     ))}
                 </div>
                 <p className="mt-8 text-[11px] text-indigo-400 font-black uppercase tracking-widest bg-white/50 py-2 px-4 rounded-full inline-block">
                    Yukarıdaki boşluklara kendi çözüm adımlarını çizerek veya yazarak aktar.
                 </p>
            </div>
        </div>
    );
};
