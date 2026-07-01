import fs from 'fs';
const content = fs.readFileSync('src/services/generators/mathSinavGenerator.ts', 'utf8');
const lines = content.split('\n');

function count(str, char) {
    let c = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === char && (i === 0 || str[i-1] !== '\\')) {
            c++;
        }
    }
    return c;
}

let inBacktick = false;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const btCount = count(line, '`');
    
    // We only care about ' and " if we are NOT inside a backtick
    if (!inBacktick) {
        const sq = count(line, "'");
        const dq = count(line, '"');
        if (sq % 2 !== 0 || dq % 2 !== 0) {
            console.log(`Line ${i + 1} has odd quotes: SQ=${sq}, DQ=${dq}`);
            console.log(`  Content: ${line.trim()}`);
        }
    }
    
    if (btCount % 2 !== 0) {
        inBacktick = !inBacktick;
    }
}
