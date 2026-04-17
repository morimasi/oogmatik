/**
 * Oogmatik Print Engine — Re-Export Hub
 *
 * Bu dosya geriye dönük uyumluluk içindir.
 * Asıl implementasyon src/utils/print/ dizinindeki modüllerde yaşar.
 *
 * Mevcut import yolları (`import { printService } from '../utils/printService'`)
 * bu dosya sayesinde kırılmadan çalışmaya devam eder.
 */

export {
  printService,
  type PaperSize,
  type PdfQuality,
  type PrintOptions,
  type PaperMargins,
  type PaperDimensions,
} from './print/index';
