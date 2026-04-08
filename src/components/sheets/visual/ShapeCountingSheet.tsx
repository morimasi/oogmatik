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

export const ShapeCountingSheet = ({ data }: { data: ShapeCountingData }) => {
  const settings = data?.settings;
  const sections = data?.sections || [];
  const layout = settings?.layout || 'single';
  const aestheticMode = settings?.aestheticMode || 'standard';
  const isPremium = aestheticMode === 'premium' || aestheticMode === 'glassmorphism';

  const gridCols =
    layout === 'grid_2x1' ? 'grid-cols-2' : layout === 'grid_2x2' ? 'grid-cols-2' : 'grid-cols-1';
  const isSingle = layout === 'single' || !layout;

  return (
    <div className={`
      flex flex-col min-h-full print:min-h-0 font-sans text-black overflow-visible professional-worksheet 
      p-8 print:p-2 print:p-3
      ${isPremium ? 'bg-slate-50/30' : 'bg-white'}
    `}>
      <PedagogicalHeader
        title={data.title || 'FİGÜR-ZEMİN & SEÇİCİ DİKKAT'}
        instruction={
          data.instruction || 'Aşağıdaki karmaşık alanda hedef şekli bulup kaç adet olduğunu yazın.'
        }
        note={data.pedagogicalNote}
      />

      {/* Hedef Hatırlatıcı Panel - Premium */}
      <div className={`flex justify-center ${isSingle ? 'my-8 print:my-2' : 'my-4 print:my-1'}`}>
        <div className={`
            px-12 print:px-4 py-5 print:py-1 rounded-[3rem] flex items-center gap-10 print:gap-4 shadow-2xl border-4 border-white ring-8 ring-zinc-50/50 transform hover:scale-105 transition-all
            ${isPremium ? 'bg-zinc-950 text-white' : 'bg-indigo-950 text-white'}
        `}>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-amber-500 mb-1">
              ARANAN HEDEF
            </span>
            <span className="text-2xl font-black uppercase tracking-tighter">
              {settings?.targetShape || 'ÜÇGEN'}
            </span>
          </div>
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-3 border border-white/10 backdrop-blur-md">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"
            >
              <path d={SHAPE_PATHS[settings?.targetShape || 'triangle']} />
            </svg>
          </div>
        </div>
      </div>

      <div
        className={`grid ${gridCols} gap-6 print:gap-1 mt-4 print:mt-1 flex-1 content-start items-start pb-10 print:pb-2`}
      >
        {sections.map((section, idx) => (
          <EditableElement
            key={idx}
            className={`
                flex flex-col border-[1.5px] relative break-inside-avoid transition-all duration-300 group
                ${isPremium 
                    ? 'bg-white/80 backdrop-blur-sm border-zinc-200 rounded-[3rem] shadow-sm hover:shadow-2xl hover:border-indigo-400' 
                    : 'bg-zinc-50/50 border-zinc-100 rounded-[2.5rem] hover:bg-white hover:border-zinc-200'}
                ${isSingle ? 'h-[600px] print:h-[750px] p-8 print:p-2' : 'p-5 print:p-1'}
            `}
          >
            {/* Bölüm Başlığı */}
            <div className={`
                absolute -top-3 left-10 px-5 print:px-2 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest z-10 shadow-lg border-2 border-white
                ${isPremium ? 'bg-zinc-900 text-white' : 'bg-indigo-600 text-white'}
            `}>
              {section.title || `GÖRSEL SAHA ${idx + 1}`}
            </div>

            {/* Arama Alanı - High Quality */}
            <div
              className={`
                relative border-2 border-zinc-100 rounded-[2.5rem] bg-white overflow-hidden mb-6 print:mb-2 shadow-inner ring-4 ring-zinc-50/50
                ${isSingle ? 'flex-1' : 'aspect-square'}
              `}
            >
              <svg
                viewBox="0 0 500 500"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
              >
                {/* Arka plan dekoratif doku */}
                <defs>
                   <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                     <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f4f4f5" strokeWidth="1"/>
                   </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {section.searchField.map((item: any) => {
                  const tx = (item.x ?? 50) * 5;
                  const ty = (item.y ?? 50) * 5;
                  const rot = item.rotation ?? 0;
                  const sc = (item.size ?? 1) * 0.8;
                  const isTarget = item.type === settings?.targetShape;
                  
                  return (
                    <g key={item.id} transform={`translate(${tx}, ${ty}) rotate(${rot}) scale(${sc})`}>
                      <path
                        d={SHAPE_PATHS[item.type] ?? SHAPE_PATHS.triangle}
                        fill={settings?.overlapping ? 'rgba(79, 70, 229, 0.05)' : 'none'}
                        stroke={isTarget ? '#18181b' : '#71717a'}
                        strokeWidth={isTarget ? 2.5 : 1.5}
                        strokeLinejoin="round"
                        className="mix-blend-multiply transition-opacity hover:opacity-100"
                        style={{ opacity: isTarget ? 0.9 : 0.6 }}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Cevap & Klinik Bilgi */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-5">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                  TESPİT EDİLEN:
                </span>
                <div className={`
                    w-20 h-14 border-b-4 bg-zinc-50 rounded-t-2xl flex items-center justify-center transition-all
                    ${isPremium ? 'border-zinc-900 group-hover:bg-zinc-100' : 'border-indigo-600 group-hover:bg-indigo-50'}
                `}>
                  <EditableText
                    value=""
                    tag="div"
                    placeholder="?"
                    className="font-black text-3xl text-zinc-900"
                  />
                </div>
              </div>

              {settings?.showClinicalNotes && section.clinicalMeta && (
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase text-zinc-400 tracking-tighter">KARMAŞIKLIK</span>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-1 h-3 rounded-full ${i < (section.clinicalMeta!.figureGroundComplexity / 2) ? 'bg-indigo-500' : 'bg-zinc-200'}`}></div>
                        ))}
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                    BİNME ORANI: %{Math.round(section.clinicalMeta.overlappingRatio * 100)}
                  </span>
                </div>
              )}
            </div>

            {/* Hidden Solution */}
            <div className="absolute bottom-3 right-10 opacity-0 group-hover:opacity-10 transition-opacity rotate-180 text-[8px] font-black select-none pointer-events-none text-zinc-900">
              ADET: {section.correctCount}
            </div>
          </EditableElement>
        ))}
      </div>

      {/* Alt Bilgi - Klinik Tracker */}
      <div className={`
        mt-auto p-6 print:p-2 rounded-t-[3.5rem] border-x-8 border-t-8 border-white flex justify-between items-center shadow-2xl mx-1
        ${isPremium ? 'bg-zinc-950 text-white' : 'bg-indigo-950 text-white'}
      `}>
        <div className="flex gap-12 items-center">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.4em] mb-1">
              KLİNİK PROTOKOL
            </span>
            <span className="text-sm font-black uppercase tracking-tight">Figür-Zemin & Görsel Ketleme</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
           <div className="text-right">
             <span className="block text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none">VİZYON ANALİZİ</span>
             <span className="text-[10px] font-black tracking-tighter opacity-70 uppercase">Oogmatik Vision Engine v3.5</span>
           </div>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${isPremium ? 'bg-zinc-900 border-zinc-800' : 'bg-indigo-900 border-indigo-800'}`}>
            <i className="fa-solid fa-crosshairs text-amber-400 text-lg"></i>
          </div>
        </div>
      </div>
    </div>
  );
};
