
export const printService = {
    /**
     * Native Browser Print kullanarak yüksek kaliteli vektörel çıktı alır.
     * DOM Klonlama yöntemi ile Canvas ve Input değerlerini korur.
     */
    generatePdf: async (elementSelector: string = '.worksheet-page', title: string = "Dokuman", options: { action: 'print' | 'download' }) => {
        const pages = document.querySelectorAll(elementSelector);
        if (!pages.length) {
            console.warn("Yazdırılacak sayfa bulunamadı.");
            return;
        }

        // 1. Create Temporary Print Container
        // This container sits outside the React root
        const printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        printContainer.className = 'print-container';
        
        // 2. Clone and Process Pages
        pages.forEach((page, index) => {
            // Deep clone the page
            const clone = page.cloneNode(true) as HTMLElement;
            
            // --- CRITICAL FIXES FOR CLONED NODES ---

            // A. Handle Inputs & Textareas (Values are not cloned by default)
            const originalInputs = page.querySelectorAll('input, textarea, select');
            const clonedInputs = clone.querySelectorAll('input, textarea, select');
            
            originalInputs.forEach((input, i) => {
                const clonedInput = clonedInputs[i] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                const originalInput = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                
                if (originalInput.type === 'checkbox' || originalInput.type === 'radio') {
                    if ((originalInput as HTMLInputElement).checked) {
                        clonedInput.setAttribute('checked', 'checked');
                    }
                } else {
                    // For text inputs and textareas, set the value attribute explicitly
                    clonedInput.setAttribute('value', originalInput.value);
                    // For textareas, also set text content for compatibility
                    if (originalInput.tagName === 'TEXTAREA') {
                        clonedInput.innerHTML = originalInput.value;
                    }
                    // For selects, set the value
                    if (originalInput.tagName === 'SELECT') {
                        clonedInput.value = originalInput.value;
                    }
                }
            });

            // B. Handle Canvas Elements (Drawings are not cloned)
            const originalCanvases = page.querySelectorAll('canvas');
            const clonedCanvases = clone.querySelectorAll('canvas');
            
            originalCanvases.forEach((canvas, i) => {
                const clonedCanvas = clonedCanvases[i];
                const ctx = clonedCanvas.getContext('2d');
                if (ctx) {
                    // Copy the image data from the original canvas
                    ctx.drawImage(canvas, 0, 0);
                }
            });

            // C. Remove Interactive/Edit Elements from Clone
            const editHandles = clone.querySelectorAll('.edit-handle, .page-navigator, .no-print');
            editHandles.forEach(el => el.remove());

            // D. Ensure Clone has Print Classes
            clone.classList.add('print-page');
            
            // Append to container
            printContainer.appendChild(clone);
        });

        // 3. Append Container to Body
        document.body.appendChild(printContainer);

        // 4. Set Title for File Name
        const originalTitle = document.title;
        document.title = title || "BursaDisleksiAI-Etkinlik";

        // 5. Trigger Print
        // Small delay to ensure DOM update and image rendering
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.print();

        // 6. Cleanup
        document.title = originalTitle;
        document.body.removeChild(printContainer);
    }
};
