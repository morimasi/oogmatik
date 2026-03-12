
// ═══════════════════════════════════════════════════════════════
// ULTRA PRINT ENGINE v4.0 — A4 Kompakt Çoklu Sayfa Yazdırma
// Bursa Disleksi AI — Nöro-Mimari Basım Motoru
// ═══════════════════════════════════════════════════════════════

export interface PrintOptions {
  action: 'print' | 'download';
  selectedPages?: number[];
  grayscale?: boolean;
  worksheetData?: any[];
  /** @default false Kompakt mod: font + padding küçültür, sayfaya daha fazla içerik sığdırır */
  compact?: boolean;
  /** @default 1 Sütun sayısı: 2 seçilince içerik yan yana 2 sütunda dizilir */
  columnsPerPage?: 1 | 2;
  /** @default 11 Yazı boyutu (pt) */
  fontSize?: 10 | 11 | 12;
}

export const printService = {
  /**
   * Ultra Print Engine v4.0
   * A4 Kompakt Çoklu Sayfa Yazdırma Motoru.
   * DOM klonlama, UI temizleme, kompakt/2-sütun modu ve cevap anahtarı destekler.
   */
  generatePdf: async (
    elementSelector: string,
    title: string = "Bursa_Disleksi_AI_Etkinlik",
    options: PrintOptions
  ) => {
    // 1. Hedef elementleri bul
    let elements = Array.from(document.querySelectorAll(elementSelector)) as HTMLElement[];

    if (options.selectedPages && options.selectedPages.length > 0) {
      elements = elements.filter((_, idx) => options.selectedPages!.includes(idx));
    }

    if (!elements.length) {
      console.warn(`[PrintEngine] Yazdırılacak içerik bulunamadı. Selector: "${elementSelector}"`);
      return;
    }

    // 2. Mevcut print container'ı temizle
    const existingContainer = document.getElementById('print-container');
    if (existingContainer) existingContainer.remove();

    // 3. Print container oluştur
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';

    // v6: Pixel Dayalı Fiziksel Kilit (A4 ≈ 794px @ 96dpi)
    const A4_WIDTH_PX = '794px';

    // Temel stiller
    printContainer.style.setProperty('position', 'relative', 'important');
    printContainer.style.setProperty('width', A4_WIDTH_PX, 'important');
    printContainer.style.setProperty('max-width', A4_WIDTH_PX, 'important');
    printContainer.style.setProperty('margin', '0', 'important'); // v6: Sol tarafa daya (Browser marjinleri ile sığması için)
    printContainer.style.setProperty('padding', '0', 'important');
    printContainer.style.setProperty('background', 'white', 'important');
    printContainer.style.setProperty('z-index', '9999999', 'important');

    // Mod sınıfları ekle (CSS tarafından işlenir)
    if (options.grayscale) printContainer.classList.add('grayscale-print');
    if (options.compact) printContainer.classList.add('compact-print');
    if (options.columnsPerPage === 2) printContainer.classList.add('two-column-print');
    if (options.fontSize) printContainer.setAttribute('data-font-size', String(options.fontSize));

    // 4. Elementleri klonla ve temizle
    elements.forEach((el) => {
      const clone = el.cloneNode(true) as HTMLElement;

      // Input/textarea değerlerini senkronize et
      const originalInputs = el.querySelectorAll('input, textarea, select');
      const clonedInputs = clone.querySelectorAll('input, textarea, select');
      originalInputs.forEach((input, i) => {
        const clonedInput = clonedInputs[i] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const originalInput = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        if (!clonedInput || !originalInput) return;

        if (originalInput.type === 'checkbox' || originalInput.type === 'radio') {
          if ((originalInput as HTMLInputElement).checked) clonedInput.setAttribute('checked', 'checked');
        } else if (originalInput.tagName === 'TEXTAREA') {
          clonedInput.innerHTML = originalInput.value;
          clonedInput.value = originalInput.value;
        } else {
          clonedInput.setAttribute('value', originalInput.value);
        }
      });

      // UI gürültüsünü temizle (sadece kesin UI elementleri)
      const uiGarbage = clone.querySelectorAll(
        '.edit-handle, .page-navigator, .no-print, .overlay-ui, ' +
        '[data-testid="edit-btn"], .page-label-container, ' +
        '.print-toolbar, .print-controls, [class*="backdrop-blur"]'
      );
      uiGarbage.forEach(e => (e as HTMLElement).remove());

      // Butonları gizle (ama print-keep olarak işaretlenenler korunur)
      clone.querySelectorAll('button:not(.print-keep)').forEach(btn => {
        (btn as HTMLElement).style.setProperty('display', 'none', 'important');
      });

      // A4 için transform ve boyut sıfırlama (v6: Hard Pixel Standard)
      clone.style.setProperty('transform', 'none', 'important');
      clone.style.setProperty('scale', '1', 'important');
      clone.style.setProperty('zoom', '1', 'important');
      clone.style.setProperty('margin', '0', 'important');
      clone.style.setProperty('box-shadow', 'none', 'important');
      clone.style.setProperty('position', 'relative', 'important');
      clone.style.setProperty('width', A4_WIDTH_PX, 'important');
      clone.style.setProperty('max-width', A4_WIDTH_PX, 'important');
      clone.style.setProperty('padding', '38px', 'important'); // 10mm ≈ 38px (96dpi)
      clone.style.setProperty('min-height', '1122px', 'important'); // A4 Height ≈ 1123px
      clone.style.setProperty('height', 'auto', 'important');
      clone.style.setProperty('box-sizing', 'border-box', 'important');
      clone.style.setProperty('display', 'block', 'important');
      clone.style.setProperty('overflow', 'visible', 'important');
      clone.style.setProperty('page-break-after', 'always', 'important');
      clone.style.setProperty('break-after', 'page', 'important');
      clone.style.setProperty('background', 'white', 'important');
      clone.style.setProperty('color', 'black', 'important');

      // --- DEEP ASSET CAPTURE & STYLE CLEANING (v7) ---
      const originalElements = el.querySelectorAll('*');
      const cloneElements = clone.querySelectorAll('*');

      // 1. Canvas Mirroring (Mevcut kanvas verilerini klona aktar)
      const originalCanvases = el.querySelectorAll('canvas');
      const clonedCanvases = clone.querySelectorAll('canvas');
      originalCanvases.forEach((oCanvas, cIdx) => {
        const cCanvas = clonedCanvases[cIdx] as HTMLCanvasElement;
        if (cCanvas) {
          cCanvas.width = oCanvas.width;
          cCanvas.height = oCanvas.height;
          const ctx = cCanvas.getContext('2d');
          if (ctx) ctx.drawImage(oCanvas, 0, 0);
        }
      });

      cloneElements.forEach((child, idx) => {
        const cel = child as HTMLElement;
        const oel = originalElements[idx] as HTMLElement;
        if (!oel) return;

        // 2. Ekran ölçeklendirmelerini ve zoom etkilerini kesin temizle
        cel.style.setProperty('transform', 'none', 'important');
        cel.style.setProperty('scale', '1', 'important');
        cel.style.setProperty('zoom', '1', 'important');
        cel.style.setProperty('-webkit-text-size-adjust', '100%', 'important');
        if (cel.hasAttribute('data-scaled')) cel.removeAttribute('data-scaled');

        // 3. Viewport ve Taşma Normalizasyonu
        const oStyle = window.getComputedStyle(oel);
        const computedWidth = parseFloat(oStyle.width) || 0;

        if (computedWidth > 750 || oStyle.width.includes('vw')) {
          cel.style.setProperty('width', '100%', 'important');
          cel.style.setProperty('max-width', '100%', 'important');
        }

        if (oStyle.display === 'flex' || oStyle.display === 'grid') {
          cel.style.setProperty('max-width', '100%', 'important');
          cel.style.setProperty('width', '100%', 'important');
          cel.style.setProperty('overflow', 'visible', 'important');
        }

        if (oStyle.height.includes('vh')) cel.style.height = 'auto';

        // 4. SVG & Asset Integrity (Bozuk SVG referanslarını önle)
        if (cel.tagName.toLowerCase() === 'svg') {
          cel.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          if (!cel.getAttribute('viewBox') && cel.offsetWidth) {
            cel.setAttribute('viewBox', `0 0 ${cel.offsetWidth} ${cel.offsetHeight}`);
          }
        }

        // 5. Görünürlük ve Taşma
        if (oStyle.overflow === 'hidden' || oStyle.overflow === 'auto') {
          cel.style.setProperty('overflow', 'visible', 'important');
        }
      });

      clone.classList.add('ultra-print-page');
      printContainer.appendChild(clone);
    });

    // Force compact mode for premium look (moved outside the loop)
    printContainer.classList.add('compact-print');

    document.body.appendChild(printContainer);

    // 6. Görsellerin ve Fontların yüklenmesini bekle (Deterministik)
    const images = Array.from(printContainer.querySelectorAll('img'));
    const imagePromises = images.map(async (img) => {
      try {
        if (img.complete) {
          await img.decode();
        } else {
          await new Promise((resolve, reject) => {
            img.onload = () => img.decode().then(resolve).catch(resolve);
            img.onerror = resolve;
            setTimeout(resolve, 8000); // Max 8sn görsel bazlı timeout
          });
        }
      } catch (e) {
        console.warn('[PrintEngine] Görsel decode edilemedi, devam ediliyor:', img.src);
      }
    });

    // Fontların hazır olduğundan emin ol
    if ('fonts' in document) {
      await (document as any).fonts.ready;
    }

    await Promise.all(imagePromises);

    // 7. Tarayıcı düzen motorunun (Layout) tam oturduğundan emin ol
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, options.compact ? 800 : 1200)));

    // Kontrol: Fontlar hala yüklenmemiş olabilir mi?
    if (document.fonts) {
      await document.fonts.ready;
    }

    // 8. Viewport Manipülasyonu ve Yazdır (v6: DOM Isolation)
    const originalTitle = document.title;
    document.title = title.replace(/[^a-z0-9ğüşıöç]/gi, '_');

    // Viewport meta tag'ini fiziksel genişliğe kilitler (Tarayıcıyı kandırır)
    const meta = document.querySelector('meta[name="viewport"]');
    const originalViewport = meta ? meta.getAttribute('content') : '';
    if (meta) meta.setAttribute('content', 'width=794, initial-scale=1, maximum-scale=1, user-scalable=no');

    // Root elementini geçici olarak "Derin Gizle" (Layout engine'i kırmadan)
    const root = document.getElementById('root');
    if (root) {
      root.style.setProperty('visibility', 'hidden', 'important');
      root.style.setProperty('position', 'fixed', 'important');
      root.style.setProperty('top', '-9999px', 'important');
      root.style.setProperty('left', '-9999px', 'important');
      root.style.setProperty('opacity', '0', 'important');
    }

    // Ekstra bekleme: SVG ve karmaşık layout bileşenleri için (v7)
    await new Promise(resolve => setTimeout(resolve, 500));

    window.print();

    // 9. Temizlik ve Geri Yükleme
    if (meta && originalViewport) meta.setAttribute('content', originalViewport);
    if (root) {
      root.style.removeProperty('visibility');
      root.style.removeProperty('position');
      root.style.removeProperty('top');
      root.style.removeProperty('left');
      root.style.removeProperty('opacity');
    }
    document.title = originalTitle;

    // afterprint eventi ya da timeout ile güvenli cleanup
    const cleanup = () => {
      const container = document.getElementById('print-container');
      if (container?.parentNode) {
        document.body.removeChild(container);
      }
    };

    const afterPrintHandler = () => {
      cleanup();
      window.removeEventListener('afterprint', afterPrintHandler);
    };
    window.addEventListener('afterprint', afterPrintHandler);

    // Fallback: 3 saniye sonra yine de temizle
    setTimeout(cleanup, 3000);
  }
};
