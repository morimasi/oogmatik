
export const printService = {
    /**
     * Global Direct Print Engine.
     * Clones elements, cleans up UI, and triggers browser print dialog.
     * Content flows naturally across A4 sheets.
     */
    generatePdf: async (
        elementSelector: string, 
        title: string = "Bursa_Disleksi_AI_Etkinlik", 
        options: { 
            action: 'print' | 'download',
            // Added selectedPages parameter to fix type error in PrintPreviewModal.tsx
            selectedPages?: number[],
            grayscale?: boolean,
            includeAnswerKey?: boolean,
            worksheetData?: any[] 
        }
    ) => {
        // 1. Locate Target Elements
        let elements = Array.from(document.querySelectorAll(elementSelector));
        
        // Added logic to filter printed elements based on user selection in PrintPreviewModal
        if (options.selectedPages && options.selectedPages.length > 0) {
            elements = elements.filter((_, idx) => options.selectedPages!.includes(idx));
        }

        if (!elements.length) {
            console.warn("Yazdırılacak içerik bulunamadı (Selector: " + elementSelector + ")");
            return;
        }

        // 2. Prepare Print Container
        const existingContainer = document.getElementById('print-container');
        if (existingContainer) existingContainer.remove();

        const printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        
        // Print container styling to avoid UI interference
        printContainer.style.position = 'fixed';
        printContainer.style.top = '0';
        printContainer.style.left = '0';
        printContainer.style.width = '100%';
        printContainer.style.zIndex = '-9999';
        printContainer.style.visibility = 'hidden';

        if (options.grayscale) {
            printContainer.style.filter = 'grayscale(100%) contrast(1.1)';
        }

        // 3. Process and Clone Elements
        elements.forEach((el) => {
            const clone = el.cloneNode(true) as HTMLElement;

            // --- DATA SYNC ---
            // Sync current input/textarea values to the clone
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

            // --- UI CLEANUP ---
            // Remove UI garbage that shouldn't be printed
            const uiGarbage = clone.querySelectorAll('.edit-handle, .page-navigator, .no-print, button, .overlay-ui, [data-testid="edit-btn"], .page-label-container');
            uiGarbage.forEach(e => e.remove());

            // --- PRINT LAYOUT RESET ---
            // Force reset dimensions to match A4 expectations in print engine
            clone.style.transform = 'none';
            clone.style.margin = '0 auto';
            clone.style.boxShadow = 'none';
            clone.style.position = 'relative';
            clone.style.overflow = 'visible';
            clone.style.height = 'auto'; 
            clone.style.minHeight = '297mm';
            clone.style.width = '210mm';
            clone.style.pageBreakAfter = 'always';
            
            clone.classList.add('print-page');
            
            printContainer.appendChild(clone);
        });

        // 4. Mount & Wait for Assets
        document.body.appendChild(printContainer);

        // Wait for images to load
        const images = printContainer.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; 
            });
        });
        await Promise.all(imagePromises);

        // 5. Trigger Print
        const originalTitle = document.title;
        document.title = title.replace(/[^a-z0-9]/gi, '_');
        
        // Small delay for browser rendering engine to stabilize clone
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.print();

        // 6. Final Cleanup
        document.title = originalTitle;
        document.body.removeChild(printContainer);
    }
};
