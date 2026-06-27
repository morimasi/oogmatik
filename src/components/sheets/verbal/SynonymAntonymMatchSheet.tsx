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
    <div className="flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white p-8 print:p-4 overflow-hidden professional-worksheet relative">
      <PedagogicalHeader
        title={data.title || 'EŞ ANLAMLI KELİMELER'}
        instruction={data.instruction || 'Kelimeleri anlamdaşları ile eşleştir ve cümleleri tamamla.'}
        note={data.pedagogicalNote}
      />

      <div className="flex-1 flex flex-col gap-8 print:gap-4 mt-6">
        {/* Üst Bölüm: Eşleştirme Matrisi */}
        <div className="grid grid-cols-2 gap-12 print:gap-6 relative">
          <div className="absolute left-1/2 top-10 bottom-0 w-px bg-zinc-100 -translate-x-1/2 opacity-20 print:hidden hidden lg:block"></div>

          {/* Sol Sütun (Hedefler) */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <KeyRound size={12} /> ANAHTAR KELİMELER
            </h5>
            {leftColumn.map((item: string, idx: number) => (
              <div
                key={`left-${idx}`}
                className="flex items-center justify-between p-4 print:p-2 border-2 border-zinc-900 rounded-2xl bg-zinc-50 relative group transition-all hover:bg-zinc-100 shadow-sm"
              >
                <span className="font-extrabold text-lg print:text-sm uppercase tracking-tight">
                  <EditableText value={item} tag="span" />
                </span>
                <div className="w-5 h-5 rounded-full border-4 border-zinc-900 bg-white absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 shadow-md"></div>
              </div>
            ))}
          </div>

          {/* Sağ Sütun (Karşılıklar) */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles size={12} /> ANLAMDAŞLAR
            </h5>
            {rightColumn.map((item: string, idx: number) => (
              <div
                key={`right-${idx}`}
                className="flex items-center justify-start p-4 print:p-2 border-2 border-zinc-200 border-dashed rounded-2xl bg-white relative group hover:border-emerald-500 transition-all shadow-sm"
              >
                <div className="w-5 h-5 rounded-full border-4 border-zinc-200 bg-white absolute -left-2.5 top-1/2 -translate-y-1/2 z-10 group-hover:border-emerald-500 transition-colors shadow-md"></div>
                <span className="font-bold text-lg print:text-sm uppercase ml-6 text-zinc-500 group-hover:text-zinc-900 tracking-tight leading-tight">
                  <EditableText value={item} tag="span" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orta Bölüm: Bağlam Avcısı (Cümleler) - Premium Tasarım */}
        <div className="p-8 print:p-4 bg-zinc-950 text-white rounded-[3rem] shadow-2xl relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Languages size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 print:mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg border border-white/10">
                        <PenLine className="text-white" size={24} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] leading-none mb-1">SEMANTİK ANALİZ</p>
                        <h4 className="text-2xl font-black uppercase tracking-tight">BAĞLAM DEDEKTİFİ</h4>
                    </div>
                </div>

                <div className="space-y-4 print:space-y-2">
                    {sentences.slice(0, 4).map((sent: any, idx: number) => (
                        <div key={idx} className="p-5 print:p-3 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group border-l-4 border-l-indigo-500">
                            <p className="text-xl print:text-[13px] font-medium leading-relaxed italic text-zinc-200 group-hover:text-white transition-colors">
                                { (sent.sentence || sent.text || "").split('...........').map((part: string, i: number, arr: any[]) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className="inline-block min-w-[140px] border-b-2 border-dashed border-indigo-400/50 mx-2 text-transparent">
                                                ..........
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                                { (sent.sentence || sent.text || "").includes('_______') && (sent.sentence || sent.text || "").split('_______').map((part: string, i: number, arr: any[]) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className="inline-block min-w-[140px] border-b-2 border-dashed border-indigo-400/50 mx-2 text-transparent">
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
        <div className="grid grid-cols-4 gap-6 print:gap-3 items-stretch mt-auto">
            <div className="col-span-3 p-6 print:p-4 border-2 border-indigo-100 bg-indigo-50/30 rounded-[3rem] relative overflow-hidden flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-indigo-100 shrink-0">
                    <Lightbulb className="text-indigo-600" size={32} />
                </div>
                <div>
                   <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{insight.title || 'DİL BİLGİSİ NOTU'}</h5>
                   <p className="text-xs print:text-[10px] font-bold text-zinc-700 leading-snug italic max-w-xl">
                      {insight.text}
                   </p>
                </div>
            </div>

            <div className="p-6 print:p-3 bg-zinc-900 text-white rounded-[3rem] flex flex-col justify-center items-center text-center shadow-lg border border-white/5">
                <Workflow size={24} className="text-indigo-400 mb-2" />
                <span className="text-[11px] font-black tracking-tighter uppercase whitespace-nowrap">BDMIND</span>
                <span className="text-[7px] font-black uppercase opacity-50 tracking-[0.2em]">VERBAL ENGINE</span>
            </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-4 flex justify-between items-center text-[7px] font-black text-zinc-300 px-6 uppercase tracking-[0.4em]">
          <span>© ANTI-GRAVITY EDUCATION SPRINT 7</span>
          <div className="flex gap-4">
              <span>LEXEND_TYPEFACE</span>
              <span>SYNONYM_RECOGNITION_TASK</span>
          </div>
      </div>
    </div>
  );
});
