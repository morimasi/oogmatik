<<<<<<< HEAD
import React, { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { UniversalPreviewFrame } from '../../components/shared/UniversalPreviewFrame';

interface UniversalWorksheetViewerProps {
  isReady: boolean;
  /** Render edilecek PDF bileşeni (React.FC) veya React Element'i */
  DocumentComponent: React.ComponentType<any> | React.ReactElement<any>;
=======
import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { SuperTypography } from '@/modules/super-turkce/shared/ui/atoms';

interface UniversalWorksheetViewerProps {
  isReady: boolean;
  DocumentComponent: React.ComponentType<any>;
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
  emptyStateIcon?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  isLoading?: boolean;
<<<<<<< HEAD
  fileName?: string;
  title?: string;
=======
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
}

export const UniversalWorksheetViewer: React.FC<UniversalWorksheetViewerProps> = ({
  isReady,
  DocumentComponent,
<<<<<<< HEAD
  emptyStateIcon = 'fa-regular fa-file-pdf',
  emptyStateTitle = 'Çalışma Kağıdı Üretimi',
  emptyStateDescription = 'Sol panelden ayarlarınızı yapın...',
  isLoading = false,
  fileName = 'Oogmatik_Uretim.pdf',
  title = 'ÇALIŞMA KAĞIDI',
}) => {
  const [zoom, setZoom] = useState(1);

  // DocumentComponent bir fonksiyon/sınıf bileşeni mi yoksa React elementi mi (jsx) olduğunu kontrol et
  const Document = React.isValidElement(DocumentComponent)
    ? DocumentComponent
    : React.createElement(DocumentComponent as React.ComponentType<any>);

  // PDF İndirme Butonu (Süper Türkçe V2'den alındı)
  const downloadLink =
    isReady && !isLoading ? (
      <PDFDownloadLink
        document={Document}
        fileName={fileName}
        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm"
      >
        {({ loading }: any) => (
          <>
            <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
            {loading ? 'Dizgi...' : 'PDF İndir'}
          </>
        )}
      </PDFDownloadLink>
    ) : null;

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-200/50 h-full relative flex flex-col items-center justify-center p-8 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm p-8 animate-pulse w-full max-w-4xl border border-white/40">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
          <div className="h-6 w-48 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex-1 bg-slate-200/50 h-full relative flex flex-col items-center justify-center p-8 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm p-8 w-full max-w-4xl">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <i className={`${emptyStateIcon} text-3xl`}></i>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{emptyStateTitle}</h3>
          <p className="text-slate-500 text-center max-w-sm text-sm">{emptyStateDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <UniversalPreviewFrame
      mode="pdf"
      title={title}
      zoom={zoom}
      onZoomChange={setZoom}
      downloadLink={downloadLink}
      bgClass="bg-slate-200/50"
    >
      <div className="w-full h-full shadow-2xl">
        <ErrorBoundary>
          <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={false}>
            {Document}
          </PDFViewer>
        </ErrorBoundary>
      </div>
    </UniversalPreviewFrame>
=======
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
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
  );
};
