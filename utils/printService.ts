// ═══════════════════════════════════════════════════════════════
// ULTRA PRINT ENGINE v6.0 — A4 Kompakt Çoklu Sayfa Yazdırma
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
    title: string = 'Bursa_Disleksi_AI_Etkinlik',
    options: PrintOptions
  ) => {
    // 0. Render Stabilizasyonu (v5.0): DOM'un hazır olduğundan emin ol
    await new Promise(resolve => setTimeout(resolve, 500));

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

    // v6.0: Relative Expansion - Konteyner tüm sayfayı doldurur
    printContainer.style.setProperty('position', 'relative', 'important');
    printContainer.style.setProperty('width', '100%', 'important');
    printContainer.style.setProperty('max-width', '100%', 'important');
    printContainer.style.setProperty('margin', '0', 'important');
    printContainer.style.setProperty('padding', '0', 'important');
    printContainer.style.setProperty('background', 'white', 'important');
    printContainer.style.setProperty('z-index', '9999999', 'important');
    printContainer.style.setProperty('box-sizing', 'border-box', 'important');

    // Mod sınıfları ekle (CSS tarafından işlenir)
    if (options.grayscale) printContainer.classList.add('grayscale-print');
    if (options.compact) printContainer.classList.add('compact-print');
    if (options.columnsPerPage === 2) printContainer.classList.add('two-column-print');
    if (options.fontSize) printContainer.setAttribute('data-font-size', String(options.fontSize));

    // 4. Elementleri klonla ve temizle
    elements.forEach((el) => {
      const clone = el.cloneNode(true) as HTMLElement;

      // ... (input senkronizasyonu aynı kalır)

      // UI gürültüsünü temizle
      const uiGarbage = clone.querySelectorAll(
        '.edit-handle, .page-navigator, .no-print, .overlay-ui, ' +
        '[data-testid="edit-btn"], .page-label-container, ' +
        '.print-toolbar, .print-controls, [class*="backdrop-blur"]'
      );
      uiGarbage.forEach((e) => (e as HTMLElement).remove());

      clone.querySelectorAll('button:not(.print-keep)').forEach((btn) => {
        (btn as HTMLElement).style.setProperty('display', 'none', 'important');
      });

      // ══════════════════════════════════════════════════════════════════
      // v6.0: DPI LOCK & RATIO SYNC
      // ══════════════════════════════════════════════════════════════════
      clone.style.setProperty('transform', 'none', 'important');
      clone.style.setProperty('scale', '1', 'important');
      clone.style.setProperty('zoom', '1', 'important');
      clone.style.setProperty('margin', '0 auto', 'important');
      clone.style.setProperty('box-shadow', 'none', 'important');
      clone.style.setProperty('position', 'relative', 'important');
      clone.style.setProperty('width', '210mm', 'important'); // Fiziksel içerik genişliği
      clone.style.setProperty('max-width', '210mm', 'important');
      clone.style.setProperty('padding', '10mm', 'important'); // 1cm marjin
      clone.style.setProperty('min-height', '296mm', 'important'); // A4 oranını koru
      clone.style.setProperty('height', 'auto', 'important');
      clone.style.setProperty('box-sizing', 'border-box', 'important');
      clone.style.setProperty('display', 'block', 'important');
      clone.style.setProperty('overflow', 'visible', 'important');
      clone.style.setProperty('background', 'white', 'important');
      clone.style.setProperty('color', 'black', 'important');

      // --- DEEP STYLE CLEANING (v4) ---
      const originalElements = el.querySelectorAll('*');
      const cloneElements = clone.querySelectorAll('*');

      cloneElements.forEach((child, idx) => {
        const cel = child as HTMLElement;
        const oel = originalElements[idx] as HTMLElement;
        if (!oel) return;

        // 1. Ekran ölçeklendirmelerini temizle
        cel.style.setProperty('transform', 'none', 'important');
        cel.style.setProperty('scale', '1', 'important');
        cel.style.setProperty('zoom', '1', 'important');
        if (cel.hasAttribute('data-scaled')) cel.removeAttribute('data-scaled');

        // 2. Viewport bazlı genişlikleri (vw/vh) temizle (Klon henüz DOM'da değil, orijinalden bakıyoruz)
        const oStyle = window.getComputedStyle(oel);
        if (oStyle.width.includes('vw')) cel.style.width = '100%';
        if (oStyle.maxWidth.includes('vw')) cel.style.maxWidth = '100%';
        if (oStyle.height.includes('vh')) cel.style.height = 'auto';

        // 3. Taşmayı önle
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
    // Özellikle çok sayfalı kitapçıklarda ve ağır AI görsellerinde bekleme süresini 1.5 saniyeye çıkarıyoruz.
    await new Promise((resolve) =>
      requestAnimationFrame(() => setTimeout(resolve, options.compact ? 1000 : 1500))
    );

    // Kontrol: Fontlar hala yüklenmemiş olabilir mi?
    if (document.fonts) {
      await document.fonts.ready;
    }

    // 8. Yazdır
    const originalTitle = document.title;
    document.title = title.replace(/[^a-z0-9ğüşıöç]/gi, '_');

    // 5. Yazdırma işlemine geç
    setTimeout(async () => {
      window.print();

      // 7. Temizlik: Print konteynerini kaldır
      if (options.action === 'print') {
        setTimeout(() => {
          if (printContainer.parentNode) {
            document.body.removeChild(printContainer);
          }
        }, 2000);
      }
    }, 500); // v5: Stabilizasyon için süreyi artırdık

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
  },
};
