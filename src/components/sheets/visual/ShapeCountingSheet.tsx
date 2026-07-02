import React from 'react';
import { ShapeCountingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const SHAPE_PATHS: Record<string, string> = {
  triangle: 'M 0 -35 L 35 35 L -35 35 Z',
  circle: 'M 0 0 m -35 0 a 35 35 0 1 0 70 0 a 35 35 0 1 0 -70 0',
  square: 'M -30 -30 L 30 -30 L 30 30 L -30 30 Z',
  star: 'M 0 -40 L 11 -15 L 38 -15 L 16 2 L 25 28 L 0 12 L -25 28 L -16 2 L -38 -15 L -11 -15 Z',
  hexagon: 'M 0 -40 L 35 -20 L 35 20 L 0 40 L -35 20 L -35 -20 Z',
  pentagon: 'M 0 -40 L 40 -10 L 25 35 L -25 35 L -40 -10 Z',
  diamond: 'M 0 -40 L 35 0 L 0 40 L -35 0 Z',
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
      flex flex-col h-full bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative p-4 print:p-3 min-h-[210mm] ${isLandscape ? 'landscape' : 'min-h-[297mm]'}
      ${isPremium ? 'premium-mode bg-slate-50/20' : 'bg-white'}
    `}
    >
      <div className="flex flex-col gap-0.5 mb-1">
        <h1 className="text-base print:text-sm font-black uppercase tracking-tighter text-zinc-900 leading-none">
          {data.title || 'KAÇ TANE ÜÇGEN VAR?'}
        </h1>
        <p className="text-[8px] print:text-[7px] font-medium text-zinc-500 leading-tight">
          {data.instruction || 'Karmaşık görsel sahadaki hedef şekilleri bulun ve toplam sayısını ilgili kutucuğa yazın.'}
        </p>
      </div>

      {/* 1. HEDEF VİZÖRÜ (Aranan Şekil) */}
      <div
        className={`flex justify-center ${isSingle ? 'mt-1 mb-1 print:mt-0.5 print:mb-0.5' : 'mt-0.5 mb-0.5'}`}
      >
        <div
          className={`
            relative px-3 print:px-2 py-1 print:py-0.5 rounded-lg flex items-center gap-3 print:gap-2 shadow-sm border border-zinc-900 bg-white group hover:scale-[1.01] transition-all duration-500
            ${isPremium ? 'ring-2 ring-indigo-50/50' : ''}
        `}
        >
          <div className="flex flex-col">
            <span className="text-[6px] print:text-[5px] font-black uppercase tracking-[0.25em] text-amber-500 mb-0.5 leading-none">
              HEDEF
            </span>
            <span className="text-base print:text-xs font-black uppercase tracking-tighter leading-none">
              {settings?.targetShape?.toUpperCase() || 'ÜÇGEN'}
            </span>
          </div>

          <div className="w-8 h-8 print:w-6 print:h-6 bg-zinc-900 rounded-md flex items-center justify-center p-1 shadow-md border border-zinc-100 transform -rotate-3 group-hover:rotate-0 transition-transform">
            <svg
              viewBox="-50 -50 100 100"
              className="w-full h-full fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
            >
              <path d={SHAPE_PATHS[settings?.targetShape || 'triangle']} />
            </svg>
          </div>
        </div>
      </div>

      <div
        className={`grid ${gridCols} gap-2 print:gap-1.5 mt-1 flex-1 content-stretch items-stretch pb-2 print:pb-1`}
      >
        {sections.map((section, idx) => (
          <EditableElement
            key={idx}
            className={`
                flex flex-col border relative break-inside-avoid transition-all duration-500 group overflow-hidden
                ${
                  isPremium
                    ? 'bg-white/80 backdrop-blur-sm border-zinc-900 rounded-2xl shadow-sm'
                    : 'bg-white border-zinc-900 rounded-2xl shadow-sm'
                }
                ${isSingle ? 'flex-1 p-3 print:p-2' : 'p-3 print:p-1.5'}
            `}
          >
            {/* Bölüm Başlığı */}
            <div
              className={`
                absolute top-0 left-0 px-6 print:px-3 py-1.5 print:py-0.5 rounded-br-xl font-black text-[9px] print:text-[7px] uppercase tracking-widest z-10 shadow-sm border-r border-b border-zinc-900
                ${isPremium ? 'bg-zinc-900 text-white' : 'bg-indigo-600 text-white'}
            `}
            >
              SAHA_{idx + 1}
            </div>

            {/* Arama Alanı */}
            <div
              className={`
                relative border border-zinc-100 rounded-xl bg-zinc-50/20 overflow-hidden search-field-container mb-2 print:mb-1 shadow-inner group/field mt-6
                ${isSingle ? 'flex-1' : 'aspect-square'}
              `}
              style={{ overflow: 'hidden' }}
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
                  const sc = (item.size ?? 1) * 0.55;
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
                            ? `hsla(220, 10%, 90%, 0.05)`
                            : 'none'
                        }
                        stroke="#18181b"
                        strokeWidth={2.5}
                        strokeLinejoin="round"
                        style={{ mixBlendMode: 'multiply', opacity: 1 }}
                        className="transition-all duration-300 group-hover/field:opacity-100"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Cevap Paneli */}
            <div className="flex items-center justify-between px-2 print:px-1.5">
              <div className="flex items-center gap-4 print:gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] print:text-[7px] font-black text-zinc-900 uppercase tracking-tight leading-none">
                    TOPLAM
                  </span>
                  <span className="text-[8px] print:text-[6px] font-bold text-zinc-400 tracking-widest mt-0.5 uppercase">
                    SAYISI
                  </span>
                </div>
                <div
                  className={`
                    w-16 h-12 border-2 bg-white rounded-2xl flex items-center justify-center shadow-md transform group-hover:-rotate-3 transition-transform
                    ${isPremium ? 'border-zinc-900 ring-2 ring-indigo-50' : 'border-indigo-600'}
                `}
                >
                  <EditableText
                    value=""
                    tag="div"
                    placeholder="?"
                    className="font-black text-2xl print:text-xl text-zinc-900"
                  />
                </div>
              </div>

              {settings?.showClinicalNotes && section.clinicalMeta && (
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] print:text-[6px] font-black uppercase text-zinc-400 tracking-tighter">
                      YÜK
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-2.5 rounded-full ${i < Math.round(section.clinicalMeta!.figureGroundComplexity / 2) ? 'bg-indigo-500' : 'bg-zinc-100 shadow-inner'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-layer-group text-amber-500 text-[8px]"></i>
                    <span className="text-[7px] print:text-[6px] font-black uppercase text-amber-600">
                      %{Math.round(section.clinicalMeta.overlappingRatio * 100)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden Solution */}
            <div className="absolute top-8 right-6 opacity-0 group-hover:opacity-10 transition-opacity rotate-180 text-[9px] font-black select-none pointer-events-none text-zinc-900">
              {section.correctCount}
            </div>
          </EditableElement>
        ))}
      </div>

      {/* KLİNİK PROTOKOL FOOTER */}
      <div
        className={`
        mt-1 p-2 print:p-1.5 rounded-xl border border-zinc-900 flex justify-between items-center shadow-sm relative overflow-hidden
        ${isPremium ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}
      `}
      >
        <div className="flex gap-8 items-center relative z-10">
          <div className="flex flex-col">
            <span className="text-[8px] print:text-[6px] font-black text-amber-500 uppercase tracking-[0.35em] mb-0.5">
              PROTOKOL
            </span>
            <span
              className={`text-xs print:text-[9px] font-black uppercase tracking-tight ${isPremium ? 'text-white' : 'text-zinc-900'}`}
            >
              Görsel Ayrıştırma
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="text-right">
            <span className="block text-[6px] print:text-[5px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-0.5">
              BDMIND
            </span>
            <span className="text-[8px] print:text-[6px] font-black tracking-tighter uppercase">
              v3.8
            </span>
          </div>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border border-zinc-900 shadow-md transform rotate-12 transition-transform hover:rotate-0`}
          >
            <i className="fa-solid fa-crosshairs text-amber-500 text-base"></i>
          </div>
        </div>
      </div>
    </div>
  );
};
