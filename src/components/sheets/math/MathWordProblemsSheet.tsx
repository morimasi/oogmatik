import React from 'react';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const MathWordProblemsSheet = ({ data }: { data: any }) => {
    const rawData = data as any;
    const resolvedData = rawData?.data || rawData;
    const content = resolvedData?.content || rawData?.content || rawData;
    const title = resolvedData.title || rawData.title || 'Sözel Problemler';
    const instruction = resolvedData.instruction || rawData.instruction || 'Aşağıdaki problemleri dikkatlice okuyup çözümlerini bulunuz.';
    const problems = resolvedData.problems || rawData.problems || content.problems || content.items || [];

    return (
        <div className="flex flex-col font-lexend p-2 bg-white min-h-[297mm]">
            <PedagogicalHeader title={title} instruction={instruction} data={resolvedData} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 mt-6 print:mt-4 content-start flex-1">
                {problems.map((prob: any, i: number) => {
                    return (
                        <div key={i} className="p-5 print:p-4 border-[2px] border-zinc-900 rounded-3xl bg-white shadow-sm flex flex-col gap-4 print:gap-3 break-inside-avoid relative overflow-hidden group">
                            <div className="absolute top-3 left-3 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-xs z-10 shadow-md ring-2 ring-indigo-200">{i + 1}</div>

                            <div className="flex-1 flex flex-col pl-10 pt-1">
                                <div className="text-sm font-bold text-zinc-800 leading-relaxed mb-4">
                                    <EditableText value={prob.question} tag="div" />
                                </div>
                                {prob.visualHint && (
                                    <div className="text-[9px] font-bold text-indigo-500 bg-indigo-50 p-2 rounded-lg border border-indigo-100 mb-4 inline-block self-start">
                                        <i className="fa-solid fa-lightbulb mr-1.5 opacity-70"></i>
                                        {prob.visualHint}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 h-20 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-100 to-transparent">
                                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest rotate-[-5deg]">İşlem Alanı</span>
                                </div>
                                <div className="w-16 flex flex-col gap-1 items-center justify-end">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Sonuç</span>
                                    <div className="w-16 h-12 border-2 border-zinc-900 rounded-xl bg-white shadow-inner"></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
