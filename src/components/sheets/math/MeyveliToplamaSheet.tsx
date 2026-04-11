import React from 'react';
import { ActivityType } from '../../../types/activity';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

interface MeyveliToplamaData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  pedagogicalNote: string;
  grid: { fruits: string[]; counts: number[][]; rowSum: number[] }[];
  targetSum: number;
  settings: Record<string, unknown>;
}

export const MeyveliToplamaSheet: React.FC<{ data: MeyveliToplamaData }> = ({ data }) => {
  const gridData = data.grid?.[0];
  const gridSize = gridData?.counts?.length || 3;

  return (
    <div className="flex flex-col bg-white p-8 text-black font-lexend min-h-[1123px]">
      <PedagogicalHeader
        title={data.title || 'Meyveli Toplama'}
        instruction={data.instruction || 'Meyveleri sayarak toplamları bul!'}
        note={data.pedagogicalNote}
      />

      {/* Meyve Legenda */}
      <div className="flex flex-wrap gap-4 mt-6 justify-center">
        {(gridData?.fruits || []).map((fruit, i) => (
          <div key={i} className="flex items-center gap-2 bg-zinc-50 px-3 py-2 rounded-xl">
            <span className="text-2xl">{fruit}</span>
            <span className="text-xs font-bold text-zinc-500">{String.fromCharCode(65 + i)}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8 flex justify-center">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {(gridData?.counts || []).flat().map((count, idx) => (
            <div
              key={idx}
              className="w-16 h-16 bg-white border-2 border-zinc-200 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm"
            >
              {count}
            </div>
          ))}
        </div>
      </div>

      {/* Toplam Satırı */}
      <div className="flex justify-center gap-4 mt-6">
        {(gridData?.rowSum || []).map((sum, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-lg font-bold text-indigo-600 border-2 border-indigo-300">
              {sum}
            </div>
            <span className="text-zinc-400">=</span>
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-lg font-bold text-white">
              {data.targetSum}
            </div>
          </div>
        ))}
      </div>

      {/* Cevap Alanı */}
      <div className="mt-12 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-bold text-zinc-500 uppercase">Cevap</label>
          <div className="w-32 h-16 bg-white border-4 border-dashed border-zinc-300 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-zinc-300">?</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeyveliToplamaSheet;
