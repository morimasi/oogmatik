import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './PDFViewer.module.css';

interface PDFErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  fallback?: ReactNode;
}

interface PDFErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class PDFErrorBoundary extends Component<PDFErrorBoundaryProps, PDFErrorBoundaryState> {
  public state: PDFErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): PDFErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[PDFErrorBoundary]', error, info);
    this.props.onError?.(error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorContainer} role="alert" aria-live="assertive">
          <i className={`fa-solid fa-file-circle-exclamation ${styles.errorIcon}`} aria-hidden="true" />
          <h3 className={styles.errorTitle}>PDF yüklenemedi</h3>
          <p className={styles.errorMessage}>
            {this.state.error?.message ?? 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
          </p>
          <button
            className={styles.retryButton}
            onClick={this.handleRetry}
            aria-label="PDF görüntüleyiciyi yeniden yükle"
          >
            <i className="fa-solid fa-rotate-right mr-2" aria-hidden="true" />
            Yeniden Dene
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
