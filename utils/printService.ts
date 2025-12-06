
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
        uiElements.forEach((el: any) => el.style.visibility = 'hidden'); // display:none yerine visibility kullanıyoruz layout bozulmasın diye

        try {
            // 2. PDF Ayarları (A4)
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 0; // Kenar boşluğunu sıfırladık, içerik zaten marginli
            const printableWidth = pageWidth;
            const printableHeight = pageHeight;

            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLElement;

                // 3. Ekran Görüntüsü Al
                // Scale 1.5 performans ve kalite dengesi için idealdir. 2 ve üzeri tarayıcıyı kilitler.
                const canvas = await html2canvas(element, {
                    scale: 1.5, 
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    backgroundColor: '#ffffff',
                    scrollY: 0, // Önemli: Sayfa kaydırılmışsa bile en üstten al
                    windowWidth: document.documentElement.scrollWidth,
                    windowHeight: document.documentElement.scrollHeight
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG ve 0.85 kalite ile dosya boyutu optimizasyonu
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;

                // 4. Boyut Hesaplama (PDF sayfasına sığdır)
                const ratio = printableWidth / imgWidth;
                const scaledHeight = imgHeight * ratio;

                // 5. Sayfaya Ekle
                if (i > 0) pdf.addPage();
                
                // Tek sayfa olarak sığdır
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
                    // Otomatik yazdırma penceresini açmayı dene
                    printWindow.onload = () => {
                        printWindow.print();
                    };
                } else {
                    // Pop-up engellendiyse indirme yöntemine geç
                    pdf.save(finalFileName);
                }
            }

        } catch (error: any) {
            console.error("PDF Oluşturma Hatası:", error);
            throw new Error("PDF oluşturulurken bir hata meydana geldi: " + (error.message || "Bilinmeyen Hata"));
        } finally {
            // UI Elementlerini Geri Getir
            uiElements.forEach((el: any) => el.style.visibility = '');
            // Scroll pozisyonunu geri yükle
            window.scrollTo(0, originalScrollPos);
        }
    }
};
