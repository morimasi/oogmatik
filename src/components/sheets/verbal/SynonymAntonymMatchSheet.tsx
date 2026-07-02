import React, { useMemo } from 'react';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';
import { KeyRound, Sparkles, Languages, PenLine, Lightbulb, Workflow } from 'lucide-react';

export const SynonymAntonymMatchSheet = React.memo(({ data }: { data: any }) => {
  const content = data.content || data;
  
  // Veri hazırlığı - Infinite loop koruması için useMemo
  const pairs = useMemo(() => content.pairs || [], [content.pairs]);
  
  const leftColumn = useMemo(() => {
    if (content.leftColumn) return content.leftColumn;
    return pairs.map((p: any) => p.word || p.source);
  }, [content.leftColumn, pairs]);

  const rightColumn = useMemo(() => {
    if (content.rightColumn) return content.rightColumn;
    const targets = pairs.map((p: any) => p.synonym || p.target);
    // Fisher-Yates karıştırma algoritması (Stabil)
    const shuffled = [...targets];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [content.rightColumn, pairs]);

  const sentences = useMemo(() => content.fillInTheBlanks || content.sentences || [], [content.fillInTheBlanks, content.sentences]);
  const insight = content.insight || { title: 'Dil Bilgisi', text: 'Türkçe kelime haznesi, farklı dillerden gelen ancak aynı anlamı taşıyan zengin sözcük çiftlerine sahiptir.' };

  return (
    <div className="flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white p-4 print:p-2 overflow-hidden professional-worksheet relative">
      <PedagogicalHeader
        title={data.title || 'EŞ ANLAMLI KELİMELER'}
        instruction={data.instruction || 'Kelimeleri anlamdaşları ile eşleştir ve cümleleri tamamla.'}
      />

      <div className="flex-1 flex flex-col gap-5 print:gap-3 mt-3">
        {/* Üst Bölüm: Eşleştirme Matrisi */}
        <div className="grid grid-cols-2 gap-6 print:gap-3 relative">
          <div className="absolute left-1/2 top-6 bottom-0 w-px bg-zinc-100 -translate-x-1/2 opacity-20 print:hidden hidden lg:block"></div>

          {/* Sol Sütun (Hedefler) */}
          <div className="space-y-2 print:space-y-1.5">
            <h5 className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <KeyRound size={10} /> ANAHTAR KELİMELER
            </h5>
            {leftColumn.map((item: string, idx: number) => (
              <div
                key={`left-${idx}`}
                className="flex items-center justify-between p-2.5 print:p-1.5 border border-zinc-800 rounded-xl bg-zinc-50 relative group transition-all hover:bg-zinc-100 shadow-sm"
              >
                <span className="font-extrabold text-base print:text-xs uppercase tracking-tight">
                  <EditableText value={item} tag="span" />
                </span>
                <div className="w-4 h-4 rounded-full border-2 border-zinc-800 bg-white absolute -right-2 top-1/2 -translate-y-1/2 z-10 shadow"></div>
              </div>
            ))}
          </div>

          {/* Sağ Sütun (Karşılıklar) */}
          <div className="space-y-2 print:space-y-1.5">
            <h5 className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Sparkles size={10} /> ANLAMDAŞLAR
            </h5>
            {rightColumn.map((item: string, idx: number) => (
              <div
                key={`right-${idx}`}
                className="flex items-center justify-start p-2.5 print:p-1.5 border border-zinc-300 border-dashed rounded-xl bg-white relative group hover:border-emerald-500 transition-all shadow-sm"
              >
                <div className="w-4 h-4 rounded-full border-2 border-zinc-300 bg-white absolute -left-2 top-1/2 -translate-y-1/2 z-10 group-hover:border-emerald-500 transition-colors shadow"></div>
                <span className="font-bold text-base print:text-xs uppercase ml-5 text-zinc-500 group-hover:text-zinc-900 tracking-tight leading-tight">
                  <EditableText value={item} tag="span" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orta Bölüm: Bağlam Avcısı (Cümleler) - Compact Tasarım */}
        <div className="p-4 print:p-2 bg-zinc-900 text-white rounded-2xl shadow-lg relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 p-3 opacity-5">
                <Languages size={60} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 print:mb-1.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow border border-white/10">
                        <PenLine className="text-white" size={16} />
                    </div>
                    <div>
                        <p className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.25em] leading-none mb-0.5">SEMANTİK ANALİZ</p>
                        <h4 className="text-lg font-black uppercase tracking-tight">BAĞLAM DEDEKTİFİ</h4>
                    </div>
                </div>

                <div className="space-y-2.5 print:space-y-1.5">
                    {sentences.slice(0, 4).map((sent: any, idx: number) => (
                        <div key={idx} className="p-3 print:p-1.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group border-l-2 border-l-indigo-500">
                            <p className="text-base print:text-xs font-medium leading-relaxed italic text-zinc-200 group-hover:text-white transition-colors">
                                { (sent.sentence || sent.text || "").split('...........').map((part: string, i: number, arr: any[]) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className="inline-block min-w-[100px] border-b border-dashed border-indigo-400/50 mx-1.5 text-transparent">
                                                ..........
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                                { (sent.sentence || sent.text || "").includes('_______') && (sent.sentence || sent.text || "").split('_______').map((part: string, i: number, arr: any[]) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className="inline-block min-w-[100px] border-b border-dashed border-indigo-400/50 mx-1.5 text-transparent">
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

        {/* Alt Bölüm: Insight & Footer */}
        <div className="grid grid-cols-4 gap-3 print:gap-1.5 items-stretch mt-auto">
            <div className="col-span-3 p-3 print:p-1.5 border border-indigo-100 bg-indigo-50/30 rounded-xl relative overflow-hidden flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow border border-indigo-100 shrink-0">
                    <Lightbulb className="text-indigo-600" size={20} />
                </div>
                <div>
                   <h5 className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">{insight.title || 'DİL BİLGİSİ NOTU'}</h5>
                   <p className="text-[10px] print:text-[8px] font-bold text-zinc-700 leading-snug italic max-w-xl">
                      {insight.text}
                   </p>
                </div>
            </div>

            <div className="p-3 print:p-1.5 bg-zinc-800 text-white rounded-xl flex flex-col justify-center items-center text-center shadow border border-white/5">
                 <Workflow size={16} className="text-indigo-400 mb-1" />
                <span className="text-[9px] font-black tracking-tighter uppercase whitespace-nowrap">BDMIND</span>
                <span className="text-[6px] font-black uppercase opacity-50 tracking-[0.15em]">VERBAL ENGINE</span>
            </div>
        </div>
      </div>
    </div>
  );
});
