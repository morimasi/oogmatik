import fs from 'fs';

function stripNonCode(code) {
  let result = '';
  let i = 0;
  while (i < code.length) {
    if (code[i] === '/' && code[i+1] === '/') {
      while (i < code.length && code[i] !== '\n') { result += ' '; i++; }
    } else if (code[i] === '/' && code[i+1] === '*') {
      result += '  '; i += 2;
      while (i < code.length && !(code[i] === '*' && code[i+1] === '/')) {
        result += code[i] === '\n' ? '\n' : ' '; i++;
      }
      if (i < code.length) { result += '  '; i += 2; }
    } else if (code[i] === '`') {
      result += ' '; i++;
      while (i < code.length && code[i] !== '`') {
        if (code[i] === '\\') { result += '  '; i += 2; continue; }
        result += code[i] === '\n' ? '\n' : ' '; i++;
      }
      if (i < code.length) { result += ' '; i++; }
    } else if (code[i] === "'") {
      result += ' '; i++;
      while (i < code.length && code[i] !== "'") {
        if (code[i] === '\\') { result += '  '; i += 2; continue; }
        result += ' '; i++;
      }
      if (i < code.length) { result += ' '; i++; }
    } else if (code[i] === '"') {
      result += ' '; i++;
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\\') { result += '  '; i += 2; continue; }
        result += ' '; i++;
      }
      if (i < code.length) { result += ' '; i++; }
    } else {
      result += code[i]; i++;
    }
  }
  return result;
}

const filePath = 'src/components/sheets/verbal/KavramHaritasiSheet.tsx';
const rawContent = fs.readFileSync(filePath, 'utf-8');
const cleaned = stripNonCode(rawContent);

console.log('=== DEBUGGING ===\n');

// Test arrow regex
const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+([A-Z]\w+|use\w+)\s*(?::\s*[^=]+?)?\s*=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>/g;
let m;
while ((m = arrowRegex.exec(cleaned)) !== null) {
  console.log(`Found arrow func: ${m[1]} at charIdx ${m.index}`);
  console.log(`Match: "${m[0].substring(0, 80)}..."`);
  
  // Find =>
  const arrowPos = cleaned.indexOf('=>', m.index);
  console.log(`Arrow => at charIdx ${arrowPos}`);
  
  // Find { after =>
  let searchIdx = arrowPos + 2;
  while (searchIdx < cleaned.length && /\s/.test(cleaned[searchIdx])) searchIdx++;
  console.log(`Char after => and whitespace: '${cleaned[searchIdx]}' at idx ${searchIdx}`);
  
  if (cleaned[searchIdx] === '{') {
    console.log('Found body start brace!');
    
    // Find matching close
    let depth = 1;
    let idx = searchIdx + 1;
    while (idx < cleaned.length && depth > 0) {
      if (cleaned[idx] === '{') depth++;
      else if (cleaned[idx] === '}') depth--;
      idx++;
    }
    const bodyEndIdx = idx - 1;
    
    const bodyText = cleaned.substring(searchIdx + 1, bodyEndIdx);
    const bodyLines = bodyText.split('\n');
    console.log(`\nBody has ${bodyLines.length} lines`);
    
    // Show first 10 body lines with depth tracking
    let scanDepth = 0;
    for (let i = 0; i < Math.min(15, bodyLines.length); i++) {
      const lineContent = bodyLines[i];
      const depthAtStart = scanDepth;
      for (let ci = 0; ci < lineContent.length; ci++) {
        if (lineContent[ci] === '{') scanDepth++;
        else if (lineContent[ci] === '}') scanDepth--;
      }
      console.log(`  Line ${i}: depthAtStart=${depthAtStart} -> ${scanDepth} | "${lineContent.substring(0, 70)}"`);
    }
  }
}

// Also test with simpler approach - just look for the pattern in raw content
console.log('\n=== RAW FILE ANALYSIS ===');
const rawLines = rawContent.split('\n');
for (let i = 115; i < 130; i++) {
  console.log(`Line ${i+1}: ${rawLines[i]}`);
}
