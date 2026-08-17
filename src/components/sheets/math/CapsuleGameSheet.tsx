import React from 'react';
import { NumberCapsuleData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

const CAPSULE_COLORS = [
  'bg-amber-100/90 border-amber-400 text-amber-950',
  'bg-sky-100/90 border-sky-400 text-sky-950',
  'bg-rose-100/90 border-rose-400 text-rose-950',
  'bg-lime-100/90 border-lime-400 text-lime-950',
  'bg-violet-100/90 border-violet-400 text-violet-950',
  'bg-teal-100/90 border-teal-400 text-teal-950',
  'bg-orange-100/90 border-orange-400 text-orange-950',
  'bg-pink-100/90 border-pink-400 text-pink-950',
  'bg-emerald-100/90 border-emerald-400 text-emerald-950',
  'bg-cyan-100/90 border-cyan-400 text-cyan-950',
];

export const CapsuleGameSheet = ({ data }: { data: NumberCapsuleData; settings?: unknown }) => {
  const puzzles = data.puzzles && data.puzzles.length > 0
    ? data.puzzles
    : (data.grid ? [{ grid: data.grid, capsules: data.capsules || [], rowTargets: data.rowTargets || [], colTargets: data.colTargets || [] }] : []);

  if (puzzles.length === 0) return null;

  const aestheticMode = data.settings?.aestheticMode || 'crystal';
  const operation = data.settings?.operation || 'addition';

  const themeStyles: Record<string, { bg: string; cardBg: string; cellBorder: string; headerText: string; accentBadge: string; targetBg: string; textColor: string; fontStyle: string }> = {
    crystal: {
      bg: 'bg-white',
      cardBg: 'bg-slate-50/70 border-slate-200',
      cellBorder: 'border-slate-300',
      headerText: 'text-indigo-900',
      accentBadge: 'bg-indigo-600 text-white',
      targetBg: 'text-indigo-900 bg-indigo-50 border-indigo-300',
      textColor: 'text-slate-900',
      fontStyle: 'font-sans'
    },
    galaxy: {
      bg: 'bg-slate-950',
      cardBg: 'bg-indigo-950/40 border-indigo-800/60',
      cellBorder: 'border-indigo-700/60',
      headerText: 'text-indigo-200',
      accentBadge: 'bg-purple-600 text-white',
      targetBg: 'text-cyan-200 bg-indigo-900/60 border-cyan-500/50',
      textColor: 'text-indigo-100',
      fontStyle: 'font-sans'
    },
    antique: {
      bg: 'bg-amber-50/40',
      cardBg: 'bg-amber-100/30 border-amber-200',
      cellBorder: 'border-amber-300/80',
      headerText: 'text-amber-950',
      accentBadge: 'bg-amber-700 text-amber-50',
      targetBg: 'text-amber-900 bg-amber-200/50 border-amber-400',
      textColor: 'text-amber-950',
      fontStyle: 'font-serif'
    },
    neon: {
      bg: 'bg-zinc-950',
      cardBg: 'bg-zinc-900/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
      cellBorder: 'border-emerald-500/50',
      headerText: 'text-emerald-400',
      accentBadge: 'bg-emerald-500 text-zinc-950 font-black',
      targetBg: 'text-emerald-300 bg-emerald-950/80 border-emerald-400',
      textColor: 'text-zinc-100',
      fontStyle: 'font-mono'
    },
    cyber: {
      bg: 'bg-blue-950',
      cardBg: 'bg-slate-900/90 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      cellBorder: 'border-cyan-400/60',
      headerText: 'text-cyan-300',
      accentBadge: 'bg-cyan-400 text-slate-950 font-black',
      targetBg: 'text-cyan-200 bg-cyan-950/90 border-cyan-400',
      textColor: 'text-cyan-50',
      fontStyle: 'font-mono'
    },
    forest: {
      bg: 'bg-emerald-50/30',
      cardBg: 'bg-emerald-100/20 border-emerald-200',
      cellBorder: 'border-emerald-300',
      headerText: 'text-emerald-900',
      accentBadge: 'bg-emerald-700 text-white',
      targetBg: 'text-emerald-900 bg-emerald-100 border-emerald-400',
      textColor: 'text-emerald-950',
      fontStyle: 'font-sans'
    }
  };

  const theme = themeStyles[aestheticMode as string] || themeStyles.crystal;
  const isMultiPuzzle = puzzles.length > 1;

  return (
    <div className={`w-full flex flex-col ${theme.bg} ${theme.textColor} font-['Lexend'] min-h-[297mm] p-4 print:p-2 transition-all duration-300`}>
      <PedagogicalHeader title={data.title} instruction={data.instruction} data={data} />

      {/* Grid of Puzzles (A4 Full Coverage) */}
      <div className={`flex-1 grid ${isMultiPuzzle ? 'grid-cols-1 md:grid-cols-2 print:grid-cols-2' : 'grid-cols-1'} gap-6 print:gap-3 my-2 items-center`}>
        {puzzles.map((puzzleItem, pIdx) => {
          const { grid, capsules = [], rowTargets = [], colTargets = [] } = puzzleItem;
          const rows = grid.length;
          const cols = grid[0]?.length || 0;

          // Dynamically scale cell size based on grid dimension
          const cellSizeClass = cols <= 3
            ? 'w-14 h-14 print:w-12 print:h-12 text-xl'
            : (cols === 4 ? 'w-12 h-12 print:w-10 print:h-10 text-lg' : 'w-10 h-10 print:w-8 print:h-8 text-base');

          return (
            <div
              key={puzzleItem.id || pIdx}
              className={`flex flex-col items-center justify-between rounded-3xl p-5 print:p-3 border-2 ${theme.cardBg} shadow-md relative overflow-hidden`}
            >
              {/* Header Badge */}
              <div className="w-full flex items-center justify-between mb-3 border-b border-zinc-200/20 pb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.accentBadge}`}>
                  Bulmaca #{pIdx + 1} ({rows}x{cols})
                </span>
                <span className="text-[9px] font-bold opacity-70">
                  İşlem: {operation === 'multiplication' ? 'Çarpma' : operation === 'subtraction' ? 'Çıkarma' : operation === 'division' ? 'Bölme' : 'Toplama'}
                </span>
              </div>

              {/* Game Grid */}
              <div className="inline-flex flex-col items-center my-auto">
                {/* Column Targets */}
                <div className="flex ml-10 mb-1.5 gap-1.5">
                  {colTargets.map((t: number, c: number) => (
                    <div
                      key={c}
                      className={`flex items-center justify-center font-black text-xs border-2 rounded-xl shadow-sm ${theme.targetBg}`}
                      style={{ width: cols <= 3 ? '3.5rem' : cols === 4 ? '3rem' : '2.5rem', height: '2rem' }}
                    >
                      {t}
                    </div>
                  ))}
                </div>

                {/* Grid Rows */}
                <div className="flex flex-col gap-1.5">
                  {grid.map((row: any[], r: number) => (
                    <div key={r} className="flex items-center gap-1.5">
                      {/* Empty spacer for alignment */}
                      <div className="w-8"></div>

                      {/* Row cells */}
                      <div className="flex gap-1.5">
                        {row.map((_: any, c: number) => {
                          const capsuleIdx = capsules.findIndex((cap: any) => cap.cells.some((cell: any) => cell.x === c && cell.y === r));
                          const capsule = capsuleIdx >= 0 ? capsules[capsuleIdx] : null;
                          const isFirst = capsule ? capsule.cells[0].x === c && capsule.cells[0].y === r : false;
                          const colorClass = capsuleIdx >= 0 ? CAPSULE_COLORS[capsuleIdx % CAPSULE_COLORS.length] : 'bg-white border-zinc-300 text-zinc-900';

                          return (
                            <div
                              key={c}
                              className={`relative ${cellSizeClass} border-2 rounded-xl flex items-center justify-center shadow-sm transition-all ${colorClass}`}
                            >
                              <EditableText value="" tag="span" placeholder="" className="w-full h-full flex items-center justify-center font-black" />
                              {isFirst && capsule && (
                                <div className={`absolute -top-2.5 -left-2.5 ${theme.accentBadge} text-[9px] font-black px-1.5 py-0.5 rounded-md border border-white shadow-md leading-none z-10`}>
                                  {capsule.id.includes('+') || capsule.id.includes('×') || capsule.id.includes('-') || capsule.id.includes('÷') ? capsule.id : capsule.target}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Row Target */}
                      <div className={`flex items-center justify-center font-black text-xs border-2 rounded-xl ml-1 shadow-sm ${theme.targetBg}`}
                        style={{ height: cols <= 3 ? '3.5rem' : cols === 4 ? '3rem' : '2.5rem', width: '2.5rem' }}
                      >
                        {rowTargets[r]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capsule Target Mini Legend */}
              <div className="w-full mt-3 pt-2 border-t border-zinc-200/20 flex flex-wrap gap-1.5 justify-center text-[8px] font-bold">
                {capsules.map((cap: any, i: number) => (
                  <span key={cap.id} className={`px-1.5 py-0.5 rounded-md border ${CAPSULE_COLORS[i % CAPSULE_COLORS.length]} text-[8px] font-black shadow-xs`}>
                    Hedef: {cap.target}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className={`mt-auto flex items-center gap-2 text-[9px] font-medium ${theme.cardBg} rounded-xl px-4 py-2.5 border`}>
        <i className="fa-solid fa-circle-info text-sm shrink-0 opacity-80" />
        <span>Kapsül içindeki sayılar {operation === 'multiplication' ? 'ÇARPILDIĞINDA' : operation === 'subtraction' ? 'ÇIKARILDIĞINDA' : operation === 'division' ? 'BÖLÜNDÜĞÜNDE' : 'TOPLANDIĞINDA'} kapsülün köşesindeki hedefe ulaşmalı.</span>
      </div>

      {/* Clinical Performance Metric Footer */}
      <div className="mt-2 pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-2xl bg-zinc-900 text-white">
        <div className="col-span-1 flex flex-col justify-center">
          <span className="text-[8px] font-black uppercase leading-tight text-zinc-400">
            SAYISAL AKIL &<br />MATRİS ANALİZİ
          </span>
        </div>
        {[
          { label: 'HEDEF SÜRE', val: '10:00', unit: 'dk' },
          { label: 'BAŞARI', val: '___', unit: '%' },
          { label: 'SKOR', val: '___', unit: 'p' },
        ].map((item) => (
          <div key={item.label} className="bg-white/10 border border-white/10 rounded-lg p-1.5 flex flex-col justify-between">
            <span className="text-[7px] font-black text-zinc-400 uppercase">{item.label}</span>
            <div className="flex items-end gap-0.5">
              <span className="text-xs font-black text-white">{item.val}</span>
              <span className="text-[6px] font-bold text-zinc-400 mb-0.5">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
