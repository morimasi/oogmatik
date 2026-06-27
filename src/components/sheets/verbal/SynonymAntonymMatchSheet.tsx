import React from 'react';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';
import * as LucideIcons from 'lucide-react';

export const SynonymAntonymMatchSheet = ({ data }: { data: any }) => {
  const content = data.content || data;
  const leftColumn = content.leftColumn || (content.pairs ? content.pairs.map((p: any) => p.word || p.source) : []);
  const rightColumn = content.rightColumn || (content.pairs ? [...content.pairs].sort(() => Math.random() - 0.5).map((p: any) => p.synonym || p.target) : []);
  const sentences = content.fillInTheBlanks || content.sentences || [];
  const insight = content.insight || { title: 'Dil Bilgisi', text: 'Türkçe kelime haznesi, farklı dillerden gelen ancak aynı anlamı taşıyan zengin sözcük çiftlerine sahiptir.' };

  return (
    <div className="flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white p-8 print:p-4 overflow-hidden professional-worksheet relative">
      <PedagogicalHeader
        title={data.title || 'EŞ ANLAMLI KELİMELER'}
        instruction={data.instruction || 'Kelimeleri anlamdaşları ile eşleştir ve cümleleri tamamla.'}
        note={data.pedagogicalNote}
      />

      <div className="flex-1 flex flex-col gap-8 print:gap-4 mt-6">
        {/* Üst Bölüm: Eşleştirme Matrisi */}
        <div className="grid grid-cols-2 gap-12 print:gap-6 relative">
          {/* Bağlantı Çizgileri İçin Görsel Ray (Opsiyonel süsleme) */}
          <div className="absolute left-1/2 top-10 bottom-0 w-px bg-dashed bg-zinc-200 -translate-x-1/2 opacity-20 print:hidden"></div>

          {/* Sol Sütun */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <LucideIcons.Hash size={12} /> KAVRAMLAR
            </h5>
            {leftColumn.map((item: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 print:p-2 border-2 border-zinc-900 rounded-2xl bg-zinc-50 relative group transition-all hover:bg-zinc-100 shadow-sm"
              >
                <span className="font-extrabold text-lg print:text-base uppercase tracking-tight">
                  <EditableText value={item} tag="span" />
                </span>
                <div className="w-4 h-4 rounded-full border-2 border-zinc-900 bg-white absolute -right-2 top-1/2 -translate-y-1/2 z-10"></div>
              </div>
            ))}
          </div>

          {/* Sağ Sütun */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <LucideIcons.Sparkles size={12} /> ANLAMDAŞLAR
            </h5>
            {rightColumn.map((item: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-start p-4 print:p-2 border-2 border-zinc-200 border-dashed rounded-2xl bg-white relative group hover:border-emerald-500 transition-all shadow-sm"
              >
                <div className="w-4 h-4 rounded-full border-2 border-zinc-200 bg-white absolute -left-2 top-1/2 -translate-y-1/2 z-10 group-hover:border-emerald-500 transition-colors"></div>
                <span className="font-bold text-lg print:text-base uppercase ml-4 text-zinc-500 group-hover:text-zinc-900 tracking-tight">
                  <EditableText value={item} tag="span" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orta Bölüm: Bağlam Avcısı (Cümleler) */}
        <div className="p-8 print:p-4 bg-zinc-950 text-white rounded-[3rem] shadow-2xl relative overflow-hidden flex-shrink-0">
            {/* Arkaplan Deseni */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <LucideIcons.FileText size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 print:mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg">
                        <LucideIcons.Target className="text-white" size={20} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">DİL BİLGİSİ</p>
                        <h4 className="text-xl font-black uppercase tracking-tight">BAĞLAM DEDEKTİFİ</h4>
                    </div>
                </div>

                <div className="space-y-4 print:space-y-2">
                    {sentences.map((sent: any, idx: number) => (
                        <div key={idx} className="p-4 print:p-2 bg-white/5 border border-white/10 rounded-[1.5rem] hover:bg-white/10 transition-colors">
                            <p className="text-lg print:text-base font-medium leading-relaxed italic">
                                { (sent.sentence || sent.text || "").split('...........').map((part: string, i: number, arr: any[]) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className="inline-block min-w-[120px] border-b-2 border-dashed border-indigo-500 mx-2 text-transparent">
                                                ..........
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                                { (sent.sentence || sent.text || "").includes('_______') && (sent.sentence || sent.text || "").split('_______').map((part: string, i: number, arr: any[]) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className="inline-block min-w-[120px] border-b-2 border-dashed border-indigo-500 mx-2 text-transparent">
                                                ..........
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Alt Bölüm: Insight & Profesyonel Footer */}
        <div className="grid grid-cols-3 gap-6 print:gap-3 items-stretch mt-auto">
            <div className="col-span-2 p-6 print:p-3 border-2 border-indigo-100 bg-indigo-50/50 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                    <LucideIcons.Info size={48} className="text-indigo-900" />
                </div>
                <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">{insight.title || 'BİLGİ NOTU'}</h5>
                <p className="text-[11px] print:text-[9px] font-bold text-zinc-600 leading-relaxed italic">
                    {insight.text}
                </p>
            </div>

            <div className="p-6 print:p-3 bg-zinc-900 text-white rounded-[2.5rem] flex flex-col justify-center items-center text-center">
                <div className="mb-2 text-indigo-400">
                    <LucideIcons.Zap size={24} className="animate-pulse" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">ÖLÇÜMLENEN</span>
                <span className="text-[10px] font-black tracking-tighter uppercase whitespace-nowrap">DİLSEL AKICILIK</span>
            </div>
        </div>
      </div>

      {/* Klinik İmzalar */}
      <div className="mt-6 flex justify-between items-center text-[7px] font-black text-zinc-300 px-4 uppercase tracking-[0.3em]">
          <span>© BDMIND VERBAL STUDIO</span>
          <span>HIERARCHY-SYNC ENABLED</span>
          <span>A4 COMPACT PACK V2.1</span>
      </div>
    </div>
  );
};
