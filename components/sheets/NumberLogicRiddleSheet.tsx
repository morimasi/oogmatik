
import React from 'react';
import { NumberLogicRiddleData } from '../../types';
import { PedagogicalHeader, ImageDisplay } from './common';
import { EditableElement, EditableText } from '../Editable';

export const NumberLogicRiddleSheet: React.FC<{ data: NumberLogicRiddleData }> = ({ data }) => {
    const itemCount = data.puzzles?.length || 0;
    
    const gridCols = itemCount <= 2 ? 'grid-cols-1' : (itemCount <= 4 ? 'grid-cols-2' : 'grid-cols-3');
    const cardSize = itemCount > 4 ? 'min-h-[200px]' : 'min-h-[320px]';

    return (
        <div className="h-full flex flex-col text-black font-lexend">
            <PedagogicalHeader 
                title={data.title || "Sayısal Mantık Bilmeceleri"} 
                instruction={data.instruction || "İpuçlarını takip et ve doğru sayıyı bul!"} 
                note={data.pedagogicalNote} 
            />
            
            <div className={`grid ${gridCols} gap-x-6 gap-y-8 mt-2 flex-1 content-start`}>
                {(data.puzzles || []).map((puzzle, pIdx) => (
                    <EditableElement key={pIdx} className={`flex flex-col border-2 border-zinc-900 rounded-[2.5rem] p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] break-inside-avoid relative group hover:border-indigo-500 transition-all duration-300 ${cardSize}`}>
                        <div className="absolute -top-3 -left-2 w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg text-sm border-4 border-white">
                            {pIdx + 1}
                        </div>
                        
                        {/* Clue Box - Bullet Point Style for Dyslexia */}
                        <div className="mb-4 bg-indigo-50/30 p-4 rounded-3xl border border-indigo-100/50 flex-1">
                            <ul className="space-y-2">
                                {(puzzle.clues || [puzzle.riddle]).map((clue, cIdx) => (
                                    <li key={cIdx} className="flex gap-2 items-start group/clue">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0 group-hover/clue:scale-150 transition-transform"></div>
                                        <p className="text-[11px] font-bold leading-tight text-zinc-700 font-dyslexic italic">
                                            <EditableText value={clue} tag="span" />
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visual Distractor Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {puzzle.boxes.slice(0, 6).map((box, bIdx) => (
                                <div key={bIdx} className="relative flex items-center justify-center bg-zinc-50 border border-zinc-200 rounded-xl p-1 min-h-[45px] group/box">
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {box.map((num, nIdx) => (
                                            <span key={nIdx} className="text-[10px] font-black font-mono text-zinc-500">{num}</span>
                                        ))}
                                    </div>
                                    {/* Task: Crossing out for elimination */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-10 transition-opacity pointer-events-none">
                                        <div className="w-full h-0.5 bg-red-600 rotate-45"></div>
                                        <div className="w-full h-0.5 bg-red-600 -rotate-45 absolute"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Interactive Options */}
                        <div className="mt-auto pt-3 border-t border-dashed border-zinc-200 flex justify-between items-center px-2">
                            {puzzle.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex flex-col items-center group/opt">
                                    <div className="w-9 h-9 rounded-xl border-2 border-zinc-200 flex items-center justify-center font-black text-xs shadow-sm bg-white hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all cursor-pointer transform hover:-translate-y-1">
                                        {opt}
                                    </div>
                                    <span className="text-[8px] font-black text-zinc-400 mt-1 uppercase tracking-tighter">{String.fromCharCode(65 + oIdx)}</span>
                                </div>
                            ))}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Sum Target Section */}
            {data.sumTarget > 0 && (
                <div className="mt-8 mb-2 break-inside-avoid shrink-0">
                    <div className="bg-zinc-900 text-white p-6 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-zinc-900 shadow-lg transform -rotate-6">
                                <i className="fa-solid fa-key text-xl"></i>
                            </div>
                            <div>
                                <h4 className="text-xl font-black tracking-tight leading-none mb-1">Büyük Kontrol</h4>
                                <p className="text-[10px] text-zinc-400 font-medium max-w-sm">
                                    {data.sumMessage || "Tüm bilmeceleri çözdüysen cevapları toplayıp kontrol edebilirsin!"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 bg-white/10 p-4 px-8 rounded-[2rem] border border-white/20">
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Hedef Toplam</span>
                                <div className="text-4xl font-black font-mono tracking-tighter text-amber-400">
                                    {data.sumTarget}
                                </div>
                            </div>
                            <div className="w-px h-12 bg-white/20"></div>
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Senin Sonucun</span>
                                <div className="w-24 h-10 border-b-4 border-dashed border-zinc-600 flex items-center justify-center font-black text-3xl text-zinc-400">
                                    ?
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex justify-between items-center px-10 pt-4 border-t border-zinc-100">
                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.4em]">Bursa Disleksi AI • Sayısal Muhakeme Atölyesi</p>
                <div className="flex gap-2">
                    <div className="w-10 h-2 bg-indigo-500 rounded-full"></div>
                    <div className="w-10 h-2 bg-zinc-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};
