import React from 'react';
import { ActivityType, SingleWorksheetData } from '../../types';
import { PedagogicalHeader } from './common';

interface SariKitapSheetProps {
  type: ActivityType;
  data: SingleWorksheetData;
}

/**
 * OOGMATIK — SariKitapSheet
 * 
 * Sarı Kitap serisindeki etkinlikleri render eden premium bileşen.
 */
export const SariKitapSheet: React.FC<SariKitapSheetProps> = ({ type, data }) => {
  const { title, instruction, primaryActivity, supportingDrill, pedagogicalNote } = data as any;

  return (
    <div className="sari-kitap-sheet flex flex-col h-full bg-white text-slate-950 p-8 font-lexend">
      {/* Header */}
      <PedagogicalHeader 
        title={title || 'Sarı Kitap Etkinliği'} 
        instruction={instruction} 
        note={pedagogicalNote}
      />

      {/* Ana Etkinlik Alanı */}
      <div className="flex-1 mt-6 border-2 border-slate-100 rounded-3xl p-6 bg-slate-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-black">1</div>
          <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Ana Etkinlik</h3>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
          {renderActivityContent(type, primaryActivity?.content)}
        </div>
      </div>

      {/* Pekiştirme Drili */}
      <div className="mt-6 border-2 border-slate-100 rounded-3xl p-6 bg-slate-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-black">2</div>
          <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">
            {supportingDrill?.title || 'Pekiştirme Çalışması'}
          </h3>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {renderDrillContent(supportingDrill?.content)}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 flex justify-between items-end border-t border-slate-100">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Oogmatik Premium</span>
          <span className="text-[8px] text-slate-300 font-medium">© 2026 Bursa Disleksi - Sarı Kitap Serisi</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Zorluk</span>
            <span className="text-xs font-bold text-slate-700">{(data as any).difficulty || 'Orta'}</span>
          </div>
          <div className="w-px h-6 bg-slate-100"></div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Süre</span>
            <span className="text-xs font-bold text-slate-700">15 dk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Yardımcı Render Fonksiyonları
function renderActivityContent(type: ActivityType, content: any) {
  if (!content) return <p className="text-slate-400 italic">İçerik yüklenemedi...</p>;

  switch (type) {
    case ActivityType.SARI_KITAP_PENCERE:
      return (
        <div className="space-y-4">
          {content.grid && (
            <div className="grid grid-cols-10 gap-1 border-2 border-slate-900 p-1 bg-slate-900">
              {content.grid.flat().map((char: string, i: number) => (
                <div key={i} className="aspect-square bg-white flex items-center justify-center font-bold text-lg border-[0.5px] border-slate-100">
                  {char}
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {content.tasks?.map((task: any, i: number) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-700">{task.question}</p>
                <div className="mt-2 h-8 bg-white border border-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      );

    case ActivityType.SARI_KITAP_NOKTA:
      return (
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[400px] border-2 border-slate-100 rounded-2xl bg-slate-50 overflow-hidden">
             {/* Nokta bulutu simülasyonu - gerçek uygulamada SVG veya Canvas kullanılır */}
             <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 p-4">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800 opacity-20"></div>
                  </div>
                ))}
             </div>
             <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-black text-4xl opacity-10 rotate-12">
               NOKTA ANALİZİ
             </div>
          </div>
          <div className="w-full mt-6 space-y-3">
             <p className="text-sm font-bold text-slate-800">{content.instruction || 'Yandaki nokta bulutunda 3\'lü grupları bulun.'}</p>
             <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-50 border border-slate-100 rounded-xl"></div>
                ))}
             </div>
          </div>
        </div>
      );

    case ActivityType.SARI_KITAP_KOPRU:
      return (
        <div className="flex justify-between gap-12 relative">
          <div className="flex flex-col gap-4 flex-1">
            {content.leftColumn?.map((item: any, i: number) => (
              <div key={i} className="p-3 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-between">
                <span className="font-bold text-sm">{item}</span>
                <div className="w-3 h-3 rounded-full border-2 border-slate-300 bg-slate-50"></div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {content.rightColumn?.map((item: any, i: number) => (
              <div key={i} className="p-3 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-between">
                <div className="w-3 h-3 rounded-full border-2 border-slate-300 bg-slate-50"></div>
                <span className="font-bold text-sm">{item}</span>
              </div>
            ))}
          </div>
          {/* Köprü görseli placeholder */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[60px] text-slate-50 opacity-20 pointer-events-none">
            <i className="fa-solid fa-bridge"></i>
          </div>
        </div>
      );

    case ActivityType.SARI_KITAP_CIFT_METIN:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Metin 1</h4>
              <p className="text-sm leading-relaxed text-slate-700">{content.text1}</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Metin 2</h4>
              <p className="text-sm leading-relaxed text-slate-700">{content.text2}</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Karşılaştırma Soruları</h4>
            <div className="space-y-4">
              {content.questions?.map((q: string, i: number) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs font-bold text-slate-800">{i + 1}. {q}</p>
                  <div className="h-6 border-b border-slate-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return <pre className="text-[10px] bg-slate-50 p-4 rounded-xl overflow-auto">{JSON.stringify(content, null, 2)}</pre>;
  }
}

function renderDrillContent(content: any) {
  if (!content) return null;

  if (Array.isArray(content.questions)) {
    return (
      <div className="space-y-3">
        {content.questions.map((q: any, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-300 w-4">{i + 1}.</span>
            <p className="text-xs font-bold text-slate-700 flex-1">{typeof q === 'string' ? q : q.text}</p>
            <div className="w-32 h-6 bg-slate-50 border-b border-slate-200"></div>
          </div>
        ))}
      </div>
    );
  }

  if (content.list) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {content.list.map((item: string, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            <span className="text-xs font-medium text-slate-600">{item}</span>
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-xs text-slate-500 italic">Hızlı pekiştirme çalışması...</p>;
}
