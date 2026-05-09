import * as React from 'react';
import { SemanticLinkerData, SemanticLinkerItem, SemanticLinkerOption } from '../types.js';


/**
 * SemanticLinkerUI: Anlamsal İlişki Kurma A4 Render Bileşeni
 */
export const SemanticLinkerUI = ({ data }: { data: SemanticLinkerData }) => {

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="w-full text-center py-2 px-4 mb-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl text-sm font-black text-zinc-700 italic uppercase tracking-tighter">
        {data.instruction}
      </h2>

      <div className="w-full grid grid-cols-2 gap-x-6 gap-y-4">
        {data.items?.slice(0, 10).map((item: SemanticLinkerItem, idx: number) => (
          <div key={item.id} className="relative flex items-start gap-3">
             {/* Görseldeki kalp göstergesi */}
             <div className="mt-4 w-6 h-6 border-2 border-zinc-200 rounded-full flex items-center justify-center shrink-0">
                <i className="fa-regular fa-heart text-[10px] text-zinc-300"></i>
             </div>

             {/* Soru Kutusu */}
             <div className="flex-1 p-3 border-2 border-zinc-100 rounded-2xl bg-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-zinc-50 border-l border-b border-zinc-100 rounded-bl-xl text-[8px] font-black text-zinc-400">
                  {idx + 1}
                </div>
                
                <p className="text-[12px] font-bold text-zinc-700 mb-2 leading-relaxed">
                  <span className="text-indigo-600 underline decoration-indigo-200 decoration-2 underline-offset-4">{item.targetWord}</span> sözcüğü aşağıdakilerden hangisiyle {item.isNegated ? <span className="text-red-500 font-black underline">ilişkili değildir?</span> : 'ilişkilidir?'}
                </p>

                <div className="flex gap-4 items-center">
                  {item.options.map((opt: SemanticLinkerOption) => (
                    <div key={opt.id} className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                        {opt.id})
                      </div>
                      <div className="text-[10px] text-zinc-600 font-medium whitespace-nowrap">
                        {opt.label}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        ))}
      </div>
      
      <div className="w-full mt-6 flex justify-between items-center text-[8px] font-black text-zinc-300 uppercase tracking-widest border-t pt-4">
        <span>Oogmatik • Anlamsal İlişki Modülü</span>
        <div className="flex gap-4">
          <span>Doğru: ______</span>
          <span>Yanlış: ______</span>
        </div>
      </div>
    </div>
  );
};
