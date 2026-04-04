// @ts-nocheck
import React from 'react';
import { ActionToolbar } from './ActionToolbar';
import { useSuperStudioStore } from '../../../store/useSuperStudioStore';
import { motion, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from '../../Common/MarkdownRenderer';

export const A4PreviewPanel: React.FC = () => {
  const { generatedContents, isGenerating } = useSuperStudioStore();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* İşlevsel Araç Çubuğu (Toolbar) */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl flex items-center justify-between px-6 z-20 shadow-lg">
        <div className="flex items-center text-slate-400 text-sm">
          <span className="text-teal-400 mr-3 relative flex h-3 w-3">
            {isGenerating && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${isGenerating ? 'bg-teal-500' : 'bg-slate-600'}`}
            ></span>
          </span>
          <span className="font-semibold tracking-wide uppercase text-xs text-slate-500">
            A4 Canlı Önizleme
          </span>
          {generatedContents.length > 0 && (
            <span className="ml-3 bg-teal-500/10 text-teal-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-teal-500/20">
              {generatedContents.length} Sayfa
            </span>
          )}
        </div>

        <ActionToolbar />
      </div>

      {/* A4 Canvas Area */}
      <div className="flex-1 overflow-y-auto bg-slate-950/50 p-12 flex flex-col items-center custom-scrollbar pb-32 space-y-12">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-[210mm] min-h-[297mm] bg-white/5 border border-slate-800/50 shadow-2xl relative flex flex-col items-center justify-center rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 opacity-30 animate-pulse"></div>
              <div className="flex flex-col items-center space-y-8 z-10">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-teal-500/20 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-teal-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-teal-400 font-bold text-2xl tracking-tight">
                    İçerikler Dokunuyor
                  </p>
                  <p className="text-slate-500 text-sm font-medium">
                    Bilişsel Yük Filtreleniyor... Pedagojik Katmanlar Oluşturuluyor...
                  </p>
                </div>
              </div>
            </motion.div>
          ) : generatedContents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-[210mm] min-h-[297mm] bg-white shadow-2xl relative flex flex-col items-center justify-center p-8 text-slate-800 font-lexend rounded-sm"
            >
              <div className="text-center space-y-6 max-w-md">
                <div className="text-6xl grayscale opacity-20">📄</div>
                <div className="space-y-2">
                  <p className="font-bold text-2xl text-slate-600">Henüz etkinlik üretilmedi.</p>
                  <p className="text-slate-400 text-sm">
                    Sol taraftaki şablon menüsünden bir veya daha fazla şablon seçerek "Premium
                    Üretim" butonuna basın.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            generatedContents.flatMap((content, index) => {
              // Backend'den gelen raw markdown'ı ===SAYFA_SONU=== referansına göre böl (Split)
              const rawContent = content.pages[0]?.content || '';
              const pages = rawContent
                .split(/===SAYFA_SONU===/i)
                .filter((p) => p.trim().length > 0);
              const safePages = pages.length > 0 ? pages : ['[İçerik Bulunamadı]']; // Fallback

              return safePages.map((pageContent, subIndex) => (
                <motion.div
                  key={`${content.id}-chunk-${subIndex}`}
                  initial={{ opacity: 0, scale: 0.98, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: (index + subIndex) * 0.15,
                    duration: 0.6,
                    type: 'spring',
                    damping: 20,
                  }}
                  className="w-[210mm] min-h-[297mm] bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative p-16 text-slate-800 font-lexend print:shadow-none print:m-0 print:p-0 print:w-full print:min-h-0 page-break-after-always overflow-hidden flex flex-col"
                >
                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 logo-diagonal-cut pointer-events-none opacity-50 print:hidden"></div>

                  {/* Header Section */}
                  <div
                    className={`flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-12 relative ${subIndex > 0 ? 'print:pb-2 print:mb-6' : ''}`}
                  >
                    <div className="space-y-4">
                      <div className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                        Modüler Süper Stüdyo v2.0{' '}
                        {safePages.length > 1 && `- Sayfa ${subIndex + 1}`}
                      </div>
                      <h1 className="text-4xl font-extrabold text-slate-950 tracking-tight leading-none uppercase">
                        {content.pages[0].title}
                      </h1>
                    </div>

                    {/* Öğrenci Bilgi Alanı (Sadece ilk sayfada) */}
                    {subIndex === 0 && (
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[13px] font-bold pt-2">
                        <div className="flex items-center text-slate-400 uppercase tracking-tighter">
                          İSİM: <span className="ml-2 w-32 border-b-2 border-slate-200 h-5"></span>
                        </div>
                        <div className="flex items-center text-slate-400 uppercase tracking-tighter">
                          SINIF: <span className="ml-2 w-16 border-b-2 border-slate-200 h-5"></span>
                        </div>
                        <div className="flex items-center text-slate-400 uppercase tracking-tighter">
                          TARİH: <span className="ml-2 w-32 border-b-2 border-slate-200 h-5"></span>
                        </div>
                        <div className="flex items-center text-slate-400 uppercase tracking-tighter">
                          NO: <span className="ml-2 w-16 border-b-2 border-slate-200 h-5"></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Body */}
                  <div className="flex-1 relative">
                    <MarkdownRenderer
                      content={pageContent}
                      className="text-lg leading-relaxed text-slate-800"
                    />
                  </div>

                  {/* Footer & Pedagogical Note */}
                  <div className="mt-12 pt-8 border-t border-slate-100 relative group">
                    {/* Pedagogik Rapor sadece en son sayfada görünür */}
                    {subIndex === safePages.length - 1 && content.pages[0].pedagogicalNote && (
                      <div className="mb-6 relative">
                        <div className="absolute -top-3 left-6 px-3 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 rounded">
                          Eğitici Notu & Değerlendirme
                        </div>
                        <div className="bg-slate-50/80 border-2 border-dashed border-slate-200 p-6 rounded-2xl text-[13px] leading-relaxed text-slate-600 print:hidden transition-colors group-hover:bg-slate-50 group-hover:border-teal-200/50">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-lg shrink-0">
                              <i className="fa-solid fa-graduation-cap"></i>
                            </div>
                            <div className="space-y-1">
                              <span className="font-bold text-slate-800 block">
                                Stratejik Uygulama Notu:
                              </span>
                              {content.pages[0].pedagogicalNote}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-full">
                      <span>Bursa Disleksi & Özel Öğrenme Güçlüğü Akademisi</span>
                      <span>
                        Sayfa 0{subIndex + 1} {safePages.length > 1 && `/ 0${safePages.length}`}
                      </span>
                    </div>
                  </div>

                  {/* Print Only Watermark */}
                  <div className="hidden print:block absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-slate-50 opacity-10 text-9xl font-black -rotate-45 pointer-events-none select-none">
                    OOGMATİK
                  </div>
                </motion.div>
              ));
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
