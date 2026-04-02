const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const srcDir = path.join(__dirname, 'src');
const files = walk(srcDir);

const problematicFiles = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if useEffect is used
    if (content.includes('useEffect(')) {
        // Check if it's imported from react
        const hasImport = content.includes('import {') && content.includes('useEffect') && content.includes("} from 'react'");
        const hasReactDotUsage = content.includes('React.useEffect(');
        
        if (!hasImport && !hasReactDotUsage) {
            problematicFiles.push(file);
        }
    }
});

console.log('--- PROBLEMLİ DOSYALAR ---');
problematicFiles.forEach(f => console.log(f));
