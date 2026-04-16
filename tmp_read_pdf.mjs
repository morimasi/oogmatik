import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import fs from 'fs';

async function extractText(pdfPath) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${text}\n\n`;
    }
    return fullText;
}

const pdfPath = 'd:/bbma/bursadisleksi/oogmatik/src/kaynak/kelime/KELİME_CÜMLE ÇALIŞMASI_2013.pdf';
extractText(pdfPath).then(text => {
    fs.writeFileSync('pdf_extracted.txt', text);
    console.log('PDF extracted to pdf_extracted.txt');
}).catch(err => {
    console.error(err);
});
