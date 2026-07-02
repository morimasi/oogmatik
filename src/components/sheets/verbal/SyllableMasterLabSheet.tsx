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
        className="flex flex-col gap-1 p-2 border border-zinc-800 rounded-xl bg-white group hover:border-indigo-500 transition-all shadow-sm break-inside-avoid relative overflow-hidden"
      >
        <div className="flex-1">
          {isSplit && (
            <div className="flex flex-col gap-1">
              <h4 className="text-base font-black tracking-wider text-zinc-800 uppercase text-center">
                {item.word}
              </h4>
              <div className="flex gap-1 justify-center">
                {item.syllables?.map((_: any, sIdx: number) => (
                  <div
                    key={sIdx}
                    className="w-8 h-6 border border-zinc-800 rounded-md flex items-center justify-center bg-zinc-50"
                  >
                    <div className="w-3 h-0.5 bg-zinc-300"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCombine && (
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-0.5 flex-wrap justify-center">
                {item.syllables?.map((s: any, sIdx: number) => {
                  const textVal = typeof s === 'object' && s !== null ? s.value || s.text || '' : s;
                  return (
                    <div
                      key={sIdx}
                      className="px-2.5 py-0.5 bg-zinc-800 text-white rounded-md font-black text-xs uppercase"
                    >
                      <EditableText value={textVal} tag="span" />
                    </div>
                  );
                })}
              </div>
              <div className="w-full h-6 border-b border-dashed border-zinc-300 bg-zinc-50 rounded-t-md"></div>
            </div>
          )}

          {isRainbow && (
            <div className="flex items-center justify-center gap-1 flex-wrap py-0.5">
              {item.syllables?.map((s: any, sIdx: number) => {
                const colors = ['#be123c', '#1d4ed8', '#047857', '#b45309', '#6d28d9', '#0e7490'];
                const color = colors[sIdx % colors.length];
                const textVal = typeof s === 'object' && s !== null ? s.value || s.text || '' : s;
                return (
                  <div
                    key={sIdx}
                    className="px-2 py-1 rounded-md border-2 flex items-center justify-center min-w-[30px]"
                    style={{ backgroundColor: `${color}10`, borderColor: color }}
                  >
                    <span className="text-xs font-black uppercase" style={{ color: color }}>
                      <EditableText value={textVal} tag="span" />
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {isScrambled && (
            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5 flex-wrap justify-center">
                {item.scrambledIndices?.map((origIdx: number) => {
                  const syl = item.syllables[origIdx];
                  const textVal =
                    typeof syl === 'object' && syl !== null ? syl.value || syl.text || '' : syl;
                  return (
                    <div
                      key={origIdx}
                      className="px-2 py-0.5 bg-white border border-zinc-400 rounded-full font-bold text-[10px] text-zinc-700 shadow-sm uppercase"
                    >
                      {textVal}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-1 px-1">
                {item.syllables?.map((_: any, i: number) => (
                  <div
                    key={i}
                    className="flex-1 h-6 border-b border-zinc-800 bg-zinc-50/50"
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
    <div className="flex flex-col bg-white font-lexend p-3 print:p-2 overflow-visible min-h-[297mm]">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
      />
      <div className="flex flex-col mt-4 print:mt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:gap-1.5 content-start">
          {items.map((item, i) => renderItem(item, i))}
        </div>
      </div>
      <div className="mt-auto pt-4 print:pt-2 border-t border-zinc-200 flex justify-between items-center opacity-30">
        <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-[0.4em]">
          Bursa Disleksi EduMind
        </p>
        <i className="fa-solid fa-spell-check text-zinc-300 text-sm"></i>
      </div>
    </div>
  );
};
