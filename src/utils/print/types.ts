/**
 * Oogmatik Print Engine — Merkezi Tip Tanımları
 * Tüm yazdırma/PDF/önizleme modülleri bu tipleri kullanır.
 */

/** Desteklenen kağıt boyutları */
export type PaperSize = 'A4' | 'Letter' | 'Legal' | 'Extreme_Yatay' | 'Extreme_Dikey';

/** PDF kalitesi — html2canvas scale değerini belirler */
export type PdfQuality = 'standard' | 'high' | 'print';

/** Kağıt kenar boşlukları */
export interface PaperMargins {
  top: string;
  bottom: string;
  left?: string;
  right?: string;
}

/** Yazdırma seçenekleri — tüm print ve PDF metodlarında kullanılır */
export interface PrintOptions {
  action?: 'print' | 'download';
  selectedPages?: number[];
  grayscale?: boolean;
  worksheetData?: Record<string, unknown>[];
  compact?: boolean;
  columnsPerPage?: 1 | 2;
  fontSize?: 10 | 11 | 12;
  paperSize?: PaperSize;
  /** html2canvas capture modu: true = her sayfayı canvas olarak yakala (varsayılan: true) */
  useCapture?: boolean;
  /** PDF kalitesi */
  quality?: PdfQuality;
  /** İlerleme callback'i (0-100 arasında yüzde) */
  onProgress?: (percent: number, message: string) => void;
  /** Tema renklerini PDF'de koru (varsayılan: false - siyah-beyaz) */
  preserveTheme?: boolean;
}

/** Kağıt fiziksel boyutları (mm cinsinden CSS değerleri) */
export interface PaperDimensions {
  width: string;
  height: string;
}
