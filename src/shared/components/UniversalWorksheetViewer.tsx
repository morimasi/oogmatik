import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { SuperTypography } from '@/modules/super-turkce/shared/ui/atoms';

interface UniversalWorksheetViewerProps {
  isReady: boolean;
  DocumentComponent: React.ComponentType<any>;
  emptyStateIcon?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  isLoading?: boolean;
}

export const UniversalWorksheetViewer: React.FC<UniversalWorksheetViewerProps> = ({
  isReady,
  DocumentComponent,
  emptyStateIcon = 'fa-solid fa-wand-magic-sparkles',
  emptyStateTitle = 'Dizgi Üretim Hattı Beklemede',
  emptyStateDescription = 'Yapay zeka zekasını ateşlemek için sol panelden parametreleri belirleyin.',
  isLoading = false,
}) => {
  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 overflow-hidden bg-[#0a0a0b] relative">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center bg-[#121214] rounded-[2.5rem] border border-white/5 shadow-2xl p-12 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
            <div className="relative flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin mb-8"></div>
              <SuperTypography variant="h3" weight="extrabold" className="mb-2 text-white">Dizgi İşleniyor...</SuperTypography>
              <SuperTypography variant="body" color="muted" className="text-center max-w-xs">
                Multimodal Gemini 2.0 verileri matbaa formatına dönüştürüyor.
              </SuperTypography>
            </div>
          </motion.div>
        ) : isReady ? (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10 bg-zinc-900 relative ring-1 ring-white/5"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 z-20"></div>
            <ErrorBoundary>
              {DocumentComponent ? (
                <PDFViewer width="100%" height="100%" className="border-none absolute inset-0 bg-[#0a0a0b]" showToolbar={true}>
                  <DocumentComponent />
                </PDFViewer>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                   Bileşen yüklenemedi.
                </div>
              )}
            </ErrorBoundary>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center bg-[#121214] rounded-[2.5rem] border border-white/5 shadow-inner p-12"
          >
            <div className="w-24 h-24 bg-white/5 text-zinc-600 rounded-3xl flex items-center justify-center mb-8 border border-white/10 rotate-3 hover:rotate-0 transition-transform duration-500">
              <i className={`${emptyStateIcon} text-4xl`}></i>
            </div>
            <SuperTypography variant="h2" weight="extrabold" className="mb-4 text-center">
              {emptyStateTitle}
            </SuperTypography>
            <SuperTypography variant="body" color="muted" className="text-center max-w-sm leading-relaxed">
              {emptyStateDescription}
            </SuperTypography>

            <div className="mt-12 flex items-center gap-2 opacity-20">
              <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
