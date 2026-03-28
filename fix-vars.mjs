import fs from 'fs';

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

  const messages = file.messages
    .filter((m) => m.ruleId === '@typescript-eslint/no-unused-vars')
    .sort((a, b) => b.line - a.line);

  for (const msg of messages) {
    const match = msg.message.match(/'([^']+)'/);
    if (!match) continue;
    const varName = match[1];

    if (varName.startsWith('_')) continue;

    const lineIdx = msg.line - 1;
    if (lineIdx < 0 || lineIdx >= lines.length) continue;

    const line = lines[lineIdx];
    const colIdx = msg.column - 1;

    if (line.substring(colIdx, colIdx + varName.length) === varName) {
      lines[lineIdx] = line.substring(0, colIdx) + '_' + line.substring(colIdx);
      changed = true;
    } else {
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
