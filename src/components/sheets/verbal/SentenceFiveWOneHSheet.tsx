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
    <div className="flex flex-col min-h-full font-lexend text-zinc-800 p-3 bg-white">
      {/* Header Info Panel - Ultra Compact */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
             <i className="fa-solid fa-quote-left text-sm"></i>
          </div>
          <div>
            <h1 className="text-xs font-black text-zinc-900 leading-none">Cümlede 5N1K</h1>
            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
              Okuma Anlama · Dil Bilgisi
            </p>
          </div>
        </div>
        <div className="flex gap-1">
            <div className="px-1.5 py-0.5 bg-zinc-50 border border-zinc-100 rounded text-[7px] font-bold text-zinc-500">
                {(data.metadata?.ageGroup as string) || '8-10'} Yaş
            </div>
             <div className="px-1.5 py-0.5 bg-zinc-50 border border-zinc-100 rounded text-[7px] font-bold text-zinc-500 uppercase">
                {(data.metadata?.difficulty as string) || 'Orta'}
            </div>
        </div>
      </div>

      {/* Yönerge - Ultra Compact */}
      <div className="mb-3 p-2 bg-indigo-50/30 rounded-lg border border-indigo-100/50 flex items-start gap-2">
        <span className="text-sm leading-none">💡</span>
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-indigo-600 uppercase tracking-tight">Yönerge</span>
          <p className="text-[9px] font-medium text-zinc-600 leading-relaxed mt-0.5">
            {data.instruction as string}
          </p>
        </div>
      </div>

      {/* Cümle Kartları - Ultra Compact High Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {data.items.map((item, idx) => (
          <div key={item.id || idx} className="p-2 bg-white border border-zinc-200 rounded-lg relative overflow-hidden group hover:border-indigo-300 transition-colors">
            {/* Index Badge - KALDIRILDI */}
            
            {/* Cümle - Compact */}
            <div className="mb-2 px-2 py-1.5 bg-zinc-50 rounded-lg border border-zinc-100 border-l-2 border-l-indigo-500">
                <p className="text-[10px] font-bold text-zinc-800 leading-snug">
                    {item.sentence as string}
                </p>
            </div>

            {/* 5N1K Soru Listesi - Ultra Compact */}
            <div className={`grid ${item.questions.length > 3 ? 'grid-cols-2' : 'grid-cols-1'} gap-x-2 gap-y-1.5`}>
              {item.questions.map((q, qIdx) => (
                <div key={qIdx} className="flex flex-col gap-0.5">
                  <div className="flex items-center flex-wrap gap-1 px-0.5">
                      {getIcon(q.type)}
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter shrink-0">
                          {getLabel(q.type)}
                      </span>
                      {((data.settings?.showPredicate) || (data as any).showPredicate) && item.predicate && (
                        <span className="text-[7px] font-bold text-indigo-400 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100/50">
                           → {item.predicate as string}
                        </span>
                      )}
                  </div>
                  <div className="h-7 border-b border-zinc-100 flex items-end pb-0.5">
                      {/* Yazma Alanı Çizgisi - Compact */}
                      <div className="w-full h-px bg-zinc-50/50"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Pedagojik Not - Ultra Compact */}
      {data.pedagogicalNote && (
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-zinc-100 opacity-60">
            <p className="text-[8px] font-medium italic text-zinc-500 max-w-[300px]">
                <span className="font-bold not-italic">Uzman:</span> {data.pedagogicalNote as string}
            </p>
            <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-zinc-100 rounded flex items-center justify-center text-[8px]">⚙️</div>
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Oogmatik AI</span>
            </div>
        </div>
      )}
    </div>
  );
};
