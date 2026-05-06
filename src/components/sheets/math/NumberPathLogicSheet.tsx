
import React from 'react';
import { NumberPathLogicData, AbcConnectData } from '../../../types';
import { PedagogicalHeader, Shape } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const NumberPathLogicSheet = ({ data }: { data: NumberPathLogicData }) => {
    return (
        <div className="flex flex-col h-full font-lexend p-2 text-black bg-white overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />

            {/* LEJANT (Legend) - Premium Card Style */}
            <div className="mt-2 print:mt-1 mb-4 print:mb-2 bg-zinc-900 text-white p-4 print:p-2 rounded-[2rem] shadow-xl border-4 border-white flex justify-around items-center break-inside-avoid relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><i className="fa-solid fa-code-branch text-[6rem]"></i></div>
                <div className="absolute -left-10 bottom-0 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl"></div>

                {data.legend.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 group cursor-default relative z-10">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border-[2px]" style={{ color: item.color, borderColor: item.color }}>
                            <Shape name={item.symbol as any} className="w-6 h-6 stroke-[3px]" />
                        </div>
                        <div className="bg-zinc-800 px-3 print:px-2 py-0.5 rounded-full border border-zinc-700 font-mono font-black text-sm tracking-widest text-indigo-400 shadow-inner">
                            {item.operation}{item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* ZİNCİRLER (Chains) */}
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 w-full content-start print:pb-2">
                {(data.chains || []).map((chain, idx) => (
                    <EditableElement key={idx} className="flex items-center p-2 print:p-1.5 border-[2px] border-zinc-100 rounded-[1.5rem] bg-white shadow-sm break-inside-avoid group overflow-hidden">
                        
                        {/* BAŞLANGIÇ */}
                        <div className="flex flex-col items-center gap-1 shrink-0 mr-1.5">
                            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-wider">GİRİŞ</span>
                            <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md border-2 border-white ring-1 ring-zinc-100">
                                {chain.startNumber}
                            </div>
                        </div>

                        {/* ADIMLAR */}
                        <div className="flex-1 flex items-center justify-around overflow-hidden">
                            {chain.steps.map((step, sIdx) => {
                                const lgItem = data.legend.find(l => l.symbol === step.symbol);
                                const color = lgItem?.color || '#000';
                                const isLast = sIdx === chain.steps.length - 1;

                                return (
                                    <React.Fragment key={sIdx}>
                                        <div className="flex flex-col items-center justify-center shrink-0 w-8 relative">
                                            <div className="h-1 w-full bg-zinc-100 absolute top-1/2 -translate-y-1/2 -z-10"></div>
                                            <div className="w-7 h-7 bg-white border-[2px] rounded-lg flex items-center justify-center shadow-sm z-10" style={{ borderColor: color, color: color }}>
                                                <Shape name={step.symbol as any} className="w-4 h-4 stroke-[3px]" />
                                            </div>
                                        </div>
                                        {isLast && (
                                            <div className="flex flex-col items-center shrink-0 ml-1">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner border-[2px] bg-indigo-50 border-indigo-200 text-indigo-800 relative">
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] absolute -top-3 text-indigo-400 font-bold">{step.expectedValue}</span>
                                                    ?
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        
                        <div className="ml-1 opacity-10">
                            <i className="fa-solid fa-flag-checkered text-xl text-zinc-900"></i>
                        </div>
                    </EditableElement>
                ))}
            </div>

            <div className="mt-auto pt-2 flex justify-between items-center px-4 border-t border-zinc-50 opacity-40">
                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.3em]">Bursa Disleksi EduMind • Sembolik Mantık Modülü v2.0</p>
                <div className="flex gap-2 text-[10px]">
                    <i className="fa-solid fa-diagram-next"></i>
                    <i className="fa-solid fa-brain"></i>
                </div>
            </div>
        </div>
    );
};




