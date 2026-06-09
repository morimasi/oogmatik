import fs from 'fs';
import path from 'path';

const HOOK_PATTERN = /\b(use[A-Z]\w*|use)\s*\(/;
const EARLY_RETURN_PATTERN = /^\s*if\s*\(.+\)\s*return\b/;
const FUNC_START_PATTERN = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*=>|export\s+default\s+function\s+(\w+))/;

function findFiles(dir, extensions) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results = results.concat(findFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function analyzeFile(filePath) {
  const violations = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Skip files that are too large or don't have hooks
  if (!content.includes('use')) return violations;
  
  let inComponentOrHook = false;
  let funcName = '';
  let funcStartLine = -1;
  let braceDepth = 0;
  let funcBraceDepth = 0;
  let earlyReturnLine = -1;
  let earlyReturnText = '';
  let inNestedFunc = false;
  let nestedFuncDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Detect function/component start
    const funcMatch = line.match(FUNC_START_PATTERN);
    if (funcMatch && !inComponentOrHook) {
      funcName = funcMatch[1] || funcMatch[2] || funcMatch[3] || 'unknown';
      // Check if it's a component (starts with uppercase) or hook (starts with 'use')
      if (funcName && (funcName[0] === funcName[0].toUpperCase() || funcName.startsWith('use'))) {
        inComponentOrHook = true;
        funcStartLine = lineNum;
        funcBraceDepth = 0;
        earlyReturnLine = -1;
        braceDepth = 0;
      }
    }
    
    if (inComponentOrHook) {
      // Count braces to track scope
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      
      if (funcStartLine === lineNum || braceDepth === 0) {
        braceDepth += openBraces - closeBraces;
        if (braceDepth > 0 && funcBraceDepth === 0) {
          funcBraceDepth = braceDepth;
        }
      } else {
        braceDepth += openBraces - closeBraces;
      }
      
      // Detect nested functions (callbacks, arrow functions in JSX, etc.)
      const hasArrowFunc = /\s*=>\s*\{/.test(line) || /\s*function\s*\(/.test(line);
      if (hasArrowFunc && braceDepth > funcBraceDepth) {
        inNestedFunc = true;
        nestedFuncDepth = braceDepth;
      }
      
      if (inNestedFunc && braceDepth <= nestedFuncDepth - 1) {
        inNestedFunc = false;
      }
      
      // Only track early returns at top level of component/hook
      if (!inNestedFunc && braceDepth === funcBraceDepth) {
        if (EARLY_RETURN_PATTERN.test(line) && earlyReturnLine === -1) {
          earlyReturnLine = lineNum;
          earlyReturnText = line.trim();
        }
      }
      
      // Check for hook calls after early return (at top level only)
      if (earlyReturnLine !== -1 && !inNestedFunc && braceDepth === funcBraceDepth) {
        if (HOOK_PATTERN.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          // Verify it's actually a hook call, not just text containing "use"
          const hookMatch = line.match(/\b(use[A-Z]\w*)\s*\(/);
          if (hookMatch) {
            violations.push({
              file: filePath,
              funcName,
              earlyReturnLine,
              earlyReturnText,
              hookCallLine: lineNum,
              hookCallText: line.trim(),
              hookName: hookMatch[1]
            });
          }
        }
      }
      
      // Function ended
      if (braceDepth === 0 && funcBraceDepth > 0) {
        inComponentOrHook = false;
        funcName = '';
        funcStartLine = -1;
        funcBraceDepth = 0;
        earlyReturnLine = -1;
        inNestedFunc = false;
      }
    }
  }
  
  return violations;
}

// Main execution
const dirsToScan = [
  'src/components',
  'src/hooks',
  'src/store',
  'src/services'
];

const extensions = ['.tsx', '.ts'];
let allViolations = [];

for (const dir of dirsToScan) {
  const files = findFiles(dir, extensions);
  for (const file of files) {
    const violations = analyzeFile(file);
    allViolations = allViolations.concat(violations);
  }
}

// Output results
console.log('=== React Hook Rule Violations Report ===\n');
console.log(`Total violations found: ${allViolations.length}\n`);

for (const v of allViolations) {
  console.log(`File: ${v.file}`);
  console.log(`Function: ${v.funcName}`);
  console.log(`Early Return: Line ${v.earlyReturnLine} - ${v.earlyReturnText}`);
  console.log(`Hook Call After Return: Line ${v.hookCallLine} - ${v.hookName}`);
  console.log(`  ${v.hookCallText}`);
  console.log('---');
}
