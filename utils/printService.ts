
import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { PDFWorkbook } from './pdfGenerator';
import { WorksheetData, StyleSettings, StudentProfile } from '../types';

export const printService = {
    /**
     * Native Browser Print kullanarak yüksek kaliteli vektörel çıktı alır.
     * DOM Klonlama yöntemi ile Canvas ve Input değerlerini korur.
     * Hızlı yazdırma (Ctrl+P) için kullanılır.
     */
    generatePdf: async (elementSelector: string = '.worksheet-page', title: string = "Dokuman", options: { action: 'print' | 'download' }) => {
        if (options.action === 'download') {
            console.warn("generatePdf called with download action. Use downloadPDF method for React-PDF generation.");
            return;
        }

        const pages = document.querySelectorAll(elementSelector);
        if (!pages.length) {
            console.warn("Yazdırılacak sayfa bulunamadı.");
            return;
        }

        // 1. Create Temporary Print Container
        const printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        printContainer.className = 'print-container';
        
        // 2. Clone and Process Pages
        pages.forEach((page, index) => {
            const clone = page.cloneNode(true) as HTMLElement;
            
            // Handle Inputs
            const originalInputs = page.querySelectorAll('input, textarea, select');
            const clonedInputs = clone.querySelectorAll('input, textarea, select');
            originalInputs.forEach((input, i) => {
                const clonedInput = clonedInputs[i] as HTMLInputElement;
                const originalInput = input as HTMLInputElement;
                if (originalInput.type === 'checkbox' || originalInput.type === 'radio') {
                    if (originalInput.checked) clonedInput.setAttribute('checked', 'checked');
                } else {
                    clonedInput.setAttribute('value', originalInput.value);
                    if (originalInput.tagName === 'TEXTAREA') clonedInput.innerHTML = originalInput.value;
                    if (originalInput.tagName === 'SELECT') clonedInput.value = originalInput.value;
                }
            });

            // Handle Canvases
            const originalCanvases = page.querySelectorAll('canvas');
            const clonedCanvases = clone.querySelectorAll('canvas');
            originalCanvases.forEach((canvas, i) => {
                const clonedCanvas = clonedCanvases[i];
                const ctx = clonedCanvas.getContext('2d');
                if (ctx) ctx.drawImage(canvas, 0, 0);
            });

            // Cleanup UI elements
            const editHandles = clone.querySelectorAll('.edit-handle, .page-navigator, .no-print');
            editHandles.forEach(el => el.remove());

            clone.classList.add('print-page');
            printContainer.appendChild(clone);
        });

        document.body.appendChild(printContainer);
        const originalTitle = document.title;
        document.title = title || "BursaDisleksiAI-Etkinlik";

        await new Promise(resolve => setTimeout(resolve, 500));
        window.print();

        document.title = originalTitle;
        document.body.removeChild(printContainer);
    },

    /**
     * @react-pdf/renderer kullanarak gerçek bir PDF dosyası (Blob) oluşturur ve indirir.
     * Bu yöntem seçilebilir metin ve %100 vektörel çıktı sağlar.
     */
    downloadPDF: async (data: WorksheetData, settings: StyleSettings, filename: string = "etkinlik.pdf", studentProfile?: StudentProfile) => {
        try {
            // Create React Element
            const doc = React.createElement(PDFWorkbook, { data, settings, studentProfile });
            
            // Generate Blob
            const blob = await pdf(doc).toBlob();
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("PDF oluşturulurken bir hata meydana geldi.");
        }
    }
};
