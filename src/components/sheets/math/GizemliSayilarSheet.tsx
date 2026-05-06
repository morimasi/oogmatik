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
  riddles: {
    id: string;
    mysteryNumber: number;
    clues: { id: string; text: string; type: string }[];
  }[];
  settings: Record<string, unknown>;
}

export const GizemliSayilarSheet: React.FC<{ data: GizemliSayilarData }> = ({ data }) => {
  const riddles = data.riddles || [];
  
  // Choose layout based on number of riddles
  const getGridClass = () => {
    if (riddles.length >= 8) return 'grid grid-cols-2 gap-x-4 gap-y-4 mt-6';
    if (riddles.length >= 6) return 'grid grid-cols-2 gap-x-6 gap-y-6 mt-6';
    return 'grid grid-cols-2 gap-x-8 gap-y-8 mt-8';
  };

  return (
    <div className="flex flex-col bg-white p-8 text-black font-lexend min-h-[1123px]">
      <PedagogicalHeader
        title={data.title || 'Gizemli Sayılar'}
        instruction={data.instruction || 'İpuçlarını dikkatlice oku ve her kutudaki gizemli sayıyı bul!'}
        note={data.pedagogicalNote}
      />

      <div className={getGridClass()}>
        {riddles.map((riddle, index) => (
          <div key={riddle.id} className="flex flex-col bg-zinc-50 rounded-2xl border-2 border-zinc-100 p-5 shadow-sm relative">
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white">
              {index + 1}
            </div>
            
            <div className="flex-1 space-y-3 mt-2">
              {riddle.clues.map((clue, cIdx) => (
                <EditableElement
                  key={clue.id}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {cIdx + 1}
                  </div>
                  <EditableText
                    value={clue.text}
                    tag="p"
                    className="text-sm font-medium text-zinc-700 leading-tight"
                  />
                </EditableElement>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-zinc-200 border-dashed flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gizemli Sayı</span>
              <div className="w-20 h-10 bg-white border-2 border-zinc-300 rounded-lg flex items-center justify-center">
                <span className="text-zinc-200 font-bold">?</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-zinc-100 flex justify-between items-center opacity-50">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-brain text-indigo-500"></i>
          <p className="text-[8px] font-bold uppercase tracking-wider">Mantıksal Çıkarım & Sayı Duyusu</p>
        </div>
      </div>
    </div>
  );
};

export default GizemliSayilarSheet;
