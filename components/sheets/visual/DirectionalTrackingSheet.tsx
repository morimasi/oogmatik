import React from 'react';
import { DirectionalTrackingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

// Fix: Typed as React.FC to handle React-specific props like 'key' in maps
const ArrowIcon = ({ dir, compact = false }: { dir: string, compact?: boolean }) => {
    const rotations: Record<string, number> = {
        'right': 0,
        'down': 90,
        'left': 180,
        'up': 270
    };

    return (
        <div className={`${compact ? 'w-6 h-6 rounded-lg' : 'w-8 h-8 rounded-xl'} flex items-center justify-center bg-white shadow-sm border-2 border-zinc-200 group-hover:scale-110 transition-transform relative`}>
            <div className={`absolute inset-0 bg-amber-400 opacity-0 group-hover:opacity-10 ${compact ? 'rounded-lg' : 'rounded-xl'} transition-opacity`}></div>
            <i className={`fa-solid fa-arrow-right text-zinc-800 ${compact ? 'text-[10px]' : 'text-sm'}`} style={{ transform: `rotate(${rotations[dir] || 0}deg)` }}></i>
        </div>
    );
};

export const DirectionalTrackingSheet = ({ data }: { data: DirectionalTrackingData }) => {
    const settings = data?.settings;
    const puzzles = data?.puzzles || [];
    const layout = settings?.layout || 'single';

    // Premium dynamic grid layout depending on the item count
    const gridCols = layout === 'grid_2x1' ? 'grid-cols-1' : (layout === 'grid_compact' ? 'grid-cols-2' : 'grid-cols-1');
    const isSingle = puzzles.length === 1;
    const isCompact = layout === 'grid_compact';

    return (
        <div className="flex flex-col h-full bg-white font-sans text-black overflow-hidden professional-worksheet">
            <PedagogicalHeader
                title={data?.title || "YÖNSEL İZ SÜRME & ŞİFRE ÇÖZÜCÜ"}
                instruction={data?.instruction || "İşaretli başlangıç vektöründen okların yönünü adım adım takip edin ve bulduğunuz karakterleri sırasıyla şifre alanına yazın."}
                note={data?.pedagogicalNote}
            />

            <div className={`grid ${gridCols} ${isSingle ? 'gap-12 print:gap-6 mt-8' : (isCompact ? 'gap-4 print:gap-2 mt-4' : 'gap-8 print:gap-6 mt-6')} flex-1 content-start items-start pb-6`}>
                {puzzles.map((puzzle, idx) => {
                    const rows = puzzle.grid.length;
                    const cols = puzzle.grid[0].length;
                    
                    // Dynamic sizing based on layout
                    const cellSize = isSingle ? (cols > 8 ? 'w-14 h-14 text-2xl' : 'w-16 h-16 text-3xl') : 
                                     isCompact ? (cols > 8 ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs') :
                                     (cols > 8 ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg');

                    return (
                        <EditableElement
                            key={idx}
                            className={`flex flex-col border-2 border-zinc-900 ${isCompact ? 'rounded-[2rem] p-4 print:p-2' : 'rounded-[2.5rem] p-6 print:p-4'} bg-white group relative shadow-[4px_4px_0_#18181b] break-inside-avoid transition-all ${isSingle ? 'h-full min-h-[600px] max-w-4xl mx-auto w-full' : ''}`}
                        >
                            {/* Bulmaca Başlığı */}
                            <div className={`absolute ${isCompact ? '-top-3 left-6 px-3 py-1 text-[8px]' : '-top-4 left-8 px-4 py-1.5 text-[10px]'} bg-amber-400 text-black rounded-xl font-black uppercase tracking-[0.2em] z-10 border-2 border-zinc-900 shadow-[2px_2px_0_#18181b]`}>
                                {puzzle.title || `ŞİFRE BLOĞU 0${idx + 1}`}
                            </div>

                            <div className={`flex ${isSingle ? 'flex-col lg:flex-row gap-12 print:gap-8' : (isCompact ? 'flex-col gap-4' : 'flex-col lg:flex-row gap-8 print:gap-6')} items-center h-full w-full justify-center`}>
                                
                                {/* Sol: Grid Sahası */}
                                <div className="relative shrink-0 flex flex-col items-center">
                                    <div className={`bg-zinc-50 ${isCompact ? 'p-3 print:p-2 rounded-2xl' : 'p-6 print:p-4 rounded-[2rem]'} border-2 border-zinc-200 relative`}>
                                        
                                        {/* Koordinat Harfleri (Üst) */}
                                        <div className={`flex ${isCompact ? 'mb-1 ml-4' : 'mb-2 ml-6'}`}>
                                            {puzzle.grid[0].map((_, c) => (
                                                <span key={c} className={`${cellSize.split(' ')[0]} ${isCompact ? 'text-[8px]' : 'text-[10px]'} font-black text-zinc-400 text-center uppercase`}>{String.fromCharCode(65 + c)}</span>
                                            ))}
                                        </div>
                                        
                                        <div className="flex">
                                            {/* Koordinat Sayıları (Sol) */}
                                            <div className={`flex flex-col justify-around ${isCompact ? 'mr-1' : 'mr-2'}`}>
                                                {puzzle.grid.map((_, r) => (
                                                    <span key={r} className={`${cellSize.split(' ')[1]} ${isCompact ? 'text-[8px]' : 'text-[10px]'} font-black text-zinc-400 flex items-center justify-center`}>{r + 1}</span>
                                                ))}
                                            </div>
                                            
                                            {/* Grid Cells */}
                                            <div className="grid bg-zinc-200 gap-px border-2 border-zinc-900 rounded-xl overflow-hidden shadow-inner" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                                                {puzzle.grid.flatMap((row, r) => row.map((cell, c) => {
                                                    const isStart = r === puzzle.startPos.r && c === puzzle.startPos.c;
                                                    return (
                                                        <div
                                                            key={`${r}-${c}`}
                                                            className={`${cellSize} bg-white flex items-center justify-center font-black relative ${isStart ? 'text-white' : 'text-zinc-800'} transition-all`}
                                                        >
                                                            {isStart && <div className="absolute inset-0 bg-indigo-600 rounded-lg scale-90 border-2 border-indigo-900"></div>}
                                                            <span className="relative z-10">{cell}</span>
                                                            
                                                            {/* Crosshairs Effect on hover */}
                                                            <div className="absolute inset-0 border-2 border-amber-400 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                                                        </div>
                                                    );
                                                }))}
                                            </div>
                                        </div>

                                        {/* Başlangıç Vektörü Pin */}
                                        <div className={`absolute ${isCompact ? '-left-3 top-1/2 px-2 py-1 text-[7px]' : '-left-4 top-1/2 px-3 py-2 text-[10px]'} -translate-y-1/2 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest border-2 border-white shadow-lg -rotate-90 origin-center whitespace-nowrap`}>
                                            BAŞLANGIÇ: {String.fromCharCode(65 + puzzle.startPos.c)}{puzzle.startPos.r + 1}
                                        </div>
                                    </div>
                                </div>

                                {/* Sağ: Yörünge ve Çıktı */}
                                <div className={`flex flex-col ${isSingle ? 'flex-1 w-full justify-center gap-10' : (isCompact ? 'w-full gap-3' : 'flex-1 w-full gap-6')}`}>
                                    
                                    {/* Yönerge Alanı */}
                                    <div className={`bg-zinc-100/80 border-2 border-zinc-200 ${isCompact ? 'rounded-2xl p-3' : 'rounded-[2rem] p-6'} relative`}>
                                        <div className={`flex items-center gap-3 ${isCompact ? 'mb-2 pb-2' : 'mb-4 pb-3'} border-b border-zinc-300`}>
                                            <div className={`${isCompact ? 'w-6 h-6 text-xs' : 'w-8 h-8'} rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center`}><i className="fa-solid fa-route"></i></div>
                                            <div>
                                                <h5 className={`${isCompact ? 'text-[8px]' : 'text-[10px]'} font-black text-zinc-500 uppercase tracking-widest`}>Yörünge Protokolü</h5>
                                                <p className={`${isCompact ? 'text-[8px]' : 'text-[10px]'} font-bold text-zinc-400`}>{puzzle.path.length} Adım</p>
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap ${isCompact ? 'gap-1' : 'gap-2'} items-center`}>
                                            {puzzle.path.map((dir, dIdx) => (
                                                <ArrowIcon key={dIdx} dir={dir} compact={isCompact} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Çıktı Alanı */}
                                    <div className="flex flex-col">
                                        <div className="flex justify-between items-end mb-2 px-2">
                                            <span className={`${isCompact ? 'text-[8px]' : 'text-[10px]'} font-black text-indigo-600 uppercase tracking-[0.2em]`}>Deşifre Edilen Kod:</span>
                                            {settings?.showClinicalNotes && puzzle.clinicalMeta && !isCompact && (
                                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded-md">Bilişsel Yük: %{Math.round(puzzle.clinicalMeta.perceptualLoad * 100)}</span>
                                            )}
                                        </div>
                                        {/* Blank Boxes for the Answer based on start char + path length */}
                                        <div className={`flex gap-2 w-full justify-between items-center bg-white border-2 border-zinc-200 ${isCompact ? 'p-2 rounded-xl' : 'p-3 rounded-2xl'} shadow-inner`}>
                                            {Array.from({ length: puzzle.path.length + 1 }).map((_, i) => (
                                                <div key={i} className={`flex-1 aspect-square ${isCompact ? 'max-w-[2rem] border-b-2 rounded-t-lg' : 'max-w-[3rem] border-b-4 rounded-t-xl'} border-zinc-800 bg-zinc-50 flex items-center justify-center`}>
                                                    <EditableText value="" tag="div" placeholder="?" className={`font-black ${isCompact ? 'text-lg' : 'text-2xl'} text-zinc-300`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gizli Çözüm (Ters) */}
                            <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-10 transition-opacity rotate-180 text-[10px] font-black select-none pointer-events-none bg-black text-white px-2 py-1 rounded">
                                ANS: {puzzle.targetWord}
                            </div>
                        </EditableElement>
                    );
                })}
            </div>

            {/* Footer Protokolü - Minimalist */}
            <div className="mt-auto pt-4 border-t-2 border-zinc-100 flex justify-between items-center px-4 print:px-0">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">KLİNİK MODÜL</span>
                    <span className="text-xs font-bold text-zinc-400">Yönsel Kodlama ve Bellek</span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-zinc-100 flex items-center justify-center opacity-50">
                    <i className="fa-solid fa-crosshairs text-zinc-400"></i>
                </div>
            </div>
        </div>
    );
};

  return (
    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm border-2 border-zinc-200 group-hover:scale-110 transition-transform relative">
      <div className="absolute inset-0 bg-amber-400 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
      <i
        className="fa-solid fa-arrow-right text-zinc-800 text-sm"
        style={{ transform: `rotate(${rotations[dir] || 0}deg)` }}
      ></i>
    </div>
  );
};

export const DirectionalTrackingSheet = ({ data }: { data: DirectionalTrackingData }) => {
  const settings = data?.settings;
  const puzzles = data?.puzzles || [];
  const layout = settings?.layout || 'single';

  // Premium dynamic grid layout depending on the item count
  const gridCols =
    layout === 'grid_2x1'
      ? 'grid-cols-1 md:grid-cols-2'
      : layout === 'grid_compact'
        ? 'grid-cols-2'
        : 'grid-cols-1';
  const isSingle = puzzles.length === 1;

  return (
    <div className="flex flex-col h-full bg-white font-sans text-black overflow-hidden professional-worksheet">
      <PedagogicalHeader
        title={data?.title || 'YÖNSEL İZ SÜRME & ŞİFRE ÇÖZÜCÜ'}
        instruction={
          data?.instruction ||
          'İşaretli başlangıç vektöründen okların yönünü adım adım takip edin ve bulduğunuz karakterleri sırasıyla şifre alanına yazın.'
        }
        note={data?.pedagogicalNote}
      />

      <div
        className={`grid ${gridCols} ${isSingle ? 'gap-12 print:gap-6 mt-8' : 'gap-6 print:gap-4 mt-6'} flex-1 content-start items-start pb-6`}
      >
        {puzzles.map((puzzle, idx) => {
          const rows = puzzle.grid.length;
          const cols = puzzle.grid[0].length;

          // Dynamic sizing based on layout
          const cellSize = isSingle
            ? cols > 8
              ? 'w-14 h-14 text-2xl'
              : 'w-16 h-16 text-3xl'
            : cols > 8
              ? 'w-8 h-8 text-sm'
              : 'w-10 h-10 text-lg';

          return (
            <EditableElement
              key={idx}
              className={`flex flex-col border-2 border-zinc-900 rounded-[2.5rem] bg-white group p-6 print:p-4 relative shadow-[4px_4px_0_#18181b] break-inside-avoid transition-all ${isSingle ? 'h-full min-h-[600px] max-w-4xl mx-auto w-full' : ''}`}
            >
              {/* Bulmaca Başlığı */}
              <div className="absolute -top-4 left-8 px-4 py-1.5 bg-amber-400 text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] z-10 border-2 border-zinc-900 shadow-[2px_2px_0_#18181b]">
                {puzzle.title || `ŞİFRE BLOĞU 0${idx + 1}`}
              </div>

              <div
                className={`flex ${isSingle ? 'flex-col lg:flex-row gap-12 print:gap-8' : 'flex-col gap-6'} items-center h-full w-full justify-center`}
              >
                {/* Sol: Grid Sahası */}
                <div className="relative shrink-0 flex flex-col items-center">
                  <div className="bg-zinc-50 p-6 print:p-4 rounded-[2rem] border-2 border-zinc-200 relative">
                    {/* Koordinat Harfleri (Üst) */}
                    <div className="flex mb-2 ml-6">
                      {puzzle.grid[0].map((_, c) => (
                        <span
                          key={c}
                          className={`${cellSize.split(' ')[0]} text-[10px] font-black text-zinc-400 text-center uppercase`}
                        >
                          {String.fromCharCode(65 + c)}
                        </span>
                      ))}
                    </div>

                    <div className="flex">
                      {/* Koordinat Sayıları (Sol) */}
                      <div className="flex flex-col mr-2 justify-around">
                        {puzzle.grid.map((_, r) => (
                          <span
                            key={r}
                            className={`${cellSize.split(' ')[1]} text-[10px] font-black text-zinc-400 flex items-center justify-center`}
                          >
                            {r + 1}
                          </span>
                        ))}
                      </div>

                      {/* Grid Cells */}
                      <div
                        className="grid bg-zinc-200 gap-px border-2 border-zinc-900 rounded-xl overflow-hidden shadow-inner"
                        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                      >
                        {puzzle.grid.flatMap((row, r) =>
                          row.map((cell, c) => {
                            const isStart = r === puzzle.startPos.r && c === puzzle.startPos.c;
                            return (
                              <div
                                key={`${r}-${c}`}
                                className={`${cellSize} bg-white flex items-center justify-center font-black relative ${isStart ? 'text-white' : 'text-zinc-800'} transition-all`}
                              >
                                {isStart && (
                                  <div className="absolute inset-0 bg-indigo-600 rounded-lg scale-90 border-2 border-indigo-900"></div>
                                )}
                                <span className="relative z-10">{cell}</span>

                                {/* Crosshairs Effect on hover */}
                                <div className="absolute inset-0 border-2 border-amber-400 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Başlangıç Vektörü Pin */}
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 bg-zinc-900 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-white shadow-lg -rotate-90 origin-center whitespace-nowrap">
                      BAŞLANGIÇ: {String.fromCharCode(65 + puzzle.startPos.c)}
                      {puzzle.startPos.r + 1}
                    </div>
                  </div>
                </div>

                {/* Sağ: Yörünge ve Çıktı */}
                <div
                  className={`flex flex-col ${isSingle ? 'flex-1 w-full justify-center gap-10' : 'w-full gap-6'}`}
                >
                  {/* Yönerge Alanı */}
                  <div className="bg-zinc-100/80 border-2 border-zinc-200 rounded-[2rem] p-6 relative">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-300">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                        <i className="fa-solid fa-route"></i>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          Yörünge Protokolü
                        </h5>
                        <p className="text-[10px] font-bold text-zinc-400">
                          {puzzle.path.length} Adım
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {puzzle.path.map((dir, dIdx) => (
                        <ArrowIcon key={dIdx} dir={dir} />
                      ))}
                    </div>
                  </div>

                  {/* Çıktı Alanı */}
                  <div className="flex flex-col">
                    <div className="flex justify-between items-end mb-3 px-2">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                        Deşifre Edilen Kod:
                      </span>
                      {settings?.showClinicalNotes && puzzle.clinicalMeta && (
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded-md">
                          Bilişsel Yük: %{Math.round(puzzle.clinicalMeta.perceptualLoad * 100)}
                        </span>
                      )}
                    </div>
                    {/* Blank Boxes for the Answer based on start char + path length */}
                    <div className="flex gap-2 w-full justify-between items-center bg-white border-2 border-zinc-200 p-3 rounded-2xl shadow-inner">
                      {Array.from({ length: puzzle.path.length + 1 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 aspect-square max-w-[3rem] border-b-4 border-zinc-800 bg-zinc-50 rounded-t-xl flex items-center justify-center"
                        >
                          <EditableText
                            value=""
                            tag="div"
                            placeholder="?"
                            className="font-black text-2xl text-zinc-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gizli Çözüm (Ters) */}
              <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-10 transition-opacity rotate-180 text-[10px] font-black select-none pointer-events-none bg-black text-white px-2 py-1 rounded">
                ANS: {puzzle.targetWord}
              </div>
            </EditableElement>
          );
        })}
      </div>

      {/* Footer Protokolü - Minimalist */}
      <div className="mt-auto pt-4 border-t-2 border-zinc-100 flex justify-between items-center px-4 print:px-0">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">
            KLİNİK MODÜL
          </span>
          <span className="text-xs font-bold text-zinc-400">Yönsel Kodlama ve Bellek</span>
        </div>
        <div className="w-12 h-12 rounded-full border-4 border-zinc-100 flex items-center justify-center opacity-50">
          <i className="fa-solid fa-crosshairs text-zinc-400"></i>
        </div>
      </div>
    </div>
  );
};
