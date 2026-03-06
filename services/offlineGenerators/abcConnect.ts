import { AbcConnectData, GeneratorOptions } from '../types';

export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    let gridDims = [4, 5];
    if (difficulty === 'Başlangıç') gridDims = [3, 4];
    if (difficulty === 'Orta') gridDims = [4, 5];
    if (difficulty === 'Zor' || difficulty === 'Uzman') gridDims = [5, 6];

    const romanMap: Record<number, string> = {
        1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
        11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI'
    };

    const activities: AbcConnectData[] = [];

    for (let c = 0; c < worksheetCount; c++) {
        const dim = gridDims[c % gridDims.length];
        const pairCount = Math.floor(dim * 1.5);
        const paths: any[] = [];
        const usedCells = new Set<string>();

        const getRandomEmptyCell = () => {
            let x, y, key;
            let attempts = 0;
            do {
                x = Math.floor(Math.random() * dim);
                y = Math.floor(Math.random() * dim);
                key = `${x},${y}`;
                attempts++;
            } while (usedCells.has(key) && attempts < 100);
            return { x, y, key };
        };

        let startValueIndex = Math.floor(Math.random() * 5) + 1;

        for (let i = 0; i < pairCount; i++) {
            const val = startValueIndex + i;

            const startCell = getRandomEmptyCell();
            usedCells.add(startCell.key);

            const endCell = getRandomEmptyCell();
            usedCells.add(endCell.key);

            paths.push({
                start: { x: startCell.x, y: startCell.y },
                end: { x: endCell.x, y: endCell.y },
                value: val,
                matchValue: romanMap[val] || val.toString()
            });
        }

        activities.push({
            title: `Romen Rakamları Bağlama (Boyut: ${dim}x${dim})`,
            instruction: 'Sayıları karşılık gelen Romen rakamlarıyla, çizgiler birbirini kesmeden birleştir.',
            gridDim: dim,
            paths
        });
    }

    return activities;
};
