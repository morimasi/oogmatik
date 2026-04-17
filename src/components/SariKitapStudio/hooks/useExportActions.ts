import { useCallback } from 'react';

interface ExportOptions {
  format: 'pdf' | 'png';
  elementRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
}

export function useExportActions() {
  const exportToPDF = useCallback(async (options: ExportOptions) => {
    const element = options.elementRef.current;
    if (!element) return;

    try {
      const h2cModule = await import('html2canvas');
      const jsPDFModule = await import('jspdf');
      const html2canvas = h2cModule.default || h2cModule;
      const jsPDF = jsPDFModule.default || jsPDFModule;

      const canvas = await (html2canvas as any)(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const pdf = new (jsPDF as any)('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210;
      const pdfHeight = 297;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // KVKK-safe metadata
      pdf.setProperties({
        title: options.filename ?? 'Sarı Kitap Etkinliği',
        subject: 'Okuma Destek Materyali',
        creator: 'Oogmatik EdTech',
      });

      pdf.save(`${options.filename ?? 'sari-kitap-etkinlik'}.pdf`);
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
