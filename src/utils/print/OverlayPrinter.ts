/**
 * Oogmatik Print Engine — Overlay Yazdırma Modülü
 * DOM klonlama + overlay oluşturma + window.print() tetikleme.
 * Hem düz DOM klonu hem html2canvas tabanlı yazdırma desteklenir.
 */

import type { PaperSize } from './types';
import { PAPER_DIMENSIONS, PAGE_SELECTORS, PRINTABLE_A4_WIDTH_PX } from './constants';
import { ensurePrintStyle, injectPrintLockCSS, forceRenderAllPages, clearRenderAllPagesFlag } from './CSSInjector';
import {
  preloadFontsForCapture,
  collectPages,
  hasRenderableContent,
  waitForOverlayImages,
  stripScalesAndTransforms,
  pixelLockElement,
  onCloneForCapture,
} from './CaptureEngine';
import { generateRealPdf } from './PDFGenerator';

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
  document.title = (title || 'Oogmatik').replace(/[^a-z0-9ğüşıöç]/gi, '_');

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

  const dims = PAPER_DIMENSIONS[paperSize];

  dataUrls.forEach((url) => {
    const page = document.createElement('div');
    page.className = 'print-page';
    page.style.width = dims.width;
    page.style.minHeight = dims.height;
    page.style.maxWidth = dims.width;
    page.style.margin = '0 auto';
    page.style.background = '#fff';
    page.style.pageBreakAfter = 'always';
    page.style.breakAfter = 'page';

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'print-page';
    img.style.display = 'block';
    img.style.width = '100%';
    img.style.height = 'auto';

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
 * Premium Yazdırma Motoru v3.0 — (Native Overlay & Scale-to-Fit)
 * Iframe kullanmak yerine ana sayfa üzerinde görünmez bir katman (Overlay) açıp
 * native yazdırma komutunu kullanır. Beyaz sayfa sorununu %100 çözer.
 */
export const print = async (
  elementSelector: string = '.worksheet-page',
  paperSize: PaperSize = 'A4'
): Promise<void> => {
  if (typeof window === 'undefined') return;

  ensurePrintStyle(paperSize);

  // 1. Yazdırılacak sayfaları topla
  const roots = Array.from(document.querySelectorAll(elementSelector)) as HTMLElement[];
  const pages: HTMLElement[] = [];
  const selectorText = PAGE_SELECTORS.join(',');

  roots.forEach((root) => {
    if (root.matches(selectorText)) {
      pages.push(root);
    } else {
      const nested = Array.from(root.querySelectorAll(selectorText)) as HTMLElement[];
      if (nested.length > 0) pages.push(...nested);
      else pages.push(root);
    }
  });

  if (pages.length === 0) {
    try {
      window.print();
    } catch (err) {
      console.error('Print fallback failed:', err);
    }
    return;
  }

  // 2. Overlay Hazırlığı
  let overlay = document.getElementById('print-overlay');
  if (overlay) {
    overlay.innerHTML = '';
  } else {
    overlay = document.createElement('div');
    overlay.id = 'print-overlay';
    document.body.appendChild(overlay);
  }

  // 3. Stilleri Uygula
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

  const isLandscape = pages[0]?.classList.contains('landscape');

  // Print Lock CSS enjeksiyonu
  injectPrintLockCSS(paperSize, isLandscape);

  // 4. İçerikleri Klonla ve Ölçeklendir (Scale-to-Fit Magic)
  pages.forEach((original) => {
    const origWidth = original.offsetWidth || 1120;
    const clone = original.cloneNode(true) as HTMLElement;

    clone.style.width = `${origWidth}px`;
    clone.style.minWidth = `${origWidth}px`;
    clone.style.margin = '0';
    clone.style.position = 'relative';

    // Scale to fit A4
    const scaleRatio = Math.min(1, PRINTABLE_A4_WIDTH_PX / origWidth);
    if (scaleRatio < 1) {
      (clone.style as unknown as { zoom: string | number }).zoom = scaleRatio;
    }

    // Input, Select ve Canvas Transferi
    const origCanvases = original.querySelectorAll('canvas');
    const cloneCanvases = clone.querySelectorAll('canvas');
    origCanvases.forEach((canvas, i) => {
      const dest = cloneCanvases[i] as HTMLCanvasElement;
      if (dest) {
        const ctx = dest.getContext('2d');
        if (ctx) ctx.drawImage(canvas, 0, 0);
      }
    });

    const origInputs = original.querySelectorAll('input, textarea, select');
    const cloneInputs = clone.querySelectorAll('input, textarea, select');
    origInputs.forEach((input: Element, i) => {
      const dest = cloneInputs[i] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const src = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (dest && (src.type === 'checkbox' || src.type === 'radio')) {
        (dest as HTMLInputElement).checked = (src as HTMLInputElement).checked;
      } else if (dest) {
        dest.value = src.value;
      }
    });

    // Wrapper İçine Al
    const wrapper = document.createElement('div');
    wrapper.className = 'oogmatik-print-wrapper';
    wrapper.appendChild(clone);

    wrapperContainer.appendChild(wrapper);
  });

  // 5. Native Render Stabilizasyonu
  document.body.classList.add('printing-mode');

  const prevTheme = document.documentElement.className;
  document.documentElement.className = 'theme-light';

  setTimeout(() => {
    try {
      window.print();
    } catch (err) {
      console.error('Print trigger failed:', err);
    } finally {
      setTimeout(() => {
        document.documentElement.className = prevTheme;
        document.body.classList.remove('printing-mode');
        if (overlay) overlay.style.display = 'none';
      }, 1000);
    }
  }, 500);
};

// ─── html2canvas Tabanlı Yazdırma (captureAndPrint) ─────────────────────────

/**
 * html2canvas tabanlı capture + print (Premium Engine v7.0)
 * Her sayfayı ekrandaki görünümüyle birebir yakalar ve overlay üzerinden basar.
 */
export const captureAndPrint = async (
  rootSelector: string,
  title: string = 'Oogmatik_Etkinlik',
  action: 'print' | 'download' = 'print',
  paperSize: PaperSize = 'A4'
): Promise<void> => {
  await forceRenderAllPages();
  try {
    const roots = Array.from(document.querySelectorAll(rootSelector)) as HTMLElement[];
    if (roots.length === 0) {
      console.error(`[OverlayPrinter] HATA: "${rootSelector}" bulunamadı.`);
      alert('Yazdırılacak içerik bulunamadı. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return;
    }

    if (!hasRenderableContent(roots)) {
      console.error(`[OverlayPrinter] HATA: "${rootSelector}" bulundu ama içerik boş.`);
      alert('Yazdırılacak içerik henüz hazır değil. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return;
    }

    const pages = collectPages(rootSelector);

    await preloadFontsForCapture();

    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default || html2canvasModule;
    const dataUrls: string[] = [];

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
        foreignObjectRendering: false,
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
        ignoreElements: (el) => {
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

    if (action === 'download') {
      dataUrls.forEach((url, i) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9ğüşıöçA-Z]/g, '_')}${dataUrls.length > 1 ? `_sayfa_${i + 1}` : ''}.png`;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    document.body.offsetHeight;

    const prevTheme = document.documentElement.className;
    document.documentElement.className = 'theme-light';

    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.error('Capture print failed', e);
      } finally {
        document.documentElement.className = prevTheme;
        document.body.classList.remove('printing-mode');
        if (overlay) overlay.innerHTML = '';
      }
    }, 120);

    // Mobil fallback
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      setTimeout(async () => {
        if (document.body.classList.contains('printing-mode')) {
          document.documentElement.className = prevTheme;
          document.body.classList.remove('printing-mode');
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
          } catch (fallbackErr) {
            console.error('Mobile print fallback failed', fallbackErr);
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
 * Browser afterprint event'i ve focus fallback'i ile cleanup yapır.
 */
export const registerCleanupListeners = (): void => {
  if (typeof window === 'undefined') return;

  const cleanup = () => {
    document.body.classList.remove('printing-mode');
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
