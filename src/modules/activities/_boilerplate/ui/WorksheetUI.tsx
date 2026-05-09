import React from 'react';
import { BoilerplateData } from '../types';

interface WorksheetUIProps {
  data: BoilerplateData;
}

/**
 * ULTRA PREMIUM A4 WORKSHEET RENDERER
 * - 0.5cm Marj (Kompakt ve Dolu Dolu görünüm)
 * - Yüksek Kontrast (Disleksi Dostu)
 * - Yalnızca siyah ve koyu gri tonları (Yazıcı dostu)
 */
export const WorksheetUI = ({ data }: WorksheetUIProps) => {
  return (
    <div className="w-full bg-white flex flex-col pt-0 text-black">
      {/* BAŞLIK & YÖNERGE */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 border-b-2 border-slate-800 pb-2 mb-2 inline-block">
          {data.title}
        </h2>
        <p className="text-sm font-semibold text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200">
          {data.instruction}
        </p>
      </div>

      {/* DİNAMİK İÇERİK (Dolu Dolu Kompakt Grid) */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {data.content.items.map((item: any, index: number) => (
          <div key={item.id} className="border-2 border-slate-300 rounded-2xl p-4 flex items-start gap-3 shadow-sm break-inside-avoid">
             <div className="w-10 h-10 rounded-full border-2 border-slate-800 flex items-center justify-center font-black text-lg bg-slate-50 shrink-0">
               {index + 1}
             </div>
             <div className="flex-1">
               <h4 className="text-sm font-black text-slate-700 font-[Lexend] mb-3 leading-snug">
                 {item.visualHint && <span className="mr-2 text-xl">{item.visualHint}</span>}
                 {item.question}
               </h4>
               <div className="w-full h-8 border-b-2 border-dashed border-slate-400 mt-2"></div>
             </div>
          </div>
        ))}
      </div>

      {/* FOOTER & PEDAGOJİK NOT */}
      <div className="mt-6 pt-4 border-t-2 border-slate-200 flex justify-between items-end text-[10px] text-slate-400 font-bold">
         <div className="w-2/3 italic">
           Uzman Notu: {data.content.pedagogicalNote}
         </div>
         <div className="bg-slate-800 text-white px-3 py-1 rounded-xl">Oogmatik Ultra Premium</div>
      </div>
    </div>
  );
};
