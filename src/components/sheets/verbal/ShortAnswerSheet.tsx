import React from 'react';
import { PedagogicalHeader } from '../common';
import { Lightbulb, CheckCircle2, ShieldQuestion, BrainCircuit, Award } from 'lucide-react';

export const ShortAnswerSheet = React.memo(({ data }: { data: any }) => {
  const content = data.content || (data as any);
  const questions = content.questions || [];
  const settings = data.settings || {};
  const insight = content.insight || { title: 'BİLGİ', text: 'Cevapları kısa, öz ve net bir şekilde yazmaya özen gösterin.' };

  const lineStyle = settings.lineStyle || 'single';
  const answerLineCount = settings.answerLineCount || 3;

  return (
    <div className="flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white p-8 print:p-4 overflow-hidden professional-worksheet relative">
      <PedagogicalHeader
        title={data.title || content.title || 'KISA CEVAPLI SORULAR'}
        instruction={data.instruction || content.instruction || 'Soruları dikkatle okuyun ve cevapları boşluklara yazın.'}
        note={data.pedagogicalNote || content.pedagogicalNote}
      />

      <div className="flex-1 flex flex-col gap-6 print:gap-3 mt-6">
        {/* İKİ SÜTUNLU SORU ALANI */}
        <div className="grid grid-cols-2 gap-6 print:gap-4 flex-1 content-start">
            {questions.map((q: any, idx: number) => (
                <div key={q.id || idx} className="group flex flex-col p-5 print:p-3 bg-zinc-50/40 border-2 border-zinc-100 rounded-[2.5rem] hover:bg-zinc-100/50 transition-all relative break-inside-avoid shadow-sm">
                    {/* Soru Üst Bar (No + Puan) */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs font-black shadow-lg">
                                {idx + 1}
                            </div>
                            {q.hint && settings.includeHints !== false && (
                                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg animate-pulse" title={q.hint}>
                                    <Lightbulb size={12} />
                                </div>
                            )}
                        </div>
                        {settings.includePoints !== false && (
                            <div className="px-2 py-1 bg-white border border-zinc-200 rounded-lg shadow-sm">
                                <span className="text-[9px] font-black text-zinc-400">PUAN: ____ / {q.points || 10}</span>
                            </div>
                        )}
                    </div>

                    {/* Soru Metni */}
                    <p className="text-sm print:text-[12px] font-extrabold leading-tight text-zinc-800 mb-4 px-1">
                        {q.text || q.question}
                    </p>

                    {/* Cevap Alanı (Dinamik Stil) */}
                    <div className="flex-1 space-y-2 mt-auto">
                        {lineStyle === 'single' && Array.from({ length: answerLineCount }).map((_, i) => (
                            <div key={i} className="h-6 border-b border-zinc-200 border-dashed"></div>
                        ))}
                        
                        {lineStyle === 'square' && (
                            <div className="h-16 w-full opacity-10" style={{ 
                                backgroundImage: `linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)`,
                                backgroundSize: '15px 15px'
                            }}></div>
                        )}

                        {lineStyle === 'blank' && (
                            <div className="h-16 w-full border-2 border-zinc-100 border-dashed rounded-xl bg-white/50"></div>
                        )}
                    </div>

                    {/* Soru Alt Bilgi (Opsiyonel) */}
                    <div className="mt-4 flex justify-end opacity-20 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 size={12} className="text-zinc-300" />
                    </div>
                </div>
            ))}
        </div>

        {/* ALT BÖLÜM: BİLGİ KARTI & ANALİZ */}
        <div className="grid grid-cols-4 gap-6 print:gap-3 items-stretch mt-auto">
            <div className="col-span-3 p-6 print:p-3 bg-zinc-950 text-white rounded-[3rem] relative overflow-hidden flex items-center gap-6 shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldQuestion size={128} />
                </div>
                <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-xl border border-white/10 shrink-0">
                    <BrainCircuit className="text-white" size={32} />
                </div>
                <div className="relative z-10">
                   <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{insight.title || 'BİLİŞSEL İPUCU'}</h5>
                   <p className="text-xs print:text-[10px] font-medium leading-relaxed italic opacity-90 max-w-xl">
                      {insight.text}
                   </p>
                </div>
            </div>

            <div className="p-6 print:p-3 bg-zinc-100 text-zinc-900 rounded-[3rem] flex flex-col justify-center items-center text-center border-2 border-zinc-200 shadow-sm">
                <Award size={24} className="text-indigo-600 mb-2" />
                <span className="text-[7px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">ÖLÇÜMLENEN</span>
                <span className="text-[10px] font-black tracking-tighter uppercase whitespace-nowrap">KRİTİK DÜŞÜNME</span>
            </div>
        </div>
      </div>

      {/* FOOTER META */}
      <div className="mt-4 flex justify-between items-center text-[7px] font-black text-zinc-300 px-6 uppercase tracking-[0.4em]">
          <span>© BDMIND ASSESSMENT STUDIO V5.2</span>
          <div className="flex gap-4">
              <span>LEXEND_TYPEFACE</span>
              <span>SHORT_ANSWER_MATRIX</span>
          </div>
      </div>
    </div>
  );
});
