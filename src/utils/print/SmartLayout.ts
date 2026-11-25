/**
 * bdmind Print Engine — Akıllı Mizanpaj Motoru (Smart Layout v3.0)
 *
 * Problem: A4 sayfasına sığmayan içerik, tarayıcı veya piksel tabanlı PDF
 * dilimleyicisi tarafından rastgele bir satırdan kesiliyordu. Bir soru
 * yarıda kalıyor, kalanı anlamsız biçimde sonraki sayfaya taşıyordu.
 *
 * Çözüm: İçerik, GERÇEK DOM ölçümleriyle A4 sayfalarına paketlenir.
 *  - Kart / soru / tablo satırı / ızgara satırı asla ortadan bölünmez.
 *  - Sığmayan blok, tamamen bir sonraki sayfaya taşınır.
 *  - Tek başına sayfaya sığmayan ızgara/tablo SATIR bütünlüğünde bölünür
 *    (tablo başlığı her parçada tekrarlanır).
 *  - Tek parça halinde sayfaya sığmayan görsel/SVG bloklar, okunabilirliği
 *    koruyacak şekilde ölçeklenerek (scale-to-fit) tek sayfaya yerleştirilir.
 *  - Son sayfada tek kalan öğe olmasın diye sayfa dolguları dengelenir.
 *  - Devam sayfalarına "Devam" rozeti eklenir.
 *
 * Motor tamamen ölçüm tabanlıdır; jsdom gibi layout üretmeyen ortamlarda
 * (yükseklikler 0 döner) tek sayfa döndürerek güvenli biçimde devre dışı kalır.
 */

import type { PaperSize } from './types';
import { PAPER_DIMENSIONS } from './constants';

/** 96 DPI — CSS px / mm dönüşümü */
export const PX_PER_MM = 96 / 25.4;

/** Varsayılan yazdırma kenar boşluğu (mm) — @page margin ile aynı olmalı */
export const DEFAULT_PRINT_MARGIN_MM = 8;

/** Son sayfada kabul edilen minimum doluluk oranı (dengeleme eşiği) */
export const MIN_LAST_PAGE_FILL = 0.35;

/** Devam rozetinin kapladığı yaklaşık yükseklik (px) */
const CONTINUATION_CHIP_HEIGHT = 20;

/** Ölçüm toleransı — alt piksel yuvarlamalarında gereksiz bölmeyi önler */
const FIT_TOLERANCE = 1.005;

// ─── Sayfa Kutusu ───────────────────────────────────────────────────────────

export interface PageBox {
  /** Kağıt genişliği (px) */
  widthPx: number;
  /** Kağıt yüksekliği (px) */
  heightPx: number;
  /** Kenar boşlukları düşülmüş yazdırılabilir genişlik (px) */
  contentWidthPx: number;
  /** Kenar boşlukları düşülmüş yazdırılabilir yükseklik (px) */
  contentHeightPx: number;
  /** Kenar boşluğu (mm) */
  marginMm: number;
  /** Yatay (landscape) mi? */
  landscape: boolean;
}

/**
 * Kağıt tipine göre yazdırılabilir alanı hesaplar.
 * Yatay modda genişlik/yükseklik takas edilir.
 */
export const resolvePageBox = (
  paperSize: PaperSize = 'A4',
  marginMm: number = DEFAULT_PRINT_MARGIN_MM,
  landscape = false
): PageBox => {
  const dims = PAPER_DIMENSIONS[paperSize] ?? PAPER_DIMENSIONS.A4;
  let widthMm = parseFloat(dims.width);
  let heightMm = parseFloat(dims.height);
  if (!Number.isFinite(widthMm) || widthMm <= 0) widthMm = 210;
  if (!Number.isFinite(heightMm) || heightMm <= 0) heightMm = 297;
  if (landscape && widthMm < heightMm) {
    [widthMm, heightMm] = [heightMm, widthMm];
  }

  const safeMargin = Math.max(0, Math.min(marginMm, Math.min(widthMm, heightMm) / 4));

  // Alt piksel yuvarlaması yüzünden 1–2px'lik taşma, tarayıcının her sayfanın
  // sonuna boş sayfa eklemesine yol açıyordu. Kullanılabilir alanı 2px kırpıyoruz.
  return {
    widthPx: Math.round(widthMm * PX_PER_MM),
    heightPx: Math.round(heightMm * PX_PER_MM),
    contentWidthPx: Math.max(120, Math.floor((widthMm - safeMargin * 2) * PX_PER_MM) - 1),
    contentHeightPx: Math.max(160, Math.floor((heightMm - safeMargin * 2) * PX_PER_MM) - 2),
    marginMm: safeMargin,
    landscape,
  };
};

// ─── Saf (DOM'suz) Planlama Çekirdeği ───────────────────────────────────────

/**
 * Yükseklikleri verilen öğeleri, sayfa yüksekliğine göre sıralı gruplara böler.
 * Hiçbir öğe bölünmez: bir öğe sayfaya sığmıyorsa tek başına yeni gruba alınır.
 *
 * @returns Her eleman, `heights` dizisindeki indekslerden oluşan bir gruptur.
 */
export const chunkByHeights = (
  heights: number[],
  contentHeight: number,
  minFillRatio = 0
): number[][] => {
  if (!Array.isArray(heights) || heights.length === 0) return [];
  if (!Number.isFinite(contentHeight) || contentHeight <= 0) return [heights.map((_, i) => i)];

  const groups: number[][] = [];
  let current: number[] = [];
  let used = 0;
  // minFillRatio yalnızca dengeleme (rebalanceChunks) için anlamlıdır; paketleme
  // her zaman sayfayı mümkün olduğunca doldurur.
  void minFillRatio;

  heights.forEach((rawHeight, index) => {
    const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 0;

    if (current.length > 0 && used + height > contentHeight) {
      groups.push(current);
      current = [];
      used = 0;
    }

    current.push(index);
    used += height;
  });

  if (current.length > 0) groups.push(current);

  // Boş grupları temizle (teorik güvenlik)
  return groups.filter((g) => g.length > 0);
};

/**
 * Son sayfada tek başına kalan öğeleri önceki sayfadan kaydırarak dengeler.
 * Amaç: "tek soru için koca boş sayfa" görüntüsünü engellemek.
 */
export const rebalanceChunks = (
  groups: number[][],
  heights: number[],
  contentHeight: number,
  minFillRatio = MIN_LAST_PAGE_FILL
): number[][] => {
  if (!Array.isArray(groups) || groups.length < 2 || contentHeight <= 0) {
    return groups.map((g) => [...g]);
  }

  const result = groups.map((g) => [...g]);
  const usedOf = (group: number[]): number =>
    group.reduce((sum, i) => sum + Math.max(0, Number.isFinite(heights[i]) ? heights[i] : 0), 0);

  let guard = 0;
  while (guard < 500) {
    guard += 1;
    const last = result[result.length - 1];
    const previous = result[result.length - 2];
    if (!last || !previous || previous.length <= 1) break;
    if (usedOf(last) >= contentHeight * minFillRatio) break;

    const candidate = previous[previous.length - 1];
    const candidateHeight = Math.max(0, Number.isFinite(heights[candidate]) ? heights[candidate] : 0);
    if (usedOf(last) + candidateHeight > contentHeight) break;

    previous.pop();
    last.unshift(candidate);
  }

  return result.filter((g) => g.length > 0);
};

export interface BlockMeasure {
  /** Sayfa içerik alanının üstüne göre göreli konum (px) */
  top: number;
  /** Öğe yüksekliği (px) */
  height: number;
  /** Öğe bölünebilir mi? (ızgara/tablo satırları gibi) */
  splittable?: boolean;
  /** Bölünebilir öğe içindeki güvenli kesme noktaları (göreli top) */
  children?: Array<{ top: number; height: number }>;
}

/**
 * Bitmap dilimleme (PDF yedeği) için güvenli kesme noktalarını hesaplar.
 * Bir bloğun içinden geçmek zorunda kalırsa, blok içindeki satır sınırlarını
 * (children) tercih eder; asla rastgele bir satırdan kesmez.
 *
 * @returns [0, ...kesme noktaları, totalHeight] biçiminde artan ofsetler.
 */
export const planBreakOffsets = (
  blocks: BlockMeasure[],
  totalHeight: number,
  contentHeight: number,
  minFillRatio = 0.3
): number[] => {
  if (!Number.isFinite(totalHeight) || totalHeight <= 0) return [0];
  if (!Number.isFinite(contentHeight) || contentHeight <= 0) return [0, totalHeight];
  if (totalHeight <= contentHeight * FIT_TOLERANCE) return [0, totalHeight];

  const sorted = [...(blocks ?? [])]
    .filter((b) => Number.isFinite(b.top) && Number.isFinite(b.height) && b.height > 0)
    .sort((a, b) => a.top - b.top);

  const minFill = Math.max(48, contentHeight * Math.max(0, minFillRatio));
  const offsets: number[] = [0];
  let cursor = 0;
  let guard = 0;

  while (cursor + contentHeight < totalHeight - 2 && guard < 1000) {
    guard += 1;
    const ideal = cursor + contentHeight;
    const minBreak = cursor + minFill;
    const host = sorted.find((b) => b.top < ideal && b.top + b.height > ideal);

    let next = ideal;

    if (host) {
      const childBreaks = (host.children ?? [])
        .map((c) => c.top)
        .filter((t) => Number.isFinite(t) && t > minBreak && t <= ideal + 0.5);

      if (childBreaks.length > 0) {
        next = Math.max(...childBreaks);
      } else if (host.top > minBreak) {
        // Bloğu bölmek yerine tamamını sonraki sayfaya taşı
        next = host.top;
      }
    }

    // İlerleme garantisi
    if (next <= cursor + 24) next = Math.min(totalHeight, cursor + contentHeight);
    if (next >= totalHeight - 1) {
      offsets.push(totalHeight);
      break;
    }

    offsets.push(next);
    cursor = next;
  }

  if (offsets[offsets.length - 1] < totalHeight - 1) offsets.push(totalHeight);
  return offsets;
};

// ─── DOM Yardımcıları ───────────────────────────────────────────────────────

const EXPORT_STAGE_ID = 'bdmind-export-stage';

const nextFrame = (): Promise<void> =>
  new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });

/** Export ölçüm sahnesini hazırlar (ekran dışı, tam kağıt genişliğinde). */
export const ensureExportStage = (widthPx: number): HTMLElement => {
  let stage = document.getElementById(EXPORT_STAGE_ID);
  if (!stage) {
    stage = document.createElement('div');
    stage.id = EXPORT_STAGE_ID;
    stage.setAttribute('aria-hidden', 'true');
    document.body.appendChild(stage);
  }
  stage.style.cssText =
    `position:fixed;left:-100000px;top:0;width:${Math.max(200, widthPx)}px;height:auto;` +
    'background:#ffffff;z-index:0;pointer-events:none;overflow:visible;';
  return stage;
};

/** Export sahnesini temizler. Çağıran, sayfaları taşıdıktan sonra çağırmalıdır. */
export const releaseExportStage = (): void => {
  if (typeof document === 'undefined') return;
  const stage = document.getElementById(EXPORT_STAGE_ID);
  if (!stage) return;
  stage.innerHTML = '';
  stage.remove();
};

const isHiddenForPrint = (el: HTMLElement): boolean => {
  const cls = typeof el.className === 'string' ? el.className : '';
  return (
    el.classList.contains('no-print') ||
    el.classList.contains('resize-handle') ||
    el.classList.contains('action-button') ||
    el.classList.contains('edit-handle') ||
    el.hasAttribute('data-design-only') ||
    cls.includes('no-print')
  );
};

const stripNonPrintContent = (root: HTMLElement): void => {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>('*'));
  candidates.forEach((el) => {
    if (isHiddenForPrint(el)) el.remove();
  });
  Array.from(root.querySelectorAll('button')).forEach((btn) => btn.remove());
};

/**
 * Klonlanan form alanlarının canlı değerlerini attribute'a taşır.
 * cloneNode() kullanıcı girdisini taşımadığı için bu adım zorunludur.
 */
const syncFormState = (root: HTMLElement): void => {
  Array.from(root.querySelectorAll('input, textarea, select')).forEach((node) => {
    const el = node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox' || el.type === 'radio') {
        if (el.checked) el.setAttribute('checked', 'checked');
        else el.removeAttribute('checked');
      } else {
        el.setAttribute('value', el.value);
      }
      return;
    }
    if (el instanceof HTMLTextAreaElement) {
      el.textContent = el.value;
      return;
    }
    const select = el as HTMLSelectElement;
    Array.from(select.options).forEach((opt) => {
      if (opt.selected) opt.setAttribute('selected', 'selected');
      else opt.removeAttribute('selected');
    });
  });
};

/** Sayfa klonunu yazdırma geometrisine sabitler. */
const normalizePageClone = (clone: HTMLElement, box: PageBox): void => {
  clone.classList.remove('hidden', 'invisible', 'opacity-0', 'd-none');
  const set = (prop: string, value: string) => clone.style.setProperty(prop, value, 'important');
  set('width', `${box.contentWidthPx}px`);
  set('max-width', `${box.contentWidthPx}px`);
  set('height', 'auto');
  set('min-height', '0');
  set('max-height', 'none');
  set('margin', '0');
  set('padding', '0');
  set('overflow', 'visible');
  set('box-shadow', 'none');
  set('border', 'none');
  set('transform', 'none');
  set('zoom', '1');
  set('background-color', '#ffffff');
  set('color-scheme', 'light');
  set('display', 'block');
  set('position', 'relative');
  set('box-sizing', 'border-box');
};

/**
 * İçeriği gizleyen (overflow:hidden) kapları açar.
 * Fascicle/Studio sayfalarındaki `h-[297mm] overflow-hidden` kilidi
 * yüzünden taşan içerik kayboluyordu; bu adım onu akışa geri verir.
 */
const releaseClippedDescendants = (root: HTMLElement): void => {
  if (typeof window === 'undefined') return;
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('*'));
  nodes.forEach((el) => {
    if (isHiddenForPrint(el)) return;
    let cs: CSSStyleDeclaration;
    try {
      cs = window.getComputedStyle(el);
    } catch {
      return;
    }
    const overflowY = cs.overflowY || cs.overflow;
    const clipped = overflowY === 'hidden' || overflowY === 'clip' || overflowY === 'auto' || overflowY === 'scroll';
    if (!clipped) return;
    if (el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0) {
      el.style.setProperty('overflow', 'visible', 'important');
      el.style.setProperty('max-height', 'none', 'important');
      el.style.setProperty('height', 'auto', 'important');
    }
  });
};

/**
 * Kağıt yüksekliğinden büyük `min-height` kilplerini kaldırır.
 * Bazı studyolar sayfaya `minHeight: 297mm` veriyor; bu kilit basılan sayfayı
 * 8mm marjdan dolayı taşırıp her çıktının sonuna boş sayfa ekliyordu.
 */
const releaseOversizedMinimumHeights = (root: HTMLElement, maxHeightPx: number): void => {
  if (typeof window === 'undefined') return;
  const nodes = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
  nodes.forEach((el) => {
    try {
      const cs = window.getComputedStyle(el);
      const minHeight = parseFloat(cs.minHeight);
      if (Number.isFinite(minHeight) && minHeight > maxHeightPx * 0.98) {
        el.style.setProperty('min-height', '0', 'important');
      }
    } catch {
      /* ölçüm yapılamadı */
    }
  });
};

/** Canvas bitmap'lerini <img>'e çevirir (klonlarda bitmap kaybolur). */
const flattenCanvases = (root: HTMLElement): void => {
  const canvases = Array.from(root.querySelectorAll('canvas'));
  canvases.forEach((canvas) => {
    if (!canvas.width || !canvas.height) return;
    let dataUrl = '';
    try {
      dataUrl = canvas.toDataURL('image/png');
    } catch {
      return;
    }
    if (!dataUrl || !dataUrl.startsWith('data:')) return;
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = '';
    img.className = canvas.className;
    img.style.cssText = canvas.style.cssText;
    img.style.width = `${canvas.width}px`;
    img.style.height = `${canvas.height}px`;
    img.style.maxWidth = '100%';
    img.style.objectFit = 'contain';
    canvas.replaceWith(img);
  });
};

const measureOuterHeight = (el: HTMLElement): number => {
  if (typeof window === 'undefined') return 0;
  const rect = el.getBoundingClientRect();
  let mt = 0;
  let mb = 0;
  try {
    const cs = window.getComputedStyle(el);
    mt = parseFloat(cs.marginTop) || 0;
    mb = parseFloat(cs.marginBottom) || 0;
  } catch {
    /* ölçüm yok */
  }
  return Math.max(0, rect.height + mt + mb);
};

/** Akışa girmeyen (absolute/fixed) süsleme katmanlarını ayıklar. */
const isFlowChild = (el: HTMLElement): boolean => {
  if (el.hidden) return false;
  try {
    const cs = window.getComputedStyle(el);
    if (cs.position === 'absolute' || cs.position === 'fixed') return false;
    if (cs.display === 'none') return false;
  } catch {
    /* devam */
  }
  return true;
};

/**
 * Sayfanın asıl içerik konteynerini bulur.
 * Önce açık işaret (`data-page-content`, `.print-content-area`),
 * yoksa tek çocuklu sarmalayıcı zinciri aşağı inilir.
 */
const findContentRoot = (page: HTMLElement): HTMLElement => {
  const explicit = page.querySelector<HTMLElement>('[data-page-content="true"], .print-content-area');
  if (explicit) return explicit;

  let node: HTMLElement = page;
  for (let depth = 0; depth < 6; depth += 1) {
    const children = Array.from(node.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement && !isHiddenForPrint(c)
    );
    if (children.length !== 1) break;
    node = children[0];
  }
  return node;
};

/** Izgara çocuklarını görsel satırlara gruplar (offsetTop tabanlı). */
const groupChildrenIntoRows = (kids: HTMLElement[]): HTMLElement[][] => {
  const rows: HTMLElement[][] = [];
  let currentTop: number | null = null;
  kids.forEach((kid) => {
    const top = kid.offsetTop;
    if (currentTop === null || Math.abs(top - currentTop) > 2) {
      rows.push([kid]);
      currentTop = top;
    } else {
      rows[rows.length - 1].push(kid);
    }
  });
  return rows;
};

const buildGridPart = (grid: HTMLElement, rows: HTMLElement[][]): HTMLElement => {
  const part = grid.cloneNode(false) as HTMLElement;
  try {
    const cs = window.getComputedStyle(grid);
    if (cs.gridTemplateColumns && cs.gridTemplateColumns !== 'none') {
      part.style.gridTemplateColumns = cs.gridTemplateColumns;
    }
    if (cs.gap) part.style.gap = cs.gap;
    if (cs.display) part.style.display = cs.display;
  } catch {
    /* devam */
  }
  rows.forEach((row) => row.forEach((cell) => part.appendChild(cell.cloneNode(true))));
  return part;
};

/**
 * Tek başına sayfaya sığmayan bir bloğu akıllıca böler.
 * 1) Izgara → satır bütünlüğü
 * 2) Tablo → satır bütünlüğü + başlık tekrarı
 * 3) Tek parça → ölçekleyerek sığdırma (okunabilirlik korunur)
 */
const splitOversizedElement = (el: HTMLElement, box: PageBox): HTMLElement[] => {
  const contentHeight = box.contentHeightPx;
  const kids = Array.from(el.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && isFlowChild(c)
  );

  let display = '';
  let rowGap = 0;
  try {
    const cs = window.getComputedStyle(el);
    display = cs.display || '';
    rowGap = parseFloat(cs.rowGap) || 0;
  } catch {
    /* devam */
  }

  // 1) CSS Grid / kart ızgarası → satır bütünlüğü
  const looksLikeGrid =
    display.includes('grid') ||
    (typeof el.className === 'string' && el.className.includes('grid-cols'));
  if (looksLikeGrid && kids.length > 1) {
    const rows = groupChildrenIntoRows(kids);
    if (rows.length > 1) {
      const rowHeights = rows.map((row) => {
        const tallest = Math.max(...row.map((cell) => cell.offsetHeight || 0));
        return Math.max(1, tallest + rowGap);
      });
      const rowGroups = rebalanceChunks(
        chunkByHeights(rowHeights, contentHeight),
        rowHeights,
        contentHeight
      );
      if (rowGroups.length > 1) {
        return rowGroups.map((group) =>
          buildGridPart(el, group.map((rowIndex) => rows[rowIndex]))
        );
      }
    }
  }

  // 2) Tablo → satır bütünlüğü, başlık her parçada
  const table = (el.tagName === 'TABLE' ? el : el.querySelector('table')) as HTMLTableElement | null;
  if (table) {
    const bodyRows = Array.from(table.querySelectorAll('tbody tr')) as HTMLElement[];
    const allRows = bodyRows.length > 0
      ? bodyRows
      : (Array.from(table.querySelectorAll('tr')) as HTMLElement[]);
    const head = table.querySelector('thead');
    if (allRows.length > 1) {
      const headHeight = head ? measureOuterHeight(head as HTMLElement) : 0;
      const rowHeights = allRows.map((row) => Math.max(1, row.getBoundingClientRect().height || 0));
      const rowGroups = rebalanceChunks(
        chunkByHeights(rowHeights, Math.max(80, contentHeight - headHeight - 4)),
        rowHeights,
        Math.max(80, contentHeight - headHeight - 4)
      );
      if (rowGroups.length > 1) {
        return rowGroups.map((group) => {
          const wrapper = document.createElement('div');
          wrapper.style.width = '100%';
          const part = table.cloneNode(false) as HTMLTableElement;
          part.style.width = '100%';
          if (head) part.appendChild(head.cloneNode(true));
          const tbody = document.createElement('tbody');
          group.forEach((rowIndex) => tbody.appendChild(allRows[rowIndex].cloneNode(true)));
          part.appendChild(tbody);
          wrapper.appendChild(part);
          return wrapper;
        });
      }
    }
  }

  // 3) Tek parça → ölçekleyerek sığdır (en fazla %50 küçültme)
  const measured = measureOuterHeight(el);
  if (measured > contentHeight && measured <= contentHeight * 1.5) {
    const scale = contentHeight / measured;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `width:100%;height:${Math.round(contentHeight)}px;overflow:hidden;`;
    const scaled = el.cloneNode(true) as HTMLElement;
    scaled.style.setProperty('transform-origin', 'top left', 'important');
    scaled.style.setProperty('transform', `scale(${scale})`, 'important');
    scaled.style.setProperty('width', `${100 / scale}%`, 'important');
    scaled.style.setProperty('max-width', 'none', 'important');
    wrapper.appendChild(scaled);
    return [wrapper];
  }

  // Bölünemez ve ölçeklenemez: olduğu gibi bırak (tarayıcı akışına bırakılır)
  return [el];
};

// ─── Sayfa Üretimi ──────────────────────────────────────────────────────────

export interface PaginateOptions {
  paperSize?: PaperSize;
  marginMm?: number;
  landscape?: boolean;
  /** Devam sayfalarında gösterilecek etiket (boş → rozet eklenmez) */
  continuationLabel?: string;
}

export interface ExportPage {
  /** Yazdırılmaya/PDF'e alınacak, kağıda tam oturan sayfa elemanı */
  element: HTMLElement;
  /** 1 tabanlı sıra numarası */
  index: number;
  /** Toplam sayfa sayısı */
  total: number;
  /** Kaynak (ekran) sayfasının indeksi */
  sourceIndex: number;
  /** Kaynak sayfanın devamı mı? */
  isContinuation: boolean;
  box: PageBox;
}

const addContinuationChip = (page: HTMLElement, label: string, pageNumber: number, total: number): void => {
  const chip = document.createElement('div');
  chip.className = 'bdmind-continuation-chip';
  chip.setAttribute('data-print-piece', 'continuation');
  chip.textContent = `${label} · ${pageNumber}/${total}`;
  chip.style.cssText = [
    'display:block',
    'width:100%',
    'box-sizing:border-box',
    'font-family:Lexend,Inter,sans-serif',
    'font-size:8pt',
    'font-weight:700',
    'letter-spacing:0.04em',
    'color:#64748b',
    'text-align:right',
    'padding:0 0 2mm 0',
    'margin:0 0 1mm 0',
    'border-bottom:1px dashed #cbd5e1',
  ].join(';');
  page.insertBefore(chip, page.firstChild);
};

const createPageShell = (
  sourceClone: HTMLElement,
  contentRoot: HTMLElement,
  nodes: HTMLElement[]
): { shell: HTMLElement; root: HTMLElement } => {
  const shell = sourceClone.cloneNode(true) as HTMLElement;
  let root: HTMLElement;
  if (contentRoot === sourceClone) {
    root = shell;
  } else {
    const path = buildChildPath(sourceClone, contentRoot);
    root = (resolveChildPath(shell, path) ?? shell) as HTMLElement;
  }
  root.innerHTML = '';
  nodes.forEach((node) => root.appendChild(node.cloneNode(true)));
  return { shell, root };
};

const buildChildPath = (root: HTMLElement, target: HTMLElement): number[] => {
  const path: number[] = [];
  let node: HTMLElement | null = target;
  while (node && node !== root) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) return [];
    path.unshift(Array.from(parent.children).indexOf(node));
    node = parent;
  }
  return path;
};

const resolveChildPath = (root: HTMLElement, path: number[]): HTMLElement | null => {
  let node: HTMLElement | null = root;
  for (const index of path) {
    if (!node) return null;
    const child: Element | undefined = node.children[index];
    node = child instanceof HTMLElement ? child : null;
  }
  return node;
};

/**
 * Tek bir sayfa elemanını (klon) A4 sınırlarına göre akıllıca böler.
 * Sayfa zaten sığıyorsa aynı elemanı tek elemanlı dizi olarak döndürür.
 */
const paginatePageElement = (
  page: HTMLElement,
  box: PageBox,
  stage: HTMLElement,
  continuationLabel: string,
  sourceIndex: number
): HTMLElement[] => {
  const contentRoot = findContentRoot(page);
  const pageHeight = Math.max(page.scrollHeight, page.getBoundingClientRect().height);
  const contentRootHeight = Math.max(contentRoot.scrollHeight, contentRoot.getBoundingClientRect().height);
  const totalHeight = Math.max(pageHeight, contentRootHeight);
  if (totalHeight <= box.contentHeightPx * FIT_TOLERANCE) return [page];

  // Sayfa başlığı / pedagojik not / üst-alt boşluklar da kağıttan yer kaplar.
  // İçerik konteynerinin dışında kalan bu "chrome" yüksekliği düşülmezse
  // her yeni sayfa taşar ve yeniden bölünme (sonsuz kesme) oluşur.
  const chromeHeight = Math.max(0, pageHeight - contentRootHeight);
  const availableHeight =
    box.contentHeightPx - chromeHeight > 220 ? box.contentHeightPx - chromeHeight : Math.round(box.contentHeightPx * 0.9);

  const blocks = Array.from(contentRoot.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && isFlowChild(c)
  );
  if (blocks.length === 0) return [page];

  // 1) Öğeleri ölç ve gerekirse ayrı ayrı parçala
  interface Piece {
    element: HTMLElement;
    height: number;
  }
  const pieces: Piece[] = [];

  blocks.forEach((block) => {
    const height = measureOuterHeight(block);
    if (height > availableHeight) {
      const parts = splitOversizedElement(block, box);
      parts.forEach((part) => {
        // Ölçüm için sahneye geçici olarak ekle
        if (!part.isConnected) stage.appendChild(part);
        pieces.push({ element: part, height: Math.max(1, measureOuterHeight(part)) });
      });
      if (block.isConnected) block.remove();
      return;
    }
    pieces.push({ element: block, height });
  });

  if (pieces.length === 0) return [page];

  // 2) İlk deneme: başlık/chrome düşülmüş kullanılabilir yükseklik
  let heights = pieces.map((p) => p.height);
  let groups = rebalanceChunks(chunkByHeights(heights, availableHeight), heights, availableHeight);

  // 3) Birden fazla sayfa varsa devam rozeti için yer ayır ve yeniden paketle
  if (groups.length > 1) {
    const reserved = Math.max(160, availableHeight - CONTINUATION_CHIP_HEIGHT);
    heights = pieces.map((p) => p.height);
    groups = rebalanceChunks(chunkByHeights(heights, reserved), heights, reserved);
  }

  // 4) Her grup için yeni sayfa kabuğu üret
  const pages: HTMLElement[] = [];
  groups.forEach((group, groupIndex) => {
    const nodes = group.map((i) => pieces[i].element);
    const { shell } = createPageShell(page, contentRoot, nodes);
    pages.push(shell);
  });

  if (pages.length <= 1) return [page];

  // 5) Devam rozetleri
  pages.forEach((shell, i) => {
    if (i > 0 && continuationLabel) {
      addContinuationChip(shell, continuationLabel, i + 1, pages.length);
    }
    shell.dataset.printSource = String(sourceIndex);
    shell.dataset.printPiece = String(i + 1);
  });

  return pages;
};

/**
 * Kaynak sayfaları yazdırmaya hazır, kağıda tam oturan sayfalara dönüştürür.
 *
 * Senkron çalışır (ölçüm için layout zorlanır); çağıran taraf fontların
 * yüklendiğinden emin olmalıdır (`preloadFontsForCapture`).
 *
 * Dönen elemanlar ekran dışı sahneye bağlıdır; iş bitince
 * `releaseExportStage()` çağrılmalıdır.
 */
export const buildExportPages = (
  sourcePages: HTMLElement[],
  options: PaginateOptions = {}
): ExportPage[] => {
  if (typeof document === 'undefined' || !Array.isArray(sourcePages) || sourcePages.length === 0) {
    return [];
  }

  const paperSize = options.paperSize ?? 'A4';
  const landscape =
    options.landscape ??
    sourcePages.some(
      (p) => p.classList.contains('landscape') || p.classList.contains('orientation-landscape')
    );
  const box = resolvePageBox(paperSize, options.marginMm ?? DEFAULT_PRINT_MARGIN_MM, landscape);
  const stage = ensureExportStage(box.contentWidthPx);
  const continuationLabel = options.continuationLabel ?? 'Devam';

  const collected: Array<{ element: HTMLElement; sourceIndex: number; isContinuation: boolean }> = [];

  sourcePages.forEach((source, sourceIndex) => {
    try {
      syncFormState(source);
      const clone = source.cloneNode(true) as HTMLElement;
      stripNonPrintContent(clone);
      normalizePageClone(clone, box);
      stage.appendChild(clone);
      releaseClippedDescendants(clone);
      // Layout'u zorla (ölçüm için)
      void clone.offsetHeight;

      const pieces = paginatePageElement(clone, box, stage, continuationLabel, sourceIndex);
      pieces.forEach((piece, pieceIndex) => {
        if (!piece.isConnected) stage.appendChild(piece);
        collected.push({
          element: piece,
          sourceIndex,
          isContinuation: pieceIndex > 0,
        });
      });
      if (clone.isConnected && !pieces.includes(clone)) clone.remove();
    } catch {
      // Tek sayfa hatası tüm dışa aktarmayı düşürmemeli
      collected.push({ element: source, sourceIndex, isContinuation: false });
    }
  });

  // Kağıda sığmayan min-height kilitlerini temizle (boş sayfa önlemi)
  collected.forEach(({ element }) => {
    if (!sourcePages.includes(element)) {
      releaseOversizedMinimumHeights(element, box.contentHeightPx);
    }
  });

  // Canvas bitmap'lerini koru (canlı sayfaya asla dokunma)
  collected.forEach(({ element }) => {
    if (!sourcePages.includes(element)) flattenCanvases(element);
  });

  const total = collected.length;
  return collected.map((item, i) => ({
    element: item.element,
    index: i + 1,
    total,
    sourceIndex: item.sourceIndex,
    isContinuation: item.isContinuation,
    box,
  }));
};

/** Fontların hazır olmasını bekler ve bir kare boyama süresi tanır. */
export const waitForStableLayout = async (): Promise<void> => {
  if (typeof document === 'undefined') return;
  try {
    if ('fonts' in document) {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    }
  } catch {
    /* devam */
  }
  await nextFrame();
  await nextFrame();
};
