import React, { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { UniversalPreviewFrame } from '../../components/shared/UniversalPreviewFrame';

interface UniversalWorksheetViewerProps {
  isReady: boolean;
  /** Render edilecek PDF bileşeni (React.FC) veya React Element'i */
  DocumentComponent: React.ComponentType<any> | React.ReactElement<any>;
  emptyStateIcon?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  isLoading?: boolean;
  fileName?: string;
  title?: string;
}

export const UniversalWorksheetViewer: React.FC<UniversalWorksheetViewerProps> = ({
  isReady,
  DocumentComponent,
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
  );
};
