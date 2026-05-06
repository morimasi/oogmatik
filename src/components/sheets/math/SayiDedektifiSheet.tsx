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
  riddles: {
    id: string;
    mysteryNumber: number;
    clues: { id: string; text: string; type: string }[];
  }[];
  settings: Record<string, unknown>;
}

export const SayiDedektifiSheet: React.FC<{ data: SayiDedektifiData }> = ({ data }) => (
  <div className="flex flex-col bg-white p-6 text-black font-lexend min-h-[1123px]">
    <PedagogicalHeader
      title={data.title || 'Sayı Dedektifi Macerası'}
      instruction={data.instruction || 'İpuçlarını takip et, gizli sayıları bul!'}
      note={data.pedagogicalNote}
    />
    
    <div className="grid grid-cols-2 gap-4 mt-4 print:gap-3">
      {data.riddles?.map((riddle, idx) => (
        <div 
          key={riddle.id} 
          className="bg-zinc-50 border-2 border-zinc-200 rounded-[2rem] p-4 flex flex-col relative overflow-hidden group hover:border-indigo-300 transition-colors"
        >
          {/* Badge */}
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-widest">
            Görev {idx + 1}
          </div>

          <h3 className="text-zinc-400 font-black text-[10px] uppercase mb-3 flex items-center gap-2">
            <i className="fa-solid fa-magnifying-glass text-indigo-500"></i>
            Dedektif Raporu
          </h3>

          <div className="flex-1 space-y-2">
            {riddle.clues?.map((clue) => (
              <div key={clue.id} className="flex gap-2 items-start bg-white p-2 rounded-xl border border-zinc-100 shadow-sm">
                <span className="text-indigo-500 mt-0.5"><i className="fa-solid fa-circle-check text-[10px]"></i></span>
                <EditableText 
                  value={clue.text} 
                  className="text-[11px] font-bold text-zinc-700 leading-tight"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 uppercase">Gizli Sayı:</span>
            <div className="w-16 h-10 bg-white border-2 border-indigo-100 rounded-xl flex items-center justify-center">
               <span className="text-zinc-200 font-bold">?</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Footer Logo/Brand Area */}
    <div className="mt-auto pt-8 flex justify-between items-end opacity-20 grayscale no-print">
       <div className="text-[10px] font-black uppercase tracking-tighter">Oogmatik Premium Activity</div>
       <div className="text-[10px] font-medium italic">Bursa Disleksi Akademisi</div>
    </div>
  </div>
);

export default SayiDedektifiSheet;
