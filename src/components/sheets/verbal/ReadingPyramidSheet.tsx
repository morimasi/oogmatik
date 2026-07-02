import React from 'react';
import { ReadingPyramidData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ReadingPyramidSheet = ({ data, settings: globalSettings }: { data: ReadingPyramidData; settings?: any }) => {
  const { settings } = data;
  const count = data.pyramids?.length || 0;
  
  // Layout ayarları
  const isCompact = settings?.layoutDensity === 'compact';
  const gridClass = isCompact 
    ? (count > 2 ? 'grid-cols-2' : 'grid-cols-1') 
    : 'grid-cols-1';
  
  const gapClass = settings?.layoutDensity === 'relaxed' ? 'gap-12 mt-8' : (isCompact ? 'gap-4 mt-2' : 'gap-8 mt-4');
  
  // Renk paleti haritası
  const paletteMap: Record<string, { bg: string; border: string; text: string; header: string }> = {
    indigo: { bg: 'bg-indigo-50/30', border: 'border-indigo-100', text: 'text-indigo-900', header: 'bg-indigo-600' },
    rose: { bg: 'bg-rose-50/30', border: 'border-rose-100', text: 'text-rose-900', header: 'bg-rose-600' },
    emerald: { bg: 'bg-emerald-50/30', border: 'border-emerald-100', text: 'text-emerald-900', header: 'bg-emerald-600' },
    amber: { bg: 'bg-amber-50/30', border: 'border-amber-100', text: 'text-amber-900', header: 'bg-amber-600' },
    slate: { bg: 'bg-slate-50/30', border: 'border-slate-200', text: 'text-slate-900', header: 'bg-slate-700' },
    colorful: { bg: 'bg-indigo-50/30', border: 'border-indigo-100', text: 'text-zinc-800', header: 'bg-zinc-900' }
  };

  const currentPalette = paletteMap[settings?.colorPalette || 'slate'] || paletteMap.slate;

  // Font boyutu haritası
  const fontMap: Record<string, string> = {
    small: 'text-sm print:text-[10px]',
    medium: 'text-lg print:text-sm',
    large: 'text-2xl print:text-lg',
    xl: 'text-4xl print:text-2xl'
  };

  const fontSizeClass = fontMap[settings?.fontSize || 'medium'] || fontMap.medium;

  return (
    <div className={`flex flex-col bg-white p-3 print:p-2 font-lexend text-black overflow-hidden h-full min-h-[297mm]`}>
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
      />

      <div className={`grid ${gridClass} gap-4 print:gap-2 mt-3 print:mt-2 content-start flex-grow overflow-visible`}>
        {(data.pyramids || []).map((pyramid: any, pIdx: number) => {
            // Renkli modda her piramit farklı renk alabilir veya seçilen rengi kullanır
            const palette = settings?.colorPalette === 'colorful' 
                ? Object.values(paletteMap)[pIdx % (Object.values(paletteMap).length - 1)] 
                : currentPalette;

            return (
                <EditableElement key={pIdx} className={`flex flex-col items-center break-inside-avoid border ${palette.border} rounded-xl p-3 print:p-1.5 shadow-sm bg-white`}>
                    <div className={`${palette.header} text-white px-4 py-0.5 rounded-full font-black text-[8px] uppercase tracking-widest mb-3 shadow-md`}>
                        <EditableText value={pyramid.title} tag="span" />
                    </div>

                    <div className={`flex flex-col items-center gap-0.5 print:gap-0.3 w-full`}>
                        {pyramid.levels.map((line: string, lIdx: number) => {
                            const isLast = lIdx === pyramid.levels.length - 1;
                            return (
                                <div
                                    key={lIdx}
                                    className={`
                                        py-0.5 px-3 rounded-lg text-center border transition-all hover:bg-zinc-50
                                        ${isLast ? palette.bg + ' ' + palette.border + ' shadow-inner font-black' : 'bg-white border-transparent'}
                                        w-fit min-w-[25%]
                                    `}
                                >
                                    <p className={`${fontSizeClass} ${isLast ? palette.text : 'text-zinc-600'} leading-snug tracking-tight`}>
                                        <EditableText value={line} tag="span" />
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </EditableElement>
            );
        })}
      </div>

      <div className="mt-auto pt-3 border-t border-zinc-200 flex justify-between items-center px-2 opacity-35">
        <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
            <p className="text-[7px] text-zinc-400 font-black uppercase tracking-[0.25em]">
                {data.difficulty} Seviye • {settings?.pyramidHeight} Basamak
            </p>
        </div>
        <p className="text-[6px] text-zinc-300 font-bold italic">
            bdmind • Akıcı Okuma
        </p>
      </div>
    </div>
  );
};
