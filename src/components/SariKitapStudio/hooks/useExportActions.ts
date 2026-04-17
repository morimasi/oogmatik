import { useCallback } from 'react';
import { printService } from '../../../utils/printService';

interface ExportOptions {
  format: 'pdf' | 'png';
  elementRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
}

export function useExportActions() {
  const exportToPDF = useCallback(async (options: ExportOptions) => {
    const element = options.elementRef.current;
    if (!element) return;

    // Use the modern printService for high-fidelity PDF
    // We target the current preview element.
    try {
      // Ensure the element has a unique printable ID if not already set
      if (!element.id) {
        element.id = `sari-kitap-preview-${crypto.randomUUID().slice(0, 8)}`;
      }

      await printService.generatePdf(`#${element.id}`, options.filename ?? 'sari-kitap-etkinlik', {
        action: 'download'
      });
    } catch (error: unknown) {
      throw new Error(`PDF export hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }, []);

  const exportToPNG = useCallback(async (options: ExportOptions) => {
    const element = options.elementRef.current;
    if (!element) return;

    try {
      const h2cModule = await import('html2canvas');
      const html2canvas = h2cModule.default || h2cModule;

      const canvas = await (html2canvas as any)(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `${options.filename ?? 'sari-kitap-etkinlik'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error: unknown) {
      throw new Error(`PNG export hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }, []);

  return { exportToPDF, exportToPNG };
}
