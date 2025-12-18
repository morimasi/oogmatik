import React, { ErrorInfo, ReactNode, Component } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  // Fix for TS error: explicit declaration if React types are behaving oddly
  declare props: Readonly<Props>;

  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
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
