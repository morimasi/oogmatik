
import React from 'react';
import { PedagogicalHeader } from '../common';

export const NumberPatternSheet = ({ data }: { data: any }) => {
    const contentData = data?.content || data;
    const targetData = Array.isArray(contentData) ? (contentData[0] || {}) : (contentData || {});
    const patterns = targetData.patterns || data?.patterns || (Array.isArray(data) ? data : []);
    const title = targetData.title || data?.title || 'Sayı Örüntüleri & Dizisel Mantık';
    const instruction = targetData.instruction || data?.instruction || 'Sayı dizilerindeki kuralı keşfet ve soru işaretli kutucuklara doğru sayıları yaz.';

    if (!patterns || !Array.isArray(patterns) || patterns.length === 0) {
        return (
            <div className="p-8 text-center text-zinc-400 font-['Lexend']">
                <p className="text-sm font-bold">Sayı örüntüsü verisi bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col font-['Lexend'] min-h-[297mm] p-4 print:p-2 bg-white transition-all duration-300">
            <PedagogicalHeader
                title={title}
                instruction={instruction}
                data={targetData}
            />

            {/* PATTERNS GRID */}
            <div className="grid grid-cols-2 gap-3 print:gap-2 flex-1 my-2 content-start items-stretch">
                {patterns.map((item: any, idx: number) => (
                    <div
                        key={item.id || idx}
                        className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/40 to-white p-3 print:p-2 flex flex-col justify-between shadow-2xs relative overflow-hidden"
                    >
                        {/* Number Badge */}
                        <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5 mb-1.5">
                            <div className="flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shadow-2xs">
                                    {idx + 1}
                                </span>
                                <span className="text-[9px] font-black uppercase text-indigo-900 tracking-wider">
                                    Örüntü Dizisi #{idx + 1}
                                </span>
                            </div>
                            <span className="text-[8px] font-bold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                                {item.ruleType === 'add' ? 'Toplama' : item.ruleType === 'subtract' ? 'Çıkarma' : item.ruleType === 'multiply' ? 'Çarpma' : item.ruleType === 'fibonacci' ? 'Fibonacci' : 'Dizi'}
                            </span>
                        </div>

                        {/* Sequence Train Cards */}
                        <div className="flex-1 flex flex-col justify-center my-1">
                            <div className="flex items-center justify-center gap-1.5 print:gap-1 flex-wrap">
                                {item.sequence?.map((val: number | null, sIdx: number) => (
                                    <div key={sIdx} className="flex items-center gap-1">
                                        <div
                                            className={`w-9 h-10 print:w-8 print:h-9 rounded-xl border-2 flex items-center justify-center font-black text-xs print:text-[11px] shadow-2xs transition-all ${val === null
                                                ? 'border-dashed border-amber-400 bg-amber-50 text-amber-600 font-extrabold animate-pulse'
                                                : 'border-indigo-200 bg-white text-indigo-950'
                                                }`}
                                        >
                                            {val === null ? '?' : val}
                                        </div>
                                        {sIdx < item.sequence.length - 1 && (
                                            <i className="fa-solid fa-chevron-right text-[8px] text-indigo-300"></i>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rule & Answer Area */}
                        <div className="pt-2 border-t border-dashed border-indigo-200 flex items-center justify-between gap-2">
                            <div className="flex flex-col flex-1">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                                    Örüntü Kuralın:
                                </span>
                                <div className="w-full h-5 border-b border-dashed border-zinc-300 text-[9px] font-bold text-indigo-950 flex items-center">
                                    {/* Student write line */}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                                    Doğru Cevap:
                                </span>
                                <div className="w-12 h-6 bg-white border-2 border-indigo-400 rounded-lg shadow-2xs flex items-center justify-center font-black text-xs text-indigo-900">
                                    {/* Space for answer box */}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CLINICAL FOOTER */}
            <div className="mt-auto pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-2xl bg-zinc-900 text-white">
                <div className="col-span-1 flex flex-col justify-center">
                    <span className="text-[8px] font-black uppercase leading-tight text-zinc-400">
                        DİZİSEL MANTIK &<br />SAYI ÖRÜNTÜ ANALİZİ
                    </span>
                </div>
                {[
                    { label: 'HEDEF SÜRE', val: '08:00', unit: 'dk' },
                    { label: 'TAMAMLANAN', val: '___', unit: 'Dizi' },
                    { label: 'PERFORMANS', val: '___', unit: 'p' },
                ].map((item) => (
                    <div key={item.label} className="bg-white/10 border border-white/10 rounded-lg p-1.5 flex flex-col justify-between">
                        <span className="text-[7px] font-black text-zinc-400 uppercase">{item.label}</span>
                        <div className="flex items-end gap-0.5">
                            <span className="text-xs font-black text-white">{item.val}</span>
                            <span className="text-[6px] font-bold text-zinc-400 mb-0.5">{item.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

