// fix-quotes.mjs
// Simple script to replace unescaped single and double quotes in JSX/TSX files with HTML entities.
// It skips lines that are import/export statements to avoid breaking code.
import { promises as fs } from 'fs';

import { sync as globSync } from 'glob';

const quoteMap = {
  "'": '&apos;',
  '"': '&quot;'
};

function replaceQuotes(text) {
  // Replace unescaped single and double quotes with HTML entities.
  // This naive replacement works for JSX text nodes.
  return text.replace(/(?<!\\)["']/g, (match) => quoteMap[match]);
}

async function processFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    if (/^\s*(import|export)\s/.test(line)) return line; // skip import/export lines
    return replaceQuotes(line);
  });
  const newContent = newLines.join('\n');
  if (newContent !== content) {
    await fs.writeFile(filePath, newContent, 'utf8');
    console.log(`Fixed quotes in ${filePath}`);
  }
}

(async () => {
  const pattern = 'src/**/*.{tsx,jsx,js,ts}';
  const files = globSync(pattern, { nodir: true, absolute: true });
  for (const file of files) {
    await processFile(file);
  }
})();
