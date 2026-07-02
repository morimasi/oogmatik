import React from 'react';
import { Terminal, Compass, Route } from 'lucide-react';
import { DirectionalCodeReadingData } from '../../../types';
import { PedagogicalHeader } from '../common';

export const DirectionalCodeReadingSheet: React.FC<{ data: DirectionalCodeReadingData }> = ({ data }) => {
  // Veri yapısı hem 'data.puzzles' hem de 'data.content.puzzles' olabilir.
  const content = data?.content || (data as any);
  const puzzles = (data as any)?.puzzles || (content as any)?.puzzles || [];
  const settings = (data as any)?.settings || (content as any)?.settings;
  const cipherType = settings?.cipherType || 'arrows';
  const isMulti = puzzles.length > 1;

  // A4 Premium Compact Boyutları
  const A4_WIDTH = 210;
  const A4_HEIGHT = 297;
  const MARGIN_TOP = 15;
  const MARGIN_BOTTOM = 15;
  const MARGIN_LEFT = 12;
  const MARGIN_RIGHT = 12;

  return (
    <div className="flex flex-col w-full bg-white font-['Lexend'] text-zinc-900 border-none print:w-[210mm] print:h-[297mm] print:overflow-hidden relative px-[48px] py-[60px] print:px-[12mm] print:py-[15mm] professional-worksheet print:box-border">
      {/* Premium Üst Çizgi */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-100 print:opacity-100"></div>

      <PedagogicalHeader
        title={(data as any)?.title || (content as any)?.title || 'ŞİFRE VE ROTA MATRİSİ'}
        instruction={(data as any)?.instruction || (content as any)?.instruction || 'Başlangıç noktasından şifreli adımları takip ederek hedefe ulaş!'}
      />

      {/* Ana İçerik - Kompakt Grid */}
      <div className={`flex-1 grid ${isMulti ? 'grid-cols-1 md:grid-cols-2 mt-1 gap-4 print:gap-3' : 'grid-cols-1 mt-2 max-w-full w-full gap-3'} content-start h-full print:max-h-full`}>
        {puzzles.map((puzzle: any, pIdx: number) => {
          if (!puzzle || !puzzle.grid || !puzzle.grid[0]) return null;
          const gridRows = puzzle.grid.length;
          const gridCols = puzzle.grid[0].length;

          return (
            <div 
              key={pIdx} 
              className="flex flex-col border border-zinc-200 rounded-[1.5rem] bg-zinc-50/30 relative break-inside-avoid shadow-sm group hover:border-indigo-200 transition-colors h-full max-h-full overflow-hidden p-4 print:p-2.5"
            >
              {/* Kutu Başlığı - Daha Kompakt */}
              <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="w-6 h-6 print:w-5 print:h-5 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[11px] font-black shadow-sm uppercase">
                      {String.fromCharCode(65 + pIdx)}
                  </div>
                  <span className="text-[11px] print:text-[10px] font-black text-zinc-800 uppercase tracking-[0.18em]">{puzzle.title || `GÖREV ${pIdx + 1}`}</span>
                  <div className="flex-1 border-b border-zinc-200/70 border-dotted ml-1.5"></div>
              </div>

              {/* Rota Izgarası - Daha Kompakt */}
              <div className="relative flex flex-col items-center justify-center flex-1 bg-white rounded-2xl shadow-sm border border-zinc-100 min-h-[150px] print:min-h-[130px] overflow-visible pb-1.5 pt-1.5">
                  
                  {/* Sütun Etiketleri */}
                  <div className="flex justify-around items-center w-full px-6 pb-0.5 print:px-4">
                      {Array.from({ length: gridCols }).map((_, i) => (
                          <span key={`col-${i}`} className="text-[9px] print:text-[8px] font-bold text-zinc-400 uppercase w-full text-center tracking-wider">{String.fromCharCode(65 + i)}</span>
                      ))}
                  </div>
                  
                  <div className="w-full flex-1 flex flex-row px-1.5 print:px-1">
                      {/* Satır Etiketleri */}
                      <div className="flex flex-col justify-around items-center w-5 h-full py-0.5">
                          {Array.from({ length: gridRows }).map((_, i) => (
                              <span key={`row-${i}`} className="text-[9px] print:text-[8px] font-bold text-zinc-400 w-full text-center flex-1 flex items-center justify-center">{i + 1}</span>
                          ))}
                      </div>

                      {/* Asıl Grid */}
                      <div className="w-full h-full p-1.5 print:p-1 flex-1 flex">
                          <div 
                              className="w-full h-full grid border-2 border-zinc-900 bg-zinc-900 gap-[1px] shadow-sm rounded-lg overflow-hidden print:border-[1.5px] print:gap-[0.5px]"
                              style={{ 
                                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                                  gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`
                              }}
                          >
                              {puzzle.grid.map((row: any, r: number) => row.map((cell: any, c: number) => (
                                  <div 
                                      key={`${r}-${c}`} 
                                      className="bg-white flex items-center justify-center relative min-w-0 min-h-0"
                                  >
                                      {cell.type === 'start' && (
                                          <div className="w-[80%] h-[80%] bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-500 shadow-sm z-10">
                                              <span className="text-[11px] print:text-[10px]">⚡</span>
                                          </div>
                                      )}
                                      {cell.type === 'target' && (
                                          <div className="w-[80%] h-[80%] bg-amber-100 rounded-xl flex items-center justify-center border border-amber-500 shadow-sm z-10">
                                              <span className="text-[11px] print:text-[10px]">📍</span>
                                          </div>
                                      )}
                                      {cell.type === 'obstacle' && (
                                          <div className="text-[13px] print:text-[11px] opacity-65 z-10">
                                              {cell.icon || '⬛'}
                                          </div>
                                      )}
                                  </div>
                              )))}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Komut Paneli - Ultra Kompakt */}
              <div className="mt-3 bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 print:p-2 print:px-3 shadow-md relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute right-0 bottom-[-8px] opacity-[0.03] text-6xl transform -rotate-12 select-none pointer-events-none">
                      <Route />
                  </div>
                  
                  <div className="flex items-center gap-1.5 mb-2 print:mb-1.5 opacity-90 z-10">
                      <Terminal size={12} className="text-amber-400" />
                      <p className="text-[9px] print:text-[8px] font-black text-white uppercase tracking-[0.2em]">ALGORİTMA</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 print:gap-1 z-10">
                      {puzzle.instructions.map((ins: any, iIdx: number) => (
                          <div 
                              key={iIdx} 
                              className="bg-white/10 px-2 py-1 print:px-1.5 print:py-0.5 rounded-md flex items-center gap-1.5 border border-white/10 shadow-inner"
                          >
                              {cipherType === 'arrows' ? (
                                  <>
                                      <span className="text-[11px] print:text-[9px] font-black text-amber-400 w-2.5 text-center">{ins.count}</span>
                                      <span className="text-[13px] print:text-[11px] leading-none text-white">{ins.arrow}</span>
                                  </>
                              ) : (
                                  <span className="text-[10px] print:text-[8px] font-black tracking-tighter uppercase text-amber-400">{ins.coord}</span>
                              )}
                          </div>
                      ))}
                  </div>

                  {/* Alt Bilgi */}
                  <div className="mt-2.5 pt-2 print:mt-1.5 print:pt-1 border-t border-white/10 flex justify-between items-center z-10">
                      <div className="flex gap-4">
                          <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">Comp: <span className="text-zinc-300">{puzzle.clinicalMeta?.complexity?.toFixed(1) || '1.0'}</span></span>
                          <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">Adım: <span className="text-zinc-300">{puzzle.clinicalMeta?.totalSteps || '0'}</span></span>
                      </div>
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium Footer - Kompakt */}
      <div className="mt-3 p-4 print:p-2 bg-zinc-50 border border-zinc-200 rounded-[1.5rem] flex justify-between items-center shadow-sm shrink-0">
          <div className="flex gap-3 items-center">
              <div className="w-9 h-9 print:w-8 print:h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow border border-indigo-400">
                  <Compass className="text-white" size={18} />
              </div>
              <div className="flex flex-col">
                  <span className="text-[7px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-0.5">Spatial Engine</span>
                  <span className="text-[11px] print:text-[10px] font-black uppercase text-zinc-900 tracking-tight leading-none">Rota & Şifre Çözücü</span>
              </div>
          </div>
          <div className="flex flex-col items-end opacity-70">
              <span className="text-[7px] font-black uppercase tracking-[0.25em] text-zinc-400">READY</span>
              <span className="text-[9px] print:text-[8px] font-black text-zinc-900 tracking-widest">NAVI_OS V4</span>
          </div>
      </div>
    </div>
  );
};
