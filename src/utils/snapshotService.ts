/**
 * Oogmatik Snapshot Service
 * Ekran görüntüsü alma, panoya kopyalama ve paylaşma.
 * CaptureEngine paylaşımlı modülünü kullanır — kod tekrarı yok.
 */

import { AppError } from '../utils/AppError';
import { captureAllPages } from './print/CaptureEngine';

import { logInfo, logError, logWarn } from '../utils/logger.js';
export type SnapshotAction = 'download' | 'clipboard' | 'share';

/** Canvas → Blob dönüşümü */
const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality = 1.0
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      type,
      quality
    );
  });
};

export const snapshotService = {
  /**
   * Ekran görüntüsü al — tüm sayfaları yakalar.
   * action: 'download' | 'clipboard' | 'share' | 'download_zip'
   * scale: çözünürlük çarpanı (varsayılan 2, 3 yaparsanız yüksek kalite olur)
   */
  takeSnapshot: async (
    elementSelector: string,
    fileName: string,
    action: SnapshotAction | 'download_zip' = 'download',
    customScale: number = 2
  ): Promise<void> => {
    let canvases: HTMLCanvasElement[];
    try {
      canvases = await captureAllPages(elementSelector, customScale);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
      throw new AppError(message, 'INTERNAL_ERROR', 500);
    }

    if (action === 'download') {
      canvases.forEach((canvas, i) => {
        const link = document.createElement('a');
        link.download = `${fileName}${canvases.length > 1 ? `_sayfa_${i + 1}` : ''}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      });
      return;
    }

    if (action === 'download_zip' && canvases.length > 1) {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      const promises = canvases.map((canvas, i) => {
        return new Promise<void>((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const name = `${fileName}_sayfa_${i + 1}.png`;
                zip.file(name, blob);
              }
              resolve();
            },
            'image/png',
            1.0
          );
        });
      });

      await Promise.all(promises);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${fileName}_tum_sayfalar_${Date.now()}.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 10000);
      return;
    } else if (action === 'download_zip') {
      const canvas = canvases[0];
      const link = document.createElement('a');
      link.download = `${fileName}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      return;
    }

    if (action === 'clipboard') {
      await snapshotService.copyToClipboard(canvases[0]);
      return;
    }

    if (action === 'share') {
      await snapshotService.shareImages(canvases, fileName);
      return;
    }
  },

  /** İlk sayfayı panoya kopyala */
  copyToClipboard: async (canvas: HTMLCanvasElement): Promise<boolean> => {
    try {
      const blob = await canvasToBlob(canvas, 'image/png');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return true;
    } catch (err) {
      logError('Panoya kopyalama hatası:', err);
      try {
        await navigator.clipboard.writeText(canvas.toDataURL('image/png'));
        return true;
      } catch {
        return false;
      }
    }
  },

  /** Web Share API ile görüntüleri paylaş (mobil uyumlu) */
  shareImages: async (canvases: HTMLCanvasElement[], fileName: string): Promise<boolean> => {
    const files: File[] = [];
    for (let i = 0; i < canvases.length; i++) {
      const blob = await canvasToBlob(canvases[i], 'image/png');
      const name = `${fileName}${canvases.length > 1 ? `_sayfa_${i + 1}` : ''}.png`;
      files.push(new File([blob], name, { type: 'image/png' }));
    }

    if (navigator.share && navigator.canShare?.({ files })) {
      try {
        await navigator.share({
          title: 'EduMind Etkinlik',
          text: 'Bursa Disleksi EduMind ile oluşturulmuştur',
          files,
        });
        return true;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return false;
        logError('Share hatası:', err);
      }
    }

    // Fallback: indirmeye yönlendir
    await snapshotService.takeSnapshot('.worksheet-page', fileName, 'download');
    return false;
  },

  /** Tek bir canvas'tan doğrudan Blob döndür — dışarıdan kullanım için */
  captureAsBlob: async (elementSelector: string): Promise<Blob | null> => {
    try {
      const canvases = await captureAllPages(elementSelector);
      if (canvases.length === 0) return null;
      return await canvasToBlob(canvases[0], 'image/png');
    } catch {
      return null;
    }
  },
};
