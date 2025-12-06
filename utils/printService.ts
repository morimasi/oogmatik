
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Gelişmiş PDF ve Yazdırma Servisi
 * İçeriği resim olarak yakalar, A4 boyutuna ölçekler ve taşan kısımları
 * bir sonraki sayfaya kesip yapıştırarak süreklilik sağlar.
 */

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

        // 2. PDF Ayarları (A4)
        // A4 Boyutu: 210mm x 297mm
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 5; // 5mm kenar boşluğu (biraz artırıldı)
        const printableWidth = pageWidth - (margin * 2);
        const printableHeight = pageHeight - (margin * 2);

        // UI Temizliği (Geçici) - Çıktıda görünmemesi gerekenleri gizle
        const uiElements = document.querySelectorAll('.edit-handle, .edit-grid-overlay, .edit-safety-guide, .no-print');
        uiElements.forEach((el: any) => el.style.display = 'none');

        try {
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLElement;

                // 3. Yüksek Kaliteli Ekran Görüntüsü Al
                // ÖNEMLİ: allowTaint: true, toDataURL kullanımını engeller (Security Error). 
                // Bu yüzden allowTaint: false olmalı ve useCORS: true kullanılmalı.
                const canvas = await html2canvas(element, {
                    scale: 2, // 2x Scale = Retina kalitesi (yaklaşık 144 DPI)
                    useCORS: true, // Dış kaynaklı görseller için gerekli
                    logging: false,
                    allowTaint: false, // ZORUNLU: false olmalı yoksa toDataURL çalışmaz
                    backgroundColor: '#ffffff', // Arka planı beyaz zorla
                    windowWidth: element.scrollWidth,
                    windowHeight: element.scrollHeight
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95); // PNG yerine JPEG kullanarak boyut küçültülebilir, kalite 0.95
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;

                // 4. Boyut Hesaplama (Aspect Ratio Koru)
                // Resmi sayfa genişliğine (marginler hariç) sığdır
                const ratio = printableWidth / imgWidth;
                const scaledHeight = imgHeight * ratio;

                // 5. Sayfalara Bölme ve Yerleştirme Mantığı
                let heightLeft = scaledHeight;
                let position = margin; // Sayfa başı pozisyonu (PDF koordinatı)
                
                // İlk Sayfa Ekleme (Eğer i > 0 ise veya içerik çok uzunsa yeni sayfa yönetimi)
                if (i > 0) pdf.addPage();

                // Tek sayfa mı, çoklu sayfa mı?
                if (scaledHeight <= printableHeight) {
                    // Sayfaya sığıyor, tek seferde bas
                    pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, scaledHeight);
                } else {
                    // Sayfaya sığmıyor, keserek bas (Slicing)
                    // Döngü: İçerik bitene kadar
                    let pageDataPosition = 0; // Resmin PDF üzerindeki Y konumu (Negatif değer yukarı kaydırır)

                    while (heightLeft > 0) {
                        // Mevcut sayfaya resmi bas
                        // pageDataPosition değeri negatifleşerek resmi yukarı kaydırır, böylece "pencere" aşağı iner.
                        // margin: X konumu, position: Y konumu (genelde margin kadar)
                        pdf.addImage(imgData, 'JPEG', margin, position + pageDataPosition, printableWidth, scaledHeight);
                        
                        heightLeft -= printableHeight;
                        pageDataPosition -= printableHeight; // Resmi yukarı ötele

                        // Eğer hala içerik kaldıysa yeni sayfa ekle
                        if (heightLeft > 0) {
                            pdf.addPage();
                            position = margin; // Yeni sayfada üstten başla
                        }
                    }
                }
            }

            // 6. Çıktı İşlemi
            if (options.action === 'download') {
                pdf.save(`${title.replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]/gi, '_')}.pdf`);
            } else {
                const pdfBlob = pdf.output('blob');
                const blobUrl = URL.createObjectURL(pdfBlob);
                window.open(blobUrl, '_blank');
            }

        } catch (error) {
            console.error("PDF Oluşturma Hatası:", error);
            throw error; // Hatayı yukarı fırlat ki UI bileşeni yakalayabilsin
        } finally {
            // UI Elementlerini Geri Getir
            uiElements.forEach((el: any) => el.style.display = '');
        }
    },

    /**
     * Eski fonksiyonlar (Geri uyumluluk için, artık yenisine yönlendiriyor)
     */
    printWorksheet: (title: string) => {
        printService.generatePdf('.worksheet-item', title, { action: 'print' });
    },
    
    downloadAsPdf: (title: string) => {
        printService.generatePdf('.worksheet-item', title, { action: 'download' });
    }
};
