import React from 'react';
import { HarfBaglamaData } from '../types';

interface HarfBaglamaSheetProps {
  data: HarfBaglamaData;
}

export const HarfBaglamaSheet: React.FC<HarfBaglamaSheetProps> = ({ data }) => {
  const { instruction, items = [], difficulty = 'Orta' } = data;

  return (
    <div className="w-full font-lexend p-[1cm] text-[12px] leading-[1.6] text-[#1a1a2e] bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[900px] flex flex-col">
      {/* Premium Başlık Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-indigo-100 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <i className="fa-solid fa-link text-indigo-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-indigo-900 uppercase tracking-tighter">
              Harf Bağlama Etkinliği
            </h1>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">
              Görsel Algı & Eşleştirme Motoru
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            SEVİYE: {difficulty}
          </span>
        </div>
      </div>

      {/* Modern Yönerge Box */}
      {instruction && (
        <div className="relative overflow-hidden mb-8 bg-gradient-to-r from-blue-50 to-indigo-50/30 p-4 rounded-2xl border border-blue-100/50">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <i className="fa-solid fa-circle-info text-6xl" />
          </div>
          <div className="flex items-start gap-3 relative z-10">
            <i className="fa-solid fa-quote-left text-blue-400 mt-1" />
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              {instruction}
            </p>
          </div>
        </div>
      )}

      {/* Ana Etkinlik Alanı: İki Sütunlu Bağlantı Platformu */}
      <div className="flex-1 flex justify-around items-center px-12 py-8 relative">
        {/* Dekoratif orta çizgi (arka plan) */}
        <div className="absolute inset-y-8 left-1/2 w-0.5 border-r-2 border-dashed border-slate-100 -translate-x-1/2" />

        {/* Sol Sütun: Büyük Harfler */}
        <div className="flex flex-col gap-6 w-1/3">
          {items.map((item, idx) => (
            <div key={`left-${item.id}`} className="flex items-center justify-between group">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm group-hover:border-indigo-400 transition-colors">
                <span className="text-3xl font-black text-slate-800">{item.leftItem}</span>
              </div>
              {/* Bağlantı Noktası */}
              <div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-white ring-2 ring-slate-100" />
            </div>
          ))}
        </div>

        {/* Sağ Sütun: Küçük Harfler */}
        <div className="flex flex-col gap-6 w-1/3">
          {items.map((item, idx) => (
            <div key={`right-${item.id}`} className="flex items-center justify-between flex-row-reverse group">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center shadow-sm group-hover:border-blue-400 transition-colors cursor-pointer">
                <span className="text-3xl font-black text-slate-700">{item.rightItem}</span>
              </div>
              {/* Bağlantı Noktası */}
              <div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-white ring-2 ring-slate-100" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
