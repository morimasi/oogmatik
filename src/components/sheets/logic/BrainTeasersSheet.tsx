import React from 'react';
import { WorksheetData, StyleSettings } from '../../../types';

interface BrainTeasersSheetProps {
  data: WorksheetData;
  settings: StyleSettings;
}

type CategoryKey = 'Dil' | 'Mantık' | 'Sayı' | 'Görsel';

const CATEGORY_STYLE: Record<CategoryKey, { bg: string; border: string; badge: string }> = {
  'Dil':    { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-500' },
  'Mantık': { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-500'   },
  'Sayı':   { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-500' },
  'Görsel': { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-500'  },
};

const DEFAULT_STYLE = CATEGORY_STYLE['Mantık'];

interface Puzzle {
  id?: string;
  type?: string;
  category?: string;
  difficulty_stars?: number;
  q: string;
  hint?: string;
  visual?: string | null;
  a: string;
}

function renderStars(count: number): React.ReactNode {
  return Array.from({ length: 3 }, (_, i) => (
    <span key={i} className={i < count ? 'text-amber-400' : 'text-zinc-300'}>
      {i < count ? '★' : '☆'}
    </span>
  ));
}

export const BrainTeasersSheet: React.FC<BrainTeasersSheetProps> = ({ data, settings }) => {
  if (!data) return null;
  
  // Normalize data (can be single object or array)
  const activity = Array.isArray(data) ? data[0] : data;
  if (!activity) return null;

  const blocks = (activity.layoutArchitecture as { blocks?: { type: string; content: unknown }[] })?.blocks || [];
  const puzzlesBlock = blocks.find((b) => b.type === 'puzzles');
  const puzzles: Puzzle[] = (
    (activity.puzzles as Puzzle[] | undefined) ||
    ((puzzlesBlock?.content as { items?: Puzzle[] } | undefined)?.items) ||
    []
  );

  return (
    <div
      className="w-full h-full flex flex-col gap-2 print:gap-1 p-4 print:p-0"
      style={{ fontFamily: settings.fontFamily }}
    >
      {/* Header */}
      {settings.showTitle && (
        <div className="text-center pb-2 print:pb-1 border-b-2 border-dashed border-zinc-200 shrink-0">
          <div className="flex items-center justify-center gap-3 mb-1">
             <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                <i className="fa-solid fa-brain text-xl"></i>
             </div>
             <div>
                <h1
                  className="text-2xl print:text-lg font-black text-zinc-800 uppercase tracking-tight leading-none"
                  style={{ color: settings.borderColor }}
                >
                  {(activity.title as string) || 'Kafayı Çalıştır'}
                </h1>
                {settings.showInstruction && (
                  <p className="text-[10px] print:text-[8px] text-zinc-500 font-medium mt-1">
                    {(activity.instruction as string) || ''}
                  </p>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Puzzles Grid — 2 or 3 columns based on count, dense */}
      <div className={`grid ${puzzles.length > 10 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 print:gap-1 flex-1 content-start mt-2`}>
        {puzzles.map((puzzle, idx) => {
          const cat = (puzzle.category || 'Mantık') as CategoryKey;
          const style = CATEGORY_STYLE[cat] ?? DEFAULT_STYLE;
          const stars = puzzle.difficulty_stars ?? 1;

          return (
            <div
              key={puzzle.id || idx}
              className={`rounded-lg border-[1.5px] ${style.bg} ${style.border} overflow-hidden flex flex-col h-full shadow-sm`}
            >
              {/* Card Header */}
              <div className={`flex items-center justify-between px-2 py-0.5 print:px-1.5 print:py-0 ${style.badge} bg-opacity-10 shrink-0 border-b ${style.border}`}>
                <div className="flex items-center gap-1">
                  <span className={`text-[7px] print:text-[6px] font-black uppercase tracking-widest text-white px-1.5 py-0 rounded-full ${style.badge}`}>
                    {cat}
                  </span>
                  <span className="text-[8px] print:text-[6px] leading-none">{renderStars(stars)}</span>
                </div>
                <span className="text-[8px] print:text-[6px] font-black text-zinc-400">#{idx + 1}</span>
              </div>

              {/* Card Body */}
              <div className="px-2 py-1.5 print:px-1.5 print:py-0.5 flex flex-col flex-1 gap-0.5 justify-between">
                <div>
                   {/* Question */}
                   <p
                     className="text-xs print:text-[9.5px] font-bold text-zinc-800 leading-[1.1]"
                     style={{ lineHeight: 1.1 }}
                   >
                     {puzzle.q}
                   </p>
                </div>

                <div className="mt-auto flex flex-col gap-0.5 shrink-0 pt-0.5 border-t border-zinc-100/50">
                  {/* Answer line */}
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] print:text-[6px] font-bold text-zinc-300 uppercase tracking-wider whitespace-nowrap">Cevap:</span>
                    <div className="flex-1 border-b border-dashed border-zinc-200"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="pt-1.5 print:pt-0.5 border-t border-zinc-100 text-center shrink-0">
        <span className="text-[10px] print:text-[8px] text-zinc-400 font-bold uppercase tracking-widest">
          bdmind Zeka Atölyesi • Toplam {puzzles.length} Görev
        </span>
      </div>
    </div>
  );
};




