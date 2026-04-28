#!/usr/bin/env node

/**
 * OOGMATIK - Console.log → Logger Migration Script
 * 194 console.log statement'ını logInfo/logError/logWarn'a dönüştür
 * 
 * Usage: node scripts/migrate-console-logs.js [--dry-run] [--pattern=console.log]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PATTERNS = {
  'console.log': { replacement: 'logInfo', type: 'info' },
  'console.error': { replacement: 'logError', type: 'error' },
  'console.warn': { replacement: 'logWarn', type: 'warn' },
  'console.debug': { replacement: 'logInfo', type: 'info' },
};

const LOGGER_IMPORT = "import { logInfo, logError, logWarn } from '@/utils/logger.js';";

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
const srcFiles = glob.sync('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
const apiFiles = glob.sync('api/**/*.ts', { ignore: 'node_modules/**' });
const allFiles = [...srcFiles, ...apiFiles];

console.log(`Found ${allFiles.length} files to process\n`);

let totalConsoleLogCount = 0;
let totalFilesModified = 0;
const failedFiles = [];
const modifiedFiles = [];

allFiles.forEach((filePath) => {
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
      if (!content.includes('logInfo') && !content.includes('from \'@/utils/logger') && !content.includes('from "@/utils/logger')) {
        const lastImportMatch = content.match(/^(.*?import\s+[^;]+;)/ms);
        if (lastImportMatch) {
          const lastImportEnd = lastImportMatch[0].length;
          content = content.slice(0, lastImportEnd) + '\n' + LOGGER_IMPORT + content.slice(lastImportEnd);
        } else {
          content = LOGGER_IMPORT + '\n\n' + content;
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
});

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
