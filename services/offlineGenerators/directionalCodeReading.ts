
import { GeneratorOptions, DirectionalCodeReadingData } from '../../types/visual';
import { getRandomInt, getRandomItems } from './helpers';

export const generateOfflineDirectionalCodeReading = async (options: GeneratorOptions): Promise<DirectionalCodeReadingData> => {
    const gridSize = options.gridSize || 6;
    const difficulty = options.difficulty || 'Orta';

    // Basit bir ızgara oluştur
    const grid: any[][] = [];
    for (let y = 0; y < gridSize; y++) {
        const row = [];
        for (let x = 0; x < gridSize; x++) {
            row.push({ x, y, type: 'empty' });
        }
        grid.push(row);
    }

    // Başlangıç ve Hedef
    const startPos = { x: 0, y: 0 };
    const targetPos = { x: gridSize - 1, y: gridSize - 1 };

    grid[startPos.y][startPos.x] = { x: startPos.x, y: startPos.y, type: 'start', icon: 'fa-solid fa-rocket' };
    grid[targetPos.y][targetPos.x] = { x: targetPos.x, y: targetPos.y, type: 'target', icon: 'fa-solid fa-flag-checkered' };

    // Basit bir L - rotası
    const instructions = [
        { step: 1, count: gridSize - 1, direction: 'right' },
        { step: 2, count: gridSize - 1, direction: 'down' }
    ];

    return {
        id: 'directional_code_' + Date.now(),
        activityType: 'DIRECTIONAL_CODE_READING' as any,
        title: "Şifreli Rota (Hızlı Üretim)",
        settings: {
            difficulty,
            gridSize,
            obstacleDensity: 0,
            cipherType: 'arrows'
        },
        content: {
            title: "Hedefe Ulaş",
            storyIntro: "Hızlı üretim modundasın. Okları takip ederek arkadaşını bul.",
            startPos,
            targetPos,
            grid,
            instructions
        }
    } as any;
};
