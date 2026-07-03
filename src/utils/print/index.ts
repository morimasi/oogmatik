/**
 * bdmind Print Engine — Barrel Export
 * Geriye dönük uyumluluk: mevcut `printService` API'si korunur.
 * Tüm diğer modüller bu dosya üzerinden erişilebilir.
 */

// Tip exportları
export type { PaperSize, PdfQuality, PrintOptions, PaperMargins, PaperDimensions } from './types';

// Modülleri import et
import type { PaperSize, PrintOptions } from './types';
import { PAPER_DIMENSIONS } from './constants';
import { print, captureAndPrint } from './OverlayPrinter';
import { generateRealPdf } from './PDFGenerator';

import { logInfo, logError, logWarn } from '../../utils/logger.js';
import { activityLogService } from '../../services/activityLogService';
import { auth } from '../../services/firebaseClient';
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
   * Her root elementi alır, A4 yüksekliğini (297mm ≈ 1123px) aşan içeriği
   * birden çok sayfaya bölerek döndürür.
   */
  paginateContent: async (roots: HTMLElement[], paperSize: PaperSize = 'A4'): Promise<HTMLElement[]> => {
    const dims = PAPER_DIMENSIONS[paperSize] || PAPER_DIMENSIONS.A4;
    const pxPerMm = 96 / 25.4;
    const heightMm = parseFloat(dims.height);
    const widthMm = parseFloat(dims.width);
    const pageHeightPx = heightMm * pxPerMm;
    const marginPx = 8 * pxPerMm;
    const contentHeightPx = pageHeightPx - marginPx * 2;

    const result: HTMLElement[] = [];

    for (const root of roots) {
      const clone = root.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = `${widthMm * pxPerMm}px`;
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.visibility = 'hidden';
      clone.style.display = 'block';
      clone.style.padding = `${marginPx}px`;
      document.body.appendChild(clone);

      const totalHeight = clone.scrollHeight;

      if (totalHeight <= contentHeightPx) {
        document.body.removeChild(clone);
        result.push(root);
        continue;
      }

      const children = Array.from(clone.children);
      let currentPage = document.createElement('div');
      currentPage.className = root.className;
      currentPage.style.cssText = root.style.cssText;
      currentPage.style.width = `${widthMm * pxPerMm}px`;
      currentPage.style.height = `${pageHeightPx}px`;
      currentPage.style.overflow = 'hidden';
      currentPage.style.padding = `${marginPx}px`;
      currentPage.style.boxSizing = 'border-box';

      let currentHeight = 0;

      for (const child of children) {
        const childClone = child.cloneNode(true) as HTMLElement;
        currentPage.appendChild(childClone);
        document.body.appendChild(currentPage);
        const pageRealHeight = currentPage.scrollHeight;
        document.body.removeChild(currentPage);

        if (pageRealHeight > contentHeightPx && currentHeight > 0) {
          currentPage.removeChild(childClone);
          result.push(currentPage);

          currentPage = document.createElement('div');
          currentPage.className = root.className;
          currentPage.style.cssText = root.style.cssText;
          currentPage.style.width = `${widthMm * pxPerMm}px`;
          currentPage.style.height = `${pageHeightPx}px`;
          currentPage.style.overflow = 'hidden';
          currentPage.style.padding = `${marginPx}px`;
          currentPage.style.boxSizing = 'border-box';
          currentPage.appendChild(childClone);
          currentHeight = 0;
        }
        currentHeight = pageRealHeight;
      }

      if (currentPage.children.length > 0) {
        result.push(currentPage);
      }

      document.body.removeChild(clone);
    }

    return result;
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

      const currentUser = auth.currentUser;
      if (currentUser) {
        activityLogService.logActivity(currentUser.uid, 'export', 'PDF Dışa Aktarma', title, elementSelector);
      }
    } catch (error) {
      logError('PDF Generation Error:', typeof error === 'object' && error !== null && !Array.isArray(error) ? error as Record<string, unknown> : undefined);
      document.body.classList.remove('printing-mode');
    }
  },
};

// Ek modül exportları (doğrudan erişim gerektiğinde)
export { ensurePrintStyle, forceRenderAllPages, clearRenderAllPagesFlag } from './CSSInjector';
export { preloadFontsForCapture, onCloneForCapture, captureAllPages, collectPages, hasRenderableContent } from './CaptureEngine';
export { renderPagePreview, renderAllPagesPreview } from './PreviewRenderer';
