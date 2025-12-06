
/**
 * AKILLI A4 YAZDIRMA MOTORU
 * Ekranda görünen içeriği (Worksheet) vektörel olarak klonlar,
 * A4 formatına oturtur (3mm kenar boşluğu ile).
 */

export const printService = {
    printWorksheet: (title: string = "Etkinlik") => {
        // 1. Yazdırılacak kaynağı bul (Genellikle .worksheet-item veya ana kapsayıcı)
        const contentSources = document.querySelectorAll('.worksheet-item');
        
        if (!contentSources || contentSources.length === 0) {
            alert("Yazdırılacak içerik bulunamadı.");
            return;
        }

        // 2. Varsa eski yazdırma alanını temizle
        const oldArea = document.getElementById('printable-area');
        if (oldArea) oldArea.remove();

        // 3. Yeni yazdırma alanını oluştur
        const printArea = document.createElement('div');
        printArea.id = 'printable-area';
        document.body.appendChild(printArea);

        // 4. İçerikleri Klonla ve İşle
        contentSources.forEach((source) => {
            const clone = source.cloneNode(true) as HTMLElement;
            
            // a. Stil temizliği: Scale transform'u kaldır, genişliği otomatiğe al
            const scaler = clone.querySelector('.worksheet-scaler') as HTMLElement;
            if (scaler) {
                scaler.style.transform = 'none';
                scaler.style.width = '100%';
                scaler.style.height = 'auto';
                scaler.style.padding = '0'; // Remove extra padding from scaler if any
            }
            
            // Remove huge paddings from wrapper
            clone.style.padding = '0';
            clone.style.margin = '0';
            clone.style.width = '100%';
            clone.style.boxShadow = 'none';
            clone.style.border = 'none';

            // b. Gereksiz UI elemanlarını temizle (Editör butonları vb.)
            const toRemove = clone.querySelectorAll('.edit-handle, .edit-grid-overlay, .edit-safety-guide, button');
            toRemove.forEach(el => el.remove());

            // c. Form elemanlarının değerlerini senkronize et
            const originalInputs = source.querySelectorAll('input, textarea, select');
            const clonedInputs = clone.querySelectorAll('input, textarea, select');
            originalInputs.forEach((inp, i) => {
                if (clonedInputs[i]) {
                    const val = (inp as HTMLInputElement).value;
                    if ((inp as HTMLInputElement).type === 'checkbox' || (inp as HTMLInputElement).type === 'radio') {
                        if ((inp as HTMLInputElement).checked) {
                            (clonedInputs[i] as HTMLInputElement).setAttribute('checked', 'checked');
                        }
                    } else {
                        (clonedInputs[i] as HTMLInputElement).setAttribute('value', val);
                        if (inp.tagName === 'TEXTAREA') clonedInputs[i].textContent = val;
                    }
                }
            });

            // d. Klonu ekle
            printArea.appendChild(clone);
        });

        // 5. Yazdırma İşlemini Başlat
        setTimeout(() => {
            window.print();
            // Temizlik opsiyonel, debug için comment out yapılabilir
            // setTimeout(() => { if(printArea) printArea.remove(); }, 1000);
        }, 500);
    }
};
