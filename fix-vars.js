const fs = require('fs');

const reportPath = 'eslint-report.json';
if (!fs.existsSync(reportPath)) {
  console.log('No report found');
  process.exit(0);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

for (const file of report) {
  if (file.messages.length === 0) continue;

  let content = fs.readFileSync(file.filePath, 'utf8');
  const lines = content.split('\n');
  let changed = false;

  // Process messages backwards to not mess up line numbers if we were adding lines (we aren't, but still good practice)
  const messages = file.messages
    .filter((m) => m.ruleId === '@typescript-eslint/no-unused-vars')
    .sort((a, b) => b.line - a.line);

  for (const msg of messages) {
    // Message format is usually: "'varName' is defined but never used" or "'varName' is assigned a value but never used."
    const match = msg.message.match(/'([^']+)'/);
    if (!match) continue;
    const varName = match[1];

    // Safety check: skip if variable name already starts with _
    if (varName.startsWith('_')) continue;

    const lineIdx = msg.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) continue;

    const line = lines[lineIdx];

    // We want to replace `varName` with `_varName` on this line
    // But only as a whole word, and preferably near the column
    const colIdx = msg.column - 1;

    // Instead of naive \b regex across the line which might replace wrong occurrences,
    // let's just replace the first occurrence at or after colIdx that matches the word.

    // Find the word boundary around colIdx
    // Actually ESLint column points EXACTLY to the start of the variable name
    if (line.substring(colIdx, colIdx + varName.length) === varName) {
      lines[lineIdx] = line.substring(0, colIdx) + '_' + line.substring(colIdx);
      changed = true;
    } else {
      // Fallback: regex replace the word
      const regex = new RegExp(`\\b${varName}\\b`);
      if (regex.test(lines[lineIdx])) {
        lines[lineIdx] = lines[lineIdx].replace(regex, `_${varName}`);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file.filePath, lines.join('\n'));
    console.log(`Fixed ${file.filePath}`);
  }
}
