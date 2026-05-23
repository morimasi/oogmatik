const fs = require('fs');

const path = 'd:/oogmatik/src/components/SheetRenderer.tsx';
const code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

const safeTextStart = lines.findIndex(l => l.includes('const recursiveSafeText = (val: any): string => {'));
let safeTextEnd = -1;
if (safeTextStart !== -1) {
  let brace = 0;
  for (let i = safeTextStart; i < lines.length; i++) {
    for (let c of lines[i]) {
      if (c === '{') brace++;
      if (c === '}') brace--;
    }
    if (brace === 0) { safeTextEnd = i; break; }
  }
}

const blockStart = lines.findIndex(l => l.includes('export const BlockRenderer = React.memo('));
let blockEnd = -1;
if (blockStart !== -1) {
  let brace = 0;
  for (let i = blockStart; i < lines.length; i++) {
    for (let c of lines[i]) {
      if (c === '{') brace++;
      if (c === '}') brace--;
    }
    if (brace === 0 && lines[i].includes('});')) { blockEnd = i; break; }
    if (brace === 0 && i > blockStart + 10 && lines[i].startsWith('});')) { blockEnd = i; break; }
  }
}

// Ensure we found both
if (safeTextStart !== -1 && blockStart !== -1) {
  console.log(`Found safeText: ${safeTextStart}-${safeTextEnd}`);
  console.log(`Found blockRenderer: ${blockStart}-${blockEnd}`);

  const blockRendererCode = lines.slice(blockStart - 1, blockEnd + 1).join('\n'); // Include the comment above it

  const newBlockRendererContent = `import React from 'react';
import { WorksheetBlock } from '../../types';
import { EditableText } from '../Editable';
import { recursiveSafeText } from '../../utils/textUtils';

` + blockRendererCode + `\n`;

  fs.mkdirSync('d:/oogmatik/src/components/SheetRenderer', { recursive: true });
  fs.writeFileSync('d:/oogmatik/src/components/SheetRenderer/BlockRenderer.tsx', newBlockRendererContent);

  // Remove them from SheetRenderer.tsx
  // We need to remove them in reverse order to not mess up indices, or just build a new array
  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (i >= safeTextStart && i <= safeTextEnd) continue;
    if (i >= blockStart - 1 && i <= blockEnd) continue;
    newLines.push(lines[i]);
  }

  // Add imports
  const importText = `import { recursiveSafeText } from '../utils/textUtils';\nimport { BlockRenderer } from './SheetRenderer/BlockRenderer';\n`;
  const lastImportIndex = newLines.findIndex(l => l.startsWith('import { EditableText'));
  newLines.splice(lastImportIndex + 1, 0, importText);

  fs.writeFileSync(path, newLines.join('\n'));
  console.log('Extraction complete!');
} else {
  console.log('Could not find the target blocks.');
}
