import React from 'react';
import { DirectionalTrackingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

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

export const DirectionalTrackingSheet = ({ data }: { data: DirectionalTrackingData }) => {
  const puzzles = data?.puzzles || [];
  const layout = data?.settings?.layout || 'single';
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

      <div className={`mt-8 grid ${isSingle ? 'grid-cols-1' : 'grid-cols-2'} gap-8 print:gap-4 flex-1 content-start`}>
        {puzzles.map((puzzle, idx) => (
          <EditableElement
            key={idx}
            className={`relative bg-white border-[3px] border-zinc-900 rounded-[3rem] p-10 print:p-6 shadow-[12px_12px_0_#18181b] flex flex-col gap-10 print:gap-6 break-inside-avoid ${isSingle ? 'max-w-4xl mx-auto w-full' : ''}`}
          >
            {/* Badge */}
            <div className="absolute -top-5 left-10 bg-indigo-600 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border-2 border-zinc-900 shadow-lg z-20">
              Görev {idx + 1}
            </div>

            <div className={`flex ${isSingle ? 'flex-row' : 'flex-col'} gap-12 print:gap-8 items-start justify-between`}>

              {/* GRID AREA */}
              <div className="flex-1 flex flex-col items-center gap-4">
                <div className="relative p-6 bg-zinc-50 rounded-[2.5rem] border-2 border-zinc-200">
                  {/* Grid Labels (Top) */}
                  <div className="flex ml-10 mb-2">
                    {puzzle.grid[0].map((_, c) => (
                      <span key={c} className="w-12 h-6 flex items-center justify-center text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                        {String.fromCharCode(65 + c)}
                      </span>
                    ))}
                  </div>

                  <div className="flex">
                    {/* Grid Labels (Left) */}
                    <div className="flex flex-col mr-2">
                      {puzzle.grid.map((_, r) => (
                        <span key={r} className="w-8 h-12 flex items-center justify-center text-[10px] font-black text-zinc-400">
                          {r + 1}
                        </span>
                      ))}
                    </div>

                    {/* Main Grid */}
                    <div
                      className="grid bg-zinc-200 gap-px border-2 border-zinc-900 rounded-2xl overflow-hidden shadow-xl"
                      style={{ gridTemplateColumns: `repeat(${puzzle.grid[0].length}, minmax(0, 1fr))` }}
                    >
                      {puzzle.grid.map((row, r) =>
                        row.map((cell, c) => {
                          const isStart = r === puzzle.startPos.r && c === puzzle.startPos.c;
                          return (
                            <div key={`${r}-${c}`} className={`w-12 h-12 print:w-10 print:h-10 bg-white flex items-center justify-center font-black text-xl relative ${isStart ? 'bg-indigo-50' : ''}`}>
                              {isStart && (
                                <div className="absolute inset-2 border-2 border-indigo-500 rounded-lg flex items-center justify-center">
                                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
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
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 italic">
                  <i className="fa-solid fa-location-dot"></i>
                  Başlangıç: {String.fromCharCode(65 + puzzle.startPos.c)}{puzzle.startPos.r + 1}
                </div>
              </div>

              {/* PATH & ANSWER AREA */}
              <div className="flex-1 w-full space-y-8">
                {/* Yörünge Bilgisi */}
                <div className="bg-zinc-100 rounded-[2rem] p-6 border-2 border-zinc-200 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <i className="fa-solid fa-route text-6xl"></i>
                  </div>
                  <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    Algoritma Yörüngesi
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {puzzle.path.map((dir, dIdx) => (
                      <ArrowIcon key={dIdx} dir={dir} />
                    ))}
                  </div>
                </div>

                {/* Deşifre Giriş Alanı */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] ml-2">Deşifre Edilen Kod:</h5>
                  <div className="flex flex-wrap gap-3">
                    {Array.from({ length: puzzle.path.length + 1 }).map((_, i) => (
                      <div key={i} className="w-16 h-20 print:w-12 print:h-16 flex flex-col items-center justify-center border-b-[5px] border-zinc-900 bg-zinc-50 rounded-t-2xl shadow-sm transition-all hover:bg-white hover:-translate-y-1">
                        <span className="text-3xl font-black text-zinc-200">?</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Çözüm Anahtarı (Ters) */}
            <div className="absolute bottom-4 right-10 rotate-180 opacity-0 group-hover:opacity-20 text-[8px] font-black uppercase tracking-widest pointer-events-none select-none">
              Çözüm: {puzzle.targetWord}
            </div>
          </EditableElement>
        ))}
      </div>

      {/* KLİNİK DEĞERLENDİRME PANELİ (A4 Bottom) */}
      <div className="mt-auto pt-10 grid grid-cols-4 gap-6 border-t-[3px] border-zinc-100 px-4">
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
