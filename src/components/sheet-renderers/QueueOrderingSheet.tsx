import React from 'react';
import { PedagogicalHeader } from '../sheets/common';

interface QueueOrderingSheetProps {
  data: any;
  settings?: any;
}

export const QueueOrderingSheet = ({ data, settings }: QueueOrderingSheetProps) => {
  const contentData = data?.content || data;
  const targetData = Array.isArray(contentData) ? (contentData[0] || {}) : (contentData || {});
  const { problems, title, instruction, difficulty, locationType } = targetData;

  if (!problems || !Array.isArray(problems) || problems.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-400 font-['Lexend']">
        <p className="text-sm font-bold">Kuyruk sıralama verisi oluşturulamadı.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-['Lexend'] min-h-[297mm] p-4 print:p-2 bg-white transition-all duration-300">
      <PedagogicalHeader
        title={title || 'Sıra Alma & Mantıksal Sıralama Becerisi'}
        instruction={instruction || 'Sorulardaki yön ipuçlarını takip ederek doğru sırayı bulun.'}
        data={targetData}
      />

      {/* PROBLEMS CONTAINER */}
      <div className="grid grid-cols-2 gap-3 print:gap-2 flex-1 my-2 content-start items-stretch">
        {problems.map((problem: any, idx: number) => (
          <div
            key={problem.id || idx}
            className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 p-3 print:p-2 flex flex-col justify-between shadow-2xs relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-indigo-100 pb-1.5 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1">
                  <i className="fa-solid fa-users-line text-[8px]"></i>
                  {problem.locationName || 'Kuyruk Sırası'}
                </span>
                <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-md">
                  {problem.totalPeople} Kişi Kuyrukta
                </span>
              </div>
              <span className="text-[9px] font-black text-zinc-400 uppercase">Soru #{idx + 1}</span>
            </div>

            {/* Scenario */}
            <div className="flex-1 flex flex-col justify-between gap-2">
              <div className="p-2 bg-white rounded-xl border border-indigo-100 shadow-2xs">
                <p className="text-xs print:text-[10px] font-bold text-zinc-800 leading-snug">
                  {problem.scenario}
                </p>
              </div>

              {/* Question Text */}
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-2xs">
                <p className="text-xs print:text-[10px] font-black leading-snug flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-question text-amber-300"></i>
                  {problem.questionText}
                </p>
              </div>

              {/* Unique Math Answer Options */}
              <div className="grid grid-cols-4 gap-1.5 mt-1">
                {problem.options?.map((opt: string, oIdx: number) => (
                  <div
                    key={oIdx}
                    className="p-1.5 bg-white border-2 border-indigo-100 rounded-lg text-center font-extrabold text-[10px] text-indigo-900 shadow-2xs"
                  >
                    {opt}
                  </div>
                ))}
              </div>

              {/* Solution Answer Line */}
              <div className="pt-1.5 border-t border-dashed border-indigo-200 mt-auto flex items-center justify-between">
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Doğru Cevabın:</span>
                <div className="w-20 print:w-16 h-5 bg-white border border-indigo-300 rounded-md shadow-2xs"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CLINICAL FOOTER */}
      <div className="mt-auto pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-2xl bg-zinc-900 text-white">
        <div className="col-span-1 flex flex-col justify-center">
          <span className="text-[8px] font-black uppercase leading-tight text-zinc-400">
            SIRALAMA BECERİSİ &<br />MANTIKSAL AKIL YÜRÜTME
          </span>
        </div>
        {[
          { label: 'HEDEF SÜRE', val: '10:00', unit: 'dk' },
          { label: 'ÇÖZÜLEN', val: '___', unit: 'Soru' },
          { label: 'BAŞARI PUANI', val: '___', unit: 'p' },
        ].map((item) => (
          <div key={item.label} className="bg-white/10 border border-white/10 rounded-lg p-1.5 flex flex-col justify-between">
            <span className="text-[7px] font-black text-zinc-400 uppercase">{item.label}</span>
            <div className="flex items-end gap-0.5">
              <span className="text-xs font-black text-white">{item.val}</span>
              <span className="text-[6px] font-bold text-zinc-400 mb-0.5">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
