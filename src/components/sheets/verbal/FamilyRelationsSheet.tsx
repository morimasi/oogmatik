import React from 'react';
import { FamilyRelationsData } from '../../../types';
import { PedagogicalHeader, ImageDisplay } from '../common';
import { EditableText } from '../../Editable';

export const FamilyRelationsSheet = ({ data }: { data: FamilyRelationsData }) => {
  const shuffledLabels = [...(data.pairs || [])].sort(() => Math.random() - 0.5);

  return (
    <div className="flex flex-col bg-white p-3 print:p-2 text-black font-lexend overflow-visible min-h-[297mm]">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
      />

      <div className="flex flex-col gap-6 print:gap-3 mt-4 print:mt-2">
        <div className="flex justify-between gap-6 print:gap-3 items-start">
          <div className="flex-1 space-y-3 print:space-y-1.5">
            <h4 className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1 border-b border-indigo-100 pb-0.5">
              TANIMLAR
            </h4>
            {(data.pairs || []).map((pair, idx) => (
              <div key={idx} className="flex items-center gap-2 print:gap-1 group">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-black text-xs shrink-0 shadow">
                  {idx + 1}
                </div>
                <div className="flex-1 p-2 print:p-1 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm print:text-xs leading-snug group-hover:border-indigo-400 transition-colors shadow-sm">
                  <EditableText value={pair.definition} tag="span" />
                </div>
                <div className="w-5 h-5 rounded-full border border-zinc-300 group-hover:bg-indigo-500 transition-all shrink-0"></div>
              </div>
            ))}
          </div>

          <div className="w-44 print:w-40 space-y-3 print:space-y-1.5">
            <h4 className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1 border-b border-rose-100 pb-0.5">
              AKRABALIK ADI
            </h4>
            {(shuffledLabels || []).map((pair, idx) => (
              <div key={idx} className="flex items-center gap-2 print:gap-1 group justify-end">
                <div className="w-5 h-5 rounded-full border border-zinc-300 group-hover:bg-rose-500 transition-all shrink-0"></div>
                <div className="w-full p-2 print:p-1 bg-white border-2 border-zinc-800 rounded-xl text-center font-black text-rose-600 uppercase tracking-wider text-sm print:text-xs shadow group-hover:scale-102 transition-transform">
                  <EditableText value={pair.label} tag="span" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 print:gap-2">
          <div className="border-2 border-zinc-800 rounded-2xl overflow-hidden shadow-lg group hover:border-indigo-500 transition-colors">
            <div className="bg-zinc-800 group-hover:bg-indigo-600 text-white p-2 print:p-1 text-center transition-colors">
              <h4 className="font-black uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-2">
                <i className="fa-solid fa-venus"></i> Annemin Akrabaları
              </h4>
            </div>
            <div className="p-4 print:p-2 bg-white min-h-[200px] space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b border-zinc-100 flex items-center gap-2 py-1">
                  <span className="text-zinc-300 font-black text-sm">{i + 1}.</span>
                  <div className="flex-1 h-4 bg-zinc-50/50 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-2 border-zinc-800 rounded-2xl overflow-hidden shadow-lg group hover:border-amber-500 transition-colors">
            <div className="bg-zinc-800 group-hover:bg-amber-600 text-white p-2 print:p-1 text-center transition-colors">
              <h4 className="font-black uppercase tracking-[0.25em] text-xs flex items-center justify-center gap-2">
                <i className="fa-solid fa-mars"></i> Babamın Akrabaları
              </h4>
            </div>
            <div className="p-4 print:p-2 bg-white min-h-[200px] space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b border-zinc-100 flex items-center gap-2 py-1">
                  <span className="text-zinc-300 font-black text-sm">{i + 1}.</span>
                  <div className="flex-1 h-4 bg-zinc-50/50 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 print:pt-1 border-t border-zinc-200 flex justify-between items-center px-3 print:px-1 opacity-30">
        <div className="flex flex-col">
          <span className="text-[6px] font-black text-zinc-400 uppercase tracking-[0.15em]">
            Kategori
          </span>
          <span className="text-[8px] font-bold text-zinc-700 uppercase">
            Hiyerarşik Mantık
          </span>
        </div>
        <div className="flex items-center gap-2 print:gap-1">
          <i className="fa-solid fa-sitemap text-sm text-indigo-500"></i>
          <p className="text-[6px] text-zinc-400 font-bold uppercase tracking-[0.4em]">
            Bursa Disleksi EduMind
          </p>
        </div>
      </div>
    </div>
  );
};



