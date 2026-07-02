/**
 * bdmind Print Engine — CSS Enjeksiyon Modülü
 * @page kuralları, Print Lock CSS ve yazdırma moduna geçiş yönetimi.
 * Premium Compact A4 Formatlama ile güncellendi.
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
    @page { size: ${pageSize}; margin: 8mm !important; }
    @media print {
      html, body {
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        font-family: 'Lexend', 'Inter', 'Times New Roman', serif !important;
        line-height: 1.4 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
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
      body.printing-mode #print-overlay .universal-mode-canvas,
      body.printing-mode #print-overlay .a4-page {
        width: 100% !important;
        max-width: 100% !important;
        min-height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        box-shadow: none !important;
        break-inside: auto !important;
        page-break-inside: auto !important;
        page-break-after: always !important;
        break-after: page !important;
      }

      body.printing-mode #print-overlay .print-exact {
        width: 100% !important;
        max-width: 100% !important;
        min-height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        box-shadow: none !important;
        break-inside: auto !important;
        page-break-inside: auto !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }

      body.printing-mode #print-overlay .print-page {
        overflow: visible !important;
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

      /* === Table & Grid Handling - Premium Rules === */
      table {
        border-collapse: collapse !important;
        width: 100% !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      thead { display: table-header-group !important; }
      tr { page-break-inside: avoid !important; break-inside: avoid !important; }
      th, td {
        border: 1px solid #999 !important;
        padding: 3mm !important;
        font-size: 9pt !important;
      }

      /* Grid Layout Handling */
      .grid, [class*='grid-cols'] {
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      .grid-item, [class*='grid-cols'] > * {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      /* Typography Optimization */
      h1, h2, h3, h4 {
        font-family: 'Lexend', 'Inter', sans-serif !important;
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
        margin: 0.2em 0 0.3em !important;
      }
      h1 { font-size: 18pt !important; }
      h2 { font-size: 14pt !important; }
      h3 { font-size: 12pt !important; }
      h4 { font-size: 11pt !important; }
      p, span, li { font-size: 10pt !important; line-height: 1.3 !important; }
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
 * Premium Compact A4 ayarlarıyla güncellendi.
 */
export const injectPrintLockCSS = (paperSize: PaperSize, isLandscape: boolean): HTMLStyleElement => {
  const CORE_STYLE_ID = 'bdmind-print-core-styles';

  let styleEl = document.getElementById(CORE_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = CORE_STYLE_ID;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    @page { size: ${paperSize} ${isLandscape ? 'landscape' : 'portrait'}; margin: 8mm !important; }
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
      .bdmind-print-wrapper {
        width: 100% !important;
        position: relative;
        display: block;
        background: white;
        border: none !important;
        box-shadow: none !important;
      }
      /* 
         Kocaman beyaz boşluklara (Giant Blank Spaces) kesin çözüm:
         TÜM 'break' kilitlerini genel olarak kırıyoruz ancak 
         tablo ve grid konteynerlarını (kullanıcı isteğiyle) koruyoruz.
      */
      .bdmind-print-wrapper, 
      .bdmind-print-wrapper *:not(.block-table-container):not(.block-grid-container):not(table):not(.grid) {
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

      @page { 
        margin: 8mm !important; 
        size: auto; 
      }
      
      html, body {
        margin: 0px !important;
        padding: 0px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        text-rendering: optimizeLegibility !important;
        line-height: 1.4 !important; /* Premium compact line-height */
        font-family: 'Lexend', 'Inter', 'Times New Roman', serif !important;
      }

      /* Kâğıt kenarlarında güvenlik boşluğu (Tarayıcı marjının yerini alan padding) */
      .print-page, .worksheet-page, .a4-page {
        margin: 0 !important;
        box-sizing: border-box !important;
        box-shadow: none !important;
        border: none !important;
        page-break-after: always !important;
        break-after: page !important;
        background: white !important;
        display: block !important;
        position: relative !important;
        overflow: visible !important;
      }
      .print-exact {
        margin: 0 !important;
        box-sizing: border-box !important;
        box-shadow: none !important;
        border: none !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
        background: white !important;
        display: block !important;
        position: relative !important;
        overflow: visible !important;
      }

      /* Sayfa başı zorunlu boşluk kalkanı (Minimal 0.5cm ayarı için azaltıldı) */
      .print-page::before, .worksheet-page::before, .a4-page::before, .print-exact::before {
        content: "" !important;
        display: block !important;
        height: 1mm !important;
        width: 100% !important;
      }

      .print-page img {
        margin-top: 2mm !important; /* Görseller için ekstra iç güvenlik marjı */
      }

      .bdmind-print-wrapper {
        display: block !important;
        background: white !important;
        margin: 0 !important;
        padding-top: 0 !important;
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
      .bdmind-print-wrapper, 
      .bdmind-print-wrapper * {
        visibility: visible !important;
        opacity: 1 !important;
      }


      /* Performans: Baskıda ağır animasyonları devre dışı bırak */
      .backdrop-blur-xl, .backdrop-blur-md {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        background: white !important;
      }

      /* === Premium Compact Typography === */
      h1, h2, h3, h4 {
        font-family: 'Lexend', 'Inter', sans-serif !important;
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
        margin: 0.2em 0 0.3em !important;
      }
      h1 { font-size: 18pt !important; }
      h2 { font-size: 14pt !important; }
      h3 { font-size: 12pt !important; }
      h4 { font-size: 11pt !important; }
      p, span, li {
        font-size: 10pt !important;
        line-height: 1.3 !important;
        margin: 0.3em 0 !important;
      }

      /* === Table & Grid Special Rules === */
      table {
        border-collapse: collapse !important;
        width: 100% !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      thead { display: table-header-group !important; }
      tr { page-break-inside: avoid !important; break-inside: avoid !important; }
      th, td {
        border: 1px solid #999 !important;
        padding: 3mm !important;
        font-size: 9pt !important;
      }
      .grid, [class*='grid-cols'] {
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      .grid-item, [class*='grid-cols'] > * {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      /* === Activity-Specific Styling === */
      .word-search-grid {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        font-family: 'Lexend', monospace !important;
        font-size: 11pt !important;
        letter-spacing: 0.1em !important;
      }
      .drawing-grid, .symmetry-grid {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .visual-activity-container {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .pedagogical-note {
        background-color: #f9f9f9 !important;
        border: 1px dashed #ccc !important;
        padding: 3mm !important;
        margin-top: 4mm !important;
        font-size: 9pt !important;
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
    window as { __bdmind_force_render_all_pages__?: boolean }
  ).__bdmind_force_render_all_pages__ = true;
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
  delete (window as { __bdmind_force_render_all_pages__?: boolean })
    .__bdmind_force_render_all_pages__;
};
