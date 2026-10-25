import React, { ErrorInfo, ReactNode, Component } from 'react';
import { logError } from '../utils/logger.js';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Readonly<Props>;

  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, { componentStack: errorInfo.componentStack });
  }

  public render() {
    if (this.state.hasError) {
      const errorMsg = (this.state.error?.message || '').toLowerCase();
      const isChunkError =
        errorMsg.includes('failed to fetch dynamically imported module') ||
        errorMsg.includes('importing a module script failed') ||
        errorMsg.includes('error loading dynamically imported module') ||
        errorMsg.includes('loading chunk') ||
        errorMsg.includes('dinamik olarak');

      if (isChunkError) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] text-center font-lexend">
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <i className="fa-solid fa-arrows-rotate text-xl animate-spin"></i>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Yeni Bir Güncelleme Yayınlandı</h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
              Platformun yeni bir sürümü yüklendi. En güncel stüdyo ve içeriklere ulaşmak için lütfen sayfayı yenileyin.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Sayfayı Şimdi Yenile
            </button>
          </div>
        );
      }

      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 border-2 border-dashed border-red-200 bg-red-50 rounded-xl text-center">
            <i className="fa-solid fa-bug text-3xl text-red-400 mb-2"></i>
            <h3 className="text-sm font-bold text-red-700">Bu içerik yüklenemedi.</h3>
            <p className="text-xs text-red-500 mt-1 max-w-[200px]">
                Veri eksik veya hatalı olabilir. Lütfen "Yeniden Oluştur" butonunu deneyin.
            </p>
            <details className="mt-2 text-[8px] text-left text-red-400 w-full overflow-hidden">
                <summary>Teknik Detay</summary>
                {this.state.error?.message}
            </details>
        </div>
      );
    }

    return this.props.children;
  }
}
