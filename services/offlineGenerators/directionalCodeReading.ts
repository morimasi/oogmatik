import { GeneratorOptions, DirectionalCodeReadingData } from '../../types/visual';
import { getRandomInt, getRandomItems, shuffle } from './helpers';

export const generateOfflineDirectionalCodeReading = async (options: GeneratorOptions): Promise<DirectionalCodeReadingData> => {
    const gridSize = options.gridSize || (options.difficulty === 'Zor' ? 8 : 6);
    const difficulty = options.difficulty || 'Orta';

    // 1. Initialize Grid
    const grid: any[][] = [];
    for (let y = 0; y < gridSize; y++) {
        const row = [];
        for (let x = 0; x < gridSize; x++) {
            row.push({ x, y, type: 'empty' });
        }
        grid.push(row);
    }

    // 2. Determine Difficulty Parameters
    const config = {
        'Başlangıç': { pathLength: 4, obstacles: 0.1 },
        'Orta': { pathLength: 6, obstacles: 0.2 },
        'Zor': { pathLength: 9, obstacles: 0.25 },
        'Uzman': { pathLength: 12, obstacles: 0.3 }
    }[difficulty] || { pathLength: 6, obstacles: 0.2 };

    // 3. Generate Valid Path (DFS simplified)
    let startX = 0;
    let startY = 0;
    let currentX = startX;
    let currentY = startY;
    const path: { x: number, y: number, dir: string }[] = [];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);

    const directions = [
        { name: 'right', dx: 1, dy: 0, label: 'Sağ' },
        { name: 'left', dx: -1, dy: 0, label: 'Sol' },
        { name: 'down', dx: 0, dy: 1, label: 'Aşağı' },
        { name: 'up', dx: 0, dy: -1, label: 'Yukarı' }
    ];

    for (let i = 0; i < config.pathLength; i++) {
        const possibleMoves = directions.filter(d => {
            const nx = currentX + d.dx;
            const ny = currentY + d.dy;
            return nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && !visited.has(`${nx},${ny}`);
        });

        if (possibleMoves.length === 0) break;

        const move = possibleMoves[getRandomInt(0, possibleMoves.length - 1)];
        currentX += move.dx;
        currentY += move.dy;
        visited.add(`${currentX},${currentY}`);
        path.push({ x: currentX, y: currentY, dir: move.name });
    }

    const targetPos = { x: currentX, y: currentY };

    // 4. Place Obstacles (avoiding the path)
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (visited.has(`${x},${y}`)) continue;
            if (Math.random() < config.obstacles) {
                grid[y][x].type = 'obstacle';
            }
        }
    }

    // 5. Finalize Grid Types
    grid[startY][startX] = { x: startX, y: startY, type: 'start', icon: 'fa-solid fa-rocket' };
    grid[targetPos.y][targetPos.x] = { x: targetPos.x, y: targetPos.y, type: 'target', icon: 'fa-solid fa-flag-checkered' };

    // 6. Generate Instructions
    const instructions = path.reduce((acc: any[], current, idx) => {
        if (idx === 0 || current.dir !== path[idx - 1].dir) {
            acc.push({ step: acc.length + 1, count: 1, direction: current.dir, label: current.dir === 'right' ? 'Sağ' : current.dir === 'left' ? 'Sol' : current.dir === 'down' ? 'Aşağı' : 'Yukarı' });
        } else {
            acc[acc.length - 1].count++;
        }
        return acc;
    }, []);

    // 7. Theme selection
    const themes = [
        { intro: "Kayıp astronotu istasyona ulaştır.", name: "Uzay Görevi" },
        { intro: "Gizli ajanı güvenli eve götür.", name: "Gizli Operasyon" },
        { intro: "Define avcısını hazineye yönlendir.", name: "Hazine Avı" }
    ];
    const theme = themes[getRandomInt(0, themes.length - 1)];

    return {
        id: 'directional_code_' + Date.now(),
        activityType: 'DIRECTIONAL_CODE_READING' as any,
        title: theme.name + " (Premium)",
        settings: {
            difficulty,
            gridSize,
            obstacleDensity: config.obstacles * 100,
            cipherType: 'arrows'
        },
        content: {
            title: theme.name,
            storyIntro: theme.intro,
            startPos: { x: startX, y: startY },
            targetPos,
            grid,
            instructions: instructions.map(ins => ({
                ...ins,
                label: `${ins.count} ${ins.label === 'Sağ' ? '➡️' : ins.label === 'Sol' ? '⬅️' : ins.label === 'Aşağı' ? '⬇️' : '⬆️'}`
            }))
        }
    } as any;
};
