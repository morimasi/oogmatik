import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
    fileName: string;
    quality?: number;
    scale?: number;
    format?: 'png' | 'pdf';
}

export class PremiumExportService {
    /**
     * Belirli bir HTML elementinin yüksek çözünürlüklü ekran görüntüsünü alır.
     */
    static async captureElement(element: HTMLElement, options: Partial<ExportOptions> = {}): Promise<string> {
        const { scale = 2, quality = 1 } = options;

        try {
            const canvas = await html2canvas(element, {
                scale: scale,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            return canvas.toDataURL('image/png', quality);
        } catch (error) {
            console.error('Capture Error:', error);
            throw new Error('Ekran görüntüsü alınamadı.');
        }
    }

    /**
     * Görüntüyü PDF olarak kaydeder.
     */
    static async exportToPDF(element: HTMLElement, fileName: string) {
        const dataUrl = await this.captureElement(element, { scale: 3 });
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}.pdf`);
    }

    /**
     * Görüntüyü PNG olarak indirir.
     */
    static async downloadAsImage(element: HTMLElement, fileName: string) {
        const dataUrl = await this.captureElement(element, { scale: 3 });
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        link.click();
    }
}

export const exportService = new PremiumExportService();
