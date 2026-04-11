import React from 'react';
import { ActivityType } from '../../../types/activity';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

interface SayiDedektifiData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  pedagogicalNote: string;
  mysteryNumber: number;
  clues: { id: string; text: string; type: string }[];
  settings: Record<string, unknown>;
}

export const SayiDedektifiSheet: React.FC<{ data: SayiDedektifiData }> = ({ data }) => (
  <div className="flex flex-col bg-white p-8 text-black font-lexend min-h-[1123px]">
    <PedagogicalHeader
      title={data.title || 'Sayı Dedektifi'}
      instruction={data.instruction || 'İpuçlarını takip et!'}
      note={data.pedagogicalNote}
    />
    <div className="mt-8 bg-amber-50 p-6 rounded-2xl border-2 border-amber-200">
      <h3 className="text-amber-800 font-bold mb-4">🔍 Dedektif İpuçları</h3>
      {data.clues?.map((clue, i) => (
        <div key={clue.id} className="flex gap-3 mb-2 p-2 bg-white rounded-lg">
          <span className="text-amber-600">✓</span>
          <span>{clue.text}</span>
        </div>
      ))}
    </div>
    <div className="mt-12 flex justify-center">
      <div className="bg-zinc-900 text-white px-8 py-4 rounded-xl text-2xl font-bold">
        Gizli Sayı: _______
      </div>
    </div>
  </div>
);

export default SayiDedektifiSheet;
