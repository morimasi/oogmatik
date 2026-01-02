
import React from 'react';
import { NumberLogicRiddleData } from '../../types';
import { PedagogicalHeader, ImageDisplay } from './common';
import { EditableElement, EditableText } from '../Editable';

export const NumberLogicRiddleSheet: React.FC<{ data: NumberLogicRiddleData }> = ({ data }) => {
    const itemCount = data.puzzles?.length || 0;
    
    // Bento Grid Layout Logic
    const gridCols = itemCount <= 2 ? 'grid-cols-1' : (itemCount <= 6 ? 'grid-cols-2' : 'grid-cols-3');
    const cardSize = itemCount > 6 ? 'min-h-[220px]' : 'min-h-[300px]';

    return (
        <div className="h-full flex flex-col text-black font-lexend">
            <PedagogicalHeader 
                title={data.title || "Sayısal Mantık Bilmeceleri"} 
                instruction={data.instruction || "Bilmeceleri çöz, doğru şıkkı işaretle ve sonuçları topla!"} 
                note={data.pedagogicalNote} 
            />
            
            <div className={`grid ${gridCols} gap-x-6 gap-y-8 mt-2 flex-1 content-start`}>
                {(data.puzzles || []).map((puzzle, pIdx) => (
                    <EditableElement key={pIdx} className={`flex flex-col border-2 border-zinc-900 rounded-[2.5rem] p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] break-inside-avoid relative group hover:border-indigo-500 transition-all duration-300 ${cardSize}`}>
                        <div className="absolute -top-3 -left-2 w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg text-sm border-4 border-white">
                            {pIdx + 1}
                        </div>
                        
                        {/* Multimodal Hint (If AI provided) */}
                        {puzzle.visualHint && (
                            <div className="h-20 w-full mb-4 rounded-2xl bg-zinc-50 border border-zinc-100 overflow-hidden">
                                <ImageDisplay prompt={puzzle.visualHint} className="w-full h-full" />
                            </div>
                        )}

                        {/* Riddle Text - High Contrast */}
                        <div className="mb-4 bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100 flex-1 flex items-center">
                            <p className={`${itemCount > 6 ? 'text-xs' : 'text-sm'} font-bold leading-relaxed text-zinc-800`}>
                                <EditableText value={puzzle.riddle} tag="span" />
                            </p>
                        </div>

                        {/* Number Group Matrix (Choice Blocks) */}
                        <div className={`grid ${itemCount > 6 ? 'grid-cols-3' : 'grid-cols-5'} gap-2 mb-4`}>
                            {puzzle.boxes.map((box, bIdx) => (
                                <div key={bIdx} className="flex flex-col items-center bg-white border-2 border-zinc-100 rounded-xl p-2 min-h-[50px] justify-center hover:border-indigo-200 transition-colors shadow-sm">
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {box.map((num, nIdx) => (
                                            <span key={nIdx} className={`${itemCount > 6 ? 'text-xs' : 'text-sm'} font-black font-mono text-zinc-700`}>{num}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Options Strip */}
                        <div className="mt-auto pt-3 border-t-2 border-dashed border-zinc-100 flex justify-around items-center px-1">
                            {puzzle.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex flex-col items-center group/opt">
                                    <div className="w-10 h-10 rounded-xl border-2 border-zinc-200 flex items-center justify-center font-black text-sm shadow-sm bg-white hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-pointer">
                                        {opt}
                                    </div>
                                    <span className="text-[8px] font-black text-zinc-300 mt-1 uppercase opacity-0 group-hover/opt:opacity-100">{String.fromCharCode(65 + oIdx)}</span>
                                </div>
                            ))}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Sum Challenge Footer (Diagnostic Executive Function) */}
            <div className="mt-8 mb-4 break-inside-avoid shrink-0">
                <EditableElement className="bg-zinc-900 text-white p-6 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-white">
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                             <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-black shadow-lg"><i className="fa-solid fa-calculator"></i></div>
                             <h4 className="text-xl font-black tracking-tight">Büyük Toplam Mücadelesi</h4>
                        </div>
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-md">
                            {data.sumMessage || "Tüm bilmeceleri çözdükten sonra doğru sayıları topla. Sonucun aşağıdaki hedefle aynı olmalı!"}
                        </p>
                    </div>

                    <div className="flex items-center gap-8 bg-white/5 p-4 rounded-[2rem] border border-white/10 backdrop-blur-md">
                        <div className="text-center">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-1">HEDEF PUAN</span>
                            <div className="text-4xl font-black text-amber-400 font-mono drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                                {data.sumTarget}
                            </div>
                        </div>
                        <div className="w-px h-12 bg-white/10"></div>
                        <div className="text-center">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-1">SENİN SONUCUN</span>
                            <div className="w-24 h-12 border-b-4 border-dashed border-zinc-600 flex items-center justify-center font-black text-3xl text-zinc-400">
                                ?
                            </div>
                        </div>
                    </div>
                </EditableElement>
            </div>
            
            <div className="flex justify-between items-center px-10 pt-4 border-t border-zinc-100">
                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.4em]">Bursa Disleksi AI • Sayısal Muhakeme ve Mantık Atölyesi</p>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
                </div>
            </div>
        </div>
    );
};
