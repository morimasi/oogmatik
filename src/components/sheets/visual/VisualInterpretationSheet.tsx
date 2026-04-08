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

  const imagePrompt = (imageBlock?.content as Record<string, unknown>)?.prompt as string || 'Beautiful educational scene for children, minimalist flat vector art';
  const imageBase64 = (imageBlock?.content as Record<string, unknown>)?.base64 as string | undefined;
  const questions = (questionsBlock?.content as Record<string, unknown>)?.items as Record<string, unknown>[] || [];

  // 5N1K Kategori eşleştirme
  const getCategory = (q: string) => {
    const lq = q.toLowerCase();
    if (lq.includes('kim') || lq.includes('kişi')) return { label: 'KİM', icon: 'fa-user-astronaut', color: 'bg-rose-500' };
    if (lq.includes('nerede') || lq.includes('mekan')) return { label: 'NEREDE', icon: 'fa-map-location-dot', color: 'bg-indigo-500' };
    if (lq.includes('ne zaman') || lq.includes('saat')) return { label: 'NE ZAMAN', icon: 'fa-clock', color: 'bg-amber-500' };
    if (lq.includes('nasıl') || lq.includes('niçin') || lq.includes('neden')) return { label: 'NASIL/NİÇİN', icon: 'fa-brain', color: 'bg-emerald-500' };
    return { label: 'NE', icon: 'fa-cube', color: 'bg-blue-500' };
  };

  const isPremium = (settings as any)?.aestheticMode === 'premium' || (settings as any)?.aestheticMode === 'glassmorphism' || activity.settings?.aestheticMode === 'premium';

  return (
    <div
      className={`w-full flex flex-col p-10 print:p-6 min-h-[297mm] bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative ${isPremium ? 'premium-mode' : ''}`}
    >
      {/* 1. PREMIUM HEADER */}
      <PedagogicalHeader
        title={activity.title || 'GÖRSEL ANALİZ & PEDAGOJİK YORUMLAMA'}
        instruction={activity.instruction || 'Görseldeki detayları titizlikle inceleyin ve aşağıdaki analiz sorularını yanıtlayın.'}
        note={activity.pedagogicalNote}
        data={activity}
      />

      {/* 2. HERO IMAGE PANEL (Sayfanın Yıldızı) */}
      <div className="relative group mt-6 animate-in fade-in zoom-in duration-1000">
        {/* Dekoratif Köşe Elemanları */}
        <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-indigo-600 rounded-tl-3xl z-10 opacity-20"></div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-amber-500 rounded-br-3xl z-10 opacity-20"></div>

        <div className="bg-white border-[4px] border-zinc-900 rounded-[3.5rem] p-4 shadow-[20px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden">
          <ImageDisplay
            prompt={imagePrompt}
            base64={imageBase64}
            description={(activity.layoutArchitecture?.blocks[0]?.content as Record<string, unknown>)?.alt as string | undefined}
            className="w-full h-[380px] print:h-[350px] object-cover rounded-[2.8rem] shadow-inner"
          />

          <div className="mt-5 flex justify-between items-center px-8">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-400">
                    <i className="fa-solid fa-star"></i>
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Detay Analizi Seviyesi: {activity.difficultyLevel || 'Orta'}</span>
            </div>
            <div className="bg-zinc-900 text-white px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter">
              Bilişsel Odak: {activity.visualStyle?.toUpperCase() || 'OPTİMAL'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ANALİZ MATRİSİ (Sorular) */}
      <div className="grid grid-cols-2 gap-4 mt-8 print:gap-3 flex-1 content-start">
        {questions.map((q: Record<string, unknown>, idx: number) => {
          const cat = getCategory(recursiveSafeText(q.q || q.questionText || q.text));
          return (
            <div key={idx} className="relative bg-zinc-50/40 border-2 border-zinc-100 rounded-[2.2rem] p-5 print:p-4 break-inside-avoid shadow-sm hover:border-indigo-300 hover:bg-white transition-all group/card overflow-hidden">
              {/* Kategori Badge */}
              <div className="absolute top-0 right-0">
                <div className={`${cat.color} text-white px-4 py-1.5 rounded-bl-3xl text-[8px] font-black tracking-widest flex items-center gap-2 shadow-sm`}>
                  <i className={`fa-solid ${cat.icon}`}></i>
                  {cat.label}
                </div>
              </div>

              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-white border-2 border-zinc-900 text-zinc-900 rounded-2xl flex items-center justify-center font-black text-lg shadow-[4px_4px_0px_#f59e0b] shrink-0 transform -rotate-6">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] print:text-[12px] font-black text-zinc-800 leading-tight group-hover/card:text-indigo-600 transition-colors">
                    {(q.q || q.questionText || q.text) as string}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 pl-2">
                {q.type === 'multiple' && q.options && (
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {(q.options as string[]).map((opt: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm transition-all hover:border-indigo-200 hover:scale-[1.02]">
                        <div className="w-7 h-7 shrink-0 rounded-xl bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover/card:bg-indigo-50 group-hover/card:text-indigo-500 transition-all">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-[11px] font-bold text-zinc-600 tracking-tight">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {(q.type !== 'multiple') && (
                  <div className="space-y-4 mt-4 pr-4">
                    <div className="w-full h-8 border-b-2 border-zinc-200 border-dotted relative">
                      <div className="absolute -left-2 top-0 text-[10px] font-black text-zinc-200 uppercase transform -rotate-90 origin-left">CEVAP</div>
                    </div>
                    <div className="w-full h-8 border-b-2 border-zinc-200 border-dotted"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. KLİNİK DEĞERLENDİRME PANELİ */}
      <div className="mt-8 pt-6 border-t-[4px] border-zinc-900 grid grid-cols-3 gap-6">
        <div className="bg-zinc-900 text-white rounded-3xl p-5 flex flex-col justify-between h-24 shadow-xl">
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">VİZUÖ-PERSEPTÜAL ANALİZ</span>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-2xl font-black leading-none">__:__</span>
            <span className="text-[9px] font-black text-zinc-500 mb-1">SN / DK</span>
          </div>
        </div>

        <div className="bg-white border-2 border-zinc-900 rounded-3xl p-5 flex flex-col justify-between h-24 shadow-lg ring-4 ring-zinc-50">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">DİKKAT VE ODAK SKORU</span>
          <div className="flex gap-2.5 mt-2">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="w-5 h-5 rounded-full border-[3px] border-zinc-100 bg-zinc-50 shadow-inner"></div>
            ))}
          </div>
        </div>

        <div className="bg-white border-2 border-zinc-900 rounded-3xl p-5 flex flex-col justify-between h-24 relative overflow-hidden shadow-lg ring-4 ring-zinc-50">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">KLİNİK GÖZLEM / İMZA</span>
          <div className="w-full border-b-2 border-zinc-200 border-dotted mt-4"></div>
          <i className="fa-solid fa-stamp absolute -bottom-3 -right-3 text-5xl opacity-5 transform -rotate-12"></i>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="absolute bottom-2 left-10 text-[8px] font-bold text-zinc-300 uppercase tracking-widest">
        OOGMATIK // VISUAL INTERPRETATION PROTOCOL V1.2.5
      </div>
    </div>
  );
};

// Yardımcı fonksiyon: recursiveSafeText (SheetRenderer'dan kopyalandı veya global olarak kullanılmalı)
const recursiveSafeText = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (Array.isArray(val)) return val.map(recursiveSafeText).join(', ');
    const keys = ['text', 'q', 'questionText', 'clue', 'content'];
    for (const key of keys) {
      if (val[key]) return recursiveSafeText(val[key]);
    }
  }
  return String(val);
};

