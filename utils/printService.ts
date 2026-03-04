
export const printService = {
    /**
     * Global Direct Print Engine.
     * Clones elements, cleans up UI, and triggers browser print dialog.
     * Fixed for A4 alignment and cutting issues.
     */
    generatePdf: async (
        elementSelector: string, 
        title: string = "Bursa_Disleksi_AI_Etkinlik", 
        options: { 
            action: 'print' | 'download',
            selectedPages?: number[],
            grayscale?: boolean,
            includeAnswerKey?: boolean,
            worksheetData?: any[] 
        }
    ) => {
        // 1. Locate Target Elements
        let elements = Array.from(document.querySelectorAll(elementSelector));
        
        if (options.selectedPages && options.selectedPages.length > 0) {
            elements = elements.filter((_, idx) => options.selectedPages!.includes(idx));
        }

        if (!elements.length) {
            console.warn("Yazdırılacak içerik bulunamadı (Selector: " + elementSelector + ")");
            return;
        }

        // 2. Prepare Print Container (Clean Slate)
        const existingContainer = document.getElementById('print-container');
        if (existingContainer) existingContainer.remove();

        const printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        
        // Force reset any potential parent positioning
        printContainer.style.setProperty('position', 'absolute', 'important');
        printContainer.style.setProperty('top', '0', 'important');
        printContainer.style.setProperty('left', '0', 'important');
        printContainer.style.setProperty('width', '210mm', 'important');
        printContainer.style.setProperty('margin', '0', 'important');
        printContainer.style.setProperty('padding', '0', 'important');
        printContainer.style.setProperty('background', 'white', 'important');
        printContainer.style.setProperty('z-index', '9999999', 'important');

        if (options.grayscale) {
            printContainer.style.filter = 'grayscale(100%) contrast(1.1)';
        }

        // 3. Process and Clone Elements
        elements.forEach((el) => {
            const clone = el.cloneNode(true) as HTMLElement;

            // Sync current input/textarea values
            const originalInputs = (el as HTMLElement).querySelectorAll('input, textarea, select');
            const clonedInputs = clone.querySelectorAll('input, textarea, select');

            originalInputs.forEach((input, i) => {
                const clonedInput = clonedInputs[i] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                const originalInput = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                
                if (originalInput.type === 'checkbox' || originalInput.type === 'radio') {
                    if ((originalInput as HTMLInputElement).checked) clonedInput.setAttribute('checked', 'checked');
                } else if (originalInput.tagName === 'TEXTAREA') {
                     clonedInput.innerHTML = originalInput.value;
                     clonedInput.value = originalInput.value;
                } else {
                    clonedInput.setAttribute('value', originalInput.value);
                }
            });

            // CRITICAL: Cleanup UI noise and reset transforms
            const uiGarbage = clone.querySelectorAll('.edit-handle, .page-navigator, .no-print, button, .overlay-ui, [data-testid="edit-btn"], .page-label-container');
            uiGarbage.forEach(e => e.remove());

            // Reset ALL styles that might cause misalignment
            clone.style.setProperty('transform', 'none', 'important');
            clone.style.setProperty('margin', '0', 'important');
            clone.style.setProperty('box-shadow', 'none', 'important');
            clone.style.setProperty('position', 'relative', 'important');
            clone.style.setProperty('top', '0', 'important');
            clone.style.setProperty('left', '0', 'important');
            clone.style.setProperty('width', '210mm', 'important');
            clone.style.setProperty('min-height', '297mm', 'important');
            clone.style.setProperty('box-sizing', 'border-box', 'important');
            clone.style.setProperty('display', 'flex', 'important');
            clone.style.setProperty('flex-direction', 'column', 'important');
            clone.style.setProperty('overflow', 'visible', 'important');
            clone.style.setProperty('page-break-after', 'always', 'important');
            
            clone.classList.add('print-page');
            
            printContainer.appendChild(clone);
        });

        document.body.appendChild(printContainer);

        // Wait for images to load to prevent blank prints
        const images = printContainer.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; 
            });
        });
        await Promise.all(imagePromises);

        // Trigger Print
        const originalTitle = document.title;
        document.title = title.replace(/[^a-z0-9]/gi, '_');
        
        // Small delay to ensure browser layout engine settles
        await new Promise(resolve => setTimeout(resolve, 800));
        
        window.print();

        // Cleanup
        document.title = originalTitle;
        setTimeout(() => {
             if (printContainer.parentNode) {
                 document.body.removeChild(printContainer);
             }
        }, 1000);
    }
};
