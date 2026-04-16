import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import fs from 'fs';
import path from 'path';

async function extractTextFromPDF(pdfPath) {
    try {
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
    } catch (err) {
        return `Error reading ${pdfPath}: ${err.message}`;
    }
}

const sariDir = 'd:/bbma/bursadisleksi/oogmatik/src/kaynak/sari';
const files = [
    '1. SARI KİTAP PENCERE.pdf',
    '2. SARI KİTAP NOKTA.pdf',
    '3. SARI KİTAP KÖPRÜ.pdf',
    '4. SARI KİTAP ÇİFT METİN.pdf',
    'BELLEK DERNEK TOPLU.pdf',
    'HIZLI OKUMAYA GEÇİŞ ÖDEV KİTABI.pdf',
    'HIZLI OKUMAYA GEÇİŞ.pdf'
];

async function run() {
    let allContent = '';
    for (const file of files) {
        const filePath = path.join(sariDir, file);
        console.log(`Extracting: ${file}...`);
        const text = await extractTextFromPDF(filePath);
        allContent += `========== START FILE: ${file} ==========\n${text}\n========== END FILE: ${file} ==========\n\n`;
    }
    fs.writeFileSync('sari_extracted.txt', allContent);
    console.log('All Sari Kitap PDFs extracted to sari_extracted.txt');
}

run();
