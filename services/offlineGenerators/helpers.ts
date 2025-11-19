
import { ShapeType } from '../../types';
import { TR_VOCAB } from '../../data/vocabulary';

// FIX: Export TR_VOCAB to make it available to other modules.
export { TR_VOCAB };

export const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
export const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
export const EMOJIS = TR_VOCAB.emojis;
export const COLORS = TR_VOCAB.colors_detailed;
export const HOMONYMS = TR_VOCAB.homonyms;

// Visual Similarity Map for attention tasks
export const VISUALLY_SIMILAR_CHARS: Record<string, string[]> = {
    'b': ['d', 'p', 'q', 'h'],
    'd': ['b', 'p', 'q', 'a'],
    'p': ['b', 'd', 'q', 'g'],
    'q': ['p', 'b', 'd', 'g'],
    'm': ['n', 'u', 'w'],
    'n': ['m', 'u', 'h'],
    'u': ['n', 'ü', 'v'],
    'ü': ['u', 'ö'],
    'o': ['ö', 'c', '0'],
    'ö': ['o', 'ü'],
    'ı': ['i', 'l', '1'],
    'i': ['ı', 'j', '!'],
    's': ['ş', '8', '5'],
    'ş': ['s', '$'],
    'z': ['2', '7'],
    'e': ['c', 'o'],
    'a': ['o', 'e', 'd'],
    'f': ['t'],
    't': ['f', 'l'],
    'k': ['h'],
    'h': ['k', 'n', 'b']
};


// --- Helper Functions ---

export const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const getRandomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomItems = <T>(arr: T[], count: number): T[] => {
    if (!arr || arr.length === 0) return [];
    if (count >= arr.length) return shuffle(arr);
    return shuffle(arr).slice(0, count);
};

// Latin Square Generator (Backtracking)
export const generateLatinSquare = (size: number): number[][] => {
    const grid = Array.from({ length: size }, () => Array(size).fill(0));
    
    const isValid = (r: number, c: number, num: number) => {
        for(let k=0; k<size; k++) if(grid[r][k] === num || grid[k][c] === num) return false;
        return true;
    }

    const solve = (idx: number): boolean => {
        if (idx === size * size) return true;
        const r = Math.floor(idx / size);
        const c = idx % size;
        
        // Optimization: Pre-check if cell is filled (not needed here as we start with 0s, but good practice)
        if (grid[r][c] !== 0) return solve(idx + 1);

        const nums = shuffle(Array.from({length: size}, (_, i) => i + 1));
        for(const num of nums) {
            if (isValid(r, c, num)) {
                grid[r][c] = num;
                if (solve(idx + 1)) return true;
                grid[r][c] = 0;
            }
        }
        return false;
    }
    solve(0);
    return grid;
}

// Sudoku Generator Helper
export const generateSudokuGrid = (size: number = 6, difficulty: string): (number | null)[][] => {
    // Only supports 6x6 (2x3 blocks) or 9x9 (3x3) for standard logic. 
    // For arbitrary size latin square, use generateLatinSquare.
    // Here we use a standard backtracking for 6x6 with block constraints.
    const grid: (number | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
    const boxHeight = size === 6 ? 2 : 3;
    const boxWidth = 3;

    function isValid(num: number, row: number, col: number) {
        // Check row and column
        for (let i = 0; i < size; i++) {
            if (grid[row][i] === num || grid[i][col] === num) {
                return false;
            }
        }
        // Check box
        const startRow = row - (row % boxHeight);
        const startCol = col - (col % boxWidth);
        for (let r = 0; r < boxHeight; r++) {
            for (let c = 0; c < boxWidth; c++) {
                if (grid[r + startRow][c + startCol] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    function solve() {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (grid[r][c] === null) {
                    const numbers = shuffle(Array.from({ length: size }, (_, i) => i + 1));
                    for (let num of numbers) {
                        if (isValid(num, r, c)) {
                            grid[r][c] = num;
                            if (solve()) {
                                return true;
                            }
                            grid[r][c] = null; // backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    solve(); // Create a full grid

    // Remove numbers based on difficulty
    let emptyCount = 0;
    if (difficulty === 'Başlangıç') emptyCount = Math.floor(size * size * 0.4);
    else if (difficulty === 'Orta') emptyCount = Math.floor(size * size * 0.55);
    else if (difficulty === 'Zor') emptyCount = Math.floor(size * size * 0.65);
    else emptyCount = Math.floor(size * size * 0.75);
    
    for (let i = 0; i < emptyCount; i++) {
        let r, c;
        do {
            r = getRandomInt(0, size - 1);
            c = getRandomInt(0, size - 1);
        } while (grid[r][c] === null);
        grid[r][c] = null;
    }

    return grid;
};

export const getWordsForDifficulty = (difficulty: string, topic?: string): string[] => {
    let pool: string[] = [];
    
    if (topic && topic !== 'Rastgele' && topic in TR_VOCAB) {
        const vocabList = (TR_VOCAB as any)[topic];
        if (Array.isArray(vocabList) && vocabList.length > 0 && typeof vocabList[0] === 'string') {
            pool = vocabList as string[];
        }
    } 
    
    if (pool.length === 0) {
         const allKeys = Object.keys(TR_VOCAB).filter(k => 
            !k.endsWith('_words') && 
            !k.endsWith('_detailed') &&
            k !== 'synonyms' && 
            k !== 'antonyms' && 
            k !== 'confusing_words' &&
            k !== 'emojis' &&
            k !== 'homonyms'
         );
         allKeys.forEach(key => {
             const list = (TR_VOCAB as any)[key];
             if (Array.isArray(list) && typeof list[0] === 'string') {
                 pool = [...pool, ...list];
             }
         });
    }

    let filteredPool: string[] = [];
    if (difficulty === 'Başlangıç') {
        filteredPool = [...pool.filter(w => w.length <= 4), ...TR_VOCAB.easy_words];
    } else if (difficulty === 'Orta') {
        filteredPool = [...pool.filter(w => w.length >= 4 && w.length <= 6), ...TR_VOCAB.medium_words];
    } else if (difficulty === 'Zor') {
        filteredPool = [...pool.filter(w => w.length >= 7), ...TR_VOCAB.hard_words];
    } else if (difficulty === 'Uzman') {
        filteredPool = [...TR_VOCAB.expert_words, ...TR_VOCAB.hard_words.filter(w => w.length > 8)];
    }
    
    if (filteredPool.length < 10) filteredPool = pool;

    return [...new Set(shuffle(filteredPool))];
};
