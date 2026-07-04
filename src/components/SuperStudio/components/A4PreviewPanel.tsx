import React, { useState, useMemo, useEffect } from 'react';
import { ActionToolbar } from './ActionToolbar';
import { useSuperStudioStore } from '../../../store/useSuperStudioStore';
import { motion, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from '../../Common/MarkdownRenderer';
import { getTemplateById } from '../templates/registry';
import { BrandedLoadingAnimation } from '../../shared/BrandedLoadingAnimation';

interface A4PreviewPanelProps {
}

export const A4PreviewPanel: React.FC<A4PreviewPanelProps> = () => {
  const { generatedContents, isGenerating } = useSuperStudioStore();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showAllPages, setShowAllPages] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // Tüm sayfaları hesapla
  const allPages = useMemo(() => {
    if (generatedContents.length === 0) return [];

    return generatedContents.flatMap((content) =>
      content.pages.map((page, subIndex) => ({
        content: page.content,
        title: page.title || '',
        id: `${content.id}-page-${subIndex}`,
        pageNumber: subIndex + 1,
        totalPages: content.pages.length,
        contentId: content.id,
        templateId: content.templateId,
      }))
    );
  }, [generatedContents]);

  const totalPages = allPages.length;
  const currentPage = allPages[currentPageIndex];

  const nextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToPage = (index: number) => {
    if (index >= 0 && index < totalPages) {
      setCurrentPageIndex(index);
    }
  };

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
          {totalPages > 0 && (
            <span className="ml-3 bg-teal-500/10 text-teal-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-teal-500/20">
              {totalPages} Sayfa
            </span>
          )}
        </div>

        {/* Sayfa Navigasyonu */}
        {totalPages > 1 && !showAllPages && !showGallery && (
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPageIndex === 0}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>

            <div className="flex items-center gap-1 px-3 py-1 bg-slate-800 rounded-lg">
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPageIndex + 1}
                onChange={(e) => goToPage(parseInt(e.target.value) - 1)}
                className="w-12 text-center bg-transparent text-slate-300 text-sm font-medium focus:outline-none"
              />
              <span className="text-slate-500 text-sm">/ {totalPages}</span>
            </div>

            <button
              onClick={nextPage}
              disabled={currentPageIndex === totalPages - 1}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-chevron-right text-sm"></i>
            </button>

            <button
              onClick={() => { setShowAllPages(true); setShowGallery(false); }}
              className="ml-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Tümünü Göster
            </button>
          </div>
        )}

        {totalPages > 1 && showAllPages && !showGallery && (
          <button
            onClick={() => setShowAllPages(false)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            Sayfa Görünümü
          </button>
        )}

        {/* Galeri toggle — her zaman görünür */}
        {generatedContents.length > 0 && (
          <button
            onClick={() => setShowGallery(!showGallery)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              showGallery
                ? 'bg-teal-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-grid-2 mr-1.5"></i>
            {showGallery ? 'Gizle' : 'Galeri'}
          </button>
        )}

        <ActionToolbar />
      </div>

      {/* A4 Canvas Area */}
      <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center custom-scrollbar pb-32 space-y-12">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <BrandedLoadingAnimation
              size="fullpage"
              className="w-[210mm] min-h-[297mm] rounded-2xl overflow-hidden"
            />
          ) : showGallery && generatedContents.length > 0 ? (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedContents.map((content) => {
                  const tplDef = getTemplateById(content.templateId);
                  const excerpt = content.pages[0]?.content
                    .replace(/[#*_`]/g, '')
                    .split('\n')
                    .filter(l => l.trim())
                    .slice(0, 3)
                    .join(' ')
                    .substring(0, 120) || 'İçerik hazır';
                  const pageCount = content.pages.length;

                  return (
                    <motion.div
                      key={content.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      onClick={() => {
                        const idx = allPages.findIndex(p => p.contentId === content.id);
                        if (idx >= 0) {
                          setCurrentPageIndex(idx);
                          setShowGallery(false);
                          setShowAllPages(false);
                        }
                      }}
                      className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 cursor-pointer hover:border-teal-500/40 hover:bg-slate-700/60 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20 flex items-center justify-center text-lg">
                            <i className={tplDef?.icon || 'fa-solid fa-file'}></i>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                              {tplDef?.title || content.templateId}
                            </h3>
                            <p className="text-[10px] text-slate-500">
                              {pageCount} sayfa
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-600 bg-slate-900/50 px-2 py-0.5 rounded-full">
                          #{pageCount}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {excerpt}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[10px] text-teal-500/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="fa-solid fa-eye text-xs"></i>
                        <span>İncele</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : totalPages === 0 ? (
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
          ) : showAllPages ? (
            // Tüm sayfaları göster modu
            <motion.div
              key="all-pages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-[210mm] space-y-12"
            >
              {allPages.map((page, index) => (
                <div
                  key={page.id}
                  className="w-[210mm] min-h-[297mm] bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative p-16 text-slate-800 font-lexend print:shadow-none print:m-0 print:p-0 print:w-full print:min-h-0 page-break-after-always overflow-hidden flex flex-col a4-page"
                >
                  <PageContent page={page} index={index} />
                </div>
              ))}
            </motion.div>
          ) : (
            // Tek sayfa görünümü
            <motion.div
              key={`page-${currentPageIndex}`}
              initial={{ opacity: 0, scale: 0.98, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.6,
                type: 'spring',
                damping: 20,
              }}
              className="w-[210mm] min-h-[297mm] bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative p-16 text-slate-800 font-lexend print:shadow-none print:m-0 print:p-0 print:w-full print:min-h-0 page-break-after-always overflow-hidden flex flex-col a4-page"
            >
              <PageContent page={currentPage} index={currentPageIndex} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Page Content Component
const PageContent: React.FC<{ page: any; index: number }> = ({ page, index }) => {
  if (!page) return null;

  return (
    <>
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 logo-diagonal-cut pointer-events-none opacity-50 print:hidden"></div>

      {/* Header Section */}
      <div
        className={`flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-12 relative ${page.pageNumber > 1 ? 'print:pb-2 print:mb-6' : ''}`}
      >
        <div className="space-y-4">
          <div className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-200">
            Modüler Süper Stüdyo v2.0 {page.totalPages > 1 && `- Sayfa ${page.pageNumber}`}
          </div>
          <h1 className="text-4xl font-extrabold text-slate-950 tracking-tight leading-none uppercase">
            {page.title}
          </h1>
        </div>

        {/* Öğrenci Bilgi Alanı (Sadece ilk sayfada) */}
        {page.pageNumber === 1 && (
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
          content={page.content}
          className="text-lg leading-relaxed text-slate-800"
        />
      </div>

      {/* Footer & Pedagogical Note */}
      <div className="mt-12 pt-8 border-t border-slate-100 relative group">
        {/* Pedagogik Rapor sadece en son sayfada görünür */}
        {page.pageNumber === page.totalPages && (
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
                  Pedagogical note will be displayed here.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-full">
          <span>Bursa Disleksi & Özel Öğrenme Güçlüğü Akademisi</span>
          <span>
            Sayfa {page.pageNumber.toString().padStart(2, '0')} {page.totalPages > 1 && `/ ${page.totalPages.toString().padStart(2, '0')}`}
          </span>
        </div>
      </div>

      {/* Print Only Watermark */}
      <div className="hidden print:block absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-slate-50 opacity-10 text-9xl font-black -rotate-45 pointer-events-none select-none">
        OOGMATİK
      </div>
    </>
  );
};
