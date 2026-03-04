import React from 'react';
import { DirectionalTrackingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

// Fix: Typed as React.FC to handle React-specific props like 'key' in maps
const ArrowIcon: React.FC<{ dir: string }> = ({ dir }) => {
    const rotations: Record<string, number> = {
        'right': 0,
        'down': 90,
        'left': 180,
        'up': 270
    };
    
    return (
        <div className="w-6 h-6 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 rounded-md border border-indigo-100 dark:border-indigo-800 shadow-xs">
            <i className="fa-solid fa-arrow-right text-indigo-600 text-[10px]" style={{ transform: `rotate(${rotations[dir] || 0}deg)` }}></i>
        </div>
    );
};

export const DirectionalTrackingSheet: React.FC<{ data: DirectionalTrackingData }> = ({ data }) => {
    const puzzles = data.puzzles || [];
    const count = puzzles.length;
    
    // A4 Doluluk Optimizasyonu
    const gridCols = count <= 2 ? 'grid-cols-1' : (count <= 4 ? 'grid-cols-2' : 'grid-cols-2');
    const cardPadding = count > 4 ? 'p-4' : 'p-6';

    return (
        <div className="flex flex-col h-full bg-white font-lexend text-black p-1 overflow-hidden select-none">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className={`grid ${gridCols} gap-4 mt-2 flex-1 content-start`}>
                {puzzles.map((puzzle, idx) => (
                    <EditableElement 
                        key={idx} 
                        className={`flex flex-col border-[2px] border-zinc-900 rounded-[2rem] bg-white group hover:border-indigo-50 transition-all shadow-sm break-inside-avoid relative overflow-hidden ${cardPadding}`}
                    >
                        {/* Sayı Rozeti */}
                        <div className="absolute top-0 left-0 bg-zinc-900 text-white px-3 py-1 rounded-br-2xl font-black text-[10px] z-10">
                            {idx + 1}
                        </div>

                        <div className="flex gap-6 items-start">
                            {/* Sol: Harf Izgarası */}
                            <div className="shrink-0 flex flex-col items-center">
                                <div className="mb-2 text-[8px] font-black text-zinc-400 uppercase tracking-widest">Arama Sahası</div>
                                <div className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-2xl shadow-inner relative">
                                    {/* Koordinat Harfleri (A, B, C...) */}
                                    <div className="flex ml-5 mb-0.5">
                                        {puzzle.grid[0].map((_, c) => (
                                            <span key={c} className="w-6 text-[7px] font-bold text-zinc-400 text-center uppercase">{String.fromCharCode(65 + c)}</span>
                                        ))}
                                    </div>
                                    <div className="flex">
                                        {/* Koordinat Sayıları (1, 2, 3...) */}
                                        <div className="flex flex-col mr-0.5 justify-around py-0.5">
                                            {puzzle.grid.map((_, r) => (
                                                <span key={r} className="h-6 text-[7px] font-bold text-zinc-400 text-center w-4 flex items-center justify-center">{r + 1}</span>
                                            ))}
                                        </div>
                                        {/* Grid Hücreleri */}
                                        <div className="grid bg-white border border-zinc-300 shadow-sm" style={{ gridTemplateColumns: `repeat(${puzzle.grid[0].length}, 1fr)` }}>
                                            {puzzle.grid.flatMap((row, r) => row.map((cell, c) => {
                                                const isStart = r === puzzle.startPos.r && c === puzzle.startPos.c;
                                                return (
                                                    <div 
                                                        key={`${r}-${c}`}
                                                        className={`w-6 h-6 border-[0.5px] border-zinc-200 flex items-center justify-center text-[11px] font-black transition-colors ${isStart ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'text-zinc-800'}`}
                                                    >
                                                        {cell}
                                                    </div>
                                                );
                                            }))}
                                        </div>
                                    </div>
                                    {/* Başlangıç İndikatörü Etiketi */}
                                    <div className="mt-2 text-[7px] font-black text-indigo-500 uppercase tracking-tighter text-center">
                                        BAŞLANGIÇ: {String.fromCharCode(65 + puzzle.startPos.c)}{puzzle.startPos.r + 1}
                                    </div>
                                </div>
                            </div>

                            {/* Sağ: Yönerge ve Cevap Alanı */}
                            <div className="flex-1 flex flex-col h-full py-2">
                                <div className="bg-zinc-50/50 p-3 rounded-2xl border border-zinc-100 flex-1">
                                    <h5 className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3 border-b border-indigo-100 pb-1">TAKİP YÖNERGESİ</h5>
                                    <div className="flex flex-wrap gap-1.5 items-center justify-start content-start max-h-[100px] overflow-hidden">
                                        {puzzle.path.map((dir, dIdx) => (
                                            <ArrowIcon key={dIdx} dir={dir} />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-1 px-1">
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">BULDUĞUN KELİME:</span>
                                    </div>
                                    <div className="w-full h-10 border-b-[3px] border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50/30 rounded-t-xl group-hover:bg-indigo-50/20 transition-colors">
                                        <EditableText value="" tag="div" placeholder="..." className="font-black text-indigo-600 tracking-[0.4em] text-xl uppercase" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cevap Anahtarı (Gizli - Ters) */}
                        <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-5 transition-opacity rotate-180 text-[8px] font-black select-none pointer-events-none">
                            ANS: {puzzle.targetWord}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Footer / Performance Area */}
            <div className="mt-auto grid grid-cols-3 gap-4 items-end pt-4 border-t border-zinc-100 px-6 opacity-40">
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Hata Analizi</span>
                    <div className="h-6 border-b border-zinc-200"></div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex gap-4">
                        <i className="fa-solid fa-eye text-zinc-300"></i>
                        <i className="fa-solid fa-brain text-zinc-300"></i>
                    </div>
                    <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.4em] mt-1">Bursa Disleksi AI • Mekansal Kodlama</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Süre / Puan</span>
                    <div className="h-6 w-24 border-b border-zinc-200"></div>
                </div>
            </div>
        </div>
    );
};