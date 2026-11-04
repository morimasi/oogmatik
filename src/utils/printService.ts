/**
 * bdmind Print Engine — Re-Export Hub
 *
 * Bu dosya geriye dönük uyumluluk içindir.
 * Asıl implementasyon src/utils/print/ dizinindeki modüllerde yaşar.
 * waitForOverlayImages uses img.decode() and decode() with timeout 5000 ms.
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
