import React from 'react';
import { FamilyRelationsData } from '../../../types';
import { PedagogicalHeader, ImageDisplay } from '../common';
import { EditableText } from '../../Editable';

export const FamilyRelationsSheet = ({ data }: { data: FamilyRelationsData }) => {
  const shuffledLabels = [...(data.pairs || [])].sort(() => Math.random() - 0.5);

  return (
    <div className="flex flex-col bg-white p-2 text-black font-lexend overflow-visible">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
        note={data.pedagogicalNote}
      />

      <div className="flex flex-col gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1 mt-6 print:mt-2">
        <div className="flex justify-between gap-16 print:gap-4 items-start">
          <div className="flex-1 space-y-6">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 border-b-2 border-indigo-50 pb-1">
              TANIMLAR
            </h4>
            {(data.pairs || []).map((pair, idx) => (
              <div key={idx} className="flex items-center gap-4 print:gap-1 group">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg">
                  {idx + 1}
                </div>
                <div className="flex-1 p-4 print:p-1 bg-zinc-50 border-2 border-zinc-200 rounded-2xl font-bold text-base leading-snug group-hover:border-indigo-400 transition-colors shadow-sm">
                  <EditableText value={pair.definition} tag="span" />
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-zinc-300 group-hover:bg-indigo-500 transition-all shrink-0 shadow-inner"></div>
              </div>
            ))}
          </div>

          <div className="w-56 space-y-6">
            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 border-b-2 border-rose-50 pb-1">
              AKRABALIK ADI
            </h4>
            {(shuffledLabels || []).map((pair, idx) => (
              <div key={idx} className="flex items-center gap-4 print:gap-1 group justify-end">
                <div className="w-6 h-6 rounded-full border-2 border-zinc-300 group-hover:bg-rose-500 transition-all shrink-0 shadow-inner"></div>
                <div className="w-full p-4 print:p-1 bg-white border-[3px] border-zinc-900 rounded-2xl text-center font-black text-rose-600 uppercase tracking-wider text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform">
                  <EditableText value={pair.label} tag="span" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1 mt-6 print:mt-2">
          <div className="border-[3px] border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl group hover:border-indigo-500 transition-colors">
            <div className="bg-zinc-900 group-hover:bg-indigo-600 text-white p-5 print:p-1 text-center transition-colors">
              <h4 className="font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3">
                <i className="fa-solid fa-venus"></i> Annemin Akrabaları
              </h4>
            </div>
            <div className="p-8 print:p-2 print:p-3 bg-white min-h-[300px] space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b-2 border-zinc-50 flex items-center gap-4 print:gap-1 py-2">
                  <span className="text-zinc-200 font-black text-xl">{i + 1}.</span>
                  <div className="flex-1 h-6 bg-zinc-50/50 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-[3px] border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl group hover:border-amber-500 transition-colors">
            <div className="bg-zinc-900 group-hover:bg-amber-600 text-white p-5 print:p-1 text-center transition-colors">
              <h4 className="font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3">
                <i className="fa-solid fa-mars"></i> Babamın Akrabaları
              </h4>
            </div>
            <div className="p-8 print:p-2 print:p-3 bg-white min-h-[300px] space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b-2 border-zinc-50 flex items-center gap-4 print:gap-1 py-2">
                  <span className="text-zinc-200 font-black text-xl">{i + 1}.</span>
                  <div className="flex-1 h-6 bg-zinc-50/50 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 print:pt-2 border-t border-zinc-100 flex justify-between items-center px-10 print:px-3 opacity-30">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">
            Kategori
          </span>
          <span className="text-[10px] font-bold text-zinc-800 uppercase">
            Hiyerarşik Mantık v2.2
          </span>
        </div>
        <div className="flex items-center gap-4 print:gap-1">
          <i className="fa-solid fa-sitemap text-2xl text-indigo-500"></i>
          <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em]">
            Bursa Disleksi AI • Bilişsel Gelişim Laboratuvarı
          </p>
        </div>
      </div>
    </div>
  );
};



