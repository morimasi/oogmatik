import React from 'react';
import { ActivityType } from '../../../types/activity';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

interface EsAnlamliKelimelerData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  pedagogicalNote: string;
  pairs: { word: string; synonyms: string[] }[];
  settings: Record<string, unknown>;
}

export const EsAnlamliKelimelerSheet: React.FC<{ data: EsAnlamliKelimelerData }> = ({ data }) => (
  <div className="flex flex-col bg-white p-8 text-black font-lexend min-h-[1123px]">
    <PedagogicalHeader
      title={data.title || 'Eş Anlamlı Kelimeler'}
      instruction={data.instruction || 'Eş anlamlıları bul!'}
      note={data.pedagogicalNote}
    />
    <div className="mt-8 grid grid-cols-2 gap-4">
      {data.pairs?.map((pair, i) => (
        <div key={i} className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl">
          <div className="flex-1 bg-white border-2 border-zinc-200 rounded-lg px-3 py-2 font-bold text-center">
            {pair.word}
          </div>
          <div className="flex gap-1">
            <input
              type="text"
              className="w-16 h-10 border-2 border-dashed border-indigo-200 rounded-lg text-center"
              placeholder="?"
            />
            <input
              type="text"
              className="w-16 h-10 border-2 border-dashed border-indigo-200 rounded-lg text-center"
              placeholder="?"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default EsAnlamliKelimelerSheet;
