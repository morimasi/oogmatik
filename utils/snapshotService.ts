
// @ts-nocheck

export type SnapshotAction = 'download' | 'clipboard' | 'share';

/** Yakalama öncesi fontları yükler */
const preloadFontsForCapture = async (): Promise<void> => {
  if (typeof document === 'undefined') return;
  try {
    await document.fonts.ready;
    const fontFamilies = ['Lexend', 'Inter', 'Comic Neue', 'Lora'];
    const weights = ['400', '600', '700', '800'];
    const testText = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZabcçdefgğhıijklmnoöprsştuüvyz0123456789';
    const loadPromises: Promise<unknown>[] = [];
    for (const family of fontFamilies) {
      for (const weight of weights) {
        loadPromises.push(document.fonts.load(`${weight} 16px "${family}"`, testText).catch(() => null));
      }
    }
    await Promise.allSettled(loadPromises);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
  } catch (e) {
    console.warn('[snapshotService] Font ön-yükleme uyarısı:', e);
  }
};

/** html2canvas klon dokümana stil sayfalarını kopyalar */
const onCloneForCapture = (clonedDoc: Document): void => {
  try {
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      clonedDoc.head.appendChild(link.cloneNode(true));
    });
    document.querySelectorAll('style').forEach((style) => {
      clonedDoc.head.appendChild(style.cloneNode(true));
    });
    const extra = clonedDoc.createElement('style');
    extra.textContent =
      '* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }' +
      ' body { background: #ffffff !important; }';
    clonedDoc.head.appendChild(extra);
  } catch (e) {
    console.warn('[snapshotService] onClone uyarısı:', e);
  }
};

const PAGE_SELECTORS = [
  '.worksheet-page',
  '.universal-mode-canvas',
  '.math-canvas-page',
  '.reading-canvas-page',
  '.a4-page',
  '.print-page',
];

const UI_HIDE_SELECTORS = '.edit-handle, .page-navigator, .no-print, .overlay-ui, .resize-handle, .action-button';

/** Tüm sayfaları HTMLCanvasElement olarak yakalar */
const capturePages = async (elementSelector: string): Promise<HTMLCanvasElement[]> => {
  const { default: html2canvas } = await import('html2canvas');

  const roots = Array.from(document.querySelectorAll(elementSelector)) as HTMLElement[];
  if (roots.length === 0) throw new Error('Görüntü alınacak içerik bulunamadı.');

  // Sayfa elemanlarını topla
  const pages: HTMLElement[] = [];
  const selectorText = PAGE_SELECTORS.join(',');
  roots.forEach((root) => {
    if (root.matches(selectorText)) { pages.push(root); return; }
    const nested = Array.from(root.querySelectorAll(selectorText)) as HTMLElement[];
    pages.push(...(nested.length > 0 ? nested : [root]));
  });

  // UI öğelerini gizle
  const uiElements = document.querySelectorAll(UI_HIDE_SELECTORS);
  uiElements.forEach((el: any) => { el.dataset.origDisplay = el.style.display; el.style.display = 'none'; });

  const origBgs: string[] = [];
  const canvases: HTMLCanvasElement[] = [];

  // Fontların yüklenmesini bekle
  await preloadFontsForCapture();

  try {
    for (const page of pages) {
      origBgs.push(page.style.backgroundColor);
      page.style.backgroundColor = '#ffffff';

      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        onclone: (_clonedDoc: Document) => onCloneForCapture(_clonedDoc),
        ignoreElements: (el) => {
          const h = el as HTMLElement;
          return h.classList?.contains('no-print') || h.classList?.contains('edit-handle') ||
                 h.classList?.contains('resize-handle') || h.hasAttribute?.('data-design-only');
        },
      });
      canvases.push(canvas);
    }
  } finally {
    // Geri yükle
    pages.forEach((p, i) => { p.style.backgroundColor = origBgs[i]; });
    uiElements.forEach((el: any) => { el.style.display = el.dataset.origDisplay || ''; delete el.dataset.origDisplay; });
  }

  return canvases;
};

/** Canvas → Blob dönüşümü */
const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/png', quality = 1.0): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('toBlob failed')), type, quality);
  });
};

export const snapshotService = {
  /**
   * Ekran görüntüsü al — tüm sayfaları yakalar.
   * action: 'download' | 'clipboard' | 'share'
   */
  takeSnapshot: async (
    elementSelector: string,
    fileName: string,
    action: SnapshotAction = 'download'
  ): Promise<void> => {
    const canvases = await capturePages(elementSelector);

    if (action === 'download') {
      for (let i = 0; i < canvases.length; i++) {
        const link = document.createElement('a');
        link.download = `${fileName}${canvases.length > 1 ? `_sayfa_${i + 1}` : ''}_${Date.now()}.png`;
        link.href = canvases[i].toDataURL('image/png', 1.0);
        link.click();
      }
      return;
    }

    if (action === 'clipboard') {
      await snapshotService.copyToClipboard(canvases[0]);
      return;
    }

    if (action === 'share') {
      await snapshotService.shareImages(canvases, fileName);
      return;
    }
  },

  /** İlk sayfayı panoya kopyala */
  copyToClipboard: async (canvas: HTMLCanvasElement): Promise<boolean> => {
    try {
      const blob = await canvasToBlob(canvas, 'image/png');
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      return true;
    } catch (err) {
      console.error('Panoya kopyalama hatası:', err);
      // Fallback: data URL'yi panoya kopyala
      try {
        await navigator.clipboard.writeText(canvas.toDataURL('image/png'));
        return true;
      } catch {
        return false;
      }
    }
  },

  /** Web Share API ile görüntüleri paylaş (mobil uyumlu) */
  shareImages: async (canvases: HTMLCanvasElement[], fileName: string): Promise<boolean> => {
    const files: File[] = [];
    for (let i = 0; i < canvases.length; i++) {
      const blob = await canvasToBlob(canvases[i], 'image/png');
      const name = `${fileName}${canvases.length > 1 ? `_sayfa_${i + 1}` : ''}.png`;
      files.push(new File([blob], name, { type: 'image/png' }));
    }

    if (navigator.share && navigator.canShare?.({ files })) {
      try {
        await navigator.share({
          title: 'Oogmatik Etkinlik',
          text: 'Bursa Disleksi AI ile oluşturulmuştur',
          files,
        });
        return true;
      } catch (err: any) {
        if (err.name === 'AbortError') return false; // Kullanıcı iptal etti
        console.error('Share hatası:', err);
      }
    }

    // Fallback: indirmeye yönlendir
    await snapshotService.takeSnapshot('.worksheet-page', fileName, 'download');
    return false;
  },

  /** Tek bir canvas'tan doğrudan Blob döndür — dışarıdan kullanım için */
  captureAsBlob: async (elementSelector: string): Promise<Blob | null> => {
    try {
      const canvases = await capturePages(elementSelector);
      if (canvases.length === 0) return null;
      return await canvasToBlob(canvases[0], 'image/png');
    } catch {
      return null;
    }
  },
};
