import { GeneratorOptions } from '../../types';

export const generateOfflineLetterMazeTest = async (options: GeneratorOptions): Promise<any[]> => {
    const opts = options || {};
    const customSettings = (opts as any).customSettings || {};

    const gridSize = customSettings.gridSize || '5x5';
    const rows = parseInt(gridSize.charAt(0));
    const cols = parseInt(gridSize.charAt(2));

    // Rastgele bir harf ızgarası oluşturalım
    const letters = 'ABCDEFGHIJKLMNOPRSTUVYZ';
    const items = [];

    for (let i = 0; i < (opts.worksheetCount || 1); i++) {
        const grid = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => letters.charAt(Math.floor(Math.random() * letters.length)))
        );
        // Default taslak dönüş yapılandırıldı.
        items.push({
            title: 'Harf Labirenti Testi',
            instruction: 'Hedef harfleri takip ederek çıkışı bulun!',
            grid,
            rows,
            cols,
            settings: customSettings
        });
    }

    return items;
};
