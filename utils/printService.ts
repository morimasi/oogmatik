
export const printService = {
    /**
     * Global Print Engine.
     * Handles single pages, multi-page workbooks, and continuous flow content.
     * Uses the 'Reading Studio' cloning logic to ensure pixel-perfect multi-page output.
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

        // 3. Process Elements with Advanced Reading-Studio Logic
        elements.forEach((el, index) => {
            // Filter by selected pages if applicable
            if (options.selectedPages && !options.selectedPages.includes(index)) {
                return;
            }

            // Deep clone to separate from live UI
            const clone = el.cloneNode(true) as HTMLElement;

            // --- DATA & UI CLEANUP ---
            // Sync Input Values
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
                } else {
                    clonedInput.setAttribute('value', originalInput.value);
                }
            });

            // Remove UI garbage
            const uiGarbage = clone.querySelectorAll('.edit-handle, .page-navigator, .no-print, button, .overlay-ui, .scrollbar-hide, [data-testid="edit-btn"]');
            uiGarbage.forEach(e => e.remove());

            // --- PRINT LAYOUT ENFORCEMENT ---
            // Remove transform/flex constraints that might limit height
            clone.style.transform = 'none';
            clone.style.margin = '0';
            clone.style.boxShadow = 'none';
            clone.style.position = 'relative';
            clone.style.left = 'auto';
            clone.style.top = 'auto';
            clone.style.overflow = 'visible';
            clone.style.height = 'auto'; 
            clone.style.minHeight = '297mm';
            
            // Add global print class
            clone.classList.add('print-page');
            
            printContainer.appendChild(clone);
        });

        // 4. Generate Answer Key if requested
        if (options.includeAnswerKey && options.worksheetData) {
            const answerPage = createAnswerKeyPage(options.worksheetData, title);
            printContainer.appendChild(answerPage);
        }

        // 5. Mount & Print
        document.body.appendChild(printContainer);

        // Wait for all images in the clone to be ready
        const images = printContainer.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; 
            });
        });
        await Promise.all(imagePromises);

        // Trigger Print with correct filename metadata
        const originalTitle = document.title;
        document.title = title.replace(/[^a-z0-9]/gi, '_');
        
        // Small delay for DOM reflow after container injection
        await new Promise(resolve => setTimeout(resolve, 300));
        
        window.print();

        // Cleanup
        document.title = originalTitle;
        document.body.removeChild(printContainer);
    }
};

function createAnswerKeyPage(data: any[], title: string): HTMLElement {
    const answerPage = document.createElement('div');
    answerPage.className = 'worksheet-page print-page';
    answerPage.style.cssText = `
        padding: 20mm; 
        background: white !important; 
        width: 210mm; 
        min-height: 297mm; 
        display: flex;
        flex-direction: column;
        color: black !important;
        box-sizing: border-box;
    `;
    
    let answerHtml = `
        <div style="font-family: sans-serif;">
            <div style="border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: end;">
                <h1 style="font-size: 28px; font-weight: 900; text-transform: uppercase;">Cevap Anahtarı</h1>
                <span style="font-size: 14px; font-weight: bold;">${title}</span>
            </div>
            <div style="column-count: 2; column-gap: 40px;">
    `;

    data.forEach((sheet, idx) => {
        answerHtml += `
            <div style="break-inside: avoid; margin-bottom: 25px;">
                <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 8px; color: #4f46e5; border-bottom: 1px solid #eee;">Sayfa ${idx + 1}</h3>
                <ul style="list-style-type: none; padding: 0; margin: 0; font-size: 13px;">`;

        const answers = extractAnswers(sheet);
        if (answers.length > 0) {
            answers.forEach((ans, i) => {
                answerHtml += `<li style="margin-bottom: 4px; display: flex; gap: 8px;"><strong style="color: #666; min-width: 20px;">${i+1}.</strong> <span>${ans}</span></li>`;
            });
        } else {
            answerHtml += `<li style="font-style: italic; color: #999;">Bu sayfada otomatik yanıt bulunamadı.</li>`;
        }

        answerHtml += `</ul></div>`;
    });

    answerHtml += `</div>
        <div style="margin-top: auto; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; font-weight: bold; letter-spacing: 2px;">
            BURSA DİSLEKSİ AI • YAPAY ZEKA DESTEKLİ EĞİTİM MATERYALİ
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

        // Search in common data keys
        ['operations', 'questions', 'puzzles', 'problems', 'patterns', 'items', 'checks', 'ladders'].forEach(key => {
            if (obj[key]) findIn(obj[key]);
        });
    };

    findIn(data);
    return [...new Set(answers)].slice(0, 50); 
}
