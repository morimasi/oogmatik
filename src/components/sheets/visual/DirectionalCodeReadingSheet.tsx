import React from 'react';
import { DirectionalCodeReadingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import * as LucideIcons from 'lucide-react';

export const DirectionalCodeReadingSheet: React.FC<{ data: DirectionalCodeReadingData }> = ({ data }) => {
  const puzzles = data?.puzzles || [];
  const settings = data?.settings;
  const cipherType = settings?.cipherType || 'arrows';

  return (
    <div className="flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white p-8 print:p-4 overflow-hidden professional-worksheet relative">
      <PedagogicalHeader
        title={data?.title || 'ŞİFRE VE ROTA MATRİSİ'}
        instruction={data?.instruction || 'Yönerge kutusundaki kodları takip ederek başlangıçtan bitişe ulaş.'}
        note={data?.pedagogicalNote}
      />

      <div className={`flex-1 grid ${puzzles.length > 1 ? 'grid-cols-2 mt-4' : 'grid-cols-1 mt-8'} gap-8 print:gap-4 content-stretch`}>
        {puzzles.map((puzzle, pIdx) => {
          const gridRows = puzzle.grid.length;
          const gridCols = puzzle.grid[0].length;

          return (
            <div 
              key={pIdx} 
              className="flex flex-col p-6 print:p-3 border-2 border-zinc-200 rounded-[2.5rem] relative break-inside-avoid bg-zinc-50/10 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6 print:mb-2 px-2">
                  <span className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs font-black shadow-lg uppercase">{pIdx + 1}</span>
                  <span className="text-xs font-black text-zinc-800 uppercase tracking-widest">{puzzle.title}</span>
              </div>

              <div className="flex flex-col items-center flex-1 justify-center relative py-6 print:py-2">
                  <div className="relative p-8 print:p-6 bg-white rounded-3xl shadow-xl border-2 border-zinc-100 w-full max-w-[400px] aspect-square flex items-center justify-center overflow-hidden">
                      
                      {/* Üst Koordinat (A, B, C...) */}
                      <div className="absolute top-2 left-10 right-10 h-6 flex justify-around items-center">
                          {Array.from({ length: gridCols }).map((_, i) => (
                              <span key={i} className="text-[9px] font-black text-zinc-400 uppercase w-full text-center">{String.fromCharCode(65 + i)}</span>
                          ))}
                      </div>
                      
                      {/* Sol Koordinat (1, 2, 3...) */}
                      <div className="absolute top-10 bottom-10 left-2 w-8 flex flex-col justify-around items-center">
                          {Array.from({ length: gridRows }).map((_, i) => (
                              <span key={i} className="text-[9px] font-black text-zinc-400 w-full text-center">{i + 1}</span>
                          ))}
                      </div>

                      {/* Izgara (Grid) - Daha Belirgin ve Kararlı Çizgi Yapısı */}
                      <div 
                          className="grid w-full h-full border-[1.5px] border-zinc-900 bg-zinc-900 gap-[1px]"
                          style={{ 
                            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                            gridTemplateRows: `repeat(${gridRows}, 1fr)`
                          }}
                      >
                          {puzzle.grid.map((row: any, r: number) => row.map((cell: any, c: number) => (
                              <div 
                                key={`${r}-${c}`} 
                                className="bg-white flex items-center justify-center relative min-w-0 min-h-0"
                              >
                                  {/* İç Çizgi Garantisi: Box-shadow/Ring kullanımı ekran render sorunlarını çözer */}
                                  <div className="absolute inset-0 ring-1 ring-zinc-200 pointer-events-none opacity-20"></div>

                                  {cell.type === 'start' && (
                                    <div className="w-4/5 h-4/5 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-500 z-10">
                                      <span className="text-[10px]">🎯</span>
                                    </div>
                                  )}
                                  {cell.type === 'target' && (
                                    <div className="w-4/5 h-4/5 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-500 z-10">
                                      <span className="text-[10px]">🏁</span>
                                    </div>
                                  )}
                                  {cell.type === 'obstacle' && (
                                    <span className="text-[14px] opacity-60 z-10 animate-pulse">{cell.icon || '🚫'}</span>
                                  )}
                              </div>
                          )))}
                      </div>
                  </div>
              </div>

              {/* Şifreli Yönerge Paneli */}
              <div className="mt-6 bg-zinc-950 text-white p-5 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                      <i className="fa-solid fa-code text-5xl"></i>
                  </div>
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <LucideIcons.Terminal size={10} /> ROTA PROTOKOLÜ
                  </p>
                  <div className="flex flex-wrap gap-2 justify-start relative z-10">
                      {puzzle.instructions.map((ins: any, iIdx: number) => (
                          <div 
                              key={iIdx} 
                              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-all font-mono"
                          >
                              {cipherType === 'arrows' ? (
                                  <>
                                      <span className="text-[11px] font-black text-indigo-400">{ins.count}</span>
                                      <span className="text-[14px] leading-none text-indigo-100">{ins.arrow}</span>
                                  </>
                              ) : (
                                  <span className="text-[10px] font-black tracking-tighter uppercase text-indigo-300">{ins.coord}</span>
                              )}
                          </div>
                      ))}
                  </div>
              </div>

              <div className="mt-4 flex justify-between items-center text-[7px] font-black text-zinc-400 px-4 uppercase tracking-widest border-t border-zinc-100 pt-4">
                  <div className="flex gap-4">
                    <span>COMPLEXITY: {puzzle.clinicalMeta?.complexity?.toFixed(1)}</span>
                    <span>DISTANCE: {puzzle.clinicalMeta?.totalSteps}</span>
                  </div>
                  <span className="opacity-40 italic font-mono uppercase">V3_GRID_STABLE</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-6 bg-zinc-950 text-white rounded-[3rem] flex justify-between items-center relative overflow-hidden shadow-2xl border border-white/5">
          <div className="flex gap-6 items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-xl border border-white/20">
                  <LucideIcons.Compass className="text-white animate-pulse" size={28} />
              </div>
              <div>
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">PROGRAMLANABİLİR BİLİŞSEL ROTA</p>
                  <h3 className="text-2xl font-black uppercase tracking-tight">KODLAMA SİSTEMİ</h3>
              </div>
          </div>
          <div className="flex flex-col items-end opacity-60">
              <span className="text-[8px] font-black uppercase tracking-[0.3em]">NAVI_OS ENGINE</span>
              <span className="text-[10px] font-black text-indigo-400">STABLE GRID V3</span>
          </div>
      </div>
    </div>
  );
};
