
import React from 'react';
import { DirectionalTrackingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const ArrowIcon = ({ dir }: { dir: string }) => {
    let rotation = 0;
    if (dir === 'down') rotation = 90;
    if (dir === 'left') rotation = 180;
    if (dir === 'up') rotation = 270;
    
    return (
        <i className="fa-solid fa-arrow-right text-indigo-600 text-lg" style={{ transform: `rotate(${rotation}deg)` }}></i>
    );
};

export const DirectionalTrackingSheet: React.FC<{ data: DirectionalTrackingData }> = ({ data }) => {
    // 2 Sütunlu Grid Layout
    const isSingleColumn = (data.puzzles || []).length <= 2;
    const gridLayout = isSingleColumn ? 'grid-cols-1' : 'grid-cols-2';

    return (
        <div className="flex flex-col h-full bg-white p-2 font-lexend text-black overflow-visible">
            <PedagogicalHeader 
                title={data.title} 
                instruction={data.instruction} 
                note={data.pedagogicalNote} 
            />
            
            <div className={`grid ${gridLayout} gap-12 mt-6 content-start flex-1`}>
                {(data.puzzles || []).map((puzzle, idx) => (
                    <EditableElement key={idx} className="flex flex-col gap-6 p-6 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm break-inside-avoid group hover:border-indigo-500 transition-all">
                        
                        {/* HEADER: GÖREV NO */}
                        <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-2">
                            <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md">
                                {idx + 1}
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                Başlangıç: {String.fromCharCode(65 + puzzle.startPos.c)}{puzzle.startPos.r + 1}
                            </span>
                        </div>

                        <div className="flex gap-6 items-start">
                            {/* IZGARA (GRID) */}
                            <div className="bg-white border-2 border-zinc-200 p-2 rounded-2xl shadow-inner relative">
                                {/* Koordinat Sistemi - Üst Harfler */}
                                <div className="flex mb-1 ml-6 justify-around">
                                    {puzzle.grid[0].map((_, c) => (
                                        <span key={c} className="text-[9px] font-bold text-zinc-400 w-8 text-center">{String.fromCharCode(65 + c)}</span>
                                    ))}
                                </div>
                                <div className="flex">
                                    {/* Koordinat Sistemi - Sol Sayılar */}
                                    <div className="flex flex-col mr-1 justify-around">
                                        {puzzle.grid.map((_, r) => (
                                            <span key={r} className="text-[9px] font-bold text-zinc-400 h-8 flex items-center">{r + 1}</span>
                                        ))}
                                    </div>
                                    
                                    {/* Hücreler */}
                                    <div className="grid gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200" style={{ gridTemplateColumns: `repeat(${puzzle.grid.length}, 1fr)` }}>
                                        {puzzle.grid.flatMap((row, r) => row.map((cell, c) => {
                                            const isStart = r === puzzle.startPos.r && c === puzzle.startPos.c;
                                            return (
                                                <div 
                                                    key={`${r}-${c}`} 
                                                    className={`w-8 h-8 flex items-center justify-center font-black text-lg border rounded-lg transition-colors ${isStart ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-800 border-zinc-300'}`}
                                                >
                                                    {cell}
                                                </div>
                                            );
                                        }))}
                                    </div>
                                </div>
                            </div>

                            {/* YÖNERGELER (ARROWS) & CEVAP */}
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
                                    <h5 className="text-[9px] font-black text-indigo-400 uppercase mb-2 tracking-widest text-center">İZLENECEK YOL</h5>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {puzzle.path.map((dir, dIdx) => (
                                            <div key={dIdx} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-indigo-100 shadow-sm">
                                                <ArrowIcon dir={dir} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-end">
                                    <div className="w-full border-b-[4px] border-dashed border-zinc-300 h-12 bg-zinc-50/50 rounded-t-xl flex items-center justify-center text-2xl font-black text-zinc-300 tracking-[0.5em] uppercase italic">
                                        KELİME
                                    </div>
                                    {/* Cevap Anahtarı (Gizli) */}
                                    <div className="mt-2 text-[8px] text-zinc-200 font-bold text-right select-none opacity-0 group-hover:opacity-100 transition-opacity">
                                        {puzzle.targetWord}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </EditableElement>
                ))}
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-100 flex justify-between items-center px-10 opacity-30">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kategori</span>
                    <span className="text-[10px] font-bold text-zinc-800 uppercase">Görsel-Uzamsal Kodlama</span>
                </div>
                <div className="flex gap-4">
                    <i className="fa-solid fa-arrow-trend-up text-xl text-zinc-300"></i>
                    <i className="fa-solid fa-font text-xl text-zinc-300"></i>
                </div>
            </div>
        </div>
    );
};
