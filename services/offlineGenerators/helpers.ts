
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

export const EMOJI_MAP: Record<string, string> = {
    "🍎": "Elma", "🚗": "Araba", "🏠": "Ev", "⭐": "Yıldız", "🎈": "Balon", "📚": "Kitap", "⚽": "Top", "☀️": "Güneş",
    "🌙": "Ay", "🌲": "Ağaç", "🌺": "Çiçek", "🎁": "Hediye", "⏰": "Saat", "🔑": "Anahtar", "🚲": "Bisiklet", "🎸": "Gitar",
    "👓": "Gözlük", "☂️": "Şemsiye", "🍦": "Dondurma", "🍕": "Pizza", "🍔": "Hamburger", "🍟": "Patates", "🐱": "Kedi",
    "🐶": "Köpek", "🦁": "Aslan", "🐯": "Kaplan", "🚀": "Roket", "🚁": "Helikopter", "🚢": "Gemi", "🚌": "Otobüs",
    "🚑": "Ambulans", "🚒": "İtfaiye", "🚓": "Polis", "🚕": "Taksi", "👑": "Taç", "💎": "Elmas", "💍": "Yüzük",
    "🎓": "Kep", "🧢": "Şapka", "👟": "Ayakkabı", "🦋": "Kelebek", "🐞": "Uğur Böceği", "🐝": "Arı", "🐌": "Salyangoz",
    "🐢": "Kaplumbağa", "🦕": "Dinozor", "🦖": "T-Rex", "🐙": "Ahtapot", "🐠": "Balık", "🐬": "Yunus"
};

export const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
export const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
export const EMOJIS = Object.keys(EMOJI_MAP);
export const COLORS: { name: string; css: string }[] = COLORS_DB.map(c => ({ name: c.name, css: c.hex }));
export const HOMONYMS: string[] = TR_VOCAB.homonyms;
export const ITEM_CATEGORIES = ['animals', 'fruits_veggies', 'jobs', 'school', 'items_household', 'vehicles'];
export const CATEGORY_NAMES: Record<string, string> = {
    'animals': 'Hayvanlar', 'fruits_veggies': 'Meyve & Sebze', 'jobs': 'Meslekler',
    'school': 'Okul', 'items_household': 'Ev Eşyaları', 'vehicles': 'Araçlar'
};
export const VISUALLY_SIMILAR_CHARS: Record<string, string[]> = {
    'b': ['d', 'p', 'q'], 'd': ['b', 'p', 'q'], 'p': ['b', 'd', 'q'], 'q': ['p', 'b', 'd'],
    'm': ['n', 'u'], 'n': ['m', 'u']
};
export const CONNECT_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

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

export const simpleSyllabify = (text: string): string[] => {
    // If word exists in KnowledgeBase, use correct syllables
    for (const cat in KNOWLEDGE_BASE) {
        const found = KNOWLEDGE_BASE[cat].find(w => w.text === text.toLowerCase());
        if (found) return found.syllables;
    }
    // Fallback heuristic
    const parts = [];
    let i = 0;
    while (i < text.length) {
        const len = (Math.random() > 0.5 && i + 3 <= text.length) ? 3 : 2;
        parts.push(text.substring(i, Math.min(i + len, text.length)));
        i += len;
    }
    return parts;
};

export const getDifficultySettings = (difficulty: string) => {
    if (difficulty === 'Başlangıç') return { gridSize: 6, wordLength: {min: 2, max: 4}, sudokuSize: 4, pyramidRows: 3, directions: [0, 2] }; 
    if (difficulty === 'Orta') return { gridSize: 10, wordLength: {min: 4, max: 7}, sudokuSize: 6, pyramidRows: 4, directions: [0, 2, 1] }; 
    if (difficulty === 'Zor') return { gridSize: 15, wordLength: {min: 6, max: 10}, sudokuSize: 9, pyramidRows: 5, directions: [0, 1, 2, 3, 4, 5, 6, 7] };
    return { gridSize: 20, wordLength: {min: 10, max: 15}, sudokuSize: 9, pyramidRows: 5, directions: [0, 1, 2, 3, 4, 5, 6, 7] };
};

export const getWordsForDifficulty = (difficulty: string, topic?: string): string[] => {
    // Convert Difficulty String to Numeric Level
    let level = 2;
    if (difficulty === 'Başlangıç') level = 1;
    if (difficulty === 'Zor') level = 3;
    if (difficulty === 'Uzman') level = 4;

    let pool: string[] = [];

    // Use Knowledge Base First
    if (topic && topic !== 'Rastgele' && KNOWLEDGE_BASE[topic]) {
        pool = KNOWLEDGE_BASE[topic]
            .filter(w => w.difficulty <= level + 1) // Allow slightly harder words
            .map(w => w.text);
    } else {
        // Collect from all categories matching difficulty
        Object.values(KNOWLEDGE_BASE).forEach(list => {
            pool.push(...list.filter(w => w.difficulty === level).map(w => w.text));
        });
    }

    // Fallback to legacy vocabulary if pool is empty
    if (pool.length < 5) {
         let legacyPool: string[] = [];
         if (difficulty === 'Başlangıç') legacyPool = TR_VOCAB.easy_words;
         else if (difficulty === 'Orta') legacyPool = TR_VOCAB.medium_words;
         else if (difficulty === 'Zor') legacyPool = TR_VOCAB.hard_words;
         else legacyPool = TR_VOCAB.expert_words;
         pool = [...pool, ...legacyPool];
    }
    
    return [...new Set(pool)];
};

// ... (Rest of existing helpers like generateMaze, generateSudokuGrid etc. remain unchanged)
export const generateCrosswordLayout = (words: string[]) => {
    const grid: Record<string, string> = {};
    const placements = [];
    const w1 = words[0];
    for(let i=0; i<w1.length; i++) grid[`0,${i}`] = w1[i];
    placements.push({word: w1, row: 0, col: 0, dir: 'across' as const});
    
    for(let i=1; i<words.length; i++) {
        const w = words[i];
        let placed = false;
        for(let j=0; j<w.length; j++) {
            const char = w[j];
            for(const key in grid) {
                if(grid[key] === char) {
                    const [r, c] = key.split(',').map(Number);
                    if (!grid[`${r-1},${c}`] && !grid[`${r+1},${c}`]) {
                        placements.push({word: w, row: r-j, col: c, dir: 'down' as const});
                        for(let k=0; k<w.length; k++) grid[`${r-j+k},${c}`] = w[k];
                        placed = true;
                        break;
                    }
                }
            }
            if(placed) break;
        }
    }
    return { gridObj: grid, placements };
};

export const generateSmartConnectGrid = (dim: number, count: number) => {
    const res = [];
    for(let i=0; i<count; i++) {
        res.push({pairIndex: i, x: 0, y: i * 2, isStart: true});
        res.push({pairIndex: i, x: 1, y: i * 2, isStart: false});
    }
    return res;
};

export const generateMaze = (rows: number, cols: number): number[][] => {
    const h = rows % 2 === 0 ? rows + 1 : rows;
    const w = cols % 2 === 0 ? cols + 1 : cols;
    const grid = Array.from({length: h}, () => Array(w).fill(0));
    const stack: {r:number, c:number}[] = [];
    const dirs = [[0,2], [0,-2], [2,0], [-2,0]]; 
    
    const startR = 1, startC = 1;
    grid[startR][startC] = 1;
    stack.push({r: startR, c: startC});
    
    while(stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];
        for(const [dr, dc] of dirs) {
            const nr = current.r + dr, nc = current.c + dc;
            if (nr > 0 && nr < h - 1 && nc > 0 && nc < w - 1 && grid[nr][nc] === 0) {
                neighbors.push({r: nr, c: nc, dr: dr/2, dc: dc/2});
            }
        }
        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            grid[current.r + next.dr][current.c + next.dc] = 1;
            grid[next.r][next.c] = 1;
            stack.push({r: next.r, c: next.c});
        } else {
            stack.pop();
        }
    }
    grid[1][0] = 1; grid[h-2][w-1] = 1;
    if (h !== rows || w !== cols) return grid.slice(0, rows).map(row => row.slice(0, cols));
    return grid;
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

export const generateRandomPattern = (dim: number, density: number): [number, number][][] => {
    const lines: [number, number][][] = [];
    let cx = getRandomInt(0, dim), cy = getRandomInt(0, dim);
    const steps = Math.min(dim*3, 5 + density*5);
    
    for(let i=0; i<steps; i++) {
        const moves = [[0,1], [0,-1], [1,0], [-1,0]].filter(([dx,dy]) => {
            const nx = cx+dx, ny = cy+dy;
            return nx>=0 && nx<=dim && ny>=0 && ny<=dim;
        });
        if(moves.length === 0) break;
        const [dx, dy] = getRandomItems(moves, 1)[0] as [number, number];
        lines.push([[cx, cy], [cx+dx, cy+dy]]);
        cx += dx; cy += dy;
    }
    return lines;
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

export const wordToRebus = (word: string) => simpleSyllabify(word).map(s => ({ type: 'text' as const, value: s }));

export const generateConnectedPath = (dim: number, complexity: number): [number, number][][] => {
    const lines: [number, number][][] = [];
    let currentX = getRandomInt(0, dim);
    let currentY = getRandomInt(0, dim);
    const steps = Math.min(dim * 4, 6 + complexity * 4);

    for(let i=0; i<steps; i++) {
        const moves = [
            {dx: 1, dy: 0}, {dx: -1, dy: 0}, 
            {dx: 0, dy: 1}, {dx: 0, dy: -1}
        ].filter(m => {
            const nx = currentX + m.dx;
            const ny = currentY + m.dy;
            return nx >= 0 && nx <= dim && ny >= 0 && ny <= dim;
        });

        if(moves.length === 0) break;
        const move = moves[Math.floor(Math.random() * moves.length)];
        
        lines.push([[currentX, currentY], [currentX + move.dx, currentY + move.dy]]);
        currentX += move.dx;
        currentY += move.dy;
    }
    return lines;
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

// --- PHASE 2: PIXEL ART PATTERNS ---
export const PREDEFINED_GRID_PATTERNS = {
    'house': [
        [[1,4], [1,2]], [[1,2], [3,0]], [[3,0], [5,2]], [[5,2], [5,4]], [[5,4], [1,4]], // Outline
        [[2,4], [2,2]], [[2,2], [4,2]], [[4,2], [4,4]] // Door/Window
    ],
    'boat': [
        [[1,3], [5,3]], [[1,3], [2,5]], [[5,3], [4,5]], [[2,5], [4,5]], // Hull
        [[3,3], [3,1]], [[3,1], [4,2]], [[4,2], [3,2]] // Sail
    ],
    'tree': [
        [[3,5], [3,3]], [[3,3], [1,3]], [[1,3], [2,1]], [[2,1], [3,2]], [[3,2], [4,1]], [[4,1], [5,3]], [[5,3], [3,3]]
    ],
    'duck': [
        [[2,2], [3,1]], [[3,1], [4,1]], [[4,1], [4,2]], [[4,2], [5,2]], [[5,2], [5,3]], [[5,3], [2,3]], [[2,3], [2,2]],
        [[3,2], [3,2]] // Eye
    ]
};
