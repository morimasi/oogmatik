
import { ShapeType } from '../../types';
import { TR_VOCAB, EMOJI_MAP } from '../../data/vocabulary';

export { TR_VOCAB, EMOJI_MAP };

export const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
export const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
export const EMOJIS = Object.keys(EMOJI_MAP);
export const COLORS = TR_VOCAB.colors_detailed;
export const HOMONYMS = TR_VOCAB.homonyms;

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

export const CONNECT_COLORS = [
    '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1', '#84CC16', '#F97316', '#14B8A6', '#D946EF'
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

// --- ADVANCED DIFFICULTY CONFIGURATION ENGINE ---
export const getDifficultySettings = (difficulty: string) => {
    switch (difficulty) {
        case 'Başlangıç':
            return {
                // Word Games
                gridSize: 8,
                minWordLength: 3,
                maxWordLength: 5,
                directions: [0, 1], // Sadece sağ ve aşağı
                wordComplexity: 'simple', // Somut kelimeler (at, ev, top)
                
                // Math
                numberRange: { min: 1, max: 10 },
                operations: ['+'], 
                sudokuSize: 4,
                pyramidRows: 3,
                
                // Visual/Attention
                distractorLevel: 'low', // Farklı karakterler (O vs X)
                mazeComplexity: 5,
                memoryItems: 4,
                matchingPairs: 3
            };
        case 'Orta':
            return {
                gridSize: 12,
                minWordLength: 4,
                maxWordLength: 7,
                directions: [0, 1, 2], // + Çapraz
                wordComplexity: 'medium', // Günlük kelimeler
                
                numberRange: { min: 1, max: 50 },
                operations: ['+', '-'], 
                sudokuSize: 6,
                pyramidRows: 4,
                
                distractorLevel: 'medium', // Benzer şekiller
                mazeComplexity: 10,
                memoryItems: 8,
                matchingPairs: 5
            };
        case 'Zor':
            return {
                gridSize: 15,
                minWordLength: 6,
                maxWordLength: 9,
                directions: [0, 1, 2, 3, 4, 5], // + Ters yönler
                wordComplexity: 'hard', // Soyut kavramlar
                
                numberRange: { min: 10, max: 100 },
                operations: ['+', '-', '*'],
                sudokuSize: 9,
                pyramidRows: 5,
                
                distractorLevel: 'high', // (b vs d, p vs q)
                mazeComplexity: 15,
                memoryItems: 12,
                matchingPairs: 8
            };
        case 'Uzman':
            return {
                gridSize: 18,
                minWordLength: 8,
                maxWordLength: 14,
                directions: [0, 1, 2, 3, 4, 5, 6, 7], // Tüm yönler (Ters çapraz dahil)
                wordComplexity: 'expert', // Akademik/Teknik
                
                numberRange: { min: 100, max: 1000 },
                operations: ['+', '-', '*', '/'],
                sudokuSize: 9,
                pyramidRows: 6,
                
                distractorLevel: 'very_high', // Görsel tuzaklar
                mazeComplexity: 20,
                memoryItems: 16,
                matchingPairs: 10
            };
        default:
            return getDifficultySettings('Orta');
    }
};

// --- ADVANCED ALGORITHMS ---

export const simpleSyllabify = (text: string): string[] => {
    if (!text) return [];
    
    const vowels = 'aeıioöuüAEIİOÖUÜ';
    const isVowel = (c: string) => vowels.includes(c);
    
    let syllables: string[] = [];
    let currentWord = text.trim();
    
    // Basit bir Türkçe heceleme algoritması (Geliştirilebilir)
    // Ünlü-Ünsüz yapısına göre bölme mantığı
    while (currentWord.length > 0) {
        let vowelIndex = -1;
        for(let i=0; i<currentWord.length; i++) {
            if (isVowel(currentWord[i])) {
                vowelIndex = i;
                break;
            }
        }
        
        if (vowelIndex === -1) { // Hiç ünlü yoksa (kısaltma vb.)
            if (syllables.length > 0) syllables[syllables.length-1] += currentWord;
            else syllables.push(currentWord);
            break;
        }
        
        // Bir sonraki ünlüye bak
        let nextVowelIndex = -1;
        for(let i=vowelIndex+1; i<currentWord.length; i++) {
            if(isVowel(currentWord[i])) {
                nextVowelIndex = i;
                break;
            }
        }
        
        if (nextVowelIndex === -1) {
            syllables.push(currentWord);
            break;
        }
        
        // İki ünlü arasındaki ünsüz sayısına göre böl
        // a-ra-ba (1 ünsüz -> ünsüz sonraki heceye)
        // al-tın (2 ünsüz -> ilki bu heceye, ikincisi sonrakine)
        // kon-trol (3 ünsüz -> ilk ikisi bu heceye?) - Basitleştirilmiş kural: Son ünsüz daima sonraki heceye gider.
        
        const consonantsBetween = nextVowelIndex - vowelIndex - 1;
        let splitIndex;
        
        if (consonantsBetween === 0) splitIndex = vowelIndex + 1; // a-ile
        else if (consonantsBetween === 1) splitIndex = vowelIndex + 1; // a-ra
        else if (consonantsBetween === 2) splitIndex = vowelIndex + 2; // al-tın
        else splitIndex = vowelIndex + 2; // sert-lik (basit kural)

        syllables.push(currentWord.substring(0, splitIndex));
        currentWord = currentWord.substring(splitIndex);
    }
    return syllables;
};

export const generateMaze = (rows: number, cols: number) => {
    const height = rows * 2 + 1;
    const width = cols * 2 + 1;
    const grid = Array.from({ length: height }, () => Array(width).fill(1)); // 1: Wall, 0: Path
    
    // Recursive Backtracker
    const dirs = [
        { r: -2, c: 0 }, { r: 2, c: 0 }, { r: 0, c: 2 }, { r: 0, c: -2 }
    ];

    const carve = (r: number, c: number) => {
        grid[r][c] = 0;
        const shuffledDirs = shuffle(dirs);
        for (const d of shuffledDirs) {
            const nr = r + d.r;
            const nc = c + d.c;
            if (nr > 0 && nr < height - 1 && nc > 0 && nc < width - 1 && grid[nr][nc] === 1) {
                grid[r + d.r/2][c + d.c/2] = 0; // Break wall
                carve(nr, nc);
            }
        }
    };

    carve(1, 1);
    grid[1][0] = 0; // Start
    grid[height - 2][width - 1] = 0; // End
    return grid;
};

export const generateLatinSquare = (size: number): number[][] => {
    const grid = Array.from({ length: size }, () => Array(size).fill(0));
    const isValid = (r: number, c: number, num: number) => {
        for(let k=0; k<size; k++) {
            if(grid[r][k] === num || grid[k][c] === num) return false;
        }
        return true;
    }
    const solve = (idx: number): boolean => {
        if (idx === size * size) return true;
        const r = Math.floor(idx / size);
        const c = idx % size;
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

export const generateRandomPattern = (dim: number, density: number): [number, number][][] => {
    const lines: [number, number][][] = [];
    const count = Math.max(3, Math.floor(dim * density));
    for(let i=0; i<count; i++) {
        const x1 = getRandomInt(0, dim);
        const y1 = getRandomInt(0, dim);
        const dirs = [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];
        const d = getRandomItems(dirs, 1)[0];
        const x2 = x1 + d[0];
        const y2 = y1 + d[1];
        if(x2>=0 && x2<=dim && y2>=0 && y2<=dim) lines.push([[x1,y1], [x2,y2]]);
    }
    return lines;
};

export const generateSudokuGrid = (size: number = 6, difficulty: string): (number | null)[][] => {
    const grid: (number | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
    let boxHeight = 2, boxWidth = 3;
    if (size === 4) { boxHeight = 2; boxWidth = 2; }
    else if (size === 9) { boxHeight = 3; boxWidth = 3; }
    
    function isValid(num: number, row: number, col: number) {
        for (let i = 0; i < size; i++) {
            if (grid[row][i] === num || grid[i][col] === num) return false;
        }
        const startRow = row - (row % boxHeight);
        const startCol = col - (col % boxWidth);
        for (let r = 0; r < boxHeight; r++) {
            for (let c = 0; c < boxWidth; c++) {
                if (grid[r + startRow][c + startCol] === num) return false;
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
                            if (solve()) return true;
                            grid[r][c] = null;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    solve();

    // Remove cells based on difficulty
    // More removals for harder levels, BUT keep it solvable (simple removal)
    const settings = getDifficultySettings(difficulty);
    let removeRatio = 0.3; // Başlangıç
    if (difficulty === 'Orta') removeRatio = 0.45;
    if (difficulty === 'Zor') removeRatio = 0.60;
    if (difficulty === 'Uzman') removeRatio = 0.70;

    let emptyCount = Math.floor(size * size * removeRatio);
    
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

export const generateSmartConnectGrid = (gridSize: number, pairsCount: number) => {
    const usedCoordinates = new Set<string>();
    const placements: { x: number, y: number, pairIndex: number, isStart: boolean }[] = [];
    
    const getValidCoord = (): { x: number, y: number } | null => {
        let attempts = 0;
        while (attempts < 50) {
            const x = getRandomInt(0, gridSize - 1);
            const y = getRandomInt(0, gridSize - 1);
            const key = `${x},${y}`;
            if (!usedCoordinates.has(key)) return { x, y };
            attempts++;
        }
        return null;
    };

    for (let i = 0; i < pairsCount; i++) {
        const start = getValidCoord();
        if (!start) break;
        usedCoordinates.add(`${start.x},${start.y}`);
        
        const end = getValidCoord(); 
        if (end) {
            usedCoordinates.add(`${end.x},${end.y}`);
            placements.push({ ...start, pairIndex: i, isStart: true });
            placements.push({ ...end, pairIndex: i, isStart: false });
        }
    }
    return placements;
};

// --- INTELLIGENT WORD SELECTOR ---
export const getWordsForDifficulty = (difficulty: string, topic?: string): string[] => {
    let pool: string[] = [];
    const settings = getDifficultySettings(difficulty);
    
    // Topic filtering
    if (topic && topic !== 'Rastgele' && topic !== 'Genel' && topic in TR_VOCAB) {
        const vocabList = (TR_VOCAB as any)[topic];
        if (Array.isArray(vocabList)) pool = vocabList as string[];
    } 
    
    // Fallback or General pool
    if (pool.length === 0) {
         const allKeys = Object.keys(TR_VOCAB).filter(k => !k.includes('_') && k !== 'synonyms' && k !== 'antonyms' && k !== 'homonyms' && k !== 'confusing_words' && k !== 'colors_detailed');
         allKeys.forEach(key => {
             const list = (TR_VOCAB as any)[key];
             if (Array.isArray(list)) pool = [...pool, ...list];
         });
    }

    // Strict Length Filtering based on Difficulty
    let filteredPool = pool.filter(w => w.length >= settings.minWordLength && w.length <= settings.maxWordLength);
    
    // Complexity Filtering (Simulated by specific lists)
    if (difficulty === 'Başlangıç') {
        filteredPool = filteredPool.filter(w => TR_VOCAB.easy_words.includes(w) || w.length <= 4);
        if (filteredPool.length < 5) filteredPool = TR_VOCAB.easy_words; // Fallback
    } else if (difficulty === 'Zor') {
        filteredPool = filteredPool.filter(w => TR_VOCAB.hard_words.includes(w) || w.length >= 7);
    } else if (difficulty === 'Uzman') {
        filteredPool = TR_VOCAB.expert_words;
    }
    
    // Safety Fallback
    if (filteredPool.length < 5) {
        filteredPool = pool.filter(w => w.length > 3); 
    }
    
    return [...new Set(shuffle(filteredPool))];
};

export const generateCrosswordLayout = (words: string[]) => {
    const gridObj: Record<string, string> = {};
    const placements: { word: string, row: number, col: number, dir: 'across' | 'down' }[] = [];
    
    words.forEach((w, idx) => {
        const dir = idx % 2 === 0 ? 'across' : 'down';
        const row = idx * 2;
        const col = idx % 2 === 0 ? 0 : 4; // Simple distribution
        
        placements.push({ word: w, row, col, dir });
        for(let k=0; k<w.length; k++) {
            const r = dir === 'across' ? row : row + k;
            const c = dir === 'across' ? col + k : col;
            gridObj[`${r},${c}`] = w[k];
        }
    });
    
    return { gridObj, placements };
};

export const wordToRebus = (word: string): { type: 'text' | 'image'; value: string }[] => {
    const upperWord = word.toUpperCase();
    const parts: { type: 'text' | 'image'; value: string }[] = [];
    let remaining = upperWord;
    
    while(remaining.length > 0) {
        let matched = false;
        const keys = Object.keys(SYLLABLE_EMOJIS).sort((a,b) => b.length - a.length);
        
        for (const key of keys) {
            if (remaining.startsWith(key)) {
                parts.push({ type: 'image', value: `${SYLLABLE_EMOJIS[key]} (${key})` }); 
                remaining = remaining.slice(key.length);
                matched = true;
                break;
            }
        }
        if (!matched) {
            parts.push({ type: 'text', value: remaining[0] });
            remaining = remaining.slice(1);
        }
    }
    return parts;
}
