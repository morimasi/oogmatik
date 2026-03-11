import React from 'react';
import { WorksheetData, StyleSettings } from '../../../types';

interface BrainTeasersSheetProps {
  data: WorksheetData;
  settings: StyleSettings;
}

export const BrainTeasersSheet: React.FC<BrainTeasersSheetProps> = ({ data, settings }) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const activity = data[0];
  const blocks = activity.layoutArchitecture?.blocks || [];
  const puzzlesBlock = blocks.find((b) => (b.type as string) === 'puzzles');
  const puzzles = puzzlesBlock?.content?.items || [];

  return (
    <div
      className="w-full h-full  flex flex-col gap-8 print:gap-2 print:gap-3 print:p-3 p-8 print:p-2 print:p-3"
      style={{ fontFamily: settings.fontFamily }}
    >
      {/* Header */}
      {settings.showTitle && (
        <div className="text-center mb-8 print:mb-2 pb-4 print:pb-1 border-b-2 border-dashed border-zinc-200">
          <div className="inline-block p-4 print:p-1 rounded-full bg-amber-100 text-amber-600 mb-4 print:mb-1">
            <i className="fa-solid fa-lightbulb text-4xl animate-pulse"></i>
          </div>
          <h1
            className="text-4xl font-black text-zinc-800 uppercase tracking-tight"
            style={{ color: settings.borderColor }}
          >
            {activity.title}
          </h1>
          {settings.showInstruction && (
            <p className="text-lg text-zinc-500 font-medium mt-2">{activity.instruction}</p>
          )}
        </div>
      )}

      {/* Puzzles Grid */}
      <div className="grid grid-cols-1 gap-8 print:gap-2 print:gap-3 print:p-3">
        {puzzles.map((puzzle: any, idx: number) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border-2 border-zinc-100 shadow-xl overflow-hidden group hover:border-amber-200 transition-colors"
          >
            <div className="p-8 print:p-2 print:p-3">
              <div className="flex items-start gap-6 print:gap-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-black shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-2xl font-bold text-zinc-800 leading-relaxed mb-6 print:mb-2"
                    style={{ lineHeight: settings.lineHeight }}
                  >
                    {puzzle.q}
                  </h3>

                  {/* Visual Content if available */}
                  {puzzle.visual && (
                    <div className="my-6 print:my-2 p-4 print:p-1 bg-zinc-50 rounded-xl border border-zinc-200 flex justify-center">
                      {/* Placeholder for visual puzzle content */}
                      <div className="text-6xl">{puzzle.visual}</div>
                    </div>
                  )}

                  {/* Answer Area */}
                  <div className="mt-8 print:mt-2 p-6 print:p-2 bg-zinc-50 rounded-2xl border border-zinc-100 flex justify-between items-center group/answer">
                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                      CEVABINIZ:
                    </span>
                    <div className="flex-1 h-8 border-b-2 border-zinc-300 border-dashed mx-4 print:mx-1"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution Footer (Rotated or Hidden) */}
            <div className="bg-zinc-50 p-4 print:p-1 border-t border-zinc-100 flex justify-end">
              <div className="text-[10px] font-mono text-zinc-400 transform rotate-180 opacity-20 hover:opacity-100 transition-opacity select-none cursor-help">
                Çözüm: {puzzle.a}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Brain Power Meter */}
      <div className="mt-auto pt-8 print:pt-2 flex justify-center">
        <div className="flex items-center gap-2 px-6 print:px-2 py-3 bg-zinc-900 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
          <i className="fa-solid fa-brain text-amber-400"></i>
          Beyin Gücü Skoru:
          <div className="flex gap-1 ml-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border-2 border-zinc-700 bg-zinc-800"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};




