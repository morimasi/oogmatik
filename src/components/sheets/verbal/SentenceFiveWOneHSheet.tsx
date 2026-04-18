import React from 'react';
import { Sentence5W1HData } from '../../../types/verbal';

interface Props {
  data: Sentence5W1HData;
}

/**
 * Cümlede 5N1K Çalışma Kağıdı - Ultra Profesyonel Tasarım
 * Her cümlede 6 sorunun tamamını ve premium ikonları barındırır.
 */
export const SentenceFiveWOneHSheet: React.FC<Props> = ({ data }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'who': return <i className="fa-solid fa-circle-user text-indigo-500 text-xs"></i>;
      case 'what': return <i className="fa-solid fa-cube text-emerald-500 text-xs"></i>;
      case 'where': return <i className="fa-solid fa-location-dot text-rose-500 text-xs"></i>;
      case 'when': return <i className="fa-solid fa-clock text-amber-500 text-xs"></i>;
      case 'how': return <i className="fa-solid fa-wand-magic-sparkles text-purple-500 text-xs"></i>;
      case 'why': return <i className="fa-solid fa-brain text-blue-500 text-xs"></i>;
      default: return <i className="fa-solid fa-question text-zinc-400 text-xs"></i>;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'who': return 'Kim?';
      case 'what': return 'Ne?';
      case 'where': return 'Nerede?';
      case 'when': return 'Ne zaman?';
      case 'how': return 'Nasıl?';
      case 'why': return 'Niçin?';
      default: return 'Soru:';
    }
  };

  return (
    <div className="flex flex-col min-h-full font-lexend text-zinc-800 p-2 bg-white">
      {/* Header Info Panel */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
             <i className="fa-solid fa-quote-left text-lg"></i>
          </div>
          <div>
            <h1 className="text-sm font-black text-zinc-900 leading-none">Cümlede 5N1K ve Analiz</h1>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
              Okuma Anlama · Odaklanma · Dil Bilgisi
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            <div className="px-2 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-[8px] font-bold text-zinc-500">
                {data.metadata?.ageGroup} Yaş
            </div>
             <div className="px-2 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-[8px] font-bold text-zinc-500 uppercase">
                {data.metadata?.difficulty}
            </div>
        </div>
      </div>

      {/* Yönerge - Ultra Premium */}
      <div className="mb-4 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-start gap-3">
        <span className="text-xl leading-none">💡</span>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">Eğitmen Notu & Yönerge</span>
          <p className="text-[11px] font-medium text-zinc-600 leading-relaxed mt-0.5">
            {data.instruction} Cümlenin tüm öğelerini dikkatlice bulup ilgili kutucuklara yazınız.
          </p>
        </div>
      </div>

      {/* Cümle Kartları - High Density 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.items.map((item, idx) => (
          <div key={item.id || idx} className="p-3 bg-white border border-dashed border-zinc-200 rounded-[1.5rem] relative overflow-hidden group hover:border-indigo-300 transition-colors">
            {/* Index Badge */}
            <div className="absolute top-0 right-0 p-2 opacity-5">
                <span className="text-5xl font-black">{idx + 1}</span>
            </div>

            {/* Cümle */}
            <div className="mb-3 px-3 py-2 bg-zinc-50 rounded-xl border border-zinc-100 border-l-4 border-l-indigo-500">
                <p className="text-[12px] font-bold text-zinc-800 leading-snug">
                    {item.sentence}
                </p>
            </div>

            {/* 5N1K Soru Listesi */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {['who', 'what', 'where', 'when', 'how', 'why'].map((type) => {
                const q = item.questions.find(q => q.type === type);
                return (
                  <div key={type} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 px-1">
                        {getIcon(type)}
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                            {getLabel(type)}
                        </span>
                    </div>
                    <div className="h-6 border-b border-zinc-100 flex items-end pb-0.5">
                        {/* Yazma Alanı Çizgisi */}
                        <div className="w-full h-px bg-zinc-50"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Pedagojik Not */}
      {data.pedagogicalNote && (
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-100 opacity-60">
            <p className="text-[9px] font-medium italic text-zinc-500 max-w-[400px]">
                <span className="font-bold not-italic">Uzman Notu:</span> {data.pedagogicalNote}
            </p>
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-zinc-100 rounded-lg flex items-center justify-center text-[10px]">⚙️</div>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Oogmatik AI Content Engine v2.5</span>
            </div>
        </div>
      )}
    </div>
  );
};
