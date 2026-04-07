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
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const activity = data[0] as Record<string, unknown>;
  const blocks = (activity.layoutArchitecture as { blocks?: { type: string; content: unknown }[] })?.blocks || [];
  const puzzlesBlock = blocks.find((b) => b.type === 'puzzles');
  const puzzles: Puzzle[] = (
    (activity.puzzles as Puzzle[] | undefined) ||
    ((puzzlesBlock?.content as { items?: Puzzle[] } | undefined)?.items) ||
    []
  );

  return (
    <div
      className="w-full h-full flex flex-col gap-4 print:gap-2 p-6 print:p-3"
      style={{ fontFamily: settings.fontFamily }}
    >
      {/* Header */}
      {settings.showTitle && (
        <div className="text-center pb-3 print:pb-1 border-b-2 border-dashed border-zinc-200">
          <div className="inline-block p-3 print:p-1 rounded-full bg-amber-100 text-amber-600 mb-2 print:mb-1">
            <i className="fa-solid fa-lightbulb text-3xl"></i>
          </div>
          <h1
            className="text-3xl font-black text-zinc-800 uppercase tracking-tight"
            style={{ color: settings.borderColor }}
          >
            {(activity.title as string) || 'Kafayı Çalıştır'}
          </h1>
          {settings.showInstruction && (
            <p className="text-sm text-zinc-500 font-medium mt-1">
              {(activity.instruction as string) || ''}
            </p>
          )}
        </div>
      )}

      {/* Puzzles Grid — 2 columns */}
      <div className="grid grid-cols-2 gap-3 print:gap-2 flex-1">
        {puzzles.map((puzzle, idx) => {
          const cat = (puzzle.category || 'Mantık') as CategoryKey;
          const style = CATEGORY_STYLE[cat] ?? DEFAULT_STYLE;
          const stars = puzzle.difficulty_stars ?? 1;

          return (
            <div
              key={puzzle.id || idx}
              className={`rounded-2xl border-2 ${style.bg} ${style.border} overflow-hidden flex flex-col`}
            >
              {/* Card Header */}
              <div className={`flex items-center justify-between px-4 py-2 print:px-3 print:py-1 ${style.badge} bg-opacity-10`}>
                <span className={`text-[10px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded-full ${style.badge}`}>
                  {cat}
                </span>
                <span className="text-sm leading-none">{renderStars(stars)}</span>
                <span className="text-xs font-bold text-zinc-500">#{idx + 1}</span>
              </div>

              {/* Card Body */}
              <div className="p-4 print:p-3 flex flex-col flex-1 gap-3 print:gap-2">
                {/* Visual emoji */}
                {puzzle.visual && typeof puzzle.visual === 'string' && (
                  <div className="flex justify-center text-3xl print:text-2xl">{puzzle.visual}</div>
                )}

                {/* Question */}
                <p
                  className="text-sm font-semibold text-zinc-800 leading-snug flex-1"
                  style={{ lineHeight: settings.lineHeight }}
                >
                  {puzzle.q}
                </p>

                {/* Answer line */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Cevap:</span>
                  <div className="flex-1 border-b border-dashed border-zinc-400"></div>
                </div>

                {/* Hint */}
                {puzzle.hint && (
                  <p className="text-[10px] italic text-zinc-400 mt-0.5">💡 {puzzle.hint}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="pt-2 print:pt-1 border-t border-zinc-100 text-center">
        <span className="text-xs text-zinc-400 font-medium">
          Toplam {puzzles.length} Bulmaca
        </span>
      </div>
    </div>
  );
};




