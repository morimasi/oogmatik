const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'ts_errors.txt');
const logContent = fs.readFileSync(logPath, 'utf8');

const lines = logContent.split('\n');
const fixes = {};

lines.forEach(line => {
    // Match TS2724: has no exported member named '_Something'. Did you mean 'Something'?
    const ts2724Match = line.match(/(src\/.*?\.(?:tsx|ts))\(.*?\): error TS2724: .*? has no exported member named '(_\w+)'. Did you mean '(\w+)'\?/);
    if (ts2724Match) {
        const file = ts2724Match[1];
        const badName = ts2724Match[2];
        const goodName = ts2724Match[3];
        if (!fixes[file]) fixes[file] = {};
        fixes[file][badName] = goodName;
    }

    // Match TS2339: Property '_propertyName' does not exist ...
    const ts2339Match = line.match(/(src\/.*?\.(?:tsx|ts))\(.*?\): error TS2339: Property '(_\w+)' does not exist/);
    if (ts2339Match) {
        const file = ts2339Match[1];
        const badName = ts2339Match[2];
        const goodName = badName.substring(1); // remove the underscore
        if (!fixes[file]) fixes[file] = {};
        fixes[file][badName] = goodName;
    }

    // Match TS2551: Property '_propertyName' does not exist ... Did you mean 'propertyName'?
    const ts2551Match = line.match(/(src\/.*?\.(?:tsx|ts))\(.*?\): error TS2551: Property '(_\w+)' does not exist .*? Did you mean '(\w+)'\?/);
    if (ts2551Match) {
        const file = ts2551Match[1];
        const badName = ts2551Match[2];
        const goodName = ts2551Match[3];
        if (!fixes[file]) fixes[file] = {};
        fixes[file][badName] = goodName;
    }
});

let totalFilesFixed = 0;
let totalReplacements = 0;

for (const file in fixes) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        for (const badName in fixes[file]) {
            const goodName = fixes[file][badName];
            // Regex to match the badName as a whole word, optionally prefixed by word boundaries or dots, 
            // but we have to be careful not to replace something that actually needs the underscore if it was global.
            // Since the TS compiler complained exactly about this token, standard replace global is usually safe for identifiers.
            const regex = new RegExp(`\\b${badName}\\b`, 'g');
            if (regex.test(content)) {
                content = content.replace(regex, goodName);
                modified = true;
                totalReplacements++;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            totalFilesFixed++;
            console.log(`Fixed ${file}`);
        }
    }
}

console.log(`\nAuto-fix complete: Modified ${totalFilesFixed} files, made ${totalReplacements} replacements.`);
