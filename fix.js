const fs = require('fs');
[
  'tests/superStudioBatch.test.ts',
  'tests/superStudioCache.test.ts',
  'tests/superStudioGenerator.test.ts',
].forEach((f) => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/mode: 'ai'/g, "mode: 'ai', topic: 'Test'");
  c = c.replace(/mode: 'fast'/g, "mode: 'fast', topic: 'Test'");
  fs.writeFileSync(f, c);
});
console.log('Fixed missing topic');
