import React, { useEffect, useRef, useCallback } from 'react';
import styles from './PDFViewer.module.css';
import type { DyslexiaSettings } from './hooks/useDyslexiaSettings';

interface PDFPageRendererProps {
  /** PDF.js document object */
  pdfDocument: any | null;
  pageNumber: number;
  zoom: number;
  dyslexiaSettings?: Partial<DyslexiaSettings>;
  onPageRendered?: () => void;
  onRenderError?: (error: Error) => void;
  fitMode?: 'page' | 'width' | 'height';
  containerWidth?: number;
  containerHeight?: number;
  ariaLabel?: string;
}

export const PDFPageRenderer: React.FC<PDFPageRendererProps> = React.memo(
  ({
    pdfDocument,
    pageNumber,
    zoom,
    dyslexiaSettings,
    onPageRendered,
    onRenderError,
    fitMode = 'page',
    containerWidth,
    containerHeight,
    ariaLabel,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<any>(null);

    const renderPage = useCallback(async () => {
      if (!pdfDocument || !canvasRef.current) return;

      // Cancel any in-progress render
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore cancellation errors
        }
      }

      try {
        const page = await pdfDocument.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });

        let scale = zoom / 100;

        // Adjust scale for fit modes
        if (fitMode === 'width' && containerWidth) {
          scale = containerWidth / baseViewport.width;
        } else if (fitMode === 'height' && containerHeight) {
          scale = containerHeight / baseViewport.height;
        } else if (fitMode === 'page' && containerWidth && containerHeight) {
          const scaleX = containerWidth / baseViewport.width;
          const scaleY = containerHeight / baseViewport.height;
          scale = Math.min(scaleX, scaleY);
        }

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
        onPageRendered?.();
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException') return;
        onRenderError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }, [pdfDocument, pageNumber, zoom, fitMode, containerWidth, containerHeight, dyslexiaSettings, onPageRendered, onRenderError]);

    useEffect(() => {
      renderPage();
      return () => {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // ignore
          }
        }
      };
    }, [renderPage]);

    // Dyslexia visual settings are applied to the wrapper div (not the canvas element,
    // which is a bitmap container and does not support CSS text properties)
    const wrapperStyle: React.CSSProperties = {
      backgroundColor: dyslexiaSettings?.backgroundColor ?? '#ffffff',
    };

    return (
      <div
        className={styles.pageRendererWrapper}
        style={wrapperStyle}
        role="img"
        aria-label={ariaLabel ?? `Sayfa ${pageNumber}`}
      >
        <canvas
          ref={canvasRef}
          className={styles.pageCanvas}
          aria-label={`PDF sayfa ${pageNumber} içeriği`}
        />
      </div>
    );
  },
);

PDFPageRenderer.displayName = 'PDFPageRenderer';
