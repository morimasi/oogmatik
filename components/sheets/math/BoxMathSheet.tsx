import React from 'react';
import { BoxMathData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText, EditableElement } from '../../Editable';

export const BoxMathSheet = ({ data }: { data: BoxMathData }) => {
  return (
    <div className="flex flex-col bg-white p-2 text-black font-lexend overflow-visible">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
        note={data.pedagogicalNote}
      />

      <div className="flex flex-col gap-6 mt-4">
        {/* 2 Sütunlu Izgara Düzeni - A4 Verimliliği İçin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {(data.problems || []).map((prob, idx) => (
            <EditableElement
              key={idx}
              className="flex items-center justify-between p-4 border-2 border-zinc-100 bg-zinc-50/30 rounded-[2rem] hover:bg-white hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 text-white font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                  {idx + 1}
                </span>
                <div className="text-lg font-bold tracking-tighter text-zinc-800 flex items-center gap-1">
                  <EditableText value={prob.expression} tag="span" />
                  {data.mode === 'reverse' && (
                    <>
                      <span className="mx-1 text-zinc-400 font-black">=</span>
                      <span className="bg-white px-3 py-1 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-xl">
                        {prob.targetValue}
                      </span>
                    </>
                  )}
                  {data.mode === 'substitution' && (
                    <span className="mx-1 text-zinc-400 font-black">=</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                {data.mode === 'reverse' && (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      HEDEF
                    </span>
                    <div className="px-4 py-1.5 bg-white border-2 border-dashed border-indigo-200 rounded-xl font-black text-indigo-600 shadow-sm min-w-[60px] text-center">
                      □ = ?
                    </div>
                  </div>
                )}
                {data.mode === 'substitution' && (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      DEĞER
                    </span>
                    <div className="px-4 py-1.5 bg-zinc-900 text-white rounded-xl font-black shadow-md min-w-[60px] text-center transform group-hover:rotate-2 transition-transform">
                      □ = {prob.givenValue}
                    </div>
                  </div>
                )}
                {data.mode === 'simplification' && (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                      SADELEŞTİR
                    </span>
                    <div className="w-24 h-10 border-b-2 border-dashed border-zinc-300 flex items-end justify-center pb-1">
                      <span className="text-[10px] text-zinc-300 font-bold uppercase italic">
                        Sonuç
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </EditableElement>
          ))}
        </div>
      </div>

      {/* Alt Bilgi */}
      <div className="mt-12 pt-6 border-t border-zinc-100 flex justify-between items-center px-10 opacity-30">
        <div className="flex items-center gap-4">
          <i className="fa-solid fa-microchip text-2xl text-indigo-500"></i>
          <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em]">
            Bursa Disleksi AI • Nöro-Bilişsel Matematik Sistemi v4.0
          </p>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-zinc-200 rounded-full"></div>
          <div className="w-2 h-2 bg-zinc-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
