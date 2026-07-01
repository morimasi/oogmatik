import fs from 'fs';
const content = fs.readFileSync('src/services/generators/mathSinavGenerator.ts', 'utf8');
const lines = content.split('\n');

const results = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check for template literals (backticks)
    if (line.includes('`')) {
        // Specifically look for patterns we suspect cause issues with this old esbuild:
        // 1. mat- prefix patterns
        // 2. Turkish characters inside backticks
        if (line.includes('mat-') || /[öüşığçÖÜŞİĞÇ]/.test(line)) {
            results.push({ line: i + 1, content: line.trim() });
        }
    }
}
console.log(JSON.stringify(results, null, 2));