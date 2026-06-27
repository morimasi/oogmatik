import React from 'react';
import { VisualOddOneOutData, VisualOddOneOutItem, StyleSettings } from '../../../types';
import { PedagogicalHeader } from '../common';

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
      className="transition-all duration-300 flex items-center justify-center p-1 overflow-hidden w-full h-full"
      style={{
        transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1}) ${item.isMirrored ? 'scaleX(-1)' : ''}`,
      }}
    >
      {item.label ? (
        <span
          className={`font-black text-zinc-900 select-none font-mono leading-none flex items-center justify-center`}
          style={{ fontSize: `${size}px` }}
        >
          {item.label}
        </span>
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
  const settings = data?.settings;
  const puzzles = data?.puzzles || [];
  const legacyRows = data?.rows || [];
  
  // Eğer puzzle yoksa ve row varsa, tek bir puzzle gibi davran
  const effectivePuzzles = puzzles.length > 0 
    ? puzzles 
    : (legacyRows.length > 0 ? [{ rows: legacyRows, title: 'Görsel Tarama Matrisi' }] : []);

  const puzzleCount = effectivePuzzles.length;
  const itemsPerRow = settings?.itemsPerRow || 6;
  const aestheticMode = settings?.aestheticMode || 'premium';
  const isPremium = aestheticMode === 'premium' || aestheticMode === 'glassmorphism';

  // A4 Yerleşim Hesaplaması
  const gridCols = puzzleCount > 1 ? 'grid-cols-2' : 'grid-cols-1';

  const renderPuzzleSet = (puzzle: any, pIdx: number) => {
    return (
      <div 
        key={pIdx} 
        className={`flex flex-col p-4 print:p-2 border-[1.5px] rounded-[2.5rem] relative break-inside-avoid transition-all duration-300 ${isPremium ? 'bg-zinc-50/50 border-zinc-100 shadow-sm' : 'bg-white border-zinc-200'}`}
      >
        {/* Set Header */}
        <div className="flex justify-between items-center mb-4 print:mb-2 px-2">
            <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black">{pIdx + 1}</span>
                <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{puzzle.title || 'DİKKAT SETİ'}</span>
            </div>
            <span className="text-[7px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase">
                {puzzle.targetSkill || 'Görsel Ayrıştırma'}
            </span>
        </div>

        {/* Rows Grid */}
        <div className="flex flex-col gap-2 print:gap-1.5">
            {puzzle.rows.map((row: any, rIdx: number) => (
                <div key={rIdx} className="flex items-center gap-3 group">
                    {/* Row Index */}
                    <div className="w-4 h-4 rounded-md bg-zinc-100 text-zinc-400 flex items-center justify-center text-[8px] font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {rIdx + 1}
                    </div>

                    {/* Items */}
                    <div 
                        className="flex-1 grid gap-1.5 print:gap-1 items-center"
                        style={{ gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)` }}
                    >
                        {row.items.map((item: any, iIdx: number) => (
                            <div 
                                key={iIdx} 
                                className={`aspect-square w-full rounded-xl border-[1.5px] flex items-center justify-center transition-all cursor-pointer relative bg-white ${isPremium ? 'border-zinc-100 hover:border-indigo-400 hover:shadow-lg' : 'border-zinc-200 hover:border-zinc-400'}`}
                            >
                                <ComplexShapeRenderer item={item} size={itemsPerRow > 7 ? 16 : 24} />
                                {/* Selection Dot */}
                                <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-zinc-100 opacity-30"></div>
                            </div>
                        ))}
                    </div>

                    {/* Target Answer Slot (for professional worksheets) */}
                    <div className="w-8 h-8 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center group-hover:border-indigo-200 transition-colors">
                        <i className="fa-solid fa-pencil text-[8px] text-zinc-200 group-hover:text-indigo-200"></i>
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white overflow-hidden professional-worksheet`}>
      <PedagogicalHeader
        title={data?.title || 'GÖRSEL FARKLIYI BUL'}
        instruction={data?.instruction || 'Her satırda diğerlerinden farklı olan öğeyi bulup işaretleyin.'}
      />

      <div className={`flex-1 grid ${gridCols} gap-8 print:gap-4 mt-8 print:mt-4 px-8 print:px-4 content-start`}>
        {effectivePuzzles.map((p, i) => renderPageItem(p, i))}
      </div>

      {/* Premium Dark Footer */}
      <div className="mt-auto p-6 print:p-3 bg-zinc-950 text-white rounded-t-[3rem] flex justify-between items-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
          
          <div className="flex gap-4 items-center relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center border border-indigo-400">
                  <i className="fa-solid fa-eye text-white text-lg"></i>
              </div>
              <div className="flex flex-col text-left">
                  <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">DİKKAT MATRİSİ ANALİZİ</span>
                  <span className="text-sm font-black uppercase">Visuo-Spatial Discrimination</span>
              </div>
          </div>

          <div className="flex gap-8 items-center relative z-10">
              <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1">Uyaran Türü</span>
                <span className="text-[10px] font-black text-indigo-300 uppercase italic">{(settings?.itemType || 'MIXED').toUpperCase()}</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex flex-col items-center">
                  <span className="text-[14px] font-black text-white">{puzzleCount} x {settings?.rowCount || effectivePuzzles[0]?.rows?.length}</span>
                  <span className="text-[6px] font-bold text-zinc-500 uppercase">SATIR KAPASİTESİ</span>
              </div>
          </div>
      </div>
    </div>
  );

  function renderPageItem(p: any, i: number) {
      return renderPuzzleSet(p, i);
  }
};
