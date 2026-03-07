const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\0a4ab839-d737-49e6-9c0c-ccebc57fa8c3\\media__1772868885638.png';
const destDir = path.join(__dirname, 'public', 'assets');
const dest = path.join(destDir, 'logo.png');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('Logo copied successfully to ' + dest);
