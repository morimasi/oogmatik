import { FindTheDifferenceData, StyleSettings } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FindTheDifferenceSheet = ({
  data,
  settings: globalSettings,
}: {
  data: FindTheDifferenceData & { gridA?: any[][]; gridB?: any[][]; diffCount?: number };
  settings?: StyleSettings;
}) => {
  // Graceful fallback for invalid or missing data to avoid blank pages
  if (!data || !data.gridA || !data.gridB || data.gridA.length === 0 || data.gridB.length === 0) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-md">
        Geçersiz infografik verisi veya boş içerik. Lütfen içerik kaynağını kontrol edin.
      </div>
    );
  }
  const rows = data?.rows || [];
  const settings = data?.settings;
  const puzzles = data.puzzles || [
    { gridA: data.gridA, gridB: data.gridB, diffCount: data.diffCount, title: 'Görev' },
  ];
  const puzzleCount = puzzles.length;

  const isLandscape = globalSettings?.orientation === 'landscape';
  const isUltraDense = settings?.layout === 'ultra_dense' || globalSettings?.compact;
  const isGridCompact = settings?.layout === 'grid_compact' || isUltraDense;
  const isSideBySide = settings?.layout === 'side_by_side' || (puzzles.length > 0);

  // Render a single pair of grids (Reference + Find)
  const PuzzlePair = ({ 
    gridA, 
    gridB, 
    diffCount, 
    title, 
    index 
  }: { 
    gridA: any[][]; 
    gridB: any[][]; 
    diffCount: number; 
    title?: string;
    index: number;
  }) => {
    const gridSize = gridA[0].length;
    
    // Dynamic cell sizing based on puzzle count and grid size
    let cellSizeClass = "w-8 h-8 print:w-7 print:h-7 text-sm";
    if (puzzleCount === 1) {
        cellSizeClass = gridSize > 8 ? 'w-8 h-8 print:w-7 print:h-7 text-sm' : 
                        gridSize > 6 ? 'w-10 h-10 print:w-9 print:h-9 text-base' : 
                        'w-12 h-12 print:w-11 print:h-11 text-xl';
    } else if (puzzleCount === 2) {
        cellSizeClass = gridSize > 6 ? 'w-8 h-8 print:w-7 print:h-7 text-sm' : 'w-10 h-10 print:w-8 print:h-8 text-base';
    } else { // 4 puzzles
        cellSizeClass = gridSize > 6 ? 'w-6 h-6 print:w-5 print:h-5 text-xs' : 'w-8 h-8 print:w-6 print:h-6 text-sm';
    }

    return (
      <div className="flex flex-col w-full gap-2 print:gap-1">
        {puzzleCount > 1 && (
            <div className="flex items-center gap-2 mb-1 px-2">
                <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-md">
                    {index + 1}
                </div>
                <h5 className="text-[10px] font-black text-rose-900 uppercase tracking-widest">{title || 'BULMACA'}</h5>
                <div className="flex-1 h-px bg-zinc-100"></div>
                <span className="text-[8px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100">{diffCount} FARK</span>
            </div>
        )}
        
        <div className="flex flex-row gap-2 print:gap-1 items-start justify-center px-1 print:px-0">
          {/* Tablo A - Referans */}
          <div className="flex-1 flex flex-col items-center gap-1 w-full overflow-hidden">
            {puzzleCount === 1 && (
                <div className="px-3 py-1 bg-zinc-800 text-white text-[7px] font-black uppercase tracking-[0.2em] rounded-t-xl shadow-sm border-b border-zinc-700 w-full text-center">
                    REFERANS
                </div>
            )}
            <div
              className={`w-full grid gap-0.5 p-2 print:p-0.5 border-[3px] border-zinc-800 bg-zinc-50 ${puzzleCount === 1 ? 'rounded-b-2xl' : 'rounded-2xl'} shadow-lg`}
              style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
              {gridA.flat().map((cell, i) => (
                <div
                  key={i}
                  className={`aspect-square border border-zinc-200 rounded flex items-center justify-center font-black bg-white shadow-sm overflow-hidden ${cellSizeClass}`}
                >
                  <EditableText value={String(cell)} tag="span" className="scale-90" />
                </div>
              ))}
            </div>
          </div>

          {/* Ayırıcı */}
          <div className={`flex flex-col items-center justify-center ${puzzleCount === 1 ? 'py-20' : 'py-4'} opacity-5 px-0.5`}>
             <div className="w-px h-full bg-zinc-400"></div>
          </div>

          {/* Tablo B - Farkları İşaretle */}
          <div className="flex-1 flex flex-col items-center gap-1 w-full overflow-hidden">
            {puzzleCount === 1 && (
                <div className="px-3 py-1 bg-indigo-600 text-white text-[7px] font-black uppercase tracking-[0.2em] rounded-t-xl shadow-sm border-b border-indigo-500 w-full text-center">
                    FARKLARI BUL
                </div>
            )}
            <div
              className={`w-full grid gap-0.5 p-2 print:p-0.5 border-[3px] border-indigo-600 bg-white ${puzzleCount === 1 ? 'rounded-b-2xl' : 'rounded-2xl'} shadow-lg`}
              style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
              {gridB.flat().map((cell, i) => (
                <div
                  key={i}
                  className={`aspect-square border border-indigo-100 rounded flex items-center justify-center font-black hover:bg-indigo-50 cursor-pointer transition-all relative group bg-white shadow-sm overflow-hidden ${cellSizeClass}`}
                >
                  <EditableText value={String(cell)} tag="span" className="scale-90" />
                  <div className="absolute inset-0 rounded border-2 border-transparent group-hover:border-indigo-400 border-dashed m-0.5"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isSideBySide && puzzles.length > 0) {
    const gridColsClass = puzzleCount === 4 ? 'grid-cols-2' : 'grid-cols-1';
    
    return (
      <div
        className={`flex flex-col h-full bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative p-8 print:p-3 min-h-[297mm] transition-all duration-500`}
      >
        <PedagogicalHeader
          title={data?.title || 'FARK BULMACA: GÖRSEL DİKKAT'}
          instruction={
            data?.instruction ||
            `Sol taraftaki referans tablo ile sağ taraftaki tablo arasındaki farkları bulup sağdakinde işaretleyin.`
          }
          data={data}
        />

        <div
          className={`flex-1 grid ${gridColsClass} gap-6 print:gap-4 mt-6 print:mt-2 content-start`}
        >
          {puzzles.map((p, idx) => (
             <PuzzlePair 
                key={idx}
                index={idx}
                gridA={p.gridA} 
                gridB={p.gridB} 
                diffCount={p.diffCount || 0} 
                title={p.title}
            />
          ))}
        </div>

        {/* Alt Klinik Panel - Ultra Compact */}
        <div className="mt-4 print:mt-1 grid grid-cols-4 gap-2 pt-4 border-t border-zinc-100 no-break">
          <div className="bg-zinc-900 text-white rounded-xl p-3 flex flex-col justify-between h-16 shadow-md">
            <span className="text-[6px] font-black text-indigo-400 uppercase tracking-widest">HEDEFLER</span>
            <span className="text-xs font-black uppercase">{puzzleCount} GÖREV TAMAMLA</span>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col justify-between h-16 shadow-sm">
            <span className="text-[6px] font-black text-zinc-400 uppercase tracking-widest">SÜRE</span>
            <span className="text-base font-black text-zinc-800">__:__</span>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col justify-between h-16 shadow-sm col-span-2">
            <span className="text-[6px] font-black text-zinc-400 uppercase tracking-widest">TAKİP</span>
            <div className="flex gap-1.5 overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full border border-zinc-200 bg-zinc-50/50"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Seçicilik / Ayrıştırma Modu (Rows)
  let gridCols = 'grid-cols-1';
  if (isUltraDense) gridCols = 'grid-cols-3'; 
  else if (isGridCompact) gridCols = 'grid-cols-2';

  return (
    <div
      className={`flex flex-col h-full bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative p-8 print:p-3 min-h-[297mm] transition-all duration-300`}
    >
      <PedagogicalHeader
        title={data?.title || 'FARKLI OLANI BUL & AYRIŞTIRMA'}
        instruction={data?.instruction || 'Görselleri dikkatlice inceleyin ve diğerlerinden farklı olan öğeyi işaretleyin.'}
        note={data?.pedagogicalNote}
        data={data}
      />

      <div className={`grid ${gridCols} gap-4 print:gap-2 mt-6 print:mt-4 flex-1 content-start px-2`}>
        {rows.map((row, index) => {
          const items = row?.items || [];
          const isHard =
            row?.visualDistractionLevel === 'high' || row?.visualDistractionLevel === 'extreme';
          const meta = row?.clinicalMeta;

          return (
            <EditableElement
              key={index}
              className={`
                                flex flex-col p-3 print:p-2 border-2 border-zinc-100 rounded-[1.5rem] bg-zinc-50/30 transition-all break-inside-avoid relative group hover:bg-white hover:border-indigo-400 hover:shadow-lg
                            `}
            >
              <div className={`absolute -top-2 -left-1 w-7 h-7 ${isHard ? 'bg-rose-600' : 'bg-zinc-900'} text-white rounded-xl flex items-center justify-center font-black shadow-md text-[10px] border-2 border-white z-10`}>
                {index + 1}
              </div>

              <div className="flex-1 flex items-center justify-center w-full gap-2 py-4 print:py-2">
                {items.map((item, itemIndex) => {
                  const isCorrect = itemIndex === row.correctIndex;

                  return (
                    <div
                      key={itemIndex}
                      className={`
                                                flex-1 aspect-square max-w-[50px] flex items-center justify-center border-2 border-zinc-100 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-all group/item bg-white shadow-sm relative overflow-hidden
                                                ${isHard ? 'border-amber-100' : ''}
                                            `}
                    >
                      {typeof item === 'object' &&
                      item !== null &&
                      'svg' in item &&
                      (item as any).svg ? (
                        <div
                          className="w-[75%] h-[75%] flex items-center justify-center transition-transform group-hover/item:scale-110 [&_svg]:w-full [&_svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: (item as any).svg }}
                        />
                      ) : (
                        <span
                          className={`font-black leading-none select-none text-zinc-900 font-mono transition-transform group-hover/item:scale-125
                                                        ${String(item).length > 5 ? 'text-[8px]' : String(item).length > 3 ? 'text-[10px]' : 'text-lg'}
                                                    `}
                          style={{
                            transform: `${meta?.isMirrored && isCorrect ? 'scaleX(-1)' : ''} rotate(${meta?.rotationAngle && isCorrect ? meta.rotationAngle : 0}deg)`,
                          }}
                        >
                          <EditableText value={String(item)} tag="span" />
                        </span>
                      )}

                      <div className="absolute inset-0 border-2 border-transparent group-hover/item:border-indigo-400/30 rounded-2xl pointer-events-none"></div>
                    </div>
                  );
                })}
              </div>

              {(settings?.showClinicalNotes || globalSettings?.includeClinicalNotes) && meta && (
                <div className="mt-2 pt-2 border-t border-zinc-100 flex justify-between items-center text-[7px] font-black uppercase text-indigo-400 tracking-widest opacity-30 group-hover:opacity-100 transition-opacity">
                   <span>{meta.errorType || 'AYRIŞTIRMA'}</span>
                   <div className="flex gap-2">
                      {meta.isMirrored && <span>Mirror</span>}
                      {meta.rotationAngle && <span>Rot: {meta.rotationAngle}°</span>}
                   </div>
                </div>
              )}
            </EditableElement>
          );
        })}
      </div>

      {/* Footer - Premium Compact */}
      <div className="mt-8 grid grid-cols-4 gap-4 pt-6 border-t-2 border-zinc-900">
        <div className="bg-zinc-900 text-white rounded-2xl p-4 flex flex-col justify-between h-20 shadow-xl">
          <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none">ANALİZ ODAĞI</span>
          <span className="text-[10px] font-black uppercase">Görsel Ayırt Etme</span>
        </div>
        <div className="bg-white border-2 border-zinc-100 rounded-2xl p-4 flex items-center justify-center h-20 shadow-sm">
           <i className="fa-solid fa-microscope text-2xl text-zinc-200"></i>
        </div>
        <div className="bg-white border-2 border-zinc-100 rounded-2xl p-4 flex flex-col justify-between h-20 shadow-sm col-span-2">
           <span className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-none">BİLİŞSEL SKORLAMA</span>
           <div className="flex justify-between items-end">
              <div className="flex gap-1.5">
                 {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-zinc-100 border border-zinc-200"></div>)}
              </div>
              <span className="text-[8px] font-mono text-zinc-400">bdmind.v6.2</span>
           </div>
        </div>
      </div>
    </div>
  );
};
