
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
    const baseClass = "p-5 border-[3px] rounded-2xl flex items-center gap-5 shadow-sm min-h-[85px] transition-all relative w-full";
    let typeClass = "border-zinc-800 bg-white";
    
    if (step.type === 'start') typeClass = "border-green-600 bg-green-50 font-black uppercase text-green-800 rounded-full text-lg ring-4 ring-green-100/50";
    if (step.type === 'end') typeClass = "border-red-600 bg-red-50 font-black uppercase text-red-800 rounded-full text-lg ring-4 ring-red-100/50";
    if (step.type === 'decision') typeClass = "border-amber-500 bg-amber-50 rounded-[2.5rem] shadow-amber-100";
    if (step.type === 'input' || step.type === 'output') typeClass = "border-indigo-400 bg-indigo-50/50 italic";
    if (step.type === 'process') typeClass = "border-zinc-700 bg-white font-bold";

    return (
        <EditableElement className={`${baseClass} ${typeClass}`}>
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-zinc-100">
                <StepIcon type={step.type} />
            </div>
            <div className="flex-1">
                {step.type === 'decision' && <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest block mb-1">EVET / HAYIR ?</span>}
                <p className="text-sm md:text-base font-bold text-zinc-800 leading-snug"><EditableText value={step.text} tag="span" /></p>
            </div>
            
            {step.type === 'decision' && (
                <div className="flex gap-10 absolute -bottom-12 left-1/2 -translate-x-1/2 z-10 print:gap-14">
                    <div className="flex flex-col items-center">
                        <div className="w-0.5 h-8 bg-amber-500"></div>
                        <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-[9px] font-black shadow-md border-2 border-white">EVET</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-0.5 h-8 bg-amber-500"></div>
                        <span className="bg-rose-600 text-white px-4 py-1 rounded-full text-[9px] font-black shadow-md border-2 border-white">HAYIR</span>
                    </div>
                </div>
            )}
        </EditableElement>
    );
};

export const AlgorithmSheet: React.FC<{ data: AlgorithmData }> = ({ data }) => {
    return (
        <div className="h-full flex flex-col text-black font-lexend">
            <PedagogicalHeader 
                title={data.title} 
                instruction={data.instruction || "Algoritmanın mantığını çöz ve adımları takip et."} 
                note={data.pedagogicalNote} 
            />
            
            <div className="mb-8 p-8 bg-zinc-50 text-zinc-900 rounded-[2.5rem] shadow-inner relative overflow-hidden border-2 border-zinc-200">
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><i className="fa-solid fa-microchip text-9xl"></i></div>
                <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase text-indigo-500 mb-3 tracking-[0.2em] flex items-center gap-2">
                        <i className="fa-solid fa-puzzle-piece"></i> PROBLEM SENARYOSU
                    </h4>
                    <p className="text-lg md:text-xl font-bold leading-relaxed"><EditableText value={data.challenge} tag="span" /></p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-14 relative max-w-lg mx-auto py-6 w-full">
                {(data.steps || []).map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="w-full relative z-10">
                            <FlowStep step={step} />
                        </div>
                        {idx < data.steps.length - 1 && (
                            <div className="h-14 w-0.5 bg-zinc-300 relative">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1.5 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-transparent border-t-zinc-400"></div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-12 p-8 bg-white border-2 border-zinc-100 rounded-[3rem] text-center shadow-sm break-inside-avoid">
                 <h4 className="text-xs font-black text-zinc-400 uppercase mb-6 tracking-[0.2em]">SENİN ÇÖZÜMÜN</h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     {[1, 2, 3, 4].map(i => (
                         <div key={i} className="flex flex-col items-center gap-3">
                            <div className="w-full aspect-square bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center font-black text-zinc-200 text-4xl">
                                {i}
                            </div>
                            <div className="w-full h-0.5 border-b border-zinc-100"></div>
                         </div>
                     ))}
                 </div>
            </div>
            
            <div className="mt-auto pt-4 text-center">
                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.3em]">Bursa Disleksi AI • Algoritmik Düşünce Atölyesi</p>
            </div>
        </div>
    );
};
