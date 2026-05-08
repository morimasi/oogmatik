import React from 'react';
import { useSuperStudioStore } from '../../../store/useSuperStudioStore.js';
import { worksheetService } from '../../../services/worksheetService.js';
import { useAuthStore } from '../../../store/useAuthStore.js';
import { useToastStore } from '../../../store/useToastStore.js';
import { printService } from '../../../utils/printService.js';
import { SingleWorksheetData, ActivityType } from '../../../types.js';

import { logInfo, logError, logWarn } from '../../../utils/logger.js';
export const ActionToolbar: React.FC = () => {
  const { generatedContents, isGenerating } = useSuperStudioStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const handleSave = async () => {
    if (!user) {
      addToast('Kaydetmek için giriş yapmalısınız.', 'error');
      return;
    }
    if (generatedContents.length === 0) return;

    try {
      // İlk sayfa baz alınarak kaydediliyor
      const content = generatedContents[0];
      const firstPage = content.pages[0] as Record<string, unknown>;

      // SingleWorksheetData formatına dönüştür
      const worksheetData: SingleWorksheetData[] = [
        {
          id: content.id,
          type: content.templateId,
          title: (firstPage.title as string) || 'Adsız Etkinlik',
          instruction: (firstPage.instruction as string) || 'Aşağıdaki etkinliği dikkatlice tamamlayalım.',
          content: firstPage.content,
          pedagogicalNote: (firstPage.pedagogicalNote as string) || '',
        },
      ];

      await worksheetService.saveWorksheet(
        user.uid,
        (firstPage.title as string) || 'Adsız Etkinlik',
        content.templateId as ActivityType,
        worksheetData,
        'fa-solid fa-wand-magic-sparkles',
        { id: 'super-turkce', title: 'Süper Türkçe' },
        undefined,
        undefined,
        'default-student'
      );
      addToast('Çalışma başarıyla buluta kaydedildi.', 'success');
    } catch (error) {
      logError(error instanceof Error ? error : String(error), { context: 'Kaydetme hatası' });
      addToast('Kaydedilirken bir hata oluştu.', 'error');
    }
  };

  const handlePrint = () => {
    const targetSelector = '.super-reading-preview-area';
    const allPages = document.querySelectorAll('.super-reading-preview-area .a4-page, .super-reading-preview-area .worksheet-page');
    const hasMultiplePages = allPages.length > 1;

    if (hasMultiplePages) {
      // Çoklu sayfa: gerçek PDF motoru kullan
      printService.generateRealPdf(targetSelector, 'Super_Turkce_Etkinlik', {
        paperSize: 'A4',
        quality: 'high',
        onProgress: (percent, message) => {
          console.log(`PDF İlerleme: ${percent}% - ${message}`);
        }
      });
    } else {
      // Tek sayfa: overlay print kullan
      printService.generatePdf(targetSelector, 'Super_Turkce_Etkinlik', {
        action: 'print'
      });
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleSave}
        disabled={isGenerating || generatedContents.length === 0}
        className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700/50 flex items-center gap-2 backdrop-blur-md hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
        title="Sisteme Kaydet veya Arşivle"
      >
        <i className="fa-solid fa-cloud-arrow-up text-teal-400"></i>
        <span className="hidden sm:inline">Kaydet</span>
      </button>
      <button
        className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700/50 flex items-center gap-2 backdrop-blur-md hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
        title="Kayıtlı Bir Kitapçığa Ekle"
        disabled={generatedContents.length === 0}
      >
        <i className="fa-solid fa-book-medical text-amber-400"></i>
        <span className="hidden sm:inline">Kitapçığa Ekle</span>
      </button>
      <button
        onClick={handlePrint}
        disabled={isGenerating || generatedContents.length === 0}
        className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        title="A4 Olarak Yazdır veya PDF İndir"
      >
        <i className="fa-solid fa-file-pdf"></i>
        <span className="hidden sm:inline uppercase tracking-tight">PDF Olarak İndir</span>
      </button>
    </div>
  );
};
