
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface PrintOptions {
    fileName?: string;
    action: 'download' | 'print';
}

export const printService = {
    /**
     * Hedef seçiciye (.worksheet-item vb.) sahip elementleri bulur,
     * her birini resme dönüştürür ve PDF'e basar.
     */
    generatePdf: async (elementSelector: string = '.worksheet-item', title: string = "Dokuman", options: PrintOptions) => {
        // 1. Elementleri Bul
        const elements = document.querySelectorAll(elementSelector);
        if (!elements || elements.length === 0) {
            throw new Error("Yazdırılacak içerik bulunamadı.");
        }

        // Mevcut scroll pozisyonunu kaydet ve en üste çık (render hatasını önlemek için)
        const originalScrollPos = window.scrollY;
        window.scrollTo(0, 0);

        // UI Temizliği - Ekran görüntüsüne girmemesi gerekenleri gizle
        const uiElements = document.querySelectorAll('.edit-handle, .edit-grid-overlay, .edit-safety-guide, .no-print');
        uiElements.forEach((el: any) => el.style.visibility = 'hidden');

        try {
            // 2. PDF Ayarları (A4)
            // @ts-ignore
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 0; 
            const printableWidth = pageWidth;
            const printableHeight = pageHeight;

            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLElement;

                // 3. Ekran Görüntüsü Al (Timeout Korumalı)
                const canvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error("Sayfa işlenirken zaman aşımına uğradı (60sn). İçerik çok yoğun olabilir."));
                    }, 60000); // 60 saniye limit

                    html2canvas(element, {
                        scale: 1.5, // Kalite/Performans dengesi
                        useCORS: true, // Dış kaynaklı görseller için
                        allowTaint: false,
                        logging: false, // Konsol kirliliğini önle
                        backgroundColor: '#ffffff',
                        scrollY: 0,
                        windowWidth: document.documentElement.scrollWidth,
                        windowHeight: document.documentElement.scrollHeight,
                        onclone: (clonedDoc) => {
                            // Klonlanan dökümanda ekstra temizlik yapılabilir
                            const clonedUi = clonedDoc.querySelectorAll('.edit-handle, .edit-grid-overlay');
                            clonedUi.forEach((el: any) => el.style.visibility = 'hidden');
                        }
                    }).then((c) => {
                        clearTimeout(timeoutId);
                        resolve(c);
                    }).catch((err) => {
                        clearTimeout(timeoutId);
                        reject(err);
                    });
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.85);
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;

                // 4. Boyut Hesaplama
                const ratio = printableWidth / imgWidth;
                const scaledHeight = imgHeight * ratio;

                // 5. Sayfaya Ekle
                if (i > 0) pdf.addPage();
                
                pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, Math.min(scaledHeight, printableHeight));
            }

            // 6. Çıktı İşlemi
            const finalFileName = `${title.replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s-]/gi, '').trim() || 'Etkinlik'}.pdf`;

            if (options.action === 'download') {
                pdf.save(finalFileName);
            } else {
                const pdfBlob = pdf.output('blob');
                const blobUrl = URL.createObjectURL(pdfBlob);
                const printWindow = window.open(blobUrl, '_blank');
                if (printWindow) {
                    printWindow.onload = () => {
                        printWindow.print();
                    };
                } else {
                    pdf.save(finalFileName);
                }
            }

        } catch (error: any) {
            console.error("PDF Oluşturma Hatası:", error);
            throw new Error("PDF oluşturulurken bir hata meydana geldi: " + (error.message || "Bilinmeyen Hata"));
        } finally {
            // UI Elementlerini Geri Getir
            uiElements.forEach((el: any) => el.style.visibility = '');
            window.scrollTo(0, originalScrollPos);
        }
    }
};
