import React from 'react';
import { MorphologyMatrixData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const MorphologyMatrixSheet = ({ data }: { data: MorphologyMatrixData }) => {
  const settings = data?.settings;
  const isGrid = settings?.layout === 'grid_2x1';

  return (
    <div className="flex flex-col bg-white font-['Lexend'] text-zinc-900 relative overflow-hidden professional-worksheet w-full h-full print:w-[210mm] print:h-[297mm] px-[12mm] py-[15mm]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-emerald-500 to-indigo-600 opacity-100"></div>
      
      <PedagogicalHeader
        title={data?.title || 'MORFOLOJİK KELİME İNŞAATI'}
        instruction={
          data?.instruction ||
          'Kök kelimelere uygun ekleri getirerek yeni kelimeler türetin.'
        }
      />

      <div
        className={`grid ${isGrid ? 'grid-cols-2' : 'grid-cols-1'} gap-4 print:gap-2 mt-3 print:mt-2 content-start pb-4 print:pb-2`}
      >
        {(data?.items || []).map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-3 print:gap-1.5 p-3 print:p-2 border border-zinc-200 rounded-xl bg-zinc-50/50 shadow-sm break-inside-avoid relative hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all group"
          >
            {/* İpucu - Floating Badge */}
            {item.hint && (
              <div className="absolute -top-2.5 right-3 px-2.5 print:px-1.5 py-0.5 bg-amber-400 text-black rounded-lg font-black text-[7px] uppercase tracking-widest z-10 shadow border border-white">
                <i className="fa-solid fa-lightbulb mr-1 text-[8px]"></i>
                {item.hint}
              </div>
            )}

            <div className="flex items-center gap-4 print:gap-2">
              {/* KÖK KELİME - Compact Style */}
              <div className="bg-zinc-800 text-white px-4 print:px-2 py-2 print:py-1 rounded-xl shadow-lg relative shrink-0 ring-4 ring-zinc-50 transform group-hover:scale-105 transition-transform">
                <span className="text-[6px] font-black absolute -top-2 left-2.5 bg-indigo-600 px-2 py-0.5 rounded-full text-white uppercase tracking-[0.18em] ring-2 ring-white shadow">
                  KÖK
                </span>
                <span className="text-xl font-black tracking-tighter uppercase font-mono">
                  <EditableText value={item.root} tag="span" />
                </span>
              </div>

              <div className="flex-1 flex flex-wrap gap-1.5">
                {item.suffixes.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white border border-zinc-300 rounded-xl px-2.5 print:px-1.5 py-1 text-center font-black text-[11px] print:text-[9px] text-zinc-900 hover:border-indigo-500 hover:text-indigo-600 hover:shadow transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <EditableText value={`+${s}`} tag="span" />
                  </div>
                ))}
              </div>
            </div>

            {/* YAZMA VE UYGULAMA ALANI */}
            <div className="grid grid-cols-2 gap-2 print:gap-1 mt-2 print:mt-1">
              {item.suffixes.map((s, sIdx) => (
                <div key={sIdx} className="relative group/line">
                  <div className="h-8 print:h-7 border-b border-zinc-300 bg-white/50 rounded-t-lg flex items-center px-3 print:px-1.5 transition-colors group-hover/line:bg-indigo-50/30 group-hover/line:border-indigo-200">
                    <div className="text-[10px] print:text-[8px] font-black text-zinc-300 tracking-tight lowercase flex items-center gap-1">
                      <span className="opacity-40">{item.root}</span>
                      <span className="w-2.5 h-[1px] bg-zinc-300"></span>
                      <span className="italic font-normal">...</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-1.5 translate-y-1/2 w-4 h-4 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                    <i className="fa-solid fa-pen-nib text-[6px] text-zinc-300"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="p-2.5 print:p-1.5 bg-zinc-800 text-white rounded-t-xl border-x-2 border-t-2 border-white flex justify-between items-center shadow-md">
          <div className="flex gap-5 print:gap-2">
            <div className="flex flex-col">
              <span className="text-[6px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-0.5">
                MODÜL
              </span>
              <span className="text-[9px] font-black uppercase font-mono">
                Morpho-Syntactic
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 print:gap-1 opacity-70">
            <div className="flex flex-col items-end mr-1">
              <span className="text-[5px] font-black uppercase tracking-[0.1em] text-zinc-400">
                Dil Gelişimi
              </span>
              <span className="text-[6px] font-bold">SENTAKS</span>
            </div>
            <i className="fa-solid fa-spell-check text-indigo-400 text-sm"></i>
          </div>
        </div>
      </div>
    </div>
  );
};




