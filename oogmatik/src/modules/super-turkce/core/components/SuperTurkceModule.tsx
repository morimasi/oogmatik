import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Cockpit from './Cockpit/Cockpit';
import { CategoryDashboard } from './CategoryDashboard/CategoryDashboard';
import { ArchivePanel } from './CategoryDashboard/ArchivePanel';
import { VocabularyPanel } from './CategoryDashboard/VocabularyPanel';
import { A4PrintableSheetV2 } from '../../features/grid-pdf/A4PrintableSheetV2';
import { useSuperTurkceStore } from '../store';
import { registerPdfFonts } from '../../shared/pdf-utils/fonts';
import { UniversalWorksheetViewer } from '../../../../shared/components/UniversalWorksheetViewer';
import { SuperTypography, SuperButton } from '../../shared/ui/atoms';

// Fontları uygulamanın başlangıcında kaydediyoruz
registerPdfFonts();

interface SuperTurkceModuleProps {
  onBack?: () => void;
  onAddToWorkbook?: (data: any) => void;
  onSave?: (name: string, activityType: any, data: any[]) => Promise<any>;
  onShareToCommunity?: () => void;
}

import { PremiumExportService } from '../utils/exportService';

const SuperTurkceModule: React.FC<SuperTurkceModuleProps> = ({
  onBack,
  onAddToWorkbook,
  onSave,
  onShareToCommunity,
}) => {
  const { selectedObjective, activeCategory, setActiveCategory } = useSuperTurkceStore();
  const studioRef = React.useRef<HTMLDivElement>(null);

  const handleSaveToArchive = async () => {
    if (onSave && selectedObjective) {
      try {
        await onSave(
          `Süper Türkçe - ${selectedObjective.title}`,
          'super_turkce_v3',
          []
        );
      } catch (error) {
        console.error('Save error:', error);
      }
    }
  };

  const handleAddWorkbook = () => {
    if (onAddToWorkbook && selectedObjective) {
      onAddToWorkbook({
        id: `ST-${Date.now()}`,
        title: selectedObjective.title,
        module: 'SuperTurkce',
        createdAt: new Date().toISOString()
      });
    }
  };

  const handleCaptureImage = async () => {
    if (studioRef.current && selectedObjective) {
      await PremiumExportService.downloadAsImage(studioRef.current, `Super_Turkce_${selectedObjective.id}`);
    }
  };

  const handleBackClick = () => {
    if (activeCategory) {
      setActiveCategory(null); // Alt stüdyodan Ana Portal'a dön
    } else if (onBack) {
      onBack(); // Ana Portal'dan App Anasayfasına dön
    }
  };

  // Stüdyo ismini almak için yardımcı fonksiyon
  const getStudioName = () => {
    switch (activeCategory) {
      case 'okuma_anlama':
        return 'Okuma Anlama & Yorumlama';
      case 'mantik_muhakeme':
        return 'Mantık Muhakeme & Paragraf';
      case 'dil_bilgisi':
        return 'Dil Bilgisi ve Anlatım';
      case 'yazim_noktalama':
        return 'Yazım Kuralları ve Noktalama';
      case 'soz_varligi':
        return 'Deyimler ve Söz Varlığı';
      case 'ses_olaylari':
        return 'Hece ve Ses Olayları';
      default:
        return 'Bilinmeyen Stüdyo';
    }
  };

  return (
    <motion.div
      ref={studioRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full h-full bg-[#0a0a0b] overflow-hidden"
    >
      {/* Premium Header Bar (Dinamik) */}
      {activeCategory && !['archive', 'vocabulary'].includes(activeCategory) && (
        <div className="h-18 bg-[#121214]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-30 shadow-2xl">
          <div className="flex items-center gap-5">
            <button
              onClick={handleBackClick}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/10 transition-all active:scale-95"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div className="flex flex-col">
              <SuperTypography variant="h4" weight="extrabold">{getStudioName()}</SuperTypography>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <SuperTypography variant="caption" color="muted" weight="bold" className="uppercase tracking-[0.2em] text-[8px]">
                  Canlı Üretim Hattı / Studio Mode
                </SuperTypography>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SuperButton
              variant="glass"
              size="sm"
              leftIcon={<i className="fa-solid fa-camera text-indigo-400"></i>}
              onClick={handleCaptureImage}
            >
              Görüntü Al
            </SuperButton>

            <SuperButton
              variant="glass"
              size="sm"
              leftIcon={<i className="fa-solid fa-book-medical text-emerald-400"></i>}
              onClick={handleAddWorkbook}
            >
              Kitaba Ekle
            </SuperButton>

            <div className="w-px h-6 bg-white/10 mx-1"></div>

            <PDFDownloadLink
              document={<A4PrintableSheetV2 />}
              fileName={`Super_Turkce_V3_${selectedObjective?.id || 'Premium'}.pdf`}
            >
              {({ loading }: any) => (
                <SuperButton
                  variant="glass"
                  size="sm"
                  isLoading={loading}
                  leftIcon={<i className="fa-solid fa-file-arrow-down text-rose-400"></i>}
                >
                  PDF İndir
                </SuperButton>
              )}
            </PDFDownloadLink>

            <SuperButton
              variant="primary"
              size="sm"
              leftIcon={<i className="fa-solid fa-print"></i>}
              onClick={() => window.print()}
            >
              Yazdır
            </SuperButton>

            <SuperButton
              variant="glass"
              size="sm"
              onClick={handleSaveToArchive}
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </SuperButton>
          </div>
        </div>
      )}

      {/* İçerik Alanı (Dynamic Render) */}
      <div className="flex-1 overflow-hidden flex relative bg-slate-100/30">
        <AnimatePresence mode="wait">
          {!activeCategory ? (
            <motion.div
              key="dashboard"
              className="w-full h-full absolute inset-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <CategoryDashboard />
            </motion.div>
          ) : activeCategory === 'archive' ? (
            <motion.div
              key="archive"
              className="w-full h-full absolute inset-0 bg-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ArchivePanel />
            </motion.div>
          ) : activeCategory === 'vocabulary' ? (
            <motion.div
              key="vocabulary"
              className="w-full h-full absolute inset-0 bg-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <VocabularyPanel />
            </motion.div>
          ) : (
            <motion.div
              key="studio"
              className="w-full h-full absolute inset-0 flex"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Sol Panel: Alt Stüdyo Formu (Sub-Cockpit) */}
              <Cockpit />

              {/* Sağ Panel: A4 Önizleme Alanı */}
              <UniversalWorksheetViewer
                isReady={!!selectedObjective}
                DocumentComponent={A4PrintableSheetV2}
                emptyStateTitle="Çalışma Kağıdı Üretimi"
                emptyStateDescription="Sol panelden sınıf ve konu parametrelerini seçip, çıktı formatını belirleyerek A4 üretimini başlatabilirsiniz."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SuperTurkceModule;
