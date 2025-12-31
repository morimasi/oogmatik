
import { ShapeType } from '../../types';
import { TR_VOCAB as RAW_VOCAB } from '../../data/vocabulary';
import { KNOWLEDGE_BASE, WordItem, COLORS_DB } from '../../data/knowledgeBase';

export interface VocabData {
    animals: string[];
    fruits_veggies: string[];
    jobs: string[];
    school: string[];
    items_household: string[];
    vehicles: string[];
    easy_words: string[];
    medium_words: string[];
    hard_words: string[];
    expert_words: string[];
    confusing_words: string[][];
    synonyms: { word: string; synonym: string }[];
    antonyms: { word: string; antonym: string }[];
    colors_detailed: { name: string; css: string }[];
    homonyms: string[];
    [key: string]: any;
}

export const TR_VOCAB = RAW_VOCAB as VocabData;

export const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
export const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
export const EMOJI_MAP: Record<string, string> = {
    "🍎": "Elma", "🚗": "Araba", "🏠": "Ev", "⭐": "Yıldız", "🎈": "Balon", "📚": "Kitap", "⚽": "Top", "☀️": "Güneş",
    "🌙": "Ay", "🌲": "Ağaç", "🌺": "Çiçek", "🎁": "Hediye", "⏰": "Saat", "🔑": "Anahtar", "🚲": "Bisiklet", "🎸": "Gitar",
    "👓": "Gözlük", "☂️": "Şemsiye", "🍦": "Dondurma", "🍕": "Pizza", "🍔": "Hamburger", "🍟": "Patates", "🐱": "Kedi",
    "🐶": "Köpek", "🦁": "Aslan", "🐯": "Kaplan", "🚀": "Roket", "🚁": "Helikopter", "🚢": "Gemi", "🚌": "Otobüs",
    "🚑": "Ambulans", "🚒": "İtfaiye", "🚓": "Polis", "🚕": "Taksi", "👑": "Taç", "💎": "Elmas", "💍": "Yüzük",
    "🎓": "Kep", "🧢": "Şapka", "👟": "Ayakkabı", "🦋": "Kelebek", "🐞": "Uğur Böceği", "🐝": "Arı", "🐌": "Salyangoz",
    "🐢": "Kaplumbağa", "🦕": "Dinozor", "🦖": "T-Rex", "🐙": "Ahtapot", "🐠": "Balık", "🐬": "Yunus"
};

export const CONNECT_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

export const COLORS = CONNECT_COLORS.map(c => ({ name: '', css: c }));
export const EMOJIS = Object.keys(EMOJI_MAP);
export const VISUALLY_SIMILAR_CHARS = ['b', 'd', 'p', 'q', 'm', 'n', 'u', 'ü', '1', '7', '0', 'O'];

export const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomItems = <T>(arr: T[], count: number): T[] => {
    if (!arr || arr.length === 0) return [];
    if (count >= arr.length) return shuffle(arr);
    return shuffle(arr).slice(0, count);
};

export const getWordsForDifficulty = (difficulty: string, topic?: string): string[] => {
    let level = 2;
    if (difficulty === 'Başlangıç') level = 1;
    if (difficulty === 'Zor') level = 3;
    if (difficulty === 'Uzman') level = 4;

    let pool: string[] = [];

    if (topic && topic !== 'Rastgele' && KNOWLEDGE_BASE[topic]) {
        pool = KNOWLEDGE_BASE[topic]
            .filter(w => w.difficulty <= level + 1)
            .map(w => w.text);
    }

    if (pool.length < 5) {
        Object.values(KNOWLEDGE_BASE).forEach(list => {
            pool.push(...list.filter(w => w.difficulty === level).map(w => w.text));
        });
    }

    if (pool.length < 5) {
        if (difficulty === 'Başlangıç') pool = TR_VOCAB.easy_words;
        else if (difficulty === 'Orta') pool = TR_VOCAB.medium_words;
        else if (difficulty === 'Zor') pool = TR_VOCAB.hard_words;
        else pool = TR_VOCAB.expert_words;
    }
    
    return [...new Set(pool)];
};

export const simpleSyllabify = (text: string): string[] => {
    const word = text.toLowerCase();
    for (const cat in KNOWLEDGE_BASE) {
        const found = KNOWLEDGE_BASE[cat].find(w => w.text === word);
        if (found) return found.syllables;
    }
    const parts = [];
    let i = 0;
    while (i < text.length) {
        const len = (Math.random() > 0.5 && i + 3 <= text.length) ? 3 : 2;
        parts.push(text.substring(i, Math.min(i + len, text.length)));
        i += len;
    }
    return parts;
};

export const generateMazePath = (rows: number, cols: number) => {
    const grid = Array.from({length: rows}, () => Array(cols).fill(0));
    const path: {r:number, c:number}[] = [{r:0, c:0}];
    let cr = 0, cc = 0;
    while(cr < rows-1 || cc < cols-1) {
        if(cr < rows-1 && Math.random() > 0.5) cr++; else if(cc < cols-1) cc++; else if(cr < rows-1) cr++;
        path.push({r: cr, c: cc});
    }
    let id = 1;
    const pIds = [], dIds = [];
    for(let r=0; r<rows; r++) for(let c=0; c<cols; c++) {
        grid[r][c] = id;
        if(path.some(p => p.r === r && p.c === c)) pIds.push(id); else dIds.push(id);
        id++;
    }
    return { grid, pathIds: pIds, distractorIds: dIds };
};

export const generateSymmetricPattern = (rows: number, cols: number, density: number): number[][] => {
    const grid = Array.from({length: rows}, () => Array(cols).fill(0));
    const midR = Math.ceil(rows / 2);
    const midC = Math.ceil(cols / 2);
    for(let r = 0; r < midR; r++) {
        for(let c = 0; c < midC; c++) {
            if (Math.random() < density) {
                grid[r][c] = 1;
                if (c < cols - 1 - c) grid[r][cols - 1 - c] = 1;
                if (r < rows - 1 - r) grid[rows - 1 - r][c] = 1;
                if (c < cols - 1 - c && r < rows - 1 - r) grid[rows - 1 - r][cols - 1 - c] = 1;
            }
        }
    }
    return grid;
};

export const generateConnectedPath = (dim: number, complexity: number): [number, number][][] => {
    const lines: [number, number][][] = [];
    let currentX = getRandomInt(0, dim);
    let currentY = getRandomInt(0, dim);
    const steps = Math.min(dim * 4, 6 + complexity * 4);
    for(let i=0; i<steps; i++) {
        const moves = [{dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}].filter(m => {
            const nx = currentX + m.dx;
            const ny = currentY + m.dy;
            return nx >= 0 && nx <= dim && ny >= 0 && ny <= dim;
        });
        if(moves.length === 0) break;
        const move = moves[Math.floor(Math.random() * moves.length)];
        lines.push([[currentX, currentY], [currentX + move.dx, currentY + move.dy]]);
        currentX += move.dx; currentY += move.dy;
    }
    return lines;
};

export const generateSudokuGrid = (n: number, difficulty: string): (number | null)[][] => {
    const size = n;
    const boxH = size === 9 ? 3 : (size === 6 ? 2 : 2);
    const boxW = size === 9 ? 3 : (size === 6 ? 3 : 2);
    const grid: number[][] = Array.from({length: size}, () => Array(size).fill(0));
    const isValid = (r: number, c: number, num: number) => {
        for(let k=0; k<size; k++) if (grid[r][k] === num || grid[k][c] === num) return false;
        const sr = Math.floor(r/boxH)*boxH, sc = Math.floor(c/boxW)*boxW;
        for(let i=0; i<boxH; i++) for(let j=0; j<boxW; j++) if(grid[sr+i][sc+j] === num) return false;
        return true;
    };
    const solve = (r: number, c: number): boolean => {
        if (r === size) return true;
        const nr = c === size - 1 ? r + 1 : r;
        const nc = c === size - 1 ? 0 : c + 1;
        if (grid[r][c] !== 0) return solve(nr, nc);
        const nums = shuffle(Array.from({length: size}, (_, i) => i + 1));
        for (const num of nums) {
            if (isValid(r, c, num)) {
                grid[r][c] = num;
                if (solve(nr, nc)) return true;
                grid[r][c] = 0;
            }
        }
        return false;
    };
    solve(0, 0);
    const removeCount = difficulty === 'Başlangıç' ? size*size*0.3 : difficulty === 'Orta' ? size*size*0.5 : size*size*0.6;
    const puzzle = grid.map(row => [...row]) as (number|null)[][];
    let removed = 0;
    while(removed < removeCount) {
        const r = getRandomInt(0, size-1), c = getRandomInt(0, size-1);
        if (puzzle[r][c] !== null) { puzzle[r][c] = null; removed++; }
    }
    return puzzle;
};

export const generateLatinSquare = (n: number): number[][] => {
    let grid = [shuffle(Array.from({length: n}, (_, i) => i + 1))];
    for (let i = 1; i < n; i++) {
        const prev = grid[i-1];
        grid.push([...prev.slice(1), prev[0]]);
    }
    grid = shuffle(grid);
    return grid[0].map((_, c) => grid.map(r => r[c]));
};

// Fixed PREDEFINED_GRID_PATTERNS to ensure correct typing of coordinates as tuples
export const PREDEFINED_GRID_PATTERNS: Record<string, [number, number][][]> = {
    'house': [[[1,4], [1,2]], [[1,2], [3,0]], [[3,0], [5,2]], [[5,2], [5,4]], [[5,4], [1,4]], [[2,4], [2,2]], [[2,2], [4,2]], [[4,2], [4,4]]],
    'boat': [[[1,3], [5,3]], [[1,3], [2,5]], [[5,3], [4,5]], [[2,5], [4,5]], [[3,3], [3,1]], [[3,1], [4,2]], [[4,2], [3,2]]],
    'tree': [[[3,5], [3,3]], [[3,3], [1,3]], [[1,3], [2,1]], [[2,1], [3,2]], [[3,2], [4,1]], [[4,1], [5,3]], [[5,3], [3,3]]],
    'duck': [[[2,2], [3,1]], [[3,1], [4,1]], [[4,1], [4,2]], [[4,2], [5,2]], [[5,2], [5,3]], [[5,3], [2,3]], [[2,3], [2,2]], [[3,2], [3,2]]]
};
