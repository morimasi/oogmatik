import React from 'react';
import { PatternCompletionData, PatternCell } from '../../../types/visual';
import { ShapeType } from '../../../types/core';

interface Props {
  data: PatternCompletionData;
  settings?: any;
}

export const PatternCompletionSheet: React.FC<Props> = ({ data, settings: globalSettings }) => {
  const gridSize = data.settings?.gridSize || 3;
  const patternType = data.settings?.patternType || 'geometric';
  
  // Desteklenen yeni veri yapısında "puzzles" dizisi var, eskilerde doğrudan matrix/options vardı.
  const puzzles = data.content?.puzzles || [
     {
         id: 'pz_old',
         gridSize: gridSize,
         patternType: patternType,
         matrix: data.content?.matrix || [],
         options: data.content?.options || []
     }
  ];

  const isLandscape = globalSettings?.orientation === 'landscape';
  const isCompact = globalSettings?.compact ?? data.settings?.compactLayout ?? true;
  
  // Bulmaca sayısına göre sığdırma stratejisi
  // 1 bulmaca: Çok büyük (eski stil)
  // 2-4 bulmaca: Grid (1x2, 2x2 vb.)
  // 5-8 bulmaca: Daha küçük Grid (2x4 vb.)
  const pzCount = puzzles.length;
  
  let gridCols = 'grid-cols-1';
  if (isLandscape) {
      if (pzCount > 4) gridCols = 'grid-cols-4';
      else if (pzCount > 2) gridCols = 'grid-cols-3';
      else if (pzCount > 1) gridCols = 'grid-cols-2';
  } else {
      if (pzCount > 4) gridCols = 'grid-cols-2'; // 2 sütun, x satır
      else if (pzCount > 1) gridCols = 'grid-cols-2'; // 2x2
  }

  // Kompakt mod gap'leri
  const gapClass = isCompact ? 'gap-2 print:gap-1' : 'gap-6 print:gap-4';

  const renderShape = (type: ShapeType, color: string) => {
    switch (type) {
      case 'circle': return <circle cx="50" cy="50" r="40" fill={color} stroke="black" strokeWidth="2" />;
      case 'square': return <rect x="15" y="15" width="70" height="70" fill={color} stroke="black" strokeWidth="2" rx="5" />;
      case 'triangle': return <polygon points="50,15 85,85 15,85" fill={color} stroke="black" strokeWidth="2" strokeLinejoin="round" />;
      case 'diamond': return <polygon points="50,10 90,50 50,90 10,50" fill={color} stroke="black" strokeWidth="2" strokeLinejoin="round" />;
      case 'hexagon': return <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill={color} stroke="black" strokeWidth="2" strokeLinejoin="round" />;
      case 'star': return <polygon points="50,10 61,35 88,35 66,51 75,76 50,60 25,76 34,51 12,35 39,35" fill={color} stroke="black" strokeWidth="2" strokeLinejoin="round" />;
      default: return <circle cx="50" cy="50" r="40" fill={color} />; // Fallback
    }
  };

  const renderCellContent = (cell: PatternCell, pzPatternType: string) => {
    if (cell.isMissing) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 rounded border-2 border-dashed border-zinc-300 text-3xl md:text-5xl text-zinc-300">
          <i className="fa-solid fa-question"></i>
        </div>
      );
    }

    if (pzPatternType === 'geometric' && cell.shapes) {
      return (
        <div className="w-full h-full flex items-center justify-center p-1 relative bg-white border border-slate-200 rounded shadow-sm">
          <svg viewBox="0 0 100 100" className="w-full h-full max-w-[90%] max-h-[90%] overflow-visible drop-shadow-sm">
            {cell.shapes.map((shape, i) => (
              <g key={i} style={{ transformOrigin: '50% 50%', transform: `rotate(${shape.rotation || 0}deg)` }}>
                {renderShape(shape.type, shape.color)}
              </g>
            ))}
          </svg>
        </div>
      );
    }

    if (pzPatternType === 'color_blocks') {
      return <div className="w-full h-full rounded border-2 border-slate-800" style={{ backgroundColor: cell.color || '#fff' }}></div>;
    }

    if (pzPatternType === 'logic_sequence') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-blue-50 border border-blue-900 rounded">
          <span className="text-xl md:text-3xl font-black text-blue-900 leading-none">{cell.content}</span>
        </div>
      );
    }

    return <div className="w-full h-full bg-slate-100 rounded border border-slate-300"></div>;
  };

  return (
    <div className={`w-full h-full p-6 print:p-2 flex flex-col bg-white overflow-hidden text-zinc-900 print:border-none border border-zinc-200 ${isLandscape ? 'landscape' : ''}`}>
      {/* BAŞLIK */}
      <div className={`flex justify-between items-center border-b-[3px] border-sky-500 pb-2 ${isCompact ? 'mb-2' : 'mb-6 print:mb-4'}`}>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-sky-900 tracking-tighter uppercase leading-tight">
            {data.content?.title || 'Kafayı Çalıştır!'}
          </h1>
          <p className="text-xs md:text-sm font-bold text-sky-600 uppercase tracking-widest">
            {data.content?.instruction || 'Eksik parçayı bul ve işaretle.'}
          </p>
        </div>
        <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center text-xl shadow-inner border border-sky-100 shrink-0">
          <i className="fa-solid fa-puzzle-piece"></i>
        </div>
      </div>

      <div className={`flex-1 grid ${gridCols} ${gapClass} auto-rows-max overflow-hidden`}>
          {puzzles.map((pz, index) => {
              const pzGridSize = pz.gridSize || gridSize;
              const pzPatternType = pz.patternType || patternType;
              
              // Tekli mod ise yanyana matrix+seçenekler, değilse üstte matrix altta seçenekler.
              const isSingleMode = pzCount === 1;

              return (
                  <div key={pz.id || index} className={`flex ${isSingleMode ? (isLandscape ? 'flex-row' : 'flex-col md:flex-row') : 'flex-col'} items-center justify-center gap-2 print:gap-1 p-2 border-2 border-slate-100 rounded-xl bg-slate-50/50 relative page-break-inside-avoid min-h-0`}>
                      
                      {/* Sıra numarası (opsiyonel) */}
                      {pzCount > 1 && data.settings?.showNumbers !== false && (
                          <div className="absolute top-1 left-2 font-black text-slate-300 text-xs">{index + 1}</div>
                      )}

                      {/* MATRIX ALANI */}
                      <div className={`aspect-square bg-slate-50 border-4 border-slate-300 rounded-xl p-1.5 shadow-sm shrink-0 flex items-center justify-center ${isSingleMode ? 'w-full lg:w-1/2 max-w-[400px]' : (isLandscape ? 'w-2/3 max-w-[200px]' : 'w-3/4 max-w-[250px]')}`}>
                        <div
                          className="grid gap-1 w-full h-full"
                          style={{
                            gridTemplateColumns: `repeat(${pzGridSize}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${pzGridSize}, minmax(0, 1fr))`
                          }}
                        >
                          {pz.matrix.map((cell: PatternCell, idx: number) => (
                            <div key={idx} style={{ gridColumn: cell.x + 1, gridRow: cell.y + 1 }} className="h-full w-full">
                              {renderCellContent(cell, pzPatternType)}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Seçenekler */}
                      <div className={`${isSingleMode ? 'w-full lg:w-1/2 max-w-[400px]' : 'w-full'} flex flex-col justify-center min-h-0`}>
                          <div className={`grid grid-cols-${pz.options.length > 3 ? (pz.options.length % 2 === 0 ? '2' : pz.options.length) : pz.options.length} gap-2 print:gap-1 w-full justify-items-center`}>
                              {pz.options.map((opt: any, idx: number) => (
                                  <div key={idx} className="flex flex-col items-center gap-1 group relative cursor-pointer min-h-0">
                                      <div className={`aspect-square border-2 border-slate-200 rounded-lg p-1 transition-all group-hover:border-sky-500 bg-white shadow-sm flex items-center justify-center relative pointer-events-none ${isSingleMode ? 'w-24' : 'w-14 md:w-16'}`}>
                                          {renderCellContent(opt.cell, pzPatternType)}
                                      </div>
                                      <div className={`font-black text-slate-400 group-hover:text-sky-600 transition-colors ${isSingleMode ? 'text-lg' : 'text-xs'}`}>
                                          {opt.id}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                  </div>
              );
          })}
      </div>

      {/* FOOTER */}
      <div className="pt-2 mt-auto border-t border-zinc-100 flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <span>Neuro-Oogmatik Özel Eğitim Eğitmen Arayüzü</span>
        <span>Modül: Kafayı Çalıştır • Bulmaca Sayısı: {pzCount}</span>
      </div>
    </div>
  );
};
