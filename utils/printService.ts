
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

        // Mevcut scroll pozisyonunu kaydet
        const originalScrollPos = window.scrollY;
        
        // UI Temizliği - Ekran görüntüsüne girmemesi gerekenleri gizle
        const uiElements = document.querySelectorAll('.edit-handle, .edit-grid-overlay, .edit-safety-guide, .no-print, .page-navigator');
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
                
                // Elementi geçici olarak görünür alana taşıma veya scroll etme gerekebilir, 
                // html2canvas genellikle element görünür olmasa da render eder ama scroll pozisyonu önemlidir.
                // Scroll işlemini kaldırdık çünkü html2canvas windowWidth/height ile tüm sayfayı alabilir.

                // 3. Ekran Görüntüsü Al (Timeout Korumalı ve Yüksek Kalite)
                const canvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error("Sayfa işlenirken zaman aşımına uğradı (60sn). İçerik çok yoğun olabilir."));
                    }, 60000); // 60 saniye genel işlem limiti

                    html2canvas(element, {
                        scale: 2, // Gerçek baskı kalitesi için 2x
                        useCORS: true, 
                        allowTaint: false,
                        logging: false,
                        backgroundColor: '#ffffff',
                        imageTimeout: 15000,
                        // windowWidth/Height ayarı bazı durumlarda CSS transform ile çakışabilir, kaldırıldı.
                        onclone: (clonedDoc) => {
                            // Klonlanan dökümanda ekstra temizlik
                            const clonedUi = clonedDoc.querySelectorAll('.edit-handle, .edit-grid-overlay, .page-navigator');
                            clonedUi.forEach((el: any) => el.style.display = 'none');
                            
                            // Transform scale'i sıfırla ki tam boyut çıksın
                            const scalers = clonedDoc.querySelectorAll('.worksheet-scaler');
                            scalers.forEach((el: any) => {
                                el.style.transform = 'none';
                                el.style.width = '100%';
                                el.style.height = '100%';
                            });
                        }
                    }).then((c) => {
                        clearTimeout(timeoutId);
                        resolve(c);
                    }).catch((err) => {
                        clearTimeout(timeoutId);
                        console.error("html2canvas error:", err);
                        reject(err);
                    });
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.90);
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