
import { WorkbookSettings } from "../types";

export interface PrintSettings {
    title: string;
    studentName?: string;
    showStudentInfo: boolean;
    showTitle: boolean;
    showInstructions: boolean;
    showWatermark: boolean;
    showPageNumbers: boolean;
    scale: number; // Percentage (e.g., 100)
    ecoMode: boolean; // Ink Saver
    includeAnswerKeyPlaceholder: boolean; // Adds a blank page for manual answers
    copies: number;
    orientation: 'portrait' | 'landscape';
}

export const printService = {
    printWorksheet: (settings: PrintSettings) => {
        // 1. Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        // 2. Gather Content
        const pages = document.querySelectorAll('.worksheet-item');
        if (pages.length === 0) {
            alert("Yazdırılacak içerik bulunamadı.");
            document.body.removeChild(iframe);
            return;
        }

        // 3. Build HTML Structure
        doc.open();
        doc.write('<!DOCTYPE html><html><head><title>' + settings.title + '</title>');
        
        // Copy styles from main document (Tailwind CDN and local styles)
        const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach(style => {
            doc.write(style.outerHTML);
        });

        // Calculate Scale Factor
        // Base zoom for A4 fitting is approx 0.775 (794px / 1024px)
        const baseFitRatio = 0.775;
        const userScaleRatio = settings.scale / 100;
        const finalZoom = baseFitRatio * userScaleRatio;

        // Add Print-Specific CSS
        doc.write(`
            <style>
                @media print {
                    @page { 
                        size: ${settings.orientation === 'landscape' ? 'landscape' : 'portrait'} A4; 
                        margin: 0mm;
                    }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        background: white !important; 
                        color: black !important;
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                        width: 100%;
                    }
                    
                    /* Page Break Control & Scaling */
                    .print-page {
                        width: 1024px !important;
                        min-width: 1024px !important;
                        zoom: ${finalZoom};
                        page-break-after: always;
                        position: relative;
                        overflow: visible !important; 
                        background: white !important;
                        margin: 0;
                        display: block;
                        color: black !important;
                    }
                    .print-page:last-child {
                        page-break-after: auto;
                    }
                    
                    .print-content-wrapper {
                        width: 100%;
                        height: 100%;
                        padding: 0; 
                        box-sizing: border-box;
                        overflow: visible !important;
                    }

                    /* HIDE UI ELEMENTS */
                    .edit-handle, .no-print, .edit-grid-overlay, .edit-safety-guide, button {
                        display: none !important;
                    }

                    /* VISIBILITY TOGGLES */
                    ${!settings.showStudentInfo ? '.print-student-info { display: none !important; }' : ''}
                    ${!settings.showTitle ? '.print-header-title { display: none !important; }' : ''}
                    ${!settings.showInstructions ? '.print-header-instruction { display: none !important; }' : ''}
                    ${!settings.showWatermark ? '.print-watermark { display: none !important; }' : ''}
                    ${!settings.showPageNumbers ? '.print-page-footer { display: none !important; }' : ''}

                    /* GRID & FLEX ENFORCEMENT */
                    .grid, .dynamic-grid { display: grid !important; }
                    .flex { display: flex !important; }
                    .grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
                    .grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
                    .grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
                    
                    .break-inside-avoid {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    /* COLOR CORRECTION FOR PRINT (Fix White Text Issue) */
                    [class*="text-white"], 
                    [class*="text-zinc-50"], 
                    [class*="text-zinc-100"], 
                    [class*="text-zinc-200"],
                    [class*="text-zinc-300"],
                    [class*="dark:text-white"],
                    [class*="dark:text-zinc-100"],
                    [class*="dark:text-zinc-200"] {
                        color: black !important;
                    }
                    
                    /* Ensure inputs are visible */
                    input, textarea, select {
                        color: black !important;
                        background: transparent !important;
                        border-color: #e5e7eb !important;
                    }

                    /* ECO MODE */
                    body.eco-mode {
                        color: black !important;
                    }
                    body.eco-mode * {
                        border-color: black !important;
                        text-shadow: none !important;
                        box-shadow: none !important;
                    }
                    body.eco-mode [class*="bg-"] {
                        background-color: transparent !important;
                        border: 1px solid #000 !important; 
                    }
                    body.eco-mode svg {
                        fill: white !important;
                        stroke: black !important;
                    }
                    body.eco-mode svg [fill="#000"], 
                    body.eco-mode svg [fill="black"] {
                        fill: black !important;
                    }
                    body.eco-mode img {
                        filter: grayscale(100%) contrast(120%);
                    }
                }
                
                .worksheet-scaler {
                    transform: none !important;
                    width: 100% !important;
                    height: 100% !important;
                }
            </style>
        `);
        doc.write('</head><body class="' + (settings.ecoMode ? 'eco-mode' : '') + '">');

        // 4. Clone and Inject Pages
        pages.forEach((page) => {
            const clone = page.cloneNode(true) as HTMLElement;
            
            // SYNC INPUT VALUES (Fix for blank inputs)
            // React state doesn't update the DOM 'value' attribute, so cloning misses it.
            // We must manually copy values from source to clone.
            const originalInputs = page.querySelectorAll('input, textarea, select');
            const clonedInputs = clone.querySelectorAll('input, textarea, select');
            
            originalInputs.forEach((input, i) => {
                if (clonedInputs[i]) {
                    const val = (input as HTMLInputElement).value;
                    if ((input as HTMLInputElement).type === 'checkbox' || (input as HTMLInputElement).type === 'radio') {
                         if((input as HTMLInputElement).checked) {
                             (clonedInputs[i] as HTMLInputElement).setAttribute('checked', 'checked');
                         }
                    } else {
                        (clonedInputs[i] as HTMLInputElement).setAttribute('value', val);
                        (clonedInputs[i] as HTMLInputElement).value = val;
                        // For textarea
                        if (input.tagName === 'TEXTAREA') {
                            clonedInputs[i].textContent = val;
                        }
                    }
                }
            });

            // Remove edit-mode overlays
            const overlays = clone.querySelectorAll('.edit-grid-overlay, .edit-safety-guide, .edit-handle');
            overlays.forEach(el => el.remove());

            const pageContainer = doc.createElement('div');
            pageContainer.className = 'print-page';
            
            const contentWrapper = doc.createElement('div');
            contentWrapper.className = 'print-content-wrapper';
            contentWrapper.appendChild(clone);
            
            pageContainer.appendChild(contentWrapper);
            doc.body.appendChild(pageContainer);
        });

        // 5. Answer Key Placeholder
        if (settings.includeAnswerKeyPlaceholder) {
            const answerPage = doc.createElement('div');
            answerPage.className = 'print-page';
            answerPage.innerHTML = `
                <div style="padding: 20mm; height: 100%; display: flex; flex-direction: column;">
                    <h1 style="font-size: 24px; font-weight: bold; text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">CEVAP ANAHTARI / NOTLAR</h1>
                    <div style="flex: 1; border: 2px dashed #ccc; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #999;">
                        (Bu sayfa öğretmen notları için ayrılmıştır)
                    </div>
                    <div style="margin-top: 20px; text-align: center; font-size: 12px;">${settings.title} - ${new Date().toLocaleDateString('tr-TR')}</div>
                </div>
            `;
            doc.body.appendChild(answerPage);
        }

        doc.write('</body></html>');
        doc.close();

        // 6. Trigger Print
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            
            setTimeout(() => {
               document.body.removeChild(iframe);
            }, 5000); 
        }, 1000); 
    }
};
