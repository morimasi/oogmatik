const fs = require('fs');
const content = fs.readFileSync('src/services/generators/mathSinavGenerator.ts', 'utf8');

let newContent = content;

// Search for the template literal lines
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Fix KLINIK PROTOKOL UYARISI template literals (lines around 1150-1151)
    if (line.includes('KLİNİK PROTOKOL UYARISI') && line.includes('`[')) {
        console.log('Found KLINIK PROTOKOL at line', i+1);
        lines[i] = lines[i].replace(/`\[KLİNİK PROTOKOL UYARISI\] Sınavın %\$\{kritikHataYuzdesi\.toFixed\(0\)\}'inde görsel-metin uyumsuzluğu var\. ` \+/, '"[KLİNİK PROTOKOL UYARISI] Sınavın %" + kritikHataYuzdesi.toFixed(0) + \'"\'inde görsel-metin uyumsuzluğu var. " + ');
        lines[i+1] = lines[i+1].replace(/`Ortalama pedagojik skor: \$\{examValidationReport\.averagePedagogicalScore\}\/100`/, '"Ortalama pedagojik skor: " + examValidationReport.averagePedagogicalScore + "/100"');
        console.log('Replaced lines', i+1, i+2);
    }
    
    // Also fix any remaining template literals with non-ASCII that might cause issues
    // This is a more general fix - replace any template literal containing Turkish chars
}

newContent = lines.join('\n');
fs.writeFileSync('src/services/generators/mathSinavGenerator.ts', newContent, 'utf8');
console.log('Done writing');