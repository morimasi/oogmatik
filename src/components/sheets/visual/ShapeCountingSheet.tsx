import React from 'react';
import { ShapeCountingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const SHAPE_PATHS: Record<string, string> = {
  triangle: 'M 50 15 L 85 85 L 15 85 Z',
  circle: 'M 50 50 m -35 0 a 35 35 0 1 0 70 0 a 35 35 0 1 0 -70 0',
  square: 'M 20 20 L 80 20 L 80 80 L 20 80 Z',
  star: 'M 50 10 L 61 35 L 88 35 L 66 52 L 75 78 L 50 62 L 25 78 L 34 52 L 12 35 L 39 35 Z',
  hexagon: 'M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z',
  pentagon: 'M 50 10 L 90 40 L 75 85 L 25 85 L 10 40 Z',
  diamond: 'M 50 10 L 85 50 L 50 90 L 15 50 Z',
};

export const ShapeCountingSheet = ({
  data,
  settings: globalSettings,
}: {
  data: ShapeCountingData;
  settings?: any;
}) => {
  const settings = data?.settings;
  const sections = data?.sections || [];
  const isLandscape = globalSettings?.orientation === 'landscape';
  const layout = settings?.layout || 'single';
  const aestheticMode =
    (settings as any)?.aestheticMode || globalSettings?.aestheticMode || 'standard';
  const isPremium = aestheticMode === 'premium' || aestheticMode === 'glassmorphism';

  let gridCols =
    layout === 'grid_2x1' ? 'grid-cols-2' : layout === 'grid_2x2' ? 'grid-cols-2' : 'grid-cols-1';

  if (isLandscape && layout === 'single') gridCols = 'grid-cols-1';
  else if (isLandscape) gridCols = 'grid-cols-2';

  const isSingle = layout === 'single' || !layout;

  return (
    <div
      className={`
      flex flex-col h-full bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative p-10 print:p-6 min-h-[210mm] ${isLandscape ? 'landscape' : 'min-h-[297mm]'}
      ${isPremium ? 'premium-mode bg-slate-50/20' : 'bg-white'}
    `}
    >
      <div className="flex flex-col gap-0.5 mb-1">
        <h1 className="text-lg font-black uppercase tracking-tighter text-zinc-900 leading-none">
          {data.title || 'FİGÜR-ZEMİN & SEÇİCİ DİKKAT'}
        </h1>
        <p className="text-[9px] font-medium text-zinc-500 leading-tight">
          {data.instruction || 'Karmaşık görsel sahadaki hedef şekilleri bulun ve toplam sayısını ilgili kutucuğa yazın.'}
        </p>
      </div>

      {/* 1. HEDEF VİZÖRÜ (Aranan Şekil) */}
      <div
        className={`flex justify-center ${isSingle ? 'mt-2 mb-2 print:mt-1 print:mb-1' : 'mt-1 mb-1'}`}
      >
        <div
          className={`
            relative px-4 print:px-3 py-2 print:py-1 rounded-xl flex items-center gap-4 print:gap-3 shadow-sm border-2 border-zinc-900 bg-white group hover:scale-[1.01] transition-all duration-500
            ${isPremium ? 'ring-2 ring-indigo-50/50' : ''}
        `}
        >
          {/* Dekoratif Scanner Çizgisi */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scan"></div>

          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-amber-500 mb-0.5 leading-none">
              HEDEF
            </span>
            <span className="text-lg print:text-base font-black uppercase tracking-tighter leading-none">
              {settings?.targetShape?.toUpperCase() || 'ÜÇGEN'}
            </span>
          </div>

          <div className="w-10 h-10 print:w-8 print:h-8 bg-zinc-900 rounded-lg flex items-center justify-center p-2 shadow-lg border border-zinc-100 transform -rotate-3 group-hover:rotate-0 transition-transform">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"
            >
              <path d={SHAPE_PATHS[settings?.targetShape || 'triangle']} />
            </svg>
          </div>
        </div>
      </div>

      <div
        className={`grid ${gridCols} gap-4 print:gap-2 mt-2 flex-1 content-stretch items-stretch pb-4 print:pb-2`}
      >
        {sections.map((section, idx) => (
          <EditableElement
            key={idx}
            className={`
                flex flex-col border-2 relative break-inside-avoid transition-all duration-500 group overflow-hidden
                ${
                  isPremium
                    ? 'bg-white/80 backdrop-blur-sm border-zinc-900 rounded-3xl shadow-sm'
                    : 'bg-white border-zinc-900 rounded-3xl shadow-sm'
                }
                ${isSingle ? 'flex-1 p-4' : 'p-4 print:p-2'}
            `}
          >
            {/* Bölüm Başlığı */}
            <div
              className={`
                absolute top-0 left-0 px-8 print:px-4 py-2.5 print:py-1.5 rounded-br-[2.5rem] font-black text-[10px] uppercase tracking-widest z-10 shadow-sm border-r-2 border-b-2 border-zinc-900
                ${isPremium ? 'bg-zinc-900 text-white' : 'bg-indigo-600 text-white'}
            `}
            >
              SAHA_{idx + 1}
            </div>

            {/* Arama Alanı */}
            <div
              className={`
                relative border-2 border-zinc-100 rounded-2xl bg-zinc-50/20 overflow-hidden mb-4 print:mb-2 shadow-inner group/field
                ${isSingle ? 'flex-1' : 'aspect-square'}
              `}
            >
              <svg
                viewBox="0 0 500 500"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
              >
                <defs>
                  <pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#e5e7eb" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-dots)" />

                {section.searchField.map((item: any) => {
                  const tx = (item.x ?? 50) * 5;
                  const ty = (item.y ?? 50) * 5;
                  const rot = item.rotation ?? 0;
                  const sc = (item.size ?? 1) * 0.9;
                  const isTarget = item.type === settings?.targetShape;

                  return (
                    <g
                      key={item.id}
                      transform={`translate(${tx}, ${ty}) rotate(${rot}) scale(${sc})`}
                    >
                      <path
                        d={SHAPE_PATHS[item.type] ?? SHAPE_PATHS.triangle}
                        fill={
                          settings?.overlapping
                            ? `hsla(220, 10%, 90%, ${isTarget ? 0.05 : 0.02})`
                            : 'none'
                        }
                        stroke={isTarget ? '#18181b' : '#3f3f46'}
                        strokeWidth={isTarget ? 2.5 : 2}
                        strokeLinejoin="round"
                        style={{ mixBlendMode: 'multiply', opacity: isTarget ? 1 : 0.85 }}
                        className="transition-all duration-300 group-hover/field:opacity-100"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Cevap Paneli */}
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight leading-none">
                    TOPLAM SKOR
                  </span>
                  <span className="text-[9px] font-bold text-zinc-400 tracking-widest mt-1 uppercase">
                    HEDEF SAYISI
                  </span>
                </div>
                <div
                  className={`
                    w-24 h-18 border-[3px] bg-white rounded-3xl flex items-center justify-center shadow-lg transform group-hover:-rotate-3 transition-transform
                    ${isPremium ? 'border-zinc-900 ring-4 ring-indigo-50' : 'border-indigo-600'}
                `}
                >
                  <EditableText
                    value=""
                    tag="div"
                    placeholder="?"
                    className="font-black text-4xl text-zinc-900"
                  />
                </div>
              </div>

              {settings?.showClinicalNotes && section.clinicalMeta && (
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter">
                      BİLİŞSEL YÜK
                    </span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-4 rounded-full ${i < Math.round(section.clinicalMeta!.figureGroundComplexity / 2) ? 'bg-indigo-500' : 'bg-zinc-100 shadow-inner'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-layer-group text-amber-500 text-[10px]"></i>
                    <span className="text-[9px] font-black uppercase text-amber-600">
                      ÖRTÜŞME: %{Math.round(section.clinicalMeta.overlappingRatio * 100)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden Solution */}
            <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-10 transition-opacity rotate-180 text-[10px] font-black select-none pointer-events-none text-zinc-900">
              {section.correctCount}
            </div>
          </EditableElement>
        ))}
      </div>

      {/* KLİNİK PROTOKOL FOOTER */}
      <div
        className={`
        mt-2 p-4 print:p-3 rounded-2xl border-2 border-zinc-900 flex justify-between items-center shadow-sm relative overflow-hidden
        ${isPremium ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}
      `}
      >
        {/* Dekoratif Işık Efekti */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>

        <div className="flex gap-12 items-center relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-1">
              KLİNİK ANALİZ PROTOKOLÜ
            </span>
            <span
              className={`text-sm font-black uppercase tracking-tight ${isPremium ? 'text-white' : 'text-zinc-900'}`}
            >
              Görsel Ayrıştırma & Detay Odaklı Dikkat
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right">
            <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">
              CİHAZ / ENGİNE
            </span>
            <span className="text-[10px] font-black tracking-tighter uppercase">
              Oogmatik Vision v3.8.2
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-zinc-900 shadow-xl transform rotate-12 transition-transform hover:rotate-0`}
          >
            <i className="fa-solid fa-crosshairs text-amber-500 text-xl"></i>
          </div>
        </div>
      </div>

      {/* FOOTER LABEL */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-black text-zinc-200 uppercase tracking-[0.5em]">
        ANTIGRAVITY // EXPERIMENTAL VISUAL SUITE 2026
      </div>
    </div>
  );
};
