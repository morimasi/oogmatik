const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const targetDir = path.resolve(__dirname, 'src/components/sheets');
console.log(`Scanning: ${targetDir}`);
const files = walk(targetDir);

let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    content = content.replace(/\b(md|lg):grid-cols-(\d+)\b(?!\s+print:grid-cols-\2)/g, "$& print:grid-cols-$2");
    content = content.replace(/\b(md|lg):flex-row\b(?!\s+print:flex-row)/g, "$& print:flex-row");

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${path.basename(file)}`);
        changedFiles++;
    }
});

console.log(`\nSuccess! Total sheets secured for Native Print: ${changedFiles}`);
