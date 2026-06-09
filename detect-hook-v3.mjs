import fs from 'fs';
import path from 'path';

function findFiles(dir, extensions) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(findFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        results.push(fullPath);
      }
    } catch(e) {}
  }
  return results;
}

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

function analyzeFile(filePath, debug = false) {
  const violations = [];
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  
  if (!/\buse[A-Z]\w*\s*\(/.test(rawContent)) return violations;
  
  const cleaned = stripNonCode(rawContent);
  const rawLines = rawContent.split('\n');
  
  const funcDefs = [];
  
  // Pattern 1: function declarations
  const funcDeclRegex = /(?:export\s+(?:default\s+)?)?function\s+([A-Z]\w+|use\w+)\s*[<(]/g;
  let m;
  while ((m = funcDeclRegex.exec(cleaned)) !== null) {
    funcDefs.push({ name: m[1], charIdx: m.index, type: 'function', matchLen: m[0].length });
  }
  
  // Pattern 2: arrow functions
  const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+([A-Z]\w+|use\w+)\s*(?::\s*[^=]+?)?\s*=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>/g;
  while ((m = arrowRegex.exec(cleaned)) !== null) {
    funcDefs.push({ name: m[1], charIdx: m.index, type: 'arrow', matchLen: m[0].length });
  }
  
  // Pattern 3: function expressions
  const funcExprRegex = /(?:export\s+)?(?:const|let|var)\s+([A-Z]\w+|use\w+)\s*(?::\s*[^=]+?)?\s*=\s*function\s*[<(]/g;
  while ((m = funcExprRegex.exec(cleaned)) !== null) {
    funcDefs.push({ name: m[1], charIdx: m.index, type: 'funcExpr', matchLen: m[0].length });
  }
  
  if (debug) console.log(`  Found ${funcDefs.length} function defs: ${funcDefs.map(d => d.name).join(', ')}`);
  
  // Deduplicate
  const seen = new Set();
  const uniqueDefs = funcDefs.filter(d => {
    const key = `${d.name}@${d.charIdx}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  for (const funcDef of uniqueDefs) {
    let bodyStartIdx = -1;
    
    if (funcDef.type === 'arrow') {
      // Find the => that's part of this function definition
      // It should be within or right after the regex match
      const matchEnd = funcDef.charIdx + funcDef.matchLen;
      // The regex match ends with =>, so the => ends at matchEnd
      const arrowEnd = matchEnd;
      const arrowStart = cleaned.lastIndexOf('=>', arrowEnd);
      
      let searchIdx = arrowEnd;
      while (searchIdx < cleaned.length && /\s/.test(cleaned[searchIdx])) searchIdx++;
      
      if (cleaned[searchIdx] === '{') {
        bodyStartIdx = searchIdx;
      } else {
        if (debug) console.log(`  ${funcDef.name}: No body brace after =>, found '${cleaned[searchIdx]}' at ${searchIdx}`);
        continue;
      }
    } else {
      // function declaration or expression
      const parenStart = cleaned.indexOf('(', funcDef.charIdx);
      if (parenStart === -1) continue;
      
      let depth = 1;
      let idx = parenStart + 1;
      while (idx < cleaned.length && depth > 0) {
        if (cleaned[idx] === '(') depth++;
        else if (cleaned[idx] === ')') depth--;
        idx++;
      }
      
      // Skip return type annotation to find {
      while (idx < cleaned.length && cleaned[idx] !== '{') {
        if (cleaned[idx] === ';') break;
        idx++;
      }
      if (cleaned[idx] === '{') {
        bodyStartIdx = idx;
      }
    }
    
    if (bodyStartIdx === -1) {
      if (debug) console.log(`  ${funcDef.name}: Could not find body start`);
      continue;
    }
    
    // Find matching closing brace
    let depth = 1;
    let idx = bodyStartIdx + 1;
    while (idx < cleaned.length && depth > 0) {
      if (cleaned[idx] === '{') depth++;
      else if (cleaned[idx] === '}') depth--;
      idx++;
    }
    const bodyEndIdx = idx - 1;
    
    const bodyStartLine = charToLine(cleaned, bodyStartIdx);
    const bodyText = cleaned.substring(bodyStartIdx + 1, bodyEndIdx);
    const bodyLines = bodyText.split('\n');
    const globalLineOffset = bodyStartLine;
    
    if (debug) console.log(`  ${funcDef.name}: body at lines ${bodyStartLine + 1}-${charToLine(cleaned, bodyEndIdx) + 1}, ${bodyLines.length} body lines`);
    
    let scanDepth = 0;
    let earlyReturnGlobalLine = -1;
    let earlyReturnText = '';
    
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
      
      if (earlyReturnGlobalLine === -1) {
        if (/^if\s*\(/.test(trimmedClean) && /\breturn\b/.test(trimmedClean)) {
          earlyReturnGlobalLine = globalLine + 1;
          earlyReturnText = rawLine.trim();
          if (debug) console.log(`    Early return at line ${earlyReturnGlobalLine}: ${earlyReturnText}`);
        }
      } else {
        const hookMatch = rawLine.match(/\b(use[A-Z]\w*)\s*\(/);
        if (hookMatch && !rawLine.trim().startsWith('//') && !rawLine.trim().startsWith('*')) {
          violations.push({
            file: filePath.replace(/\\/g, '/'),
            funcName: funcDef.name,
            funcDefLine: charToLine(cleaned, funcDef.charIdx) + 1,
            earlyReturnLine: earlyReturnGlobalLine,
            earlyReturnText,
            hookCallLine: globalLine + 1,
            hookCallText: rawLine.trim(),
            hookName: hookMatch[1]
          });
          if (debug) console.log(`    VIOLATION: ${hookMatch[1]} at line ${globalLine + 1}`);
        }
      }
    }
  }
  
  return violations;
}

// Test with known file first
console.log('=== Testing known file ===');
const knownViolations = analyzeFile('src/components/sheets/verbal/KavramHaritasiSheet.tsx', true);
console.log(`Known file violations: ${knownViolations.length}`);
for (const v of knownViolations) {
  console.log(`  ${v.funcName}: early return at ${v.earlyReturnLine}, hook ${v.hookName} at ${v.hookCallLine}`);
}

console.log('\n=== Full scan ===');
const dirsToScan = ['src/components', 'src/hooks', 'src/store', 'src/services'];
const extensions = ['.tsx', '.ts'];
let allViolations = [...knownViolations];
let filesScanned = 0;

for (const dir of dirsToScan) {
  const files = findFiles(dir, extensions);
  for (const file of files) {
    if (file.replace(/\\/g, '/').includes('KavramHaritasiSheet')) continue; // already processed
    filesScanned++;
    try {
      const violations = analyzeFile(file, false);
      allViolations = allViolations.concat(violations);
    } catch(e) {
      // console.error(`Error: ${file}: ${e.message}`);
    }
  }
}

console.log(`Files scanned: ${filesScanned}`);
console.log(`Total violations: ${allViolations.length}`);

const grouped = {};
for (const v of allViolations) {
  if (!grouped[v.file]) grouped[v.file] = [];
  grouped[v.file].push(v);
}

for (const [file, viols] of Object.entries(grouped)) {
  console.log(`\n### ${file}`);
  for (const v of viols) {
    console.log(`  Function: ${v.funcName} (line ${v.funcDefLine})`);
    console.log(`  Early return at line ${v.earlyReturnLine}: ${v.earlyReturnText}`);
    console.log(`  Hook "${v.hookName}" at line ${v.hookCallLine}: ${v.hookCallText}`);
  }
}
