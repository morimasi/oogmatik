import React from 'react';
import { SyllableMasterLabData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const SyllableMasterLabSheet = ({ data }: { data: SyllableMasterLabData }) => {
  const { mode, items = [] } = data;

  const renderItem = (item: any, idx: number) => {
    const isSplit = mode === 'split';
    const isCombine = mode === 'combine';
    const _isComplete = mode === 'complete';
    const isRainbow = mode === 'rainbow';
    const isScrambled = mode === 'scrambled';

    return (
      <EditableElement
        key={idx}
        className="flex flex-col gap-0.5 p-1 print:p-0.5 border border-zinc-200 rounded-lg bg-white group hover:border-indigo-400 transition-all shadow-xs break-inside-avoid relative overflow-hidden"
      >
        <div className="flex-1">
          {isSplit && (
            <div className="flex flex-col gap-0.5">
              <h4 className="text-[11px] print:text-[9px] font-black tracking-wider text-zinc-800 uppercase text-center">
                {item.word}
              </h4>
              <div className="flex gap-0.5 justify-center">
                {item.syllables?.map((_: any, sIdx: number) => (
                  <div
                    key={sIdx}
                    className="w-7 h-5 border border-zinc-300 rounded flex items-center justify-center bg-zinc-50/70"
                  >
                    <div className="w-2.5 h-0.5 bg-zinc-400"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCombine && (
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex gap-0.5 flex-wrap justify-center">
                {item.syllables?.map((s: any, sIdx: number) => {
                  const textVal = typeof s === 'object' && s !== null ? s.value || s.text || '' : s;
                  return (
                    <div
                      key={sIdx}
                      className="px-1 py-0.5 bg-zinc-800 text-white rounded font-black text-[9px] print:text-[7px] uppercase"
                    >
                      <EditableText value={textVal} tag="span" />
                    </div>
                  );
                })}
              </div>
              <div className="w-full h-5 border-b border-dashed border-zinc-300 bg-zinc-50 rounded-t"></div>
            </div>
          )}

          {isRainbow && (
            <div className="flex items-center justify-center gap-0.5 flex-wrap py-0.5">
              {item.syllables?.map((s: any, sIdx: number) => {
                const colors = ['#be123c', '#1d4ed8', '#047857', '#b45309', '#6d28d9', '#0e7490'];
                const color = colors[sIdx % colors.length];
                const textVal = typeof s === 'object' && s !== null ? s.value || s.text || '' : s;
                return (
                  <div
                    key={sIdx}
                    className="px-1.5 py-0.5 rounded border flex items-center justify-center min-w-[28px]"
                    style={{ backgroundColor: `${color}10`, borderColor: color }}
                  >
                    <span className="text-[10px] print:text-[9px] font-black uppercase" style={{ color: color }}>
                      <EditableText value={textVal} tag="span" />
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {isScrambled && (
            <div className="flex flex-col gap-0.5">
              <div className="flex gap-0.5 flex-wrap justify-center">
                {item.scrambledIndices?.map((origIdx: number) => {
                  const syl = item.syllables[origIdx];
                  const textVal =
                    typeof syl === 'object' && syl !== null ? syl.value || syl.text || '' : syl;
                  return (
                    <div
                      key={origIdx}
                      className="px-1.5 py-0.5 bg-white border border-zinc-300 rounded-full font-bold text-[9px] print:text-[8px] text-zinc-700 shadow-xs uppercase"
                    >
                      {textVal}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-0.5 px-0.5">
                {item.syllables?.map((_: any, i: number) => (
                  <div
                    key={i}
                    className="flex-1 h-5 border-b border-zinc-300 bg-zinc-50/50"
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </EditableElement>
    );
  };

  return (
    <div className="flex flex-col bg-white font-['Lexend'] text-zinc-900 relative overflow-visible w-full h-full print:w-[210mm] print:h-[297mm] print:overflow-hidden px-[8mm] py-[10mm] professional-worksheet">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-100"></div>

      <PedagogicalHeader
        title={data.title}
        instruction={mode === 'scrambled' 
          ? "Karışık heceleri doğru sırayla yerine yerleştirin ve kelimeyi oluşturun." 
          : data.instruction
        }
      />
      <div className="flex flex-col mt-2 print:mt-1 flex-1">
        <div className="grid grid-cols-5 print:grid-cols-6 gap-1.5 print:gap-1 content-start">
          {items.map((item, i) => renderItem(item, i))}
        </div>
      </div>
      <div className="mt-auto pt-1.5 print:pt-1 border-t border-zinc-200 flex justify-between items-center opacity-60">
        <p className="text-[5.5px] print:text-[5px] text-zinc-500 font-black uppercase tracking-[0.3em]">
          Bursa Disleksi EduMind • Hece Ustası {mode === 'scrambled' && '• Karışık'}
        </p>
        <i className="fa-solid fa-spell-check text-zinc-400 text-[10px]"></i>
      </div>
    </div>
  );
};
