import {
  A4_HEIGHT,
  A4_WIDTH,
  createEmptyPage,
  type HybridPage,
} from '../types/editor.types';

/**
 * PDF İçe Aktarma Servisi (pdfjs-dist).
 *
 * Çok sayfalı veya tek sayfalı PDF belgelerini (çalışma kağıtları, MEB kitapları,
 * test fasikülleri) doğrudan Hibrit Belge sayfalarına dönüştürür.
 * Her sayfa yüksek çözünürlüklü A4 tuval arka planına yerleştirilir; böylece
 * öğretmenler ve öğrenciler PDF üzerinde serbestçe çizim yapabilir, fosforlu kalemle
 * vurgulayabilir veya soru ekleyebilir.
 */

export interface PdfImportProgress {
  currentPage: number;
  totalPages: number;
}

export interface PdfImportResult {
  ok: boolean;
  pages?: HybridPage[];
  error?: string;
}

/**
 * Bir PDF dosyasını okur ve her bir sayfasını A4 boyutlu HybridPage'e dönüştürür.
 */
export const importPdfToHybridPages = async (
  file: File,
  options: {
    startIndex?: number;
    onProgress?: (progress: PdfImportProgress) => void;
  } = {}
): Promise<PdfImportResult> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { ok: false, error: 'PDF içe aktarımı yalnızca tarayıcı ortamında desteklenir.' };
  }

  try {
    const pdfjsLib = await import('pdfjs-dist');

    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
    } catch {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    if (totalPages === 0) {
      return { ok: false, error: 'PDF belgesinde sayfa bulunamadı.' };
    }

    const startIndex = options.startIndex ?? 0;
    const hybridPages: HybridPage[] = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum += 1) {
      options.onProgress?.({ currentPage: pageNum, totalPages });

      const page = await pdfDoc.getPage(pageNum);
      const originalViewport = page.getViewport({ scale: 1 });

      // A4 oranında (794 x 1123 px) yüksek netlik için 2x çarpan
      const scale = Math.min(
        (A4_WIDTH * 2) / originalViewport.width,
        (A4_HEIGHT * 2) / originalViewport.height
      );
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        continue;
      }

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      const pageDataUrl = canvas.toDataURL('image/png', 0.95);

      // Fabric nesnesi olarak sayfanın arka planına tam oturtulmuş görsel
      const pageIndex = startIndex + pageNum - 1;
      const hybridPage = createEmptyPage(pageIndex);
      hybridPage.name = `PDF Sayfa ${pageNum}`;

      const backgroundObject = {
        type: 'FabricImage',
        version: '6.0.0',
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        width: viewport.width,
        height: viewport.height,
        scaleX: A4_WIDTH / viewport.width,
        scaleY: A4_HEIGHT / viewport.height,
        src: pageDataUrl,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
      };

      hybridPage.canvas = {
        json: JSON.stringify({
          version: '6.0.0',
          objects: [backgroundObject],
          background: '#ffffff',
        }),
        width: A4_WIDTH,
        height: A4_HEIGHT,
        zoom: 1,
      };

      hybridPages.push(hybridPage);
    }

    return { ok: true, pages: hybridPages };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'PDF işlenirken bir hata oluştu.',
    };
  }
};
