
import React from 'react';
import { NumberLogicRiddleData } from '../../types';
import { PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

export const NumberLogicRiddleSheet: React.FC<{ data: NumberLogicRiddleData }> = ({ data }) => {
    const itemCount = data.puzzles?.length || 0;
    
    // Dinamik Grid Yapısı
    // 1-2 soru: tek sütun
    // 3-6 soru: iki sütun
    // 7-12 soru: üç sütun
    const gridCols = itemCount <= 2 ? 'grid-cols-1' : (itemCount <= 6 ? 'grid-cols-2' : 'grid-cols-3');
    const cardSize = itemCount > 6 ? 'min-h-[220px]' : 'min-h-[300px]';

    return (
        <div className="h-full flex flex-col text-black font-lexend">
            <PedagogicalHeader 
                title={data.title || "Sayısal Mantık Bilmeceleri"} 
                instruction={data.instruction || "Bilmeceleri çöz, doğru şıkkı işaretle ve sonuçları topla!"} 
                note={data.pedagogicalNote} 
            />
            
            <div className={`grid ${gridCols} gap-x-4 gap-y-6 mt-2 flex-1 content-start`}>
                {(data.puzzles || []).map((puzzle, pIdx) => (
                    <EditableElement key={pIdx} className={`flex flex-col border-2 border-zinc-800 rounded-3xl p-4 bg-white shadow-sm break-inside-avoid relative group hover:border-indigo-400 transition-all duration-300 ${cardSize}`}>
                        <div className="absolute -top-3 -left-2 w-8 h-8 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-black shadow-md text-sm ring-2 ring-white">
                            {pIdx + 1}
                        </div>
                        
                        {/* Riddle Text */}
                        <div className="mb-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex-1 flex items-center">
                            <p className={`${itemCount > 6 ? 'text-[10px]' : 'text-xs'} font-bold leading-tight text-zinc-800`}>
                                <EditableText value={puzzle.riddle} tag="span" />
                            </p>
                        </div>

                        {/* Number Logic Grid */}
                        <div className={`grid ${itemCount > 6 ? 'grid-cols-3' : 'grid-cols-5'} gap-1 mb-3`}>
                            {puzzle.boxes.map((box, bIdx) => (
                                <div key={bIdx} className="flex flex-col items-center bg-white border border-zinc-200 rounded-lg p-1 min-h-[40px] justify-center">
                                    <div className="flex flex-wrap justify-center gap-0.5">
                                        {box.map((num, nIdx) => (
                                            <span key={nIdx} className={`${itemCount > 6 ? 'text-[9px]' : 'text-[10px]'} font-black font-mono text-zinc-700`}>{num}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Options */}
                        <div className="mt-auto pt-2 border-t border-zinc-100 flex justify-between items-center px-1">
                            {puzzle.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center font-black text-xs shadow-sm bg-white hover:border-indigo-500 transition-all cursor-pointer">
                                        {opt}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Sum Challenge Footer */}
            <div className="mt-6 mb-2 break-inside-avoid shrink-0">
                <EditableElement className="bg-zinc-900 text-white p-4 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-base font-black mb-1">Büyük Toplam Mücadelesi</h4>
                        <p className="text-[9px] text-zinc-400 font-medium leading-tight">
                            {data.sumMessage || "Cevapları topla ve hedefe ulaş!"}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="text-center">
                            <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest block mb-0.5">HEDEF</span>
                            <div className="text-2xl font-black text-amber-400 font-mono">
                                {data.sumTarget}
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-center">
                            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">SONUCUN</span>
                            <div className="w-16 h-8 border-b border-dashed border-zinc-500 flex items-center justify-center font-black text-xl text-zinc-300">
                                ?
                            </div>
                        </div>
                    </div>
                </EditableElement>
            </div>
            
            <div className="text-center">
                <p className="text-[6px] text-zinc-400 font-bold uppercase tracking-[0.3em]">Bursa Disleksi AI • Sayısal Muhakeme Serisi</p>
            </div>
        </div>
    );
};
