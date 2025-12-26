
import React from 'react';
import { NumberLogicRiddleData } from '../../types';
import { PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

export const NumberLogicRiddleSheet: React.FC<{ data: NumberLogicRiddleData }> = ({ data }) => {
    return (
        <div className="h-full flex flex-col text-black font-lexend">
            <PedagogicalHeader 
                title={data.title} 
                instruction={data.instruction || "Bilmeceleri çöz, doğru şıkkı işaretle ve sonuçları topla!"} 
                note={data.pedagogicalNote} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 mt-4">
                {(data.puzzles || []).map((puzzle, pIdx) => (
                    <EditableElement key={pIdx} className="flex flex-col border-2 border-zinc-300 rounded-3xl p-6 bg-white shadow-sm break-inside-avoid relative group hover:border-indigo-400 transition-colors">
                        <div className="absolute -top-4 -left-4 w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
                            {pIdx + 1}
                        </div>
                        
                        {/* Riddle Text */}
                        <div className="mb-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 min-h-[80px] flex items-center">
                            <p className="text-sm font-bold leading-relaxed text-zinc-800">
                                <EditableText value={puzzle.riddle} tag="span" />
                            </p>
                        </div>

                        {/* Number Boxes */}
                        <div className="grid grid-cols-5 gap-2 mb-6">
                            {puzzle.boxes.map((box, bIdx) => (
                                <div key={bIdx} className="flex flex-col items-center bg-white border-2 border-zinc-200 rounded-xl p-2 shadow-sm min-h-[70px] justify-center">
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {box.map((num, nIdx) => (
                                            <span key={nIdx} className="text-sm font-black font-mono">{num}{nIdx < box.length - 1 ? ',' : ''}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Options */}
                        <div className="mt-auto pt-4 border-t border-dashed border-zinc-200">
                            <div className="flex justify-between items-center gap-2">
                                {puzzle.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex flex-col items-center gap-1 cursor-pointer">
                                        <div className="text-[10px] font-black text-zinc-400 uppercase">{String.fromCharCode(97 + oIdx)})</div>
                                        <div className="w-9 h-9 rounded-xl border-2 border-zinc-200 flex items-center justify-center font-black text-sm hover:bg-indigo-50 hover:border-indigo-400 transition-all">
                                            <EditableText value={opt} tag="span" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Sum Challenge Footer */}
            <div className="mt-auto pt-10 pb-4 break-inside-avoid">
                <EditableElement className="bg-zinc-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10 text-center md:text-left">
                        <h4 className="text-xl font-black mb-2 flex items-center gap-3 justify-center md:justify-start">
                            <i className="fa-solid fa-calculator text-amber-400"></i>
                            Büyük Toplam Yarışı
                        </h4>
                        <p className="text-sm text-zinc-400 font-medium max-w-md">
                            <EditableText value={data.sumMessage || "Dört sorunun doğru cevaplarındaki sayıları topla. Sonuç hedef sayı ise sana kocaman bir aferin! :)"} tag="span" />
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Hedef Sayı</span>
                            <div className="text-4xl font-black text-amber-400 font-mono">
                                <EditableText value={data.sumTarget} tag="span" />
                            </div>
                        </div>
                        <div className="w-px h-12 bg-zinc-700"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Senin Sonucun</span>
                            <div className="w-24 h-12 border-b-4 border-dashed border-zinc-500 flex items-center justify-center font-black text-3xl">
                                <EditableText value="" tag="div" placeholder="..." />
                            </div>
                        </div>
                    </div>
                </EditableElement>
            </div>
        </div>
    );
};
