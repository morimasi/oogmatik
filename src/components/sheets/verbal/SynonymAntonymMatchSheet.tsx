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
    <div className="flex flex-col w-full h-full font-['Lexend'] text-zinc-900 bg-white relative overflow-hidden professional-worksheet print:w-[210mm] print:h-[297mm] px-[12mm] py-[15mm]">
      {/* Premium Gradient Header - CMYK Baskı Uyumlu */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-emerald-500 to-indigo-600 opacity-100"></div>

      <PedagogicalHeader
        title={data.title || 'EŞ VE ZIT ANLAMLI KELİMELER'}
        instruction={data.instruction || 'Kelimeleri anlamdaşları ile eşleştir ve cümleleri tamamla.'}
      />

      <div className="flex-1 flex flex-col gap-3 print:gap-2 mt-2">
        {/* Üst Bölüm: Eşleştirme Matrisi - Ultra Kompakt */}
        <div className="grid grid-cols-2 gap-4 print:gap-2 relative">
          <div className="absolute left-1/2 top-4 bottom-0 w-px bg-zinc-200 -translate-x-1/2 opacity-30 print:block"></div>

          {/* Sol Sütun (Hedefler) */}
          <div className="space-y-1.5 print:space-y-1">
            <h5 className="text-[7px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <KeyRound size={9} /> ANAHTAR KELİMELER
            </h5>
            {leftColumn.map((item: string, idx: number) => (
              <div
                key={`left-${idx}`}
                className="flex items-center justify-between p-2 print:p-1 border border-zinc-300 rounded-lg bg-zinc-50 relative group transition-all shadow-xs"
              >
                <span className="font-extrabold text-sm print:text-[11px] uppercase tracking-tight">
                  <EditableText value={item} tag="span" />
                </span>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-700 bg-white absolute -right-1.5 top-1/2 -translate-y-1/2 z-10 shadow-xs"></div>
              </div>
            ))}
          </div>

          {/* Sağ Sütun (Karşılıklar) */}
          <div className="space-y-1.5 print:space-y-1">
            <h5 className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Sparkles size={9} /> ANLAMDAŞLAR
            </h5>
            {rightColumn.map((item: string, idx: number) => (
              <div
                key={`right-${idx}`}
                className="flex items-center justify-start p-2 print:p-1 border border-zinc-300 border-dashed rounded-lg bg-white relative group transition-all shadow-xs"
              >
                <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 bg-white absolute -left-1.5 top-1/2 -translate-y-1/2 z-10 group-hover:border-emerald-500 transition-colors shadow-xs"></div>
                <span className="font-bold text-sm print:text-[11px] uppercase ml-4.5 text-zinc-600 tracking-tight leading-tight">
                  <EditableText value={item} tag="span" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orta Bölüm: Bağlam Avcısı (Cümleler) - Ultra Compact Tasarım */}
        <div className="p-3 print:p-2 bg-zinc-900 text-white rounded-xl shadow-md relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 p-2 opacity-5">
                <Languages size={50} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-2 print:mb-1">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-xs border border-white/10">
                        <PenLine className="text-white" size={14} />
                    </div>
                    <div>
                        <p className="text-[6.5px] font-black text-indigo-400 uppercase tracking-[0.25em] leading-none mb-0.5">SEMANTİK ANALİZ</p>
                        <h4 className="text-sm font-black uppercase tracking-tight">BAĞLAM DEDEKTİFİ</h4>
                    </div>
                </div>

                <div className="space-y-2 print:space-y-1.25">
                    {sentences.slice(0, 4).map((sent: any, idx: number) => (
                        <div key={idx} className="p-2 print:p-1.25 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all group border-l-2 border-l-indigo-500">
                            <p className="text-sm print:text-[10px] font-medium leading-snug italic text-zinc-200 group-hover:text-white transition-colors">
                                { (sent.sentence || sent.text || "").split('...........').map((part: string, i: number, arr: any[]) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className="inline-block min-w-[90px] border-b border-dashed border-indigo-400/60 mx-1 text-transparent">
                                                ..........
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                                { (sent.sentence || sent.text || "").includes('_______') && (sent.sentence || sent.text || "").split('_______').map((part: string, i: number, arr: any[]) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className="inline-block min-w-[90px] border-b border-dashed border-indigo-400/60 mx-1 text-transparent">
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
        <div className="grid grid-cols-4 gap-2.5 print:gap-1.25 items-stretch mt-auto">
            <div className="col-span-3 p-2.5 print:p-1.25 border border-indigo-100 bg-indigo-50/30 rounded-lg relative overflow-hidden flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs border border-indigo-100 shrink-0">
                    <Lightbulb className="text-indigo-600" size={18} />
                </div>
                <div>
                   <h5 className="text-[7px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">{insight.title || 'DİL BİLGİSİ NOTU'}</h5>
                   <p className="text-[9.5px] print:text-[8px] font-bold text-zinc-700 leading-snug italic max-w-xl">
                      {insight.text}
                   </p>
                </div>
            </div>

            <div className="p-2.5 print:p-1.25 bg-zinc-800 text-white rounded-lg flex flex-col justify-center items-center text-center shadow-xs border border-white/5">
                 <Workflow size={14} className="text-indigo-400 mb-0.75" />
                <span className="text-[8.5px] font-black tracking-tighter uppercase whitespace-nowrap">BDMIND</span>
                <span className="text-[5.5px] font-black uppercase opacity-55 tracking-[0.15em]">VERBAL ENGINE</span>
            </div>
        </div>
      </div>
    </div>
  );
});
