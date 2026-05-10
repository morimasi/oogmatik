import React from 'react';

/**
 * Harf Bağlama Etkinliği — A4 Çalışma Kağıdı Render Bileşeni
 * Otonom scaffold tarafından üretildi.
 * 
 * Tasarım: Lexend font, 0.5cm margin, compact grid, disleksi dostu
 */
interface HarfBaglamaSheetProps {
  data: {
    instruction?: string;
    items?: HarfBaglamaDataItem[];
    pedagogicalNote?: string;
    difficulty?: string;
  };
}

interface HarfBaglamaDataItem {
  id: string;

}

export const HarfBaglamaSheet: React.FC<HarfBaglamaSheetProps> = ({ data }) => {
  const { instruction, items = [], pedagogicalNote, difficulty = 'Orta' } = data;

  return (
    <div className="w-full font-lexend p-[0.5cm] text-[11px] leading-[1.5] text-[#1a1a2e]">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-indigo-200">
        <div className="flex items-center gap-2">
          <i className="fa-link text-indigo-600 text-lg" />
          <h1 className="text-lg font-black text-indigo-900 uppercase tracking-tight">
            Harf Bağlama Etkinliği
          </h1>
        </div>
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
          {difficulty}
        </span>
      </div>

      {/* Yönerge */}
      {instruction && (
        <p className="text-sm font-bold text-zinc-700 mb-4 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
          <i className="fa-solid fa-circle-info text-indigo-400 mr-1.5" />
          {instruction}
        </p>
      )}

      {/* İçerik Grid */}
      <div className="grid grid-cols- gap-3">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-3 border border-zinc-200 rounded-xl bg-white hover:shadow-sm transition-shadow"
          >
            <span className="text-[9px] font-black text-zinc-300 uppercase">
              {idx + 1}
            </span>
            <div className="mt-1 text-sm font-bold text-zinc-800">
              {JSON.stringify(item)}
            </div>
          </div>
        ))}
      </div>

      {/* Pedagojik Not (Öğretmen İçin) */}
      {pedagogicalNote && (
        <div className="mt-4 pt-2 border-t border-dashed border-zinc-200 text-[8px] text-zinc-400 italic">
          <i className="fa-solid fa-chalkboard-user mr-1" />
          {pedagogicalNote}
        </div>
      )}
    </div>
  );
};
