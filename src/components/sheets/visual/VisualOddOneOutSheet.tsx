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
  // Graceful fallback for invalid or missing data
  if (!data || !data.rows || (Array.isArray(data.rows) && data.rows.length === 0)) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-md">
        Geçersiz infografik verisi veya içerik yok. Lütfen içerik kaynağını kontrol edin.
      </div>
    );
  }
  const settings = data.settings;
  const isLandscape = globalSettings?.orientation === 'landscape';
  const isUltraFull = settings?.layout === 'ultra_full' || globalSettings?.compact;
  const isUltraDense = settings?.layout === 'ultra_dense' || isUltraFull;
  const isPremium =
    settings?.aestheticMode === 'premium' || settings?.aestheticMode === 'glassmorphism';

  // Grid sütun sayısını ayarla: A4 sayfası için optimize edilmiş kompakt yapı
  // 1 sütun: Geniş ferah, 2 sütun: Kompakt ve dolu dolu
  let gridCols = isUltraFull
    ? 'grid-cols-2'
    : isUltraDense
      ? 'grid-cols-2'
      : 'grid-cols-1';
  
  if (isLandscape) gridCols = isUltraFull ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div
      className={`
            flex flex-col min-h-full print:min-h-0 font-sans text-black overflow-visible professional-worksheet 
             p-6 print:p-2
            ${isPremium ? 'bg-slate-50/50' : 'bg-white'}
        `}
    >
      <PedagogicalHeader
        title={data?.title || 'GÖRSEL AYRIŞTIRMA & DİKKAT'}
        instruction={data?.instruction || 'Diğerlerinden farklı olan öğeyi bulup işaretleyin.'}
        note={data?.pedagogicalNote}
        data={data}
      />

      <div
        className={`grid ${gridCols} gap-x-3 gap-y-3 print:gap-x-1.5 print:gap-y-1.5 mt-4 print:mt-1 flex-1 content-start pb-6 print:pb-2`}
      >
        {(data.rows || []).map((row, i) => {
          const rowItemCount = row.items?.length || 4;
          const gridClass = rowItemCount <= 4 ? 'grid-cols-4' : rowItemCount <= 6 ? 'grid-cols-6' : 'grid-cols-8';
          
          return (
            <EditableElement
              key={i}
              className={`
                              flex flex-col p-3 print:p-1.5 border-[1.5px] relative break-inside-avoid transition-all duration-300 group
                              ${
                                isPremium
                                  ? 'bg-white/80 backdrop-blur-sm border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-400'
                                  : 'bg-zinc-50/30 border-zinc-100 rounded-xl hover:bg-white hover:border-zinc-200'
                              }
                          `}
            >
              {/* Üst Bilgi Satırı */}
              <div className="flex justify-between items-center mb-2 print:mb-0.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`
                                      w-4 h-4 flex items-center justify-center font-black text-[8px] rounded shadow-sm transition-all group-hover:scale-110
                                      ${isPremium ? 'bg-zinc-900 text-white' : 'bg-indigo-600 text-white'}
                                  `}
                  >
                    {i + 1}
                  </div>
                </div>

                {settings?.showClinicalNotes && row.clinicalMeta?.cognitiveLoad && !isUltraDense && (
                  <div className="flex items-center gap-1">
                    <span className="text-[4px] font-black text-zinc-400 uppercase">
                      L: {row.clinicalMeta.cognitiveLoad}
                    </span>
                  </div>
                )}
              </div>

              <div
                className={`grid ${gridClass} gap-1.5 print:gap-1 items-center justify-items-center py-0.5`}
              >
                {(row.items || []).map((item, j) => (
                  <div key={j} className="flex flex-col items-center gap-1 w-full">
                    <div
                      className={`
                                          aspect-square w-full bg-white rounded-lg border-[1px] flex items-center justify-center transition-all
                                          hover:border-indigo-500 hover:shadow-md cursor-pointer 
                                          ${isPremium ? 'border-zinc-100' : 'border-zinc-200'}
                                      `}
                    >
                      <ComplexShapeRenderer item={item} size={rowItemCount > 5 ? 24 : 36} />
                    </div>
                    {!isUltraDense && (
                      <div className="w-2.5 h-2.5 rounded-full border-[1px] border-zinc-100 flex items-center justify-center group-hover:border-indigo-200 transition-colors">
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </EditableElement>
          );
        })}
      </div>

      {/* Premium Footer - no-print in ultra dense */}
      <div
        className={`
                mt-auto px-8 print:px-4 py-5 print:py-2 rounded-[2.5rem] border-4 border-white flex justify-between items-center shadow-2xl
                ${isPremium ? 'bg-zinc-950 text-white' : 'bg-indigo-950 text-white'}
                ${isUltraDense ? 'print:hidden' : ''}
            `}
      >
        <div className="flex gap-8 items-center">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-1">
              PROGRAMMATİK ODAK
            </span>
            <div className="flex items-center gap-2">
              <i
                className={`fa-solid fa-microchip ${isPremium ? 'text-indigo-400' : 'text-zinc-400'}`}
              ></i>
              <span className="text-xs font-black tracking-tight">
                {settings?.subType?.replace('_', ' ').toUpperCase() || 'GÖRSEL AYRIŞTIRMA TESTİ'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-[6px] font-black text-zinc-500 uppercase tracking-widest leading-none">
              A4 OPTIMIZE
            </span>
            <span className="text-[9px] font-black tracking-tighter opacity-70 uppercase">
              {data.rows.length} GÖREV • {settings?.itemType?.toUpperCase()} MODU
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
