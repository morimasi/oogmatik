import { FutoshikiData, GeneratorOptions } from '../../../types';

/**
 * Futoşhiki Ultra-Profesyonel Yerel Üretici
 * 4x4'ten 7x7'ye kadar dinamik boyut desteği ve akıllı zorluk seviyeleri içerir.
 */
export const generateOfflineFutoshiki = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount, gridSize, density, hintLevel } = options;

    let size = gridSize || 4;
    if (!gridSize) {
        if (difficulty === 'Başlangıç') size = 4;
        else if (difficulty === 'Orta') size = 5;
        else if (difficulty === 'Zor') size = 6;
        else if (difficulty === 'Uzman') size = 7;
    }

    const activities: FutoshikiData[] = [];

    const solveLatinSquare = (board: (number | null)[][], s: number): boolean => {
        let row = -1, col = -1, isEmpty = false;
        for (let i = 0; i < s; i++) {
            for (let j = 0; j < s; j++) {
                if (board[i][j] === null) {
                    row = i; col = j; isEmpty = true; break;
                }
            }
            if (isEmpty) break;
        }

        if (!isEmpty) return true;

        const numbers = Array.from({ length: s }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

        for (const num of numbers) {
            let isSafe = true;
            for (let x = 0; x < s; x++) {
                if (board[row][x] === num || board[x][col] === num) {
                    isSafe = false; break;
                }
            }
            if (isSafe) {
                board[row][col] = num;
                if (solveLatinSquare(board, s)) return true;
                board[row][col] = null;
            }
        }
        return false;
    };

    for (let c = 0; c < worksheetCount; c++) {
        const board: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
        solveLatinSquare(board, size);

        const constraints: any[] = [];
        let activityDensity = 0.5;
        if (density === 'low') activityDensity = 0.3;
        else if (density === 'high') activityDensity = 0.8;
        else {
            activityDensity = difficulty === 'Başlangıç' ? 0.35 : (difficulty === 'Orta' ? 0.5 : 0.7);
        }

        const maxConstraints = Math.floor(size * size * activityDensity);

        let attempts = 0;
        while (constraints.length < maxConstraints && attempts < 200) {
            attempts++;
            const isHorizontal = Math.random() > 0.5;
            const r = Math.floor(Math.random() * (isHorizontal ? size : size - 1));
            const col = Math.floor(Math.random() * (isHorizontal ? size - 1 : size));

            const val1 = board[r][col] as number;
            const val2 = isHorizontal ? board[r][col + 1] as number : board[r + 1][col] as number;

            const exists = constraints.find(c =>
                (c.r1 === r && c.c1 === col && c.r2 === (isHorizontal ? r : r + 1) && c.c2 === (isHorizontal ? col + 1 : col))
            );

            if (!exists) {
                constraints.push({
                    r1: r, c1: col,
                    r2: isHorizontal ? r : r + 1, c2: isHorizontal ? col + 1 : col,
                    type: val1 > val2 ? 'greater' : 'less'
                });
            }
        }

        const puzzleGrid: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
        let emptyRatio = 0.6;
        if (hintLevel === 'low') emptyRatio = 0.85;
        else if (hintLevel === 'high') emptyRatio = 0.3;
        else {
            emptyRatio = difficulty === 'Başlangıç' ? 0.4 : (difficulty === 'Orta' ? 0.6 : (difficulty === 'Zor' ? 0.8 : 0.9));
        }

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (Math.random() > emptyRatio) {
                    puzzleGrid[i][j] = board[i][j];
                }
            }
        }

        const randR = Math.floor(Math.random() * size);
        const randC = Math.floor(Math.random() * size);
        puzzleGrid[randR][randC] = board[randR][randC];

        activities.push({
            title: `Ultra-Futoşhiki (${size}x${size})`,
            instruction: `Her satır ve sütunda 1'den ${size}'e kadar olan rakamlar birer kez kullanılmalıdır. Kutular arasındaki 'Büyüktür' ve 'Küçüktür' işaretlerine dikkat et!`,
            pedagogicalNote: `${size}x${size} ölçeğinde mantıksal çıkarsama ve görsel-uzamsal dikkat becerilerini hedefler.`,
            puzzles: [{
                size,
                grid: puzzleGrid,
                constraints
            }]
        });
    }

    return activities;
};
