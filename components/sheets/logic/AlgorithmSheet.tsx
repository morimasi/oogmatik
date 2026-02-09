
import React from 'react';
import { AlgorithmData, AlgorithmStep } from '../../../types';
import { PedagogicalHeader, FlowArrow } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const StepShape: React.FC<{ step: AlgorithmStep }> = ({ step }) => {
    let shapeClass = "border-[3px] p-5 shadow-sm transition-all group-hover:scale-[1.02]";
    let icon = "fa-gear";
    let colorClass = "border-zinc-800 bg-white text-zinc-900";

    switch (step.type) {
        case 'start':
            shapeClass += " rounded-full px-10";
            icon = "fa-play";
            colorClass = "border-emerald-500 bg-emerald-50 text-emerald-700";
            break;
        case 'end':
            shapeClass += " rounded-full px-10";
            icon = "fa-stop";
            colorClass = "border-rose-500 bg-rose-50 text-rose-700";
            break;
        case 'decision':
            shapeClass += " rounded-[2rem] rotate-0 skew-x-[-10deg]"; // Rhombus-like but readable
            icon = "fa-code-branch";
            colorClass = "border-amber-500 bg-amber-50 text-amber-700";
            break;
        case 'input':
        case 'output':
            shapeClass += " rounded-lg skew-x-[-15deg]";
            icon = "fa-right-to-bracket";
            colorClass = "border-blue-500 bg-blue-50 text-blue-700";
            break;
        default:
            shapeClass += " rounded-2xl";
    }

    return (
        <div className="flex flex-col items-center w-full max-w-md group">
            <EditableElement className={`${shapeClass} ${colorClass} flex items-center gap-5 w-full relative`}>
                <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center shadow-inner">
                    <i className={`fa-solid ${icon}`}></i>
                </div>
                <p className="text-lg font-black tracking-tight leading-tight">
                    <EditableText value={step.text} tag="span" />
                </p>
                {step.type === 'decision' && (
                    <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col items-start no-print">
                         <span className="text-[10px] font-black text-emerald-600 bg-white px-2 rounded border border-emerald-200">EVET</span>
                         <div className="h-px w-10 bg-amber-500 my-1"></div>
                         <span className="text-[10px] font-black text-rose-600 bg-white px-2 rounded border border-rose-200">HAYIR</span>
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
            
            <div className="mb-10 p-8 bg-zinc-900 text-white rounded-[3rem] shadow-xl relative overflow-hidden border-4 border-white">
                <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><i className="fa-solid fa-microchip text-8xl"></i></div>
                <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-[0.4em]">GÖREV TANIMI</h4>
                    <p className="text-2xl font-black leading-tight tracking-tight">
                        <EditableText value={data.challenge} tag="span" />
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-0 relative py-4 w-full">
                {(data.steps || []).map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <StepShape step={step} />
                        {idx < data.steps.length - 1 && <FlowArrow />}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-12 p-8 border-4 border-dashed border-zinc-200 rounded-[3rem] bg-zinc-50/30">
                <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 text-center">Çözüm ve Analiz Alanı</h5>
                <div className="grid grid-cols-2 gap-8 h-40">
                    <div className="border-b-2 border-zinc-300"></div>
                    <div className="border-b-2 border-zinc-300"></div>
                </div>
            </div>
        </div>
    );
};
