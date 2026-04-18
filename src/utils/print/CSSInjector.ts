/**
 * Oogmatik Print Engine — CSS Enjeksiyon Modülü
 * @page kuralları, Print Lock CSS ve yazdırma moduna geçiş yönetimi.
 */

import type { PaperSize } from './types';
import { PAPER_DIMENSIONS, PRINT_STYLE_ID, RENDER_ALL_EVENT } from './constants';

/**
 * Yazdırma CSS kurallarını DOM'a enjekte eder.
 * @page boyutları kağıt tipine göre ayarlanır.
 * Print Lock kurallarıyla Tailwind responsive gridleri kağıtta da korunur.
 */
export const ensurePrintStyle = (paperSize: PaperSize): void => {
  if (typeof document === 'undefined') return;

  const pageSize =
    paperSize === 'A4' || paperSize === 'Extreme_Dikey'
      ? 'A4'
      : paperSize === 'Extreme_Yatay'
        ? 'A4 landscape'
        : paperSize;
  const dims = PAPER_DIMENSIONS[paperSize];
  const styleText = `
    @page { size: ${pageSize}; margin: 0; }
    @media print {
      html, body {
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
      }

      body.printing-mode > *:not(#print-overlay) {
        display: none !important;
      }

      #print-overlay {
        display: none;
      }

      body.printing-mode #print-overlay {
        display: block !important;
        position: static !important;
        inset: auto !important;
        width: 100% !important;
        min-height: 100vh !important;
        z-index: 2147483647 !important;
        overflow: visible !important;
        background: #fff !important;
      }

      body.printing-mode #print-overlay .print-pages-container {
        display: flex !important;
        flex-direction: column !important;
        gap: 0 !important;
      }

      body.printing-mode #print-overlay .worksheet-page,
      body.printing-mode #print-overlay .print-page,
      body.printing-mode #print-overlay .universal-mode-canvas {
        width: ${dims.width} !important;
        min-height: ${dims.height} !important;
        max-width: ${dims.width} !important;
        margin: 0 auto !important;
        box-shadow: none !important;
        break-inside: auto !important;
        page-break-inside: auto !important;
      }

      body.printing-mode #print-overlay .print-page {
        overflow: hidden !important;
      }

      body.printing-mode #print-overlay img {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        object-fit: contain !important;
        print-color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
      }
    }
  `;

  let styleEl = document.getElementById(PRINT_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = PRINT_STYLE_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = styleText;
};

/**
 * Overlay yazdırma için ek CSS güvenlik duvarı enjekte eder.
 * Tailwind responsive gridleri kağıtta kilitler (Print Lock).
 */
export const injectPrintLockCSS = (paperSize: PaperSize, isLandscape: boolean): HTMLStyleElement => {
  const CORE_STYLE_ID = 'oogmatik-print-core-styles';

  let styleEl = document.getElementById(CORE_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = CORE_STYLE_ID;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    @page { size: ${paperSize} ${isLandscape ? 'landscape' : 'portrait'}; margin: 12mm; }
    @media print {
      body > *:not(#print-overlay) {
        display: none !important;
      }
      #print-overlay {
        display: block !important;
        position: relative !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
        background: white !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .oogmatik-print-wrapper {
        width: 100% !important;
        position: relative;
        display: block;
        background: white;
        border: none !important;
        box-shadow: none !important;
      }
      /* 
         Kocaman beyaz boşluklara (Giant Blank Spaces) kesin çözüm:
         Eğer bir kapsayıcıda Tailwind 'break-inside-avoid' varsa ve
         içerik uzadıkça 1 sayfayı aşıyorsa, tarayıcı bunu bölemeyeceği için
         komple 2. sayfaya atar, 1. sayfa başlıkla bomboş kalır!
         Bunu önlemek için TÜM 'break' kilitlerini KIRIYORUZ.
      */
      .oogmatik-print-wrapper, 
      .oogmatik-print-wrapper *,
      #print-overlay .worksheet-page,
      #print-overlay .print-item-wrapper {
        page-break-inside: auto !important;
        break-inside: auto !important;
        page-break-before: auto !important;
        break-before: auto !important;
        overflow: visible !important;
        height: auto !important;
        min-height: 0 !important;
      }

      /* Hikaye ve uzun metin blokları için özel akış kuralı */
      .story-content, .long-text-block, .pedagogical-content {
        display: block !important;
        page-break-inside: auto !important;
      }
      
      /* A4 Daralma Çökmesine Karşı Ana Kalkan (Print Lock):
         A4 kâğıdınız fiziksel olarak 768px'den dar olduğu için
         Tailwind her şeyi telefon ekranına dönüştürüyordu.
         Aşağıdaki kod sayesinde md/lg görünümlerini kağıtta da zorunlu kılıyoruz. */
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
      .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
      .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
      .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
      .md\\:flex-row { flex-direction: row !important; }
      .lg\\:flex-row { flex-direction: row !important; }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        text-rendering: optimizeLegibility !important;
      }

      /* UI Temizliği (Floating UI, Buttons, Toasts) */
      .no-print, 
      [role="status"], 
      .fixed.no-print, 
      .sticky.no-print,
      button:not(.print-visible),
      #toast-container {
        display: none !important;
      }

      /* İçerik Görünürlük Garantisi */
      .oogmatik-print-wrapper, 
      .oogmatik-print-wrapper * {
        visibility: visible !important;
        opacity: 1 !important;
      }


      /* Performans: Baskıda ağır animasyonları devredışı bırak */
      .backdrop-blur-xl, .backdrop-blur-md {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        background: white !important;
      }
    }
  `;

  return styleEl;
};

/**
 * Tüm lazy-rendered sayfaların render edilmesini tetikler.
 * Virtualized listeler veya gizli sayfalar için gereklidir.
 */
export const forceRenderAllPages = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  (
    window as { __oogmatik_force_render_all_pages__?: boolean }
  ).__oogmatik_force_render_all_pages__ = true;
  window.dispatchEvent(new Event(RENDER_ALL_EVENT));
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTimeout(resolve, 60));
    });
  });
};

/**
 * forceRenderAllPages bayrağını temizler.
 */
export const clearRenderAllPagesFlag = (): void => {
  if (typeof window === 'undefined') return;
  delete (window as { __oogmatik_force_render_all_pages__?: boolean })
    .__oogmatik_force_render_all_pages__;
};
