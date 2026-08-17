import React from 'react';
import { PedagogicalHeader } from '../common';

export const GizemliSayilarSheet: React.FC<{ data: any }> = ({ data }) => {
  const contentData = data?.content || data;
  const targetData = Array.isArray(contentData) ? (contentData[0] || {}) : (contentData || {});
  const puzzles = targetData.puzzles || [];
  const title = targetData.title || 'Gizemli Sayılar: İpuçlarını Takip Et!';
  const instruction = targetData.instruction || 'Aşağıdaki ipuçlarını dikkatlice incele ve tek cevabı olan gizemli sayıyı bul.';

  if (!puzzles || !Array.isArray(puzzles) || puzzles.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-400 font-['Lexend']">
        <p className="text-sm font-bold">Gizemli sayılar verisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-['Lexend'] min-h-[297mm] p-4 print:p-2 bg-white transition-all duration-300">
      <PedagogicalHeader
        title={title}
        instruction={instruction}
        data={targetData}
      />

      {/* PUZZLES GRID */}
      <div className="grid grid-cols-2 gap-4 print:gap-2 flex-1 my-2 content-start items-center justify-items-center">
        {puzzles.map((puzzle: any, idx: number) => {
          const clues = puzzle.riddleParts || puzzle.clues || [];

          return (
            <div
              key={puzzle.id || idx}
              className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/30 to-white p-4 print:p-2 flex flex-col justify-between shadow-2xs w-full max-w-[130mm]"
            >
              {/* Header Label */}
              <div className="w-full flex items-center justify-between border-b border-indigo-100 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shadow-2xs">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-black uppercase text-indigo-900 tracking-wider">
                    Gizemli Sayı #{idx + 1}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                  Dedektif İpucu İzi
                </span>
              </div>

              {/* Clues List */}
              <div className="space-y-2 my-2 flex-1">
                {clues.map((clue: any, cIdx: number) => (
                  <div key={clue.id || cIdx} className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-indigo-100 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs shrink-0 font-bold">
                      <i className={`fa-solid ${clue.icon || 'fa-magnifying-glass'}`}></i>
                    </div>
                    <span className="text-[11px] print:text-[10px] font-bold text-zinc-800 leading-snug">
                      {clue.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mystery Number Box */}
              <div className="mt-3 pt-2 border-t border-dashed border-indigo-200 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400">Bulunan Gizemli Sayı:</span>
                <div className="w-16 h-8 rounded-xl border-2 border-dashed border-indigo-400 bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-sm">
                  ?
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CLINICAL FOOTER */}
      <div className="mt-auto pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-2xl bg-zinc-900 text-white">
        <div className="col-span-1 flex flex-col justify-center">
          <span className="text-[8px] font-black uppercase leading-tight text-zinc-400">
            GİZEMLİ SAYILAR &<br />SAYISAL MUHAKEME
          </span>
        </div>
        {[
          { label: 'HEDEF SÜRE', val: '08:00', unit: 'dk' },
          { label: 'ÇÖZÜLEN', val: '___', unit: 'Sayı' },
          { label: 'PERFORMANS', val: '___', unit: 'p' },
        ].map((item) => (
          <div key={item.label} className="bg-white/10 border border-white/10 rounded-lg p-1.5 flex flex-col justify-between">
            <span className="text-[7px] font-black text-zinc-400 uppercase">{item.label}</span>
            <div className="flex items-end gap-0.5">
              <span className="text-xs font-black text-white">{item.val}</span>
              <span className="text-[6px] font-bold text-zinc-400 mb-0.5">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GizemliSayilarSheet;
