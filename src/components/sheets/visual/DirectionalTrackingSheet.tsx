import React from 'react';
import { DirectionalTrackingData } from '../../../types';
import { PedagogicalHeader } from '../common';

const SvgArrow = ({ dir, size = 18 }: { dir: string; size?: number }) => {
  const paths: Record<string, string> = {
    right: 'M3 12h14M13 6l6 6-6 6',
    down: 'M12 3v14M6 13l6 6 6-6',
    left: 'M21 12H7M11 6l-6 6 6 6',
    up: 'M12 21V7M6 11l6-6 6 6',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[dir] || paths.right} />
    </svg>
  );
};

export const DirectionalTrackingSheet = ({ data }: { data: DirectionalTrackingData }) => {
  const puzzles = data?.puzzles || [];
  const settings = data?.settings;
  const puzzleCount = puzzles.length;
  const aestheticMode = settings?.aestheticMode || 'standard';
  const isPremium = aestheticMode !== 'standard';

  // Grid Layout Kararı
  const gridCols = puzzleCount > 1 ? 'grid-cols-2' : 'grid-cols-1';
  const gridRows = puzzleCount > 2 ? 'grid-rows-2' : 'grid-rows-1';

  return (
    <div className="flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white p-8 print:p-4 overflow-hidden professional-worksheet">
      <PedagogicalHeader
        title={data?.title || 'YÖNSEL İZ SÜRME VE ALGORİTMİK DİKKAT'}
        instruction={data?.instruction || 'İşaretli noktadan başlayarak okları takip et ve şifreyi çöz.'}
      />

      <div className={`flex-1 grid ${gridCols} ${gridRows} gap-6 print:gap-3 mt-8 print:mt-4 content-stretch`}>
        {puzzles.map((puzzle, pIdx) => (
          <div 
            key={pIdx} 
            className={`
                flex flex-col p-4 print:p-2 border-[2px] rounded-[2.5rem] relative break-inside-avoid transition-all 
                ${isPremium ? 'bg-zinc-50/50 border-zinc-100 shadow-sm' : 'bg-white border-zinc-200'}
            `}
          >
            {/* Görev Başlığı */}
            <div className="flex justify-between items-center mb-3 print:mb-2 px-2">
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black">{pIdx + 1}</span>
                    <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{puzzle.title || 'ŞİFRE ÇÖZÜCÜ'}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-100 rounded-lg text-[8px] font-black uppercase text-indigo-600">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>START: {String.fromCharCode(65 + puzzle.startPos.c)}{puzzle.startPos.r + 1}</span>
                </div>
            </div>

            {/* Algoritma (Oklar) */}
            <div className="bg-zinc-900 text-white p-3 rounded-2xl border border-zinc-800 shadow-inner mb-4 flex flex-wrap gap-1 justify-center">
                {puzzle.steps.map((step: any, sIdx: number) => (
                    <div key={sIdx} className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-md border border-white/5">
                        <SvgArrow dir={step.dir || step.direction} size={14} />
                    </div>
                ))}
            </div>

            {/* Matris ve Şifre Alanı */}
            <div className="flex flex-col items-center gap-4 flex-1 justify-center">
                <div className="p-1.5 bg-white rounded-xl border border-zinc-100 shadow-sm">
                    <div 
                        className="grid gap-px bg-zinc-200 border-2 border-zinc-900 rounded-lg overflow-hidden"
                        style={{ gridTemplateColumns: `repeat(${puzzle.grid[0].length}, 1fr)` }}
                    >
                        {puzzle.grid.map((row, r) => row.map((cell, c) => (
                            <div key={`${r}-${c}`} className={`w-8 h-8 print:w-7 print:h-7 bg-white flex items-center justify-center relative`}>
                                {r === puzzle.startPos.r && c === puzzle.startPos.c && (
                                    <div className="absolute inset-0 sm:inset-0.5 bg-indigo-50 border-2 border-indigo-500 rounded-md flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></div>
                                    </div>
                                )}
                                <span className={`text-[11px] font-black ${r === puzzle.startPos.r && c === puzzle.startPos.c ? 'text-indigo-700' : 'text-zinc-800'}`}>
                                    {cell}
                                </span>
                            </div>
                        )))}
                    </div>
                </div>

                <div className="flex gap-1 justify-center">
                    {Array.from({ length: puzzle.answerLength || 5 }).map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-lg border-2 border-zinc-950 bg-zinc-50 flex items-center justify-center font-black text-zinc-300">
                            _
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Klinik Meta */}
            <div className="mt-3 pt-2 border-t border-zinc-100 flex justify-between items-center opacity-30">
                <span className="text-[6px] font-black uppercase">Load: {puzzle.clinicalMeta?.perceptualLoad?.toFixed(2)}</span>
                <span className="text-[6px] font-black uppercase">Steps: {puzzle.clinicalMeta?.attentionShiftCount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Pro */}
      <div className="mt-6 print:mt-4 p-5 print:p-3 bg-zinc-950 text-white rounded-[2.5rem] flex justify-between items-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent"></div>
          <div className="flex gap-4 items-center relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center border border-indigo-400">
                  <i className="fa-solid fa-route text-white text-lg animate-pulse"></i>
              </div>
              <div className="flex flex-col">
                  <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">PROGRAMLANABİLİR DİKKAT</span>
                  <span className="text-sm font-black uppercase">Algoritmik İz Sürme V2.1</span>
              </div>
          </div>
          
          <div className="flex gap-8 items-center relative z-10 pr-4">
              <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1">MÜFREDAT UYUMU</span>
                  <span className="text-[10px] font-black text-white italic">NEURO-COGNITIVE</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-right">
                  <span className="text-[14px] font-black text-indigo-300">{(settings?.difficulty || 'ORTA').toUpperCase()}</span>
              </div>
          </div>
      </div>
    </div>
  );
};
