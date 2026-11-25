/**
 * bdmind Print Engine — PDF Üretim Modülü (v3.0)
 *
 * html2canvas + jsPDF ile gerçek PDF üretir.
 *
 * v3.0 yenilikleri:
 *  - Kör piksel dilimleme kaldırıldı. İçerik önce akıllı mizanpaj motoruyla
 *    (SmartLayout) kağıda tam oturan sayfalara bölünür; böylece bir soru,
 *    kart, ızgara satırı veya tablo satırı asla ortadan kesilmez.
 *  - Gerçek kenar boşluğu: içerik 0,0 yerine (margin, margin) hizasına basılır.
 *  - Çok sayfalı çıktılarda alt bilgi sayfa numarası eklenir.
 *  - Grayscale + kalite ayarları korunur.
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
import { buildExportPages, releaseExportStage, DEFAULT_PRINT_MARGIN_MM } from './SmartLayout';
import { useStudentStore } from '../../store/useStudentStore.js';
import { useToastStore } from '../../store/useToastStore.js';

import { logError, logWarn } from '../../utils/logger.js';

export interface RealPdfOptions {
  paperSize?: PaperSize;
  quality?: PdfQuality;
  grayscale?: boolean;
  selectedPages?: number[];
  /** Kenar boşluğu (mm). Varsayılan 8mm — @page margin ile aynıdır. */
  marginMm?: number;
  /** Sayfa numarası alt bilgisini kapat */
  hidePageNumbers?: boolean;
  onProgress?: (percent: number, message: string) => void;
}

type JsPdfLike = {
  setProperties: (props: Record<string, string>) => void;
  addPage: (format?: number[], orientation?: string) => void;
  addImage: (
    data: string,
    format: string,
    x: number,
    y: number,
    w: number,
    h: number,
    alias?: string,
    compression?: string
  ) => void;
  setFontSize: (size: number) => void;
  setTextColor: (r: number, g: number, b: number) => void;
  text: (text: string, x: number, y: number, options?: { align?: string }) => void;
  output: (type: 'blob') => Blob;
};

type JsPdfConstructor = new (options: {
  orientation: string;
  unit: string;
  format: number[];
  compress: boolean;
}) => JsPdfLike;

/**
 * GERÇEK PDF MOTORU v3.0
 * Akıllı mizanpaj → sayfa yakalama → jsPDF birleştirme.
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
    const marginMm = options?.marginMm ?? DEFAULT_PRINT_MARGIN_MM;
    const hidePageNumbers = options?.hidePageNumbers ?? false;
    const onProgress = options?.onProgress;
    const captureScale = QUALITY_SCALE_MAP[quality];

    // Yataylık: kağıt tipinden veya sayfa sınıfından
    const isLandscape =
      paperSize === 'Extreme_Yatay' ||
      (document.querySelector(rootSelector)?.classList.contains('orientation-landscape') ?? false) ||
      (document.querySelector(rootSelector)?.classList.contains('landscape') ?? false);

    // Kağıt boyutları (mm)
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
      useToastStore
        .getState()
        .error('Yazdırılacak içerik bulunamadı. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return null;
    }

    if (!hasRenderableContent(roots)) {
      logError(`[PDFGenerator] HATA: "${rootSelector}" bulundu ama içerik boş.`);
      onProgress?.(0, 'İçerik boş');
      useToastStore
        .getState()
        .error('Yazdırılacak içerik henüz hazır değil. Lütfen sayfa tamamen yüklendikten sonra tekrar deneyin.');
      return null;
    }

    let pages = collectPages(rootSelector);
    if (selectedPages && selectedPages.length > 0) {
      const allowed = new Set(selectedPages);
      pages = pages.filter((_, idx) => allowed.has(idx + 1));
    }
    if (pages.length === 0) {
      logWarn('[PDFGenerator] Sayfa bulunamadı');
      onProgress?.(0, 'Seçili sayfa yok');
      return null;
    }

    onProgress?.(10, `${pages.length} sayfa bulundu, akıllı mizanpaj uygulanıyor...`);

    // Fontların yüklenmesini bekle (ölçüm doğruluğu için kritik)
    await preloadFontsForCapture();

    // Akıllı mizanpaj: her sayfa kağıda tam oturacak şekilde bölünür
    const exportPages = buildExportPages(pages, {
      paperSize,
      landscape: isLandscape,
      marginMm,
      continuationLabel: 'Devam',
    });

    if (exportPages.length === 0) {
      logWarn('[PDFGenerator] Mizanpaj sonrası sayfa kalmadı');
      useToastStore.getState().error('Yazdırılabilir sayfa üretilemedi. Lütfen tekrar deneyin.');
      return null;
    }

    onProgress?.(14, `${exportPages.length} yazdırma sayfası hazırlandı`);

    // Dinamik import — kod bölme
    const jspdfModule = (await import('jspdf')) as unknown as Record<string, unknown>;
    const moduleDefault = jspdfModule.default as Record<string, unknown> | undefined;
    const JsPdfCtor = (jspdfModule.jsPDF ?? moduleDefault?.jsPDF ?? moduleDefault ?? jspdfModule) as JsPdfConstructor;

    const pdfOrientation = isLandscape ? 'landscape' : 'portrait';
    const pdf = new JsPdfCtor({
      orientation: pdfOrientation,
      unit: 'mm',
      format: [pageW, pageH],
      compress: true,
    });

    // KVKK Uyumlu Metadata — öğrenci kimliği ve tanı bilgisi yazılmaz
    const activeStudent = useStudentStore.getState().activeStudent;
    const supportProfile = activeStudent?.diagnosis?.length ? 'ozel-destek-aktif' : 'standart';

    pdf.setProperties({
      title,
      author: 'bdmind - Bursa Disleksi EduMind',
      subject: `Eğitim Materyali - Destek Profili: ${supportProfile}`,
      keywords: 'disleksi, özel eğitim, eğitim materyali',
      creator: 'bdmind AI Engine',
    });

    // UI öğelerini geçici olarak gizle
    const restoreUI = hideUIElements();

    const contentW = Math.max(10, pageW - marginMm * 2);
    const contentH = Math.max(10, pageH - marginMm * 2);

    try {
      for (let i = 0; i < exportPages.length; i++) {
        const exportPage = exportPages[i];
        const progressPercent = 14 + Math.round((i / exportPages.length) * 78);
        onProgress?.(progressPercent, `Sayfa ${i + 1}/${exportPages.length} işleniyor...`);

        const canvas = await capturePage(exportPage.element, captureScale);
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          logWarn(`[PDFGenerator] Sayfa ${i + 1} yakalanamadı, atlanıyor.`);
          continue;
        }

        let workingCanvas = canvas;
        if (grayscale) {
          const grayCanvas = document.createElement('canvas');
          grayCanvas.width = canvas.width;
          grayCanvas.height = canvas.height;
          const gCtx = grayCanvas.getContext('2d');
          if (gCtx) {
            gCtx.filter = 'grayscale(100%) contrast(1.1)';
            gCtx.drawImage(canvas, 0, 0);
            workingCanvas = grayCanvas;
          }
        }

        // En-boy oranını koru, içeriği asla kırpma: gerekirse küçült
        const ratio = contentW / Math.max(1, workingCanvas.width);
        let drawW = contentW;
        let drawH = workingCanvas.height * ratio;
        if (drawH > contentH) {
          const fit = contentH / drawH;
          drawH = contentH;
          drawW = contentW * fit;
        }
        const offsetX = marginMm + (contentW - drawW) / 2;

        if (i > 0) pdf.addPage([pageW, pageH], pdfOrientation);
        const imgData = workingCanvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', offsetX, marginMm, drawW, drawH, undefined, 'FAST');

        if (!hidePageNumbers && exportPages.length > 1) {
          pdf.setFontSize(8);
          pdf.setTextColor(120, 120, 120);
          pdf.text(`${i + 1} / ${exportPages.length}`, pageW / 2, pageH - Math.max(2.5, marginMm / 2), {
            align: 'center',
          });
        }
      }
    } finally {
      restoreUI();
      releaseExportStage();
    }

    onProgress?.(95, 'PDF dosyası oluşturuluyor...');

    const pdfBlob = pdf.output('blob');
    const safeName = (title || 'EduMind').replace(/[^a-z0-9ğüşıöçA-ZĞÜŞİÖÇ\s]/g, '_').trim();

    downloadBlob(pdfBlob, `${safeName}.pdf`);

    onProgress?.(100, 'PDF başarıyla indirildi!');
    return pdfBlob;
  } catch (error: unknown) {
    logError('[PDFGenerator] PDF üretimi başarısız:', {
      error: error instanceof Error ? error.message : String(error),
    });
    useToastStore.getState().error('PDF oluşturulamadı. Lütfen tekrar deneyin.');
    return null;
  } finally {
    clearRenderAllPagesFlag();
    releaseExportStage();
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
