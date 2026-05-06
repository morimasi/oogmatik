import React from 'react';
import { PedagogicalHeader } from '../common';

interface Question {
  id: string;
  question: string;
  answer?: string;
  hint?: string;
  lines?: number;
}

interface ShortAnswerData {
  title: string;
  instruction?: string;
  questions: Question[];
  pedagogicalNote?: string;
  settings?: any;
}

export const ShortAnswerSheet: React.FC<{ data: ShortAnswerData; settings?: any }> = ({ data, settings: globalSettings }) => {
  const { questions = [], title, instruction, pedagogicalNote } = data;
  const isLandscape = globalSettings?.orientation === 'landscape';
  const isCompact = globalSettings?.compact ?? true;

  // Bulmaca sayısına göre sığdırma stratejisi
  // Dopdolu bir çıktı için 2 sütunlu düzen (özellikle dikey modda)
  const gridCols = isLandscape ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';
  const gapClass = isCompact ? 'gap-2 print:gap-1' : 'gap-6 print:gap-4';

  return (
    <div className={`w-full h-full p-8 print:p-4 flex flex-col bg-white overflow-hidden text-zinc-900 font-lexend ${isLandscape ? 'landscape' : ''}`}>
      {/* BAŞLIK */}
      <div className={`flex justify-between items-center border-b-4 border-indigo-500 pb-3 ${isCompact ? 'mb-2' : 'mb-6'}`}>
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tighter uppercase leading-tight">
            {title || 'Kısa Cevaplı Sorular'}
          </h1>
          <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
            {instruction || 'Soruları dikkatlice okuyup boşluklara cevaplarını yazınız.'}
          </p>
        </div>
        <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-indigo-100 shrink-0">
          <i className="fa-solid fa-pen-clip"></i>
        </div>
      </div>

      {/* SORULAR GRİD */}
      <div className={`flex-1 grid ${gridCols} ${gapClass} auto-rows-max overflow-hidden`}>
        {questions.map((q, idx) => (
          <div 
            key={q.id || idx} 
            className={`flex flex-col p-3 border-2 border-zinc-100 rounded-2xl bg-zinc-50/50 relative page-break-inside-avoid ${
              isCompact ? 'p-2 rounded-xl' : 'p-4'
            }`}
          >
            {/* Soru Numarası */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-md">
              {idx + 1}
            </div>

            <div className="flex-1">
              <p className={`font-bold text-zinc-800 leading-tight mb-2 ${isCompact ? 'text-[11px]' : 'text-sm'}`}>
                {q.question}
              </p>
              
              {/* Cevap Satırları */}
              <div className="space-y-1.5 mt-auto">
                {Array.from({ length: q.lines || 2 }).map((_, lIdx) => (
                  <div key={lIdx} className="w-full border-b border-zinc-300 h-5 md:h-6"></div>
                ))}
              </div>
            </div>

            {q.hint && !isCompact && (
              <div className="mt-2 flex items-center gap-1.5 text-[9px] text-amber-600 font-bold italic">
                <i className="fa-solid fa-lightbulb"></i>
                <span>İpucu: {q.hint}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FOOTER & PEDAGOJİK NOT */}
      <div className="mt-auto pt-4 flex flex-col gap-3">
        {pedagogicalNote && (
          <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
             <p className="text-[9px] font-bold text-indigo-800 leading-tight italic">
               <i className="fa-solid fa-graduation-cap mr-1.5"></i>
               {pedagogicalNote}
             </p>
          </div>
        )}
        
        <div className="flex justify-between items-center text-[8px] font-black text-slate-300 uppercase tracking-widest">
          <span>Oogmatik Özel Eğitim Teknolojileri • Kısa Cevaplı Sorular Modülü</span>
          <span>Soru Sayısı: {questions.length}</span>
        </div>
      </div>
    </div>
  );
};
