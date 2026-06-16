import React from 'react';
import { DirectionalTrackingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement } from '../../Editable';

type PuzzleItem = DirectionalTrackingData['puzzles'][number];

const SvgArrow = ({ dir, compact = false }: { dir: string; compact?: boolean }) => {
  const size = compact ? 18 : 22;
  const paths: Record<string, string> = {
    right: 'M3 12h14M13 6l6 6-6 6',
    down: 'M12 3v14M6 13l6 6 6-6',
    left: 'M21 12H7M11 6l-6 6 6 6',
    up: 'M12 21V7M6 11l6-6 6 6',
  };
  const d = paths[dir] || paths.right;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-800"
      style={{ display: 'block' }}
    >
      <path d={d} />
    </svg>
  );
};

const ArrowBox = ({ dir, compact = false }: { dir: string; compact?: boolean }) => (
  <div
    className={`${compact ? 'w-7 h-7' : 'w-9 h-9'} flex items-center justify-center bg-zinc-50 border border-zinc-300 rounded-lg print:border-zinc-400`}
  >
    <SvgArrow dir={dir} compact={compact} />
  </div>
);

const LegendItem = ({ sym, label }: { sym: string; label: string }) => {
  const dirMap: Record<string, string> = { '↑': 'up', '↓': 'down', '→': 'right', '←': 'left' };
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/80 rounded-lg border border-zinc-700/50">
      <SvgArrow dir={dirMap[sym] || 'right'} compact />
      <span className="text-zinc-400 text-[9px] font-bold">{label}</span>
    </div>
  );
};

export const DirectionalTrackingSheet = ({
  data,
  settings: globalSettings,
}: {
  data: DirectionalTrackingData;
  settings?: any;
}) => {
  const puzzles = (data?.puzzles || []) as PuzzleItem[];
  const settings = data?.settings;
  const isLandscape = globalSettings?.orientation === 'landscape';
  const isSingle = puzzles.length === 1;
  const aestheticMode =
    (settings as any)?.aestheticMode || globalSettings?.aestheticMode || 'standard';
  const isPremium = ['premium', 'glassmorphism', 'uzay', 'gizli', 'hazine', 'ultra-compact'].includes(aestheticMode);

  const themeColors: Record<string, { bg: string; border: string; accent: string; text: string; icon: string }> = {
    standard: { bg: 'bg-zinc-50/50', border: 'border-zinc-100', accent: 'bg-indigo-600', text: 'text-zinc-900', icon: 'text-indigo-600' },
    premium: { bg: 'bg-white/80', border: 'border-zinc-200', accent: 'bg-zinc-900', text: 'text-zinc-900', icon: 'text-indigo-600' },
    uzay: { bg: 'bg-indigo-950/10', border: 'border-indigo-200', accent: 'bg-indigo-900', text: 'text-indigo-900', icon: 'text-amber-500' },
    gizli: { bg: 'bg-zinc-100', border: 'border-zinc-800', accent: 'bg-zinc-800', text: 'text-zinc-800', icon: 'text-red-600' },
    hazine: { bg: 'bg-amber-50/50', border: 'border-amber-200', accent: 'bg-amber-700', text: 'text-amber-900', icon: 'text-amber-600' },
    'ultra-compact': { bg: 'bg-white', border: 'border-zinc-300', accent: 'bg-zinc-700', text: 'text-zinc-900', icon: 'text-zinc-600' },
  };

  const currentTheme = themeColors[aestheticMode] || themeColors.standard;
  const isUltraCompact = aestheticMode === 'ultra-compact';

  const arrowDirs = [
    { sym: '↑', label: 'Yukarı', dir: 'up' },
    { sym: '↓', label: 'Aşağı', dir: 'down' },
    { sym: '→', label: 'Sağa', dir: 'right' },
    { sym: '←', label: 'Sola', dir: 'left' },
  ] as const;

  return (
    <div
      className={`
      flex flex-col bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative p-6 print:p-4 min-h-[297mm]
      ${isLandscape ? 'landscape min-h-[210mm]' : ''}
      ${isPremium ? 'bg-slate-50/10' : 'bg-white'}
    `}
    >
      <PedagogicalHeader
        title={data?.title || 'YÖNSEL İZ SÜRME & ŞİFRE ÇÖZÜCÜ'}
        instruction={
          isUltraCompact
            ? 'Başlangıçtan okları takip et, şifreyi çöz.'
            : (data?.instruction || 'İşaretli başlangıç noktasından okların yönünü adım adım takip edin ve bulduğunuz karakterleri sırasıyla şifre kutularına yazın.')
        }
        note={data?.pedagogicalNote}
      />

      {/* Legend Panel - compact */}
      <div className="flex flex-wrap gap-1.5 mb-3 print:mb-2 items-center">
        <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mr-1 print:mr-1">
          ŞİFRE TABLOSU:
        </span>
        {arrowDirs.map((a) => (
          <LegendItem key={a.sym} sym={a.sym} label={a.label} />
        ))}
      </div>

      <div className={`flex-1 grid grid-cols-1 gap-4 print:gap-3 content-stretch items-stretch`}>
        {puzzles.map((puzzle, idx) => {
          const answerBoxCount = puzzle.cipherAnswer
            ? puzzle.cipherAnswer.length
            : (puzzle.answerLength ?? puzzle.path.length + 1);

          return (
            <EditableElement
              key={idx}
              className={`
                  relative border-[1.5px] transition-all duration-300 group break-inside-avoid flex flex-col justify-center
                  ${isUltraCompact ? 'gap-2 p-3' : 'gap-4 p-5'}
                  ${currentTheme.bg} ${currentTheme.border} rounded-[1.5rem] print:rounded-xl
                  ${isPremium ? 'backdrop-blur-sm shadow-sm' : ''}
                  ${isSingle ? 'flex-1 w-full max-w-none' : ''}
              `}
            >
              {/* Badge */}
              <div
                className={`
                  absolute -top-2.5 left-6 px-3 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest z-10 shadow-sm border border-white
                  ${currentTheme.accent} text-white
              `}
              >
                GÖREV {idx + 1}
              </div>

              {/* 1. ALGORİTMA YÖRÜNGESİ */}
              <div className={`${isUltraCompact ? 'p-1.5' : 'p-3'} bg-zinc-950 rounded-xl border border-white/20`}>
                <div className="flex flex-wrap gap-1">
                  {(() => {
                const stepsList: { dir: string; count: number }[] = puzzle.steps && puzzle.steps.length > 0
                  ? puzzle.steps.map(s => ({ dir: s.dir ?? s.direction ?? 'right', count: s.count ?? 1 }))
                  : puzzle.path.map(d => ({ dir: d, count: 1 }));
                return stepsList.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 px-1.5 py-1 bg-white/10 border border-white/10 rounded-md"
                    >
                      <SvgArrow dir={step.dir} compact />
                      {step.count > 1 ? (
                        <span className="text-[9px] font-black text-white">{step.count}</span>
                      ) : null}
                    </div>
                  ));
                })()}
                </div>
              </div>

              {/* 2. GRID + INFO */}
              <div className={`flex flex-row ${isUltraCompact ? 'gap-2' : 'gap-4'} items-center justify-center`}>
                <div className={`${isUltraCompact ? 'p-1' : 'p-2'} bg-white rounded-xl border border-zinc-200 shadow-inner`}>
                  <div
                    className="grid bg-zinc-200 gap-px border-2 border-zinc-950 rounded-lg overflow-hidden shadow-md"
                    style={{
                      gridTemplateColumns: `repeat(${puzzle.grid[0].length}, minmax(0, 1fr))`,
                    }}
                  >
                    {puzzle.grid.map((row, r) =>
                      row.map((cell, c) => {
                        const isStart = r === puzzle.startPos.r && c === puzzle.startPos.c;
                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`w-7 h-7 print:w-6 print:h-6 bg-white flex items-center justify-center font-black text-sm relative ${isStart ? 'bg-indigo-100' : ''}`}
                          >
                            {isStart && (
                              <div className="absolute inset-0.5 border-2 border-indigo-500 rounded flex items-center justify-center bg-indigo-50">
                                <div className={`w-2 h-2 rounded-full ${isUltraCompact ? '' : 'animate-ping'} bg-indigo-500`}></div>
                              </div>
                            )}
                            <span className={`${isStart ? 'text-indigo-700' : 'text-zinc-800'} ${cell === '' ? 'opacity-20' : ''} text-xs`}>
                              {cell || '·'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 rounded-full border border-zinc-200 text-[8px] font-black text-indigo-600 uppercase tracking-wider">
                  <SvgArrow dir="right" compact />
                  <span className="text-zinc-800">{String.fromCharCode(65 + puzzle.startPos.c)}{puzzle.startPos.r + 1}</span>
                </div>
              </div>

              {/* 3. ŞİFRE ALANI */}
              <div className={`${isUltraCompact ? 'p-2' : 'p-3'} bg-white rounded-xl border border-zinc-200`}>
                <div className="flex gap-1 flex-wrap justify-center">
                  {Array.from({ length: answerBoxCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`${isUltraCompact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-base'} border-2 border-zinc-800 bg-zinc-50 rounded-md flex items-center justify-center font-mono font-black text-zinc-400`}
                    >
                      _
                    </div>
                  ))}
                </div>
              </div>
            </EditableElement>
          );
        })}
      </div>

      {/* KOD ANAHTARI */}
      <div className="mt-3 print:mt-2 rounded-2xl p-3 flex flex-wrap gap-3 items-center border-2 border-zinc-800 bg-zinc-950 text-white shadow-lg">
        <div className="flex flex-col border-r border-white/20 pr-4">
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
            KOD ANAHTARI
          </span>
          <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-tight">
            Yönelge Protokolü
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {arrowDirs.map((a) => (
            <div
              key={a.sym}
              className="bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-2"
            >
              <SvgArrow dir={a.dir} compact />
              <span className="text-zinc-300 text-[8px] font-black uppercase tracking-tight">{a.label}</span>
            </div>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3 text-[8px] font-bold text-zinc-500">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            TAKİP
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            VERİ
          </div>
        </div>
      </div>

      {/* KLİNİK PANEL */}
      <div className="mt-2 pt-2 grid grid-cols-5 gap-2 px-3 pb-3 rounded-t-2xl bg-zinc-900 text-white shadow-inner">
        <div className="col-span-1 flex flex-col justify-center">
          <span className="text-[8px] font-black uppercase leading-tight text-zinc-400">
            VİZÜO-MOTOR<br />ANALİZ
          </span>
        </div>
        {[
          { label: 'SÜRE', val: '__:__', unit: 'dk' },
          { label: 'HATA', val: '___', unit: 'ad' },
          { label: 'PUAN', val: '___', unit: 'p' },
        ].map((item) => (
          <div key={item.label} className="bg-white/10 border border-white/10 rounded-lg p-2 flex flex-col justify-between">
            <span className="text-[7px] font-black text-zinc-500 uppercase">{item.label}</span>
            <div className="flex items-end gap-0.5">
              <span className="text-sm font-black text-white">{item.val}</span>
              <span className="text-[6px] font-bold text-zinc-500 mb-0.5">{item.unit}</span>
            </div>
          </div>
        ))}
        <div className="bg-white/10 border border-white/10 rounded-lg p-2 flex flex-col justify-between col-span-1">
          <span className="text-[7px] font-black text-zinc-500 uppercase">DİKKAT</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="w-3 h-3 rounded border border-white/20 bg-white/5"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
