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
    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mr-2">ŞİFRE TABLOSU:</span>
    <div className="grid grid-cols-4 gap-2 w-full mt-1">
      {([
        { sym: '↑', label: 'Yukarı' },
        { sym: '↓', label: 'Aşağı' },
        { sym: '→', label: 'Sağa' },
        { sym: '←', label: 'Sola' },
      ] as const).map((s) => (
        <div key={s.sym} className="bg-zinc-800 rounded-lg p-2 flex items-center gap-2">
          <span className="text-white font-black text-lg w-6 text-center">{s.sym}</span>
          <span className="text-zinc-400 text-[9px] font-bold">{s.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export const DirectionalTrackingSheet = ({ data }: { data: DirectionalTrackingData }) => {
  const puzzles = (data?.puzzles || []) as ExtendedPuzzle[];
  const isSingle = puzzles.length === 1;

  return (
    <div className="flex flex-col h-full bg-white font-['Lexend'] text-black overflow-hidden professional-worksheet p-10 print:p-4">
      <PedagogicalHeader
        title={data?.title || 'YÖNSEL İZ SÜRME & ŞİFRE ÇÖZÜCÜ'}
        instruction={
          data?.instruction ||
          'İşaretli başlangıç noktasından okların yönünü adım adım takip edin ve bulduğunuz karakterleri sırasıyla şifre kutularına yazın.'
        }
        note={data?.pedagogicalNote}
      />

      <LegendPanel />

      <div className={`grid ${isSingle ? 'grid-cols-1' : 'grid-cols-2'} gap-5 print:gap-3 flex-1 content-start`}>
        {puzzles.map((puzzle, idx) => {
          const answerBoxCount =
            puzzle.cipherAnswer
              ? puzzle.cipherAnswer.length
              : (puzzle.answerLength ?? puzzle.path.length + 1);

          return (
            <EditableElement
              key={idx}
              className={`relative bg-white border-[3px] border-zinc-900 rounded-[2rem] p-3 print:p-2 shadow-[8px_8px_0_#18181b] flex flex-col gap-3 print:gap-2 break-inside-avoid ${isSingle ? 'max-w-4xl mx-auto w-full' : ''}`}
            >
              {/* Badge */}
              <div className="absolute -top-4 left-8 bg-indigo-600 text-white px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border-2 border-zinc-900 shadow-lg z-20">
                Görev {idx + 1}
              </div>

              <div className={`flex ${isSingle ? 'flex-row' : 'flex-col'} gap-4 print:gap-3 items-start mt-3`}>

                {/* GRID AREA */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative p-3 bg-zinc-50 rounded-2xl border-2 border-zinc-200">
                    {/* Grid Labels (Top) */}
                    <div className="flex ml-8 mb-1">
                      {puzzle.grid[0].map((_, c) => (
                        <span key={c} className="w-10 h-5 flex items-center justify-center text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                          {String.fromCharCode(65 + c)}
                        </span>
                      ))}
                    </div>

                    <div className="flex">
                      {/* Grid Labels (Left) */}
                      <div className="flex flex-col mr-1">
                        {puzzle.grid.map((_, r) => (
                          <span key={r} className="w-7 h-10 flex items-center justify-center text-[9px] font-black text-zinc-400">
                            {r + 1}
                          </span>
                        ))}
                      </div>

                      {/* Main Grid */}
                      <div
                        className="grid bg-zinc-200 gap-px border-2 border-zinc-900 rounded-xl overflow-hidden shadow-lg"
                        style={{ gridTemplateColumns: `repeat(${puzzle.grid[0].length}, minmax(0, 1fr))` }}
                      >
                        {puzzle.grid.map((row, r) =>
                          row.map((cell, c) => {
                            const isStart = r === puzzle.startPos.r && c === puzzle.startPos.c;
                            return (
                              <div key={`${r}-${c}`} className={`w-10 h-10 print:w-8 print:h-8 bg-white flex items-center justify-center font-black text-base relative ${isStart ? 'bg-indigo-50' : ''}`}>
                                {isStart && (
                                  <div className="absolute inset-1.5 border-2 border-indigo-500 rounded-md flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                                  </div>
                                )}
                                <span className={isStart ? 'text-indigo-600 scale-75' : 'text-zinc-800'}>{cell}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 italic">
                    <i className="fa-solid fa-location-dot"></i>
                    Başlangıç: {String.fromCharCode(65 + puzzle.startPos.c)}{puzzle.startPos.r + 1}
                  </div>
                </div>

                {/* PATH & ANSWER AREA */}
                <div className="flex-1 w-full flex flex-col gap-3">
                  {/* Horizontal instruction chain */}
                  <div className="bg-zinc-100 rounded-xl p-3 border-2 border-zinc-200 relative overflow-hidden group">
                    <h5 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Algoritma Yörüngesi
                    </h5>
                    {puzzle.steps && puzzle.steps.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {puzzle.steps.map((step, i) => (
                          <span key={i} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <ArrowIcon dir={step.dir ?? step.direction ?? 'right'} compact />
                            <span className="text-[10px] font-black text-indigo-700">{step.count}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {puzzle.path.map((dir, dIdx) => (
                          <span key={dIdx} className="flex items-center px-1 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <ArrowIcon dir={dir} compact />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Premium Answer Boxes */}
                  <div>
                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">ŞİFRE ÇÖZÜMÜ</div>
                    <div className="flex gap-1 flex-wrap">
                      {Array.from({ length: answerBoxCount }).map((_, i) => (
                        <div
                          key={i}
                          className="w-9 h-9 print:w-7 print:h-7 border-2 border-zinc-800 bg-zinc-50 rounded-lg flex items-center justify-center font-mono font-black text-lg print:text-sm text-zinc-300"
                        >
                          _
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Çözüm Anahtarı (Ters) */}
              <div className="absolute bottom-3 right-8 rotate-180 opacity-0 group-hover:opacity-20 text-[8px] font-black uppercase tracking-widest pointer-events-none select-none">
                Çözüm: {puzzle.targetWord}
              </div>
            </EditableElement>
          );
        })}
      </div>

      {/* KLİNİK DEĞERLENDİRME PANELİ (A4 Bottom) */}
      <div className="mt-auto pt-6 grid grid-cols-4 gap-4 border-t-[3px] border-zinc-100 px-4">
        <div className="col-span-1 flex flex-col justify-center">
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-1">Clinic Pro</span>
          <span className="text-sm font-black text-zinc-800 uppercase tracking-tight leading-none">Değerlendirme <br />Protokolü</span>
        </div>

        <div className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Tamamlama Süresi</span>
          <div className="flex items-end gap-1">
            <span className="text-xl font-black text-zinc-900">___:___</span>
            <span className="text-[8px] font-bold text-zinc-400 mb-1.5">dk/sn</span>
          </div>
        </div>

        <div className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Hata / Düzeltme</span>
          <div className="flex items-end gap-2">
            <div className="flex-1 h-6 border-b-2 border-zinc-200"></div>
            <span className="text-[8px] font-bold text-zinc-400 mb-0.5">adet</span>
          </div>
        </div>

        <div className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Dikkat & Odaklanma</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="w-5 h-5 rounded-full border-2 border-zinc-200"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
