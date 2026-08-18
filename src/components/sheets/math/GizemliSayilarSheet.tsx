import React from 'react';
import { PedagogicalHeader } from '../common';
import { GizemliSayilarWorksheetData } from '../../../services/offlineGenerators/gizemliSayilar';

interface GizemliSayilarSheetProps {
  data: GizemliSayilarWorksheetData | any;
  settings?: any;
}

export const GizemliSayilarSheet: React.FC<GizemliSayilarSheetProps> = ({ data }) => {
  const contentData = data?.content || data || {};
  const puzzles = contentData.puzzles || [];
  const title = contentData.title || 'Gizemli Sayılar: İpuçlarını Takip Et!';
  const instruction =
    contentData.instruction ||
    'Verilen dedektif ipuçlarını incele, tüm kuralları sağlayan TEK gizemli sayıyı bul ve işaretle.';

  if (!puzzles || !Array.isArray(puzzles) || puzzles.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-400 font-['Lexend']">
        <p className="text-sm font-bold">Gizemli sayılar verisi hazırlanamadı.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-['Lexend'] min-h-[297mm] p-4 print:p-2 bg-white transition-all duration-300 justify-between">
      <PedagogicalHeader title={title} instruction={instruction} data={contentData} />

      {/* PUZZLES GRID - ULTRA COMPACT & FULL A4 FILL */}
      <div
        className={`grid ${puzzles.length <= 4 ? 'grid-cols-2 gap-4 my-auto' : 'grid-cols-2 gap-3 flex-1 my-2'
          } items-stretch justify-items-center`}
      >
        {puzzles.map((puzzle: any, idx: number) => {
          const clues = puzzle.clues || puzzle.riddleParts || [];
          const options = puzzle.options || [];

          return (
            <div
              key={puzzle.id || idx}
              className="rounded-3xl border-2 border-indigo-200/80 bg-gradient-to-br from-indigo-50/40 via-white to-amber-50/20 p-3.5 print:p-2.5 flex flex-col justify-between shadow-2xs w-full hover:border-indigo-400 transition-colors"
            >
              {/* Header Label */}
              <div className="w-full flex items-center justify-between border-b border-indigo-100 pb-1.5 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shadow-2xs">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-black uppercase text-indigo-900 tracking-wider">
                    Gizemli Sayı #{idx + 1}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <i className="fa-solid fa-user-secret text-[9px]"></i> Dedektif İzi
                </span>
              </div>

              {/* Clues List */}
              <div className="space-y-1.5 my-1 flex-1">
                {clues.map((clue: any, cIdx: number) => (
                  <div
                    key={clue.id || cIdx}
                    className="flex items-center gap-2 bg-white/90 p-2 rounded-xl border border-indigo-100/80 shadow-2xs"
                  >
                    <div className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] shrink-0 font-bold">
                      <i className={`fa-solid ${clue.icon || 'fa-magnifying-glass'}`}></i>
                    </div>
                    <span className="text-[11px] print:text-[10px] font-bold text-zinc-800 leading-snug">
                      {clue.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Multiple Choice Options for Detective */}
              <div className="mt-2 pt-2 border-t border-dashed border-indigo-200 flex flex-col gap-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-indigo-400">
                  Şıklardan Doğru Gizemli Sayıyı Seç:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {options.map((opt: number, oIdx: number) => (
                    <div
                      key={oIdx}
                      className="h-7 rounded-lg border border-indigo-200 bg-white flex items-center justify-center font-black text-indigo-950 text-xs shadow-2xs hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CLINICAL FOOTER */}
      <div className="mt-auto pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-2xl bg-zinc-900 text-white shadow-md">
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
          <div
            key={item.label}
            className="bg-white/10 border border-white/10 rounded-lg p-1.5 flex flex-col justify-between"
          >
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
