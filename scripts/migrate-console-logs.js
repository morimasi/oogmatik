#!/usr/bin/env node

/**
 * OOGMATIK - Console.log → Logger Migration Script
 * 194 console.log statement'ını logInfo/logError/logWarn'a dönüştür
 * 
 * Usage: node scripts/migrate-console-logs.js [--dry-run] [--pattern=console.log]
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const PATTERNS = {
  'console.log': { replacement: 'logInfo', type: 'info' },
  'console.error': { replacement: 'logError', type: 'error' },
  'console.warn': { replacement: 'logWarn', type: 'warn' },
  'console.debug': { replacement: 'logInfo', type: 'info' },
};

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const patternFilter = args.find(arg => arg.startsWith('--pattern='))?.split('=')[1];

console.log(`
╔════════════════════════════════════════════════════════════╗
║  OOGMATIK - Console.log → Logger Migration                 ║
╚════════════════════════════════════════════════════════════╝
`);

console.log(`Dry Run Mode: ${isDryRun ? 'ON' : 'OFF'}`);
console.log(`Pattern Filter: ${patternFilter || 'ALL'}\n`);

// Files to process
const srcFiles = await glob('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
const apiFiles = await glob('api/**/*.ts', { ignore: 'node_modules/**' });
const allFiles = [...srcFiles, ...apiFiles];

console.log(`Found ${allFiles.length} files to process\n`);

let totalConsoleLogCount = 0;
let totalFilesModified = 0;
const failedFiles = [];
const modifiedFiles = [];

// Files that should keep console.log (logger itself, tests, etc)
const SKIP_FILES = [
  'src/utils/logger.ts',
  'tests/',
  'scripts/'
];

for (const filePath of allFiles) {
  // Skip files that should keep console.log
  if (SKIP_FILES.some(skip => filePath.includes(skip))) {
    continue;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let fileModified = false;
    let consoleLogCount = 0;

    // Check for each pattern
    Object.entries(PATTERNS).forEach(([pattern, config]) => {
      if (patternFilter && !pattern.includes(patternFilter)) return;

      const regex = new RegExp(pattern + '\\s*\\(', 'g');
      if (regex.test(content)) {
        const matches = content.match(regex) || [];
        consoleLogCount += matches.length;
        fileModified = true;

        // Replace pattern
        content = content.replace(
          new RegExp(pattern + '\\s*\\(', 'g'),
          `${config.replacement}(`
        );
      }
    });

    if (fileModified) {
      // Add logger import if not present
      const hasLoggerImport = content.includes("from '../utils/logger") || 
                              content.includes("from '../../utils/logger") ||
                              content.includes("from '@/utils/logger") ||
                              content.includes('from "../utils/logger') ||
                              content.includes('from "../../utils/logger') ||
                              content.includes('from "@/utils/logger');

      if (!hasLoggerImport) {
        // Calculate relative path to logger
        const depth = filePath.split('/').length - 1;
        let relativePath = '';
        
        if (filePath.startsWith('api/')) {
          // API files need to go up and into src
          const apiDepth = filePath.split('/').length - 1;
          relativePath = '../'.repeat(apiDepth) + 'src/utils/logger.js';
        } else if (filePath.startsWith('src/')) {
          // src files need relative path
          const srcDepth = filePath.replace('src/', '').split('/').length - 1;
          if (srcDepth === 0) {
            relativePath = './utils/logger.js';
          } else {
            relativePath = '../'.repeat(srcDepth) + 'utils/logger.js';
          }
        }

        const loggerImport = `import { logInfo, logError, logWarn } from '${relativePath}';`;
        
        // Find last import and add after it
        const importRegex = /^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm;
        const imports = content.match(importRegex);
        
        if (imports && imports.length > 0) {
          const lastImport = imports[imports.length - 1];
          const lastImportIndex = content.lastIndexOf(lastImport);
          const insertPosition = lastImportIndex + lastImport.length;
          content = content.slice(0, insertPosition) + '\n' + loggerImport + content.slice(insertPosition);
        } else {
          content = loggerImport + '\n\n' + content;
        }
      }

      totalConsoleLogCount += consoleLogCount;
      totalFilesModified++;
      modifiedFiles.push({
        path: filePath,
        count: consoleLogCount
      });

      if (!isDryRun) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ ${filePath}: ${consoleLogCount} replacements`);
      } else {
        console.log(`📋 [DRY RUN] ${filePath}: ${consoleLogCount} replacements`);
      }
    }
  } catch (error) {
    failedFiles.push({ path: filePath, error: error.message });
    console.error(`❌ ${filePath}: ${error.message}`);
  }
}

console.log(`
╔════════════════════════════════════════════════════════════╗
║  MIGRATION SUMMARY                                         ║
╚════════════════════════════════════════════════════════════╝
`);

console.log(`Total console.log statements: ${totalConsoleLogCount}`);
console.log(`Files modified: ${totalFilesModified}`);
console.log(`Failed files: ${failedFiles.length}`);

if (modifiedFiles.length > 0) {
  console.log(`\nModified Files:`);
  modifiedFiles.forEach(f => console.log(`  - ${f.path} (+${f.count})`));
}

if (failedFiles.length > 0) {
  console.log(`\nFailed Files:`);
  failedFiles.forEach(f => console.log(`  - ${f.path}: ${f.error}`));
}

console.log(`
${isDryRun ? '📋 DRY RUN MODE' : '✅ MIGRATION COMPLETE'}
${isDryRun ? 'Run without --dry-run to apply changes' : 'All files have been updated'}\n`);

process.exit(failedFiles.length > 0 ? 1 : 0);
