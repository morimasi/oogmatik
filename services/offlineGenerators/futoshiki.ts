import { FutoshikiData, GeneratorOptions } from '../types';

export const generateOfflineFutoshiki = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount } = options;
    let size = 4;
    if (difficulty === 'Başlangıç') size = 4;
    if (difficulty === 'Orta') size = 5;
    if (difficulty === 'Zor' || difficulty === 'Uzman') size = 5;

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

        for (let num = 1; num <= s; num++) {
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
        let board: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
        const firstRow = Array.from({ length: size }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
        board[0] = firstRow as number[];
        solveLatinSquare(board, size);

        const constraints: any[] = [];
        const numConstraints = size === 4 ? 4 : 6;

        let attempts = 0;
        while (constraints.length < numConstraints && attempts < 50) {
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
        const emptyRatio = difficulty === 'Başlangıç' ? 0.5 : 0.7;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (Math.random() > emptyRatio) {
                    puzzleGrid[i][j] = board[i][j];
                }
            }
        }
        puzzleGrid[Math.floor(Math.random() * size)][Math.floor(Math.random() * size)] = board[0][0];

        activities.push({
            title: `Futoşhiki (${size}x${size})`,
            instruction: `Her satır ve sütunda 1'den ${size}'e kadar olan rakamlar birer kez kullanılmalıdır. Kutular arasındaki 'Büyüktür (>)' ve 'Küçüktür (<)' işaretlerine dikkat et!`,
            puzzles: [{
                size,
                grid: puzzleGrid,
                constraints
            }]
        });
    }

    return activities;
};
