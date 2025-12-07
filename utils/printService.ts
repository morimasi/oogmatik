import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { PDFWorkbookDocument } from './pdf/PDFBuilder';
import { CollectionItem, WorkbookSettings } from '../types';

export const printService = {
    /**
     * Generates a true vector PDF using @react-pdf/renderer.
     * Replaces the DOM screenshot method for superior quality and text selectability.
     */
    generatePdf: async (
        // Selector is ignored now, kept for signature compatibility if needed during refactor,
        // but we expect 'items' and 'settings' to be passed in a structured way.
        _selectorOrData: string | { items: CollectionItem[], settings: WorkbookSettings }, 
        title: string = "Dokuman", 
        options: { action: 'print' | 'download' }
    ) => {
        
        let items: CollectionItem[] = [];
        let settings: WorkbookSettings = {
            title: title,
            studentName: '',
            schoolName: '',
            year: new Date().getFullYear().toString(),
            teacherNote: '',
            theme: 'modern',
            accentColor: '#4f46e5',
            coverStyle: 'centered',
            showTOC: false,
            showPageNumbers: true,
            showWatermark: false,
            watermarkOpacity: 0.05,
            showBackCover: true
        };

        // Check if we received structured data (New Method) or a Selector (Legacy Fallback attempt)
        if (typeof _selectorOrData === 'object' && 'items' in _selectorOrData) {
            items = _selectorOrData.items;
            settings = { ...settings, ..._selectorOrData.settings };
        } else {
            console.warn("Legacy DOM selector passed to Vector PDF engine. This is not supported. Please pass structured data.");
            return;
        }

        try {
            // Generate PDF Blob
            // Using React.createElement to avoid JSX in .ts file
            const doc = React.createElement(PDFWorkbookDocument, { items, settings });
            const blob = await pdf(doc).toBlob();
            
            const url = URL.createObjectURL(blob);

            if (options.action === 'print') {
                // Open in new window for printing (best browser compatibility)
                const win = window.open(url, '_blank');
                if (win) {
                    // Note: Auto-print is tricky in PDFs opened via blob. 
                    // Users usually have to click print in the PDF viewer.
                    win.focus();
                } else {
                    alert("Pop-up engellendi. Lütfen izin verin.");
                }
            } else {
                // Download
                const link = document.createElement('a');
                link.href = url;
                link.download = `${title.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            // Cleanup
            setTimeout(() => URL.revokeObjectURL(url), 10000);

        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("PDF oluşturulurken bir hata meydana geldi.");
        }
    }
};
