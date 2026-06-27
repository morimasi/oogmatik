import React from 'react';
import { VisualOddOneOutData, VisualOddOneOutItem, StyleSettings } from '../../../types';
import { PedagogicalHeader, SegmentDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const SvgFromPaths = ({ paths }: { paths: any[] }) => {
  if (!paths || paths.length === 0) return null;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full p-1" preserveAspectRatio="xMidYMid meet">
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill || 'none'}
          stroke={p.stroke || '#18181b'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};

const ComplexShapeRenderer = ({
  item,
  size = 80,
}: {
  item: VisualOddOneOutItem;
  size?: number;
}) => {
  if (!item) return null;

  return (
    <div
      className="transition-all duration-300 flex items-center justify-center p-1 overflow-hidden w-full h-full"
      style={{
        transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1}) ${item.isMirrored ? 'scaleX(-1)' : ''}`,
      }}
    >
      {item.svgPaths ? (
        <SvgFromPaths paths={item.svgPaths} />
      ) : item.svg ? (
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: item.svg }}
        />
      ) : item.label ? (
        <span
          className={`font-black text-zinc-900 select-none font-mono ${size < 40 ? 'text-lg' : 'text-4xl'}`}
        >
          {item.label}
        </span>
      ) : item.segments ? (
        <SegmentDisplay segments={item.segments} />
      ) : (
        <div className="w-8 h-8 border-2 border-zinc-200 rounded-full"></div>
      )}
    </div>
  );
};

export const VisualOddOneOutSheet = ({
  data,
  settings: globalSettings,
}: {
  data: VisualOddOneOutData;
  settings?: StyleSettings;
}) => {
  if (!data || !data.rows || (Array.isArray(data.rows) && data.rows.length === 0)) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-md">
        Geçersiz infografik verisi veya içerik yok.
      </div>
    );
  }

  const settings = data.settings;
  const isLandscape = globalSettings?.orientation === 'landscape';
  const aestheticMode = settings?.aestheticMode || 'premium';
  const isPremium = aestheticMode === 'premium' || aestheticMode === 'glassmorphism';
  const itemsPerRow = settings?.itemsPerRow || 6;
  const rowCount = data.rows.length;
  const difficulty = settings?.difficulty || 'intermediate';

  // Grid sütun sayısını ayarla: A4 sayfası için optimize edilmiş kompakt yapı
  const useTwoColumnLayout = rowCount > 12 && itemsPerRow <= 6;
  const gridCols = useTwoColumnLayout ? (isLandscape ? 'grid-cols-3' : 'grid-cols-2') : 'grid-cols-1';

  return (
    <div
      className={`
        flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 overflow-hidden professional-worksheet 
        p-8 print:p-4 transition-all duration-500
        ${aestheticMode === 'glassmorphism' ? 'bg-slate-50/50' : 'bg-white'}
      `}
    >
      <PedagogicalHeader
        title={data?.title || 'GÖRSEL AYRIŞTIRMA & DİKKAT TESTİ'}
        instruction={data?.instruction || 'Diğerlerinden farklı olan öğeyi bulup işaretleyin.'}
      />

      <div
        className={`grid ${gridCols} gap-x-4 gap-y-2 print:gap-x-2 print:gap-y-1.5 mt-6 print:mt-2 flex-1 content-start overflow-hidden`}
      >
        {(data.rows || []).map((row, i) => (
          <EditableElement
            key={i}
            className={`
                flex flex-col p-3 print:p-1.5 border-[1.5px] relative break-inside-avoid transition-all duration-300 group
                ${
                  aestheticMode === 'glassmorphism'
                    ? 'bg-white/70 backdrop-blur-md border-white shadow-sm rounded-2xl'
                    : isPremium
                    ? 'bg-zinc-50/50 border-zinc-100 rounded-xl hover:border-indigo-200'
                    : 'bg-white border-zinc-200 rounded-lg'
                }
            `}
          >
            {/* Üst Bilgi Satırı - Ultra Compact */}
            <div className="flex justify-between items-center mb-2 print:mb-1">
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-5 h-5 flex items-center justify-center font-black text-[9px] rounded-lg shadow-sm
                    ${isPremium ? 'bg-zinc-900 text-white' : 'bg-indigo-600 text-white'}
                  `}
                >
                  {i + 1}
                </div>
                {settings?.showClinicalNotes && row.clinicalMeta?.isMirrorTask && (
                   <span className="text-[6px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-tighter">
                     AYNA ETKİSİ
                   </span>
                )}
              </div>

              {settings?.showClinicalNotes && row.clinicalMeta?.discriminationFactor && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[6px] font-black text-zinc-400 uppercase tracking-widest">AYRIŞTIRMA</span>
                  <div className="w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                    <div 
                        className="h-full bg-indigo-500 transition-all duration-700" 
                        style={{ width: `${row.clinicalMeta.discriminationFactor * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* İçerik Izgarası - Dinamik Sütunlar */}
            <div
              className="grid gap-1.5 print:gap-1 items-center justify-items-center py-1"
              style={{ gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)` }}
            >
              {(row.items || []).map((item, j) => (
                <div key={j} className="flex flex-col items-center gap-1 w-full group/item">
                  <div
                    className={`
                        aspect-square w-full bg-white rounded-xl border-[1.5px] flex items-center justify-center transition-all
                        group-hover/item:border-indigo-400 group-hover/item:shadow-lg cursor-pointer relative
                        ${isPremium ? 'border-zinc-100' : 'border-zinc-200'}
                    `}
                  >
                    <ComplexShapeRenderer item={item} size={itemsPerRow > 7 ? 25 : 35} />
                    
                    {/* Seçim İşareti Alanı (Çıktıda görsel rehber) */}
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full border border-zinc-100 opacity-20"></div>
                  </div>
                  
                  {/* Klinik Tip: Alt kutucuk */}
                  <div className="w-3 h-1.5 rounded-full bg-zinc-100/50 border border-zinc-200/50 group-hover/item:bg-indigo-100 transition-colors"></div>
                </div>
              ))}
            </div>

            {/* Alt Klinik Not - Sadece Profesyonel Modda ve Alan Varsa */}
            {settings?.showClinicalNotes && row.reason && rowCount < 16 && (
                <div className="mt-1.5 flex items-center gap-2 opacity-40">
                    <div className="w-1 h-1 rounded-full bg-zinc-400"></div>
                    <span className="text-[6px] font-bold text-zinc-500 italic uppercase">
                        <EditableText value={row.reason} tag="span" />
                    </span>
                </div>
            )}
          </EditableElement>
        ))}
      </div>

      {/* Premium Footer - Ultra Sleek */}
      <div
        className={`
          mt-6 print:mt-2 px-6 print:px-4 py-4 print:py-2 rounded-3xl border border-white/20 flex justify-between items-center shadow-2xl relative overflow-hidden
          ${isPremium ? 'bg-zinc-900 text-white' : 'bg-indigo-950 text-white'}
        `}
      >
        {/* Dekoratif Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none"></div>

        <div className="flex gap-8 items-center relative z-10">
          <div className="flex flex-col">
            <span className="text-[6px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">
              KLİNİK PROTOKOL
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <i className="fa-solid fa-microchip text-indigo-400 text-sm"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-tight leading-none mb-0.5">
                  {settings?.itemType?.toUpperCase() || 'KARIŞIK'} TABLO ANALİZİ
                </span>
                <span className="text-[6px] font-bold text-zinc-500">ID: VIS-ODD-{rowCount}-{itemsPerRow}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[6px] font-black text-zinc-400 uppercase tracking-widest">DİNAMİK ÜRETİM AKTİF</span>
            </div>
            <span className="text-[9px] font-black tracking-tighter opacity-70 uppercase bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
              V2 Professional • {difficulty.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
