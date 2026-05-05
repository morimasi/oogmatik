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
      />

      <div
        className={`grid ${gridCols} gap-x-3 gap-y-4 print:gap-x-2 print:gap-y-2 mt-4 print:mt-1 flex-1 content-start pb-6 print:pb-2`}
      >
        {(data.rows || []).map((row, i) => (
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
                                    w-5 h-5 flex items-center justify-center font-black text-[9px] rounded-md shadow-sm transition-all group-hover:scale-110
                                    ${isPremium ? 'bg-zinc-900 text-white' : 'bg-indigo-600 text-white'}
                                `}
                >
                  {i + 1}
                </div>
                {row.clinicalMeta?.targetedError && settings?.showClinicalNotes && !isUltraFull && (
                  <span className="text-[5px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200">
                    {row.clinicalMeta.targetedError.replace('_', ' ')}
                  </span>
                )}
              </div>

              {settings?.showClinicalNotes && row.clinicalMeta?.cognitiveLoad && (
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-0.5 h-1 rounded-full ${idx < row.clinicalMeta!.cognitiveLoad! / 2 ? 'bg-amber-400' : 'bg-zinc-200'}`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-[4px] font-black text-zinc-400 uppercase">
                    %{row.clinicalMeta.cognitiveLoad * 10}
                  </span>
                </div>
              )}
            </div>

            <div
              className="grid grid-cols-4 gap-1.5 items-center justify-items-center py-0.5"
            >
              {(row.items || []).map((item, j) => (
                <div key={j} className="flex flex-col items-center gap-1 w-full max-w-[55px]">
                  <div
                    className={`
                                        aspect-square w-full bg-white rounded-lg border-[1px] flex items-center justify-center transition-all
                                        hover:border-indigo-500 hover:shadow-md cursor-pointer 
                                        ${isPremium ? 'border-zinc-100' : 'border-zinc-200'}
                                    `}
                  >
                    <ComplexShapeRenderer item={item} size={30} />
                  </div>
                  <div className="w-3 h-3 rounded border-[1px] border-zinc-100 flex items-center justify-center group-hover:border-indigo-200 transition-colors">
                    <div className="w-1 h-1 rounded-sm bg-zinc-50 group-hover:bg-indigo-400/20 transition-all"></div>
                  </div>
                </div>
              ))}
            </div>

            {settings?.showClinicalNotes && row.reason && !isUltraFull && (
              <div className="mt-1 pt-1 border-t border-dashed border-zinc-100 flex items-start">
                <p className="text-[6px] text-zinc-400 font-bold leading-tight uppercase italic">
                  <EditableText value={row.reason} tag="span" />
                </p>
              </div>
            )}
          </EditableElement>
        ))}
      </div>

      {/* Premium Footer */}
      <div
        className={`
                mt-auto px-8 print:px-4 py-5 print:py-2 rounded-[2.5rem] border-4 border-white flex justify-between items-center shadow-2xl
                ${isPremium ? 'bg-zinc-950 text-white' : 'bg-indigo-950 text-white'}
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
              PROFESYONEL ÖLÇEK
            </span>
            <span className="text-[9px] font-black tracking-tighter opacity-70 uppercase">
              Klinik Tanılama • Ultra Paket
            </span>
          </div>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isPremium ? 'bg-zinc-900 border-zinc-800' : 'bg-indigo-900 border-indigo-800'}`}
          >
            <i
              className={`fa-solid fa-shield-halved ${isPremium ? 'text-indigo-400' : 'text-zinc-500'} text-base`}
            ></i>
          </div>
        </div>
      </div>
    </div>
  );
};
