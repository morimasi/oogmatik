import React from 'react';
import { MorphologyMatrixData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const MorphologyMatrixSheet = ({ data }: { data: MorphologyMatrixData }) => {
  const settings = data?.settings;
  const isGrid = settings?.layout === 'grid_2x1';

  return (
    <div className="flex flex-col bg-white font-sans text-black overflow-visible professional-worksheet">
      <PedagogicalHeader
        title={data?.title || 'MORFOLOJİ MATRİSİ & TÜRETİM'}
        instruction={
          data?.instruction ||
          'Aşağıdaki kök kelimelere uygun ekleri getirerek yeni kelimeler türetin.'
        }
        note={data?.pedagogicalNote}
      />

      <div
        className={`grid ${isGrid ? 'grid-cols-2' : 'grid-cols-1'} gap-8 print:gap-2 print:gap-3 print:p-3 mt-10 print:mt-3 content-start pb-20 print:pb-4`}
      >
        {(data?.items || []).map((item, idx) => (
          <EditableElement
            key={idx}
            className="flex flex-col gap-6 print:gap-2 p-8 print:p-2 print:p-3 border-2 border-zinc-100 rounded-[3rem] bg-zinc-50/50 shadow-sm break-inside-avoid relative hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all group"
          >
            {/* İpucu - Floating Badge */}
            {item.hint && (
              <div className="absolute -top-3 right-10 px-4 print:px-1 py-1 bg-amber-400 text-black rounded-xl font-black text-[9px] uppercase tracking-widest z-10 shadow-lg border-2 border-white">
                <i className="fa-solid fa-lightbulb mr-2"></i>{' '}
                <EditableText value={item.hint} tag="span" />
              </div>
            )}

            <div className="flex items-center gap-8 print:gap-2 print:gap-3 print:p-3">
              {/* KÖK KELİME - Premium Hex/Octagon Style */}
              <div className="bg-zinc-900 text-white px-8 print:px-2 py-4 print:py-1 rounded-[2rem] shadow-2xl relative shrink-0 ring-8 ring-zinc-50 transform group-hover:scale-105 transition-transform">
                <span className="text-[8px] font-black absolute -top-3 left-6 bg-indigo-600 px-3 py-1 rounded-full text-white uppercase tracking-[0.2em] ring-4 ring-white shadow-glow">
                  LEKSİKAL KÖK
                </span>
                <span className="text-3xl font-black tracking-tighter uppercase font-mono">
                  <EditableText value={item.root} tag="span" />
                </span>
              </div>

              <div className="flex-1 flex flex-wrap gap-3">
                {item.suffixes.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white border-2 border-zinc-200 rounded-2xl px-5 print:px-1 py-2 text-center font-black text-sm text-zinc-900 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
                  >
                    <EditableText value={`+ ${s}`} tag="span" />
                  </div>
                ))}
              </div>
            </div>

            {/* YAZMA VE UYGULAMA ALANI */}
            <div className="grid grid-cols-2 gap-4 print:gap-1 mt-4 print:mt-1">
              {item.suffixes.map((s, sIdx) => (
                <div key={sIdx} className="relative group/line">
                  <div className="h-14 border-b-2 border-zinc-200 bg-white/50 rounded-t-2xl flex items-center px-6 print:px-2 transition-colors group-hover/line:bg-indigo-50/30 group-hover/line:border-indigo-200">
                    <div className="text-sm font-black text-zinc-300 tracking-tight lowercase flex items-center gap-2">
                      <span className="opacity-40">{item.root}</span>
                      <span className="w-4 h-[1px] bg-zinc-200"></span>
                      <span className="italic font-normal">...</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-4 translate-y-1/2 w-6 h-6 rounded-full bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center">
                    <i className="fa-solid fa-pen-nib text-[8px] text-zinc-300"></i>
                  </div>
                </div>
              ))}
            </div>
          </EditableElement>
        ))}
      </div>

      {/* Klinik Analiz Paneli & Footer Combo */}
      <div className="mt-auto mx-1">
        {settings?.showClinicalNotes && data.clinicalMeta && (
          <div className="mb-4 print:mb-1 p-8 print:p-2 print:p-3 bg-zinc-50 rounded-[3rem] border-2 border-zinc-100 shadow-inner flex justify-between items-center mx-4 print:mx-1">
            <div className="flex gap-12 print:gap-3 print:gap-4 print:gap-1">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-dna text-indigo-400"></i> KARMAŞIKLIK İNDEKSİ
                </span>
                <div className="flex items-center gap-4 print:gap-1">
                  <span className="text-2xl font-black text-zinc-900 leading-none">
                    {data.clinicalMeta.morphologicalComplexity}/10
                  </span>
                  <div className="w-24 h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
<<<<<<< HEAD
                      className="h-full  bg-indigo-500 shadow-glow"
=======
                      className="h-full print:h-0 bg-indigo-500 shadow-glow"
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                      style={{
                        width: `${data.clinicalMeta.morphologicalComplexity * 10 ? data.clinicalMeta.morphologicalComplexity * 10 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col border-l border-zinc-200 pl-12">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                  TÜRETİM ÇEŞİTLİLİĞİ
                </span>
                <div className="flex items-center gap-2 text-zinc-900 font-black">
                  <i className="fa-solid fa-layer-group text-indigo-500"></i>
                  <span className="text-lg uppercase">
                    {data.clinicalMeta.derivationalVariety} SEGMENT
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900 text-white px-5 print:px-1 py-2 rounded-2xl shadow-lg transform -rotate-2">
              <span className="text-[8px] font-black tracking-[0.3em] opacity-80 uppercase leading-none block mb-0.5">
                ANALİZ MODU
              </span>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none">
                LEXICAL ENGINE 6.0
              </span>
            </div>
          </div>
        )}

        <div className="p-6 print:p-2 bg-zinc-900 text-white rounded-t-[3.5rem] border-x-4 border-t-4 border-white flex justify-between items-center shadow-2xl">
          <div className="flex gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1">
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">
                PROGRAM KATALOĞU
              </span>
              <span className="text-xs font-black uppercase font-mono">
                Morpho-Syntactic Accuracy Engine
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 print:gap-1 opacity-70">
            <div className="flex flex-col items-end mr-2">
              <span className="text-[6px] font-black uppercase tracking-[0.1em] text-zinc-400">
                Dil Gelişimi
              </span>
              <span className="text-[8px] font-bold">SENTAKS MODÜLÜ</span>
            </div>
            <i className="fa-solid fa-spell-check text-indigo-400 text-lg shadow-glow"></i>
          </div>
        </div>
      </div>
    </div>
  );
};



<<<<<<< HEAD

=======
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
