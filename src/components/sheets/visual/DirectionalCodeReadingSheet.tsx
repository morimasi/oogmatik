import React from 'react';
import { Terminal, Compass, Route } from 'lucide-react';
import { DirectionalCodeReadingData } from '../../../types';
import { PedagogicalHeader } from '../common';

export const DirectionalCodeReadingSheet: React.FC<{ data: DirectionalCodeReadingData }> = ({ data }) => {
  // Veri yapısı hem 'data.puzzles' hem de 'data.content.puzzles' olabilir.
  // Legacy ve yeni yapıları desteklemek için esnek davranıyoruz.
  const content = data?.content || (data as any);
  const puzzles = (data as any)?.puzzles || (content as any)?.puzzles || [];
  const settings = (data as any)?.settings || (content as any)?.settings;
  const cipherType = settings?.cipherType || 'arrows';
  
  // Eğer birden fazla puzzle (izgara) varsa yerleşimi paylaştır.
  const isMulti = puzzles.length > 1;

  return (
    <div className="flex flex-col w-full bg-white font-['Lexend'] text-zinc-900 border-none print:w-[210mm] print:h-[296mm] print:overflow-hidden relative px-10 py-8 print:px-6 print:py-5 professional-worksheet">
      {/* Dekoratif Premium Arka Plan Çizgisi */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-t-lg opacity-80 print:opacity-100"></div>

      <PedagogicalHeader
        title={(data as any)?.title || (content as any)?.title || 'ŞİFRE VE ROTA MATRİSİ'}
        instruction={(data as any)?.instruction || (content as any)?.instruction || 'Yönerge kutusundaki kodları analiz et, rotayı zihninde canlandır ve bitiş noktasına ulaş.'}
        note={(data as any)?.pedagogicalNote || (content as any)?.pedagogicalNote}
      />

      <div className={`flex-1 grid ${isMulti ? 'grid-cols-2 mt-2 gap-6 print:gap-4' : 'grid-cols-1 mt-4 max-w-4xl mx-auto w-full gap-6'} content-start h-full print:max-h-full`}>
        {puzzles.map((puzzle: any, pIdx: number) => {
          if (!puzzle || !puzzle.grid || !puzzle.grid[0]) return null;
          const gridRows = puzzle.grid.length;
          const gridCols = puzzle.grid[0].length;

          return (
            <div 
              key={pIdx} 
              className="flex flex-col border border-zinc-200 rounded-[2.5rem] bg-zinc-50/40 relative break-inside-avoid shadow-sm group hover:border-indigo-200 transition-colors h-full max-h-full overflow-hidden p-5 print:p-3"
            >
              {/* Kutu Başlığı */}
              <div className="flex items-center gap-3 mb-3 px-2">
                  <div className="w-8 h-8 print:w-7 print:h-7 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-[12px] font-black shadow-md uppercase">
                      {String.fromCharCode(65 + pIdx)}
                  </div>
                  <span className="text-[12px] print:text-[11px] font-black text-zinc-800 uppercase tracking-[0.2em]">{puzzle.title || `GÖREV ${pIdx + 1}`}</span>
                  <div className="flex-1 border-b-[2px] border-zinc-200/60 border-dotted ml-2"></div>
              </div>

              {/* Rota Izgarası Saha Gövdesi */}
              <div className="relative flex flex-col items-center justify-center flex-1 bg-white rounded-3xl shadow-sm border-[1.5px] border-zinc-100 min-h-[180px] overflow-visible pb-2 pt-2">
                  
                  {/* Sütun Etiketleri (A, B, C...) */}
                  <div className="flex justify-around items-center w-full px-8 pb-1 print:px-6">
                      {Array.from({ length: gridCols }).map((_, i) => (
                          <span key={`col-${i}`} className="text-[10px] print:text-[9px] font-bold text-zinc-400 uppercase w-full text-center tracking-widest">{String.fromCharCode(65 + i)}</span>
                      ))}
                  </div>
                  
                  <div className="w-full flex-1 flex flex-row px-2">
                      {/* Satır Etiketleri (1, 2, 3...) */}
                      <div className="flex flex-col justify-around items-center w-6 h-full py-1">
                          {Array.from({ length: gridRows }).map((_, i) => (
                              <span key={`row-${i}`} className="text-[10px] print:text-[9px] font-bold text-zinc-400 w-full text-center flex-1 flex items-center justify-center">{i + 1}</span>
                          ))}
                      </div>

                      {/* Asıl Grid (Matrix) */}
                      <div className="w-full h-full p-2 flex-1 flex">
                          <div 
                              className="w-full h-full grid border-2 border-zinc-900 bg-zinc-900 gap-[1.5px] shadow-sm rounded-xl overflow-hidden print:border-[1.5px] print:gap-[1px]"
                              style={{ 
                                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                                  gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`
                              }}
                          >
                              {puzzle.grid.map((row: any, r: number) => row.map((cell: any, c: number) => (
                                  <div 
                                      key={`${r}-${c}`} 
                                      className="bg-white flex items-center justify-center relative min-w-0 min-h-0 group-hover:bg-indigo-50/10 transition-colors"
                                  >
                                      {cell.type === 'start' && (
                                          <div className="w-[85%] h-[85%] bg-emerald-100 rounded-2xl flex items-center justify-center border-2 print:border-[1.5px] border-emerald-500 shadow-sm z-10">
                                              <span className="text-[12px] print:text-[10px] translate-y-[1px]">⚡</span>
                                          </div>
                                      )}
                                      {cell.type === 'target' && (
                                          <div className="w-[85%] h-[85%] bg-amber-100 rounded-2xl flex items-center justify-center border-2 print:border-[1.5px] border-amber-500 shadow-sm z-10">
                                              <span className="text-[12px] print:text-[10px] translate-y-[1px]">📍</span>
                                          </div>
                                      )}
                                      {cell.type === 'obstacle' && (
                                          <div className="text-[15px] print:text-[12px] opacity-70 z-10 filter grayscale contrast-125">
                                              {cell.icon || '⬛'}
                                          </div>
                                      )}
                                  </div>
                              )))}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Komut (Algoritma) Paneli - Kompakt */}
              <div className="mt-4 bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-5 print:p-3 print:px-4 shadow-xl relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute right-0 bottom-[-10px] opacity-[0.03] text-8xl transform -rotate-12 select-none pointer-events-none">
                      <Route />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 print:mb-2 opacity-90 z-10">
                      <Terminal size={14} className="text-amber-400 print:w-3" />
                      <p className="text-[10px] print:text-[9px] font-black text-white uppercase tracking-[0.25em]">SİSTEM ALGORİTMASI</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 print:gap-1.5 z-10">
                      {puzzle.instructions.map((ins: any, iIdx: number) => (
                          <div 
                              key={iIdx} 
                              className="bg-white/10 px-2.5 py-1.5 print:px-2 print:py-1 rounded-lg flex items-center gap-2 border border-white/10 shadow-inner"
                          >
                              {cipherType === 'arrows' ? (
                                  <>
                                      <span className="text-[12px] print:text-[10px] font-black text-amber-400 w-3 text-center">{ins.count}</span>
                                      <span className="text-[14px] print:text-[12px] leading-none text-white">{ins.arrow}</span>
                                  </>
                              ) : (
                                  <span className="text-[11px] print:text-[9px] font-black tracking-tighter uppercase text-amber-400">{ins.coord}</span>
                              )}
                          </div>
                      ))}
                  </div>

                  {/* Klinik Veri Alt Çubuğu */}
                  <div className="mt-4 pt-3 print:mt-2 print:pt-2 border-t-[1.5px] border-white/10 flex justify-between items-center z-10">
                      <div className="flex gap-6">
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Complex: <span className="text-zinc-300">{puzzle.clinicalMeta?.complexity?.toFixed(1) || '1.0'}</span></span>
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Steps: <span className="text-zinc-300">{puzzle.clinicalMeta?.totalSteps || '0'}</span></span>
                      </div>
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kompakt Premium Footer */}
      <div className="mt-4 p-5 print:p-3 bg-zinc-50 border-[1.5px] border-zinc-200 rounded-[2.5rem] flex justify-between items-center shadow-sm shrink-0">
          <div className="flex gap-4 items-center">
              <div className="w-12 h-12 print:w-10 print:h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg border border-indigo-400">
                  <Compass className="text-white print:w-5" size={24} />
              </div>
              <div className="flex flex-col">
                  <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.25em] mb-0.5">Visuo-Spatial Engine</span>
                  <span className="text-sm print:text-[11px] font-black uppercase text-zinc-900 tracking-tight leading-none">Rota & Şifre Çözücü Algoritma</span>
              </div>
          </div>
          <div className="flex flex-col items-end opacity-70">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">SYSTEM READY</span>
              <span className="text-[10px] print:text-[9px] font-black text-zinc-900 tracking-widest">NAVI_OS // V4.0</span>
          </div>
      </div>
    </div>
  );
};
