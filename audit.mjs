import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');

function readFile(filepath) {
    try {
        return fs.readFileSync(filepath, 'utf8');
    } catch (e) {
        return '';
    }
}

// 1. Get all activities
const activitiesFile = readFile(path.join(SRC_DIR, 'constants', 'activities.ts'));
const activityTypes = [];
const regex = /id:\s*(ActivityType\.[A-Z0-9_]+)/g;
let match;
while ((match = regex.exec(activitiesFile)) !== null) {
    activityTypes.push(match[1].split('.')[1]);
}

// 2. Check registry
const registryFile = readFile(path.join(SRC_DIR, 'services', 'generators', 'registry.ts'));
// 3. Check SheetRenderer
const sheetRendererFile = readFile(path.join(SRC_DIR, 'components', 'SheetRenderer.tsx'));
// 4. Check LegacyRenderer
const legacyRendererFile = readFile(path.join(SRC_DIR, 'components', 'SheetRenderer', 'LegacyRenderer.tsx'));
// 5. Check Config Registry
const configRegistryFile = readFile(path.join(SRC_DIR, 'components', 'activity-configs', 'index.ts'));

const report = [];

for (const act of activityTypes) {
    const issues = [];

    // Check registry for withOffline
    const regRegex = new RegExp(`\\[ActivityType\\.${act}\\]:\\s*\\{[^}]*offline:\\s*withOffline`, 's');
    if (regRegex.test(registryFile)) {
        issues.push('Missing offline generator (uses withOffline)');
    }

    const regExists = new RegExp(`\\[ActivityType\\.${act}\\]:`, 's');
    if (!regExists.test(registryFile)) {
        issues.push('Not registered in registry.ts at all');
    }

    // Check renderers
    const rendererRegex = new RegExp(`ActivityType\\.${act}`);
    if (!rendererRegex.test(sheetRendererFile) && !rendererRegex.test(legacyRendererFile)) {
        issues.push('Missing rendering map in SheetRenderer.tsx and LegacyRenderer.tsx');
    }

    // Check Config
    const configRegex = new RegExp(`\\[ActivityType\\.${act}\\]:`, 's');
    if (!configRegex.test(configRegistryFile)) {
        issues.push('Missing config component mapping in activity-configs/index.ts');
    }

    if (issues.length > 0) {
        report.push({ activity: act, issues });
    }
}

console.log(JSON.stringify(report, null, 2));
