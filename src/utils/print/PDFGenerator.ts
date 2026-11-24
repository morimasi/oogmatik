/**
 * bdmind Print Engine — PDF Üretim Modülü
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
import { useStudentStore } from '../../store/useStudentStore.js';
import { useToastStore } from '../../store/useToastStore.js';

import { logError, logWarn } from '../../utils/logger.js';
export interface RealPdfOptions {
  paperSize?: PaperSize;
  quality?: PdfQuality;
  grayscale?: boolean;
  selectedPages?: number[];
  onProgress?: (percent: number, message: string) => void;
}

/**
 * GERÇEK PDF MOTORU v2.0
 * html2canvas ile her sayfayı yakalar → jsPDF ile tek PDF dosyasına birleştirir.
 * Tüm platformlarda çalışır: PC, Tablet, Telefon.
 */
export const generateRealPdf = async (
  rootSelector: string,
  title: string = 'EduMind_Etkinlik',
  options?: RealPdfOptions
): Promise<Blob | null> => {
  await forceRenderAllPages();
  try {
    const paperSize = options?.paperSize ?? 'A4';
    const quality = options?.quality ?? 'high';
    const grayscale = options?.grayscale ?? false;
    const selectedPages = options?.selectedPages;
    const onProgress = options?.onProgress;
    const captureScale = QUALITY_SCALE_MAP[quality];

    // Detecting landscape from paperSize or container class
    const isLandscape =
      paperSize === 'Extreme_Yatay' ||
      (document.querySelector(rootSelector)?.classList.contains('orientation-landscape') ?? false);

    // Kağıt boyutları (mm) - Fallback ekle
    const dims = PAPER_DIMENSIONS[paperSize] || PAPER_DIMENSIONS.A4;
    let pageW = parseFloat(dims?.width || '210mm');
    let pageH = parseFloat(dims?.height || '297mm');
    if (isLandscape && pageW < pageH) {
      [pageW, pageH] = [pageH, pageW];
    }

    onProgress?.(5, 'Sayfalar taranıyor...');

    // Sayfaları bul
    const roots = Array.from(document.querySelectorAll(rootSelector)) as HTMLElement[];
    if (roots.length === 0) {
      logError(`[PDFGenerator] HATA: "${rootSelector}" bulunamadı.`);
      onProgress?.(0, 'İçerik bulunamadı');
      useToastStore.getState().error('Yazdırılacak içerik bulunamadı. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return null;
    }

    if (!hasRenderableContent(roots)) {
      logError(`[PDFGenerator] HATA: "${rootSelector}" bulundu ama içerik boş.`);
      onProgress?.(0, 'İçerik boş');
      useToastStore.getState().error('Yazdırılacak içerik henüz hazır değil. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return null;
    }

    let pages = collectPages(rootSelector);
    if (selectedPages && selectedPages.length > 0) {
      const allowed = new Set(selectedPages);
      pages = pages.filter((_, idx) => allowed.has(idx + 1));
    }
    if (pages.length === 0) {
      logWarn('[PDFGenerator] Sayfa bulunamadı');
      return null;
    }

    onProgress?.(10, `${pages.length} sayfa bulundu, hazırlanıyor...`);

    // Fontların yüklenmesini bekle
    await preloadFontsForCapture();

    // Dinamik import — kod bölme
    const jspdfModule = await import('jspdf');
    const JsPdfCtor = (jspdfModule as any).jsPDF || (jspdfModule as any).default?.jsPDF || (jspdfModule as any).default || jspdfModule;
    const jsPDF = JsPdfCtor as any;

    // PDF oluştur
    const pdfOrientation = isLandscape ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation: pdfOrientation,
      unit: 'mm',
      format: [pageW, pageH],
      compress: true,
    });

    // KVKK Uyumlu Metadata — Öğrenci bilgileri gizli olarak PDF'e eklenir
    const activeStudent = useStudentStore.getState().activeStudent;
    pdf.setProperties({
      title: title,
      author: 'bdmind - Bursa Disleksi EduMind',
      subject: 'Eğitim Materyali',
      keywords: 'disleksi, özel eğitim, eğitim materyali',
      creator: 'bdmind AI Engine',
    });

    // KVKK: Öğrenci bilgileri PDF metadata'ya anonimleştirilmiş şekilde eklenir
    // Tanı bilgileri asla doğrudan yazılmaz, sadece "destek ihtiyacı" ifadesi kullanılır
    if (activeStudent) {
      const studentMeta = {
        studentId: activeStudent.id || 'anonim',
        grade: activeStudent.grade || 'bilinmiyor',
        supportProfile: activeStudent.diagnosis?.length ? 'ozel-destek-aktif' : 'standart',
        generatedAt: new Date().toISOString(),
        kvkkCompliant: true,
      };
      pdf.setProperties({
        subject: `Eğitim Materyali - Destek Profili: ${studentMeta.supportProfile}`,
      });
    }

    // UI öğelerini geçici olarak gizle
    const restoreUI = hideUIElements();

    let addedFirstPage = false;

    try {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const progressPercent = 10 + Math.round((i / pages.length) * 80);
        onProgress?.(progressPercent, `Sayfa ${i + 1}/${pages.length} işleniyor...`);

        const origBg = page.style.backgroundColor;
        page.style.backgroundColor = '#ffffff';

        const rawCanvas = await capturePage(page, captureScale);
        page.style.backgroundColor = origBg;

        let workingCanvas = rawCanvas;
        if (grayscale && rawCanvas.width > 0 && rawCanvas.height > 0) {
          const grayCanvas = document.createElement('canvas');
          grayCanvas.width = rawCanvas.width;
          grayCanvas.height = rawCanvas.height;
          const gCtx = grayCanvas.getContext('2d');
          if (gCtx) {
            gCtx.filter = 'grayscale(100%) contrast(1.1)';
            gCtx.drawImage(rawCanvas, 0, 0);
            workingCanvas = grayCanvas;
          }
        }

        const renderedHeightMm = (workingCanvas.height * pageW) / Math.max(1, workingCanvas.width);

        if (renderedHeightMm <= pageH * 1.04) {
          if (addedFirstPage) pdf.addPage([pageW, pageH], pdfOrientation);
          addedFirstPage = true;
          const imgData = workingCanvas.toDataURL('image/jpeg', 0.92);
          const fitH = Math.min(pageH, renderedHeightMm);
          pdf.addImage(imgData, 'JPEG', 0, 0, pageW, fitH, undefined, 'FAST');
        } else {
          // Uzun sayfayı en-boy oranını bozmadan dikey A4 dilimlerine böl
          const sliceHeightPx = Math.max(100, Math.floor((pageH * workingCanvas.width) / pageW));
          for (let offsetY = 0; offsetY < workingCanvas.height; offsetY += sliceHeightPx) {
            const currentSliceH = Math.min(sliceHeightPx, workingCanvas.height - offsetY);
            if (currentSliceH < 24) break; // İhmal edilebilir boş kuyruk dilimini atla

            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = workingCanvas.width;
            sliceCanvas.height = currentSliceH;
            const sCtx = sliceCanvas.getContext('2d');
            if (sCtx) {
              sCtx.fillStyle = '#ffffff';
              sCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
              sCtx.drawImage(
                workingCanvas,
                0,
                offsetY,
                workingCanvas.width,
                currentSliceH,
                0,
                0,
                workingCanvas.width,
                currentSliceH
              );
            }

            if (addedFirstPage) pdf.addPage([pageW, pageH], pdfOrientation);
            addedFirstPage = true;

            const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.92);
            const sliceHeightMm = (currentSliceH * pageW) / workingCanvas.width;
            pdf.addImage(sliceImgData, 'JPEG', 0, 0, pageW, Math.min(pageH, sliceHeightMm), undefined, 'FAST');
          }
        }
      }
    } finally {
      restoreUI();
    }

    onProgress?.(95, 'PDF dosyası oluşturuluyor...');

    // PDF blob oluştur
    const pdfBlob = pdf.output('blob');
    const safeName = (title || 'EduMind').replace(/[^a-z0-9ğüşıöçA-ZĞÜŞİÖÇ\s]/g, '_').trim();

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
