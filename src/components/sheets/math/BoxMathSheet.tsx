import React from 'react';
import { BoxMathData } from '../../../types';
import type { BoxMathProblem } from '../../../types/math';
import { PedagogicalHeader } from '../common';
import { EditableText, EditableElement } from '../../Editable';

export const BoxMathSheet: React.FC<{ data: BoxMathData }> = ({ data }) => {
  const pref = data.fontSizePreference ?? 'medium';

  // Font ve kutu boyutları — punto ayarına göre (Premium & Compact)
  const sizeMap = {
    small: {
      expr: 'text-sm',
      num: 'text-lg',
      box: 'min-w-[80px] h-9 px-2 text-sm',
      inBox: 'inline-flex items-center justify-center w-8 h-8 mx-0.5 text-sm font-bold',
      badge: 'w-6 h-6',
      badgeText: 'text-[10px]',
      label: 'text-[8px]',
      result: 'text-[8px]',
      grid: 'grid-cols-3 gap-3',
      padding: 'p-2',
    },
    medium: {
      expr: 'text-base',
      num: 'text-xl',
      box: 'min-w-[100px] h-10 px-3 text-base',
      inBox: 'inline-flex items-center justify-center w-10 h-10 mx-1 text-base font-bold',
      badge: 'w-7 h-7',
      badgeText: 'text-[11px]',
      label: 'text-[9px]',
      result: 'text-[9px]',
      grid: 'grid-cols-2 gap-4',
      padding: 'p-3',
    },
    large: {
      expr: 'text-xl',
      num: 'text-2xl',
      box: 'min-w-[120px] h-12 px-4 text-xl',
      inBox: 'inline-flex items-center justify-center w-12 h-12 mx-1.5 text-xl font-bold',
      badge: 'w-8 h-8',
      badgeText: 'text-xs',
      label: 'text-[10px]',
      result: 'text-[10px]',
      grid: 'grid-cols-2 gap-6',
      padding: 'p-4',
    },
  } as const;

  const sz = sizeMap[pref];

  // Expression'daki □ karakterlerini büyük kutuya dönüştür
  const renderExpression = (expr: string) => {
    if (!expr) return null;
    const parts = expr.split(/(□)/g);
    return parts.map((part, i) => {
      if (part === '□') {
        return (
          <span
            key={i}
            className={`${sz.inBox} bg-white border-[1.5px] border-zinc-900 rounded shadow-sm text-zinc-900`}
          >
            &nbsp;
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col bg-white p-2 text-black font-lexend overflow-visible min-h-[1123px]">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
        note={data.pedagogicalNote}
      />

      <div className={`grid ${sz.grid} mt-4`}>
        {(data.problems || []).map((prob: BoxMathProblem, idx: number) => (
          <EditableElement
            key={idx}
            className={`flex items-center gap-3 ${sz.padding} border border-zinc-200 bg-zinc-50/10 rounded-2xl hover:bg-white hover:border-indigo-300 transition-all group relative break-inside-avoid`}
          >
            {/* Soru Numarası (Yüzen Tip) */}
            <div
              className={`absolute -top-1.5 -left-1.5 ${sz.badge} rounded-lg bg-zinc-900 text-white font-black ${sz.badgeText} flex items-center justify-center shadow-md z-10`}
            >
              {idx + 1}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <div
                className={`${sz.expr} font-bold tracking-tight text-zinc-800 flex items-center flex-wrap`}
              >
                {renderExpression(prob.expression)}
                {data.mode === 'reverse' && (
                  <>
                    <span className="mx-1 text-zinc-400 font-black">=</span>
                    <span className={`font-black ${sz.num} text-indigo-600`}>
                      {prob.targetValue}
                    </span>
                  </>
                )}
                {data.mode === 'substitution' && (
                  <span className="mx-1 text-zinc-400 font-black">=</span>
                )}
              </div>

              {/* Alt Bilgi veya Ek Alanlar */}
              <div className="flex items-center justify-end mt-1">
                {data.mode === 'reverse' && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`${sz.label} font-black text-indigo-400 uppercase tracking-tighter`}
                    >
                      Kutu
                    </span>
                    <div className="w-6 h-6 border-b-[1.5px] border-dashed border-indigo-300 flex items-center justify-center text-[10px] text-indigo-300">
                      ?
                    </div>
                  </div>
                )}
                {data.mode === 'substitution' && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`${sz.label} font-black text-emerald-500 uppercase tracking-tighter`}
                    >
                      Kutu = {prob.givenValue}
                    </span>
                  </div>
                )}
                {data.mode === 'simplification' && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`${sz.label} font-black text-amber-500 uppercase tracking-tighter`}
                    >
                      Sonuç
                    </span>
                    <div className="w-10 h-6 border-b-[1.5px] border-dashed border-zinc-300"></div>
                  </div>
                )}
              </div>
            </div>
          </EditableElement>
        ))}
      </div>

      {/* Alt Bilgi */}
      <div className="mt-auto pt-4 border-t border-zinc-100 flex justify-between items-center opacity-30">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-microchip text-lg text-indigo-500"></i>
          <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-widest">
            Bursa Disleksi AI • Nöro-Bilişsel Matematik Sistemi
          </p>
        </div>
      </div>
    </div>
  );
};
