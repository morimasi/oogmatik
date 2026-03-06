import { OddEvenSudokuData } from '../../types/math';

export const generateOddEvenSudokuActivity = (difficulty: string = 'Makul', count: number = 2): OddEvenSudokuData[] => {
    let size = 4;
    // Tek/Çift Sudoku genelde çocuklar için daha karmaşıktır, 4x4 veya 6x6 idealdır.
    if (difficulty === 'Zor' || difficulty === 'Çok Zor') size = 6;

    const activities: OddEvenSudokuData[] = [];

    // Basit bir 4x4 sudoku çözücü / üreteci (Backtracking)
    const solve = (board: (number | null)[][], s: number): boolean => {
        let row = -1;
        let col = -1;
        let isEmpty = false;

        for (let i = 0; i < s; i++) {
            for (let j = 0; j < s; j++) {
                if (board[i][j] === null) {
                    row = i;
                    col = j;
                    isEmpty = true;
                    break;
                }
            }
            if (isEmpty) break;
        }

        if (!isEmpty) return true; // Çözüldü

        // Boyuta göre bölge büyüklüğü (4x4 için 2x2, 6x6 için 2x3 grid)
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

    const isSafe = (board: (number | null)[][], row: number, col: number, num: number, s: number, boxRows: number, boxCols: number): boolean => {
        // Satır & Sütun kontrolü
        for (let x = 0; x < s; x++) {
            if (board[row][x] === num || board[x][col] === num) return false;
        }
        // Kutu kontrolü
        const startRow = row - row % boxRows;
        const startCol = col - col % boxCols;
        for (let i = 0; i < boxRows; i++) {
            for (let j = 0; j < boxCols; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }
        return true;
    };

    for (let c = 0; c < count; c++) {
        // 1. Boş bir tahta oluştur ve tamamen çöz
        let board: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));

        // Rasgeleliği artırmak için ilk satırı karıştırarak başlat
        const firstRow = Array.from({ length: size }, (_, i) => i + 1);
        for (let i = firstRow.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [firstRow[i], firstRow[j]] = [firstRow[j], firstRow[i]];
        }
        board[0] = firstRow as number[];
        solve(board, size);

        // 2. Tahta üzerinden tek/çift maskesi oluştur ve bazı hücreleri boşalt
        const mask: ('odd' | 'even' | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
        const puzzleGrid: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));

        const emptyRatio = difficulty === 'Kolay' ? 0.4 : (difficulty === 'Makul' ? 0.5 : 0.65);

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const val = board[i][j] as number;

                // Belirli hücrelere tek/çift kısıtlaması (rengi) koy
                if (Math.random() > 0.4) {
                    mask[i][j] = val % 2 === 0 ? 'even' : 'odd';
                }

                // Sudoku boşluklarını yarat (Eğer maske varsa bazen sayıyı da gösterebilir, bazen gizleyebiliriz)
                if (Math.random() > emptyRatio) {
                    puzzleGrid[i][j] = val; // Sayı açık
                }
            }
        }

        activities.push({
            title: `Tek / Çift Sudoku (${size}x${size})`,
            instruction: `Sudoku kurallarına ek olarak; yeşil renkli kutulara sadece TEK, mavi renkli kutulara sadece ÇİFT sayılar gelmelidir.`,
            puzzles: [{
                size,
                grid: puzzleGrid,
                oddEvenMask: mask
            }]
        });
    }

    return activities;
};
