import React from 'react';
import { HarfBaglamaData } from '../types';

interface HarfBaglamaSheetProps {
  data: HarfBaglamaData;
}

export const HarfBaglamaSheet: React.FC<HarfBaglamaSheetProps> = ({ data }) => {
  const {
    instruction,
    items = [],
    difficulty = 'Orta',
    mode = 'standard',
    fontSize = 10,
    primaryColor = '#4f46e5',
    secondaryColor = '#ec4899'
  } = data || {};

  // Kızlım modu için renkler
  const isGirlMode = mode === 'girl';
  const headerGradient = isGirlMode
    ? 'from-pink-400 via-purple-400 to-indigo-400'
    : 'from-indigo-500 via-purple-500 to-pink-500';
  const iconColor = isGirlMode ? '#ec4899' : primaryColor;
  const borderColor = isGirlMode ? '#fce7f3' : `${primaryColor}15`;

  return (
    <div
      className="w-full font-lexend text-[#1a1a2e] bg-white flex flex-col"
      style={{
        width: '210mm',
        minHeight: '297mm',
        paddingTop: '15mm',
        paddingBottom: '15mm',
        paddingLeft: '12mm',
        paddingRight: '12mm',
        fontSize: `${fontSize}pt`,
        lineHeight: 1.4
      }}
    >
      {/* Premium Başlık Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b-2 relative" style={{ borderColor: borderColor }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}10`, borderColor: `${iconColor}25`, borderWidth: 1 }}
          >
            <i
              className={`fa-solid fa-link text-xl`}
              style={{ color: iconColor }}
            />
          </div>
          <div>
            <h1
              className="text-xl font-black uppercase tracking-tighter bg-gradient-to-r bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
            >
              {isGirlMode ? 'Prenses Harf Bağlama' : 'Harf Bağlama Etkinliği'}
            </h1>
            <p className="text-[8pt] font-bold uppercase tracking-widest mt-0.5" style={{ color: `${iconColor}99` }}>
              {isGirlMode ? 'Sihirli Kelime Dünyası' : 'Görsel Algı & Eşleştirme Motoru'}
            </p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
          <span className="text-[8pt] font-black text-slate-500 uppercase tracking-widest">
            SEVİYE: {difficulty}
          </span>
        </div>
      </div>

      {/* Modern Yönerge Box */}
      {instruction && (
        <div
          className="relative overflow-hidden mb-6 p-3.5 rounded-2xl"
          style={{
            background: isGirlMode
              ? `linear-gradient(to right, #fdf2f8, #faf5ff)`
              : `linear-gradient(to right, ${primaryColor}05, ${secondaryColor}05)`,
            borderColor: isGirlMode ? '#fce7f3' : `${primaryColor}10`,
            borderWidth: 1
          }}
        >
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <i className="fa-solid fa-circle-info text-5xl" style={{ color: iconColor }} />
          </div>
          <div className="flex items-start gap-2.5 relative z-10">
            <i className="fa-solid fa-quote-left mt-1" style={{ color: iconColor }} />
            <p className="text-[10pt] font-bold text-slate-700 leading-relaxed">
              {instruction}
            </p>
          </div>
        </div>
      )}

      {/* Ana Etkinlik Alanı: İki Sütunlu Bağlantı Platformu */}
      <div className="flex-1 flex justify-around items-start px-6 py-4 relative">
        {/* Dekoratif orta çizgi (arka plan) */}
        <div className="absolute inset-y-4 left-1/2 w-0.5 border-r-2 border-dashed -translate-x-1/2" style={{ borderColor: `${iconColor}15` }} />

        {/* Sol Sütun: Büyük Harfler */}
        <div className="flex flex-col gap-4 w-1/3">
          {items.map((item) => (
            <div key={`left-${item.id}`} className="flex items-center justify-between group">
              <div
                className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm transition-colors"
                style={{ borderColor: `${iconColor}25`, borderWidth: 2 }}
              >
                <span
                  className="text-2xl font-black"
                  style={{ color: iconColor }}
                >
                  {item.leftItem}
                </span>
              </div>
              {/* Bağlantı Noktası */}
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: `${iconColor}20` }} />
            </div>
          ))}
        </div>

        {/* Sağ Sütun: Küçük Harfler - karıştırılmış */}
        <div className="flex flex-col gap-4 w-1/3">
          {[...items]
            .sort(() => Math.random() - 0.5)
            .map((item) => (
              <div key={`right-${item.id}`} className="flex items-center justify-between flex-row-reverse group">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                  style={{ backgroundColor: `${iconColor}05`, borderColor: `${iconColor}20`, borderWidth: 2 }}
                >
                  <span className="text-2xl font-black text-slate-700">{item.rightItem}</span>
                </div>
                {/* Bağlantı Noktası */}
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: `${iconColor}20` }} />
              </div>
            ))}
        </div>
      </div>

    </div>
  );
};
