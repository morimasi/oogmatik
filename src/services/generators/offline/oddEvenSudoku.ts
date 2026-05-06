import { OddEvenSudokuData, GeneratorOptions } from '../../../types';

export const generateOfflineOddEvenSudoku = async (options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const { difficulty, worksheetCount } = options;
    let size = 4;
    if (difficulty === 'Zor' || difficulty === 'Uzman') size = 6;

    const activities: OddEvenSudokuData[] = [];

    const isSafe = (board: (number | null)[][], row: number, col: number, num: number, s: number, boxRows: number, boxCols: number): boolean => {
        for (let x = 0; x < s; x++) {
            if (board[row][x] === num || board[x][col] === num) return false;
        }
        const startRow = row - row % boxRows;
        const startCol = col - col % boxCols;
        for (let i = 0; i < boxRows; i++) {
            for (let j = 0; j < boxCols; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }
        return true;
    };

    const solve = (board: (number | null)[][], s: number): boolean => {
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

        const boxRows = s === 6 ? 2 : 2;
        const boxCols = s === 6 ? 3 : 2;

        for (let num = 1; num <= s; num++) {
            if (isSafe(board, row, col, num, s, boxRows, boxCols)) {
                board[row][col] = num;
                if (solve(board, s)) return true;
                board[row][col] = null;
            }
        }
        return false;
    };

    const puzzlesPerSheet = size === 6 ? 4 : 6;

    for (let c = 0; c < worksheetCount; c++) {
        const pagePuzzles = [];

        for (let p = 0; p < puzzlesPerSheet; p++) {
            const board: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
            const firstRow = Array.from({ length: size }, (_, i) => i + 1);
            for (let i = firstRow.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [firstRow[i], firstRow[j]] = [firstRow[j], firstRow[i]];
            }
            board[0] = firstRow as number[];
            solve(board, size);

            const mask: ('odd' | 'even' | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
            const puzzleGrid: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));

            const emptyRatio = difficulty === 'Başlangıç' ? 0.4 : (difficulty === 'Orta' ? 0.5 : 0.65);

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const val = board[i][j] as number;
                    if (Math.random() > 0.4) mask[i][j] = val % 2 === 0 ? 'even' : 'odd';
                    if (Math.random() > emptyRatio) puzzleGrid[i][j] = val;
                }
            }
            pagePuzzles.push({
                size,
                grid: puzzleGrid,
                oddEvenMask: mask
            });
        }

        activities.push({
            title: `Tek / Çift Sudoku (${size}x${size})`,
            instruction: `Sudoku kurallarına ek olarak; yeşil renkli kutulara sadece TEK, mavi renkli kutulara sadece ÇİFT sayılar gelmelidir.`,
            puzzles: pagePuzzles
        });
    }

    return activities;
};
