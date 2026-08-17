import React from 'react';
import { WorksheetData, StyleSettings } from '../../../types';
import { PedagogicalHeader } from '../common';

interface BrainTeasersSheetProps {
  data: WorksheetData;
  settings: StyleSettings;
}

type CategoryKey = 'Dil' | 'Mantık' | 'Sayı' | 'Görsel' | 'Şifre' | 'Kibrit';

const CATEGORY_STYLE: Record<CategoryKey, { bg: string; border: string; badge: string; icon: string }> = {
  'Dil': { bg: 'bg-purple-50/60', border: 'border-purple-200', badge: 'bg-purple-600 text-white', icon: 'fa-solid fa-language' },
  'Mantık': { bg: 'bg-blue-50/60', border: 'border-blue-200', badge: 'bg-blue-600 text-white', icon: 'fa-solid fa-brain' },
  'Sayı': { bg: 'bg-emerald-50/60', border: 'border-emerald-200', badge: 'bg-emerald-600 text-white', icon: 'fa-solid fa-arrow-down-1-9' },
  'Görsel': { bg: 'bg-amber-50/60', border: 'border-amber-200', badge: 'bg-amber-600 text-white', icon: 'fa-solid fa-eye' },
  'Kibrit': { bg: 'bg-orange-50/60', border: 'border-orange-200', badge: 'bg-orange-600 text-white', icon: 'fa-solid fa-fire-flame-curved' },
  'Şifre': { bg: 'bg-rose-50/60', border: 'border-rose-200', badge: 'bg-rose-600 text-white', icon: 'fa-solid fa-key' },
};

const DEFAULT_STYLE = CATEGORY_STYLE['Mantık'];

interface Puzzle {
  id?: string;
  type?: string;
  category?: CategoryKey;
  difficulty_stars?: number;
  q: string;
  hint?: string;
  visual?: string | null;
  a: string;
}

function renderStars(count: number): React.ReactNode {
  return Array.from({ length: 3 }, (_, i) => (
    <span key={i} className={i < count ? 'text-amber-400 font-black' : 'text-zinc-300'}>
      ★
    </span>
  ));
}

export const BrainTeasersSheet: React.FC<BrainTeasersSheetProps> = ({ data, settings }) => {
  if (!data) return null;

  const activity = Array.isArray(data) ? data[0] : data;
  if (!activity) return null;

  const puzzles: Puzzle[] = (activity as any).puzzles || [];
  const layoutCols = (activity as any).settings?.layoutCols || (puzzles.length > 8 ? 3 : 2);

  const gridColsClass = layoutCols === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div
      className="w-full flex flex-col font-['Lexend'] min-h-[297mm] p-4 print:p-2 bg-white transition-all duration-300"
      style={{ fontFamily: settings?.fontFamily || 'Lexend' }}
    >
      <PedagogicalHeader
        title={(activity.title as string) || 'Kafayı Çalıştır: Zeka Atölyesi'}
        instruction={(activity.instruction as string) || 'Zekanı konuştur! Bilmeceleri çöz ve mantık bulmacalarını aydınlat.'}
        data={activity}
      />

      {/* PUZZLES GRID */}
      <div className={`grid ${gridColsClass} gap-3 print:gap-1.5 flex-1 my-2 content-start items-stretch`}>
        {puzzles.map((puzzle, idx) => {
          const cat = (puzzle.category || 'Mantık') as CategoryKey;
          const style = CATEGORY_STYLE[cat] ?? DEFAULT_STYLE;
          const stars = puzzle.difficulty_stars ?? 1;

          return (
            <div
              key={puzzle.id || idx}
              className={`rounded-2xl border-2 ${style.bg} ${style.border} p-3 print:p-2 flex flex-col justify-between shadow-2xs relative overflow-hidden`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-zinc-200/60 pb-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${style.badge}`}>
                    <i className={`${style.icon} text-[8px]`}></i>
                    {cat}
                  </span>
                  <span className="text-[9px] tracking-tighter leading-none">{renderStars(stars)}</span>
                </div>
                <span className="text-[9px] font-black text-zinc-400 uppercase">Soru #{idx + 1}</span>
              </div>

              {/* Question Body */}
              <div className="flex-1 flex flex-col justify-between gap-2">
                <p className="text-xs print:text-[10px] font-extrabold text-zinc-800 leading-snug">
                  {puzzle.q}
                </p>

                {puzzle.hint && (
                  <div className="flex items-center gap-1 text-[8.5px] font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100">
                    <i className="fa-solid fa-lightbulb text-amber-500 text-[9px]"></i>
                    <span>İpucu: {puzzle.hint}</span>
                  </div>
                )}

                {/* Answer Area */}
                <div className="pt-1 border-t border-dashed border-zinc-300/80 mt-auto">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="font-extrabold text-zinc-400 uppercase tracking-wider text-[8px]">Çözüm Notun:</span>
                    <div className="w-24 print:w-20 h-5 bg-white border border-zinc-300 rounded-md shadow-2xs"></div>
                  </div>
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
            ZİHİNSEL PERFORMANS &<br />YANAL DÜŞÜNME ATÖLYESİ
          </span>
        </div>
        {[
          { label: 'HEDEF SÜRE', val: '12:00', unit: 'dk' },
          { label: 'ÇÖZÜLEN', val: '___', unit: 'Soru' },
          { label: 'BAŞARI PUANI', val: '___', unit: 'p' },
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




