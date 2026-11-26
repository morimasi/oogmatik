/**
 * bdmind Print Engine — Overlay Yazdırma Modülü (v4.0)
 *
 * DOM klonlama + akıllı mizanpaj + overlay + window.print().
 *
 * v4.0: Sayfalar artık körlemesine klonlanmıyor. İçerik önce SmartLayout
 * motoruyla kağıda tam oturan sayfalara bölünür; böylece tarayıcı hiçbir
 * soruyu/kartı ortadan kesmez, taşan kısım anlamsız biçimde sonraki sayfaya
 * akmaz. Devam sayfaları "Devam" rozetiyle işaretlenir.
 */

import type { PaperSize } from './types';
import { PAPER_DIMENSIONS, PAGE_SELECTORS } from './constants';
import {
  ensurePrintStyle,
  injectPrintLockCSS,
  forceRenderAllPages,
  clearRenderAllPagesFlag,
} from './CSSInjector';
import {
  preloadFontsForCapture,
  collectPages,
  hasRenderableContent,
  waitForOverlayImages,
  stripScalesAndTransforms,
  pixelLockElement,
  onCloneForCapture,
} from './CaptureEngine';
import { buildExportPages, releaseExportStage, DEFAULT_PRINT_MARGIN_MM } from './SmartLayout';
import { generateRealPdf } from './PDFGenerator';

import { logError } from '../../utils/logger.js';
import { useToastStore } from '../../store/useToastStore.js';

// ─── Overlay Oluşturma Yardımcıları ────────────────────────────────────────

/**
 * Data URL görsellerden print overlay oluşturur.
 * captureAndPrint'in sonunda kullanılır.
 */
const buildCapturedPrintOverlay = (
  dataUrls: string[],
  paperSize: PaperSize,
  title: string
): HTMLElement | null => {
  if (typeof document === 'undefined') return null;

  ensurePrintStyle(paperSize);
  document.title = (title || 'EduMind').replace(/[^a-z0-9ğüşıöç]/gi, '_');

  let overlay = document.getElementById('print-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'print-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = '';
  overlay.style.display = 'block';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'white';
  overlay.style.zIndex = '2147483647';
  overlay.style.overflow = 'auto';

  const dims = PAPER_DIMENSIONS[paperSize] || PAPER_DIMENSIONS.A4;

  dataUrls.forEach((url) => {
    const page = document.createElement('div');
    page.className = 'print-page';
    page.style.width = dims?.width || '210mm';
    page.style.maxWidth = dims?.width || '210mm';
    // 297mm min-height + 8mm @page marjı = her görsel için ikinci boş sayfa.
    // Yükseklik görselin en-boy oranına bırakılır.
    page.style.minHeight = '0';
    page.style.height = 'auto';
    page.style.margin = '0 auto';
    page.style.background = '#fff';
    page.style.pageBreakAfter = 'always';
    page.style.breakAfter = 'page';
    page.style.pageBreakInside = 'avoid';
    page.style.breakInside = 'avoid';

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'print-page';
    img.style.display = 'block';
    img.style.width = '100%';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';

    page.appendChild(img);
    overlay!.appendChild(page);
  });

  const lastPage = overlay.lastElementChild as HTMLElement | null;
  if (lastPage) {
    lastPage.style.pageBreakAfter = 'auto';
    lastPage.style.breakAfter = 'auto';
  }

  return overlay;
};

// ─── DOM Klon Yazdırma (print) ──────────────────────────────────────────────

/**
 * Premium Yazdırma Motoru v4.0 — (Akıllı Mizanpaj & Native Overlay)
 * Iframe kullanmak yerine ana sayfa üzerinde görünmez bir katman (Overlay) açar
 * ve native yazdırma komutunu kullanır. İçerik önce sayfalara bölünür.
 */
export const print = async (
  elementSelector: string = '.worksheet-page',
  paperSize: PaperSize = 'A4',
  grayscale: boolean = false
): Promise<void> => {
  if (typeof window === 'undefined') return;

  ensurePrintStyle(paperSize);
  const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
  if (!isTestEnv) {
    await forceRenderAllPages();
  }

  // 1. Yazdırılacak sayfaları topla
  const roots = Array.from(document.querySelectorAll(elementSelector)) as HTMLElement[];
  const pages: HTMLElement[] = [];
  const selectorText = PAGE_SELECTORS.join(',');

  if (roots.length === 0) {
    // Fallback: verilen seçici bulunamadıysa bilinen sayfa seçicilerini topla
    const fallbackRoots = Array.from(
      document.querySelectorAll('.worksheet-page, .print-exact')
    ) as HTMLElement[];
    pages.push(...fallbackRoots);
  } else {
    roots.forEach((root) => {
      if (root.matches(selectorText)) {
        pages.push(root);
      } else {
        const nested = Array.from(root.querySelectorAll(selectorText)) as HTMLElement[];
        if (nested.length > 0) pages.push(...nested);
        else pages.push(root);
      }
    });
  }

  // İç içe geçmiş (nested) sayfa elemanlarını tekilleştir
  const uniquePages = pages.filter((page, index) => {
    return !pages.some((otherPage, otherIndex) => otherIndex !== index && otherPage.contains(page));
  });
  pages.length = 0;
  pages.push(...uniquePages);

  if (pages.length === 0) {
    try {
      window.print();
    } catch (err: unknown) {
      logError('Print fallback failed:', {
        message: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  const isLandscape =
    paperSize === 'Extreme_Yatay' ||
    pages.some(
      (p) => p.classList.contains('orientation-landscape') || p.classList.contains('landscape')
    );

  // 2. Akıllı mizanpaj — kağıda tam oturan sayfalar
  const exportPages = buildExportPages(pages, {
    paperSize,
    landscape: isLandscape,
    marginMm: DEFAULT_PRINT_MARGIN_MM,
    continuationLabel: 'Devam',
  });

  const printablePages =
    exportPages.length > 0
      ? exportPages.map((p) => p.element)
      : pages.map((p) => p.cloneNode(true) as HTMLElement);

  // 3. Overlay Hazırlığı
  let overlay = document.getElementById('print-overlay');
  if (overlay) {
    overlay.innerHTML = '';
  } else {
    overlay = document.createElement('div');
    overlay.id = 'print-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = 'auto';
    overlay.style.overflow = 'visible';
    overlay.style.margin = '0';
    overlay.style.padding = '0';
    overlay.style.zIndex = '2147483647';
    document.body.appendChild(overlay);
  }

  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.backgroundColor = 'white';
  overlay.style.zIndex = '2147483647';
  overlay.style.display = 'block';

  const wrapperContainer = document.createElement('div');
  wrapperContainer.className = 'print-pages-container';
  overlay.appendChild(wrapperContainer);

  // Print Lock CSS enjeksiyonu
  injectPrintLockCSS(paperSize, isLandscape);

  // 4. Sayfaları klonla (export sayfaları zaten kağıt ölçüsünde)
  printablePages.forEach((page) => {
    const clone = page.cloneNode(true) as HTMLElement;

    clone.classList.remove('hidden', 'invisible', 'opacity-0', 'd-none');
    clone.style.display = 'block';
    clone.style.visibility = 'visible';
    clone.style.opacity = '1';
    clone.style.transform = 'none';
    clone.style.zoom = '1';
    clone.style.margin = '0 auto';

    // @page marjı (8mm) tarayıcı tarafından uygulanacağı için klon tam genişlik alır
    clone.style.setProperty('width', '100%', 'important');
    clone.style.setProperty('min-width', '100%', 'important');
    clone.style.setProperty('max-width', '100%', 'important');
    clone.style.setProperty('height', 'auto', 'important');
    clone.style.setProperty('max-height', 'none', 'important');
    clone.style.setProperty('min-height', '0', 'important');
    clone.style.setProperty('overflow', 'visible', 'important');
    clone.style.setProperty('box-shadow', 'none', 'important');
    clone.style.setProperty('border', 'none', 'important');
    clone.style.setProperty('padding', '0', 'important');
    clone.style.setProperty('box-sizing', 'border-box', 'important');
    clone.style.transformOrigin = 'top left';

    const wrapper = document.createElement('div');
    wrapper.className = 'bdmind-print-wrapper';
    wrapper.appendChild(clone);
    wrapperContainer.appendChild(wrapper);
  });

  // Export sahnesi artık gerekli değil
  releaseExportStage();

  // 5. Native Render Stabilizasyonu (Font Ready + Layout Sync)
  document.body.classList.add('printing-mode');
  document.body.classList.toggle('print-ink-saver', grayscale);

  const prevTheme = document.documentElement.className;
  document.documentElement.className = 'theme-light';

  try {
    if ('fonts' in document) {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    }

    // Layout'un oturması için kısa bir bekleme
    await new Promise((resolve) => setTimeout(resolve, 400));

    let cleanupTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (cleanupTimer) clearTimeout(cleanupTimer);
      document.documentElement.className = prevTheme;
      document.body.classList.remove('printing-mode', 'print-ink-saver');
      if (overlay) overlay.style.display = 'none';
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);

    window.print();

    // Browser afterprint'i desteklemiyorsa fallback temizlik
    cleanupTimer = setTimeout(cleanup, 60000);
  } catch (err: unknown) {
    logError('Print trigger failed:', {
      error: err instanceof Error ? err.message : String(err),
    });
    document.documentElement.className = prevTheme;
    document.body.classList.remove('printing-mode', 'print-ink-saver');
    if (overlay) overlay.style.display = 'none';
  }
};

// ─── html2canvas Tabanlı Yazdırma (captureAndPrint) ─────────────────────────

/**
 * html2canvas tabanlı capture + print (Premium Engine v7.0)
 * Her sayfayı ekrandaki görünümüyle birebir yakalar ve overlay üzerinden basar.
 */
export const captureAndPrint = async (
  rootSelector: string,
  title: string = 'EduMind_Etkinlik',
  action: 'print' | 'download' = 'print',
  paperSize: PaperSize = 'A4',
  grayscale: boolean = false
): Promise<void> => {
  await forceRenderAllPages();
  try {
    const roots = Array.from(document.querySelectorAll(rootSelector)) as HTMLElement[];
    if (roots.length === 0) {
      logError(`[OverlayPrinter] HATA: "${rootSelector}" bulunamadı.`);
      useToastStore
        .getState()
        .error(
          'Yazdırılacak içerik bulunamadı. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.'
        );
      return;
    }

    if (!hasRenderableContent(roots)) {
      logError(`[OverlayPrinter] HATA: "${rootSelector}" bulundu ama içerik boş.`);
      useToastStore
        .getState()
        .error(
          'Yazdırılacak içerik henüz hazır değil. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.'
        );
      return;
    }

    const pages = collectPages(rootSelector);

    await preloadFontsForCapture();

    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default || html2canvasModule;
    const dataUrls: string[] = [];

    // html2canvas'ın document.write() violation'ını önle
    const origWrite = document.write.bind(document);
    document.write = (() => {}) as typeof document.write;

    try {
      for (const page of pages) {
        const restoreScales = stripScalesAndTransforms(page);
        const restorePixels = pixelLockElement(page);

        await new Promise<void>((r) => requestAnimationFrame(() => r()));

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: '#ffffff',
          foreignObjectRendering: true,
          windowWidth: page.scrollWidth,
          windowHeight: page.scrollHeight,
          width: page.offsetWidth,
          height: page.offsetHeight,
          x: 0,
          y: 0,
          onclone: (_clonedDoc: Document, clonedEl: HTMLElement) => {
            onCloneForCapture(_clonedDoc);
            clonedEl.style.transform = 'none';
            clonedEl.style.zoom = '1';
          },
          ignoreElements: (el: Element) => {
            const htmlEl = el as HTMLElement;
            return (
              htmlEl.classList?.contains('resize-handle') ||
              htmlEl.classList?.contains('action-button') ||
              htmlEl.classList?.contains('no-print') ||
              htmlEl.hasAttribute?.('data-design-only')
            );
          },
        });

        restorePixels();
        restoreScales();

        dataUrls.push(canvas.toDataURL('image/png', 1.0));
      }
    } finally {
      document.write = origWrite;
    }

    // 4. Yazdırmayı Başlat (Overlay Üzerinden)
    if (action === 'download') {
      dataUrls.forEach((url, i) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9ğüşıöçA-Z]/g, '_')}${
          dataUrls.length > 1 ? `_sayfa_${i + 1}` : ''
        }.png`;
        a.click();
      });
      return;
    }

    // Print via overlay
    const overlay = buildCapturedPrintOverlay(dataUrls, paperSize, title);
    if (!overlay) return;

    await waitForOverlayImages(overlay);

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    document.body.classList.add('printing-mode');
    document.body.classList.toggle('print-ink-saver', grayscale);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    document.body.offsetHeight;

    const prevTheme = document.documentElement.className;
    document.documentElement.className = 'theme-light';

    setTimeout(() => {
      try {
        window.print();
      } catch (e: unknown) {
        logError('Capture print failed', { error: e instanceof Error ? e.message : String(e) });
      } finally {
        document.documentElement.className = prevTheme;
        document.body.classList.remove('printing-mode', 'print-ink-saver');
        if (overlay) overlay.innerHTML = '';
      }
    }, 120);

    // Mobil fallback
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      setTimeout(async () => {
        if (document.body.classList.contains('printing-mode')) {
          document.documentElement.className = prevTheme;
          document.body.classList.remove('printing-mode', 'print-ink-saver');
          if (overlay) {
            overlay.innerHTML = '';
            overlay.style.display = 'none';
          }
          try {
            const blob = await generateRealPdf(rootSelector, title, { paperSize });
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              window.open(blobUrl, '_blank');
              setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
            }
          } catch (fallbackErr: unknown) {
            logError('Mobile print fallback failed', {
              error: fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr),
            });
          }
        }
      }, 3000);
    }
  } finally {
    clearRenderAllPagesFlag();
  }
};

// ─── afterprint Cleanup Listener ────────────────────────────────────────────

/**
 * Browser afterprint event'i ve focus fallback'i ile cleanup yapar.
 */
export const registerCleanupListeners = (): void => {
  if (typeof window === 'undefined') return;

  const cleanup = () => {
    document.body.classList.remove('printing-mode', 'print-ink-saver');
    const overlay = document.getElementById('print-overlay');
    if (overlay) {
      overlay.innerHTML = '';
      overlay.style.display = 'none';
    }
  };

  window.addEventListener('afterprint', cleanup);
  window.addEventListener('focus', () => {
    setTimeout(cleanup, 1000);
  });
};

// Otomatik kayıt
registerCleanupListeners();
