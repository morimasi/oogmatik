
// @ts-ignore
import html2canvas from 'html2canvas';

export const snapshotService = {
    /**
     * Belirli bir DOM elementinin yüksek çözünürlüklü ekran görüntüsünü alır.
     * Editör araçlarını (kalem, silgi, butonlar) otomatik gizler.
     */
    takeSnapshot: async (elementSelector: string, fileName: string): Promise<void> => {
        const elements = document.querySelectorAll(elementSelector);
        if (!elements || elements.length === 0) {
            alert("Görüntü alınacak içerik bulunamadı.");
            return;
        }

        // Genellikle ilk sayfayı kapak/önizleme olarak alırız. 
        // İsteğe göre tüm sayfalar döngüye alınabilir ama UX açısından tek sayfa snapshot daha yaygındır.
        const targetElement = elements[0] as HTMLElement;

        // 1. Temizlik: UI öğelerini geçici olarak gizle
        const uiElements = document.querySelectorAll('.edit-handle, .page-navigator, .no-print, .overlay-ui');
        uiElements.forEach((el: any) => {
            el.dataset.originalDisplay = el.style.display;
            el.style.display = 'none';
        });

        // 2. Özel Stil Ayarları (Beyaz Arka Plan Garantisi)
        const originalBg = targetElement.style.backgroundColor;
        targetElement.style.backgroundColor = '#ffffff';

        try {
            // 3. Render (2x Scale for Retina Quality)
            const canvas = await html2canvas(targetElement, {
                scale: 2, 
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                ignoreElements: (element) => {
                    return element.classList.contains('no-print') || element.classList.contains('edit-handle');
                }
            });

            // 4. İndirme İşlemi
            const link = document.createElement('a');
            link.download = `${fileName}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("Snapshot hatası:", err);
            throw new Error("Görüntü oluşturulurken bir hata meydana geldi.");
        } finally {
            // 5. Temizliği Geri Al (Restore UI)
            uiElements.forEach((el: any) => {
                el.style.display = el.dataset.originalDisplay || '';
            });
            targetElement.style.backgroundColor = originalBg;
        }
    }
};
