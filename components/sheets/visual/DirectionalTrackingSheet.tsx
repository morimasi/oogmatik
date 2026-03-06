import React from 'react';
import { DirectionalTrackingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

// Fix: Typed as React.FC to handle React-specific props like 'key' in maps
const ArrowIcon = ({ dir }: { dir: string }) => {
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

export const DirectionalTrackingSheet = ({ data }: { data: DirectionalTrackingData }) => {
    const settings = data?.settings;
    const puzzles = data?.puzzles || [];
    const layout = settings?.layout || 'single';

    const gridCols = layout === 'grid_2x1' ? 'grid-cols-2' : (layout === 'grid_compact' ? 'grid-cols-2' : 'grid-cols-1');

    return (
        <div className="flex flex-col h-full bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader title={data.title || "YÖNSEL İZ SÜRME & DİKKAT ODUR"} instruction={data.instruction} note={data.pedagogicalNote} />

            <div className={`grid ${gridCols} gap-6 mt-6 flex-1 content-start items-start`}>
                {puzzles.map((puzzle, idx) => (
                    <EditableElement
                        key={idx}
                        className="flex flex-col border-2 border-zinc-900 rounded-[2.5rem] bg-white group p-6 relative overflow-visible shadow-sm break-inside-avoid"
                    >
                        {/* Bulmaca Başlığı */}
                        <div className="absolute -top-3 left-8 px-4 py-1 bg-zinc-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest z-10 shadow-lg">
                            {puzzle.title || `GÖREV ${idx + 1}`}
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Üst: Yönerge Alanı */}
                            <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 shadow-inner">
                                <div className="flex items-center gap-2 mb-4 border-b border-zinc-200 pb-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                                    <h5 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Yörünge İzleme Protokolü</h5>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center justify-start content-start">
                                    {puzzle.path.map((dir, dIdx) => (
                                        <ArrowIcon key={dIdx} dir={dir} />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-8 items-start">
                                {/* Sol: Grid Sahası */}
                                <div className="relative shrink-0">
                                    <div className="p-2 bg-white border-2 border-zinc-900 rounded-2xl shadow-md overflow-visible relative">
                                        {/* Koordinat Harfleri */}
                                        <div className="flex mb-1 ml-6">
                                            {puzzle.grid[0].map((_, c) => (
                                                <span key={c} className="w-7 text-[8px] font-black text-zinc-300 text-center uppercase">{String.fromCharCode(65 + c)}</span>
                                            ))}
                                        </div>
                                        <div className="flex">
                                            {/* Koordinat Sayıları */}
                                            <div className="flex flex-col mr-1 justify-around py-1 h-[140px]">
                                                {puzzle.grid.map((_, r) => (
                                                    <span key={r} className="text-[8px] font-black text-zinc-300 text-center w-5 flex items-center justify-center">{r + 1}</span>
                                                ))}
                                            </div>
                                            {/* Grid */}
                                            <div className="grid bg-white" style={{ gridTemplateColumns: `repeat(${puzzle.grid[0].length}, 1fr)` }}>
                                                {puzzle.grid.flatMap((row, r) => row.map((cell, c) => {
                                                    const isStart = r === puzzle.startPos.r && c === puzzle.startPos.c;
                                                    return (
                                                        <div
                                                            key={`${r}-${c}`}
                                                            className={`w-7 h-7 border-[0.5px] border-zinc-100 flex items-center justify-center text-[12px] font-black transition-all ${isStart ? 'bg-zinc-900 text-white rounded-lg shadow-lg scale-110 z-10' : 'text-zinc-600 hover:bg-zinc-50'}`}
                                                        >
                                                            {cell}
                                                        </div>
                                                    );
                                                }))}
                                            </div>
                                        </div>
                                        {/* Başlangıç Bilgisi */}
                                        <div className="absolute -bottom-2 right-4 px-3 py-0.5 bg-indigo-600 text-white rounded-md text-[7px] font-black uppercase tracking-tighter shadow-md">
                                            BAŞLA: {String.fromCharCode(65 + puzzle.startPos.c)}{puzzle.startPos.r + 1}
                                        </div>
                                    </div>
                                </div>

                                {/* Sağ: Cevap Giriş */}
                                <div className="flex-1 flex flex-col pt-4">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Bulunan Kelime/Kod:</span>
                                    <div className="w-full h-14 border-b-4 border-zinc-900 bg-zinc-100/50 rounded-t-2xl flex items-center justify-center group-hover:bg-indigo-50/50 transition-colors">
                                        <EditableText value="" tag="div" placeholder="..." className="font-black text-2xl text-indigo-600 tracking-[0.2em] uppercase" />
                                    </div>

                                    {settings?.showClinicalNotes && puzzle.clinicalMeta && (
                                        <div className="mt-8 pt-4 border-t border-dashed border-zinc-200 text-right">
                                            <span className="text-[7px] font-black uppercase text-zinc-300 block">Algısal Yük: %{Math.round(puzzle.clinicalMeta.perceptualLoad * 100)}</span>
                                            <span className="text-[7px] font-black uppercase text-zinc-300 block">Dikkat Kayması: {puzzle.clinicalMeta.attentionShiftCount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Secret Solution */}
                        <div className="absolute bottom-2 right-6 opacity-0 group-hover:opacity-5 transition-opacity rotate-180 text-[7px] font-black select-none pointer-events-none">
                            ÇİS: {puzzle.targetWord}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Premium Footer */}
            <div className="mt-10 pt-6 flex justify-between items-center border-t border-zinc-100 opacity-30 no-print">
                <div className="flex flex-col gap-1">
                    <span className="text-[6px] font-black text-zinc-400 uppercase tracking-[0.5em]">Neuro-Precision Engine v4.0</span>
                    <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-tighter leading-none">Mekansal Bellek & Yönsel Takip Bataryası</p>
                </div>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-compass-drafting text-xl text-zinc-900"></i>
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-900">Bursa Disleksi AI</span>
                    </div>
                </div>
            </div>
        </div>
    );
};