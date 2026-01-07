
import React from 'react';
import { AlgorithmData, AlgorithmStep } from '../../types';
import { PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

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

const FlowStep: React.FC<{ step: AlgorithmStep }> = ({ step }) => {
    const baseClass = "p-6 border-[3px] rounded-[2rem] flex items-center gap-6 shadow-sm min-h-[90px] transition-all relative w-full group/step";
    let typeClass = "border-zinc-800 bg-white";
    
    if (step.type === 'start') typeClass = "border-emerald-600 bg-emerald-50 font-black uppercase text-emerald-800 rounded-full ring-8 ring-emerald-100/50";
    if (step.type === 'end') typeClass = "border-rose-600 bg-rose-50 font-black uppercase text-rose-800 rounded-full ring-8 ring-rose-100/50";
    if (step.type === 'decision') typeClass = "border-amber-500 bg-amber-50 rounded-[3rem] shadow-amber-100 rotate-0";
    if (step.type === 'input' || step.type === 'output') typeClass = "border-indigo-400 bg-indigo-50/30 italic";
    if (step.type === 'process') typeClass = "border-zinc-800 bg-white font-bold";

    return (
        <EditableElement className={`${baseClass} ${typeClass}`}>
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg border border-zinc-100 group-hover/step:scale-110 transition-transform">
                <StepIcon type={step.type} />
            </div>
            <div className="flex-1">
                {step.type === 'decision' && <span className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] block mb-1">MANTIKSAL KARAR: EVET / HAYIR</span>}
                <p className="text-base md:text-lg font-black text-zinc-800 leading-tight tracking-tight">
                    <EditableText value={step.text} tag="span" />
                </p>
            </div>
            
            {step.type === 'decision' && (
                <div className="flex gap-16 absolute -bottom-14 left-1/2 -translate-x-1/2 z-10 print:gap-20">
                    <div className="flex flex-col items-center">
                        <div className="w-0.5 h-10 bg-amber-500"></div>
                        <span className="bg-emerald-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black shadow-xl border-2 border-white uppercase tracking-widest">EVET</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-0.5 h-10 bg-amber-500"></div>
                        <span className="bg-rose-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black shadow-xl border-2 border-white uppercase tracking-widest">HAYIR</span>
                    </div>
                </div>
            )}
        </EditableElement>
    );
};

export const AlgorithmSheet: React.FC<{ data: AlgorithmData }> = ({ data }) => {
    return (
        <div className="h-full flex flex-col text-black font-lexend p-2 overflow-visible">
            <PedagogicalHeader 
                title={data.title} 
                instruction={data.instruction || "Algoritmanın akışını takip et ve problem çözümünü tamamla."} 
                note={data.pedagogicalNote} 
                data={data}
            />
            
            <div className="mb-10 p-10 bg-zinc-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden border-4 border-white">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 -translate-y-4 translate-x-4"><i className="fa-solid fa-microchip text-[12rem]"></i></div>
                <div className="relative z-10">
                    <h4 className="text-[11px] font-black uppercase text-indigo-400 mb-4 tracking-[0.4em] flex items-center gap-3">
                        <i className="fa-solid fa-brain-circuit animate-pulse"></i> PROBLEM SENARYOSU
                    </h4>
                    <p className="text-xl md:text-2xl font-black leading-snug tracking-tight">
                        <EditableText value={data.challenge} tag="span" />
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-16 relative max-w-xl mx-auto py-8 w-full">
                {/* Background flow line */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-zinc-100 z-0"></div>

                {(data.steps || []).map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                            <FlowStep step={step} />
                        </div>
                        {idx < data.steps.length - 1 && (
                            <div className="h-16 w-1.5 bg-zinc-900 relative z-0">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2.5 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[15px] border-transparent border-t-zinc-900"></div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-16 p-10 bg-white border-[3px] border-zinc-900 rounded-[4rem] text-center shadow-sm break-inside-avoid relative overflow-hidden">
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-50"></div>
                 <h4 className="text-xs font-black text-zinc-900 uppercase mb-8 tracking-[0.3em] flex items-center justify-center gap-3">
                    <div className="h-0.5 w-10 bg-zinc-200"></div>
                    AKILLI ÇÖZÜM ALANI
                    <div className="h-0.5 w-10 bg-zinc-200"></div>
                 </h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                     {[1, 2, 3, 4].map(i => (
                         <div key={i} className="flex flex-col items-center gap-4 group/box">
                            <div className="w-full aspect-square bg-zinc-50 border-[3px] border-dashed border-zinc-200 rounded-[2rem] flex items-center justify-center font-black text-zinc-200 text-5xl transition-all group-hover/box:border-indigo-400 group-hover/box:bg-white">
                                {i}
                            </div>
                            <div className="w-1/2 h-1 bg-zinc-100 rounded-full group-hover/box:bg-indigo-200 transition-colors"></div>
                         </div>
                     ))}
                 </div>
            </div>
            
            <div className="mt-auto pt-8 flex justify-between items-center px-10 opacity-30">
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Mantıksal Akış Laboratuvarı v3.5</p>
                <div className="flex gap-4">
                     <i className="fa-solid fa-diagram-project"></i>
                     <i className="fa-solid fa-code-merge"></i>
                </div>
            </div>
        </div>
    );
};
