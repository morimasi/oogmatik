export type PdfQuality = 'standard' | 'high' | 'print';

/**
 * html2canvas yakalamadan önce tüm web fontlarını (özellikle Lexend) yükler.
 * Font yüklenmeden yakalama yapılırsa metin bozuk, boşluklar kaybolmuş çıkar.
 */
const preloadFontsForCapture = async (): Promise<void> => {
  if (typeof document === 'undefined') return;
  try {
    // 1. Tarayıcıdaki tüm @font-face tanımlarının yüklenmesini bekle
    await document.fonts.ready;

    // 2. Kullanılan font ailelerini ve ağırlıklarını açıkça yükle
    const fontFamilies = ['Lexend', 'Inter', 'Comic Neue', 'Lora'];
    const weights = ['400', '600', '700', '800'];
    const testText = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZabcçdefgğhıijklmnoöprsştuüvyz0123456789';
    const loadPromises: Promise<unknown>[] = [];
    for (const family of fontFamilies) {
      for (const weight of weights) {
        loadPromises.push(
          document.fonts.load(`${weight} 16px "${family}"`, testText).catch(() => null)
        );
      }
    }
    await Promise.allSettled(loadPromises);

    // 3. Tarayıcıya iki kare boyama süresi ver (font metrics stabileşsin)
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setTimeout(resolve, 150); // Ekstra bekleme süresi, html2canvas capture öncesi Lexend tarzı fontlar için kritik
      }))
    });
  } catch (e) {
    // Font yüklenemese bile yakalamaya devam et
    console.warn('[printService] Font ön-yükleme uyarısı:', e);
  }
};

/**
 * html2canvas onclone callback — klon dokümana stil sayfalarını ve fontları kopyalar.
 * Olmadığında Google Fonts klon dokümana aktarılmaz → metin bozuk çıkar.
 */
const onCloneForCapture = (clonedDoc: Document): void => {
  try {
    // Tüm <link rel="stylesheet"> etiketlerini kopyala (Google Fonts dahil)
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      clonedDoc.head.appendChild(link.cloneNode(true));
    });
    // Tüm <style> etiketlerini kopyala (Tailwind inline, custom CSS dahil)
    document.querySelectorAll('style').forEach((style) => {
      clonedDoc.head.appendChild(style.cloneNode(true));
    });
    // Yazdırma için renk doğruluğu garanti altına al
    const extra = clonedDoc.createElement('style');
    extra.textContent =
      '* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; text-rendering: optimizeSpeed !important; }' +
      ' body { background: #ffffff !important; }';
    clonedDoc.head.appendChild(extra);
  } catch (e) {
    console.warn('[printService] onClone uyarısı:', e);
  }
};

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
  /** PDF kalitesi */
  quality?: PdfQuality;
  /** İlerleme callback'i (0-100 arasında yüzde) */
  onProgress?: (percent: number, message: string) => void;
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

const waitForOverlayImages = async (
  overlay: HTMLElement,
  timeoutMs: number = 5000
): Promise<void> => {
  const images = Array.from(overlay.querySelectorAll('img')) as HTMLImageElement[];
  if (images.length === 0) return;

  const loadPromise = Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            // Görsel yüklenmiş; decode() ile piksel verisinin hazır olmasını bekle
            img.decode().then(resolve).catch(resolve);
            return;
          }

          img.addEventListener(
            'load',
            () => {
              img.decode().then(resolve).catch(resolve);
            },
            { once: true }
          );
          img.addEventListener('error', () => resolve(), { once: true });
        })
    )
  ).then(() => undefined);

  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutMs);
  });

  await Promise.race([loadPromise, timeoutPromise]);
};

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
    overlay.appendChild(page);
  });

  const lastPage = overlay.lastElementChild as HTMLElement | null;
  if (lastPage) {
    lastPage.style.pageBreakAfter = 'auto';
    lastPage.style.breakAfter = 'auto';
  }

  return overlay;
};

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
inset: auto !important;
        width: 100% !important;
        min-height: 100vh !important;
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

export const printService = {
  /**
   * Premium Print Engine v6.0 (Overlay Mode)
   * Creates a dedicated overlay for printing to ensure 100% isolation from UI.
   * Supports multi-page content, canvas cloning, and input preservation.
   */
  print: (elementSelector: string = '.worksheet-page', paperSize: PaperSize = 'A4') => {
    ensurePrintStyle(paperSize);

    // 1. Find the target content
    const originalContents = Array.from(document.querySelectorAll(elementSelector));
    if (originalContents.length === 0) {
      console.error(`[printService] HATA: "${elementSelector}" bulunamadı. Çalışma kâğıdı render edilmemiş olabilir.`);
      alert('Yazdırılacak içerik bulunamadı. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return;
    }

    // 2. Validate that elements have actual content
    const hasContent = originalContents.some((el) => {
      const element = el as HTMLElement;
      return element.textContent && element.textContent.trim().length > 10;
    });

    if (!hasContent) {
      console.error(`[printService] HATA: "${elementSelector}" bulundu ama içerik boş. Render bekleniyor olabilir.`);
      alert('Yazdırılacak içerik henüz hazır değil. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
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

    const marginsForThisSize = PAPER_MARGINS[paperSize];
    const top = marginsForThisSize.top;
    const bottom = marginsForThisSize.bottom;
    const dims = PAPER_DIMENSIONS[paperSize];

    originalContents.forEach((originalContent) => {
      // 3. Clone the content deeply
      const clonedContent = originalContent.cloneNode(true) as HTMLElement;

      // Reset padding to ensure header/footer margins are respected
      clonedContent.style.paddingTop = '0px';
      clonedContent.style.paddingBottom = '0px';

      const isLandscape = clonedContent.classList.contains('landscape');
      const effectiveDims = isLandscape
        ? { width: dims.height, height: dims.width }
        : dims;

      clonedContent.style.width = effectiveDims.width;
      clonedContent.style.minHeight = effectiveDims.height;
      clonedContent.style.maxWidth = effectiveDims.width;
      clonedContent.style.margin = '0 auto';
      clonedContent.style.boxSizing = 'border-box';
      clonedContent.style.pageBreakAfter = 'always';

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
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.maxWidth = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.margin = '0';
      table.style.padding = '0';
      table.style.border = 'none';
      table.style.pageBreakInside = 'avoid';
      table.style.pageBreakAfter = 'always';

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
      tdFoot.innerHTML = `<div style="height: ${bottom}; overflow: hidden; background: transparent;">&nbsp;</div>`;
      tdFoot.style.border = 'none';
      tdFoot.style.padding = '0';
      trFoot.appendChild(tdFoot);
      tfoot.appendChild(trFoot);
      table.appendChild(tfoot);

      if (overlay) overlay.appendChild(table);
    });

    // 5. Add printing class to body to trigger CSS overrides
    document.body.classList.add('printing-mode');

    // 6. Force layout recalculation
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    document.body.offsetHeight;

    // 7. Call print — 350ms bekle: tablet/Safari'de görseller render edilsin
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.error('Print failed', e);
        document.body.classList.remove('printing-mode');
        if (overlay) overlay.innerHTML = ''; // Cleanup immediately on error
      }
    }, 350);
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
      console.error(`[printService] HATA: captureAndPrint - "${rootSelector}" bulunamadı.`);
      alert('Yazdırılacak içerik bulunamadı. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return;
    }

    // Validate that roots have content
    const hasContent = roots.some((el) => {
      return el.textContent && el.textContent.trim().length > 10;
    });

    if (!hasContent) {
      console.error(`[printService] HATA: captureAndPrint - "${rootSelector}" bulundu ama içerik boş.`);
      alert('Yazdırılacak içerik henüz hazır değil. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
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

    // Fontların yüklenmesini bekle (aksi hâlde metin bozuk çıkar)
    await preloadFontsForCapture();

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
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        onclone: (_clonedDoc: Document) => onCloneForCapture(_clonedDoc),
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

    // Tablet/iOS/Safari popup kısıtlarında beyaz sayfayı önlemek için
    // yazdırmayı aynı sekmede #print-overlay üzerinden çalıştır.
    const overlay = buildCapturedPrintOverlay(dataUrls, paperSize, title);
    if (!overlay) return;

    // Özellikle tablet/Safari'de data URL görseller decode edilmeden print() çağrılırsa
    // boş beyaz sayfa çıkabiliyor; görsellerin yüklenmesini bekle.
    await waitForOverlayImages(overlay);

    // Tarayıcıya en az bir frame paint süresi ver.
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    document.body.classList.add('printing-mode');
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    document.body.offsetHeight;

    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.error('Capture print failed', e);
        document.body.classList.remove('printing-mode');
        overlay.innerHTML = '';
      }
    }, 120);

    // Mobil cihazlarda print dialog gelmezse fallback: PDF olarak yeni sekmede aç
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      setTimeout(async () => {
        // Eğer 3 saniye sonra hâlâ printing-mode aktifse, print dialog açılmamış demektir
        if (document.body.classList.contains('printing-mode')) {
          document.body.classList.remove('printing-mode');
          if (overlay) { overlay.innerHTML = ''; overlay.style.display = 'none'; }
          // Fallback: PDF üret ve yeni sekmede aç
          try {
            const blob = await printService.generateRealPdf(rootSelector, title, { paperSize });
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
      const action = options?.action || 'print';
      const useCapture = options?.useCapture !== false;

      if (action === 'download') {
        // GERÇEK PDF ÜRETİMİ — jsPDF ile tek dosya
        await printService.generateRealPdf(elementSelector, title, {
          paperSize,
          quality: options?.quality || 'high',
          onProgress: options?.onProgress,
        });
      } else if (useCapture) {
        await printService.captureAndPrint(elementSelector, title, 'print', paperSize);
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

  /**
   * GERÇEK PDF MOTORU v1.0
   * html2canvas ile her sayfayı yakalar → jsPDF ile tek PDF dosyasına birleştirir.
   * Tüm platformlarda çalışır: PC, Tablet, Telefon.
   */
  generateRealPdf: async (
    rootSelector: string,
    title: string = 'Oogmatik_Etkinlik',
    options?: {
      paperSize?: PaperSize;
      quality?: PdfQuality;
      onProgress?: (percent: number, message: string) => void;
    }
  ): Promise<Blob | null> => {
    const paperSize = options?.paperSize || 'A4';
    const quality = options?.quality || 'high';
    const onProgress = options?.onProgress;

    const SCALE_MAP: Record<PdfQuality, number> = {
      standard: 1.5,
      high: 2,
      print: 3,
    };
    const captureScale = SCALE_MAP[quality];

    // Kağıt boyutları (mm)
    const dims = PAPER_DIMENSIONS[paperSize];
    const pageW = parseFloat(dims.width);
    const pageH = parseFloat(dims.height);

    onProgress?.(5, 'Sayfalar taranıyor...');

    // Sayfaları bul
    const PAGE_SELECTORS = [
      '.worksheet-page',
      '.universal-mode-canvas',
      '.math-canvas-page',
      '.reading-canvas-page',
      '.a4-page',
      '.print-page',
    ];
    const roots = Array.from(document.querySelectorAll(rootSelector)) as HTMLElement[];
    const pages: HTMLElement[] = [];

    if (roots.length === 0) {
      console.error(`[printService] HATA: generateRealPdf - "${rootSelector}" bulunamadı.`);
      onProgress?.(0, 'İçerik bulunamadı');
      alert('Yazdırılacak içerik bulunamadı. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return null;
    }

    // Validate content exists
    const hasContent = roots.some((el) => {
      return el.textContent && el.textContent.trim().length > 10;
    });

    if (!hasContent) {
      console.error(`[printService] HATA: generateRealPdf - "${rootSelector}" bulundu ama içerik boş.`);
      onProgress?.(0, 'İçerik boş');
      alert('Yazdırılacak içerik henüz hazır değil. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return null;
    }

    roots.forEach((root) => {
      if (root.matches(PAGE_SELECTORS.join(','))) {
        pages.push(root);
        return;
      }
      const nested = Array.from(root.querySelectorAll(PAGE_SELECTORS.join(','))) as HTMLElement[];
      if (nested.length > 0) {
        pages.push(...nested);
      } else {
        pages.push(root);
      }
    });

    if (pages.length === 0) {
      console.warn('generateRealPdf: Sayfa bulunamadı');
      return null;
    }

    onProgress?.(10, `${pages.length} sayfa bulundu, hazırlanıyor...`);

    // Fontların yüklenmesini bekle
    await preloadFontsForCapture();

    // Dinamik import — kod bölme
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    // PDF oluştur
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageW, pageH],
      compress: true,
    });

    // UI öğelerini geçici olarak gizle
    const uiElements = document.querySelectorAll(
      '.edit-handle, .page-navigator, .no-print, .overlay-ui, .resize-handle, .action-button'
    );
    uiElements.forEach((el: any) => {
      el.dataset.origDisplay = el.style.display;
      el.style.display = 'none';
    });

    try {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const progressPercent = 10 + Math.round((i / pages.length) * 80);
        onProgress?.(progressPercent, `Sayfa ${i + 1}/${pages.length} işleniyor...`);

        // Arka plan garantisi
        const origBg = page.style.backgroundColor;
        page.style.backgroundColor = '#ffffff';

        const canvas = await html2canvas(page, {
          scale: captureScale,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight,
          onclone: (_clonedDoc: Document) => onCloneForCapture(_clonedDoc),
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

        page.style.backgroundColor = origBg;

        // Canvas → JPEG data URL (PNG'den daha küçük PDF boyutu)
        const imgData = canvas.toDataURL('image/jpeg', 0.92);

        // İlk sayfa zaten oluşturuldu, sonrakiler için yeni sayfa ekle
        if (i > 0) {
          pdf.addPage([pageW, pageH], 'portrait');
        }

        // Görüntüyü tam sayfa olarak ekle
        pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
      }
    } finally {
      // UI öğelerini geri getir
      uiElements.forEach((el: any) => {
        el.style.display = el.dataset.origDisplay || '';
        delete el.dataset.origDisplay;
      });
    }

    onProgress?.(95, 'PDF dosyası oluşturuluyor...');

    // PDF blob oluştur
    const pdfBlob = pdf.output('blob');
    const safeName = (title || 'Oogmatik').replace(/[^a-z0-9ğüşıöçA-ZĞÜŞİÖÇ\s]/g, '_').trim();

    // İndirme — Platform uyumlu
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS || isSafari) {
      // iOS/Safari: Blob URL'yi yeni sekmede aç (download attribute çalışmıyor)
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } else {
      // Android/Desktop: download attribute ile indir
      const blobUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${safeName}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    }

    onProgress?.(100, 'PDF başarıyla indirildi!');
    return pdfBlob;
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
