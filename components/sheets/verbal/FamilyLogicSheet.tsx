import React from 'react';
import { FamilyLogicTestData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FamilyLogicSheet = ({ data }: { data: FamilyLogicTestData }) => {
  return (
    <div className="flex flex-col bg-white p-2 text-black font-lexend overflow-visible">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
        note={data.pedagogicalNote}
      />

      <div className="flex flex-col gap-4 mt-6 content-start max-w-4xl mx-auto w-full">
        {(data.statements || []).map((st, idx) => (
          <EditableElement
            key={idx}
            className="flex items-center gap-8 print:gap-3 print:p-3 p-5 border-2 border-zinc-100 bg-white rounded-[2rem] hover:bg-zinc-50 hover:border-indigo-200 transition-all group break-inside-avoid shadow-sm"
          >
            <div className="flex gap-3 shrink-0">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl border-[3px] border-emerald-500 bg-white flex items-center justify-center font-black text-emerald-500 shadow-md group-hover:scale-110 transition-transform cursor-pointer">
                  D
                </div>
                <span className="text-[8px] font-black text-zinc-400 mt-1 uppercase">DOĞRU</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl border-[3px] border-rose-500 bg-white flex items-center justify-center font-black text-rose-500 shadow-md group-hover:scale-110 transition-transform cursor-pointer">
                  Y
                </div>
                <span className="text-[8px] font-black text-zinc-400 mt-1 uppercase">YANLIŞ</span>
              </div>
            </div>
            <div className="flex-1 border-l-4 border-zinc-100 pl-6">
              <p className="text-lg font-bold text-zinc-800 leading-snug tracking-tight">
                <EditableText value={st.text} tag="span" />
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-sm font-black opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              {idx + 1}
            </div>
          </EditableElement>
        ))}
      </div>

      <div className="mt-12 p-8 print:p-3 bg-zinc-900 text-white rounded-[3.5rem] shadow-2xl flex items-center gap-10 print:gap-4 print:p-4 border-4 border-white relative overflow-hidden break-inside-avoid">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
          <i className="fa-solid fa-brain text-[12rem]"></i>
        </div>
        <div className="w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center text-3xl text-indigo-400 border border-white/10 shrink-0 shadow-inner">
          <i className="fa-solid fa-lightbulb"></i>
        </div>
        <div className="relative z-10">
          <h5 className="font-black text-xs text-indigo-400 uppercase tracking-[0.4em] mb-2">
            UZMAN STRATEJİSİ
          </h5>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed italic">
            "Akrabalık ifadelerini değerlendirirken zihninde bir 'Soy Ağacı' simülasyonu oluşturmaya
            çalış. Bu, uzamsal bellek ve mantıksal çıkarsama yollarını eşzamanlı olarak aktif
            edecektir."
          </p>
        </div>
      </div>

      <div className="mt-auto pt-8 flex justify-between items-center px-10 opacity-30">
        <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em]">
          Bursa Disleksi AI • Bilişsel Muhakeme Modülü
        </p>
        <div className="flex gap-4">
          <div className="w-8 h-2 bg-zinc-200 rounded-full"></div>
          <div className="w-8 h-2 bg-indigo-500 rounded-full"></div>
          <div className="w-8 h-2 bg-zinc-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};


