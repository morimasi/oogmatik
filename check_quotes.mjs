import fs from 'fs';
const content = fs.readFileSync('src/services/generators/mathSinavGenerator.ts', 'utf8');

const singleQuotes = (content.match(/'/g) || []).length;
const doubleQuotes = (content.match(/"/g) || []).length;
const backticks = (content.match(/`/g) || []).length;

console.log({ singleQuotes, doubleQuotes, backticks });

// Also check for potential escaped quotes that might confuse simple counting
// but in TS/JS it's usually balanced unless there's a real bug.

// Let's also look for lines that might have an odd number of backticks
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const bt = (lines[i].match(/`/g) || []).length;
    if (bt % 2 !== 0) {
        // Many template literals span multiple lines, so odd count per line is normal.
        // But if it's a single line that should be balanced, it's worth checking.
    }
}
