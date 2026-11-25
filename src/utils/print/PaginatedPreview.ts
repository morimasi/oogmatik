/**
 * bdmind Print Engine — Akıllı Mizanpajlı Canlı Önizleme
 *
 * PrintPreviewModal, eskiden ekran sayfalarını 1:1 klonluyordu. Bu yüzden
 * önizlemede tek sayfa görünen içerik, yazdırmada ikiye bölünüyor ya da
 * taşan kısım görünmüyordu. Bu modül, yazdırma/PDF ile AYNI motoru
 * (buildExportPages) kullanarak önizlemeyi gerçeğe birebir eşitler.
 */

import type { PaperSize } from './types';
import { PAPER_DIMENSIONS, PAGE_SELECTORS } from './constants';
import { preloadFontsForCapture } from './CaptureEngine';
import { buildExportPages, releaseExportStage, DEFAULT_PRINT_MARGIN_MM } from './SmartLayout';

export interface PaginatedPreviewResult {
  /** Yazdırılacak toplam sayfa sayısı (mizanpaj sonrası) */
  totalPages: number;
  /** Önizlemede gösterilen kaynak sayfa sayısı */
  sourcePages: number;
  cleanup: () => void;
  scrollToPage: (index: number) => void;
}

const collectSourcePages = (selector: string): HTMLElement[] => {
  const roots = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
  const pages: HTMLElement[] = [];
  const selectorText = PAGE_SELECTORS.join(',');

  roots.forEach((root) => {
    if (root.matches(selectorText)) {
      pages.push(root);
      return;
    }
    const nested = Array.from(root.querySelectorAll(selectorText)) as HTMLElement[];
    if (nested.length > 0) pages.push(...nested);
    else pages.push(root);
  });

  return pages.filter(
    (page, index) => !pages.some((other, otherIndex) => otherIndex !== index && other.contains(page))
  );
};

const createPageBreakIndicator = (fromPage: number, toPage: number): HTMLElement => {
  const indicator = document.createElement('div');
  indicator.className = 'page-break-indicator no-print';
  indicator.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    max-width: 520px;
    padding: 2px 0;
    opacity: 0.45;
    user-select: none;
  `;
  indicator.innerHTML = `
    <div style="flex:1; height:1px; background:repeating-linear-gradient(90deg, #9ca3af 0, #9ca3af 4px, transparent 4px, transparent 8px);"></div>
    <span style="font-size:10px; font-weight:700; color:#9ca3af; letter-spacing:0.1em; font-family:Inter,sans-serif; white-space:nowrap;">
      Sayfa ${fromPage} → ${toPage}
    </span>
    <div style="flex:1; height:1px; background:repeating-linear-gradient(90deg, #9ca3af 0, #9ca3af 4px, transparent 4px, transparent 8px);"></div>
  `;
  return indicator;
};

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

/**
 * Mizanpajlı önizleme: yazdırma çıktısıyla aynı sayfa bölünmesini gösterir.
 */
export const renderPaginatedPreview = async (
  container: HTMLElement,
  paperSize: PaperSize,
  sourceSelector: string = '.worksheet-page, .a4-page, .universal-mode-canvas, .print-page'
): Promise<PaginatedPreviewResult> => {
  const emptyResult: PaginatedPreviewResult = {
    totalPages: 0,
    sourcePages: 0,
    cleanup: () => {},
    scrollToPage: () => {},
  };

  if (typeof document === 'undefined' || !container) return emptyResult;

  const sources = collectSourcePages(sourceSelector);
  if (sources.length === 0) {
    container.innerHTML = '';
    renderEmptyState(container);
    return emptyResult;
  }

  await preloadFontsForCapture();

  const exportPages = buildExportPages(sources, {
    paperSize,
    marginMm: DEFAULT_PRINT_MARGIN_MM,
    continuationLabel: 'Devam',
  });

  container.innerHTML = '';
  if (exportPages.length === 0) {
    renderEmptyState(container);
    releaseExportStage();
    return emptyResult;
  }

  const dims = PAPER_DIMENSIONS[paperSize] || PAPER_DIMENSIONS.A4;
  const paperWidthPx = parseFloat(dims.width) * 3.7795;
  const containerWidth = Math.max(240, container.clientWidth - 48);
  const scale = Math.min(1, containerWidth / paperWidthPx);
  const marginMm = exportPages[0].box.marginMm;

  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'preview-scroll-container';
  scrollContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 8px 0 24px;
  `;

  const pageRefs: HTMLElement[] = [];

  exportPages.forEach((exportPage, index) => {
    const pageWrapper = document.createElement('div');
    pageWrapper.className = 'preview-page-wrapper';
    pageWrapper.dataset.pageIndex = String(index);
    pageWrapper.style.cssText = `
      width: ${dims.width};
      min-height: ${dims.height};
      padding: ${marginMm}mm;
      box-sizing: border-box;
      background: #ffffff;
      overflow: hidden;
      position: relative;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      border-radius: 4px;
      border: 1px solid rgba(0,0,0,0.08);
      transform: scale(${scale});
      transform-origin: top center;
      margin-bottom: ${scale < 1 ? `${(1 - scale) * -parseFloat(dims.height) * 3.7795}px` : '0'};
    `;

    // Önizleme, dışa aktarma elemanlarını tüketmemeli → klonla
    const pageEl = exportPage.element.cloneNode(true) as HTMLElement;
    pageEl.style.setProperty('width', '100%', 'important');
    pageEl.style.setProperty('max-width', '100%', 'important');
    pageEl.style.setProperty('height', 'auto', 'important');
    pageEl.style.setProperty('min-height', '0', 'important');
    pageEl.style.setProperty('margin', '0', 'important');
    pageEl.style.setProperty('box-shadow', 'none', 'important');
    pageEl.style.setProperty('border', 'none', 'important');
    pageEl.style.setProperty('background-color', '#ffffff', 'important');

    pageWrapper.appendChild(pageEl);
    scrollContainer.appendChild(pageWrapper);
    pageRefs.push(pageWrapper);

    if (index < exportPages.length - 1) {
      scrollContainer.appendChild(createPageBreakIndicator(index + 1, index + 2));
    }
  });

  container.appendChild(scrollContainer);

  // Sayfalar taşındı; ölçüm sahnesini kapat
  releaseExportStage();

  return {
    totalPages: exportPages.length,
    sourcePages: sources.length,
    cleanup: () => {
      container.innerHTML = '';
    },
    scrollToPage: (index: number) => {
      const target = pageRefs[index];
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  };
};
