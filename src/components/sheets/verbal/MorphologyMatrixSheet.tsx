import React from 'react';
import { MorphologyMatrixData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const MorphologyMatrixSheet = ({ data }: { data: MorphologyMatrixData }) => {
  const settings = data?.settings || {};
  const items = data?.items || [];

  return (
    <div className="flex flex-col bg-white font-['Lexend'] text-zinc-900 relative overflow-hidden professional-worksheet w-full h-full print:w-[210mm] print:h-[297mm] px-[8mm] py-[10mm]">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-600 via-emerald-500 to-indigo-600 opacity-100"></div>
      
      <PedagogicalHeader
        title={data?.title || 'MORFOLOJİK KELİME İNŞAATI'}
        instruction={data?.instruction || 'Kök kelimelere uygun ekleri getirerek yeni kelimeler türetin.'}
      />

      <div className="grid grid-cols-2 gap-2 print:gap-1.5 mt-2 print:mt-1 content-start pb-2 print:pb-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-1.5 print:gap-1 p-2 print:p-1.5 border border-zinc-200 rounded-xl bg-zinc-50/50 shadow-sm break-inside-avoid relative hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all group"
          >
            {item.hint && (
              <div className="absolute -top-2 right-2 px-1.5 print:px-1 py-0.5 bg-amber-400 text-black rounded-lg font-black text-[6px] uppercase tracking-widest z-10 shadow border border-white">
                <i className="fa-solid fa-lightbulb mr-1 text-[7px]"></i>
                {item.hint}
              </div>
            )}

            <div className="flex items-center gap-2 print:gap-1.5">
              <div className="bg-zinc-800 text-white px-3 print:px-2 py-1.5 print:py-1 rounded-lg shadow relative shrink-0 ring-2 ring-zinc-50">
                <span className="text-[5px] font-black absolute -top-1.5 left-1.5 bg-indigo-600 px-1.5 py-0.5 rounded-full text-white uppercase tracking-[0.15em] ring-1 ring-white shadow">
                  KÖK
                </span>
                <span className="text-base print:text-sm font-black tracking-tighter uppercase font-mono">
                  <EditableText value={item.root} tag="span" />
                </span>
              </div>

              <div className="flex-1 flex flex-wrap gap-1">
                {item.suffixes.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white border border-zinc-300 rounded-lg px-1.5 print:px-1 py-0.5 text-center font-black text-[10px] print:text-[8px] text-zinc-900 hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-pointer"
                  >
                    <EditableText value={`+${s}`} tag="span" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 print:gap-1 mt-0.5">
              {item.suffixes.map((s, sIdx) => (
                <div key={sIdx} className="relative group/line">
                  <div className="h-6 print:h-5 border-b border-zinc-300 bg-white/50 rounded-t flex items-center px-2 print:px-1 transition-colors group-hover/line:bg-indigo-50/30">
                    <div className="text-[8px] print:text-[7px] font-black text-zinc-300 tracking-tight lowercase flex items-center gap-1">
                      <span className="opacity-40">{item.root}</span>
                      <span className="w-1.5 h-[1px] bg-zinc-300"></span>
                      <span className="italic font-normal">...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="p-1.5 print:p-1 bg-zinc-800 text-white rounded-t-lg border-x border-t border-white flex justify-between items-center shadow-sm">
          <span className="text-[5px] font-black text-indigo-400 uppercase tracking-[0.3em]">MODÜL</span>
          <span className="text-[7px] font-black uppercase font-mono">Morpho-Syntactic</span>
          <span className="text-[5px] font-bold text-zinc-400">SENTAKS</span>
        </div>
      </div>
    </div>
  );
};




