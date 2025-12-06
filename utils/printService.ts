
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
            alert("Yazdırılacak içerik bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
            return;
        }

        // Kullanıcıya bilgi vermek ve olası hataları önlemek için sayfayı en üste kaydır
        window.scrollTo(0, 0);

        // 2. PDF Ayarları (A4)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 5; 
        const printableWidth = pageWidth - (margin * 2);
        const printableHeight = pageHeight - (margin * 2);

        // UI Temizliği - Ekran görüntüsüne girmemesi gerekenleri gizle
        const uiElements = document.querySelectorAll('.edit-handle, .edit-grid-overlay, .edit-safety-guide, .no-print');
        uiElements.forEach((el: any) => el.style.display = 'none');

        try {
            // Promise.race ile zaman aşımı mekanizması ekle (15 saniye)
            await Promise.race([
                new Promise<void>(async (resolve, reject) => {
                    try {
                        for (let i = 0; i < elements.length; i++) {
                            const element = elements[i] as HTMLElement;

                            // 3. Ekran Görüntüsü Al
                            const canvas = await html2canvas(element, {
                                scale: 2, // Retina kalitesi
                                useCORS: true, // Dış resimler için gerekli
                                allowTaint: false, // toDataURL güvenliği için false olmalı
                                logging: false,
                                backgroundColor: '#ffffff',
                                ignoreElements: (node) => {
                                    // Butonları ve gereksiz UI elementlerini yoksay
                                    return node.nodeName === 'BUTTON' || node.classList.contains('no-print');
                                }
                            });

                            const imgData = canvas.toDataURL('image/jpeg', 0.90); // Kaliteyi hafif düşürerek hızı artır
                            const imgWidth = canvas.width;
                            const imgHeight = canvas.height;

                            // 4. Boyut Hesaplama
                            const ratio = printableWidth / imgWidth;
                            const scaledHeight = imgHeight * ratio;

                            // 5. Sayfalara Yerleştirme
                            let heightLeft = scaledHeight;
                            let position = margin;
                            
                            if (i > 0) pdf.addPage();

                            // Tek sayfa mı, çoklu sayfa mı?
                            if (scaledHeight <= printableHeight) {
                                pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, scaledHeight);
                            } else {
                                // Uzun içerikleri böl (Slicing)
                                let pageDataPosition = 0;

                                while (heightLeft > 0) {
                                    pdf.addImage(imgData, 'JPEG', margin, position + pageDataPosition, printableWidth, scaledHeight);
                                    heightLeft -= printableHeight;
                                    pageDataPosition -= printableHeight;

                                    if (heightLeft > 0) {
                                        pdf.addPage();
                                        position = margin;
                                    }
                                }
                            }
                        }
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("İşlem zaman aşımına uğradı. İçerik çok büyük veya resimler yüklenemiyor.")), 20000))
            ]);

            // 6. Çıktı İşlemi
            if (options.action === 'download') {
                pdf.save(`${title.replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]/gi, '_')}.pdf`);
            } else {
                const pdfBlob = pdf.output('blob');
                const blobUrl = URL.createObjectURL(pdfBlob);
                window.open(blobUrl, '_blank');
            }

        } catch (error: any) {
            console.error("PDF Oluşturma Hatası:", error);
            alert(`Hata: ${error.message || "PDF oluşturulurken bir sorun oluştu."}`);
        } finally {
            // UI Elementlerini Geri Getir
            uiElements.forEach((el: any) => el.style.display = '');
        }
    },

    printWorksheet: (title: string) => {
        printService.generatePdf('.worksheet-item', title, { action: 'print' });
    },
    
    downloadAsPdf: (title: string) => {
        printService.generatePdf('.worksheet-item', title, { action: 'download' });
    }
};
