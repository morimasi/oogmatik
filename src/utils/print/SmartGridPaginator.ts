/**
 * bdmind Print Engine — Akıllı DOM & Izgara Sayfalama Motoru
 * Uzun konteynerleri ve taşan CSS Grid / Tablo yapılarını
 * satır ve kart bütünlüğünü koruyarak A4 sayfalarına böler.
 */

import type { PaperSize } from './types';
import { PAPER_DIMENSIONS } from './constants';

const PX_PER_MM = 96 / 25.4;

const createMeasureSandbox = (widthPx: number): HTMLElement => {
  const sandbox = document.createElement('div');
  sandbox.style.cssText = `
    position: fixed;
    left: -99999px;
    top: 0;
    width: ${widthPx}px;
    height: auto;
    overflow: visible;
    visibility: hidden;
    pointer-events: none;
    box-sizing: border-box;
  `;
  document.body.appendChild(sandbox);
  return sandbox;
};

const createPageShell = (source: HTMLElement, widthPx: number, pageHeightPx: number, marginPx: number): HTMLElement => {
  const page = document.createElement('div');
  page.className = source.className;
  page.style.cssText = source.style.cssText;
  page.style.width = `${widthPx}px`;
  page.style.minHeight = `${pageHeightPx}px`;
  page.style.height = 'auto';
  page.style.overflow = 'visible';
  page.style.padding = `${marginPx}px`;
  page.style.boxSizing = 'border-box';
  return page;
};

const isGridElement = (el: HTMLElement): boolean => {
  const cls = el.className?.toString() || '';
  return (
    cls.includes('grid') ||
    cls.includes('grid-cols') ||
    window.getComputedStyle(el).display === 'grid'
  );
};

/**
 * Bir CSS Grid elemanını satır/kolon düzenini koruyarak parçalara böler.
 */
const splitGridElement = (
  gridEl: HTMLElement,
  maxFirstPageHeight: number,
  fullPageHeight: number,
  widthPx: number
): HTMLElement[] => {
  const items = Array.from(gridEl.children) as HTMLElement[];
  if (items.length <= 1) return [gridEl.cloneNode(true) as HTMLElement];

  const cs = window.getComputedStyle(gridEl);
  const templateCols = cs.gridTemplateColumns;

  const sandbox = createMeasureSandbox(widthPx);
  const chunks: HTMLElement[] = [];

  try {
    let currentGrid = gridEl.cloneNode(false) as HTMLElement;
    if (templateCols && templateCols !== 'none') {
      currentGrid.style.gridTemplateColumns = templateCols;
    }
    sandbox.appendChild(currentGrid);

    items.forEach((item) => {
      const itemClone = item.cloneNode(true) as HTMLElement;
      currentGrid.appendChild(itemClone);

      const limit = chunks.length === 0 ? maxFirstPageHeight : fullPageHeight;
      if (currentGrid.scrollHeight > limit && currentGrid.children.length > 1) {
        currentGrid.removeChild(itemClone);
        chunks.push(currentGrid);

        currentGrid = gridEl.cloneNode(false) as HTMLElement;
        if (templateCols && templateCols !== 'none') {
          currentGrid.style.gridTemplateColumns = templateCols;
        }
        sandbox.innerHTML = '';
        sandbox.appendChild(currentGrid);
        currentGrid.appendChild(itemClone);
      }
    });

    if (currentGrid.children.length > 0) {
      chunks.push(currentGrid);
    }
  } finally {
    document.body.removeChild(sandbox);
  }

  return chunks;
};

/**
 * Verilen root elemanlarını A4 (veya seçili kağıt boyutu) sayfalarına akıllıca böler.
 * Tekil ölçüm sandbox'ı kullanarak layout thrashing'i minimize eder.
 */
export const paginateDomContent = async (
  roots: HTMLElement[],
  paperSize: PaperSize = 'A4'
): Promise<HTMLElement[]> => {
  if (typeof document === 'undefined' || roots.length === 0) return roots;

  const dims = PAPER_DIMENSIONS[paperSize] || PAPER_DIMENSIONS.A4;
  const heightMm = parseFloat(dims.height);
  const widthMm = parseFloat(dims.width);
  const widthPx = widthMm * PX_PER_MM;
  const pageHeightPx = heightMm * PX_PER_MM;
  const marginPx = 8 * PX_PER_MM;
  const contentHeightPx = pageHeightPx - marginPx * 2;

  const result: HTMLElement[] = [];

  for (const root of roots) {
    const sandbox = createMeasureSandbox(widthPx);
    try {
      const measureClone = root.cloneNode(true) as HTMLElement;
      measureClone.style.width = `${widthPx}px`;
      measureClone.style.height = 'auto';
      measureClone.style.padding = `${marginPx}px`;
      measureClone.style.boxSizing = 'border-box';
      sandbox.appendChild(measureClone);

      if (measureClone.scrollHeight <= pageHeightPx * 1.02) {
        result.push(root);
        continue;
      }

      const children = Array.from(measureClone.children) as HTMLElement[];
      const pageSandbox = createMeasureSandbox(widthPx);
      try {
        let currentPage = createPageShell(root, widthPx, pageHeightPx, marginPx);
        pageSandbox.appendChild(currentPage);

        for (const child of children) {
          const childClone = child.cloneNode(true) as HTMLElement;
          currentPage.appendChild(childClone);

          if (currentPage.scrollHeight > contentHeightPx) {
            const currentCount = currentPage.children.length;
            currentPage.removeChild(childClone);

            // Eğer taşan eleman bir grid ise, satır/kart bütünlüğünü koruyarak böl
            if (isGridElement(child) && child.children.length > 1) {
              const usedHeight = currentPage.scrollHeight;
              const remaining = Math.max(120, contentHeightPx - usedHeight);
              const gridChunks = splitGridElement(child, remaining, contentHeightPx, widthPx - marginPx * 2);

              gridChunks.forEach((chunk, idx) => {
                if (idx === 0 && currentCount > 0 && remaining >= 160) {
                  currentPage.appendChild(chunk);
                  if (currentPage.scrollHeight <= contentHeightPx) {
                    return;
                  }
                  currentPage.removeChild(chunk);
                }
                if (currentPage.children.length > 0) {
                  result.push(currentPage);
                  currentPage = createPageShell(root, widthPx, pageHeightPx, marginPx);
                  pageSandbox.innerHTML = '';
                  pageSandbox.appendChild(currentPage);
                }
                currentPage.appendChild(chunk);
              });
              continue;
            }

            if (currentCount > 0) {
              result.push(currentPage);
              currentPage = createPageShell(root, widthPx, pageHeightPx, marginPx);
              pageSandbox.innerHTML = '';
              pageSandbox.appendChild(currentPage);
            }
            currentPage.appendChild(childClone);
          }
        }

        if (currentPage.children.length > 0) {
          result.push(currentPage);
        }
      } finally {
        document.body.removeChild(pageSandbox);
      }
    } finally {
      document.body.removeChild(sandbox);
    }
  }

  return result;
};
