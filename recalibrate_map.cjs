
const fs = require('fs');

const filePath = 'c:/Users/Administrator/Desktop/oogmatik/oogmatik/components/sheets/visual/turkeyMapPaths.ts';
const regionsPath = 'c:/Users/Administrator/Desktop/oogmatik/oogmatik/components/sheets/visual/turkeyRegions.ts';

const content = fs.readFileSync(filePath, 'utf8');
const regionsContent = fs.readFileSync(regionsPath, 'utf8');

// Parse regions
const regionsRegex = /'(\d+)':\s*'([^']+)'/g;
const plateToRegion = {};
let rMatch;
while ((rMatch = regionsRegex.exec(regionsContent)) !== null) {
    plateToRegion[rMatch[1]] = rMatch[2];
}

// Match plate and draw strings
const regex = /plate:\s*'(\d+)',\s*city:\s*'([^']+)',\s*draw:\s*'([^']+)'/g;
let match;

const results = [];
const regionPoints = {};

while ((match = regex.exec(content)) !== null) {
    const plate = match[1];
    const name = match[2];
    const draw = match[3];

    let currentX = 0;
    let currentY = 0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    function updateBBox(x, y) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    const commands = draw.split(/(?=[MmLlHhVvCcSsQqTtAaZz])/);
    for (const cmd of commands) {
        if (!cmd) continue;
        const type = cmd[0];
        const argsStr = cmd.slice(1).trim();
        const args = argsStr.replace(/-/g, ' -').replace(/,/g, ' ').split(/\s+/).filter(x => x.length > 0).map(Number);

        if (type === 'M') { currentX = args[0]; currentY = args[1]; updateBBox(currentX, currentY); }
        else if (type === 'm') { currentX += args[0]; currentY += args[1]; updateBBox(currentX, currentY); }
        else if (type === 'L') { currentX = args[0]; currentY = args[1]; updateBBox(currentX, currentY); }
        else if (type === 'l') { currentX += args[0]; currentY += args[1]; updateBBox(currentX, currentY); }
        else if (type === 'H') { currentX = args[0]; updateBBox(currentX, currentY); }
        else if (type === 'h') { currentX += args[0]; updateBBox(currentX, currentY); }
        else if (type === 'V') { currentY = args[0]; updateBBox(currentX, currentY); }
        else if (type === 'v') { currentY += args[0]; updateBBox(currentX, currentY); }
        else if (type === 'C') { for (let i = 0; i < args.length; i += 6) { currentX = args[i + 4]; currentY = args[i + 5]; updateBBox(currentX, currentY); } }
        else if (type === 'c') { for (let i = 0; i < args.length; i += 6) { currentX += args[i + 4]; currentY += args[i + 5]; updateBBox(currentX, currentY); } }
    }

    const centerX = Math.round((minX + maxX) / 2);
    const centerY = Math.round((minY + maxY) / 2);

    results.push({ plate, name, x: centerX, y: centerY });

    const region = plateToRegion[plate];
    if (region) {
        if (!regionPoints[region]) regionPoints[region] = [];
        regionPoints[region].push({ x: centerX, y: centerY });
    }
}

const regionCenters = {};
for (const region in regionPoints) {
    const pts = regionPoints[region];
    const avgX = Math.round(pts.reduce((sum, p) => sum + p.x, 0) / pts.length);
    const avgY = Math.round(pts.reduce((sum, p) => sum + p.y, 0) / pts.length);
    regionCenters[region] = { x: avgX, y: avgY };
}

console.log('CITY COORDINATES:');
console.log(JSON.stringify(results, null, 2));
console.log('\nREGION CENTERS:');
console.log(JSON.stringify(regionCenters, null, 2));
