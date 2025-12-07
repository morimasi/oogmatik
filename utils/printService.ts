
export const printService = {
    /**
     * Native Browser Print kullanarak yüksek kaliteli vektörel çıktı alır.
     * DOM Klonlama yöntemi ile Canvas ve Input değerlerini korur.
     */
    generatePdf: async (
        elementSelector: string = '.worksheet-page', 
        title: string = "Dokuman", 
        options: { 
            action: 'print' | 'download',
            selectedPages?: number[], // Array of indices (0-based) to print
            grayscale?: boolean,
            includeAnswerKey?: boolean,
            worksheetData?: any[] // Data source for answer key generation
        }
    ) => {
        const pages = document.querySelectorAll(elementSelector);
        if (!pages.length) {
            console.warn("Yazdırılacak sayfa bulunamadı.");
            return;
        }

        // 1. Create Temporary Print Container
        const printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        printContainer.className = 'print-container';
        
        // Apply grayscale filter if requested
        if (options.grayscale) {
            printContainer.style.filter = 'grayscale(100%)';
        }
        
        // 2. Clone and Process Selected Pages
        pages.forEach((page, index) => {
            // Skip if not in selected pages (and selectedPages is defined)
            if (options.selectedPages && !options.selectedPages.includes(index)) {
                return;
            }

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
                    clonedInput.setAttribute('value', originalInput.value);
                    if (originalInput.tagName === 'TEXTAREA') {
                        clonedInput.innerHTML = originalInput.value;
                    }
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
                    ctx.drawImage(canvas, 0, 0);
                }
            });

            // C. Remove Interactive/Edit Elements
            const editHandles = clone.querySelectorAll('.edit-handle, .page-navigator, .no-print');
            editHandles.forEach(el => el.remove());

            // D. Ensure Clone has Print Classes
            clone.classList.add('print-page');
            
            // Append to container
            printContainer.appendChild(clone);
        });

        // 3. Generate Answer Key if Requested
        if (options.includeAnswerKey && options.worksheetData) {
            const answerPage = document.createElement('div');
            answerPage.className = 'worksheet-page print-page'; // Reuse page styling
            answerPage.style.cssText = 'padding: 20mm; page-break-before: always; background: white; width: 210mm; height: 297mm; overflow: hidden;';
            
            let answerHtml = `
                <div style="font-family: sans-serif; color: black;">
                    <h1 style="font-size: 24px; font-weight: bold; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">Cevap Anahtarı</h1>
            `;

            options.worksheetData.forEach((sheet, idx) => {
                // If page was deselected, maybe skip answers? 
                // Logic: Keep all answers or just selected? Let's keep all for reference, or filter if simple.
                // Simpler to list all with Page Number reference.
                
                answerHtml += `<div style="margin-bottom: 20px;">
                    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">Sayfa ${idx + 1}: ${sheet.title}</h3>
                    <div style="font-size: 12px; line-height: 1.5;">`;

                const answers = extractAnswers(sheet);
                if (answers.length > 0) {
                    answerHtml += `<ul style="list-style-type: decimal; padding-left: 20px; column-count: 2;">`;
                    answers.forEach(ans => {
                        answerHtml += `<li>${ans}</li>`;
                    });
                    answerHtml += `</ul>`;
                } else {
                    answerHtml += `<p style="font-style: italic; color: #666;">Otomatik cevap çıkarılamadı veya cevap yok.</p>`;
                }

                answerHtml += `</div></div>`;
            });

            answerHtml += `</div>`;
            answerPage.innerHTML = answerHtml;
            printContainer.appendChild(answerPage);
        }

        // 4. Append Container to Body
        document.body.appendChild(printContainer);

        // 5. Set Title
        const originalTitle = document.title;
        document.title = title || "BursaDisleksiAI-Etkinlik";

        // 6. Trigger Print
        await new Promise(resolve => setTimeout(resolve, 500));
        window.print();

        // 7. Cleanup
        document.title = originalTitle;
        document.body.removeChild(printContainer);
    }
};

// Helper to extract answers from various data structures
function extractAnswers(data: any): string[] {
    const answers: string[] = [];

    // Helper for recursive search in specific fields
    const findIn = (obj: any) => {
        if (!obj) return;
        
        // Common Answer Fields
        if (obj.answer !== undefined) answers.push(String(obj.answer));
        else if (obj.correct !== undefined) answers.push(String(obj.correct));
        else if (obj.solution !== undefined) answers.push(String(obj.solution));
        else if (obj.result !== undefined) answers.push(String(obj.result));
        else if (obj.correctWord !== undefined) answers.push(String(obj.correctWord));
        
        // Specific Structures
        if (obj.operations) obj.operations.forEach((o: any) => answers.push(`${o.num1} ${o.operator} ${o.num2} = ${o.answer}`));
        if (obj.questions) obj.questions.forEach((q: any) => {
            if (q.correct) answers.push(q.correct);
            if (q.answer) answers.push(q.answer);
        });
        if (obj.puzzles) obj.puzzles.forEach((p: any) => findIn(p));
        if (obj.problems) obj.problems.forEach((p: any) => findIn(p));
        if (obj.patterns) obj.patterns.forEach((p: any) => answers.push(p.answer));
        if (obj.words) {
             // For word search/scramble, just list words as "answers"
             if(Array.isArray(obj.words) && typeof obj.words[0] === 'string') {
                 // Too many words? Maybe limit.
                 // answers.push(obj.words.join(', '));
             }
        }
    };

    findIn(data);
    return answers.slice(0, 50); // Limit per page to avoid overflow
}
