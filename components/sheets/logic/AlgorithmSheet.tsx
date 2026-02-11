
import React from 'react';
import { AlgorithmData, AlgorithmStep } from '../../../types';
import { PedagogicalHeader, FlowArrow } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const StepShape: React.FC<{ step: AlgorithmStep }> = ({ step }) => {
    let shapeClass = "border-[3px] p-6 shadow-md transition-all hover:scale-[1.03] duration-500 min-h-[80px]";
    let icon = "fa-gear";
    let colorClass = "border-zinc-800 bg-white text-zinc-900";

    switch (step.type) {
        case 'start':
            shapeClass += " rounded-full px-12";
            icon = "fa-play";
            colorClass = "border-emerald-600 bg-emerald-50 text-emerald-800 ring-8 ring-emerald-50/50";
            break;
        case 'end':
            shapeClass += " rounded-full px-12";
            icon = "fa-stop";
            colorClass = "border-rose-600 bg-rose-50 text-rose-800 ring-8 ring-rose-50/50";
            break;
        case 'decision':
            shapeClass += " rounded-[3rem] rotate-0 transform hover:rotate-1"; 
            icon = "fa-code-branch";
            colorClass = "border-amber-500 bg-amber-50 text-amber-700 shadow-amber-100";
            break;
        case 'input':
        case 'output':
            shapeClass += " rounded-xl skew-x-[-12deg]";
            icon = step.type === 'input' ? "fa-right-to-bracket" : "fa-right-from-bracket";
            colorClass = "border-indigo-500 bg-indigo-50 text-indigo-800";
            break;
        default:
            shapeClass += " rounded-3xl";
            icon = "fa-gear";
    }

    return (
        <div className="flex flex-col items-center w-full max-w-lg group">
            <EditableElement className={`${shapeClass} ${colorClass} flex items-center gap-6 w-full relative overflow-visible`}>
                <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center shadow-inner border border-zinc-100 shrink-0">
                    <i className={`fa-solid ${icon} text-xl`}></i>
                </div>
                <div className="flex-1">
                    {step.type === 'decision' && <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest block mb-1">Karar Noktası</span>}
                    <p className="text-lg font-black tracking-tight leading-tight">
                        <EditableText value={step.text} tag="span" />
                    </p>
                </div>
                
                {step.type === 'decision' && (
                    <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex flex-col items-start gap-4 no-print">
                         <div className="flex flex-col items-center">
                            <div className="h-0.5 w-10 bg-amber-400"></div>
                            <span className="text-[10px] font-black text-emerald-600 bg-white px-3 py-1 rounded-full border-2 border-emerald-200 shadow-sm">EVET</span>
                         </div>
                         <div className="flex flex-col items-center">
                            <div className="h-0.5 w-10 bg-amber-400"></div>
                            <span className="text-[10px] font-black text-rose-600 bg-white px-3 py-1 rounded-full border-2 border-rose-200 shadow-sm">HAYIR</span>
                         </div>
                    </div>
                )}
            </EditableElement>
        </div>
    );
};

export const AlgorithmSheet: React.FC<{ data: AlgorithmData }> = ({ data }) => {
    const steps = data.steps || [];

    return (
        <div className="h-full flex flex-col text-black font-lexend p-2 overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            <div className="mb-12 p-10 bg-zinc-900 text-white rounded-[4rem] shadow-2xl relative overflow-hidden border-4 border-white ring-2 ring-zinc-100">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 -translate-y-4 translate-x-4"><i className="fa-solid fa-microchip text-[12rem]"></i></div>
                <div className="relative z-10">
                    <h4 className="text-[11px] font-black uppercase text-indigo-400 mb-4 tracking-[0.5em] flex items-center gap-3">
                        <i className="fa-solid fa-brain-circuit animate-pulse"></i> PROBLEM SENARYOSU
                    </h4>
                    <p className="text-2xl md:text-3xl font-black leading-tight tracking-tight">
                        <EditableText value={data.challenge} tag="span" />
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-0 relative py-8 w-full max-w-3xl mx-auto">
                {steps.length > 0 ? (
                    steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                                <StepShape step={step} />
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="py-2 opacity-30">
                                    <FlowArrow />
                                </div>
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    <div className="p-20 text-center border-4 border-dashed border-zinc-100 rounded-[3rem] w-full">
                        <i className="fa-solid fa-triangle-exclamation text-amber-500 text-5xl mb-4"></i>
                        <h3 className="text-xl font-black text-zinc-400 uppercase tracking-widest">Adımlar Üretilemedi</h3>
                        <p className="text-zinc-400 mt-2 font-bold">Lütfen AI motoruyla tekrar denemeyi deneyin.</p>
                    </div>
                )}
            </div>

            <div className="mt-16 p-10 bg-zinc-50 border-[3px] border-zinc-200 border-dashed rounded-[4rem] text-center relative overflow-hidden break-inside-avoid">
                 <h4 className="text-xs font-black text-zinc-400 uppercase mb-8 tracking-[0.3em] flex items-center justify-center gap-4">
                    <div className="h-0.5 w-12 bg-zinc-200"></div>
                    AKILLI ÇÖZÜM VE ANALİZ ALANI
                    <div className="h-0.5 w-12 bg-zinc-200"></div>
                 </h4>
                 <div className="grid grid-cols-2 gap-10 min-h-[200px]">
                    <div className="border-b-2 border-zinc-300 relative">
                        <span className="absolute -top-6 left-0 text-[10px] font-black text-zinc-300 uppercase">Öğrenci Notları</span>
                    </div>
                    <div className="border-b-2 border-zinc-300 relative">
                         <span className="absolute -top-6 left-0 text-[10px] font-black text-zinc-300 uppercase">Mantıksal Sonuç</span>
                    </div>
                 </div>
            </div>
            
            <div className="mt-auto pt-10 flex justify-between items-center px-10 opacity-30 border-t border-zinc-100">
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Mantıksal Akış Laboratuvarı v4.0</p>
                <div className="flex gap-4">
                     <i className="fa-solid fa-diagram-project"></i>
                     <i className="fa-solid fa-code-merge"></i>
                </div>
            </div>
        </div>
    );
};
