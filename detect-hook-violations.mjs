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

// Strip comments and string/template literals, preserving line structure
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

function analyzeFile(filePath) {
  const violations = [];
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  
  if (!/\buse[A-Z]\w*\s*\(/.test(rawContent)) return violations;
  
  const cleaned = stripNonCode(rawContent);
  const rawLines = rawContent.split('\n');
  
  // Find component/hook function bodies
  // We look for patterns and then find the opening { of the body
  
  const funcDefs = [];
  
  // Pattern 1: function Name(...) or export [default] function Name(...)
  const funcDeclRegex = /(?:export\s+(?:default\s+)?)?function\s+([A-Z]\w+|use\w+)\s*[<(]/g;
  let m;
  while ((m = funcDeclRegex.exec(cleaned)) !== null) {
    funcDefs.push({ name: m[1], charIdx: m.index, type: 'function' });
  }
  
  // Pattern 2: const/let/var Name[...] = (...) => or = function(
  // Need to handle type annotations: const Name: Type = 
  const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+([A-Z]\w+|use\w+)\s*(?::\s*[^=]+?)?\s*=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>/g;
  while ((m = arrowRegex.exec(cleaned)) !== null) {
    funcDefs.push({ name: m[1], charIdx: m.index, type: 'arrow', arrowEnd: m.index + m[0].length });
  }
  
  // Pattern 3: const Name = function(
  const funcExprRegex = /(?:export\s+)?(?:const|let|var)\s+([A-Z]\w+|use\w+)\s*(?::\s*[^=]+?)?\s*=\s*function\s*[<(]/g;
  while ((m = funcExprRegex.exec(cleaned)) !== null) {
    funcDefs.push({ name: m[1], charIdx: m.index, type: 'funcExpr' });
  }
  
  // Pattern 4: forwardRef/memo wrappers
  const wrapperRegex = /(?:export\s+)?(?:const|let|var)\s+([A-Z]\w+|use\w+)\s*(?::\s*[^=]+?)?\s*=\s*(?:React\.)?(?:forwardRef|memo)\s*[<(]/g;
  while ((m = wrapperRegex.exec(cleaned)) !== null) {
    funcDefs.push({ name: m[1], charIdx: m.index, type: 'wrapper' });
  }
  
  // Deduplicate by name+charIdx
  const seen = new Set();
  const uniqueDefs = funcDefs.filter(d => {
    const key = `${d.name}@${d.charIdx}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  for (const funcDef of uniqueDefs) {
    // Find the opening brace of the function body
    let bodyStartIdx = -1;
    
    if (funcDef.type === 'arrow') {
      // For arrow functions, find => then the next {
      const arrowPos = cleaned.indexOf('=>', funcDef.charIdx);
      if (arrowPos === -1) continue;
      // The body { should be after =>
      // But arrow functions can also have parenthesized bodies: () => (...)
      // We need to find { after =>
      let searchIdx = arrowPos + 2;
      // Skip whitespace
      while (searchIdx < cleaned.length && /\s/.test(cleaned[searchIdx])) searchIdx++;
      if (cleaned[searchIdx] === '{') {
        bodyStartIdx = searchIdx;
      } else {
        // Arrow function with expression body (no braces) - skip
        continue;
      }
    } else {
      // For function declarations/expressions, find the { after the closing ) of params
      // The params start at the ( we matched in the regex
      // We need to find the matching ) and then the next {
      // But there might be type parameters <...> before (
      let parenStart = cleaned.indexOf('(', funcDef.charIdx);
      if (parenStart === -1) continue;
      
      // Find matching )
      let depth = 1;
      let idx = parenStart + 1;
      while (idx < cleaned.length && depth > 0) {
        if (cleaned[idx] === '(') depth++;
        else if (cleaned[idx] === ')') depth--;
        idx++;
      }
      // idx is now just after the closing )
      // There might be a return type annotation: ): ReturnType {
      // Skip to the next {
      while (idx < cleaned.length && cleaned[idx] !== '{') {
        // But don't go past a semicolon or another function keyword
        if (cleaned[idx] === ';') break;
        idx++;
      }
      if (cleaned[idx] === '{') {
        bodyStartIdx = idx;
      }
    }
    
    if (bodyStartIdx === -1) continue;
    
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
    const bodyEndLine = charToLine(cleaned, bodyEndIdx);
    
    // Now analyze the body line by line
    // We need to track depth relative to the function body
    // depth=1 means we're at the top level of the function
    
    // First, find all nested function ranges (by line)
    const nestedRanges = [];
    let tempDepth = 0;
    let funcBodyDepth = 0;
    let nestedStack = [];
    
    const bodyText = cleaned.substring(bodyStartIdx, bodyEndIdx + 1);
    const bodyLines = bodyText.split('\n');
    
    // Track brace depth through the body
    // bodyStartIdx is at {, so depth starts at 1 after it
    let currentDepth = 0; // 0 = inside function at top level (after the opening {)
    
    // Map from body-local line index to global line number
    const globalLineOffset = bodyStartLine;
    
    // Scan for nested function boundaries
    // A nested function is identified by:
    // 1. A { that's not at depth 0 (i.e., we're already inside a block)
    // 2. Preceded by => or function( on the same or previous line
    
    // Simpler approach: just track depth and early returns
    // At depth 0 (top level of function body), find early returns and hook calls
    
    // Re-scan with depth tracking
    let scanDepth = 0; // starts at 0 = just inside function body
    let earlyReturnGlobalLine = -1;
    let earlyReturnText = '';
    const hookViolations = [];
    
    // We need to process the cleaned content character by character within the body
    // but track line numbers
    
    for (let lineIdx = 0; lineIdx < bodyLines.length; lineIdx++) {
      const globalLine = globalLineOffset + lineIdx;
      const lineContent = bodyLines[lineIdx];
      const rawLine = rawLines[globalLine] || '';
      
      const depthAtLineStart = scanDepth;
      
      // Track depth changes through this line
      for (let ci = 0; ci < lineContent.length; ci++) {
        if (lineContent[ci] === '{') scanDepth++;
        else if (lineContent[ci] === '}') scanDepth--;
      }
      
      // Only process if we're at top level (depth 0 at start of line, meaning direct children of function body)
      if (depthAtLineStart !== 0) continue;
      // Also skip if depth goes below 0 (we've exited the function)
      if (scanDepth < 0) break;
      
      // Check for early return: if (...) return ...
      // The line should start with (optional whitespace) if(
      const trimmedClean = lineContent.trim();
      
      if (earlyReturnGlobalLine === -1) {
        if (/^if\s*\(/.test(trimmedClean) && /\breturn\b/.test(trimmedClean)) {
          earlyReturnGlobalLine = globalLine + 1; // 1-based
          earlyReturnText = rawLine.trim();
        }
        // Multi-line if: check if line starts with if( but return is on next line(s)
        else if (/^if\s*\(/.test(trimmedClean) && !/\breturn\b/.test(trimmedClean)) {
          // Look at next few lines at same depth
          for (let k = lineIdx + 1; k < Math.min(lineIdx + 6, bodyLines.length); k++) {
            const nextTrimmed = bodyLines[k].trim();
            if (/^return\b/.test(nextTrimmed) || /\)\s*return\b/.test(nextTrimmed)) {
              earlyReturnGlobalLine = (globalLineOffset + k) + 1;
              earlyReturnText = (rawLines[globalLineOffset + k] || '').trim();
              break;
            }
            // If we hit another statement, stop looking
            if (/^[a-zA-Z]/.test(nextTrimmed) && !/^\s*\)/.test(nextTrimmed)) break;
          }
        }
        // Also: if (!x) return null pattern with braces on next line
        // e.g.: if (!x) {\n  return null;\n}
        // In this case, the return is at depth 1, but it's still an early return
        // Let me handle this: if the if line has no return, check if next line at depth 1 has return
      } else {
        // We're after an early return - check for hook calls
        // Make sure this is at top level (depth 0)
        const hookMatch = rawLine.match(/\b(use[A-Z]\w*)\s*\(/);
        if (hookMatch && !rawLine.trim().startsWith('//') && !rawLine.trim().startsWith('*')) {
          hookViolations.push({
            hookName: hookMatch[1],
            line: globalLine + 1, // 1-based
            text: rawLine.trim()
          });
        }
      }
    }
    
    for (const hv of hookViolations) {
      violations.push({
        file: filePath.replace(/\\/g, '/'),
        funcName: funcDef.name,
        funcDefLine: charToLine(cleaned, funcDef.charIdx) + 1,
        earlyReturnLine: earlyReturnGlobalLine,
        earlyReturnText,
        hookCallLine: hv.line,
        hookCallText: hv.text,
        hookName: hv.hookName
      });
    }
  }
  
  return violations;
}

// Also handle: if (!x) {\n  return null;\n}
// The return inside braces right after if() at top level IS still an early return
// Let me add this handling in the main logic above

// Main
const dirsToScan = [
  'src/components',
  'src/hooks',
  'src/store',
  'src/services'
];

const extensions = ['.tsx', '.ts'];
let allViolations = [];
let filesScanned = 0;

for (const dir of dirsToScan) {
  const files = findFiles(dir, extensions);
  for (const file of files) {
    filesScanned++;
    try {
      const violations = analyzeFile(file);
      allViolations = allViolations.concat(violations);
    } catch(e) {
      // Uncomment for debugging:
      // console.error(`Error analyzing ${file}: ${e.message}`);
    }
  }
}

console.log(`=== React Hook Rule Violations Report ===`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Total violations found: ${allViolations.length}\n`);

const grouped = {};
for (const v of allViolations) {
  if (!grouped[v.file]) grouped[v.file] = [];
  grouped[v.file].push(v);
}

for (const [file, viols] of Object.entries(grouped)) {
  console.log(`\n### ${file}`);
  for (const v of viols) {
    console.log(`  Function: ${v.funcName} (defined at line ${v.funcDefLine})`);
    console.log(`  Early return at line ${v.earlyReturnLine}: ${v.earlyReturnText}`);
    console.log(`  Hook "${v.hookName}" called at line ${v.hookCallLine}: ${v.hookCallText}`);
    console.log('');
  }
}
