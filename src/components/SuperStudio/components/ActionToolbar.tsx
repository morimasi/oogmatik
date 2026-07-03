import React from 'react';
import { useSuperStudioStore } from '../../../store/useSuperStudioStore';
import { worksheetService } from '../../../services/worksheetService';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';
import { printService } from '../../../utils/printService';
import { SingleWorksheetData, ActivityType } from '../../../types';
import { getTemplateById } from '../templates/registry';

import { logInfo, logError, logWarn } from '../../../utils/logger.js';
import { useFascicleStore } from '../../../store/useFascicleStore';

interface ActionToolbarProps {
}

export const ActionToolbar: React.FC<ActionToolbarProps> = () => {
  const { generatedContents, isGenerating, selectedTemplates, difficulty } = useSuperStudioStore();
  const { user } = useAuthStore();
  const { show: addToast } = useToastStore();

  const firstTemplateDef = selectedTemplates.length > 0 ? getTemplateById(selectedTemplates[0]) : null;

  const handleSave = async () => {
    if (!user) {
      addToast('Kaydetmek için giriş yapmalısınız.', 'error');
      return;
    }
    if (generatedContents.length === 0) return;

    try {
      const content = generatedContents[0];
      const firstPage = content?.pages?.[0] as Record<string, unknown> | undefined;

      if (!firstPage) {
        addToast('Kaydedilecek veri bulunamadı.', 'error');
        return;
      }

      const worksheetData: SingleWorksheetData[] = [
        {
          id: content.id,
          type: content.templateId,
          title: (firstPage.title as string) || 'Adsız Etkinlik',
          instruction: (firstPage.instruction as string) || 'Aşağıdaki etkinliği dikkatlice tamamlayalım.',
          content: firstPage.content,

        },
      ];

      await worksheetService.saveWorksheet(
        user.id,
        (firstPage.title as string) || 'Adsız Etkinlik',
        content.templateId as ActivityType,
        worksheetData,
        'fa-solid fa-wand-magic-sparkles',
        { id: content.templateId, title: firstTemplateDef?.title || 'Süper Türkçe Etkinliği' },
      );
      addToast('Çalışma başarıyla buluta kaydedildi.', 'success');
    } catch (error) {
      logError(error instanceof Error ? error : String(error), { context: 'Kaydetme hatası' });
      addToast('Kaydedilirken bir hata oluştu.', 'error');
    }
  };

  const handlePrint = () => {
    const targetSelector = '.a4-page';
    printService.generateRealPdf(targetSelector, 'Super_Turkce_Etkinlik', {
      paperSize: 'A4',
      quality: 'high',
    });
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
         onClick={() => {
              const { addItem, items } = useFascicleStore.getState();
              addItem({
                  id: crypto.randomUUID(),
                  type: ActivityType.SUPER_STUDIO,
                  difficulty: difficulty || 'Orta',
                  pageCount: generatedContents.length,
                  order: items.length,
                  content: { content: generatedContents },

              });
             addToast('Fasiküle başarıyla eklendi!', 'success');
         }}
         disabled={isGenerating || generatedContents.length === 0}
         className="px-4 py-2 bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white rounded-xl text-xs font-semibold transition-all border border-fuchsia-500/50 flex items-center gap-2 backdrop-blur-md hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
         title="Fasiküle Ekle"
       >
         <i className="fa-solid fa-layer-group"></i>
         <span className="hidden sm:inline">Fasiküle Ekle</span>
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
