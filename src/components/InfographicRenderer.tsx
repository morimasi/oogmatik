/**
 * InfographicRenderer.tsx
 * @antv/infographic DOM API için React wrapper.
 * Bora Demir standardı: any yasak, TypeScript strict, cleanup zorunlu.
 */

import React, { useEffect, useRef, useState } from 'react';

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
  toDataURL(type?: string): Promise<string>;
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
 * Infographic DOM sınıfını useEffect ile container div'e bağlar.
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

  // Mount: @antv/infographic instance oluştur
  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    const initInfographic = async () => {
      try {
        setIsLoading(true);
        setRenderError(null);

        // Dynamic import — SSR güvenliği için
        const { Infographic } = await import('@antv/infographic');

        if (!mounted || !containerRef.current) return;

        // Varsa temizle
        if (instanceRef.current) {
          instanceRef.current.destroy();
          instanceRef.current = null;
        }

        const options: InfographicOptions = {
          container: containerRef.current,
          width: '100%',
          height: '100%',
          editable,
        };

        const infographic = new (Infographic as new (opts: InfographicOptions) => InfographicInstance)(options);
        instanceRef.current = infographic;

        if (syntax?.trim()) {
          infographic.render(syntax);
        }

        setIsLoading(false);
        onReady?.();
      } catch (err) {
        if (!mounted) return;
        const error = err instanceof Error ? err : new Error(String(err));
        setRenderError(error.message);
        setIsLoading(false);
        onError?.(error);
      }
    };

    initInfographic();

    return () => {
      mounted = false;
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable]);

  // Syntax değişince güncelle (yeni instance açmadan)
  useEffect(() => {
    if (!instanceRef.current || !syntax?.trim()) return;
    try {
      instanceRef.current.render(syntax);
      setRenderError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setRenderError(error.message);
      onError?.(error);
    }
  }, [syntax, onError]);

  if (renderError) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-6 text-center ${className}`}
        style={{ height }}
      >
        <i className="fa-solid fa-triangle-exclamation text-red-400 text-2xl mb-3"></i>
        <p className="text-red-600 dark:text-red-400 text-sm font-medium">İnfografik render edilemedi</p>
        <p className="text-red-400 text-xs mt-1 max-w-xs">{renderError}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-xl z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 text-xs font-medium">İnfografik yükleniyor…</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}
      />
    </div>
  );
};

export default InfographicRenderer;
