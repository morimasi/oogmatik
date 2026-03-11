// VisualInterpretationSheet.tsx
import React, { useState, useEffect } from 'react';
import { WorksheetData, StyleSettings } from '../../../types';

interface VisualInterpretationSheetProps {
  data: WorksheetData;
  settings: StyleSettings;
}

export const VisualInterpretationSheet: React.FC<VisualInterpretationSheetProps> = ({
  data,
  settings,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const activity = data[0];
  const blocks = activity.layoutArchitecture?.blocks || [];

  const imageBlock = blocks.find((b: any) => b.type === 'image');
  const questionsBlock = blocks.find((b: any) => b.type === 'question' || b.type === 'questions');

  const imagePrompt = imageBlock?.content?.prompt || 'Görsel Yükleniyor...';

  useEffect(() => {
    // Placeholder logic for visual representation
    const encodedPrompt = encodeURIComponent('Visual Analysis Scene');
    setPhotoUrl(`https://placehold.co/1200x600/f3f4f6/334155?text=${encodedPrompt}&font=lora`);
  }, [imagePrompt]);

  const questions = questionsBlock?.content?.items || [];

  return (
    <div
      className="w-full flex flex-col gap-5 p-8 print:p-0 min-h-[297mm] break-inside-avoid bg-white"
      style={{ fontFamily: settings.fontFamily, color: '#18181b' }}
    >
      {/* 1. Profesyonel Başlık ve Analiz Künyesi */}
      {settings.showTitle && (
        <div className="w-full border-b-[3px] border-zinc-900 pb-3 mb-1">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter mb-1">
                {activity.title || 'Görsel Analiz Raporu'}
              </h1>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-microscope text-indigo-500"></i> KLİNİK GÖZLEM VE BİLİŞSEL DEĞERLENDİRME
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">ID: {activity.id?.substring(0, 8) || 'VSL-GEN'}</p>
              <p className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Sayfa: 1/1</p>
            </div>
          </div>

          {activity.pedagogicalNote && (
            <div className="mt-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block uppercase tracking-wider">
              <i className="fa-solid fa-brain mr-1"></i> {activity.pedagogicalNote}
            </div>
          )}

          {settings.showInstruction && (
            <div className="mt-3 p-3 bg-zinc-50 border-l-4 border-zinc-900 rounded-r-lg">
              <p className="text-[12px] text-zinc-700 font-medium italic">
                <span className="font-bold mr-1">Yönerge:</span>
                {activity.instruction || 'Aşağıdaki görseli inceleyin, gizli detayları fark edin ve analitik soruları yanıtlayın.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. Görsel Panel (Scene Focus) */}
      <div className="w-full rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 relative group break-inside-avoid">
        <div className="w-full h-72 relative overflow-hidden flex items-center justify-center bg-zinc-100">
          {photoUrl ? (
            <img src={photoUrl} alt="Scene" className="w-full h-full object-cover" />
          ) : (
            <div className="animate-pulse text-zinc-400 font-bold flex flex-col items-center gap-3">
              <i className="fa-solid fa-image text-4xl"></i>
              <span>Görsel İşleniyor...</span>
            </div>
          )}
        </div>

        {/* Altyazı veya Prompt Metni */}
        <div className="w-full p-2 bg-white border-t border-zinc-200 text-center">
          <p className="text-[10px] font-medium text-zinc-400 font-mono tracking-tight line-clamp-1 italic">
            "{activity.layoutArchitecture?.blocks[0]?.content?.alt || 'Görsel sahne analizi için hazırlanmıştır.'}"
          </p>
        </div>
      </div>

      {/* 3. Sorular (Bilişsel Sorgulama Matrisi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-1">
        {questions.map((q: any, idx: number) => (
          <div key={idx} className="relative bg-white border border-zinc-200 rounded-xl p-4 break-inside-avoid shadow-sm">

            <div className="flex justify-between items-start mb-3">
              <div className="w-7 h-7 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-black text-xs">
                {idx + 1}
              </div>
              <div className="px-1.5 py-0.5 bg-zinc-100 rounded text-[8px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-100">
                {q.type === 'open' ? 'Açık Uçlu' : 'Çoktan Seçmeli'}
              </div>
            </div>

            <h3 className="text-[13px] font-bold text-zinc-800 mb-4 pl-1 leading-snug">
              {q.q || q.questionText || q.text}
            </h3>

            <div className="pl-1">
              {q.type === 'multiple' && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 shrink-0 rounded-full border-[1.5px] border-zinc-300 flex items-center justify-center mt-0.5 text-[10px] font-bold text-zinc-400">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-[12px] font-medium text-zinc-600 leading-tight pt-1">{opt}</span>
                    </div>
                  ))}
                </div>
              )}

              {(q.type === 'open' || q.type === 'open_ended') && (
                <div className="space-y-4 mt-2">
                  <div className="w-full border-b border-zinc-200 border-dotted"></div>
                  <div className="w-full border-b border-zinc-200 border-dotted"></div>
                  <div className="w-full border-b border-zinc-200 border-dotted"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Klinik Gözlem Notları (Sayfa Altı Footer) */}
      <div className="mt-auto pt-4 border-t-2 border-zinc-900 flex flex-col gap-2 break-inside-avoid">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800 flex items-center gap-2">
            <i className="fa-solid fa-clipboard-user"></i> Uzman Gözlem Paneli
          </h4>
          <span className="text-[8px] font-bold text-zinc-400">© Bursadisleksi - Oogmatik Premium</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1 border border-zinc-200 rounded-lg p-2 bg-zinc-50/50">
            <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Süre</span>
            <span className="text-[11px] font-bold text-zinc-700">_______ dk</span>
          </div>
          <div className="col-span-1 border border-zinc-200 rounded-lg p-2 bg-zinc-50/50">
            <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Doğru/Yanlış</span>
            <span className="text-[11px] font-bold text-zinc-700">____ / {questions.length}</span>
          </div>
          <div className="col-span-2 border border-zinc-200 rounded-lg p-2 bg-zinc-50/50">
            <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Uzman Notu</span>
            <div className="w-full border-b border-zinc-200 border-dotted mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

