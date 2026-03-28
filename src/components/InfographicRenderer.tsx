/**
 * InfographicRenderer.tsx
 * @antv/infographic DOM API için React wrapper.
 * Bora Demir standardı: any yasak, TypeScript strict, cleanup zorunlu.
 *
 * DÜZELTMELER (2026-03):
 * - useEffect dependency array'i [editable, syntax] olarak düzeltildi
 * - Container boyut sorunu giderildi (explicit width/height)
 * - Race condition: pendingSyntaxRef ile instance hazır olunca render
 * - API yükleme hatası: NativeInfographicRenderer'a fallback
 */

import React, { useEffect, useRef, useState } from 'react';
import { NativeInfographicRenderer } from './NativeInfographicRenderer';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

// @antv/infographic'in Infographic sınıfı için tip tanımı
interface InfographicOptions {
  container: HTMLElement;
  width?: string | number;
  height?: string | number;
  editable?: boolean;
}

interface InfographicInstance {
  render(syntax: string): void;
  update(syntax: string): void;
  destroy(): void;
  // toDataURL gerçek imza ExportOptions objesi veya string alabilir
  toDataURL(options?: unknown): Promise<string>;
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback: (...args: unknown[]) => void): void;
}

interface InfographicRendererProps {
  /** @antv/infographic declarative syntax string */
  syntax: string;
  /** Düzenlenebilir mod (built-in editor) */
  editable?: boolean;
  /** Yükseklik (CSS değer) */
  height?: string;
  /** Hata callback */
  onError?: (error: Error) => void;
  /** Hazır callback */
  onReady?: () => void;
  className?: string;
}

/**
 * @antv/infographic'i React componentine dönüştürür.
 * Yüklenemezse NativeInfographicRenderer'a fallback yapar.
 */
const InfographicRenderer: React.FC<InfographicRendererProps> = ({
  syntax,
  editable = false,
  height = '400px',
  onError,
  onReady,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<InfographicInstance | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useNative, setUseNative] = useState(false);
  // Pending syntax: instance hazır olmadan gelen syntax'ı sakla
  const pendingSyntaxRef = useRef<string>('');

  // Container'ın sayısal yüksekliğini hesapla
  const numericHeight = (() => {
    if (!height) return 600;
    const n = parseInt(height, 10);
    return isNaN(n) ? 600 : n;
  })();

  // Mount + editable değişince: yeni instance oluştur
  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    const initInfographic = async () => {
      try {
        setIsLoading(true);
        setRenderError(null);
        setUseNative(false);

        // Dynamic import — SSR güvenliği için
        const mod = await import('@antv/infographic');
        const InfographicClass = mod.Infographic;

        if (!mounted || !containerRef.current) return;

        // Varsa temizle
        if (instanceRef.current) {
          instanceRef.current.destroy();
          instanceRef.current = null;
        }

        const containerEl = containerRef.current;
        const options: InfographicOptions = {
          container: containerEl,
          width: containerEl.clientWidth || 800,
          height: numericHeight,
          editable,
        };

        const infographic = new (InfographicClass as new (
          opts: InfographicOptions
        ) => InfographicInstance)(options);
        instanceRef.current = infographic;

        // Bekleyen syntax varsa hemen render et
        const syntaxToRender = pendingSyntaxRef.current || syntax;
        if (syntaxToRender?.trim()) {
          infographic.render(syntaxToRender);
        }

        setIsLoading(false);
        onReady?.();
      } catch (err) {
        if (!mounted) return;
        const error = err instanceof Error ? err : new Error(String(err));
        // @antv/infographic yüklenemezse native renderer'a geç
        setUseNative(true);
        setRenderError(null);
        setIsLoading(false);
        onReady?.();
        // Hatayı loglayalım ama kullanıcıya gösterme (native renderer devreye giriyor)
        const appError = new AppError(
          '@antv/infographic yüklenemedi, native renderer aktif',
          'INFOGRAPHIC_LOAD_ERROR',
          500,
          { originalError: error.message }
        );
        logger.error(appError);
  }

  if (renderError) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-6 text-center ${className}`}
        style={{ height }}
      >
        <i className="fa-solid fa-triangle-exclamation text-red-400 text-2xl mb-3"></i>
        <p className="text-red-600 dark:text-red-400 text-sm font-medium">
          İnfografik render edilemedi
        </p>
        <p className="text-red-400 text-xs mt-1 max-w-xs">{renderError}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-xl z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 text-xs font-medium">İnfografik yükleniyor…</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease',
          width: '100%',
          height: `${numericHeight}px`,
          minHeight: `${numericHeight}px`,
        }}
      />
    </div>
  );
};

export default InfographicRenderer;
