import React from 'react';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const BasicOperationsSheet = ({ data }: { data: any }) => {
    const rawData = data as any;
    const resolvedData = rawData?.data || rawData;
    const content = resolvedData?.content || rawData?.content || rawData;
    const title = resolvedData.title || rawData.title || 'Temel Matematik İşlemleri';
    const instruction = resolvedData.instruction || rawData.instruction || 'Aşağıdaki matematik işlemlerini dikkatlice yapınız ve sonuçları kutucuklara yazınız.';
    const problems = resolvedData.problems || rawData.problems || content.problems || content.items || [];

    return (
        <div className="flex flex-col font-lexend p-2 bg-white min-h-[297mm]">
            <PedagogicalHeader title={title} instruction={instruction} data={resolvedData} />

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 print:gap-4 mt-6 print:mt-4 content-start flex-1">
                {problems.map((prob: any, i: number) => {
                    return (
                        <div key={i} className="p-4 print:p-3 border-[2px] border-zinc-900 rounded-2xl bg-zinc-50 shadow-sm flex flex-col gap-3 print:gap-2 break-inside-avoid relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-8 h-8 bg-zinc-900 text-white rounded-bl-2xl flex items-center justify-center font-black text-xs z-10 shadow-sm">{i + 1}</div>

                            <div className="flex-1 flex flex-col items-center justify-center pt-2">
                                <div className="text-2xl font-black justify-center items-center text-center text-zinc-800 tracking-wider">
                                    <EditableText value={prob.question} tag="div" />
                                </div>
                                {prob.visualHint && (
                                    <div className="mt-2 text-[8px] font-bold text-zinc-500 uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <EditableText value={prob.visualHint} tag="div" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto border-t-2 border-dashed border-zinc-200 pt-3 relative">
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-zinc-50 px-2 text-[7px] font-black text-zinc-400 uppercase tracking-widest">
                                    Cevap
                                </div>
                                <div className="h-10 w-full rounded-xl bg-white border-2 border-indigo-100 shadow-inner"></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
