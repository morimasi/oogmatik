import React from 'react';
import { DirectionalTrackingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement } from '../../Editable';

type StepType = { dir?: string; direction?: string; count?: number };

type ExtendedPuzzle = DirectionalTrackingData['puzzles'][number] & {
  steps?: StepType[];
  answerLength?: number;
  cipherAnswer?: string;
};

const ArrowIcon = ({ dir, compact = false }: { dir: string; compact?: boolean }) => {
  const rotations: Record<string, number> = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
  };

  return (
    <div
      className={`${compact ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} flex items-center justify-center bg-zinc-50 border-2 border-zinc-200 group-hover:border-indigo-500 transition-all relative shadow-sm`}
    >
      <i
        className={`fa-solid fa-arrow-right text-zinc-800 ${compact ? 'text-xs' : 'text-sm'}`}
        style={{ transform: `rotate(${rotations[dir] || 0}deg)` }}
      ></i>
    </div>
  );
};

const LegendPanel = () => (
  <div className="bg-zinc-900 rounded-xl p-3 print:p-2 flex flex-wrap gap-2 items-center mb-4 print:mb-2">
    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mr-2">
      ŞİFRE TABLOSU:
    </span>
    <div className="grid grid-cols-4 gap-2 w-full mt-1">
      {(
        [
          { sym: '↑', label: 'Yukarı' },
          { sym: '↓', label: 'Aşağı' },
          { sym: '→', label: 'Sağa' },
          { sym: '←', label: 'Sola' },
        ] as const
      ).map((s: unknown) => (
        <div key={s.sym} className="bg-zinc-800 rounded-lg p-2 flex items-center gap-2">
          <span className="text-white font-black text-lg w-6 text-center">{s.sym}</span>
          <span className="text-zinc-400 text-[9px] font-bold">{s.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export const DirectionalTrackingSheet = ({
  data,
  settings: globalSettings,
}: {
  data: DirectionalTrackingData;
  settings?: any;
}) => {
  const puzzles = (data?.puzzles || []) as ExtendedPuzzle[];
  const settings = data?.settings;
  const isLandscape = globalSettings?.orientation === 'landscape';
  const isSingle = puzzles.length === 1;
  const aestheticMode =
    (settings as any)?.aestheticMode || globalSettings?.aestheticMode || 'standard';
  const isPremium = aestheticMode === 'premium' || aestheticMode === 'glassmorphism';

  return (
    <div
      className={`
      flex flex-col h-full bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative p-10 print:p-6 min-h-[210mm] ${isLandscape ? 'landscape' : 'min-h-[297mm]'}
      ${isPremium ? 'bg-slate-50/20' : 'bg-white'}
    `}
    >
      <PedagogicalHeader
        title={data?.title || 'YÖNSEL İZ SÜRME & ŞİFRE ÇÖZÜCÜ'}
        instruction={
          data?.instruction ||
          'İşaretli başlangıç noktasından okların yönünü adım adım takip edin ve bulduğunuz karakterleri sırasıyla şifre kutularına yazın.'
        }
        note={data?.pedagogicalNote}
      />

      <div
        className={`grid ${isSingle ? 'grid-cols-1' : 'grid-cols-2'} gap-6 print:gap-2 flex-1 content-start`}
      >
        {puzzles.map((puzzle, idx) => {
          const answerBoxCount = puzzle.cipherAnswer
            ? puzzle.cipherAnswer.length
            : (puzzle.answerLength ?? puzzle.path.length + 1);

          return (
            <EditableElement
              key={idx}
              className={`
                  relative border-[1.5px] transition-all duration-300 group break-inside-avoid flex flex-col gap-4
                  ${
                    isPremium
                      ? 'bg-white/80 backdrop-blur-sm border-zinc-200 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-indigo-400'
                      : 'bg-zinc-50/50 border-zinc-100 rounded-[2rem] hover:bg-white hover:border-zinc-200'
                  }
                  ${isSingle ? 'max-w-5xl mx-auto w-full p-8 print:p-2' : 'p-5 print:p-1'}
              `}
            >
              {/* Badge */}
              <div
                className={`
                  absolute -top-3 left-8 px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest z-10 shadow-md border-2 border-white
                  ${isPremium ? 'bg-zinc-900 text-white' : 'bg-indigo-600 text-white'}
              `}
              >
                GÖREV {idx + 1}
              </div>

              {/* 1. ALGORİTMA YÖRÜNGESİ (YATAY - ÜSTTE) */}
              <div className="bg-zinc-950 rounded-2xl p-4 print:p-1.5 border-2 border-white shadow-lg relative overflow-hidden group/path">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
                <h5 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_#f59e0b]"></div>
                  ALGORİTMA YÖRÜNGESİ
                </h5>

                {puzzle.steps && puzzle.steps.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {puzzle.steps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg transition-transform hover:scale-105"
                      >
                        <ArrowIcon dir={step.dir ?? step.direction ?? 'right'} compact />
                        <span className="text-xs font-black text-white">{step.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {puzzle.path.map((dir, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-1 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg"
                      >
                        <ArrowIcon dir={dir} compact />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. GRID VE BİLGİ ALANI (ORTA) */}
              <div className="flex flex-row gap-6 print:gap-2 items-center justify-center">
                <div className="relative p-3 print:p-1 bg-white rounded-2xl border-2 border-zinc-100 shadow-inner ring-4 ring-zinc-50/50">
                  {/* Grid Labels (Top) */}
                  <div className="flex ml-8 mb-1">
                    {puzzle.grid[0].map((_, c) => (
                      <span
                        key={c}
                        className="w-9 h-5 flex items-center justify-center text-[9px] font-black text-zinc-300 uppercase tracking-widest"
                      >
                        {String.fromCharCode(65 + c)}
                      </span>
                    ))}
                  </div>

                  <div className="flex">
                    {/* Grid Labels (Left) */}
                    <div className="flex flex-col mr-1">
                      {puzzle.grid.map((_, r) => (
                        <span
                          key={r}
                          className="w-7 h-9 flex items-center justify-center text-[9px] font-black text-zinc-300"
                        >
                          {r + 1}
                        </span>
                      ))}
                    </div>

                    {/* Main Grid */}
                    <div
                      className="grid bg-zinc-200 gap-px border-2 border-zinc-950 rounded-xl overflow-hidden shadow-xl"
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
                              className={`
                                w-9 h-9 print:w-8 print:h-8 bg-white flex items-center justify-center font-black text-base relative transition-colors
                                ${isStart ? 'bg-indigo-50/50' : 'hover:bg-zinc-50'}
                            `}
                            >
                              {isStart && (
                                <div className="absolute inset-1 border-[1.5px] border-indigo-400 rounded flex items-center justify-center bg-indigo-50/30">
                                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                                </div>
                              )}
                              <span
                                className={`
                                  ${isStart ? 'text-indigo-600 scale-75' : 'text-zinc-900'}
                                  ${cell === '' ? 'opacity-0' : 'opacity-100'}
                              `}
                              >
                                {cell || '?'}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50/80 px-4 py-2 rounded-full border border-indigo-100 shadow-sm backdrop-blur-sm">
                    <i className="fa-solid fa-location-crosshairs text-indigo-400"></i>
                    BAŞLANGIÇ:{' '}
                    <span className="text-zinc-900">
                      {String.fromCharCode(65 + puzzle.startPos.c)}
                      {puzzle.startPos.r + 1}
                    </span>
                  </div>
                  {/* Çözüm Anahtarı (Gizli/Küçük) */}
                  <div className="opacity-0 group-hover:opacity-20 transition-opacity text-[8px] font-black uppercase tracking-widest text-zinc-900 text-center">
                    ÇÖZÜM: {puzzle.targetWord}
                  </div>
                </div>
              </div>

              {/* 3. ŞİFRE ALANI (YATAY - ALTTA) */}
              <div className="bg-white rounded-2xl p-4 print:p-1.5 border-2 border-zinc-100 shadow-sm ring-4 ring-zinc-50/50">
                <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-key text-[8px]"></i>
                  TESPİT EDİLEN ŞİFRE
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: answerBoxCount }).map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 print:w-8 print:h-8 border-2 border-zinc-950 bg-zinc-50 rounded-lg flex items-center justify-center font-mono font-black text-xl print:text-lg text-zinc-900 group-hover:bg-indigo-50 transition-colors"
                    >
                      <span className="opacity-10 text-zinc-400">_</span>
                    </div>
                  ))}
                </div>
              </div>
            </EditableElement>
          );
        })}
      </div>

      {/* Şerif Tablosu (Kod Anahtarı) - Sayfa Altı Kompakt Panel */}
      <div
        className={`
          mt-6 rounded-3xl p-4 print:p-2 flex flex-wrap gap-6 items-center shadow-2xl border-4 border-white ring-8 ring-zinc-50/20
          ${isPremium ? 'bg-zinc-950 text-white' : 'bg-zinc-900 text-white'}
      `}
      >
        <div className="flex flex-col border-r border-white/10 pr-6">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-0.5">
            KOD ANAHTARI
          </span>
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">
            Yönelge Protokolü v4.1
          </span>
        </div>
        <div className="flex gap-4 flex-wrap">
          {(
            [
              { sym: '↑', label: 'Yukarı' },
              { sym: '↓', label: 'Aşağı' },
              { sym: '→', label: 'Sağa' },
              { sym: '←', label: 'Sola' },
            ] as const
          ).map((s: unknown) => (
            <div
              key={s.sym}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors"
            >
              <span className="text-amber-400 font-black text-xl w-6 text-center drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                {s.sym}
              </span>
              <span className="text-zinc-300 text-[10px] font-black uppercase tracking-tighter">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4 text-[10px] font-bold text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            AKTİF TAKİP
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            VERİ DOĞRULAMA
          </div>
        </div>
      </div>

      {/* KLİNİK PANEL (EN ALT - DARALTIMIŞ) */}
      <div
        className={`
          mt-4 pt-4 grid grid-cols-4 gap-4 px-6 pb-4 rounded-t-[2.5rem] shadow-lg
          ${isPremium ? 'bg-zinc-900 text-white' : 'bg-indigo-950 text-white'}
      `}
      >
        <div className="col-span-1 flex flex-col justify-center">
          <span className="text-[11px] font-black uppercase tracking-tight leading-none">
            VİZÜO-MOTOR <br />
            ANALİZ ANALİTİĞİ
          </span>
        </div>

        {[
          { label: 'SÜRE', val: '__:__', unit: 'dk' },
          { label: 'HATA', val: '___', unit: 'ad' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between"
          >
            <span className="text-[8px] font-black text-zinc-500 uppercase">{item.label}</span>
            <div className="flex items-end gap-1">
              <span className="text-lg font-black text-white">{item.val}</span>
              <span className="text-[7px] font-bold text-zinc-500 mb-1">{item.unit}</span>
            </div>
          </div>
        ))}

        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[8px] font-black text-zinc-500 uppercase">DİKKAT</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s: unknown) => (
              <div
                key={s}
                className="w-4 h-4 rounded-md border border-white/10 transition-colors hover:bg-amber-400"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
