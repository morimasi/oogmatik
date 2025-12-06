
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';

/**
 * PDF OLUŞTURMA SERVİSİ (CORE)
 * Bu yardımcı fonksiyon, sayfadaki belirtilen elementleri bulur,
 * resimlerini çeker ve bir jsPDF nesnesi oluşturur.
 */
const generatePdfBlob = async (title: string = "Dokuman", selector: string = '.worksheet-item'): Promise<jsPDF | null> => {
    // 1. Çalışma Sayfalarını Bul
    const sheetElements = document.querySelectorAll(selector);
    if (!sheetElements || sheetElements.length === 0) {
        alert("Yazdırılacak/İndirilecek içerik bulunamadı.");
        return null;
    }

    // 2. Geçici Düzenlemeler (UI elemanlarını gizle)
    const hiddenElements: HTMLElement[] = [];
    const uiSelectors = ['.edit-handle', '.edit-grid-overlay', '.edit-safety-guide', '.no-print', 'button', '.bg-zinc-100', '.bg-zinc-50'];
    
    // UI temizliği yaparken dikkatli olalım, sadece arayüz elemanlarını gizleyelim
    // Rapor ekranında arka planı beyaz yapmak için geçici stil değişikliği
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#ffffff';

    uiSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Sadece butonlar ve düzenleme araçlarını gizle, içerik arka planlarını (bg-zinc...) tamamen gizleme,
            // çünkü bazı tasarımlar renkli kutulara dayanıyor.
            if (sel.includes('button') || sel.includes('edit') || sel.includes('no-print')) {
                if (htmlEl.style.display !== 'none') {
                    htmlEl.style.display = 'none';
                    hiddenElements.push(htmlEl);
                }
            }
        });
    });

    try {
        // 3. PDF Başlat (A4, Dikey, mm)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const pdfHeight = 297;

        // 4. Her sayfayı tek tek işle
        for (let i = 0; i < sheetElements.length; i++) {
            const element = sheetElements[i] as HTMLElement;

            // Elementin boyutlarını A4 oranına zorlamak yerine, içeriği sığdıracak şekilde alıyoruz.
            // Ancak html2canvas bazen scroll edilen alanları kesebilir, bu yüzden window.scrollTo başa alınır.
            window.scrollTo(0, 0);

            const canvas = await html2canvas(element, {
                scale: 2, // Retina kalitesi
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff', // Arka plan beyaz
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            if (i > 0) pdf.addPage();
            
            // Resmi sayfaya sığdır (Fit to Page)
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.width / imgProps.height;
            const pageRatio = pdfWidth / pdfHeight;
            
            let finalW = pdfWidth;
            let finalH = pdfWidth / ratio;

            // Eğer yükseklik sayfadan taşarsa, yüksekliğe göre sığdır (nadir durum)
            if (finalH > pdfHeight) {
                finalH = pdfHeight;
                finalW = pdfHeight * ratio;
            }

            // Dikeyde ortalamak isterseniz: (pdfHeight - finalH) / 2
            // Genelde üstten başlaması tercih edilir (0)
            pdf.addImage(imgData, 'JPEG', 0, 0, finalW, finalH);
        }

        return pdf;

    } catch (error) {
        console.error("PDF oluşturma hatası:", error);
        throw error;
    } finally {
        // 5. Eski haline getir
        hiddenElements.forEach(el => {
            el.style.display = '';
        });
        document.body.style.backgroundColor = originalBodyBg;
    }
};

export const printService = {
    // PDF İndir (Mevcut Fonksiyon)
    downloadAsPdf: async (title: string = "Bursa-Disleksi-Etkinlik", selector: string = '.worksheet-item') => {
        try {
            const pdf = await generatePdfBlob(title, selector);
            if (pdf) {
                const safeTitle = title.replace(/[^a-z0-9şğüöçİı]/gi, '_').substring(0, 30);
                pdf.save(`${safeTitle}.pdf`);
            }
        } catch (error) {
            console.error(error);
            alert("İndirme sırasında bir hata oluştu.");
        }
    },

    // Yeni Yazdır Fonksiyonu (Aynı mantıkla PDF üretir, yeni sekmede açar ve yazdırır)
    printPdf: async (title: string = "Yazdir", selector: string = '.worksheet-item') => {
        try {
            const pdf = await generatePdfBlob(title, selector);
            if (pdf) {
                // PDF'i otomatik yazdırma moduna ayarla
                pdf.autoPrint();
                
                // Blob URL oluştur
                const blob = pdf.output('blob');
                const url = URL.createObjectURL(blob);
                
                // Yeni sekmede aç
                const printWindow = window.open(url, '_blank');
                if (!printWindow) {
                    alert("Pop-up engelleyici, yazdırma penceresinin açılmasını engelledi. Lütfen izin verin.");
                }
            }
        } catch (error) {
            console.error(error);
            alert("Yazdırma işlemi hazırlanırken bir hata oluştu.");
        }
    }
};
