
export const printService = {
    /**
     * Global Print Engine.
     * Handles single pages, multi-page workbooks, and continuous flow content (reports).
     */
    generatePdf: async (
        elementSelector: string, 
        title: string = "Dokuman", 
        options: { 
            action: 'print' | 'download',
            selectedPages?: number[], 
            grayscale?: boolean,
            includeAnswerKey?: boolean,
            worksheetData?: any[] 
        }
    ) => {
        // 1. Locate Target Elements
        const elements = document.querySelectorAll(elementSelector);
        if (!elements.length) {
            console.warn("Yazdırılacak içerik bulunamadı (Selector: " + elementSelector + ")");
            alert("Yazdırılacak içerik bulunamadı.");
            return;
        }

        // 2. Prepare Print Container
        const existingContainer = document.getElementById('print-container');
        if (existingContainer) existingContainer.remove();

        const printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        printContainer.className = 'print-container';
        
        if (options.grayscale) {
            printContainer.style.filter = 'grayscale(100%) contrast(1.2)';
        }

        // 3. Process Elements
        // Check if we are printing specific pages (Workbook/Worksheet) or a flow container (Report)
        const isFlowContent = elements.length === 1 && !elements[0].classList.contains('worksheet-page');

        elements.forEach((el, index) => {
            // Filter by selected pages if applicable (Only for page-based content)
            if (!isFlowContent && options.selectedPages && !options.selectedPages.includes(index)) {
                return;
            }

            // Deep clone
            const clone = el.cloneNode(true) as HTMLElement;

            // --- DATA SYNCHRONIZATION ---
            // Input values (textareas, inputs, selects) are not cloned by default
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
                } else if (originalInput.tagName === 'SELECT') {
                     const sel = clonedInput as HTMLSelectElement;
                     sel.value = originalInput.value;
                     Array.from(sel.options).forEach(opt => {
                         if (opt.value === originalInput.value) opt.setAttribute('selected', 'selected');
                     });
                } else {
                    clonedInput.setAttribute('value', originalInput.value);
                }
            });

            // Canvas Content (Bitmaps are not cloned)
            const originalCanvases = (el as HTMLElement).querySelectorAll('canvas');
            const clonedCanvases = clone.querySelectorAll('canvas');
            originalCanvases.forEach((canvas, i) => {
                const clonedCanvas = clonedCanvases[i];
                const ctx = clonedCanvas.getContext('2d');
                if (ctx) {
                    clonedCanvas.width = canvas.width;
                    clonedCanvas.height = canvas.height;
                    ctx.drawImage(canvas, 0, 0);
                }
            });

            // --- CLEANUP & STYLING ---
            
            // Remove UI artifacts
            const artifacts = clone.querySelectorAll('.edit-handle, .page-navigator, .no-print, button, .overlay-ui, .scrollbar-hide');
            artifacts.forEach(e => e.remove());

            // Reset positioning and overflow constraints for print
            clone.style.transform = 'none';
            clone.style.margin = '0';
            clone.style.boxShadow = 'none';
            clone.style.border = 'none';
            clone.style.position = 'relative';
            clone.style.left = 'auto';
            clone.style.top = 'auto';
            clone.style.overflow = 'visible';
            clone.style.height = 'auto';
            clone.style.maxHeight = 'none';
            // Clear inline padding to respect global CSS .print-page padding
            clone.style.padding = ''; 

            // Apply specific print classes based on content type
            if (isFlowContent) {
                // For Reports or single text blocks: Allow natural flow
                clone.classList.add('print-page', 'print-auto-height');
                // Ensure text wraps and is visible
                clone.style.width = '100%';
                clone.style.maxWidth = '210mm'; 
            } else {
                // For Worksheets: Enforce strict page breaks
                clone.classList.add('print-page');
            }
            
            printContainer.appendChild(clone);
        });

        // 4. Generate Answer Key (Only for Worksheets)
        if (options.includeAnswerKey && options.worksheetData) {
            const answerPage = createAnswerKeyPage(options.worksheetData, title);
            printContainer.appendChild(answerPage);
        }

        // 5. Mount & Print
        document.body.appendChild(printContainer);

        // Wait for images to load inside the clone
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
        
        // Small delay for DOM reflow
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.print();

        // Cleanup
        document.title = originalTitle;
        document.body.removeChild(printContainer);
    }
};

function createAnswerKeyPage(data: any[], title: string): HTMLElement {
    const answerPage = document.createElement('div');
    answerPage.className = 'worksheet-page print-page';
    // Use matching padding to standard pages
    answerPage.style.cssText = `
        padding: 10mm; 
        background: white; 
        width: 210mm; 
        height: 297mm; 
        overflow: hidden;
        display: flex;
        flex-direction: column;
        color: black;
        box-sizing: border-box;
    `;
    
    let answerHtml = `
        <div style="font-family: sans-serif; height: 100%;">
            <div style="border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: end;">
                <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase;">Cevap Anahtarı</h1>
                <span style="font-size: 12px;">${title}</span>
            </div>
            <div style="column-count: 2; column-gap: 40px; font-size: 11px;">
    `;

    data.forEach((sheet, idx) => {
        answerHtml += `
            <div style="break-inside: avoid; margin-bottom: 20px;">
                <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 5px; border-bottom: 1px dashed #ccc;">Sayfa ${idx + 1}</h3>
                <ul style="list-style-type: none; padding: 0; margin: 0;">`;

        const answers = extractAnswers(sheet);
        if (answers.length > 0) {
            answers.forEach((ans, i) => {
                answerHtml += `<li style="margin-bottom: 2px;"><strong style="margin-right:5px;">${i+1}.</strong> ${ans}</li>`;
            });
        } else {
            answerHtml += `<li style="font-style: italic; color: #999;">Cevap yok.</li>`;
        }

        answerHtml += `</ul></div>`;
    });

    answerHtml += `</div>
        <div style="margin-top: auto; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
            Bursa Disleksi AI tarafından oluşturulmuştur.
        </div>
    </div>`;
    
    answerPage.innerHTML = answerHtml;
    return answerPage;
}

function extractAnswers(data: any): string[] {
    const answers: string[] = [];

    const findIn = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        
        if (obj.answer !== undefined && obj.answer !== null) { answers.push(String(obj.answer)); return; }
        if (obj.correct !== undefined) { answers.push(String(obj.correct)); return; }
        if (obj.solution !== undefined) { answers.push(String(obj.solution)); return; }
        
        if (Array.isArray(obj)) {
            obj.forEach(item => findIn(item));
            return;
        }

        ['operations', 'questions', 'puzzles', 'problems', 'patterns', 'items'].forEach(key => {
            if (obj[key]) findIn(obj[key]);
        });
    };

    findIn(data);
    return answers.slice(0, 40); 
}
