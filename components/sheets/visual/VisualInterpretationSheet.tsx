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
  const questionsBlock = blocks.find((b: any) => b.type === 'questions');

  const imagePrompt = imageBlock?.content?.prompt || 'Görsel Yükleniyor...';

  // Şimdilik Pexels API'den görsel çekme veya Fallback (Prompt'u okutacak text temelli Placeholder)
  useEffect(() => {
    // TODO: Eğer ileride OpenAI DALL-E veya gerçek Pexels entegrasyonu backend'den sağlanmazsa 
    // burada direkt base64 veya URL aranabilir. Şimdilik Placeholder kullanıp Promptu yazdıracağız.
    const encodedPrompt = encodeURIComponent('Visual Analysis Scene');
    setPhotoUrl(`https://placehold.co/1200x600/f3f4f6/334155?text=${encodedPrompt}&font=lora`);
  }, [imagePrompt]);

  const questions = questionsBlock?.content?.items || [];

  return (
    <div
      className="w-full h-auto flex flex-col gap-6 p-8 min-h-[297mm] break-inside-avoid"
      style={{ fontFamily: settings.fontFamily, color: '#18181b' }}
    >
      {/* 1. Profesyonel Başlık ve Analiz Künyesi */}
      {settings.showTitle && (
        <div className="w-full border-b-[3px] border-zinc-900 pb-4 mb-2">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter mb-1">
                {activity.title || 'Görsel Analiz Raporu'}
              </h1>
              <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-microscope text-indigo-500"></i> KLİNİK GÖZLEM VE BİLİŞSEL DEĞERLENDİRME
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">ID: {activity.id?.substring(0, 8) || 'VSL-GEN'}</p>
              <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">Tarih: ____/____/20__</p>
            </div>
          </div>
          {settings.showInstruction && (
            <div className="mt-4 p-3 bg-zinc-50 border-l-4 border-indigo-500 rounded-r-lg">
              <p className="text-[13px] text-zinc-700 font-medium italic">
                <span className="font-bold mr-1">Yönerge:</span>
                {activity.instruction || 'Aşağıdaki görseli inceleyin, gizli detayları fark edin ve analitik soruları yanıtlayın.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. Görsel Panel (Scene Focus) */}
      <div className="w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 shadow-inner relative group break-inside-avoid print-keep">
        {/* Görselin üstüne öğretmenin okuması veya öğrencinin hayal etmesi için Prompt eklenebilir. Şimdilik Img */}
        <div className="w-full h-80 relative overflow-hidden flex items-center justify-center bg-zinc-200">
          {photoUrl ? (
            <img src={photoUrl} alt="Scene" className="w-full h-full object-cover" />
          ) : (
            <div className="animate-pulse text-zinc-400 font-bold flex flex-col items-center gap-3">
              <i className="fa-solid fa-image text-4xl"></i>
              <span>Görsel İşleniyor...</span>
            </div>
          )}
        </div>

        {/* Altyazı veya Prompt Metni (Öğretmen için referans / Dikkat Dağıtmaz) */}
        <div className="w-full p-3 bg-white border-t border-zinc-200 text-center">
          <p className="text-[11px] font-medium text-zinc-500 font-mono tracking-tight">AI SAHNE REFERANSI: {imagePrompt.substring(0, 150)}...</p>
        </div>
      </div>

      {/* 3. Sorular (Bilişsel Sorgulama Matrisi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-2 relative z-10">
        {questions.map((q: any, idx: number) => (
          <div key={idx} className="relative bg-white border border-zinc-200 rounded-2xl p-5 break-inside-avoid break-after-avoid shadow-sm hover:border-indigo-200 transition-colors">

            {/* Soru Numarası ve Tipi (Rozet) */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-black text-sm">
                  {idx + 1}
                </div>
              </div>
              <div className="px-2 py-1 bg-zinc-100 rounded text-[9px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-200">
                {q.type === 'open' ? 'Açık Uçlu / Çıkarım' : q.type === 'multiple' ? 'Çoktan Seçmeli' : 'Doğru-Yanlış'}
              </div>
            </div>

            {/* Soru Kökü */}
            <h3 className="text-base font-bold text-zinc-800 mb-5 pl-1 leading-snug">
              {q.q || q.questionText || q.text}
            </h3>

            {/* SIKLAR / TEPKİ ALANI */}
            <div className="pl-1">
              {q.type === 'multiple' && q.options && (
                <div className="space-y-3">
                  {q.options.map((opt: string, i: number) => (
                    <label key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 shrink-0 rounded-full border-2 border-zinc-300 flex items-center justify-center mt-0.5"></div>
                      <span className="text-sm font-medium text-zinc-700 leading-tight pt-0.5">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {(q.type === 'open' || q.type === 'open_ended') && (
                <div className="space-y-6 mt-4">
                  <div className="w-full border-b-[1.5px] border-zinc-300 border-dotted"></div>
                  <div className="w-full border-b-[1.5px] border-zinc-300 border-dotted"></div>
                  <div className="w-full border-b-[1.5px] border-zinc-300 border-dotted"></div>
                </div>
              )}

              {q.type === 'true_false' && (
                <div className="flex gap-4">
                  <div className="flex-1 py-2.5 rounded-lg border-2 border-zinc-200 text-center font-bold text-zinc-400">DOĞRU</div>
                  <div className="flex-1 py-2.5 rounded-lg border-2 border-zinc-200 text-center font-bold text-zinc-400">YANLIŞ</div>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* 4. Klinik Gözlem Notları (Sayfa Altı Footer) */}
      <div className="mt-auto pt-6 border-t-[3px] border-zinc-900 flex flex-col gap-3 break-inside-avoid">
        <h4 className="text-[12px] font-black uppercase tracking-widest text-zinc-800 flex items-center gap-2">
          <i className="fa-solid fa-clipboard-user"></i> Uzman Gözlem Paneli
        </h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1 border border-zinc-300 rounded-lg p-3 bg-zinc-50/50">
            <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Odaklanma Süresi</span>
            <span className="text-sm font-medium text-zinc-800">_______ dk</span>
          </div>
          <div className="col-span-1 border border-zinc-300 rounded-lg p-3 bg-zinc-50/50">
            <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Başarı Oranı</span>
            <span className="text-sm font-medium text-zinc-800">____ / {questions.length}</span>
          </div>
          <div className="col-span-2 border border-zinc-300 rounded-lg p-3 bg-zinc-50/50">
            <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Pedagojik Notlar</span>
            <div className="w-full border-b border-zinc-300 border-dotted mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

