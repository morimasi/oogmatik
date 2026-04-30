/**
 * Oogmatik Print Engine — Barrel Export
 * Geriye dönük uyumluluk: mevcut `printService` API'si korunur.
 * Tüm diğer modüller bu dosya üzerinden erişilebilir.
 */

// Tip exportları
export type { PaperSize, PdfQuality, PrintOptions, PaperMargins, PaperDimensions } from './types';

// Modülleri import et
import type { PaperSize, PrintOptions } from './types';
import { print, captureAndPrint } from './OverlayPrinter';
import { generateRealPdf } from './PDFGenerator';

import { logInfo, logError, logWarn } from '../../utils/logger.js';
/**
 * printService — merkezi yazdırma API'si
 * Tüm bileşenler bu objeyi kullanır.
 * İç yapı modülerleştirildi ama dış API aynı kalır.
 */
export const printService = {
  /**
   * DOM klon + overlay + window.print()
   */
  print,

  /**
   * html2canvas tabanlı capture + print/download
   */
  captureAndPrint,

  /**
   * jsPDF ile gerçek PDF üretimi
   */
  generateRealPdf,

  /**
   * Premium Pagination Engine — Uzun içerikleri A4 sayfalarına böler.
   * Şu an CSS tabanlı page-break ile yönetiliyor; gelecekte DOM bölme eklenecek.
   */
  paginateContent: async (roots: HTMLElement[], _paperSize: PaperSize): Promise<HTMLElement[]> => {
    return roots;
  },

  /**
   * Backward compatibility — mevcut bileşenler bu metodu çağırıyor.
   * useCapture: false geçilirse eski overlay modunu kullanır.
   */
  generatePdf: async (
    elementSelector: string,
    title: string = 'EduMind_Etkinlik',
    options?: PrintOptions
  ) => {
    try {
      const paperSize: PaperSize = options?.paperSize ?? 'A4';
      const action = options?.action ?? 'print';

      if (action === 'download') {
        await generateRealPdf(elementSelector, title, {
          paperSize,
          quality: options?.quality ?? 'high',
          onProgress: options?.onProgress,
        });
      } else {
        const originalTitle = document.title;
        if (title) document.title = title.replace(/[^a-z0-9ğüşıöç]/gi, '_');
        await print(elementSelector, paperSize);
        if (title)
          setTimeout(() => {
            document.title = originalTitle;
          }, 1000);
      }
    } catch (error) {
      logError('PDF Generation Error:', error);
      document.body.classList.remove('printing-mode');
    }
  },
};

// Ek modül exportları (doğrudan erişim gerektiğinde)
export { ensurePrintStyle, forceRenderAllPages, clearRenderAllPagesFlag } from './CSSInjector';
export { preloadFontsForCapture, onCloneForCapture, captureAllPages, collectPages, hasRenderableContent } from './CaptureEngine';
export { renderPagePreview, renderAllPagesPreview } from './PreviewRenderer';
