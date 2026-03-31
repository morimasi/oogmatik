
const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        getFiles(name, fileList);
      }
    } else {
      if (name.endsWith('.tsx') || name.endsWith('.ts')) {
        fileList.push(name);
      }
    }
  });
  return fileList;
}

const srcDir = path.join(process.cwd(), 'src');
const files = getFiles(srcDir);

const suspiciousFiles = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Eğer "naked" useEffect( kullanımı varsa
  const hasNakedUseEffect = /[^.]useEffect\(/.test(content) || content.startsWith('useEffect(');
  
  if (hasNakedUseEffect) {
    // Import kontrolü
    const hasImport = /import\s+{[^}]*useEffect[^}]*}\s+from\s+['"]react['"]/.test(content) ||
                      /import\s+React\s*,\s*{[^}]*useEffect[^}]*}\s+from\s+['"]react['"]/.test(content);
    
    if (!hasImport) {
      suspiciousFiles.push(file);
    }
  }
});

console.log('--- ŞÜPHELİ DOSYALAR ---');
suspiciousFiles.forEach(f => console.log(f));
console.log('------------------------');
if (suspiciousFiles.length === 0) console.log('Hatalı dosya bulunamadı.');
