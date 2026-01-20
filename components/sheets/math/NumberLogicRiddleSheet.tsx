
import React from 'react';
import { NumberLogicRiddleData } from '../../../types';
import { PedagogicalHeader, NumberLine, ImageDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const NumberLogicRiddleSheet: React.FC<{ data: NumberLogicRiddleData }> = ({ data }) => {
    const gridCols = (data.puzzles?.length || 0) <= 2 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2';

    return (
        <div className="h-full flex flex-col text-black font-lexend p-2 overflow-visible">
            <PedagogicalHeader 
                title={data.title || "Sayısal Mantık Bilmeceleri"} 
                instruction={data.instruction || "İpuçlarını oku ve doğru cevabı bul."} 
                note={data.pedagogicalNote} 
            />

            {data.showVisualAid && (
                <div className="mt-4 mb-8 px-4 break-inside-avoid">
                    <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2rem] p-6 relative">
                        <span className="absolute -top-3 left-6 bg-white px-3 text-[10px] font-black text-indigo-500 uppercase tracking-widest border border-indigo-100 rounded-full">NAVİGASYON ŞERİDİ</span>
                        <NumberLine 
                            start={data.numberRangeStart || 1} 
                            end={Math.min((data.numberRangeStart || 1) + 20, data.numberRangeEnd || 100)} 
                            className="w-full" 
                        />
                    </div>
                </div>
            )}
            
            <div className={`grid ${gridCols} gap-8 mt-2 flex-1 content-start px-2`}>
                {(data.puzzles || []).map((puzzle: any, pIdx) => (
                    <EditableElement key={pIdx} className="flex flex-col border-[4px] border-zinc-900 rounded-[2.5rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] break-inside-avoid relative overflow-hidden group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-300">
                        
                        <div className="bg-zinc-900 text-white px-6 py-3 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/40">
                                    {pIdx + 1}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">GİZEMLİ DOSYA</span>
                            </div>
                            <i className="fa-solid fa-user-secret text-zinc-500"></i>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col gap-6">
                            <div className="space-y-3 relative z-10">
                                {(puzzle.riddleParts || []).map((hint: any, hIdx: number) => (
                                    <div key={hIdx} className="flex gap-4 items-center bg-zinc-50 p-3 rounded-2xl border border-zinc-200 group/hint hover:bg-white hover:border-indigo-300 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-indigo-600 shadow-sm shrink-0 group-hover/hint:scale-110 transition-transform">
                                            <i className={`fa-solid ${hint.icon || 'fa-magnifying-glass'}`}></i>
                                        </div>
                                        <p className="text-sm font-bold text-zinc-800 leading-tight">
                                            <EditableText value={hint.text} tag="span" />
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-px bg-zinc-200 flex-1"></div>
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">ŞÜPHELİLERİ ELE</span>
                                    <div className="h-px bg-zinc-200 flex-1"></div>
                                </div>
                                <div className="flex justify-between gap-4">
                                    {puzzle.options.map((opt: string, oIdx: number) => (
                                        <div key={oIdx} className="flex-1 aspect-square rounded-2xl border-[3px] border-zinc-200 flex items-center justify-center font-black text-2xl text-zinc-800 cursor-pointer hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all shadow-sm active:scale-90">
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </EditableElement>
                ))}
            </div>

            {data.sumTarget > 0 && (
                <div className="mt-10 mb-6 break-inside-avoid px-2">
                    <div className="bg-zinc-900 text-white p-8 rounded-[3.5rem] shadow-2xl flex items-center justify-between border-4 border-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><i className="fa-solid fa-shield-halved text-[10rem]"></i></div>
                        <div className="flex items-center gap-6 relative z-10">
                             <div className="w-16 h-16 bg-amber-400 rounded-[1.5rem] flex items-center justify-center text-zinc-900 shadow-xl text-3xl animate-pulse">
                                 <i className="fa-solid fa-key"></i>
                             </div>
                             <div>
                                <h4 className="font-black text-xl leading-none uppercase text-amber-400 tracking-tight">TOPLAM DOĞRULAMA</h4>
                                <p className="text-[10px] text-zinc-400 font-bold mt-2 uppercase tracking-widest">Tüm bulunan cevapların toplamı bu olmalı:</p>
                             </div>
                        </div>
                        <div className="text-right relative z-10">
                            <div className="text-6xl font-black font-mono tracking-tighter text-white drop-shadow-lg">{data.sumTarget}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
