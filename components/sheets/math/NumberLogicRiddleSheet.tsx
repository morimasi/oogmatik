import React from 'react';
import { NumberLogicRiddleData } from '../../../types';
import { PedagogicalHeader, ImageDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const NumberLogicRiddleSheet: React.FC<{ data: NumberLogicRiddleData }> = ({ data }) => {
    const itemCount = data.puzzles?.length || 0;
    const gridCols = itemCount <= 2 ? 'grid-cols-1' : (itemCount <= 4 ? 'grid-cols-2' : 'grid-cols-3');

    return (
        <div className="h-full flex flex-col text-black font-lexend">
            <PedagogicalHeader 
                title={data.title || "Sayısal Mantık Bilmeceleri"} 
                instruction={data.instruction || "Bilmeceleri çöz, doğru şıkkı işaretle ve sonuçları topla!"} 
                note={data.pedagogicalNote} 
            />
            
            <div className={`grid ${gridCols} gap-x-6 gap-y-8 mt-2 flex-1 content-start`}>
                {(data.puzzles || []).map((puzzle: any, pIdx) => {
                    const hintList = puzzle.riddle.split(/(?<=[.?!])\s+/);

                    return (
                        <EditableElement key={pIdx} className="flex flex-col border-[3px] border-zinc-900 rounded-[2.5rem] p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)] break-inside-avoid relative group hover:border-indigo-600 transition-all duration-300">
                            <div className="absolute -top-4 -left-2 w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black shadow-xl text-lg border-4 border-white transition-transform group-hover:scale-110">
                                {pIdx + 1}
                            </div>
                            
                            <div className="mb-4 flex-1">
                                <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <i className="fa-solid fa-magnifying-glass"></i> İPUÇLARI
                                </h5>
                                <div className="space-y-2">
                                    {hintList.map((hint, hIdx) => (
                                        <div key={hIdx} className="flex gap-2 items-start bg-zinc-50/50 p-2 rounded-lg border border-zinc-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                                            <p className="text-[13px] font-bold leading-snug text-zinc-800">
                                                <EditableText value={hint} tag="span" />
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-1.5 mb-4">
                                {puzzle.boxes.map((box: number[], bIdx: number) => (
                                    <div key={bIdx} className="flex flex-col items-center bg-zinc-100/30 border border-zinc-200 rounded-lg p-1.5 min-h-[45px] justify-center hover:bg-white transition-colors">
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {box.map((num, nIdx) => (
                                                <span key={nIdx} className="text-[11px] font-black font-mono text-zinc-600">{num}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto pt-3 border-t-2 border-dashed border-zinc-100 flex justify-around items-center">
                                {puzzle.options.map((opt: string, oIdx: number) => (
                                    <div key={oIdx} className="flex flex-col items-center group/opt">
                                        <div className="w-11 h-11 rounded-2xl border-2 border-zinc-200 flex items-center justify-center font-black text-base shadow-sm bg-white hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all cursor-pointer transform active:scale-90">
                                            {opt}
                                        </div>
                                        <span className="text-[9px] font-black text-zinc-400 mt-1 uppercase opacity-60">{String.fromCharCode(65 + oIdx)}</span>
                                    </div>
                                ))}
                            </div>
                        </EditableElement>
                    );
                })}
            </div>

            <div className="mt-10 mb-6 break-inside-avoid shrink-0">
                <div className="bg-zinc-900 text-white p-8 rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-white relative overflow-hidden">
                    <div className="flex-1 text-center md:text-left relative z-10">
                        <div className="flex items-center gap-4 mb-3 justify-center md:justify-start">
                             <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-black shadow-lg text-xl"><i className="fa-solid fa-calculator"></i></div>
                             <h4 className="text-2xl font-black tracking-tight leading-none uppercase">TOPLAM KONTROLÜ</h4>
                        </div>
                        <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-md">{data.sumMessage || "Sonuçların toplamı hedefe ulaşıyor mu?"}</p>
                    </div>
                    <div className="flex items-center gap-10 bg-white/10 p-6 rounded-[2.5rem] border border-white/20 backdrop-blur-xl relative z-10">
                        <div className="text-center">
                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] block mb-2">HEDEF SAYI</span>
                            <div className="text-5xl font-black text-amber-400 font-mono">{data.sumTarget}</div>
                        </div>
                        <div className="w-px h-16 bg-white/20"></div>
                        <div className="text-center">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">SONUCUN</span>
                            <div className="w-28 h-14 border-b-4 border-dashed border-zinc-700 flex items-center justify-center font-black text-4xl text-zinc-500 italic">?</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};