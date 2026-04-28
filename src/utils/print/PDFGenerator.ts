/**
 * Oogmatik Print Engine — PDF Üretim Modülü
 * html2canvas + jsPDF ile gerçek PDF dosyası üretir.
 */

import type { PaperSize, PdfQuality } from './types';
import { PAPER_DIMENSIONS, QUALITY_SCALE_MAP } from './constants';
import {
  preloadFontsForCapture,
  collectPages,
  hasRenderableContent,
  hideUIElements,
  capturePage,
} from './CaptureEngine';
import { forceRenderAllPages, clearRenderAllPagesFlag } from './CSSInjector';

import { logInfo, logError, logWarn } from '../../utils/logger.js';
export interface RealPdfOptions {
  paperSize?: PaperSize;
  quality?: PdfQuality;
  onProgress?: (percent: number, message: string) => void;
}

/**
 * GERÇEK PDF MOTORU v2.0
 * html2canvas ile her sayfayı yakalar → jsPDF ile tek PDF dosyasına birleştirir.
 * Tüm platformlarda çalışır: PC, Tablet, Telefon.
 */
export const generateRealPdf = async (
  rootSelector: string,
  title: string = 'Oogmatik_Etkinlik',
  options?: RealPdfOptions
): Promise<Blob | null> => {
  await forceRenderAllPages();
  try {
    const paperSize = options?.paperSize ?? 'A4';
    const quality = options?.quality ?? 'high';
    const onProgress = options?.onProgress;
    const captureScale = QUALITY_SCALE_MAP[quality];

    // Kağıt boyutları (mm) - Fallback ekle
    const dims = PAPER_DIMENSIONS[paperSize] || PAPER_DIMENSIONS.A4;
    const pageW = parseFloat(dims?.width || '210mm');
    const pageH = parseFloat(dims?.height || '297mm');

    onProgress?.(5, 'Sayfalar taranıyor...');

    // Sayfaları bul
    const roots = Array.from(document.querySelectorAll(rootSelector)) as HTMLElement[];
    if (roots.length === 0) {
      logError(`[PDFGenerator] HATA: "${rootSelector}" bulunamadı.`);
      onProgress?.(0, 'İçerik bulunamadı');
      alert('Yazdırılacak içerik bulunamadı. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return null;
    }

    if (!hasRenderableContent(roots)) {
      logError(`[PDFGenerator] HATA: "${rootSelector}" bulundu ama içerik boş.`);
      onProgress?.(0, 'İçerik boş');
      alert('Yazdırılacak içerik henüz hazır değil. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return null;
    }

    const pages = collectPages(rootSelector);
    if (pages.length === 0) {
      logWarn('[PDFGenerator] Sayfa bulunamadı');
      return null;
    }

    onProgress?.(10, `${pages.length} sayfa bulundu, hazırlanıyor...`);

    // Fontların yüklenmesini bekle
    await preloadFontsForCapture();

    // Dinamik import — kod bölme
    const jspdfModule: any = await import('jspdf');
    const jsPDF = jspdfModule.jsPDF || (jspdfModule.default ? jspdfModule.default.jsPDF || jspdfModule.default : null) || jspdfModule;

    // PDF oluştur
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageW, pageH],
      compress: true,
    });

    // UI öğelerini geçici olarak gizle
    const restoreUI = hideUIElements();

    try {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const progressPercent = 10 + Math.round((i / pages.length) * 80);
        onProgress?.(progressPercent, `Sayfa ${i + 1}/${pages.length} işleniyor...`);

        // Arka plan garantisi
        const origBg = page.style.backgroundColor;
        page.style.backgroundColor = '#ffffff';

        const canvas = await capturePage(page, captureScale);
        page.style.backgroundColor = origBg;

        // Canvas → JPEG data URL (PNG'den daha küçük PDF boyutu)
        const imgData = canvas.toDataURL('image/jpeg', 0.92);

        // İlk sayfa zaten oluşturuldu, sonrakiler için yeni sayfa ekle
        if (i > 0) {
          pdf.addPage([pageW, pageH], 'portrait');
        }

        // Görüntüyü tam sayfa olarak ekle
        pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
      }
    } finally {
      restoreUI();
    }

    onProgress?.(95, 'PDF dosyası oluşturuluyor...');

    // PDF blob oluştur
    const pdfBlob = pdf.output('blob');
    const safeName = (title || 'Oogmatik').replace(/[^a-z0-9ğüşıöçA-ZĞÜŞİÖÇ\s]/g, '_').trim();

    // İndirme — Platform uyumlu
    downloadBlob(pdfBlob, `${safeName}.pdf`);

    onProgress?.(100, 'PDF başarıyla indirildi!');
    return pdfBlob;
  } finally {
    clearRenderAllPagesFlag();
  }
};

/**
 * Blob'u platform-aware şekilde indirir.
 * iOS/Safari: yeni sekmede aç (download attribute çalışmıyor)
 * Android/Desktop: download attribute ile indir
 */
const downloadBlob = (blob: Blob, fileName: string): void => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (isIOS || isSafari) {
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } else {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  }
};
