import { execSync } from 'child_process';
import fs from 'fs';

try {
    let output = '';
    output += '--- GIT STATUS ---\n';
    output += execSync('git status').toString();
    output += '\n\n--- GIT LOG (Last 2) ---\n';
    output += execSync('git log -n 2 --oneline --name-status').toString();
    output += '\n\n--- GIT REMOTE -v ---\n';
    output += execSync('git remote -v').toString();
    output += '\n\n--- API/GENERATE.TS LATEST CONTENT (First 30 lines) ---\n';
    const content = fs.readFileSync('api/generate.ts', 'utf-8');
    output += content.split('\n').slice(0, 30).join('\n');

    fs.writeFileSync('GIT_STATE_REPORT.txt', output);
    console.log('Report written to GIT_STATE_REPORT.txt');
} catch (e) {
    fs.writeFileSync('GIT_STATE_REPORT.txt', 'Error running git: ' + e.message);
}
