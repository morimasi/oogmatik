import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, 'src');
const OFFLINE_DIR = path.join(SRC_DIR, 'services', 'offlineGenerators');
const AI_DIR = path.join(SRC_DIR, 'services', 'generators');

const report = {
    infiniteLoopRisks: [],
    missingAnswers: [],
    missingPedagogicalNotes: []
};

function scanDir(dir, isAI = false) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath, isAI);
        } else if (file.endsWith('.ts') && file !== 'index.ts' && file !== 'helpers.ts' && file !== 'registry.ts') {
            const content = fs.readFileSync(fullPath, 'utf8');

            // Check for infinite loops
            if (content.match(/while\s*\(\s*true\s*\)/)) {
                report.infiniteLoopRisks.push({ file, type: isAI ? 'AI' : 'Offline' });
            }

            // Check for missing answers (basic heuristic: looking for "answer:" in offline generators)
            if (!isAI && !content.includes('answer:')) {
                // Some might just return a generic structure, so we check if it mentions 'items' or 'puzzles'
                report.missingAnswers.push({ file });
            }

            // Ensure AI prompts instruct for pedagogicalNote
            if (isAI && content.includes('generate') && !content.includes('pedagogicalNote') && !file.includes('core')) {
                report.missingPedagogicalNotes.push({ file });
            }
        }
    }
}

scanDir(OFFLINE_DIR, false);
scanDir(AI_DIR, true);

console.log(JSON.stringify(report, null, 2));
