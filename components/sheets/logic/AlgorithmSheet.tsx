
import React from 'react';
import { AlgorithmData, AlgorithmStep } from '../../../types';
import { PedagogicalHeader, FlowArrow } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const StepShape: React.FC<{ step: AlgorithmStep }> = ({ step }) => {
    let shapeClass = "border-[4px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none";
    let icon = "fa-gear";
    let colorClass = "border-zinc-900 bg-white text-zinc-900";

    switch (step.type) {
        case 'start':
            shapeClass += " rounded-full px-12";
            icon = "fa-play";
            colorClass = "border-emerald-600 bg-emerald-50 text-emerald-800";
            break;
        case 'end':
            shapeClass += " rounded-full px-12";
            icon = "fa-stop";
            colorClass = "border-rose-600 bg-rose-50 text-rose-800";
            break;
        case 'decision':
            shapeClass += " rounded-[3rem] skew-x-[-12deg]"; 
            icon = "fa-code-branch";
            colorClass = "border-amber-500 bg-amber-50 text-amber-900";
            break;
        case 'input':
        case 'output':
            shapeClass += " rounded-2xl border-dashed";
            icon = "fa-right-to-bracket";
            colorClass = "border-indigo-400 bg-indigo-50 text-indigo-900";
            break;
        default:
            shapeClass += " rounded-[2.5rem]";
    }

    return (
        <div className="flex flex-col items-center w-full max-w-lg group">
            <EditableElement className={`${shapeClass} ${colorClass} flex items-center gap-6 w-full relative`}>
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border-2 border-current">
                    <i className={`fa-solid ${icon} text-xl`}></i>
                </div>
                <div className="flex-1">
                    {step.type === 'decision' && <span className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1 block">MANTIKSAL SEÇİM</span>}
                    <p className="text-xl font-black tracking-tight leading-tight uppercase">
                        <EditableText value={step.text} tag="span" />
                    </p>
                </div>
                {step.type === 'decision' && (
                    <div className="absolute -right-24 top-1/2 -translate-y-1/2 flex flex-col gap-2 no-print">
                         <div className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white">EVET</div>
                         <div className="bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white">HAYIR</div>
                    </div>
                )}
            </EditableElement>
        </div>
    );
};

export const AlgorithmSheet: React.FC<{ data: AlgorithmData }> = ({ data }) => {
    return (
        <div className="h-full flex flex-col text-black font-lexend p-2 overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            <div className="mb-12 p-10 bg-zinc-900 text-white rounded-[4rem] shadow-2xl relative overflow-hidden border-8 border-white">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 -translate-y-10 translate-x-10">
                    <i className="fa-solid fa-microchip text-[15rem]"></i>
                </div>
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-4xl text-indigo-400 border border-white/20 shadow-inner">
                        <i className="fa-solid fa-robot animate-bounce"></i>
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase text-indigo-400 mb-3 tracking-[0.5em]">ALGORİTMA GÖREVİ</h4>
                        <p className="text-3xl font-black leading-tight tracking-tighter uppercase">
                            <EditableText value={data.challenge} tag="span" />
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2 relative py-4 w-full">
                {(data.steps || []).map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <StepShape step={step} />
                        {idx < data.steps.length - 1 && <FlowArrow />}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-12 p-10 border-4 border-dashed border-zinc-200 rounded-[4rem] bg-zinc-50/50 flex flex-col items-center">
                <h5 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-6">MANTIKSAL ANALİZ VE ÇÖZÜM ALANI</h5>
                <div className="grid grid-cols-2 gap-12 w-full h-48">
                    <div className="border-b-4 border-zinc-300 relative">
                        <span className="absolute bottom-2 left-0 text-[10px] font-bold text-zinc-300">GİRDİLER</span>
                    </div>
                    <div className="border-b-4 border-zinc-300 relative">
                         <span className="absolute bottom-2 left-0 text-[10px] font-bold text-zinc-300">ÇIKTILAR</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
