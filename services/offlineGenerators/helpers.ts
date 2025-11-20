
import { ShapeType } from '../../types';
import { TR_VOCAB, EMOJI_MAP } from '../../data/vocabulary';

// FIX: Export TR_VOCAB so other modules can import it from this file.
export { TR_VOCAB, EMOJI_MAP };

export const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
export const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
export const EMOJIS = Object.keys(EMOJI_MAP);
export const COLORS = TR_VOCAB.colors_detailed;
export const HOMONYMS = TR_VOCAB.homonyms;

// Genişletilmiş Kategori Listesi
export const ITEM_CATEGORIES = ['animals', 'fruits_veggies', 'jobs', 'school', 'items_household', 'kitchen_food', 'sports', 'clothing', 'body_health', 'nature_space', 'technology', 'emotions', 'vehicles'];

export const CATEGORY_NAMES: Record<string, string> = {
    'animals': 'Hayvanlar',
    'fruits_veggies': 'Meyve & Sebze',
    'jobs': 'Meslekler',
    'school': 'Okul',
    'items_household': 'Ev Eşyaları',
    'kitchen_food': 'Mutfak & Yemek',
    'sports': 'Spor',
    'clothing': 'Kıyafet',
    'body_health': 'Vücut & Sağlık',
    'nature_space': 'Doğa & Uzay',
    'technology': 'Teknoloji',
    'emotions': 'Duygular',
    'vehicles': 'Araçlar'
};

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

// Resfebe Syllable Map
export const SYLLABLE_EMOJIS: Record<string, string> = {
    'AT': '🐴', 'EV': '🏠', 'AY': '🌙', 'EL': '🖐️', 'GÜL': '🌹', 'OK': '🏹', 'BAL': '🍯', 
    'TAŞ': '🪨', 'KAR': '❄️', 'YAZ': '☀️', 'SU': '💧', 'ON': '🔟', 'BİR': '1️⃣', 'ÜÇ': '3️⃣',
    'DİŞ': '🦷', 'GÖZ': '👁️', 'KOL': '💪', 'MUZ': '🍌', 'NAR': '🍅', 'ZİL': '🔔', 'TOP': '⚽',
    'ÇAY': '🍵', 'EK': '🌱', 'BAŞ': '🤯', 'KUŞ': '🐦', 'YOL': '🛣️', 'DAĞ': '🏔️', 'KEL': '👨‍🦲',
    'SAÇ': '💇', 'HAP': '💊', 'PİL': '🔋', 'BOT': '👢', 'CEP': '👖', 'ÇAM': '🌲', 'CAN': '👻',
    'FİL': '🐘', 'KOÇ': '🐏', 'KAZ': '🦢', 'KURT': '🐺', 'AR': '🐝', 'SAL': '🛶', 'ŞAL': '🧣',
    'DAL': '🌿', 'KAS': '💪', 'YAY': '🏹', 'KÜP': '🧊', 'NAL': '🧲', 'MAÇ': '🏟️', 'SAZ': '🌾',
    'YEM': '🌽', 'SÜT': '🥛', 'TUZ': '🧂', 'YAĞ': '🧈', 'KAN': '🩸', 'TER': '💧', 'KİL': '🧱'
};

// Professional Color Palette for Connect Games (High Contrast, Print Friendly)
export const CONNECT_COLORS = [
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#84CC16', // Lime
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#D946EF'  // Fuchsia
];


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

// Smart Grid Placement for Connect Games
// Ensures points are not overlapping and reasonably spaced
export const generateSmartConnectGrid = (gridSize: number, pairsCount: number) => {
    const usedCoordinates = new Set<string>();
    const placements: { x: number, y: number, pairIndex: number, isStart: boolean }[] = [];
    
    // Helper to get a valid random coordinate
    const getValidCoord = (): { x: number, y: number } | null => {
        let attempts = 0;
        while (attempts < 50) {
            const x = getRandomInt(0, gridSize - 1);
            const y = getRandomInt(0, gridSize - 1);
            const key = `${x},${y}`;
            if (!usedCoordinates.has(key)) {
                return { x, y };
            }
            attempts++;
        }
        return null;
    };

    // Helper to check distance
    const isFarEnough = (c1: {x:number, y:number}, c2: {x:number, y:number}, minDistance: number) => {
        return (Math.abs(c1.x - c2.x) + Math.abs(c1.y - c2.y)) >= minDistance;
    }

    for (let i = 0; i < pairsCount; i++) {
        // Place Start Point
        const start = getValidCoord();
        if (!start) break; // Grid full or failed to place
        usedCoordinates.add(`${start.x},${start.y}`);
        
        // Place End Point (try to keep it some distance away for challenge)
        let end = null;
        let attempts = 0;
        const targetDist = Math.max(2, Math.floor(gridSize / 2));
        
        while(attempts < 20) {
            const candidate = getValidCoord();
            if (candidate && isFarEnough(start, candidate, targetDist)) {
                end = candidate;
                break;
            }
            // If we fail finding far point, check if candidate is valid at least
            if (candidate && !end) end = candidate; // Fallback
            attempts++;
        }
        
        if (!end) {
             // Should rarely happen if grid is large enough
             end = getValidCoord();
        }
        
        if (end) {
            usedCoordinates.add(`${end.x},${end.y}`);
            placements.push({ ...start, pairIndex: i, isStart: true });
            placements.push({ ...end, pairIndex: i, isStart: false });
        } else {
            // Rollback start if we can't place end
             usedCoordinates.delete(`${start.x},${start.y}`);
        }
    }

    return placements;
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

// --- Crossword Generation Helper ---
export const generateCrosswordLayout = (words: string[]) => {
    // Sort words by length descending
    const sortedWords = words.sort((a, b) => b.length - a.length);
    const gridObj: Record<string, string> = {}; // "row,col": "char"
    const placements: { word: string, row: number, col: number, dir: 'across' | 'down' }[] = [];
    
    if (sortedWords.length === 0) return { grid: [[]], placements: [] };

    // Place first word horizontal at 0,0
    const firstWord = sortedWords[0];
    placements.push({ word: firstWord, row: 0, col: 0, dir: 'across' });
    for(let i=0; i<firstWord.length; i++) gridObj[`0,${i}`] = firstWord[i];

    const remaining = sortedWords.slice(1);
    // Limit iterations to prevent infinite loops in fast mode
    for (const word of remaining) {
        let placed = false;
        // Try to intersect with existing letters
        for (const key of Object.keys(gridObj)) {
            if(placed) break;
            const [rStr, cStr] = key.split(',');
            const r = parseInt(rStr), c = parseInt(cStr);
            const char = gridObj[key];

            // Check where this char exists in the current word
            for (let i = 0; i < word.length; i++) {
                if (word[i] === char) {
                    // Attempt vertical placement intersecting at i
                    // Word start would be at (r - i, c)
                    const startR = r - i;
                    const startC = c;
                    
                    // Check collisions
                    let valid = true;
                    for(let k=0; k<word.length; k++) {
                        const checkR = startR + k;
                        const checkC = startC;
                        const existing = gridObj[`${checkR},${checkC}`];
                        
                        // If cell matches letter or is empty, fine. BUT...
                        // We must ensure we don't touch other words incorrectly (adjacent cells)
                        if (existing && existing !== word[k]) { valid = false; break; }
                        
                        // Check neighbors if cell is empty (to avoid adjacent words merging)
                        if (!existing) {
                            // Detailed check skipped for "Fast Mode" brevity, assuming density handles it loosely
                        }
                    }
                }
            }
        }
    }
    
    // Fallback: Simple diagonal/staircase layout if complex algo fails or for simplicity in offline mode
    const simplePlacements: { word: string, row: number, col: number, dir: 'across' | 'down' }[] = [];
    let currentRow = 0;
    let currentCol = 0;
    
    words.forEach((w, idx) => {
        const dir = idx % 2 === 0 ? 'across' : 'down';
        simplePlacements.push({ word: w, row: currentRow, col: currentCol, dir });
        if (dir === 'across') {
            currentCol += 2; // gap
            currentRow += 2;
        } else {
             currentRow += 2;
             currentCol -= 1; // shift back slightly
        }
    });
    
    const finalGridObj: Record<string, string> = {};
    const independentPlacements = words.map((w, i) => {
        const row = i * 2;
        const col = i % 2 === 0 ? 0 : 4; // Z pattern
        for(let k=0; k<w.length; k++) finalGridObj[`${row},${col+k}`] = w[k];
        return { word: w, row, col, dir: 'across' as const };
    });

    return { gridObj: finalGridObj, placements: independentPlacements };
};

// --- Syllabification Helper ---
export const simpleSyllabify = (word: string): string[] => {
    // Basic Turkish syllabification attempt (heuristic)
    if (word.length <= 2) return [word];
    
    const vowels = 'aeıioöuü';
    const syllables: string[] = [];
    let current = '';
    
    // Heuristic: Split after vowels if not followed by 2 consonants
    // This is very basic. For offline reliability, we can use a simpler chunking.
    // Or just 3-char chunks max.
    
    // Better approach for offline Resfebe: Try to match known keys in SYLLABLE_EMOJIS
    
    return word.length > 4 ? [word.substring(0, 2), word.substring(2)] : [word];
};

// --- Rebus Helper ---
export const wordToRebus = (word: string): { type: 'text' | 'image'; value: string }[] => {
    const upperWord = word.toUpperCase();
    const parts: { type: 'text' | 'image'; value: string }[] = [];
    let remaining = upperWord;
    
    // Greedy matching for syllables in our map
    while(remaining.length > 0) {
        let matched = false;
        // Sort keys by length descending to match longest possible syllable first
        const keys = Object.keys(SYLLABLE_EMOJIS).sort((a,b) => b.length - a.length);
        
        for (const key of keys) {
            if (remaining.startsWith(key)) {
                parts.push({ type: 'image', value: `${SYLLABLE_EMOJIS[key]} (${key})` }); // Showing hint text for offline mode simplicity
                remaining = remaining.slice(key.length);
                matched = true;
                break;
            }
        }
        
        if (!matched) {
            // If no match, just take the first letter as text
            parts.push({ type: 'text', value: remaining[0] });
            remaining = remaining.slice(1);
        }
    }
    return parts;
}
