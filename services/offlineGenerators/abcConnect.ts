import { AbcConnectData, GeneratorOptions } from '../../types';

/**
 * ABC Bağlama Ultra-Profesyonel Yerel Üretici
 * Çoklu modlar (Romen, Harf, Nokta, İşlem) ve akıllı yerleşim içerir.
 */
export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { difficulty, worksheetCount } = options;

    // Boyut belirleme
    let dim = 4;
    if (difficulty === 'Başlangıç') dim = 4;
    else if (difficulty === 'Orta') dim = 5;
    else if (difficulty === 'Zor') dim = 6;
    else if (difficulty === 'Uzman') dim = 8;

    const activities: AbcConnectData[] = [];

    // Varyantlar arası geçiş (Her sayfada farklı bir varyant denenebilir veya sabit kalabilir)
    const variants: ('roman' | 'case' | 'dots' | 'math')[] = ['roman', 'case', 'dots', 'math'];

    const romanMap: Record<number, string> = {
        1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
        11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX'
    };

    const letters = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";

    for (let c = 0; c < worksheetCount; c++) {
        const variant = variants[c % variants.length];
        const pairCount = Math.floor(dim * 1.2);
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

        for (let i = 0; i < pairCount; i++) {
            let value: string | number = "";
            let matchValue: string | number = "";

            if (variant === 'roman') {
                const val = i + 1;
                value = val;
                matchValue = romanMap[val] || val.toString();
            } else if (variant === 'case') {
                const char = letters[i % letters.length];
                value = char;
                matchValue = char.toLowerCase();
            } else if (variant === 'dots') {
                const val = i + 1;
                value = val;
                matchValue = `dots-${val}`; // UI'da render edilecek
            } else if (variant === 'math') {
                const result = Math.floor(Math.random() * 9) + 2;
                const a = Math.floor(Math.random() * (result - 1)) + 1;
                const b = result - a;
                value = `${a}+${b}`;
                matchValue = result;
            }

            const startCell = getRandomEmptyCell();
            usedCells.add(startCell.key);

            const endCell = getRandomEmptyCell();
            usedCells.add(endCell.key);

            paths.push({
                id: `path-${i}`,
                start: { x: startCell.x, y: startCell.y },
                end: { x: endCell.x, y: endCell.y },
                value,
                matchValue
            });
        }

        let title = "ABC Bağlama";
        let instruction = "Verilenleri birbirinin yolunu kesmeden eşleştirin.";

        switch (variant) {
            case 'roman':
                title = "Sayılar ve Romen Rakamları";
                instruction = "Sayıları Romen rakamı karşılıklarıyla, çizgiler çakışmadan birleştir.";
                break;
            case 'case':
                title = "Büyük ve Küçük Harfler";
                instruction = "Büyük harfleri küçük karşılıklarıyla, yollar kesişmeden eşleştir.";
                break;
            case 'dots':
                title = "Sayılar ve Noktalar";
                instruction = "Sayıları uygun miktarda nokta içeren kutularla birleştir.";
                break;
            case 'math':
                title = "İşlemler ve Sonuçlar";
                instruction = "Toplama işlemlerini doğru sonuçlarıyla, yollar kesişmeden bağla.";
                break;
        }

        activities.push({
            title: `${title} (${dim}x${dim})`,
            instruction,
            gridDim: dim,
            variant,
            paths
        });
    }

    return activities;
};
