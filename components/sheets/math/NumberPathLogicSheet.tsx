
import React from 'react';
import { NumberPathLogicData } from '../../../types';
import { PedagogicalHeader, Shape } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const NumberPathLogicSheet: React.FC<{ data: NumberPathLogicData }> = ({ data }) => {
    return (
        <div className="flex flex-col h-full font-lexend p-2 text-black bg-white overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            {/* LEJANT (Legend) - Premium Card Style */}
            <div className="mt-4 mb-10 bg-zinc-900 text-white p-8 rounded-[3rem] shadow-2xl border-4 border-white flex justify-around items-center break-inside-avoid relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><i className="fa-solid fa-code-branch text-[10rem]"></i></div>
                <div className="absolute -left-10 bottom-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
                
                {data.legend.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-3 group cursor-default relative z-10">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border-[3px] transition-transform group-hover:scale-110" style={{ color: item.color, borderColor: item.color }}>
                            <Shape name={item.symbol as any} className="w-10 h-10 stroke-[4px]" />
                        </div>
                        <div className="bg-zinc-800 px-5 py-1.5 rounded-full border border-zinc-700 font-mono font-black text-2xl tracking-widest text-indigo-400 shadow-inner">
                            {item.operation}{item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* ZİNCİRLER (Chains) */}
            <div className="flex-1 flex flex-col gap-8 w-full content-start">
                {(data.chains || []).map((chain, idx) => (
                    <EditableElement key={idx} className="flex items-center p-5 border-[3px] border-zinc-100 rounded-[2.5rem] bg-white shadow-sm break-inside-avoid group hover:border-indigo-500 transition-all overflow-x-auto no-scrollbar">
                        
                        {/* BAŞLANGIÇ */}
                        <div className="flex flex-col items-center gap-2 shrink-0 mr-4">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">GİRİŞ</span>
                            <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black text-3xl shadow-xl border-4 border-white ring-2 ring-zinc-100">
                                {chain.startNumber}
                            </div>
                        </div>

                        {/* ADIMLAR */}
                        {chain.steps.map((step, sIdx) => {
                            const lgItem = data.legend.find(l => l.symbol === step.symbol);
                            const color = lgItem?.color || '#000';
                            
                            return (
                                <React.Fragment key={sIdx}>
                                    {/* OK VE SEMBOL */}
                                    <div className="flex flex-col items-center justify-center mx-1 shrink-0 w-20 relative">
                                        <div className="h-1.5 w-full bg-zinc-100 absolute top-1/2 -translate-y-1/2 -z-10"></div>
                                        <div className="w-12 h-12 bg-white border-[3px] rounded-2xl flex items-center justify-center shadow-md z-10 group-hover:scale-110 transition-transform" style={{ borderColor: color, color: color }}>
                                            <Shape name={step.symbol as any} className="w-7 h-7 stroke-[3px]" />
                                        </div>
                                    </div>

                                    {/* İŞLEM KUTUSU */}
                                    <div className="flex flex-col items-center gap-2 shrink-0">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner border-[3px] transition-colors ${sIdx === chain.steps.length - 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-white border-dashed border-zinc-200 text-zinc-200'}`}>
                                            {sIdx === chain.steps.length - 1 ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs absolute -top-4 text-indigo-400 font-bold">CEVAP: {step.expectedValue}</span>
                                                    ?
                                                </div>
                                            ) : ''}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        
                        <div className="ml-8 opacity-10 group-hover:opacity-50 transition-all group-hover:scale-110">
                            <i className="fa-solid fa-flag-checkered text-3xl text-zinc-900"></i>
                        </div>
                    </EditableElement>
                ))}
            </div>

            <div className="mt-auto pt-8 flex justify-between items-center px-10 border-t border-zinc-50 opacity-40">
                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Sembolik Mantık Modülü v1.0</p>
                <div className="flex gap-3">
                    <i className="fa-solid fa-diagram-next"></i>
                    <i className="fa-solid fa-brain"></i>
                </div>
            </div>
        </div>
    );
};
