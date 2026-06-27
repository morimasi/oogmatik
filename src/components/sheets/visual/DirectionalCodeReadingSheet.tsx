import React from 'react';
import { DirectionalCodeReadingData } from '../../../types';
import { PedagogicalHeader } from '../common';

export const DirectionalCodeReadingSheet: React.FC<{ data: DirectionalCodeReadingData }> = ({ data }) => {
  const puzzles = data?.puzzles || [];
  const settings = data?.settings;
  const isUltraCompact = settings?.aestheticMode === 'ultra-compact';
  const cipherType = settings?.cipherType || 'arrows';

  return (
    <div className="flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white p-8 print:p-4 overflow-hidden professional-worksheet relative">
      <PedagogicalHeader
        title={data?.title || 'ŞİFRE VE ROTA MATRİSİ'}
        instruction={data?.instruction || 'Yönerge kutusundaki kodları takip ederek başlangıçtan bitişe ulaş.'}
      />

      <div className={`flex-1 grid ${puzzles.length > 1 ? 'grid-cols-2 mt-4' : 'grid-cols-1 mt-8'} gap-6 print:gap-3 content-stretch`}>
        {puzzles.map((puzzle, pIdx) => (
          <div 
            key={pIdx} 
            className="flex flex-col p-4 print:p-2 border-2 border-zinc-200 rounded-[2.5rem] relative break-inside-avoid bg-zinc-50/30"
          >
            {/* Tema Başlığı */}
            <div className="flex items-center gap-2 mb-4 print:mb-2 px-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black">{pIdx + 1}</span>
                <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">{puzzle.title}</span>
            </div>

            {/* Matris ve Koordinat Sistemi */}
            <div className="flex flex-col items-center flex-1 justify-center relative py-4">
                <div className="relative p-6 print:p-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
                    {/* Üst Koordinat (A, B, C...) */}
                    <div className="absolute top-0 left-6 right-0 h-6 flex justify-around items-center px-1">
                        {Array.from({ length: puzzle.grid[0].length }).map((_, i) => (
                            <span key={i} className="text-[8px] font-black text-zinc-400 uppercase">{String.fromCharCode(65 + i)}</span>
                        ))}
                    </div>
                    {/* Sol Koordinat (1, 2, 3...) */}
                    <div className="absolute top-6 bottom-0 left-0 w-6 flex flex-col justify-around items-center py-1">
                        {Array.from({ length: puzzle.grid.length }).map((_, i) => (
                            <span key={i} className="text-[8px] font-black text-zinc-400">{i + 1}</span>
                        ))}
                    </div>

                    <div 
                        className="grid gap-[1px] bg-zinc-300 border-2 border-zinc-900 rounded-lg overflow-hidden"
                        style={{ gridTemplateColumns: `repeat(${puzzle.grid[0].length}, 1fr)` }}
                    >
                        {puzzle.grid.map((row: any, r: number) => row.map((cell: any, c: number) => (
                            <div key={`${r}-${c}`} className="w-8 h-8 print:w-7 print:h-7 bg-white flex items-center justify-center relative">
                                {cell.type === 'start' && <span className="text-sm">🎯</span>}
                                {cell.type === 'target' && <span className="text-sm">🏁</span>}
                                {cell.type === 'obstacle' && <span className="text-sm opacity-60">{cell.icon || '🚫'}</span>}
                            </div>
                        )))}
                    </div>
                </div>
            </div>

            {/* Şifreli Yönerge Paneli */}
            <div className="mt-4 bg-zinc-900 text-white p-4 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                    <i className="fa-solid fa-code text-4xl"></i>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-start">
                    {puzzle.instructions.map((ins: any, iIdx: number) => (
                        <div 
                            key={iIdx} 
                            className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-sm"
                        >
                            {cipherType === 'arrows' ? (
                                <>
                                    <span className="text-[10px] font-black text-indigo-400">{ins.count}</span>
                                    <span className="text-[12px]">{ins.arrow}</span>
                                </>
                            ) : (
                                <span className="text-[9px] font-black tracking-tighter uppercase">{ins.coord}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Alt Bilgi */}
            <div className="mt-4 flex justify-between items-center text-[7px] font-black text-zinc-400 px-2">
                <span>COMPLEXITY: {puzzle.clinicalMeta?.complexity?.toFixed(1)}</span>
                <span>STEPS: {puzzle.clinicalMeta?.totalSteps}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Profesyonel Alt Panel */}
      <div className="mt-6 p-4 bg-zinc-950 text-white rounded-[2.5rem] flex justify-between items-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg border border-white/10">
                  <i className="fa-solid fa-microchip text-white text-xl animate-pulse"></i>
              </div>
              <div>
                  <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">PROGRAMLANABİLİR BİLİŞ</p>
                  <p className="text-base font-black uppercase tracking-tight">ROTA KODLAMA SİSTEMİ</p>
              </div>
          </div>

          <div className="flex gap-4 pr-4">
              <div className="flex flex-col items-end border-r border-white/10 pr-4">
                  <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1">MÜFREDAT</span>
                  <span className="text-[10px] font-black italic">NAVIGATIONAL AI</span>
              </div>
              <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1">MOD</span>
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{(settings?.cipherType || 'OKLAR').toUpperCase()}</span>
              </div>
          </div>
      </div>

      {/* Klinik Değerlendirme Çizelgesi */}
      <div className="mt-2 grid grid-cols-4 gap-2">
          {['ZAMAN', 'HATA', 'ODAK', 'SKOR'].map(l => (
              <div key={l} className="p-2 border border-zinc-200 rounded-2xl bg-zinc-50 flex flex-col items-center">
                  <span className="text-[7px] font-black text-zinc-400 uppercase mb-1">{l}</span>
                  <div className="h-4 w-full border-b border-dashed border-zinc-300"></div>
              </div>
          ))}
      </div>
    </div>
  );
};
