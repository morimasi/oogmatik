
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';

/**
 * PDF OLUŞTURMA VE İNDİRME SERVİSİ
 * Ekranda görünen çalışma sayfalarının (Worksheet Items)
 * birebir ekran görüntüsünü (screenshot) alıp A4 PDF olarak birleştirir ve indirir.
 * Bu yöntem, CSS print sorunlarını (boş sayfa, kayma vb.) tamamen ortadan kaldırır.
 */

export const printService = {
    downloadAsPdf: async (title: string = "Bursa-Disleksi-Etkinlik") => {
        try {
            // 1. Çalışma Sayfalarını Bul
            const sheetElements = document.querySelectorAll('.worksheet-item');
            if (!sheetElements || sheetElements.length === 0) {
                alert("İndirilecek sayfa bulunamadı.");
                return;
            }

            // 2. Geçici Düzenlemeler (UI elemanlarını gizle)
            // Ekran görüntüsünde çıkmaması gereken butonlar, rehber çizgiler vs.
            const hiddenElements: HTMLElement[] = [];
            const uiSelectors = ['.edit-handle', '.edit-grid-overlay', '.edit-safety-guide', '.no-print', 'button'];
            
            uiSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach((el) => {
                    const htmlEl = el as HTMLElement;
                    if (htmlEl.style.display !== 'none') {
                        htmlEl.style.display = 'none'; // Gizle
                        hiddenElements.push(htmlEl);   // Kaydet (geri açmak için)
                    }
                });
            });

            // 3. PDF Başlat (A4, Dikey, mm)
            // A4 Boyutu: 210mm x 297mm
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 210;
            const pdfHeight = 297;

            // 4. Her sayfayı tek tek işle
            for (let i = 0; i < sheetElements.length; i++) {
                const element = sheetElements[i] as HTMLElement;

                // html2canvas ile yüksek kaliteli görüntü al (scale: 2 = Retina kalitesi)
                // useCORS: dış kaynaklı resimlerin yüklenmesi için
                const canvas = await html2canvas(element, {
                    scale: 2, 
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff', // Arka planı beyaz zorla (transparan olmasın)
                    logging: false
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95); // Yüksek kalite JPEG
                
                // Resmin en-boy oranını koruyarak A4'e sığdır
                // Genellikle worksheet-item zaten A4 oranında tasarlanmıştır
                // ancak garantiye almak için fit logic ekleyebiliriz.
                // Bizim tasarımda worksheet-item zaten A4 oranlı olduğu için tam sayfa basacağız.
                
                if (i > 0) pdf.addPage(); // İlk sayfa hariç yeni sayfa ekle
                
                // PDF'e ekle (0,0 kordinatından tam sayfa)
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }

            // 5. Eski haline getir (UI elemanlarını göster)
            hiddenElements.forEach(el => {
                el.style.display = '';
            });

            // 6. Dosyayı İndir
            const safeTitle = title.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
            pdf.save(`${safeTitle}.pdf`);

        } catch (error) {
            console.error("PDF oluşturma hatası:", error);
            alert("PDF oluşturulurken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.");
            
            // Hata durumunda UI'ı düzeltmeyi dene
            const uiSelectors = ['.edit-handle', '.edit-grid-overlay', '.edit-safety-guide', '.no-print', 'button'];
            uiSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach((el) => {
                    (el as HTMLElement).style.display = '';
                });
            });
        }
    }
};
