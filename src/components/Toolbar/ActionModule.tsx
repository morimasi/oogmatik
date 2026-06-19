import React, { useState } from 'react';
import { StyleSettings, WorksheetData } from '../../types';
import { IconButton } from './ToolbarShared';
import { usePaperSizeStore } from '../../store/usePaperSizeStore';
import { printService, PaperSize } from '../../utils/printService';
import { ExportProgressModal } from '../ExportProgressModal';
import { useToastStore } from '../../store/useToastStore';
import { useFascicleStore } from '../../store/useFascicleStore';
import { logError } from '../../utils/logger.js';
import { snapshotService } from '../../utils/snapshotService';

interface ActionModuleProps {
  settings: StyleSettings;
  onSave: () => void;
  onAssign?: () => void;
  onShare?: () => void;
  worksheetData?: WorksheetData;
  activityType?: string;
}

export const ActionModule: React.FC<ActionModuleProps> = ({
  settings,
  onSave,
  onAssign,
  onShare,
  worksheetData,
  activityType,
}) => {
  const [exportProgress, setExportProgress] = useState({ open: false, percent: 0, message: '' });
  const [snapshotMenuOpen, setSnapshotMenuOpen] = useState(false);
  const paperSizeStore = usePaperSizeStore();
  const toast = useToastStore();
  const paperSize = paperSizeStore.paperSize;

  const handleAddToFascicle = () => {
    if (!worksheetData || !activityType) {
      toast.warning('Fasiküle eklemek için önce bir etkinlik oluşturun.');
      return;
    }
    const { addItem, items } = useFascicleStore.getState();
    addItem({
      id: crypto.randomUUID(),
      type: activityType,
      difficulty: 'Orta',
      pageCount: Array.isArray(worksheetData) ? worksheetData.length : 1,
      order: items.length,
      content: worksheetData,
      pedagogicalNote: 'Stüdyodan eklendi.'
    });
    toast.success('Fasiküle başarıyla eklendi!');
  };

  const handleUnifiedPrint = async (method: 'pdf' | 'print' | 'v2') => {
    try {
      setExportProgress({ open: true, percent: 0, message: 'Sayfa hazırlanıyor...' });
      
      const targetSelector = document.getElementById('print-container') ? '#print-container' : '.worksheet-page';
      
      if (method === 'v2') {
         const { forceRenderAllPages, ensurePrintStyle } = await import('../../utils/print/CSSInjector');
         forceRenderAllPages();
         ensurePrintStyle(paperSize);
         await new Promise(r => setTimeout(r, 500)); // CSS injection bekleme
      }

      await printService.generatePdf(targetSelector, settings.title || 'bdmind_Calisma_Kagidi', {
        action: method === 'pdf' ? 'download' : 'print',
        paperSize: paperSize,
        onProgress: (percent, message) => {
          setExportProgress({ open: true, percent, message });
        },
      });

      if (method === 'pdf') toast.success('PDF Başarıyla İndirildi!');
    } catch (e) {
      logError(e as Error);
      toast.error('İşlem sırasında bir hata oluştu.');
    } finally {
      setTimeout(() => setExportProgress({ open: false, percent: 0, message: '' }), 800);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
       <ExportProgressModal 
        isOpen={exportProgress.open} 
        percent={exportProgress.percent} 
        message={exportProgress.message} 
      />

      {/* Dışa Aktarma Grubu */}
      <div className="flex items-center bg-[var(--surface-glass)]/50 border border-[var(--border-color)] rounded-2xl p-1 gap-0.5 shadow-sm backdrop-blur-md">
        <button
          title="PDF Olarak İndir"
          onClick={() => handleUnifiedPrint('pdf')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all duration-200
            bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-500 hover:scale-[1.03] active:scale-95 uppercase tracking-wider"
        >
          <i className="fa-solid fa-file-pdf text-xs"></i>
          <span className="hidden lg:inline">PDF</span>
        </button>

        <button
          title="Sistem Yazdır"
          onClick={() => handleUnifiedPrint('print')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all duration-200
            bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-500 hover:scale-[1.03] active:scale-95 uppercase tracking-wider"
        >
          <i className="fa-solid fa-print text-xs"></i>
          <span className="hidden lg:inline">YAZDIR</span>
        </button>

        <button
          title="Profesyonel Yazdır (V2)"
          onClick={() => handleUnifiedPrint('v2')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all duration-200
            bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.03] active:scale-95 uppercase tracking-wider"
        >
          <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
          <span className="hidden lg:inline">YAZDIR V2</span>
        </button>

        <div className="relative">
            <IconButton 
                icon="fa-camera" 
                title="Görüntü Al" 
                onClick={() => setSnapshotMenuOpen(!snapshotMenuOpen)}
                active={snapshotMenuOpen}
                className="!w-9 !h-9"
            />
            {snapshotMenuOpen && (
                <div className="absolute top-full mt-2 right-0 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 p-1.5 min-w-[200px] animate-in fade-in zoom-in-95 backdrop-blur-xl ring-1 ring-black/5">
                    <button
                        onClick={() => { setSnapshotMenuOpen(false); snapshotService.takeSnapshot('.worksheet-page', 'etkinlik', 'download'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                    >
                        <i className="fa-solid fa-image text-indigo-500 w-4"></i> Sayfayı Kaydet (PNG)
                    </button>
                    <button
                        onClick={() => { setSnapshotMenuOpen(false); snapshotService.takeSnapshot('.worksheet-page', 'etkinlik', 'clipboard'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-green-50 hover:text-green-700 transition-all"
                    >
                        <i className="fa-solid fa-copy text-green-500 w-4"></i> Panoya Kopyala
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Kaydetme & Atama Grubu */}
      <div className="flex items-center bg-[var(--surface-glass)]/50 border border-[var(--border-color)] rounded-2xl p-1 gap-1 shadow-sm backdrop-blur-md">
        <IconButton 
            icon="fa-bookmark" 
            title="Arşive Kaydet" 
            onClick={onSave}
            colorClass="text-amber-500"
        />
        {onAssign && (
            <IconButton 
                icon="fa-user-plus" 
                title="Öğrenciye Ata" 
                onClick={onAssign}
                colorClass="text-emerald-500"
            />
        )}
        {onShare && (
            <IconButton 
                icon="fa-share-nodes" 
                title="Hızlı Paylaş" 
                onClick={onShare}
                colorClass="text-sky-500"
            />
        )}
        <IconButton 
            icon="fa-layer-group" 
            title="Fasiküle Ekle" 
            onClick={handleAddToFascicle}
            colorClass="text-fuchsia-500"
        />
      </div>
    </div>
  );
};
