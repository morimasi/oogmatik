import React from 'react';
import { Sentence5W1HData } from '../../../types/verbal';

interface Props {
  data: Sentence5W1HData;
}

/**
 * Cümlede 5N1K Çalışma Kağıdı - Ultra Profesyonel Tasarım
 * Bu bileşen, her bir cümleyi ve ilgili 5N1K sorularını kompakt bir yapıda sunar.
 */
export const SentenceFiveWOneHSheet: React.FC<Props> = ({ data }) => {
  const fontFamily = 'Lexend';

  return (
    <div className="w-full h-full p-8 print:p-6 flex flex-col bg-white overflow-hidden text-zinc-800 border-none relative" style={{ fontFamily }}>
      {/* Üst Bilgi Paneli */}
      <div className="relative z-10 flex justify-between items-start border-b-2 border-indigo-100 pb-4 mb-6 print:mb-4">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <i className="fa-solid fa-list-check text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-indigo-950 tracking-tight uppercase leading-none">
              {data.title || 'CÜMLEDE 5N1K ÇALIŞMASI'}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Hızlı ve Etkili Okuduğunu Anlama Antrenmanı
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter w-12 text-right">TARİH:</span>
            <div className="w-24 border-b border-slate-200 h-3"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter w-12 text-right">ÖĞRENCİ:</span>
            <div className="w-40 border-b-2 border-slate-300 h-4"></div>
          </div>
        </div>
      </div>

      <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100 mb-6 print:mb-4">
        <p className="text-[13px] font-bold text-rose-950 leading-tight">
          <i className="fa-solid fa-circle-info mr-2 text-rose-500"></i>
          {data.instruction || 'Aşağıdaki cümleleri dikkatle oku ve yanlarındaki soruların cevaplarını boşluklara yaz.'}
        </p>
      </div>

      {/* Cümle Kartları - 2 Sütunlu Grid (Yüksek Yoğunluk) */}
      <div className="flex-1 grid grid-cols-2 gap-4 print:gap-3 overflow-hidden">
        {data.items.map((item, idx) => (
          <div 
            key={item.id || idx} 
            className="flex flex-col border border-slate-200 rounded-2xl p-4 print:p-3 bg-white hover:border-indigo-300 transition-colors page-break-inside-avoid relative"
          >
            {/* Numara Rozeti */}
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-md z-20">
              {idx + 1}
            </div>

            {/* Cümle Alanı */}
            <div className="mb-3 p-3 bg-slate-50 rounded-xl border-l-4 border-indigo-500">
              <p className="text-[15px] font-bold text-slate-900 leading-relaxed italic">
                "{item.sentence}"
              </p>
            </div>

            {/* Sorular Alanı */}
            <div className="space-y-3 pl-1">
              {item.questions.map((q, qIdx) => (
                <div key={qIdx} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black rounded uppercase">
                      {q.type}
                    </span>
                    <span className="text-[13px] font-extrabold text-slate-800">
                      {q.question}
                    </span>
                  </div>
                  <div className="ml-2 border-b border-slate-200 h-5 w-full flex items-end">
                    {/* Cevap alanı için çizgi */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pedagojik Not */}
      {data.pedagogicalNote && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="bg-indigo-50/30 rounded-xl p-2.5 border border-indigo-100/50">
            <div className="flex items-center gap-2 mb-0.5">
              <i className="fa-solid fa-graduation-cap text-[10px] text-indigo-600"></i>
              <span className="text-[9px] font-black text-indigo-800 uppercase tracking-tighter">Uzman Notu:</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 font-medium tracking-tight">
              {data.pedagogicalNote}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-3 pt-2 flex justify-between items-center text-[8px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-50">
        <div className="flex items-center gap-2">
          <span>OOGMATIK EDTECH</span>
          <span className="w-1 h-1 bg-indigo-200 rounded-full"></span>
          <span>Bilişsel Gelişim Serisi</span>
        </div>
        <span>500 Pedagogical Dataset Edition</span>
      </footer>
    </div>
  );
};
