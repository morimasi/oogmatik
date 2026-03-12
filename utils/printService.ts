
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

    // Temel stiller
    printContainer.style.setProperty('position', 'relative', 'important'); // v4: relative yaparak doğal sayfa akışını sağla
    printContainer.style.setProperty('width', '210mm', 'important');
    printContainer.style.setProperty('max-width', '210mm', 'important');
    printContainer.style.setProperty('margin', '0 auto', 'important');
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

      // A4 için transform ve boyut sıfırlama (v6.1: Force Left Align)
      clone.style.setProperty('transform', 'none', 'important');
      clone.style.setProperty('scale', '1', 'important');
      clone.style.setProperty('zoom', '1', 'important');
      clone.style.setProperty('margin', '0', 'important');
      clone.style.setProperty('left', '0', 'important');
      clone.style.setProperty('right', 'auto', 'important');
      clone.style.setProperty('text-align', 'left', 'important');
      clone.style.setProperty('box-shadow', 'none', 'important');
      clone.style.setProperty('position', 'relative', 'important');
      clone.style.setProperty('width', '100%', 'important'); // 200mm Printable Area
      clone.style.setProperty('max-width', '100%', 'important');
      clone.style.setProperty('padding', '0', 'important'); // Margin @page'den gelir
      clone.style.setProperty('min-height', '287mm', 'important'); // 297-10=287mm
      clone.style.setProperty('height', 'auto', 'important');
      clone.style.setProperty('box-sizing', 'border-box', 'important');
      clone.style.setProperty('display', 'block', 'important');
      clone.style.setProperty('overflow', 'visible', 'important');
      clone.style.setProperty('page-break-after', 'always', 'important');
      clone.style.setProperty('break-after', 'page', 'important');
      clone.style.setProperty('background', 'white', 'important');
      clone.style.setProperty('color', 'black', 'important');

      // --- DEEP STYLE CLEANING (v6: MM-Based Calculation) ---
      const originalElements = el.querySelectorAll('*');
      const cloneElements = clone.querySelectorAll('*');

      cloneElements.forEach((child, idx) => {
        const cel = child as HTMLElement;
        const oel = originalElements[idx] as HTMLElement;
        if (!oel) return;

        // 1. Ekran ölçeklendirmelerini ve zoom etkilerini kesin temizle
        cel.style.setProperty('transform', 'none', 'important');
        cel.style.setProperty('scale', '1', 'important');
        cel.style.setProperty('zoom', '1', 'important');
        cel.style.setProperty('-webkit-text-size-adjust', '100%', 'important');
        if (cel.hasAttribute('data-scaled')) cel.removeAttribute('data-scaled');

        // 2. Viewport ve Taşma Normalizasyonu (v6: 200mm Limit)
        const oStyle = window.getComputedStyle(oel);
        const computedWidth = parseFloat(oStyle.width) || 0;

        // Printable Area Width: 200mm ≈ 755px (@96dpi)
        // Eğer içerik bu değerden genişse, %100'e çek
        if (computedWidth > 750 || oStyle.width.includes('vw')) {
          cel.style.setProperty('width', '100%', 'important');
          cel.style.setProperty('max-width', '100%', 'important');
          cel.style.setProperty('box-sizing', 'border-box', 'important');
          cel.style.setProperty('margin-left', '0', 'important');
          cel.style.setProperty('margin-right', '0', 'important');
          cel.style.setProperty('overflow', 'visible', 'important'); 
          cel.style.setProperty('white-space', 'normal', 'important');
        }

        // Resim ve Canvas Koruması
        if (cel.tagName === 'IMG' || cel.tagName === 'CANVAS' || cel.tagName === 'SVG') {
             cel.style.setProperty('max-width', '100%', 'important');
             cel.style.setProperty('height', 'auto', 'important');
        }

        // 3. Flex ve Grid Alanlarını Blok Haline Getir (Pagination Dostu)
        // Ancak 2 sütunlu modda ana içerik alanını bozma
        const isContentArea = cel.classList.contains('print-content-area');
        const preserveGrid = isContentArea && options.columnsPerPage === 2;
        
        // Yan yana dizilmesi gereken gridleri (örn: şıklar, görseller) koru
        const isSmallGrid = cel.classList.contains('grid-cols-2') || cel.classList.contains('grid-cols-3') || cel.classList.contains('grid-cols-4');

        if ((oStyle.display === 'flex' || oStyle.display === 'grid') && !preserveGrid && !isSmallGrid) {
            cel.style.setProperty('max-width', '100%', 'important');
            cel.style.setProperty('height', 'auto', 'important');
            cel.style.setProperty('min-height', '0', 'important');
            cel.style.setProperty('overflow', 'visible', 'important');
            // Sadece dikey flex yapılarını veya büyük kapsayıcıları block yap
            if (oStyle.flexDirection === 'column' || oStyle.height.includes('100%') || oStyle.height.includes('vh')) {
                 cel.style.setProperty('display', 'block', 'important'); 
            }
        }
        
        // 4. Tablo ve Liste Yönetimi (Sayfa Bölünmesi)
        if (cel.tagName === 'TABLE' || cel.tagName === 'UL' || cel.tagName === 'OL') {
             cel.style.setProperty('page-break-inside', 'auto', 'important');
             cel.style.setProperty('break-inside', 'auto', 'important');
        }
        
        // Satırların bölünmesini engelle
        if (cel.tagName === 'TR' || cel.tagName === 'LI' || cel.classList.contains('question-block')) {
             cel.style.setProperty('page-break-inside', 'avoid', 'important');
             cel.style.setProperty('break-inside', 'avoid', 'important');
             cel.style.setProperty('page-break-after', 'auto', 'important');
        }

        if (oStyle.height.includes('vh')) cel.style.height = 'auto';

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

    // 8. Yazdır
    const originalTitle = document.title;
    document.title = title.replace(/[^a-z0-9ğüşıöç]/gi, '_');

    window.print();

    // 9. Temizlik (print dialog kapatıldıktan sonra)
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
