
import { WorkbookSettings } from "../types";

export interface PrintSettings {
    title: string;
    studentName?: string;
    showStudentInfo: boolean;
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
        // We select the actual worksheet pages rendered in the DOM
        const pages = document.querySelectorAll('.worksheet-item');
        if (pages.length === 0) {
            alert("Yazdırılacak içerik bulunamadı.");
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

        // Add Print-Specific CSS (Iframe Isolation & Eco Mode)
        doc.write(`
            <style>
                @media print {
                    @page { 
                        size: ${settings.orientation === 'landscape' ? 'landscape' : 'portrait'} A4; 
                        margin: 0;
                    }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        background: white; 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact;
                    }
                    .print-page {
                        width: ${settings.orientation === 'landscape' ? '297mm' : '210mm'};
                        height: ${settings.orientation === 'landscape' ? '210mm' : '297mm'}; /* Fixed height for page break */
                        page-break-after: always;
                        position: relative;
                        overflow: hidden;
                        background: white;
                        margin: 0 auto;
                    }
                    .print-page:last-child {
                        page-break-after: auto;
                    }
                    
                    /* HIDE UI ELEMENTS */
                    .edit-handle, .no-print, .edit-grid-overlay, .print-safety-margin, button {
                        display: none !important;
                    }

                    /* ECO MODE STYLES */
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
                        /* Keep borders for boxes that lost background */
                        border: 1px solid #000 !important; 
                    }
                    body.eco-mode [class*="text-"] {
                        color: black !important;
                    }
                    body.eco-mode svg {
                        fill: white !important;
                        stroke: black !important;
                    }
                    /* Exception for Eco Mode: Keep intentional black fills */
                    body.eco-mode svg [fill="#000"], 
                    body.eco-mode svg [fill="black"], 
                    body.eco-mode svg [fill="#000000"] {
                        fill: black !important;
                    }
                    body.eco-mode img {
                        filter: grayscale(100%) contrast(120%);
                    }
                }
                
                /* Reset Scale for Print */
                .worksheet-scaler {
                    transform: none !important;
                    width: 100% !important;
                    height: 100% !important;
                }
            </style>
        `);
        doc.write('</head><body class="' + (settings.ecoMode ? 'eco-mode' : '') + '">');

        // 4. Clone and Inject Pages
        pages.forEach((page, index) => {
            const clone = page.cloneNode(true) as HTMLElement;
            
            // Remove edit-mode overlays from clone
            const overlays = clone.querySelectorAll('.edit-grid-overlay, .print-safety-margin, .edit-handle');
            overlays.forEach(el => el.remove());

            // Handle Student Info Visibility via Settings override
            // We find the header strip and toggle display
            if (!settings.showStudentInfo) {
                const header = clone.querySelector('.border-b-2.border-zinc-800'); // Heuristic selector for student header
                if (header) (header as HTMLElement).style.display = 'none';
            }

            // Wrap in print-page container
            const pageContainer = doc.createElement('div');
            pageContainer.className = 'print-page';
            pageContainer.appendChild(clone);
            
            // Inject into body
            doc.body.appendChild(pageContainer);
        });

        // 5. Optional: Answer Key Placeholder Page
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
            
            // Cleanup
            // setTimeout(() => {
            //    document.body.removeChild(iframe);
            // }, 1000); 
            // Keeping iframe briefly helps on some browsers, or remove immediately after print dialog closes
        }, 500); // Wait for styles to load
    }
};
