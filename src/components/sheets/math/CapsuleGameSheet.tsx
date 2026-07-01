import React from 'react';
import { NumberCapsuleData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

const CAPSULE_COLORS = [
  'bg-amber-100 border-amber-400',
  'bg-sky-100 border-sky-400',
  'bg-rose-100 border-rose-400',
  'bg-lime-100 border-lime-400',
  'bg-violet-100 border-violet-400',
  'bg-teal-100 border-teal-400',
  'bg-orange-100 border-orange-400',
  'bg-pink-100 border-pink-400',
  'bg-emerald-100 border-emerald-400',
  'bg-cyan-100 border-cyan-400',
];

export const CapsuleGameSheet = ({ data, settings: _settings }: { data: NumberCapsuleData; settings?: unknown }) => {
  const puzzle = data.puzzles?.[0] || (data.grid ? { grid: data.grid, capsules: data.capsules || [], rowTargets: data.rowTargets, colTargets: data.colTargets } : null);
  if (!puzzle) return null;

  const { grid, capsules = [], rowTargets = [], colTargets = [] } = puzzle;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const isOdd = data.instruction?.includes('TEK') || data.instruction?.includes('Tek') || false;
  const aestheticMode = data.settings?.aestheticMode || 'crystal';
  const operation = data.settings?.operation || 'addition';

  const themeStyles = {
    crystal: {
      bg: 'bg-white',
      gridBg: 'bg-slate-50/50',
      cellBorder: 'border-slate-200',
      headerText: 'text-indigo-900',
      accent: 'indigo'
    },
    galaxy: {
      bg: 'bg-slate-950',
      gridBg: 'bg-indigo-950/20',
      cellBorder: 'border-indigo-800',
      headerText: 'text-indigo-200',
      accent: 'purple',
      textColor: 'text-white'
    },
    antique: {
      bg: 'bg-stone-50',
      gridBg: 'bg-orange-100/20',
      cellBorder: 'border-stone-300',
      headerText: 'text-stone-800',
      accent: 'amber'
    }
  };

  const theme = themeStyles[aestheticMode as keyof typeof themeStyles] || themeStyles.crystal;

  return (
    <div className={`flex flex-col ${theme.bg} ${theme.textColor || 'text-black'} font-['Lexend'] min-h-[297mm] p-4 print:p-3 transition-colors duration-500`}>
      <PedagogicalHeader title={data.title} instruction={data.instruction} data={data} />

      {/* Legend */}
      <div className="flex flex-wrap gap-2 items-center mb-2 text-[8px] font-bold text-zinc-500">
        <span className={`${theme.headerText} font-black uppercase tracking-wider text-[7px]`}>KAPSÜL HEDEFLERİ</span>
        {capsules.slice(0, 5).map((cap, i) => (
          <span key={cap.id} className={`px-1.5 py-0.5 rounded border ${CAPSULE_COLORS[i % CAPSULE_COLORS.length]} text-zinc-700 text-[7px] font-bold`}>
            {cap.target}
          </span>
        ))}
        {capsules.length > 5 && <span className="text-zinc-400">+{capsules.length - 5}</span>}
        <span className={`ml-auto text-[7px] ${theme.headerText} opacity-60`}>{isOdd ? 'Tek' : 'Çift'} sayılar</span>
      </div>

      {/* Game Grid */}
      <div className={`flex-1 flex items-center justify-center ${theme.gridBg} rounded-[2.5rem] p-8 border-4 ${theme.cellBorder} shadow-inner m-4`}>
        <div className="inline-flex flex-col">
          {/* Column Targets */}
          <div className="flex ml-11 mb-2">
            {colTargets.map((t, c) => (
              <div
                key={c}
                className={`w-12 h-8 flex items-center justify-center font-black text-sm ${aestheticMode === 'galaxy' ? 'text-cyan-300 bg-cyan-900/30' : 'text-teal-700 bg-teal-50'} border-2 border-teal-300 rounded-lg mx-px shadow-sm`}
              >
                {t}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          <div className="flex flex-col gap-1">
            {grid.map((row, r) => (
              <div key={r} className="flex items-center gap-2">
                {/* Row Label (Space for targets) */}
                <div className="w-9"></div>

                {/* Row cells */}
                <div className="flex gap-1">
                  {row.map((_, c) => {
                    const capsuleIdx = capsules.findIndex((cap) => cap.cells.some((cell) => cell.x === c && cell.y === r));
                    const capsule = capsuleIdx >= 0 ? capsules[capsuleIdx] : null;
                    const isFirst = capsule ? capsule.cells[0].x === c && capsule.cells[0].y === r : false;
                    const colorClass = capsuleIdx >= 0 ? CAPSULE_COLORS[capsuleIdx % CAPSULE_COLORS.length] : 'bg-white border-zinc-300';

                    return (
                      <div
                        key={c}
                        className={`relative w-12 h-12 border-3 rounded-xl flex items-center justify-center shadow-md transition-all ${colorClass} hover:scale-105`}
                      >
                        <EditableText value="" tag="span" placeholder="" className={`text-lg font-black ${aestheticMode === 'galaxy' ? 'text-white' : 'text-zinc-800'} w-full h-full flex items-center justify-center`} />
                        {isFirst && capsule && (
                          <div className={`absolute -top-3 -left-3 ${aestheticMode === 'galaxy' ? 'bg-purple-600' : 'bg-indigo-600'} text-white text-[8px] font-black px-2 py-1 rounded-lg border-2 border-white shadow-lg leading-none z-10`}>
                            {capsule.id.includes('+') || capsule.id.includes('×') || capsule.id.includes('-') || capsule.id.includes('÷') ? capsule.id : capsule.target}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Row Target */}
                <div className={`w-10 h-12 flex items-center justify-center font-black text-sm ${aestheticMode === 'galaxy' ? 'text-purple-300 bg-purple-900/30' : 'text-indigo-700 bg-indigo-50'} border-2 border-indigo-300 rounded-xl ml-1 shadow-sm`}>
                  {rowTargets[r]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className={`mt-2 flex items-center gap-2 text-[8px] font-medium ${aestheticMode === 'galaxy' ? 'text-indigo-300 bg-indigo-900/20' : 'text-zinc-400 bg-zinc-50'} rounded-xl px-4 py-3 border border-zinc-200`}>
        <i className={`fa-solid fa-circle-info ${theme.headerText} text-sm shrink-0`} />
        <span>Kapsül içindeki sayılar {operation === 'multiplication' ? 'ÇARPILDIĞINDA' : operation === 'subtraction' ? 'ÇIKARILDIĞINDA' : operation === 'division' ? 'BÖLÜNDÜĞÜNDE' : 'TOPLANDIĞINDA'} kapsülün köşesindeki hedefe ulaşmalı.</span>
      </div>

      {/* Clinical Panel */}
      <div className={`mt-2 pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-2xl ${aestheticMode === 'galaxy' ? 'bg-indigo-900/40 border border-indigo-800' : 'bg-zinc-900'} text-white`}>

        <div className="col-span-1 flex flex-col justify-center">
          <span className="text-[8px] font-black uppercase leading-tight text-zinc-400">
            SAYISAL<br />AKIL
          </span>
        </div>
        {[
          { label: 'SÜRE', val: '__:__', unit: 'dk' },
          { label: 'DOĞRU', val: '__', unit: '/' + (rows * cols) },
          { label: 'PUAN', val: '___', unit: 'p' },
        ].map((item) => (
          <div key={item.label} className="bg-white/10 border border-white/10 rounded-lg p-2 flex flex-col justify-between">
            <span className="text-[7px] font-black text-zinc-500 uppercase">{item.label}</span>
            <div className="flex items-end gap-0.5">
              <span className="text-sm font-black text-white">{item.val}</span>
              <span className="text-[6px] font-bold text-zinc-500 mb-0.5">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
