/**
 * Oogmatik Print Engine — Yakalama Motoru
 * Font ön-yükleme, DOM klonlama, pixel lock ve html2canvas wrapper.
 * Bu modül hem printService hem snapshotService tarafından kullanılır.
 */

import { PAGE_SELECTORS, UI_HIDE_SELECTORS } from './constants';

// ─── Font Yönetimi ──────────────────────────────────────────────────────────

/**
 * html2canvas yakalamadan önce tüm web fontlarını (özellikle Lexend) yükler.
 * Font yüklenmeden yakalama yapılırsa metin bozuk, boşluklar kaybolmuş çıkar.
 */
export const preloadFontsForCapture = async (): Promise<void> => {
  if (typeof document === 'undefined') return;
  try {
    await document.fonts.ready;

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

    // Tarayıcıya iki kare boyama süresi ver (font metrics stabileşsin)
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setTimeout(resolve, 150);
        })
      );
    });
  } catch (e) {
    console.warn('[CaptureEngine] Font ön-yükleme uyarısı:', e);
  }
};

// ─── Klon Doküman Hazırlığı ─────────────────────────────────────────────────

/**
 * html2canvas onclone callback — klon dokümana stil sayfalarını ve fontları kopyalar.
 * Olmadığında Google Fonts klon dokümana aktarılmaz → metin bozuk çıkar.
 */
export const onCloneForCapture = (clonedDoc: Document): void => {
  try {
    // Premium Engine Modu marker
    clonedDoc.body.classList.add('is-exporting');

    // Tüm <link rel="stylesheet"> etiketlerini kopyala (Google Fonts dahil)
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      clonedDoc.head.appendChild(link.cloneNode(true));
    });
    // Tüm <style> etiketlerini kopyala (Tailwind inline, custom CSS dahil)
    document.querySelectorAll('style').forEach((style) => {
      clonedDoc.head.appendChild(style.cloneNode(true));
    });

    // @font-face kurallarını CSSStyleSheet'ten ayıklayıp klona enjekte et
    try {
      const fontFaceRules: string[] = [];
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          Array.from(sheet.cssRules || []).forEach((rule) => {
            if (rule instanceof CSSFontFaceRule) {
              fontFaceRules.push(rule.cssText);
            }
          });
        } catch {
          /* cross-origin sheet — erişilemez, atla */
        }
      });
      if (fontFaceRules.length > 0) {
        const fontStyle = clonedDoc.createElement('style');
        fontStyle.textContent = fontFaceRules.join('\n');
        clonedDoc.head.insertBefore(fontStyle, clonedDoc.head.firstChild);
      }
    } catch {
      /* font face extraction failed, devam et */
    }

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
    console.warn('[CaptureEngine] onClone uyarısı:', e);
  }
};

// ─── DOM Manipülasyon Yardımcıları ──────────────────────────────────────────

/**
 * html2canvas'ın scale/zoom deformasyonlarını önlemek için parent stillerini soyar.
 * @returns Orijinal stilleri geri yükleyen cleanup fonksiyonu.
 */
export const stripScalesAndTransforms = (element: HTMLElement): (() => void) => {
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
 * @returns Orijinal stilleri geri yükleyen cleanup fonksiyonu.
 */
export const pixelLockElement = (root: HTMLElement): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  const backups: Array<{
    el: HTMLElement;
    w: string;
    h: string;
    fs: string;
    lh: string;
    ls: string;
  }> = [];
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

/**
 * Verilen element listesinde render edilebilir içerik olup olmadığını kontrol eder.
 */
export const hasRenderableContent = (elements: HTMLElement[]): boolean =>
  elements.some((el) => {
    const textLength = el.textContent?.trim().length ?? 0;
    const hasMedia = el.querySelector('canvas, img, svg, video') !== null;
    const layoutHeight = el.getBoundingClientRect().height;
    return textLength > 10 || hasMedia || layoutHeight > 50;
  });

/**
 * Overlay'deki tüm görsellerin yüklenmesini ve decode edilmesini bekler.
 * Tablet/Safari'de data URL görseller decode edilmeden print() çağrılırsa
 * boş beyaz sayfa çıkabiliyor.
 */
export const waitForOverlayImages = async (
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

// ─── Sayfa Toplama ──────────────────────────────────────────────────────────

/**
 * Verilen CSS seçici altındaki tüm yazdırılabilir sayfaları toplar.
 * Root elemanın kendisi bir sayfa olabilir veya iç sayfa elemanları içerebilir.
 */
export const collectPages = (rootSelector: string): HTMLElement[] => {
  const roots = Array.from(document.querySelectorAll(rootSelector)) as HTMLElement[];
  const pages: HTMLElement[] = [];
  const selectorText = PAGE_SELECTORS.join(',');

  roots.forEach((root) => {
    if (root.matches(selectorText)) {
      pages.push(root);
      return;
    }
    const nested = Array.from(root.querySelectorAll(selectorText)) as HTMLElement[];
    if (nested.length > 0) {
      pages.push(...nested);
    } else {
      pages.push(root);
    }
  });

  return pages;
};

/**
 * UI öğelerini geçici olarak gizler ve geri yükleme fonksiyonu döndürür.
 */
export const hideUIElements = (): (() => void) => {
  const uiElements = document.querySelectorAll<HTMLElement>(UI_HIDE_SELECTORS);
  uiElements.forEach((el) => {
    el.dataset.origDisplay = el.style.display;
    el.style.display = 'none';
  });
  return () => {
    uiElements.forEach((el) => {
      el.style.display = el.dataset.origDisplay ?? '';
      delete el.dataset.origDisplay;
    });
  };
};

// ─── html2canvas Wrapper ────────────────────────────────────────────────────

/**
 * Tek bir sayfa elemanını html2canvas ile yakalar.
 * Pixel lock, scale strip ve onClone dahil tüm hazırlıkları yapar.
 */
export const capturePage = async (
  page: HTMLElement,
  scale: number = 2
): Promise<HTMLCanvasElement> => {
  const { default: html2canvas } = await import('html2canvas');

  const restoreScales = stripScalesAndTransforms(page);
  const restorePixels = pixelLockElement(page);

  // Layout'un yeniden hesaplanmasını bekle
  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  const canvas = await html2canvas(page, {
    scale,
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

  return canvas;
};

/**
 * Birden fazla sayfa elemanını html2canvas ile yakalar.
 * snapshotService ve printService ortak kullanımı için.
 */
export const captureAllPages = async (
  elementSelector: string,
  scale: number = 2
): Promise<HTMLCanvasElement[]> => {
  const roots = Array.from(document.querySelectorAll(elementSelector)) as HTMLElement[];
  if (roots.length === 0) {
    throw new Error(`[CaptureEngine] "${elementSelector}" bulunamadı.`);
  }

  const pages = collectPages(elementSelector);
  const restoreUI = hideUIElements();

  await preloadFontsForCapture();

  const canvases: HTMLCanvasElement[] = [];
  const origBgs: string[] = [];

  try {
    for (const page of pages) {
      origBgs.push(page.style.backgroundColor);
      page.style.backgroundColor = '#ffffff';

      const canvas = await capturePage(page, scale);
      canvases.push(canvas);
    }
  } finally {
    pages.forEach((p, i) => {
      p.style.backgroundColor = origBgs[i] ?? '';
    });
    restoreUI();
  }

  return canvases;
};
