/**
 * bdmind Print Engine — Sabitler
 * Kağıt boyutları, CSS seçiciler ve yapılandırma sabitleri.
 */

import type { PaperSize, PaperMargins, PaperDimensions } from './types';

/** Kağıt boyutu → fiziksel ölçüler (mm) */
export const PAPER_DIMENSIONS: Record<PaperSize, PaperDimensions> = {
  A4: { width: '210mm', height: '297mm' },
  Letter: { width: '216mm', height: '279mm' },
  Legal: { width: '216mm', height: '356mm' },
  Extreme_Yatay: { width: '297mm', height: '210mm' },
  Extreme_Dikey: { width: '210mm', height: '297mm' },
};

/** Kağıt boyutu → kenar boşlukları */
export const PAPER_MARGINS: Record<PaperSize, PaperMargins> = {
  A4: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' },
  Letter: { top: '12mm', bottom: '12mm' },
  Legal: { top: '15mm', bottom: '15mm' },
  Extreme_Yatay: { top: '5mm', bottom: '5mm', left: '5mm', right: '5mm' },
  Extreme_Dikey: { top: '5mm', bottom: '5mm', left: '5mm', right: '5mm' },
};

/** A4 sayfası CSS sınıf seçicileri — yazdırılabilir sayfa elemanları */
export const PAGE_SELECTORS = [
  '.worksheet-page',
  '.universal-mode-canvas',
  '.math-canvas-page',
  '.reading-canvas-page',
  '.a4-page',
  '.print-page',
  '.print-exact',
  '.super-reading-preview-area .a4-page', // Super Türkçe çoklu sayfa desteği
] as const;

/** Yazdırmada gizlenecek UI elemanları */
export const UI_HIDE_SELECTORS =
  '.edit-handle, .page-navigator, .no-print, .overlay-ui, .resize-handle, .action-button';

/** Enjekte edilen print style elementinin DOM ID'si */
export const PRINT_STYLE_ID = 'bdmind-print-style';

/** Tüm sayfaları render ettirmek için dispatch edilen event adı */
export const RENDER_ALL_EVENT = 'bdmind:render-all-pages';

/** PDF kalitesi → html2canvas scale haritası */
export const QUALITY_SCALE_MAP: Record<'standard' | 'high' | 'print', number> = {
  standard: 1.5,
  high: 2,
  print: 3,
};

/** A4 genişliği piksel (96 DPI) */
export const A4_WIDTH_PX = 794;

/** @page { margin: 5mm } kullanıldığında yazdırılabilir genişlik (200mm @ 96DPI) */
export const PRINTABLE_A4_WIDTH_PX = 756;
