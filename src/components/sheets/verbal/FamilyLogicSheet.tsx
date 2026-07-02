import React from 'react';
import { FamilyLogicTestData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FamilyLogicSheet = ({ data }: { data: FamilyLogicTestData }) => {
  return (
    <div className="flex flex-col bg-white p-3 print:p-2 text-black font-lexend overflow-visible min-h-[297mm]">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
      />

      <div className="flex flex-col gap-3 print:gap-1.5 mt-4 print:mt-2 content-start max-w-4xl mx-auto w-full">
        {(data.statements || []).map((st, idx) => (
          <EditableElement
            key={idx}
            className="flex items-center gap-4 print:gap-2 p-4 print:p-2 border border-zinc-200 bg-white rounded-2xl hover:bg-zinc-50 hover:border-indigo-200 transition-all group break-inside-avoid shadow-sm"
          >
            <div className="flex gap-2 shrink-0">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl border-2 border-emerald-500 bg-white flex items-center justify-center font-black text-emerald-500 shadow group-hover:scale-105 transition-transform cursor-pointer">
                  D
                </div>
                <span className="text-[7px] font-black text-zinc-400 mt-0.5 uppercase">DOĞRU</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl border-2 border-rose-500 bg-white flex items-center justify-center font-black text-rose-500 shadow group-hover:scale-105 transition-transform cursor-pointer">
                  Y
                </div>
                <span className="text-[7px] font-black text-zinc-400 mt-0.5 uppercase">YANLIŞ</span>
              </div>
            </div>
            <div className="flex-1 border-l-2 border-zinc-200 pl-4">
              <p className="text-base print:text-sm font-bold text-zinc-800 leading-snug tracking-tight">
                <EditableText value={st.text} tag="span" />
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-zinc-800 text-white flex items-center justify-center text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity shadow">
              {idx + 1}
            </div>
          </EditableElement>
        ))}
      </div>

      <div className="mt-auto pt-4 print:pt-1.5 border-t border-zinc-200 flex justify-between items-center px-3 print:px-1 opacity-30">
        <p className="text-[6px] text-zinc-400 font-bold uppercase tracking-[0.4em]">
          Bursa Disleksi EduMind
        </p>
        <div className="flex gap-2 print:gap-1">
          <div className="w-6 h-1.5 bg-zinc-200 rounded-full"></div>
          <div className="w-6 h-1.5 bg-indigo-500 rounded-full"></div>
          <div className="w-6 h-1.5 bg-zinc-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};



