/**
 * Oogmatik Print Engine — Canlı Önizleme Renderer
 * PrintPreviewModal içinde gerçek DOM klonlama + ölçekleme ile
 * "Canlı Önizleme" sunar.
 */

import type { PaperSize } from './types';
import { PAPER_DIMENSIONS, PAGE_SELECTORS } from './constants';

/**
 * Belirli bir sayfa elemanını klonlayıp container'a yerleştirir.
 * Container boyutuna göre ölçekleme yapılır.
 */
export const renderPagePreview = (
  container: HTMLElement,
  pageIndex: number,
  paperSize: PaperSize,
  sourceSelector: string = '.worksheet-page, .a4-page, .universal-mode-canvas'
): { totalPages: number; cleanup: () => void } => {
  // Kaynak sayfaları bul
  const allPages = collectSourcePages(sourceSelector);
  const totalPages = Math.max(1, allPages.length);

  // Container'ı temizle
  container.innerHTML = '';

  const clampedIndex = Math.max(0, Math.min(pageIndex, allPages.length - 1));
  const sourcePage = allPages[clampedIndex];

  if (!sourcePage) {
    renderEmptyState(container);
    return { totalPages, cleanup: () => {} };
  }

  // Klonla
  const clone = sourcePage.cloneNode(true) as HTMLElement;

  // Stil temizliği — ekran özel effektleri kaldır
  cleanCloneForPreview(clone);

  // A4 boyutlandırma
  const dims = PAPER_DIMENSIONS[paperSize];
  const pageWrapper = document.createElement('div');
  pageWrapper.className = 'preview-page-wrapper';
  pageWrapper.style.cssText = `
    width: ${dims.width};
    min-height: ${dims.height};
    background: #ffffff;
    overflow: hidden;
    position: relative;
    transform-origin: top left;
    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
    border-radius: 4px;
    border: 1px solid rgba(0,0,0,0.08);
  `;

  pageWrapper.appendChild(clone);

  // Ölçekleme — container'a sığdır
  const scale = calculatePreviewScale(container, paperSize);
  const scaledWrapper = document.createElement('div');
  scaledWrapper.className = 'preview-scaled-container';
  scaledWrapper.style.cssText = `
    transform: scale(${scale});
    transform-origin: top center;
    display: flex;
    justify-content: center;
  `;
  scaledWrapper.appendChild(pageWrapper);
  container.appendChild(scaledWrapper);

  return {
    totalPages,
    cleanup: () => {
      container.innerHTML = '';
    },
  };
};

/**
 * Tüm sayfaları alt alta scroll edilebilir şekilde container'a yerleştirir.
 * Sayfa aralarına görsel sayfa sonu göstergesi eklenir.
 */
export const renderAllPagesPreview = (
  container: HTMLElement,
  paperSize: PaperSize,
  sourceSelector: string = '.worksheet-page, .a4-page, .universal-mode-canvas'
): { totalPages: number; cleanup: () => void; scrollToPage: (index: number) => void } => {
  const allPages = collectSourcePages(sourceSelector);
  const totalPages = Math.max(1, allPages.length);

  container.innerHTML = '';

  const scale = calculatePreviewScale(container, paperSize);
  const dims = PAPER_DIMENSIONS[paperSize];

  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'preview-scroll-container';
  scrollContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 24px 0;
  `;

  const pageRefs: HTMLElement[] = [];

  allPages.forEach((sourcePage, index) => {
    const clone = sourcePage.cloneNode(true) as HTMLElement;
    cleanCloneForPreview(clone);

    const pageWrapper = document.createElement('div');
    pageWrapper.className = 'preview-page-wrapper';
    pageWrapper.dataset.pageIndex = String(index);
    pageWrapper.style.cssText = `
      width: ${dims.width};
      min-height: ${dims.height};
      background: #ffffff;
      overflow: hidden;
      position: relative;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      border-radius: 4px;
      border: 1px solid rgba(0,0,0,0.08);
      transform: scale(${scale});
      transform-origin: top center;
      margin-bottom: ${scale < 1 ? `${(1 - scale) * -parseFloat(dims.height) * 3.78}px` : '0'};
    `;

    pageWrapper.appendChild(clone);
    scrollContainer.appendChild(pageWrapper);
    pageRefs.push(pageWrapper);

    // Sayfa sonu göstergesi (son sayfadan sonra ekleme)
    if (index < allPages.length - 1) {
      const separator = createPageBreakIndicator(index + 1, index + 2);
      scrollContainer.appendChild(separator);
    }
  });

  container.appendChild(scrollContainer);

  return {
    totalPages,
    cleanup: () => {
      container.innerHTML = '';
    },
    scrollToPage: (index: number) => {
      const target = pageRefs[index];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
  };
};

// ─── Yardımcı Fonksiyonlar ──────────────────────────────────────────────────

/**
 * DOM'dan tüm yazdırılabilir sayfa elemanlarını toplar.
 */
const collectSourcePages = (selector: string): HTMLElement[] => {
  const roots = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
  const pages: HTMLElement[] = [];
  const selectorText = PAGE_SELECTORS.join(',');

  roots.forEach((root) => {
    if (root.matches(selectorText)) {
      pages.push(root);
    } else {
      const nested = Array.from(root.querySelectorAll(selectorText)) as HTMLElement[];
      if (nested.length > 0) pages.push(...nested);
      else pages.push(root);
    }
  });

  return pages;
};

/**
 * Container boyutuna göre A4 ölçekleme oranını hesaplar.
 */
const calculatePreviewScale = (container: HTMLElement, paperSize: PaperSize): number => {
  const dims = PAPER_DIMENSIONS[paperSize];
  const paperWidthPx = parseFloat(dims.width) * 3.7795; // mm → px (96 DPI)
  const containerWidth = container.clientWidth - 48; // 24px padding her taraftan
  return Math.min(1, containerWidth / paperWidthPx);
};

/**
 * Klonlanan elemanı önizleme için temizler.
 * Ekran özel efektleri, butonlar ve interaktif elemanları kaldırır.
 */
const cleanCloneForPreview = (clone: HTMLElement): void => {
  // UI elemanlarını kaldır
  const uiSelectors = '.no-print, .edit-handle, .resize-handle, .action-button, [data-design-only]';
  clone.querySelectorAll(uiSelectors).forEach((el) => el.remove());

  // Arka plan rengi garanti
  clone.style.backgroundColor = '#ffffff';

  // Pointer events devre dışı (tıklanamaz olsun)
  clone.style.pointerEvents = 'none';
  clone.style.userSelect = 'none';
};

/**
 * Sayfa sonu görsel göstergesi oluşturur.
 */
const createPageBreakIndicator = (fromPage: number, toPage: number): HTMLElement => {
  const indicator = document.createElement('div');
  indicator.className = 'page-break-indicator no-print';
  indicator.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    max-width: 500px;
    padding: 4px 0;
    opacity: 0.5;
    user-select: none;
  `;

  indicator.innerHTML = `
    <div style="flex:1; height:1px; background:repeating-linear-gradient(90deg, #9ca3af 0, #9ca3af 4px, transparent 4px, transparent 8px);"></div>
    <span style="font-size:10px; font-weight:700; color:#9ca3af; letter-spacing:0.1em; font-family:Inter,sans-serif; white-space:nowrap;">
      ✂ Sayfa ${fromPage} → ${toPage}
    </span>
    <div style="flex:1; height:1px; background:repeating-linear-gradient(90deg, #9ca3af 0, #9ca3af 4px, transparent 4px, transparent 8px);"></div>
  `;

  return indicator;
};

/**
 * İçerik bulunamadığında gösterilecek boş durum.
 */
const renderEmptyState = (container: HTMLElement): void => {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#9ca3af; text-align:center; padding:40px;">
      <div style="width:64px; height:64px; border-radius:50%; background:#f3f4f6; display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"/></svg>
      </div>
      <p style="font-size:14px; font-weight:700;">Önizlenecek içerik yok</p>
      <p style="font-size:12px; margin-top:4px;">Lütfen önce bir etkinlik oluşturun.</p>
    </div>
  `;
};
