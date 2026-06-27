
import React from 'react';
import { FindTheDifferenceData } from '../../../types';
import { PedagogicalHeader } from '../common';

export const FindTheDifferenceSheet = ({ data }: { data: FindTheDifferenceData }) => {
    const settings = data?.settings;
    const puzzles = data?.puzzles || [];
    const puzzleCount = settings?.puzzleCount || puzzles.length || 1;
    const diffType = settings?.differenceType || 'visual';

    // A4 Alan hesaplaması (Milimetrik optimizasyon)
    const containerCols = puzzleCount > 1 ? (puzzleCount > 2 ? 2 : 1) : 1;
    
    // Hücre boyutu varyasyon sayısına göre dinamik
    let cellSize = 42; 
    if (puzzleCount === 2) cellSize = 36;
    else if (puzzleCount >= 4) cellSize = 28;

    const renderPuzzle = (puzzle: FindTheDifferenceData['puzzles'][0], index: number) => {
        const gridA = puzzle.gridA;
        const gridB = puzzle.gridB;
        const size = gridA.length;
        
        return (
            <div key={index} className="flex flex-col items-center group break-inside-avoid w-full border border-zinc-50 p-2 print:p-1 rounded-[2rem]">
                {/* Puzzle Header */}
                <div className="w-full flex justify-between items-end mb-3 print:mb-1 px-2">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                             <span className="w-5 h-5 rounded-lg bg-rose-600 text-white flex items-center justify-center text-[10px] font-black shadow-md">{index + 1}</span>
                             <span className="text-[7px] font-black text-rose-500 uppercase tracking-[0.2em]">{puzzle.title}</span>
                        </div>
                        <h4 className="text-[11px] font-black text-zinc-900 uppercase mt-1 leading-none">Konsantrasyon Matrisi</h4>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="px-2 py-0.5 bg-zinc-900 text-white text-[7px] font-black rounded-md shadow-sm border border-zinc-800">{puzzle.diffCount} KRİTİK FARK</span>
                    </div>
                </div>

                {/* Grid Container */}
                <div className="flex gap-6 print:gap-3 justify-center items-center w-full py-2">
                    {/* Referans Grid */}
                    <div className="relative group/grid">
                         <div className="absolute -inset-2 bg-zinc-100/50 rounded-[1.8rem] -z-10 opacity-0 group-hover/grid:opacity-100 transition-opacity"></div>
                         <div 
                             className="grid border-[2px] border-zinc-900 bg-white shadow-xl overflow-hidden rounded-xl" 
                             style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
                         >
                            {gridA.flat().map((item, i) => (
                                <div 
                                    key={i} 
                                    className="flex items-center justify-center border-[0.5px] border-zinc-100 font-bold text-zinc-900"
                                    style={{ width: cellSize, height: cellSize, fontSize: cellSize * 0.55 }}
                                >
                                    {item}
                                </div>
                            ))}
                         </div>
                         <div className="absolute -top-3 -left-3 px-2 py-0.5 bg-zinc-900 text-white text-[6px] font-black rounded-lg uppercase shadow-lg border border-zinc-700 z-20">ASIL MODEL</div>
                    </div>

                    {/* Transition Icon */}
                    <div className="flex flex-col items-center opacity-20 text-zinc-400">
                         <i className="fa-solid fa-chevron-right text-xs"></i>
                    </div>

                    {/* Target Grid */}
                    <div className="relative group/grid">
                         <div className="absolute -inset-2 bg-indigo-50/50 rounded-[1.8rem] -z-10 opacity-0 group-hover/grid:opacity-100 transition-opacity"></div>
                         <div 
                             className="grid border-[2px] border-indigo-600 bg-white shadow-2xl overflow-hidden rounded-xl ring-4 ring-indigo-50/30" 
                             style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
                         >
                            {gridB.flat().map((item, i) => (
                                <div 
                                    key={i} 
                                    className="flex items-center justify-center border-[0.5px] border-indigo-50 font-bold text-indigo-950"
                                    style={{ width: cellSize, height: cellSize, fontSize: cellSize * 0.55 }}
                                >
                                    {item}
                                </div>
                            ))}
                         </div>
                         <div className="absolute -top-3 -right-3 px-2 py-0.5 bg-indigo-600 text-white text-[6px] font-black rounded-lg uppercase shadow-lg border border-indigo-500 z-20 animate-pulse">FARK TARAMA</div>
                    </div>
                </div>

                {/* Clinical Meta */}
                {settings?.showClinicalNotes && puzzle.clinicalMeta && (
                    <div className="mt-3 w-full bg-zinc-50/50 p-2 rounded-2xl flex justify-between items-center px-4 border border-zinc-100">
                        <div className="flex items-center gap-2">
                            <span className="text-[6px] font-black text-zinc-400 uppercase tracking-widest">Algısal Yük</span>
                            <div className="w-16 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${(puzzle.clinicalMeta.perceptualLoad || 0.5) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-[6px] font-black text-rose-500 uppercase tracking-widest border-r border-zinc-200 pr-3">{puzzle.clinicalMeta.errorType}</span>
                            <span className="text-[6px] font-black text-zinc-400 uppercase tracking-widest italic">ZPD: {settings.difficulty}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white font-['Lexend'] text-black overflow-hidden professional-worksheet min-h-[297mm]">
            <PedagogicalHeader
                title={data?.title || "FARK BUL: GÖRSEL TARAMA & DİKKAT"}
                instruction={data?.instruction || "Sol taraftaki asıl tabloyu referans alarak sağdaki tabloda yerleri değişmiş veya farklı olan öğeleri bularak işaretleyin."}
            />

            <div className={`
                flex-1 grid gap-8 print:gap-4 mt-10 print:mt-4 px-8 print:px-4 content-start
                ${containerCols === 2 ? 'grid-cols-2' : 'grid-cols-1'}
            `}>
                {puzzles.map((puzzle, i) => renderPuzzle(puzzle, i))}
            </div>

            {/* Premium Dark Footer */}
            <div className="mt-auto p-6 print:p-3 bg-zinc-950 text-white rounded-t-[3rem] flex justify-between items-center shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
                
                <div className="flex gap-6 items-center relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg border border-indigo-400/20">
                        <i className="fa-solid fa-brain text-white text-xl"></i>
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-1 leading-none">NÖRO-PEDAGOJİK ANALİZ</span>
                        <span className="text-sm font-black uppercase tracking-tight">Saccadic Scan Engine v5.2</span>
                    </div>
                </div>

                <div className="flex gap-10 items-center relative z-10 px-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Uyaran Modu</span>
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-tight italic">{(settings?.differenceType || 'VISUAL').toUpperCase()}</span>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                       <i className="fa-solid fa-fingerprint text-zinc-800 text-3xl"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};
