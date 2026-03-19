export interface PrintOptions {
  action?: 'print' | 'download';
  selectedPages?: number[];
  grayscale?: boolean;
  worksheetData?: any[];
  compact?: boolean;
  columnsPerPage?: 1 | 2;
  fontSize?: 10 | 11 | 12;
  paperSize?: PaperSize;
  /** html2canvas capture modu: true = her sayfayı canvas olarak yakala (varsayılan: true) */
  useCapture?: boolean;
}

export type PaperSize = 'A4' | 'Letter' | 'Legal';
export type PaperMargins = { top: string; bottom: string; left?: string; right?: string };
const PAPER_MARGINS: Record<PaperSize, PaperMargins> = {
  A4: { top: '15mm', bottom: '10mm' },
  Letter: { top: '12mm', bottom: '12mm' },
  Legal: { top: '15mm', bottom: '15mm' },
};

const PAPER_DIMENSIONS: Record<PaperSize, { width: string; height: string }> = {
  A4: { width: '210mm', height: '297mm' },
  Letter: { width: '216mm', height: '279mm' },
  Legal: { width: '216mm', height: '356mm' },
};

const PRINT_STYLE_ID = 'oogmatik-print-style';

const ensurePrintStyle = (paperSize: PaperSize) => {
  if (typeof document === 'undefined') return;

  const pageSize = paperSize === 'A4' ? 'A4' : paperSize;
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
        width: 100% !important;
        z-index: 2147483647 !important;
        overflow: visible !important;
        background: #fff !important;
      }

      body.printing-mode #print-overlay table,
      body.printing-mode #print-overlay tbody,
      body.printing-mode #print-overlay tr,
      body.printing-mode #print-overlay td {
        width: 100% !important;
        border: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
      }

      body.printing-mode #print-overlay .worksheet-page,
      body.printing-mode #print-overlay .print-page,
      body.printing-mode #print-overlay .universal-mode-canvas {
        width: ${dims.width} !important;
        min-height: ${dims.height} !important;
        max-width: ${dims.width} !important;
        margin: 0 auto !important;
        box-shadow: none !important;
        break-inside: avoid-page !important;
        page-break-inside: avoid !important;
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

export const printService = {
  /**
   * Premium Print Engine v6.0 (Overlay Mode)
   * Creates a dedicated overlay for printing to ensure 100% isolation from UI.
   * Supports multi-page content, canvas cloning, and input preservation.
   */
  print: (elementSelector: string = '.worksheet-page', paperSize: PaperSize = 'A4') => {
    ensurePrintStyle(paperSize);

    // 1. Find the target content
    const originalContent = document.querySelector(elementSelector);
    if (!originalContent) {
      console.warn(`Print target "${elementSelector}" not found, falling back to window.print()`);
      window.print();
      return;
    }

    // 2. Create or clear the print overlay
    if (typeof window !== 'undefined') (window as any).__oogmatik_print_paper_size__ = paperSize;
    let overlay = document.getElementById('print-overlay');
    if (overlay) {
      overlay.innerHTML = '';
      overlay.style.display = 'block';
    } else {
      overlay = document.createElement('div');
      overlay.id = 'print-overlay';
      document.body.appendChild(overlay);
    }

    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'white';
    overlay.style.zIndex = '2147483647';
    overlay.style.overflow = 'auto';

    // 3. Clone the content deeply
    const clonedContent = originalContent.cloneNode(true) as HTMLElement;

    // Use dynamic margins per paper size
    const marginsForThisSize = PAPER_MARGINS[paperSize];
    const top = marginsForThisSize.top;
    const bottom = marginsForThisSize.bottom;

    // Reset padding to ensure header/footer margins are respected
    clonedContent.style.paddingTop = '0px';
    clonedContent.style.paddingBottom = '0px';
    const dims = PAPER_DIMENSIONS[paperSize];
    const isLandscape = clonedContent.classList.contains('landscape');
    const effectiveDims = isLandscape
      ? { width: dims.height, height: dims.width }
      : dims;

    clonedContent.style.width = effectiveDims.width;
    clonedContent.style.minHeight = effectiveDims.height;
    clonedContent.style.maxWidth = effectiveDims.width;
    clonedContent.style.margin = '0 auto';
    clonedContent.style.boxSizing = 'border-box';

    // 3.1. Preserve Canvas Content (cloning doesn't copy canvas state)
    const originalCanvases = originalContent.querySelectorAll('canvas');
    const clonedCanvases = clonedContent.querySelectorAll('canvas');
    originalCanvases.forEach((orig, i) => {
      const dest = clonedCanvases[i];
      if (dest) {
        const ctx = dest.getContext('2d');
        if (ctx) {
          ctx.drawImage(orig, 0, 0);
        } else {
          // Fallback: Convert to image if context is not available (e.g. webgl)
          try {
            const dataUrl = orig.toDataURL();
            const img = document.createElement('img');
            img.src = dataUrl;
            img.style.width = '100%';
            img.style.height = 'auto';
            dest.parentNode?.replaceChild(img, dest);
          } catch (e) {
            console.warn('Canvas clone failed', e);
          }
        }
      }
    });

    // 3.2. Preserve Form Inputs (textarea, select, input)
    const originalInputs = originalContent.querySelectorAll('input, textarea, select');
    const clonedInputs = clonedContent.querySelectorAll('input, textarea, select');
    originalInputs.forEach((orig: any, i) => {
      const dest: any = clonedInputs[i];
      if (dest) {
        if (orig.type === 'checkbox' || orig.type === 'radio') {
          dest.checked = orig.checked;
        } else {
          dest.value = orig.value;
        }
      }
    });

    // 4. Wrap clone in Table Structure for Guaranteed Margins (The "Table Header Hack")
    // This is the ONLY 100% reliable way to force a top margin on every page
    // when a continuous element (like a CSS grid) breaks across multiple pages in Chrome,
    // especially if the user selects "Margin: None" in the print dialog.
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.maxWidth = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.margin = '0';
    table.style.padding = '0';
    table.style.border = 'none';

    // Header (Top Margin Spacer)
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const tdHead = document.createElement('td');
    tdHead.innerHTML = `<div style="height: ${top}; overflow: hidden; background: transparent;">&nbsp;</div>`;
    tdHead.style.border = 'none';
    tdHead.style.padding = '0';
    trHead.appendChild(tdHead);
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Body (Content)
    const tbody = document.createElement('tbody');
    const trBody = document.createElement('tr');
    const tdBody = document.createElement('td');
    tdBody.style.border = 'none';
    tdBody.style.padding = '0';
    tdBody.style.width = '100%';
    tdBody.style.verticalAlign = 'top';
    tdBody.appendChild(clonedContent);
    trBody.appendChild(tdBody);
    tbody.appendChild(trBody);
    table.appendChild(tbody);

    // Footer (Bottom Margin Spacer)
    const tfoot = document.createElement('tfoot');
    const trFoot = document.createElement('tr');
    const tdFoot = document.createElement('td');
    // Use dynamic padding from the worksheet
    tdFoot.innerHTML = `<div style="height: ${bottom}; overflow: hidden; background: transparent;">&nbsp;</div>`;
    tdFoot.style.border = 'none';
    tdFoot.style.padding = '0';
    trFoot.appendChild(tdFoot);
    tfoot.appendChild(trFoot);
    table.appendChild(tfoot);

    overlay.appendChild(table);

    // 5. Add printing class to body to trigger CSS overrides
    document.body.classList.add('printing-mode');

    // 6. Force layout recalculation
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    document.body.offsetHeight;

    // 7. Call print
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.error('Print failed', e);
        document.body.classList.remove('printing-mode');
        if (overlay) overlay.innerHTML = ''; // Cleanup immediately on error
      }
    }, 100); // Small delay to allow DOM to settle
  },

  /**
   * html2canvas tabanlı capture + print (Premium Engine v7.0)
   *
   * Her .worksheet-page / .universal-mode-canvas / .math-canvas-page / .reading-canvas-page
   * öğesini ekrandaki görünümüyle birebir yakalar (html2canvas) ve
   * 210mm × 297mm boyutunda new window üzerinden basar ya da PNG blob indirir.
   *
   * Neden html2canvas? printService.print() DOM klonu yaklaşımında px tabanlı
   * absolute-positioned içerikler yüksek DPI yazdırıcılarda küçülüp boş görünüyor.
   * html2canvas doğrudan piksel bufferını alır → DPI bağımsız, ekrandakinin kopyası.
   */
  captureAndPrint: async (
    rootSelector: string,
    title: string = 'Oogmatik_Etkinlik',
    action: 'print' | 'download' = 'print',
    paperSize: PaperSize = 'A4'
  ): Promise<void> => {
    const roots = Array.from(document.querySelectorAll(rootSelector)) as HTMLElement[];
    if (roots.length === 0) {
      console.warn(`captureAndPrint: "${rootSelector}" bulunamadı, fallback print()`);
      printService.print(rootSelector, paperSize);
      return;
    }

    // Sayfaları bul — A4 canvas sınıflarından herhangi birini içeren öğeler
    const PAGE_SELECTORS = [
      '.worksheet-page',
      '.universal-mode-canvas',
      '.math-canvas-page',
      '.reading-canvas-page',
      '.a4-page',
      '.print-page',
    ];
    const pageSelectorText = PAGE_SELECTORS.join(',');
    const pages: HTMLElement[] = [];

    // Her eşleşen root içinde sayfaları topla.
    // Root doğrudan bir sayfaysa kendisini yakalar.
    roots.forEach((root) => {
      if (root.matches(pageSelectorText)) {
        pages.push(root);
        return;
      }

      const nestedPages = Array.from(root.querySelectorAll(pageSelectorText)) as HTMLElement[];
      if (nestedPages.length > 0) {
        pages.push(...nestedPages);
      } else {
        pages.push(root);
      }
    });

    // Dinamik import ile html2canvas yükle (kod bölme)
    const { default: html2canvas } = await import('html2canvas');

    const dataUrls: string[] = [];

    for (const page of pages) {
      const canvas = await html2canvas(page, {
        scale: 2, // 2x -> yüksek kaliteli yazdırma
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Tasarım modu seçim çerçevelerini bastır
        ignoreElements: (el) => {
          const htmlEl = el as HTMLElement;
          return (
            htmlEl.classList?.contains('resize-handle') ||
            htmlEl.classList?.contains('action-button') ||
            htmlEl.hasAttribute?.('data-design-only')
          );
        },
      });
      dataUrls.push(canvas.toDataURL('image/png', 1.0));
    }

    if (action === 'download') {
      // Tek sayfa: doğrudan indir; çok sayfa: her biri ayrı dosya
      dataUrls.forEach((url, i) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9ğüşıöçA-Z]/g, '_')}${dataUrls.length > 1 ? `_sayfa_${i + 1}` : ''}.png`;
        a.click();
      });
      return;
    }

    // Print: yeni pencerede A4 ebatlarında resimler + window.print()
    const dims = PAPER_DIMENSIONS[paperSize];
    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) {
      alert('Pop-up engellendi. Lütfen tarayıcı pop-up ayarlarını kontrol edin.');
      return;
    }

    const imgTags = dataUrls
      .map(
        (url) =>
          `<img src="${url}" style="width:${dims.width};height:${dims.height};display:block;page-break-after:always;max-width:100%;" />`
      )
      .join('');

    printWin.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>${title}</title>
<style>
  @page { size: ${paperSize}; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fff; }
  img:last-child { page-break-after: auto; }
</style>
</head><body>${imgTags}</body></html>`);
    printWin.document.close();

    printWin.onload = () => {
      setTimeout(() => {
        printWin.focus();
        printWin.print();
        printWin.onafterprint = () => printWin.close();
        // Fallback: bazı tarayıcılar onafterprint tetiklemiyor
        setTimeout(() => { try { printWin.close(); } catch (_) {} }, 3000);
      }, 300);
    };
  },

  /**
   * Backward compatibility — mevcut bileşenler bu metodu çağırıyor.
   * useCapture: false geçilirse eski overlay modunu kullanır (MathStudio gibi tam sayfa DOM render).
   */
  generatePdf: async (
    elementSelector: string,
    title: string = 'Oogmatik_Etkinlik',
    options?: PrintOptions
  ) => {
    try {
      const paperSize: PaperSize = options?.paperSize || 'A4';
      const useCapture = options?.useCapture !== false; // varsayılan: html2canvas mod

      if (useCapture) {
        await printService.captureAndPrint(
          elementSelector,
          title,
          options?.action || 'print',
          paperSize
        );
      } else {
        const originalTitle = document.title;
        document.title = (title || 'Oogmatik').replace(/[^a-z0-9ğüşıöç]/gi, '_');
        printService.print(elementSelector, paperSize);
        setTimeout(() => { document.title = originalTitle; }, 1000);
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      document.body.classList.remove('printing-mode');
    }
  },
};

// Listen for afterprint to cleanup
if (typeof window !== 'undefined') {
  const cleanup = () => {
    document.body.classList.remove('printing-mode');
    const overlay = document.getElementById('print-overlay');
    if (overlay) {
      overlay.innerHTML = ''; // Clear content to save memory
      // We keep the container to avoid recreating it
      overlay.style.display = 'none';
    }
  };

  window.addEventListener('afterprint', cleanup);

  // Fallback for browsers that block print or don't fire afterprint
  window.addEventListener('focus', () => {
    // Small delay to ensure afterprint has a chance to fire first
    setTimeout(cleanup, 1000);
  });
}
