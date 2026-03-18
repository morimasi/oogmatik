import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

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
  emptyStateIcon = 'fa-regular fa-file-pdf',
  emptyStateTitle = 'Çalışma Kağıdı Üretimi',
  emptyStateDescription = 'Sol panelden ayarlarınızı yapın...',
  isLoading = false,
}) => {
  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-pulse">
          <div className="w-20 h-20 bg-slate-200 rounded-full mb-6"></div>
          <div className="h-6 w-48 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-slate-200 rounded"></div>
        </div>
      ) : isReady ? (
        <div className="flex-1 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white relative">
          <ErrorBoundary>
            <PDFViewer width="100%" height="100%" className="border-none absolute inset-0">
              <DocumentComponent />
            </PDFViewer>
          </ErrorBoundary>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-6">
            <i className={`${emptyStateIcon} text-3xl`}></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">{emptyStateTitle}</h3>
          <p className="text-slate-500 text-center max-w-sm">{emptyStateDescription}</p>
        </div>
      )}
    </div>
  );
};
