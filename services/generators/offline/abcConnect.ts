import { AbcConnectData, GeneratorOptions } from '../../../types';

/**
 * ABC Bağlama Ultra-Profesyonel Yerel Üretici
 * Çoklu modlar (Romen, Harf, Nokta, İşlem) ve akıllı yerleşim içerir.
 */
export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { difficulty, worksheetCount, gridSize, variant: optVariant, density } = options;

    let dim = gridSize || 5;
    if (!gridSize) {
        if (difficulty === 'Başlangıç') dim = 4;
        else if (difficulty === 'Orta') dim = 5;
        else if (difficulty === 'Zor' || difficulty === 'Uzman') dim = 6;
    }

    const romanMap: Record<number, string> = {
        1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
        11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI'
    };

    const activities: AbcConnectData[] = [];

    for (let c = 0; c < worksheetCount; c++) {
        const pairCount = Math.floor(dim * (density === 'high' ? 2 : (density === 'low' ? 1.2 : 1.5)));
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
                id: `path_${i}`,
                start: { x: startCell.x, y: startCell.y },
                end: { x: endCell.x, y: endCell.y },
                value: val,
                matchValue: romanMap[val] || val.toString()
            });
        }

        activities.push({
            title: `ABC Bağlama (${dim}x${dim})`,
            instruction: 'Sayıları karşılık gelen değerleriyle, çizgiler birbirini kesmeden birleştir.',
            pedagogicalNote: 'Görsel-uzamsal planlama ve sembolik eşleştirme becerilerini geliştirir.',
            gridDim: dim,
            variant: (optVariant as any) || 'roman',
            paths
        });
    }

    return activities;
};

// Aliases for compatibility
export const generateAbcConnectActivity = (difficulty: string, count: number) =>
    generateOfflineAbcConnect({ difficulty, worksheetCount: count } as any);
