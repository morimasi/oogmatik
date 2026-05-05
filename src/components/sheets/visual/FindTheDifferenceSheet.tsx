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
  const isLandscape = globalSettings?.orientation === 'landscape';
  const isUltraDense = settings?.layout === 'ultra_dense' || globalSettings?.compact;
  const isGridCompact = settings?.layout === 'grid_compact' || isUltraDense;
  const isSideBySide = settings?.layout === 'side_by_side' || (data.gridA && data.gridB);

  if (isSideBySide && data.gridA && data.gridB) {
    return (
      <div
        className={`flex flex-col h-full bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative p-10 print:p-6 min-h-[210mm] ${isLandscape ? 'landscape' : 'min-h-[297mm]'}`}
      >
        <PedagogicalHeader
          title={data?.title || 'FARK BULMACA: TABLO KARŞILAŞTIRMA'}
          instruction={
            data?.instruction ||
            `Sol taraftaki tablo ile sağ taraftaki tablo arasındaki ${data.diffCount || ''} farkı bulun.`
          }
          note={data?.pedagogicalNote}
          data={data}
        />

        <div
          className={`flex-1 flex ${isLandscape ? 'flex-row' : 'flex-col'} gap-6 print:gap-4 mt-8 print:mt-2 items-center justify-center px-4 print:px-0`}
        >
          {/* Tablo A */}
          <div className="flex-1 flex flex-col items-center gap-4 print:gap-2 w-full max-w-full overflow-hidden">
            <div className="px-4 py-1.5 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg flex items-center gap-2">
              <i className="fa-solid fa-crosshairs text-indigo-400"></i>
              REFERANS TABLO
            </div>
            <div
              className="w-full grid gap-2 p-4 print:p-1.5 border-[3px] border-zinc-900 bg-white rounded-3xl shadow-[10px_10px_0px_rgba(0,0,0,0.03)]"
              style={{ gridTemplateColumns: `repeat(${data.gridA[0].length}, 1fr)` }}
            >
              {data.gridA.flat().map((cell, i) => (
                <div
                  key={i}
                  className="aspect-square border-[1.5px] border-zinc-100 rounded-xl flex items-center justify-center font-black text-xl bg-zinc-50/20 shadow-inner overflow-hidden"
                >
                  <EditableText value={String(cell)} tag="span" className="scale-90" />
                </div>
              ))}
            </div>
          </div>

          {/* Ayırıcı / Ok */}
          {!isLandscape && (
            <div className="flex items-center justify-center py-2 opacity-20">
               <i className="fa-solid fa-arrow-down text-xl"></i>
            </div>
          )}

          {/* Tablo B */}
          <div className="flex-1 flex flex-col items-center gap-4 print:gap-2 w-full max-w-full overflow-hidden">
            <div className="px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-white/80"></i>
              FARKLARI İŞARETLE
            </div>
            <div
              className="w-full grid gap-2 p-4 print:p-1.5 border-[3px] border-indigo-600 bg-white rounded-3xl shadow-[10px_10px_0px_rgba(79,70,229,0.03)]"
              style={{ gridTemplateColumns: `repeat(${data.gridB[0].length}, 1fr)` }}
            >
              {data.gridB.flat().map((cell, i) => (
                <div
                  key={i}
                  className="aspect-square border-[1.5px] border-indigo-100 rounded-xl flex items-center justify-center font-black text-xl hover:bg-indigo-50 cursor-pointer transition-all relative group bg-white shadow-sm overflow-hidden"
                >
                  <EditableText value={String(cell)} tag="span" className="scale-90" />
                  <div className="absolute inset-1 rounded-lg border-[1.5px] border-transparent group-hover:border-indigo-300 border-dashed"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alt Klinik Panel */}
        <div className="mt-12 pt-8 border-t-[4px] border-zinc-900 grid grid-cols-3 gap-6">
          <div className="bg-zinc-900 text-white rounded-3xl p-5 flex flex-col justify-between h-24">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">
              HEDEF ANALİZ
            </span>
            <span className="text-xl font-black uppercase tracking-tighter">
              {data.diffCount} ADET FARK
            </span>
          </div>
          <div className="bg-white border-2 border-zinc-900 rounded-3xl p-5 flex flex-col justify-between h-24 shadow-lg">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
              İŞLEM SÜRESİ
            </span>
            <span className="text-2xl font-black">__:__</span>
          </div>
          <div className="bg-white border-2 border-zinc-900 rounded-3xl p-5 flex flex-col justify-between h-24 shadow-lg">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
              HATA / SKOR
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-zinc-100 bg-zinc-50"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Seçicilik / Ayrıştırma Modu (Rows)
  let gridCols = 'grid-cols-1';
  if (isUltraDense) gridCols = 'grid-cols-2'; // 3'ten 2'ye düşürerek taşmayı önle
  else if (isGridCompact) gridCols = 'grid-cols-1';

  return (
    <div
      className={`flex flex-col h-full bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative p-8 print:p-3 min-h-[210mm] ${isLandscape ? 'landscape' : 'min-h-[297mm]'}`}
    >
      <PedagogicalHeader
        title={data?.title || 'FARKLI OLANI BUL & AYRIŞTIRMA'}
        instruction={data?.instruction || 'Diğerlerinden farklı olan öğeyi bulun ve işaretleyin.'}
        note={data?.pedagogicalNote}
        data={data}
      />

      <div className={`grid ${gridCols} gap-4 print:gap-2 mt-6 print:mt-2 flex-1 content-start`}>
        {rows.map((row, index) => {
          const items = row?.items || [];
          const isHard =
            row?.visualDistractionLevel === 'high' || row?.visualDistractionLevel === 'extreme';
          const meta = row?.clinicalMeta;

          return (
            <EditableElement
              key={index}
              className={`
                                flex flex-col p-4 print:p-2 border-2 border-zinc-100 rounded-[2rem] bg-zinc-50/40 transition-all break-inside-avoid relative group hover:bg-white hover:border-indigo-300
                                ${isUltraDense ? 'p-3 rounded-2xl' : ''}
                            `}
            >
              <div className="absolute -top-2 -left-1 w-6 h-6 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-black shadow-md text-[10px] border-2 border-white z-10">
                {index + 1}
              </div>

              <div className="flex-1 flex items-center justify-around w-full gap-2 py-2 print:py-1">
                {items.map((item, itemIndex) => {
                  const isCorrect = itemIndex === row.correctIndex;

                  return (
                    <div
                      key={itemIndex}
                      className={`
                                                flex-1 aspect-square max-w-[50px] flex items-center justify-center border-2 border-zinc-100 rounded-xl cursor-pointer hover:bg-indigo-50 transition-all group/item bg-white shadow-sm relative overflow-hidden
                                                ${isHard ? 'ring-1 ring-amber-500/20' : ''}
                                            `}
                    >
                      {typeof item === 'object' &&
                      item !== null &&
                      'svg' in item &&
                      (item as any).svg ? (
                        <div
                          className="w-[80%] h-[85%] flex items-center justify-center transition-transform group-hover/item:scale-110 [&_svg]:w-full [&_svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: (item as any).svg }}
                        />
                      ) : (
                        <span
                          className={`font-black leading-none select-none text-zinc-900 font-mono transition-transform group-hover/item:scale-125
                                                        ${String(item).length > 5 ? 'text-[8px]' : String(item).length > 3 ? 'text-xs' : 'text-xl'}
                                                    `}
                          style={{
                            transform: `${meta?.isMirrored && isCorrect ? 'scaleX(-1)' : ''} rotate(${meta?.rotationAngle && isCorrect ? meta.rotationAngle : 0}deg)`,
                          }}
                        >
                          <EditableText value={String(item)} tag="span" />
                        </span>
                      )}

                      {/* İşaretleme Alanı */}
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-zinc-50 rounded-tl-xl border-l border-t border-zinc-100 group-hover/item:bg-indigo-600 group-hover/item:border-indigo-600 transition-all"></div>
                    </div>
                  );
                })}
              </div>

              {(settings?.showClinicalNotes || globalSettings?.includeClinicalNotes) && meta && (
                <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-between items-center text-[8px] font-black uppercase text-indigo-400 tracking-[0.15em] opacity-40 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-fingerprint"></i>
                    <span>{meta.errorType || 'AYRIŞTIRMA ODAKLI'}</span>
                  </div>
                  <div className="flex gap-3">
                    {meta.isMirrored && (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-500 rounded-full">
                        AYNA ETKİSİ
                      </span>
                    )}
                    {meta.rotationAngle && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-500 rounded-full">
                        ROTASYON {meta.rotationAngle}°
                      </span>
                    )}
                  </div>
                </div>
              )}
            </EditableElement>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto grid grid-cols-3 gap-6 pt-8 border-t-[4px] border-zinc-900">
        <div className="bg-zinc-900 text-white rounded-3xl p-5 flex flex-col justify-between h-20 shadow-xl">
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">
            BİLİŞSEL ODAK
          </span>
          <span className="text-xs font-black uppercase tracking-tight">
            Görsel Seçicilik & Ketleme
          </span>
        </div>
        <div className="bg-white border-2 border-zinc-900 rounded-3xl p-5 h-20 flex items-center justify-center">
          <i className="fa-solid fa-microscope text-3xl text-zinc-200"></i>
        </div>
        <div className="bg-white border-2 border-zinc-900 rounded-3xl p-5 flex flex-col justify-between h-20 shadow-lg">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
            VERSİYON PROTOKOL
          </span>
          <span className="text-[10px] font-black text-zinc-900 uppercase">
            DİSKRİMİNASYON v6.2.0
          </span>
        </div>
      </div>
    </div>
  );
};
