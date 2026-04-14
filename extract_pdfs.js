import fs from 'fs';
import path from 'path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const directoryPath = path.join(process.cwd(), 'src/kaynak/sari');

async function extractTextFromPDF(pdfPath) {
  try {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = getDocument({ data });
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    let text = '';
    // Sadece ilk 5 sayfayı okuyalım ki çok uzamasın
    const pagesToRead = Math.min(numPages, 5);
    
    for (let i = 1; i <= pagesToRead; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      text += `--- Page ${i} ---\n` + strings.join(' ') + '\n';
    }
    
    return text;
  } catch (error) {
    return `Error reading ${pdfPath}: ${error.message}`;
  }
}

async function main() {
  const files = fs.readdirSync(directoryPath).filter(f => f.endsWith('.pdf'));
  
  for (const file of files) {
    console.log(`\n=========================================`);
    console.log(`Analyzing: ${file}`);
    console.log(`=========================================`);
    const filePath = path.join(directoryPath, file);
    const text = await extractTextFromPDF(filePath);
    console.log(text.substring(0, 1500) + (text.length > 1500 ? '...\n[TRUNCATED]' : ''));
  }
}

main().catch(console.error);
