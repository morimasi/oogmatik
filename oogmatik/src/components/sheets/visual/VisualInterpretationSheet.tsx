import React from 'react';
import { WorksheetData, StyleSettings } from '../../../types';
import { ImageDisplay, PedagogicalHeader } from '../common';

interface VisualInterpretationSheetProps {
  data: WorksheetData;
  settings: StyleSettings;
}

export const VisualInterpretationSheet: React.FC<VisualInterpretationSheetProps> = ({
  data,
  settings,
}) => {
  if (!data) return null;
  const activity = Array.isArray(data) ? data[0] : data;
  const blocks = activity.layoutArchitecture?.blocks || [];

  const imageBlock = blocks.find((b: any) => b.type === 'image');
  const questionsBlock = blocks.find((b: any) => b.type === 'question' || b.type === 'questions');

  const imagePrompt = imageBlock?.content?.prompt || 'Beautiful educational scene for children, minimalist flat vector art';
  const questions = questionsBlock?.content?.items || [];

  return (
    <div
      className="w-full flex flex-col gap-8 print:gap-4 p-10 print:p-4 min-h-[297mm] bg-white font-['Lexend'] text-zinc-900 overflow-hidden"
    >
      {/* 1. PREMIUM HEADER */}
      <PedagogicalHeader
        title={activity.title || 'GÖRSEL ANALİZ & PEDAGOJİK YORUMLAMA'}
        instruction={activity.instruction || 'Görseldeki detayları titizlikle inceleyin ve aşağıdaki analiz sorularını yanıtlayın.'}
        note={activity.pedagogicalNote}
        data={activity}
      />

      {/* 2. HERO IMAGE PANEL (Sayfanın Yıldızı) */}
      <div className="relative group break-inside-avoid animate-in fade-in zoom-in duration-700">
        <div className="absolute -top-3 -left-3 w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-2xl z-20 transform -rotate-12 group-hover:rotate-0 transition-transform">
          <i className="fa-solid fa-eye text-2xl"></i>
        </div>

        <div className="bg-white border-[3px] border-zinc-900 rounded-[3rem] p-4 shadow-[15px_15px_0px_#1e1b4b] overflow-hidden">
          <ImageDisplay
            prompt={imagePrompt}
            description={activity.layoutArchitecture?.blocks[0]?.content?.alt}
            className="w-full h-[450px] print:h-[400px] object-cover rounded-[2.5rem] shadow-inner"
          />

          <div className="mt-4 flex justify-between items-center px-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Canlı Görsel Analizi Aktif</span>
            </div>
            <div className="text-[10px] font-bold text-zinc-300 italic font-mono">
              PROMPT_ID: {activity.id?.substring(0, 8) || 'VSL-GEN'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ANALİZ MATRİSİ (Sorular) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {questions.map((q: any, idx: number) => (
          <div key={idx} className="relative bg-zinc-50/50 border-2 border-zinc-100 rounded-[2rem] p-6 print:p-4 break-inside-avoid shadow-sm hover:border-indigo-200 hover:bg-white transition-all group/card">
            <div className="flex justify-between items-center mb-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg border-2 border-white">
                {idx + 1}
              </div>
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-zinc-100 shadow-sm">
                {q.type === 'open' ? 'Bilişsel Yorum' : 'Hızlı Analiz'}
              </span>
            </div>

            <h3 className="text-[14px] font-black text-zinc-800 mb-5 leading-tight group-hover/card:text-indigo-600 transition-colors">
              {q.q || q.questionText || q.text}
            </h3>

            <div className="space-y-3">
              {q.type === 'multiple' && q.options && (
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-zinc-100 shadow-sm transition-transform hover:scale-[1.02]">
                      <div className="w-6 h-6 shrink-0 rounded-lg border-2 border-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-[12px] font-bold text-zinc-600">{opt}</span>
                    </div>
                  ))}
                </div>
              )}

              {(q.type === 'open' || q.type === 'open_ended') && (
                <div className="space-y-3 mt-2">
                  <div className="w-full h-8 border-b-2 border-zinc-200 border-dotted"></div>
                  <div className="w-full h-8 border-b-2 border-zinc-200 border-dotted"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. KLİNİK DEĞERLENDİRME PANELİ */}
      <div className="mt-auto pt-10 border-t-[3px] border-zinc-100 grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-1 block">Clinic Pro</span>
          <span className="text-sm font-black text-zinc-800 uppercase leading-none">Bilişsel <br />Gözlem Raporu</span>
        </div>

        <div className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-4 flex flex-col justify-between h-20">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Tamamlama Süresi</span>
          <div className="flex items-end gap-1">
            <span className="text-xl font-black leading-none">__:__</span>
            <span className="text-[8px] font-bold text-zinc-400 mb-1">Dakika</span>
          </div>
        </div>

        <div className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-4 flex flex-col justify-between h-20">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Analitik Skor</span>
          <div className="flex gap-1.5 mt-2">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="w-4 h-4 rounded-full border-2 border-zinc-200"></div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-4 flex flex-col justify-between h-20 relative overflow-hidden">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Uzman İmzası</span>
          <div className="w-full border-b-2 border-zinc-200 border-dotted mt-4"></div>
          <i className="fa-solid fa-stamp absolute -bottom-2 -right-2 text-4xl opacity-[0.05] -rotate-12"></i>
        </div>
      </div>
    </div>
  );
};

