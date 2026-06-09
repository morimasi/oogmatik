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

function charToLine(code, charIdx) {
  let line = 0;
  for (let i = 0; i < charIdx && i < code.length; i++) {
    if (code[i] === '\n') line++;
  }
  return line;
}

const filePath = 'src/components/sheets/verbal/KavramHaritasiSheet.tsx';
const rawContent = fs.readFileSync(filePath, 'utf-8');
const cleaned = stripNonCode(rawContent);
const rawLines = rawContent.split('\n');

// Find KavramHaritasiSheet
const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+([A-Z]\w+|use\w+)\s*(?::\s*[^=]+?)?\s*=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>/g;
let m;
while ((m = arrowRegex.exec(cleaned)) !== null) {
  if (m[1] !== 'KavramHaritasiSheet') continue;
  
  console.log(`\n=== Processing ${m[1]} ===`);
  
  const arrowPos = cleaned.indexOf('=>', m.index);
  let searchIdx = arrowPos + 2;
  while (searchIdx < cleaned.length && /\s/.test(cleaned[searchIdx])) searchIdx++;
  
  if (cleaned[searchIdx] !== '{') {
    console.log('No body brace found');
    continue;
  }
  
  const bodyStartIdx = searchIdx;
  let depth = 1;
  let idx = bodyStartIdx + 1;
  while (idx < cleaned.length && depth > 0) {
    if (cleaned[idx] === '{') depth++;
    else if (cleaned[idx] === '}') depth--;
    idx++;
  }
  const bodyEndIdx = idx - 1;
  
  const bodyStartLine = charToLine(cleaned, bodyStartIdx);
  console.log(`Body starts at line ${bodyStartLine + 1} (0-based: ${bodyStartLine})`);
  
  const bodyText = cleaned.substring(bodyStartIdx + 1, bodyEndIdx);
  const bodyLines = bodyText.split('\n');
  const globalLineOffset = bodyStartLine;
  
  let scanDepth = 0;
  let earlyReturnGlobalLine = -1;
  
  for (let lineIdx = 0; lineIdx < bodyLines.length; lineIdx++) {
    const globalLine = globalLineOffset + lineIdx;
    const lineContent = bodyLines[lineIdx];
    const rawLine = rawLines[globalLine] || '';
    
    const depthAtLineStart = scanDepth;
    for (let ci = 0; ci < lineContent.length; ci++) {
      if (lineContent[ci] === '{') scanDepth++;
      else if (lineContent[ci] === '}') scanDepth--;
    }
    
    if (depthAtLineStart !== 0) continue;
    if (scanDepth < 0) break;
    
    const trimmedClean = lineContent.trim();
    
    if (lineIdx < 10) {
      console.log(`\nLineIdx ${lineIdx}, GlobalLine ${globalLine} (file line ${globalLine + 1}):`);
      console.log(`  depthAtStart=${depthAtLineStart}, scanDepth after=${scanDepth}`);
      console.log(`  Cleaned: "${trimmedClean}"`);
      console.log(`  Raw: "${rawLine.trim()}"`);
      console.log(`  earlyReturnGlobalLine=${earlyReturnGlobalLine}`);
    }
    
    if (earlyReturnGlobalLine === -1) {
      const ifTest = /^if\s*\(/.test(trimmedClean);
      const retTest = /\breturn\b/.test(trimmedClean);
      
      if (lineIdx < 10) {
        console.log(`  ifTest=${ifTest}, retTest=${retTest}`);
      }
      
      if (ifTest && retTest) {
        earlyReturnGlobalLine = globalLine + 1;
        console.log(`  >>> EARLY RETURN DETECTED at file line ${earlyReturnGlobalLine}`);
      }
    } else {
      const hookMatch = rawLine.match(/\b(use[A-Z]\w*)\s*\(/);
      if (hookMatch) {
        console.log(`  >>> HOOK CALL FOUND: ${hookMatch[1]} at file line ${globalLine + 1}`);
        console.log(`  Raw line: ${rawLine.trim()}`);
      }
    }
  }
  
  console.log(`\nFinal earlyReturnGlobalLine: ${earlyReturnGlobalLine}`);
}
