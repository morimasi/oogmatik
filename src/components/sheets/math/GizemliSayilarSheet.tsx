import React from 'react';
import { ActivityType } from '../../../types/activity';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

interface GizemliSayilarData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  pedagogicalNote: string;
  mysteryNumber: number;
  clues: { id: string; text: string; type: string }[];
  settings: Record<string, unknown>;
}

export const GizemliSayilarSheet: React.FC<{ data: GizemliSayilarData }> = ({ data }) => {
  return (
    <div className="flex flex-col bg-white p-8 text-black font-lexend min-h-[1123px]">
      <PedagogicalHeader
        title={data.title || 'Gizemli Sayı'}
        instruction={data.instruction || 'İpuçlarını takip et, gizli sayıyı bul!'}
        note={data.pedagogicalNote}
      />

      {/* İpuçları */}
      <div className="mt-8 space-y-4">
        {(data.clues || []).map((clue, idx) => (
          <EditableElement
            key={clue.id}
            className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold shrink-0 shadow-md">
              {idx + 1}
            </div>
            <EditableText
              value={clue.text}
              tag="p"
              className="text-lg font-medium text-zinc-800 flex-1"
            />
          </EditableElement>
        ))}
      </div>

      {/* Cevap Kutusu */}
      <div className="mt-12 flex justify-center">
        <div className="flex flex-col items-center gap-3">
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
            Gizli Sayı
          </label>
          <div className="w-36 h-20 bg-white border-4 border-dashed border-zinc-300 rounded-2xl flex items-center justify-center text-4xl font-bold text-zinc-300">
            ?
          </div>
          <p className="text-xs text-zinc-400 mt-2">Cevabını buraya yaz</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-zinc-100 flex justify-between items-center opacity-50">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-brain text-indigo-500"></i>
          <p className="text-[8px] font-bold uppercase tracking-wider">Mantıksal Çıkarım</p>
        </div>
      </div>
    </div>
  );
};

export default GizemliSayilarSheet;
