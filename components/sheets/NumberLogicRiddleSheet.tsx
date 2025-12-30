
import React from 'react';
import { NumberLogicRiddleData } from '../../types';
import { PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

export const NumberLogicRiddleSheet: React.FC<{ data: NumberLogicRiddleData }> = ({ data }) => {
    return (
        <div className="h-full flex flex-col text-black font-lexend">
            <PedagogicalHeader 
                title={data.title || "Sayısal Mantık Bilmeceleri"} 
                instruction={data.instruction || "Bilmeceleri çöz, doğru şıkkı işaretle ve sonuçları topla!"} 
                note={data.pedagogicalNote} 
            />
            
            {/* Grid stretched to fill space */}
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-6 gap-y-10 mt-2 flex-1 content-between">
                {(data.puzzles || []).map((puzzle, pIdx) => (
                    <EditableElement key={pIdx} className="flex flex-col border-2 border-zinc-800 rounded-[2rem] p-6 bg-white shadow-sm break-inside-avoid relative group hover:border-indigo-400 transition-all duration-300 min-h-[320px] flex-grow">
                        <div className="absolute -top-4 -left-4 w-11 h-11 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg text-lg ring-4 ring-white">
                            {pIdx + 1}
                        </div>
                        
                        {/* Riddle Text - Adjusted for vertical fill */}
                        <div className="mb-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex-1 flex items-center shadow-inner">
                            <p className="text-xs md:text-sm font-bold leading-relaxed text-zinc-800">
                                <EditableText value={puzzle.riddle} tag="span" />
                            </p>
                        </div>

                        {/* Number Logic Grid */}
                        <div className="grid grid-cols-5 gap-2 mb-4 shrink-0">
                            {puzzle.boxes.map((box, bIdx) => (
                                <div key={bIdx} className="flex flex-col items-center bg-white border-2 border-zinc-100 rounded-xl p-2 shadow-sm min-h-[65px] justify-center hover:border-indigo-200 transition-colors">
                                    <div className="text-[6px] font-black text-zinc-300 uppercase mb-1 tracking-tighter">GRUP {bIdx+1}</div>
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {box.map((num, nIdx) => (
                                            <span key={nIdx} className="text-[11px] font-black font-mono bg-zinc-50 px-1 rounded text-zinc-700">{num}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Options Strip */}
                        <div className="mt-auto pt-4 border-t border-zinc-100">
                            <div className="flex justify-between items-center gap-1">
                                {puzzle.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex flex-col items-center gap-1 cursor-pointer group/opt">
                                        <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{String.fromCharCode(97 + oIdx)})</div>
                                        <div className="w-10 h-10 rounded-xl border-2 border-zinc-100 flex items-center justify-center font-black text-sm shadow-sm bg-white hover:bg-indigo-50 hover:border-indigo-500 transition-all">
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
            <div className="mt-10 mb-2 break-inside-avoid shrink-0">
                <EditableElement className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="relative z-10 text-center md:text-left flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-2">
                            <i className="fa-solid fa-trophy text-amber-400 text-[10px]"></i>
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-100">Büyük Mücadele</span>
                        </div>
                        <h4 className="text-xl font-black mb-1 tracking-tight">Büyük Toplam Yarışı</h4>
                        <p className="text-[11px] text-zinc-400 font-medium max-w-md leading-tight">
                            <EditableText value={data.sumMessage || "Doğru cevaplardaki sayıları topla. Hedef sayıya ulaş!"} tag="span" />
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-6 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">HEDEF SAYI</span>
                            <div className="text-3xl font-black text-amber-400 font-mono">
                                <EditableText value={data.sumTarget} tag="span" />
                            </div>
                        </div>
                        
                        <div className="w-px h-10 bg-white/10"></div>
                        
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">SONUCUN</span>
                            <div className="w-20 h-10 border-b-2 border-dashed border-zinc-500 flex items-center justify-center font-black text-2xl text-zinc-300">
                                <EditableText value="" tag="div" placeholder="..." />
                            </div>
                        </div>
                    </div>
                </EditableElement>
            </div>
            
            <div className="text-center print:mt-4">
                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.3em]">Bursa Disleksi AI • Sayısal Muhakeme Serisi</p>
            </div>
        </div>
    );
};
