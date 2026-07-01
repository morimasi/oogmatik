import fs from 'fs';
const content = fs.readFileSync('src/services/generators/mathSinavGenerator.ts', 'utf8');

let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Fix mat-exam template literal
    if (line.includes('id: `mat-exam-')) {
        console.log('Found mat-exam at line', i+1);
        lines[i] = lines[i].replace(/id: `mat-exam-\$\{Date\.now\(\)\}`/, 'id: "mat-exam-" + Date.now()');
        console.log('Replaced line', i+1);
    }
    
    // Fix mat-q template literal  
    if (line.includes('id: `mat-q-')) {
        console.log('Found mat-q at line', i+1);
        lines[i] = lines[i].replace(/id: `mat-q-\$\{Date\.now\(\)\}-\$\{soruIndex\}`/, 'id: "mat-q-" + Date.now() + "-" + soruIndex');
        console.log('Replaced line', i+1);
    }
    
    // Fix line with Turkish chars in template literal at baslik
    if (line.includes('Sınıf Matematik Değerlendirme Sınavı') && line.includes('\`${settings.sinif}')) {
        console.log('Found baslik template at line', i+1);
        lines[i] = lines[i].replace(/\`\$\{settings\.sinif\}\. Sınıf Matematik Değerlendirme Sınavı\`/, '" + settings.sinif + ". Sınıf Matematik Değerlendirme Sınavı"');
        console.log('Replaced line', i+1);
    }
}

fs.writeFileSync('src/services/generators/mathSinavGenerator.ts', lines.join('\n'), 'utf8');
console.log('Done writing');