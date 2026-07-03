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
    <div className="flex flex-col h-full font-['Lexend'] text-zinc-900 bg-white p-3 print:p-2 overflow-hidden professional-worksheet relative">
      <PedagogicalHeader
        title={data.title || content.title || 'KISA CEVAPLI SORULAR'}
        instruction={data.instruction || content.instruction || 'Soruları dikkatle okuyun ve cevapları boşluklara yazın.'}
      />

      <div className="flex-1 flex flex-col gap-3 print:gap-2 mt-3">
        <div className="grid grid-cols-2 gap-3 print:gap-2 flex-1 content-start">
            {questions.map((q: any, idx: number) => (
                <div key={q.id || idx} className="group flex flex-col p-3 print:p-2 bg-zinc-50/40 border border-zinc-100 rounded-2xl hover:bg-zinc-100/50 transition-all relative break-inside-avoid shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black shadow">
                                {idx + 1}
                            </div>
                            {q.hint && settings.includeHints !== false && (
                                <div className="p-1 bg-amber-100 text-amber-700 rounded-lg" title={q.hint}>
                                    <Lightbulb size={10} />
                                </div>
                            )}
                        </div>
                        {settings.includePoints !== false && (
                            <div className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded-lg">
                                <span className="text-[7px] font-black text-zinc-400">____ / {q.points || 10}</span>
                            </div>
                        )}
                    </div>

                    <p className="text-[11px] print:text-[9px] font-extrabold leading-snug text-zinc-800 mb-2">
                        {q.text || q.question}
                    </p>

                    <div className="flex-1 space-y-1.5 mt-auto">
                        {lineStyle === 'single' && Array.from({ length: answerLineCount }).map((_, i) => (
                            <div key={i} className="h-5 border-b border-zinc-200 border-dashed"></div>
                        ))}
                        
                        {lineStyle === 'square' && (
                            <div className="h-10 w-full opacity-10" style={{ 
                                backgroundImage: `linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)`,
                                backgroundSize: '12px 12px'
                            }}></div>
                        )}

                        {lineStyle === 'blank' && (
                            <div className="h-10 w-full border border-zinc-100 border-dashed rounded-xl bg-white/50"></div>
                        )}
                    </div>

                    <div className="mt-2 flex justify-end opacity-20 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 size={10} className="text-zinc-300" />
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-4 gap-2 print:gap-1 items-stretch mt-auto">
            <div className="col-span-3 p-2.5 print:p-1.5 bg-zinc-950 text-white rounded-2xl relative overflow-hidden flex items-center gap-3 shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ShieldQuestion size={64} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow shrink-0">
                    <BrainCircuit className="text-white" size={20} />
                </div>
                <div className="relative z-10">
                   <h5 className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">{insight.title || 'BİLİŞSEL İPUCU'}</h5>
                   <p className="text-[9px] print:text-[8px] font-medium leading-snug italic opacity-90 max-w-xl">
                      {insight.text}
                   </p>
                </div>
            </div>

            <div className="p-2.5 print:p-1.5 bg-zinc-100 rounded-2xl flex flex-col justify-center items-center text-center border border-zinc-200 shadow-sm">
                <Award size={16} className="text-indigo-600 mb-1" />
                <span className="text-[6px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-50">ÖLÇÜMLENEN</span>
                <span className="text-[8px] font-black tracking-tighter uppercase">KRİTİK DÜŞÜNME</span>
            </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between items-center text-[6px] font-black text-zinc-300 px-2 uppercase tracking-[0.3em]">
          <span>© BDMIND ASSESSMENT STUDIO V5.2</span>
          <div className="flex gap-3">
              <span>LEXEND_TYPEFACE</span>
              <span>SHORT_ANSWER_MATRIX</span>
          </div>
      </div>
    </div>
  );
});
