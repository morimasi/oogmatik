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

  return (
    <div className="flex flex-col bg-white font-['Lexend'] min-h-[297mm] p-4 print:p-3">
      <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />

      {/* Legend */}
      <div className="flex flex-wrap gap-2 items-center mb-2 text-[8px] font-bold text-zinc-500">
        <span className="text-indigo-600 font-black uppercase tracking-wider text-[7px]">KAPSÜL</span>
        {capsules.slice(0, 3).map((cap, i) => (
          <span key={cap.id} className={`px-1.5 py-0.5 rounded border ${CAPSULE_COLORS[i % CAPSULE_COLORS.length]} text-zinc-700 text-[7px] font-bold`}>
            {cap.target}
          </span>
        ))}
        {capsules.length > 3 && <span className="text-zinc-400">+{capsules.length - 3}</span>}
        <span className="ml-auto text-[7px] text-zinc-400">{isOdd ? 'Tek' : 'Çift'} sayılar</span>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="inline-flex flex-col">
          {/* Column Targets */}
          <div className="flex ml-9 mb-1">
            {colTargets.map((t, c) => (
              <div
                key={c}
                className="w-10 h-7 flex items-center justify-center font-black text-sm text-teal-700 bg-teal-50 border border-teal-300 rounded-md mx-px"
              >
                {t}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          <div className="flex flex-col gap-px">
            {grid.map((row, r) => (
              <div key={r} className="flex items-center gap-1">
                {/* Row cells */}
                <div className="flex gap-px">
                  {row.map((_, c) => {
                    const capsuleIdx = capsules.findIndex((cap) => cap.cells.some((cell) => cell.x === c && cell.y === r));
                    const capsule = capsuleIdx >= 0 ? capsules[capsuleIdx] : null;
                    const isFirst = capsule ? capsule.cells[0].x === c && capsule.cells[0].y === r : false;
                    const colorClass = capsuleIdx >= 0 ? CAPSULE_COLORS[capsuleIdx % CAPSULE_COLORS.length] : 'bg-white border-zinc-300';

                    return (
                      <div
                        key={c}
                        className={`relative w-10 h-10 border-2 rounded-lg flex items-center justify-center shadow-sm ${colorClass}`}
                      >
                        <EditableText value="" tag="span" placeholder="" className="text-base font-black text-zinc-800 w-full h-full flex items-center justify-center" />
                        {isFirst && capsule && (
                          <div className="absolute -top-2.5 -left-2.5 bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md border border-white shadow-sm leading-none z-10">
                            {capsule.target}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Row Target */}
                <div className="w-9 h-10 flex items-center justify-center font-black text-sm text-indigo-700 bg-indigo-50 border border-indigo-300 rounded-lg ml-1">
                  {rowTargets[r]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-2 flex items-center gap-2 text-[8px] font-medium text-zinc-400 bg-zinc-50 rounded-xl px-3 py-2 border border-zinc-200">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400 shrink-0">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>Her satır/sütun toplamı belirtilen hedefe ulaşmalı. Kapsül (renkli grup) içindeki sayıların toplamı, kapsülün sol üstündeki sayıyı vermeli.</span>
      </div>

      {/* Clinical Panel */}
      <div className="mt-2 pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-t-2xl bg-zinc-900 text-white">
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
