
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
            alert("İçerik bulunamadı.");
            return;
        }

        // 2. PDF Ayarları (A4)
        // A4 Boyutu: 210mm x 297mm
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 3; // 3mm kenar boşluğu
        const printableWidth = pageWidth - (margin * 2);
        const printableHeight = pageHeight - (margin * 2);

        // UI Temizliği (Geçici)
        const uiElements = document.querySelectorAll('.edit-handle, .edit-grid-overlay, .edit-safety-guide, .no-print');
        uiElements.forEach((el: any) => el.style.display = 'none');

        try {
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLElement;

                // 3. Yüksek Kaliteli Ekran Görüntüsü Al (Scale 2 = 144 DPI civarı, net metin için ideal)
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    allowTaint: true,
                    backgroundColor: '#ffffff', // Arka planı beyaz zorla
                    // Scroll edilmiş veya gizli alanları da yakalamak için
                    windowWidth: element.scrollWidth,
                    windowHeight: element.scrollHeight
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;

                // 4. Boyut Hesaplama (Aspect Ratio Koru)
                // Resmi sayfa genişliğine (marginler hariç) sığdır
                const ratio = printableWidth / imgWidth;
                const scaledHeight = imgHeight * ratio;

                // 5. Sayfalara Bölme ve Yerleştirme Mantığı
                let heightLeft = scaledHeight;
                let position = margin; // Sayfa başı pozisyonu
                let pageDataPosition = 0; // Resmin kaynak Y pozisyonu (PDF koordinat sisteminde değil, mantıksal)

                // İlk Sayfa Ekleme (Eğer i > 0 ise yeni sayfa aç, ilk eleman için zaten sayfa var)
                if (i > 0) pdf.addPage();

                // Tek sayfa mı, çoklu sayfa mı?
                if (scaledHeight <= printableHeight) {
                    // Sayfaya sığıyor, tek seferde bas
                    pdf.addImage(imgData, 'PNG', margin, margin, printableWidth, scaledHeight);
                } else {
                    // Sayfaya sığmıyor, keserek bas (Slicing)
                    // Döngü: İçerik bitene kadar
                    while (heightLeft > 0) {
                        // Mevcut sayfaya resmi bas
                        // position değeri negatifleşerek resmi yukarı kaydırır, böylece "pencere" aşağı iner.
                        pdf.addImage(imgData, 'PNG', margin, position, printableWidth, scaledHeight);
                        
                        heightLeft -= printableHeight;
                        position -= pageHeight; // Bir sonraki sayfa için resmi yukarı ötele (Maskeleme mantığı)

                        // Eğer hala içerik kaldıysa yeni sayfa ekle
                        if (heightLeft > 0) {
                            pdf.addPage();
                            // Yeni sayfada yine üstten başla (ancak resim koordinatı yukarı kaymış olacak)
                            position = margin - (pageHeight * Math.ceil((scaledHeight - heightLeft) / pageHeight)) ;
                            // Basitleştirilmiş: Sadece bir önceki pozisyondan pageHeight kadar daha yukarıda başla
                            // addImage(..., y) -> y negatif oldukça resmin alt kısımları görünür.
                            
                            // Düzeltme: While döngüsündeki position zaten kümülatif azalıyor. 
                            // Ancak jspdf addPage() koordinatları sıfırlar.
                            // position değişkeni, o anki sayfadaki Y koordinatıdır.
                            // İlk sayfa: y = margin. Resim (0,0)'dan başlar.
                            // İkinci sayfa: y = margin - 297. Resim (-297)'den başlar (yani üst kısmı sayfa dışında kalır).
                        }
                    }
                }
            }

            // 6. Çıktı İşlemi
            if (options.action === 'download') {
                pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
            } else {
                const pdfBlob = pdf.output('blob');
                const blobUrl = URL.createObjectURL(pdfBlob);
                window.open(blobUrl, '_blank');
            }

        } catch (error) {
            console.error("PDF Oluşturma Hatası:", error);
            alert("PDF oluşturulurken bir hata meydana geldi.");
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
