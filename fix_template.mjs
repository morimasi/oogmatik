import fs from 'fs';
const content = fs.readFileSync('src/services/generators/mathSinavGenerator.ts', 'utf8');

let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Fix KLINIK PROTOKOL UYARISI template literals 
    if (line.includes('KLİNİK PROTOKOL UYARISI') && line.includes('`[')) {
        console.log('Found KLINIK PROTOKOL at line', i+1);
        lines[i] = lines[i].replace(/`\[KLİNİK PROTOKOL UYARISI\] Sınavın %\$\{kritikHataYuzdesi\.toFixed\(0\)\}'inde görsel-metin uyumsuzluğu var\. ` \+/, '"[KLİNİK PROTOKOL UYARISI] Sınavın %" + kritikHataYuzdesi.toFixed(0) + \'"\'inde görsel-metin uyumsuzluğu var. " + ');
        if (lines[i+1]) {
            lines[i+1] = lines[i+1].replace(/`Ortalama pedagojik skor: \$\{examValidationReport\.averagePedagogicalScore\}\/100`/, '"Ortalama pedagojik skor: " + examValidationReport.averagePedagogicalScore + "/100"');
            console.log('Replaced lines', i+1, i+2);
        }
    }
}

fs.writeFileSync('src/services/generators/mathSinavGenerator.ts', lines.join('\n'), 'utf8');
console.log('Done writing');