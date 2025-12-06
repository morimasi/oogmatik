
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
        // Ensure it doesn't interfere with main app flow but is visible to print
        printArea.style.position = 'absolute';
        printArea.style.top = '0';
        printArea.style.left = '0';
        printArea.style.width = '100%';
        printArea.style.zIndex = '9999';
        printArea.style.backgroundColor = 'white';
        
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
                scaler.style.padding = '0';
                scaler.style.overflow = 'visible'; 
                // Force color black on scaler to cascade down
                scaler.style.color = 'black';
            }
            
            // Remove huge paddings from wrapper
            clone.style.padding = '0';
            clone.style.margin = '0';
            clone.style.width = '100%';
            clone.style.boxShadow = 'none';
            clone.style.border = 'none';
            clone.style.overflow = 'visible';
            clone.style.color = 'black'; // Force black text on root of clone
            
            // İç divlerdeki editör paddinglerini temizle (p-[10mm] vb.)
            const innerDivs = clone.querySelectorAll('div');
            innerDivs.forEach(div => {
                if (div.className.includes('p-[')) {
                    div.style.padding = '0';
                }
            });

            // b. Gereksiz UI elemanlarını temizle
            const toRemove = clone.querySelectorAll('.edit-handle, .edit-grid-overlay, .edit-safety-guide, button');
            toRemove.forEach(el => el.remove());

            // c. Form elemanlarının değerlerini senkronize et
            const originalInputs = source.querySelectorAll('input, textarea, select');
            const clonedInputs = clone.querySelectorAll('input, textarea, select');
            
            originalInputs.forEach((inp, i) => {
                if (clonedInputs[i]) {
                    const inputEl = inp as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                    const clonedEl = clonedInputs[i] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                    
                    // Force input styling for print visibility
                    clonedEl.style.color = 'black';
                    clonedEl.style.borderColor = 'black';
                    clonedEl.style.backgroundColor = 'transparent';

                    if (inputEl.type === 'checkbox' || inputEl.type === 'radio') {
                        if ((inputEl as HTMLInputElement).checked) {
                            clonedEl.setAttribute('checked', 'checked');
                            (clonedEl as HTMLInputElement).checked = true;
                        }
                    } else if (inputEl.tagName === 'SELECT') {
                        // For select, we often want to print just the selected text, 
                        // but sticking to input sync:
                        clonedEl.setAttribute('value', inputEl.value);
                        (clonedEl as HTMLSelectElement).value = inputEl.value;
                        
                        // Set selected attribute on the correct option
                        const options = clonedEl.querySelectorAll('option');
                        options.forEach(opt => {
                            if(opt.value === inputEl.value) opt.setAttribute('selected', 'selected');
                        });
                    } else {
                        // Text, Number, Textarea
                        clonedEl.setAttribute('value', inputEl.value);
                        clonedEl.value = inputEl.value;
                        if (inputEl.tagName === 'TEXTAREA') {
                            clonedEl.textContent = inputEl.value;
                            clonedEl.innerHTML = inputEl.value; // For good measure
                        }
                    }
                }
            });

            // d. Klonu ekle
            printArea.appendChild(clone);
        });

        // 5. Yazdırma İşlemini Başlat
        // Small timeout to allow DOM to settle and images to be ready
        setTimeout(() => {
            window.print();
            
            // Optional: Remove after print dialog closes (or user cancels)
            // setTimeout(() => { if(printArea) printArea.remove(); }, 2000);
        }, 500);
    }
};
