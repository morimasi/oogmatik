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
        <div className="w-7 h-7 flex items-center justify-center bg-zinc-900 rounded-lg border border-zinc-700 shadow-lg group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-arrow-right text-amber-400 text-[10px]" style={{ transform: `rotate(${rotations[dir] || 0}deg)` }}></i>
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
            <PedagogicalHeader
                title={data?.title || "YÖNSEL İZ SÜRME & NAVİGASYON"}
                instruction={data?.instruction || "Aşağıdaki yörüngeyi takip ederek gizli kodu/kelimeyi bulun."}
                note={data?.pedagogicalNote}
            />

            <div className={`grid ${gridCols} gap-8 mt-10 flex-1 content-start items-start pb-20`}>
                {puzzles.map((puzzle, idx) => (
                    <EditableElement
                        key={idx}
                        className="flex flex-col border-2 border-zinc-100 rounded-[3rem] bg-zinc-50/50 group p-6 relative overflow-visible shadow-sm break-inside-avoid hover:bg-white hover:border-indigo-200 hover:shadow-xl transition-all"
                    >
                        {/* Bulmaca Başlığı */}
                        <div className="absolute -top-3 left-10 px-4 py-1 bg-zinc-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest z-10 shadow-lg border-2 border-white">
                            {puzzle.title || `TRAJEKTORİ ${idx + 1}`}
                        </div>

                        <div className="flex flex-col gap-8">
                            {/* Üst: Yönerge Alanı - Premium Case */}
                            <div className="bg-zinc-900 border-2 border-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/10">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-glow"></div>
                                    <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Yörünge Protokolü</h5>
                                </div>
                                <div className="flex flex-wrap gap-2.5 items-center justify-start relative z-10">
                                    {puzzle.path.map((dir, dIdx) => (
                                        <ArrowIcon key={dIdx} dir={dir} />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-10 items-start">
                                {/* Sol: Grid Sahası - High Precision */}
                                <div className="relative shrink-0">
                                    <div className="p-3 bg-white border-2 border-zinc-200 rounded-[2.5rem] shadow-xl overflow-visible relative ring-8 ring-zinc-50">
                                        {/* Koordinat Harfleri */}
                                        <div className="flex mb-1 ml-8">
                                            {puzzle.grid[0].map((_, c) => (
                                                <span key={c} className="w-8 text-[9px] font-black text-zinc-300 text-center uppercase tracking-tighter">{String.fromCharCode(65 + c)}</span>
                                            ))}
                                        </div>
                                        <div className="flex">
                                            {/* Koordinat Sayıları */}
                                            <div className="flex flex-col mr-1 justify-around py-1 h-[140px]">
                                                {puzzle.grid.map((_, r) => (
                                                    <span key={r} className="text-[9px] font-black text-zinc-300 text-center w-6 flex items-center justify-center">{r + 1}</span>
                                                ))}
                                            </div>
                                            {/* Grid Cells */}
                                            <div className="grid bg-white border border-zinc-50" style={{ gridTemplateColumns: `repeat(${puzzle.grid[0].length}, 1fr)` }}>
                                                {puzzle.grid.flatMap((row, r) => row.map((cell, c) => {
                                                    const isStart = r === puzzle.startPos.r && c === puzzle.startPos.c;
                                                    return (
                                                        <div
                                                            key={`${r}-${c}`}
                                                            className={`w-8 h-8 border-[0.5px] border-zinc-100 flex items-center justify-center text-[14px] font-black transition-all ${isStart ? 'bg-zinc-900 text-white rounded-xl shadow-lg scale-110 z-10 border-white border-2 ring-4 ring-zinc-50' : 'text-zinc-600 hover:bg-zinc-50'}`}
                                                        >
                                                            <EditableText value={String(cell)} tag="span" />
                                                        </div>
                                                    );
                                                }))}
                                            </div>
                                        </div>
                                        {/* Başlangıç Vektörü */}
                                        <div className="absolute -bottom-3 right-6 px-4 py-1 bg-amber-400 text-black rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg border-2 border-white">
                                            Vektör: {String.fromCharCode(65 + puzzle.startPos.c)}{puzzle.startPos.r + 1}
                                        </div>
                                    </div>
                                </div>

                                {/* Sağ: Cevap & Analiz Paneli */}
                                <div className="flex-1 flex flex-col pt-6">
                                    <div className="flex flex-col mb-8">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 px-1 leading-none">Çıktı Karakteristikleri:</span>
                                        <div className="w-full h-16 border-b-4 border-zinc-900 bg-white rounded-t-[2rem] flex items-center justify-center group-hover:bg-indigo-50 transition-colors shadow-inner ring-4 ring-zinc-50">
                                            <EditableText value="" tag="div" placeholder="???" className="font-black text-3xl text-zinc-900 tracking-[0.3em] uppercase" />
                                        </div>
                                    </div>

                                    {settings?.showClinicalNotes && puzzle.clinicalMeta && (
                                        <div className="mt-auto space-y-3 bg-zinc-100/50 p-4 rounded-3xl border border-zinc-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[7px] font-black uppercase text-zinc-400">Algısal Yük</span>
                                                <span className="text-[8px] font-black text-zinc-900">%{Math.round(puzzle.clinicalMeta.perceptualLoad * 100)}</span>
                                            </div>
                                            <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{ width: `${puzzle.clinicalMeta.perceptualLoad * 100}%` }}></div>
                                            </div>
                                            <div className="flex justify-between items-center pt-1 border-t border-zinc-200/50">
                                                <span className="text-[7px] font-black uppercase text-zinc-400">Dikkati Kaydırma</span>
                                                <span className="text-[8px] font-black text-indigo-600">{puzzle.clinicalMeta.attentionShiftCount} Shift</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Secret Solution - Inverted */}
                        <div className="absolute bottom-3 right-8 opacity-0 group-hover:opacity-5 transition-opacity rotate-180 text-[8px] font-black select-none pointer-events-none">
                            ANALİZ: {puzzle.targetWord}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Footer Protokolü - Premium Dark */}
            <div className="mt-auto p-6 bg-zinc-900 text-white rounded-t-[3rem] border-x-4 border-t-4 border-white flex justify-between items-center shadow-2xl mx-1">
                <div className="flex gap-10">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">PROGRAM</span>
                        <span className="text-xs font-black uppercase font-mono">Cognitive Path Tracking v4.2</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 opacity-70">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[6px] font-black uppercase tracking-[0.1em] text-zinc-400">Oküler Motor</span>
                        <span className="text-[8px] font-bold">TAKİP MODÜLÜ</span>
                    </div>
                    <i className="fa-solid fa-crosshairs text-rose-500 text-lg shadow-glow"></i>
                </div>
            </div>
        </div>
    );
};