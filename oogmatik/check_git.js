import { execSync } from 'child_process';
try {
    console.log('--- GIT STATUS ---');
    console.log(execSync('git status').toString());
    console.log('--- GIT LOG ---');
    console.log(execSync('git log -n 3 --name-status').toString());
} catch (e) {
    console.log(e.toString());
}
