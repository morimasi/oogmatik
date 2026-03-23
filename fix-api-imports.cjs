const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // from '../something' -> from '../src/something'
            // from '../../something' -> from '../../src/something'
            // Regex aciklama: (\.+) : n tane nokta yakala. \/ : bolu isareti. (?!src) : eger hemen pesinden src gelmiyorsa
            content = content.replace(/from\s+['"](\.+)\/(?!src\/)(.*?)['"]/g, "from '$1/src/$2'");
            // Dynamic importlar icin isleyis (import('../something'))
            content = content.replace(/import\s*\(\s*['"](\.+)\/(?!src\/)(.*?)['"]\s*\)/g, "import('$1/src/$2')");

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed imports in', fullPath);
            }
        }
    });
}

processDir(path.join(__dirname, 'api'));
console.log('API import paths updated successfully.');
