import React from 'react';
import { PedagogicalHeader } from '../common';
import * as LucideIcons from 'lucide-react';

export const AdvancedMissingPartsSheet: React.FC<{ data: any }> = React.memo(({ data }) => {
  const content = data.content || {};
  const items = content.items || [];
  const wordBank = content.wordBank || [];
  const insight = content.insight || { title: 'BİLGİ', text: 'Eksik kelimeleri bulmak için cümleyi bir bütün olarak değerlendirin.' };
  const topic = content.topic || 'Genel';

  return (
    <div className="flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white p-8 print:p-4 overflow-hidden professional-worksheet relative">
      <PedagogicalHeader
        title={data.title || 'EKSİK PARÇALARI TAMAMLA'}
        instruction={data.instruction || 'Cümlelerdeki boşlukları anlam bütünlüğüne uygun şekilde doldurun.'}
        note={data.pedagogicalNote}
      />

      <div className="flex-1 flex flex-col gap-8 print:gap-4 mt-6">
        
        {/* ÜST PANEL: KELİME HAVUZU (KOMPAKT) */}
        {wordBank.length > 0 && (
            <div className="p-6 print:p-3 bg-zinc-900 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <LucideIcons.Search size={64} color="#FFF" />
                </div>
                <div className="flex items-center gap-3 mb-4 print:mb-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
                        <LucideIcons.Box size={16} color="#FFF" />
                    </div>
                    <div>
                        <p className="text-[7px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">HAVUZU KULLAN</p>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">KAVRAM BANKASI</h4>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 relative z-10">
                    {wordBank.map((word: string, i: number) => (
                        <div key={i} className="px-3 py-1.5 bg-white/10 rounded-xl text-[10px] font-bold text-white border border-white/5 uppercase tracking-tight">
                            {word}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* ANA İÇERİK: CÜMLELER */}
        <div className="flex-1 space-y-4 print:space-y-2">
            {items.map((item: any, idx: number) => (
                <div key={idx} className="group relative p-6 print:p-3 bg-zinc-50/50 border-2 border-zinc-100 rounded-[2rem] hover:bg-zinc-100 transition-all flex gap-6 items-start">
                    {/* Sıra No */}
                    <div className="w-10 h-10 rounded-2xl bg-white border-2 border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-xs font-black text-zinc-400">{idx + 1}</span>
                    </div>

                    <div className="flex-1 space-y-2">
                        <p className="text-lg print:text-[13px] font-medium leading-relaxed text-zinc-800">
                            {(item.text || "").split('...........').map((part: string, i: number, arr: any[]) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                        <span className="inline-block min-w-[120px] border-b-2 border-dashed border-orange-400 mx-2 text-transparent">
                                            ..........
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </p>
                        
                        {/* İpucu (Varsa) */}
                        {item.hint && (
                            <div className="flex items-center gap-1 opacity-40">
                                <LucideIcons.HelpCircle size={10} />
                                <span className="text-[9px] font-bold">İPUCU: {item.hint}</span>
                            </div>
                        )}
                    </div>

                    {/* Kontrol Kutusu Print'te görünür, interaktif değil */}
                    <div className="w-6 h-6 rounded-lg border-2 border-zinc-200 shrink-0 mt-1"></div>
                </div>
            ))}
        </div>

        {/* ALT BÖLÜM: INSIGHT & ANALİZ */}
        <div className="grid grid-cols-4 gap-6 print:gap-3 items-stretch mt-auto">
            <div className="col-span-3 p-6 print:p-3 bg-indigo-50/50 border-2 border-indigo-100 rounded-[2.5rem] relative overflow-hidden flex items-center gap-6">
                <div className="w-14 h-14 rounded-[1.5rem] bg-white flex items-center justify-center shadow-lg border border-indigo-100 shrink-0">
                    <LucideIcons.ShieldCheck className="text-indigo-600" size={28} />
                </div>
                <div>
                   <h5 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">{insight.title || 'DİLSEL VERİ'}</h5>
                   <p className="text-[11px] print:text-[9px] font-bold text-zinc-600 leading-snug italic max-w-xl">
                      {insight.text}
                   </p>
                </div>
            </div>

            <div className="p-6 print:p-3 bg-zinc-950 text-white rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-2xl">
                <LucideIcons.Target size={24} className="text-orange-400 mb-2" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">BAŞARI</span>
                <span className="text-[11px] font-black tracking-tighter uppercase whitespace-nowrap">TAMAMLAMA</span>
            </div>
        </div>
      </div>

      {/* KLİNİK İMZALAR */}
      <div className="mt-4 flex justify-between items-center text-[7px] font-black text-zinc-300 px-6 uppercase tracking-[0.4em]">
          <span>© BDMIND VERBAL STUDIO V5.1</span>
          <div className="flex gap-4">
              <span>LEXEND_TYPEFACE</span>
              <span>CLOZE_ANALYSIS_SYNC</span>
          </div>
      </div>
    </div>
  );
});
