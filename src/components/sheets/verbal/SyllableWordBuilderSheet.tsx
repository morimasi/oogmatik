import React from 'react';
import { SyllableWordBuilderData } from '../../../types';
import { PedagogicalHeader, ImageDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const SyllableWordBuilderSheet = ({ data }: { data: SyllableWordBuilderData }) => (
  <div className="flex flex-col bg-white font-['Lexend'] text-zinc-900 relative overflow-hidden professional-worksheet print:w-[210mm] print:h-[297mm] px-[12mm] py-[15mm]">
    {/* Premium Gradient Header - CMYK Baskı Uyumlu */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 opacity-100"></div>

    <PedagogicalHeader
      title={data.title}
      instruction={data.instruction}
    />

    <div className="flex-1 flex flex-col gap-4 print:gap-2.5 mt-2.5">
      {/* Kelime Kartları - Ultra Kompakt Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2.5 content-start">
        {(data.words || []).map((word, idx) => (
          <EditableElement
            key={idx}
            className="flex items-center gap-3 print:gap-2 p-3.5 print:p-2 border-[2px] border-zinc-800 rounded-[1.5rem] bg-white shadow-sm break-inside-avoid group hover:border-rose-500 transition-all"
          >
            <div className="w-16 h-16 print:w-14 print:h-14 rounded-[1.25rem] bg-zinc-50 border border-zinc-200 shrink-0 overflow-hidden shadow-inner">
              <ImageDisplay
                prompt={word.imagePrompt}
                description={word.targetWord}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-1.5 print:space-y-1">
              <div className="flex gap-1.5 flex-wrap">
                {word.syllables.map((_, sIdx) => (
                  <div
                    key={sIdx}
                    className="w-11 h-9 print:w-9 print:h-8 border-b-[3px] border-dashed border-zinc-300 bg-zinc-50/50 rounded-t-[0.75rem] flex items-center justify-center font-black text-lg print:text-base text-zinc-200"
                  >
                    ?
                  </div>
                ))}
              </div>
            </div>
          </EditableElement>
        ))}
      </div>

      {/* Hece Havuzu - Premium Kompakt */}
      <div className="mt-auto p-4 print:p-2.5 bg-zinc-900 text-white rounded-[1.75rem] shadow-xl relative overflow-hidden break-inside-avoid border-[3px] border-white">
        <div className="absolute top-0 right-0 p-4 print:p-2 opacity-10 rotate-12">
          <i className="fa-solid fa-puzzle-piece text-6xl print:text-4xl"></i>
        </div>
        <h4 className="text-[9.5px] font-black uppercase tracking-[0.35em] text-rose-400 mb-4 print:mb-2 flex items-center gap-2">
          <i className="fa-solid fa-layer-group"></i> HECE HAVUZU
        </h4>
        <div className="flex flex-wrap justify-center gap-2.5 print:gap-1 relative z-10">
          {(data.syllableBank || []).map((syllable, idx) => (
            <EditableElement
              key={idx}
              className="px-4 print:px-2 py-2 bg-white text-zinc-900 rounded-xl font-black text-lg print:text-base shadow-md border-2 border-transparent hover:border-rose-500 hover:scale-105 transition-all cursor-default uppercase"
            >
              <EditableText value={syllable} tag="span" />
            </EditableElement>
          ))}
        </div>
      </div>
    </div>
  </div>
);




