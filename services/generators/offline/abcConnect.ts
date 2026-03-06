import { AbcConnectData } from '../../types/math';

export const generateAbcConnectActivity = (difficulty: string = 'Makul', count: number = 2): AbcConnectData[] => {
    let gridDims = [4, 5];
    if (difficulty === 'Kolay') gridDims = [3, 4];
    if (difficulty === 'Makul') gridDims = [4, 5];
    if (difficulty === 'Zor' || difficulty === 'Çok Zor') gridDims = [5, 6];

    const romanMap: Record<number, string> = {
        1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
        11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI'
    };

    const activities: AbcConnectData[] = [];

    for (let c = 0; c < count; c++) {
        const dim = gridDims[c % gridDims.length];
        // Basit bir rasgele dağılım, yapay zekaya ihtiyaç duymayan mantık
        const pairCount = Math.floor(dim * 1.5);
        const paths: any[] = [];
        const usedCells = new Set<string>();

        const getRandomEmptyCell = () => {
            let x, y, key;
            do {
                x = Math.floor(Math.random() * dim);
                y = Math.floor(Math.random() * dim);
                key = `${x},${y}`;
            } while (usedCells.has(key));
            return { x, y, key };
        };

        // Bu algoritma, A'dan B'ye doğrulanmış karmaşık Numberlink yolu çizmek yerine
        // sadece Romen Rakamları ile doğal sayıları harita üzerine dağıtır.
        // Arayüzde çizgiler draw-canvas ile serbestçe çekilecektir.

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
