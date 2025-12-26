
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 print-grid-2 gap-x-8 gap-y-12 mt-6 flex-1">
                {(data.puzzles || []).map((puzzle, pIdx) => (
                    <EditableElement key={pIdx} className="flex flex-col border-4 border-zinc-200 rounded-[2.5rem] p-8 bg-white shadow-lg break-inside-avoid relative group hover:border-indigo-400 transition-all duration-300 min-h-[350px]">
                        <div className="absolute -top-5 -left-5 w-14 h-14 bg-zinc-900 text-white rounded-3xl flex items-center justify-center font-black shadow-xl text-xl ring-8 ring-white">
                            {pIdx + 1}
                        </div>
                        
                        {/* Riddle Text */}
                        <div className="mb-6 bg-zinc-50 p-6 rounded-3xl border border-zinc-100 min-h-[100px] flex items-center shadow-inner">
                            <p className="text-base font-bold leading-relaxed text-zinc-800">
                                <EditableText value={puzzle.riddle} tag="span" />
                            </p>
                        </div>

                        {/* Number Logic Grid - Enhanced */}
                        <div className="grid grid-cols-5 gap-3 mb-8">
                            {puzzle.boxes.map((box, bIdx) => (
                                <div key={bIdx} className="flex flex-col items-center bg-white border-2 border-zinc-100 rounded-2xl p-2 shadow-sm min-h-[85px] justify-center hover:border-indigo-200 transition-colors">
                                    <div className="text-[8px] font-black text-zinc-300 uppercase mb-1 tracking-tighter">GRUP {bIdx+1}</div>
                                    <div className="flex flex-wrap justify-center gap-1.5">
                                        {box.map((num, nIdx) => (
                                            <span key={nIdx} className="text-sm font-black font-mono bg-zinc-50 px-1 rounded">{num}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Options Strip */}
                        <div className="mt-auto pt-6 border-t-2 border-zinc-50">
                            <div className="flex justify-between items-center gap-2">
                                {puzzle.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex flex-col items-center gap-1.5 cursor-pointer group/opt">
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover/opt:text-indigo-500 transition-colors">{String.fromCharCode(97 + oIdx)})</div>
                                        <div className="w-12 h-12 rounded-2xl border-2 border-zinc-200 flex items-center justify-center font-black text-base shadow-sm group-hover/opt:bg-indigo-50 group-hover/opt:border-indigo-400 transition-all active:scale-95 bg-white">
                                            <EditableText value={opt} tag="span" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Sum Challenge Footer - Premium Design */}
            <div className="mt-12 mb-6 break-inside-avoid">
                <EditableElement className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                    
                    <div className="relative z-10 text-center md:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-4">
                            <i className="fa-solid fa-trophy text-amber-400 text-sm"></i>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-100">Büyük Mücadele</span>
                        </div>
                        <h4 className="text-3xl font-black mb-3 tracking-tight">Büyük Toplam Yarışı</h4>
                        <p className="text-sm text-zinc-400 font-medium max-w-lg leading-relaxed">
                            <EditableText value={data.sumMessage || "Dört sorunun doğru cevaplarındaki sayıları topla. Sonuç hedef sayı ise sana kocaman bir aferin! :)"} tag="span" />
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-10 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">HEDEF SAYI</span>
                            <div className="text-5xl font-black text-amber-400 font-mono drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                                <EditableText value={data.sumTarget} tag="span" />
                            </div>
                        </div>
                        
                        <div className="w-px h-16 bg-white/10"></div>
                        
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">SENİN SONUCUN</span>
                            <div className="w-28 h-16 border-b-4 border-dashed border-zinc-500 flex items-center justify-center font-black text-4xl text-zinc-300">
                                <EditableText value="" tag="div" placeholder="..." />
                            </div>
                        </div>
                    </div>
                </EditableElement>
                
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">Bursa Disleksi AI • Sayısal Muhakeme Serisi</p>
                </div>
            </div>
        </div>
    );
};
