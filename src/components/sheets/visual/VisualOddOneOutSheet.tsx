import React from 'react';
import { VisualOddOneOutData, VisualOddOneOutItem, StyleSettings } from '../../../types';
import { PedagogicalHeader, SegmentDisplay } from '../common';

const SvgFromPaths = ({ paths }: { paths: any[] }) => {
  if (!paths || paths.length === 0) return null;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full p-1" preserveAspectRatio="xMidYMid meet">
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill || 'none'}
          stroke={p.stroke || '#000'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};

const ComplexShapeRenderer = ({
  item,
  size = 35,
}: {
  item: VisualOddOneOutItem;
  size?: number;
}) => {
  if (!item) return null;

  return (
    <div
      className="transition-all duration-300 flex items-center justify-center p-1 w-full h-full transform"
      style={{
        transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1}) ${item.isMirrored ? 'scaleX(-1)' : ''}`,
      }}
    >
      {item.svgPaths ? (
        <SvgFromPaths paths={item.svgPaths} />
      ) : item.svg ? (
        <div
          className="w-full h-full flex items-center justify-center [&_svg]:w-full [&_svg]:h-full"
          dangerouslySetInnerHTML={{ __html: item.svg }}
        />
      ) : item.label ? (
        <span
          className="font-black text-zinc-900 select-none font-mono leading-none"
          style={{ fontSize: `${size}px` }}
        >
          {item.label}
        </span>
      ) : item.segments ? (
        <div className="w-full h-full scale-150">
           <SegmentDisplay segments={item.segments} />
        </div>
      ) : (
        <div className="w-6 h-6 border-2 border-zinc-200 rounded-full animate-pulse"></div>
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
  const settings = data?.settings;
  const puzzles = data?.puzzles || [];
  const legacyRows = data?.rows || [];
  
  // Eğer puzzle yoksa ve row varsa, tek bir puzzle gibi davran
  const effectivePuzzles = puzzles.length > 0 
    ? puzzles 
    : (legacyRows.length > 0 ? [{ rows: legacyRows, title: 'Görsel Tarama Matrisi', targetSkill: 'Visual Discrimination' }] : []);

  const puzzleCount = effectivePuzzles.length;
  const itemsPerRow = settings?.itemsPerRow || 6;
  const aestheticMode = settings?.aestheticMode || 'premium';
  const isPremium = aestheticMode === 'premium' || aestheticMode === 'glassmorphism';

  // Grid tasarımı: Puzzle sayısına göre dağılım
  const containerCols = puzzleCount > 1 ? (puzzleCount > 2 ? 2 : 1) : 1;

  const renderPuzzleSet = (puzzle: any, pIdx: number) => {
    return (
      <div 
        key={pIdx} 
        className={`flex flex-col p-5 print:p-2 border-[2px] rounded-[3rem] relative break-inside-avoid transition-all duration-300 shadow-sm ${isPremium ? 'bg-zinc-50/30 border-zinc-100 hover:bg-white active:scale-[0.99]' : 'bg-white border-zinc-200'}`}
      >
        {/* Set Header */}
        <div className="flex justify-between items-end mb-5 print:mb-2 px-3">
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg ring-4 ring-indigo-50">
                    {pIdx + 1}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter leading-none mb-1">
                        {puzzle.title || 'DİKKAT MATRİSİ'}
                    </span>
                    <span className="text-[6px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{puzzle.targetSkill || 'Saccadic Scan'}</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[6px] font-black text-rose-500 uppercase tracking-widest border border-rose-100 bg-rose-50 px-2 py-0.5 rounded-full mb-1">HIZA ODAKLAN</span>
                <span className="text-[7px] font-black text-zinc-400">ZPD: {settings?.difficulty || 'ORTA'}</span>
            </div>
        </div>

        {/* Matris Alanı */}
        <div className="flex flex-col gap-3 print:gap-1.5 px-1">
            {puzzle.rows.map((row: any, rIdx: number) => (
                <div key={rIdx} className="flex items-center gap-4 group/row">
                    {/* Index */}
                    <div className="w-5 h-5 rounded-lg bg-zinc-100 text-zinc-400 flex items-center justify-center text-[8px] font-black group-hover/row:bg-indigo-600 group-hover/row:text-white transition-all transform group-hover/row:scale-110">
                        {rIdx + 1}
                    </div>

                    {/* Matris Satırı */}
                    <div 
                        className="flex-1 grid gap-2 print:gap-1 items-center"
                        style={{ gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)` }}
                    >
                        {row.items.map((item: any, iIdx: number) => (
                            <div 
                                key={iIdx} 
                                className={`aspect-square w-full rounded-[1.2rem] border-[1.5px] flex items-center justify-center transition-all cursor-pointer relative bg-white group/item ${isPremium ? 'border-zinc-100 hover:border-indigo-400 hover:shadow-xl' : 'border-zinc-200'}`}
                            >
                                <ComplexShapeRenderer item={item} size={itemsPerRow > 7 ? 20 : 30} />
                                
                                {/* Decorator Dots (Ayrıştırma Rehberi) */}
                                <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-zinc-100 opacity-20"></div>
                                <div className="absolute bottom-1 right-1 w-2 h-0.5 rounded-full bg-zinc-100 opacity-20"></div>
                            </div>
                        ))}
                    </div>

                    {/* Seçim İşareti Alanı (Cevap Kutusu) */}
                    <div className="w-10 h-10 rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center group-hover/row:border-indigo-600 group-hover/row:bg-indigo-50 transition-all">
                         <div className="w-1 h-1 rounded-full bg-zinc-200 group-hover/row:bg-indigo-600"></div>
                    </div>
                </div>
            ))}
        </div>

        {/* Clinical Note Bar */}
        {settings?.showClinicalNotes && puzzle.rows[0]?.clinicalMeta && (
            <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between items-center opacity-40">
                <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                    Bilişsel Yük: {Math.round((itemsPerRow * puzzle.rows.length) / 10)} CP
                </span>
                <span className="text-[6px] font-bold text-zinc-400 italic">
                    Discrimination Factor: {puzzle.rows[0].clinicalMeta.discriminationFactor || 0.8}
                </span>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white overflow-hidden professional-worksheet`}>
      <PedagogicalHeader
        title={data?.title || 'GÖRSEL AYRIŞTIRMA & DİKKAT MATRİSİ'}
        instruction={data?.instruction || 'Her satırda diğerlerinden farklı olan öğeyi bulup sağdaki kutucuğa işaretleyin.'}
      />

      <div className={`flex-1 grid ${containerCols === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-10 print:gap-4 mt-8 print:mt-4 px-10 print:px-6 content-start`}>
        {effectivePuzzles.map((p, i) => renderPuzzleSet(p, i))}
      </div>

      {/* Premium Carbon Footer */}
      <div className="mt-auto p-8 print:p-4 bg-zinc-950 text-white rounded-t-[4rem] flex justify-between items-center relative overflow-hidden shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-600/5 rounded-full blur-[60px]"></div>
          
          <div className="flex gap-6 items-center relative z-10">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-2xl border border-white/10 transform -rotate-3">
                  <i className="fa-solid fa-crosshairs text-white text-2xl animate-pulse"></i>
              </div>
              <div className="flex flex-col text-left">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.6em] mb-1 leading-none italic">EDUMIND NEURO SYSTEM</span>
                  <span className="text-lg font-black tracking-tighter uppercase leading-none">SACCADIC SCAN V2.0</span>
              </div>
          </div>

          <div className="flex gap-12 items-center relative z-10 pr-6">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 opacity-50">Kayıt No</span>
                <span className="text-[11px] font-black text-zinc-100 uppercase tracking-tighter">BDS-{Math.random().toString(36).substring(7).toUpperCase()}</span>
              </div>
              <div className="w-px h-12 bg-white/10 hidden md:block"></div>
              <div className="flex flex-col items-center">
                  <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 4 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-zinc-800'}`}></div>)}
                  </div>
                  <span className="text-[7px] font-black text-zinc-500 uppercase">GÜVEN SKORU</span>
              </div>
          </div>
      </div>
    </div>
  );
};
