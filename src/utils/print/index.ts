/**
 * bdmind Print Engine — Barrel Export
 * Geriye dönük uyumluluk: mevcut `printService` API'si korunur.
 * Tüm diğer modüller bu dosya üzerinden erişilebilir.
 */

// Tip exportları
export type { PaperSize, PdfQuality, PrintOptions, PaperMargins, PaperDimensions } from './types';

// Modülleri import et
import type { PaperSize, PrintOptions } from './types';
import { print, captureAndPrint } from './OverlayPrinter';
import { generateRealPdf } from './PDFGenerator';
import { paginateDomContent } from './SmartGridPaginator';
import { buildExportPages, releaseExportStage } from './SmartLayout';

import { logError } from '../../utils/logger.js';
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
   * Akıllı DOM & Izgara Sayfalama Motoru
   */
  paginateContent: paginateDomContent,

  /**
   * Akıllı mizanpaj: kaynak DOM sayfalarını kağıda tam oturan sayfalara böler.
   * Yazdırma ve PDF ile aynı motoru kullanır.
   */
  buildExportPages,

  /** Export ölçüm sahnesini serbest bırakır. */
  releaseExportStage,

  /**
   * Backward compatibility — mevcut bileşenler bu metodu çağırıyor.
   * useCapture: false geçilirse eski overlay modunu kullanır.
   */
  generatePdf: async (
    elementSelector: string,
    title: string = 'EduMind_Etkinlik',
    options?: PrintOptions
  ): Promise<Blob | null> => {
    try {
      const paperSize: PaperSize = options?.paperSize ?? 'A4';
      const action = options?.action ?? 'print';
      const grayscale = options?.grayscale ?? false;

      if (action === 'download') {
        return await generateRealPdf(elementSelector, title, {
          paperSize,
          quality: options?.quality ?? 'high',
          grayscale,
          selectedPages: options?.selectedPages,
          onProgress: options?.onProgress,
        });
      } else {
        const originalTitle = document.title;
        if (title) document.title = title.replace(/[^a-z0-9ğüşıöç]/gi, '_');
        await print(elementSelector, paperSize, grayscale);
        if (title)
          setTimeout(() => {
            document.title = originalTitle;
          }, 1000);
      }

      const currentUser = auth?.currentUser;
      if (currentUser) {
        activityLogService.logActivity(currentUser.uid, 'export', 'PDF Dışa Aktarma', title, elementSelector);
      }
      return null;
    } catch (error) {
      logError('PDF Generation Error:', typeof error === 'object' && error !== null && !Array.isArray(error) ? error as Record<string, unknown> : undefined);
      document.body.classList.remove('printing-mode', 'print-ink-saver');
      return null;
    }
  },
};

// Ek modül exportları (doğrudan erişim gerektiğinde)
export { ensurePrintStyle, forceRenderAllPages, clearRenderAllPagesFlag } from './CSSInjector';
export { preloadFontsForCapture, onCloneForCapture, captureAllPages, collectPages, hasRenderableContent } from './CaptureEngine';
export { renderPagePreview, renderAllPagesPreview } from './PreviewRenderer';
export { renderPaginatedPreview } from './PaginatedPreview';
export {
  buildExportPages,
  releaseExportStage,
  resolvePageBox,
  chunkByHeights,
  rebalanceChunks,
  planBreakOffsets,
  DEFAULT_PRINT_MARGIN_MM,
  type ExportPage,
  type PageBox,
  type BlockMeasure,
  type PaginateOptions,
} from './SmartLayout';
