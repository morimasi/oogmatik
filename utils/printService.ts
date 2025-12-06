
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

        // Add Print-Specific CSS (Iframe Isolation & Eco Mode)
        // CRITICAL: Force display settings to override any potential hiding logic
        // Also simulate Desktop Width (1024px) for better layout retention
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
                        background: white; 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact;
                        width: 100%;
                    }
                    
                    /* Page Break Control */
                    .print-page {
                        /* Force a desktop-like width for the container */
                        width: 1024px !important;
                        min-width: 1024px !important;
                        
                        /* A4 Dimensions (scaled) */
                        /* A4 width is approx 794px. 794 / 1024 = ~0.775 */
                        /* We scale down the container to fit the paper */
                        zoom: 0.775;
                        
                        page-break-after: always;
                        position: relative;
                        overflow: visible; /* Allow overflow if needed but clip usually */
                        background: white;
                        margin: 0;
                        display: block;
                    }
                    .print-page:last-child {
                        page-break-after: auto;
                    }
                    
                    /* Content Scaling Logic */
                    .print-content-wrapper {
                        width: 100%;
                        height: 100%;
                        padding: 0; 
                        box-sizing: border-box;
                    }

                    /* HIDE UI ELEMENTS */
                    .edit-handle, .no-print, .edit-grid-overlay, .print-safety-margin, button {
                        display: none !important;
                    }

                    /* GRID & FLEX ENFORCEMENT */
                    .grid, .dynamic-grid { display: grid !important; }
                    .flex { display: flex !important; }
                    
                    /* Force columns to stay side-by-side (Redundant with zoom but safe) */
                    .grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
                    .grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
                    .grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
                    
                    /* Prevent breaking inside elements */
                    .break-inside-avoid {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
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
                
                /* Reset Scale for Print since we use zoom on container */
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
            if (!settings.showStudentInfo) {
                // Try to find the student info header specifically
                const header = clone.querySelector('.border-b-2.border-zinc-800'); // Weak selector
                const specificHeader = clone.querySelector('.worksheet-content > div.mb-4.pb-1.border-b'); // Stronger selector based on Worksheet.tsx
                
                if (specificHeader) (specificHeader as HTMLElement).style.display = 'none';
                else if (header) (header as HTMLElement).style.display = 'none';
            }

            // Wrap in print-page container to enforce desktop simulation logic
            const pageContainer = doc.createElement('div');
            pageContainer.className = 'print-page';
            
            const contentWrapper = doc.createElement('div');
            contentWrapper.className = 'print-content-wrapper';
            contentWrapper.appendChild(clone);
            
            pageContainer.appendChild(contentWrapper);
            
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
            
            // Cleanup after print dialog closes (or user cancels)
            setTimeout(() => {
               document.body.removeChild(iframe);
            }, 5000); 
        }, 800); // Wait slightly longer for styles and images to settle
    }
};
