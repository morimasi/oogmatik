import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import fs from 'fs';

async function extractText(pdfPath) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;
    
    let text = '';
    const numPages = Math.min(pdfDocument.numPages, 10); // First 10 pages
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        text += `\n--- Page ${pageNum} ---\n${pageText}`;
    }
    console.log(text);
}

extractText('d:/bbma/bursadisleksi/oogmatik/src/kaynak/kelime/KELİME_CÜMLE ÇALIŞMASI_2013.pdf').catch(console.error);
