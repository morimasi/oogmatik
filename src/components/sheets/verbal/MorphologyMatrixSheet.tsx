import React from 'react';
import { MorphologyMatrixData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const MorphologyMatrixSheet = ({ data }: { data: MorphologyMatrixData }) => {
  const settings = data?.settings;
  const isGrid = settings?.layout === 'grid_2x1';

  return (
    <div className="flex flex-col bg-white font-sans text-black overflow-visible professional-worksheet min-h-[297mm] p-3 print:p-2">
      <PedagogicalHeader
        title={data?.title || 'MORFOLOJİ MATRİSİ & TÜRETİM'}
        instruction={
          data?.instruction ||
          'Aşağıdaki kök kelimelere uygun ekleri getirerek yeni kelimeler türetin.'
        }
      />

      <div
        className={`grid ${isGrid ? 'grid-cols-2' : 'grid-cols-1'} gap-5 print:gap-2 mt-4 print:mt-2 content-start pb-4 print:pb-2`}
      >
        {(data?.items || []).map((item, idx) => (
          <EditableElement
            key={idx}
            className="flex flex-col gap-4 print:gap-1.5 p-4 print:p-2 border border-zinc-200 rounded-xl bg-zinc-50/50 shadow-sm break-inside-avoid relative hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all group"
          >
            {/* İpucu - Floating Badge */}
            {item.hint && (
              <div className="absolute -top-2.5 right-4 px-3 print:px-1.5 py-0.5 bg-amber-400 text-black rounded-lg font-black text-[8px] uppercase tracking-wider z-10 shadow border border-white">
                <i className="fa-solid fa-lightbulb mr-1.5 text-[10px]"></i>{' '}
                <EditableText value={item.hint} tag="span" />
              </div>
            )}

            <div className="flex items-center gap-5 print:gap-2">
              {/* KÖK KELİME - Compact Style */}
              <div className="bg-zinc-800 text-white px-6 print:px-2 py-2.5 print:py-1 rounded-xl shadow-lg relative shrink-0 ring-4 ring-zinc-50 transform group-hover:scale-105 transition-transform">
                <span className="text-[7px] font-black absolute -top-2.5 left-4 bg-indigo-600 px-2.5 py-0.5 rounded-full text-white uppercase tracking-[0.18em] ring-2 ring-white shadow">
                  LEKSİKAL KÖK
                </span>
                <span className="text-2xl font-black tracking-tighter uppercase font-mono">
                  <EditableText value={item.root} tag="span" />
                </span>
              </div>

              <div className="flex-1 flex flex-wrap gap-2">
                {item.suffixes.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white border border-zinc-300 rounded-xl px-3.5 print:px-1 py-1.5 text-center font-black text-xs text-zinc-900 hover:border-indigo-500 hover:text-indigo-600 hover:shadow transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <EditableText value={`+ ${s}`} tag="span" />
                  </div>
                ))}
              </div>
            </div>

            {/* YAZMA VE UYGULAMA ALANI */}
            <div className="grid grid-cols-2 gap-3 print:gap-1 mt-3 print:mt-1">
              {item.suffixes.map((s, sIdx) => (
                <div key={sIdx} className="relative group/line">
                  <div className="h-11 border-b border-zinc-300 bg-white/50 rounded-t-lg flex items-center px-4 print:px-2 transition-colors group-hover/line:bg-indigo-50/30 group-hover/line:border-indigo-200">
                    <div className="text-xs font-black text-zinc-300 tracking-tight lowercase flex items-center gap-1.5">
                      <span className="opacity-40">{item.root}</span>
                      <span className="w-3 h-[1px] bg-zinc-300"></span>
                      <span className="italic font-normal">...</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-2 translate-y-1/2 w-5 h-5 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                    <i className="fa-solid fa-pen-nib text-[7px] text-zinc-300"></i>
                  </div>
                </div>
              ))}
            </div>
          </EditableElement>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        {settings?.showClinicalNotes && data.clinicalMeta && (
          <div className="mb-3 print:mb-1 p-3 print:p-1.5 bg-zinc-50 rounded-xl border border-zinc-200 shadow-inner flex justify-between items-center">
            <div className="flex gap-6 print:gap-2">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-dna text-indigo-400 text-[10px]"></i> KARMAŞIKLIK
                </span>
                <div className="flex items-center gap-2 print:gap-1">
                  <span className="text-xl font-black text-zinc-900 leading-none">
                    {data.clinicalMeta.morphologicalComplexity}/10
                  </span>
                  <div className="w-20 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full  bg-indigo-500"
                      style={{
                        width: `${data.clinicalMeta.morphologicalComplexity * 10 ? data.clinicalMeta.morphologicalComplexity * 10 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col border-l border-zinc-200 pl-6 print:pl-3">
                <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                  ÇEŞİTLİLİK
                </span>
                <div className="flex items-center gap-1.5 text-zinc-900 font-black">
                  <i className="fa-solid fa-layer-group text-indigo-500 text-xs"></i>
                  <span className="text-sm uppercase">
                    {data.clinicalMeta.derivationalVariety} SEGMENT
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800 text-white px-3 print:px-1 py-1.5 rounded-lg shadow transform -rotate-1.5">
              <span className="text-[7px] font-black tracking-[0.25em] opacity-80 uppercase leading-none block mb-0.5">
                ANALİZ
              </span>
              <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider leading-none">
                LEXICAL ENGINE
              </span>
            </div>
          </div>
        )}

        <div className="p-3 print:p-1.5 bg-zinc-800 text-white rounded-t-2xl border-x-2 border-t-2 border-white flex justify-between items-center shadow-lg">
          <div className="flex gap-6 print:gap-2">
            <div className="flex flex-col">
              <span className="text-[6px] font-black text-indigo-400 uppercase tracking-[0.35em] mb-0.5">
                MODÜL
              </span>
              <span className="text-[10px] font-black uppercase font-mono">
                Morpho-Syntactic
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 print:gap-1 opacity-70">
            <div className="flex flex-col items-end mr-1">
              <span className="text-[5px] font-black uppercase tracking-[0.1em] text-zinc-400">
                Dil Gelişimi
              </span>
              <span className="text-[7px] font-bold">SENTAKS</span>
            </div>
            <i className="fa-solid fa-spell-check text-indigo-400 text-sm"></i>
          </div>
        </div>
      </div>
    </div>
  );
};




