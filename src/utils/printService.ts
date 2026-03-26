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
    // Premium Engine Modu: Klonlanan dökümanın body'sine marker ekle
    clonedDoc.body.classList.add('is-exporting');

    // Tüm <link rel="stylesheet"> etiketlerini kopyala (Google Fonts dahil)
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      clonedDoc.head.appendChild(link.cloneNode(true));
    });
    // Tüm <style> etiketlerini kopyala (Tailwind inline, custom CSS dahil)
    document.querySelectorAll('style').forEach((style) => {
      clonedDoc.head.appendChild(style.cloneNode(true));
    });

    // KRİTİK: @font-face kurallarını CSSStyleSheet'ten ayıklayıp klona enjekte et.
    // Olmadığında Lexend/Inter klon DOM'da bulunamaz → sistem fontu (Arial/Times) devreye
    // girer → harfler devasa veya hatalı basılır.
    try {
      const fontFaceRules: string[] = [];
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          Array.from(sheet.cssRules || []).forEach((rule) => {
            if (rule instanceof CSSFontFaceRule) {
              fontFaceRules.push(rule.cssText);
            }
          });
        } catch { /* cross-origin sheet — erişilemez, atla */ }
      });
      if (fontFaceRules.length > 0) {
        const fontStyle = clonedDoc.createElement('style');
        fontStyle.textContent = fontFaceRules.join('\n');
        clonedDoc.head.insertBefore(fontStyle, clonedDoc.head.firstChild);
      }
    } catch { /* font face extraction failed, devam et */ }

    // Yazdırma için renk doğruluğu ve HASSAS FONT RENDER
    const extra = clonedDoc.createElement('style');
    extra.textContent =
      '* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; ' +
      'text-rendering: optimizeLegibility !important; font-variant-ligatures: none !important; ' +
      'letter-spacing: 0px !important; word-spacing: normal !important; ' +
      '-webkit-text-size-adjust: 100% !important; text-size-adjust: 100% !important; ' +
      'box-sizing: border-box !important; }' +
      ' body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }';
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
const RENDER_ALL_EVENT = 'oogmatik:render-all-pages';

const forceRenderAllPages = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  (window as { __oogmatik_force_render_all_pages__?: boolean }).__oogmatik_force_render_all_pages__ = true;
  window.dispatchEvent(new Event(RENDER_ALL_EVENT));
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTimeout(resolve, 60));
    });
  });
};

const clearRenderAllPagesFlag = (): void => {
  if (typeof window === 'undefined') return;
  delete (window as { __oogmatik_force_render_all_pages__?: boolean }).__oogmatik_force_render_all_pages__;
};

// html2canvas'ın scale/zoom deformasyonlarını (huge fonts) önlemek için tarama anında parent stillerini soyar
const stripScalesAndTransforms = (element: HTMLElement) => {
  if (typeof document === 'undefined') return () => {};
  const originalStyles = new Map<HTMLElement, { zoom: string; transform: string }>();
  let current: HTMLElement | null = element.parentElement;
  while (current && current !== document.body) {
    if (current.style !== undefined) {
      originalStyles.set(current, { zoom: current.style.zoom, transform: current.style.transform });
      current.style.zoom = '1';
      current.style.transform = 'none';
    }
    current = current.parentElement;
  }
  // Layout recalculation force
  if (document.body) document.body.offsetHeight;
  return () => {
    for (const [el, styles] of originalStyles.entries()) {
      el.style.zoom = styles.zoom;
      el.style.transform = styles.transform;
    }
  };
};

/**
 * PIXEL LOCK ALGORİTMASI v1.0
 * Yakalamadan önce hedef elementin içindeki TÜM alt elemanların
 * tarayıcı tarafından hesaplanmış (computed) genişlik, yükseklik ve
 * font-size px değerlerini inline style olarak sabitler.
 * Bu sayede html2canvas, Tailwind Grid/Flex ve rem/% birimlerini
 * yanlış okuyarak font'ları şişiremez veya kutuları parçalayamaz.
 */
const pixelLockElement = (root: HTMLElement): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  const backups: Array<{ el: HTMLElement; w: string; h: string; fs: string; lh: string; ls: string }> = [];
  const allEls = [root, ...Array.from(root.querySelectorAll('*'))] as HTMLElement[];
  for (const el of allEls) {
    if (!el.style) continue;
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    backups.push({
      el,
      w: el.style.width,
      h: el.style.height,
      fs: el.style.fontSize,
      lh: el.style.lineHeight,
      ls: el.style.letterSpacing,
    });
    if (rect.width > 0) el.style.setProperty('width', `${rect.width}px`, 'important');
    if (rect.height > 0) el.style.setProperty('height', `${rect.height}px`, 'important');
    const fontSize = parseFloat(cs.fontSize);
    if (fontSize > 0) el.style.setProperty('font-size', `${fontSize}px`, 'important');
    el.style.setProperty('line-height', cs.lineHeight, 'important');
    el.style.setProperty('letter-spacing', '0px', 'important');
    el.style.setProperty('max-width', `${rect.width}px`, 'important');
    el.style.setProperty('max-height', `${rect.height}px`, 'important');
  }
  return () => {
    for (const b of backups) {
      b.el.style.width = b.w;
      b.el.style.height = b.h;
      b.el.style.fontSize = b.fs;
      b.el.style.lineHeight = b.lh;
      b.el.style.letterSpacing = b.ls;
      b.el.style.maxWidth = '';
      b.el.style.maxHeight = '';
    }
  };
};

const hasRenderableContent = (elements: HTMLElement[]): boolean =>
  elements.some((el) => {
    const textLength = el.textContent?.trim().length ?? 0;
    const hasMedia = el.querySelector('canvas, img, svg, video') !== null;
    const layoutHeight = el.getBoundingClientRect().height;
    return textLength > 10 || hasMedia || layoutHeight > 50;
  });

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
  /**
   * Premium Yazdırma Motoru v3.0 — (Native Overlay & Scale-to-Fit)
   * Iframe kullanmak yerine ana sayfa üzerinde görünmez bir katman (Overlay) açıp
   * native yazdırma komutunu kullanır. Beyaz sayfa sorununu %100 çözer.
   * Tailwind gridlerinin mobilde çökmesini önlemek için "Native Transform Scaling" kullanır.
   */
  print: async (elementSelector: string = '.worksheet-page', paperSize: PaperSize = 'A4') => {
    if (typeof window === 'undefined') return;

    // 1. Yazdırılacak sayfaları topla
    const roots = Array.from(document.querySelectorAll(elementSelector)) as HTMLElement[];
    const pages: HTMLElement[] = [];
    
    const PAGE_SELECTORS = ['.worksheet-page', '.print-page', '.universal-mode-canvas', '.a4-page', '.math-canvas-page'];
    const selectorText = PAGE_SELECTORS.join(',');

    roots.forEach(root => {
      if (root.matches(selectorText)) {
        pages.push(root);
      } else {
        const nested = Array.from(root.querySelectorAll(selectorText)) as HTMLElement[];
        if (nested.length > 0) pages.push(...nested);
        else pages.push(root);
      }
    });

    if (pages.length === 0) {
      alert('Yazdırılacak içerik bulunamadı. Lütfen sayfa yüklenene kadar bekleyin.');
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
    overlay.style.display = 'none'; // Sadece medya sorgusu ile print esnasında görünür

    const dims = PAPER_DIMENSIONS[paperSize];
    const isLandscape = pages[0]?.classList.contains('landscape');
    const a4WidthPx = 794; // 210mm in 96dpi
    
    // Yüksek öncelikli CSS Güvenlik Duvarı
    let styleEl = document.getElementById('oogmatik-print-core-styles') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'oogmatik-print-core-styles';
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
      /* Kâğıt kenar boşlukları (Margins) eklendi: Kenarlara sıfır temas olmaması için */
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
           Eğer bir kapsayıcıda Tailwind 'break-inside-avoid' varsa ve içerik uzadıkça 1 sayfayı aşıyorsa,
           tarayıcı bunu bölemeyeceği için komple 2. sayfaya atar, 1. sayfa başlıkla bomboş kalır!
           Bunu önlemek için TÜM 'break' kilitlerini KIRIYORUZ. Her şey su gibi akacak. 
        */
        .oogmatik-print-wrapper * {
          page-break-inside: auto !important;
          break-inside: auto !important;
          page-break-before: auto !important;
          break-before: auto !important;
          overflow: visible !important; /* Tailwind'deki overflow-hidden kilitlerini de açıyoruz ki kesilme olmasın */
        }
        
        /* A4 Daralma Çökmesine Karşı Ana Kalkan (Print Lock):
           A4 kâğıdınız fiziksel olarak 768px'den dar olduğu için Tailwind her şeyi telefon ekranına dönüştürüyordu.
           Aşağıdaki kod sayesinde, projedeki hiçbir dosyanın kodunu değiştirmeden "bilgisayar monitörü (md / lg)" 
           görünümlerini kâğıtta da zorunlu kılıyoruz. Bütün uygulamanın "iki sütun" sorunu çözüldü! */
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

      }
    `;

    // 4. İçerikleri Klonla ve Ölçeklendir (Scale-to-Fit Magic)
    pages.forEach((original) => {
      // Orijinal genişlik (Eğer sayfa masaüstünde genişse bunu korumalıyız ki Tailwind bozulmasın)
      const origWidth = original.offsetWidth || 1120;
      const clone = original.cloneNode(true) as HTMLElement;

      // Boyutlandırma kilidi: Orijinal px değerini koru ki Tailwind Grid komutları (lg:grid-cols vs.) çökmesin.
      clone.style.width = `${origWidth}px`;
      clone.style.minWidth = `${origWidth}px`;
      clone.style.margin = '0';
      // DİKKAT: 'position: absolute' İPTAL EDİLDİ! Absolute elementler sayfa akışını (flow) kör eder ve marginleri ezer.
      clone.style.position = 'relative'; 
      
      // Çarpılma onarımı (Scale to fit A4 Without Margin Touching)
      // @page { margin: 12mm } kullanıldığı için yazdırılabilir genişlik ~703px'e düşmüştür.
      const printableA4Width = 703; 
      const scaleRatio = Math.min(1, printableA4Width / origWidth);
      if (scaleRatio < 1) {
        // 'zoom' layout'u doğal küçültür ve tarayıcının sayfaları akıcı (flow) bölmesine izin verir.
        (clone.style as any).zoom = scaleRatio;
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
      origInputs.forEach((input: any, i) => {
        const dest: any = cloneInputs[i];
        if (dest && (input.type === 'checkbox' || input.type === 'radio')) {
          dest.checked = input.checked;
        } else if (dest) {
          dest.value = input.value;
        }
      });

      // Wrapper İçine Al
      const wrapper = document.createElement('div');
      wrapper.className = 'oogmatik-print-wrapper';
      wrapper.appendChild(clone);
      
      overlay!.appendChild(wrapper);
    });

    // 5. Native Render Stabilizasyonu
    document.body.classList.add('printing-mode');
    
    // Küçük bir gecikme verip Native Yazdırma penceresini ateşle
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error('Print trigger failed:', err);
      } finally {
        // Yazdırılma diyaloğu kapanınca veya iptal edilince temizlik yap
        setTimeout(() => {
          document.body.classList.remove('printing-mode');
          if (overlay) overlay.style.display = 'none';
        }, 1000);
      }
    }, 500);
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
    await forceRenderAllPages();
    try {
      const roots = Array.from(document.querySelectorAll(rootSelector)) as HTMLElement[];
      if (roots.length === 0) {
        console.error(`[printService] HATA: captureAndPrint - "${rootSelector}" bulunamadı.`);
        alert('Yazdırılacak içerik bulunamadı. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
        return;
      }

      // Validate that roots have content
      const hasContent = hasRenderableContent(roots);

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
        // PIXEL LOCK: Scale/Zoom soy, ardından tüm elementlerin px değerlerini kilitle
        const restoreScales = stripScalesAndTransforms(page);
        const restorePixels = pixelLockElement(page);

        // Layout'un yeniden hesaplanmasını bekle
        await new Promise<void>((r) => requestAnimationFrame(() => r()));

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: false,      // KRİTİK: true olursa canvas kirlenip boş PNG/PDF çıkar!
          logging: false,
          backgroundColor: '#ffffff',
          foreignObjectRendering: false, // Daha stabil render için kapalı
          windowWidth: page.scrollWidth,
          windowHeight: page.scrollHeight,
          width: page.offsetWidth,
          height: page.offsetHeight,
          x: 0,
          y: 0,
          onclone: (_clonedDoc: Document, clonedEl: HTMLElement) => {
            onCloneForCapture(_clonedDoc);
            // Klonun kökündeki zoom/scale'i de sıfırla
            clonedEl.style.transform = 'none';
            clonedEl.style.zoom = '1';
          },
          ignoreElements: (el) => {
            const htmlEl = el as HTMLElement;
            return (
              htmlEl.classList?.contains('resize-handle') ||
              htmlEl.classList?.contains('action-button') ||
              htmlEl.hasAttribute?.('data-design-only')
            );
          },
        });

        // Restore: önce pikselleri, sonra scale'i geri yükle
        restorePixels();
        restoreScales();

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
    } finally {
      clearRenderAllPagesFlag();
    }
  },

  /**
   * Premium Pagination Engine — Uzun içerikleri A4 sayfalarına böler.
   * Bu sadece 'generateRealPdf' ve 'captureAndPrint' metodlarında çağrılır
   * (Eğer içerik sayfa boyutunu aşıyorsa).
   */
  paginateContent: async (roots: HTMLElement[], paperSize: PaperSize): Promise<HTMLElement[]> => {
    // Şimdilik gelişmiş DOM klonlama / kesme çok kompleks olduğundan
    // ve orijinal DOM'u bozmamak için, eğer .worksheet-page zaten
    // kendi internal pagination'ına sahipse onu kullanmaya devam ediyoruz.
    // Ancak gelecekte sayfa taşan maddeleri (mesela .activity-item) 
    // yeni bir <div className="worksheet-page"> içine aktaracak 
    // bir mantık buraya eklenecektir. CSS ile break-inside: avoid 
    // kullanmak da yazdırma dialogunda çalışır. JsPDF'te ise html2canvas
    // bazen pageBreak desteği vermez, bu yüzden roots listesi aynen döndürülür.
    // Şimdilik DOM node'larını klonlayarak CSS bazlı split ekleyebiliriz:
    return roots;
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
      } else {
        // YAZDIRMA AKSİYONU — Tüm platformlarda en yüksek kalite için Iframe Injection (v2)
        const originalTitle = document.title;
        if (title) document.title = title.replace(/[^a-z0-9ğüşıöç]/gi, '_');
        await printService.print(elementSelector, paperSize);
        if (title) setTimeout(() => { document.title = originalTitle; }, 1000);
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
    await forceRenderAllPages();
    try {
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
      const hasContent = hasRenderableContent(roots);

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

          const restoreScales = stripScalesAndTransforms(page);
          const restorePixels = pixelLockElement(page);

          // Layout'un yeniden hesaplanmasını bekle
          await new Promise<void>((r) => requestAnimationFrame(() => r()));

          const canvas = await html2canvas(page, {
            scale: captureScale,
            useCORS: true,
            allowTaint: false,        // KRİTİK: true olursa canvas kirlenip boş PDF çıkar!
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
    } finally {
      clearRenderAllPagesFlag();
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
