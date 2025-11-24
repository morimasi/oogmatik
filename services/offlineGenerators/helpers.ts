
import { ShapeType } from '../../types';
import { TR_VOCAB as RAW_VOCAB } from '../../data/vocabulary';

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

// Genişletilmiş Emoji Haritası (Görsel kütüphane)
// Hem Türkçe hem İngilizce anahtar kelimeleri kapsar
export const EMOJI_MAP: Record<string, string> = {
    // Fruits & Veggies
    "elma": "🍎", "apple": "🍎", "armut": "🍐", "pear": "🍐", "portakal": "🍊", "orange": "🍊", 
    "limon": "🍋", "lemon": "🍋", "muz": "🍌", "banana": "🍌", "karpuz": "🍉", "watermelon": "🍉", 
    "üzüm": "🍇", "grape": "🍇", "çilek": "🍓", "strawberry": "🍓", "kiraz": "🍒", "cherry": "🍒", 
    "şeftali": "🍑", "peach": "🍑", "ananas": "🍍", "pineapple": "🍍", "domates": "🍅", "tomato": "🍅", 
    "patlıcan": "🍆", "eggplant": "🍆", "brokoli": "🥦", "broccoli": "🥦", "havuç": "🥕", "carrot": "🥕", 
    "mısır": "🌽", "corn": "🌽", "biber": "🌶️", "pepper": "🌶️", "salatalık": "🥒", "cucumber": "🥒",
    "patates": "🥔", "potato": "🥔", "mantar": "🍄", "mushroom": "🍄",

    // Food
    "ekmek": "🍞", "bread": "🍞", "peynir": "🧀", "cheese": "🧀", "yumurta": "🥚", "egg": "🥚", 
    "hamburger": "🍔", "burger": "🍔", "patates kızartması": "🍟", "fries": "🍟", "pizza": "🍕", 
    "sosisli": "🌭", "hotdog": "🌭", "sandviç": "🥪", "sandwich": "🥪", "dondurma": "🍦", "ice cream": "🍦", 
    "çikolata": "🍫", "chocolate": "🍫", "şeker": "🍬", "candy": "🍬", "kurabiye": "🍪", "cookie": "🍪",
    "pasta": "🍰", "cake": "🍰", "süt": "🥛", "milk": "🥛", "kahve": "☕", "coffee": "☕", "çay": "🍵", "tea": "🍵",

    // Animals
    "köpek": "🐶", "dog": "🐶", "kedi": "🐱", "cat": "🐱", "fare": "🐭", "mouse": "🐭", 
    "tavşan": "🐰", "rabbit": "🐰", "tilki": "🦊", "fox": "🦊", "ayı": "🐻", "bear": "🐻", 
    "panda": "🐼", "kaplan": "🐯", "tiger": "🐯", "aslan": "🦁", "lion": "🦁", "inek": "🐮", "cow": "🐮", 
    "domuz": "🐷", "pig": "🐷", "kurbağa": "🐸", "frog": "🐸", "maymun": "🐵", "monkey": "🐵", 
    "tavuk": "🐔", "chicken": "🐔", "civciv": "🐤", "chick": "🐤", "ördek": "🦆", "duck": "🦆", 
    "kartal": "🦅", "eagle": "🦅", "baykuş": "🦉", "owl": "🦉", "ar": "🐝", "bee": "🐝", 
    "kelebek": "🦋", "butterfly": "🦋", "salyangoz": "🐌", "snail": "🐌", "uğur böceği": "🐞", "ladybug": "🐞", 
    "kaplumbağa": "🐢", "turtle": "🐢", "yılan": "🐍", "snake": "🐍", "ahtapot": "🐙", "octopus": "🐙", 
    "balık": "🐟", "fish": "🐟", "yunus": "🐬", "dolphin": "🐬", "balina": "🐳", "whale": "🐳", 
    "fil": "🐘", "elephant": "🐘", "at": "🐴", "horse": "🐴", "zürafa": "🦒", "giraffe": "🦒",

    // Vehicles
    "araba": "🚗", "car": "🚗", "taksi": "🚕", "taxi": "🚕", "otobüs": "🚌", "bus": "🚌", 
    "polis": "🚓", "police": "🚓", "ambulans": "🚑", "ambulance": "🚑", "itfaiye": "🚒", "fire truck": "🚒", 
    "kamyon": "🚚", "truck": "🚚", "traktör": "🚜", "tractor": "🚜", "bisiklet": "🚲", "bicycle": "🚲", 
    "uçak": "✈️", "airplane": "✈️", "helikopter": "🚁", "helicopter": "🚁", "roket": "🚀", "rocket": "🚀", 
    "gemi": "🚢", "ship": "🚢", "tekne": "🚤", "boat": "🚤", "tren": "🚂", "train": "🚂",

    // Objects & Places
    "ev": "🏠", "house": "🏠", "okul": "🏫", "school": "🏫", "hastane": "🏥", "hospital": "🏥", 
    "saat": "⏰", "clock": "⏰", "telefon": "📱", "phone": "📱", "bilgisayar": "💻", "computer": "💻", 
    "kamera": "📷", "camera": "📷", "kitap": "📚", "book": "📚", "kalem": "✏️", "pencil": "✏️", 
    "fırça": "🖌️", "brush": "🖌️", "makas": "✂️", "scissors": "✂️", "anahtar": "🔑", "key": "🔑", 
    "kilit": "🔒", "lock": "🔒", "çekiç": "🔨", "hammer": "🔨", "balta": "🪓", "axe": "🪓", 
    "kutu": "📦", "box": "📦", "hediye": "🎁", "gift": "🎁", "balon": "🎈", "balloon": "🎈", 
    "top": "⚽", "ball": "⚽", "gözlük": "👓", "glasses": "👓", "gömlek": "👕", "shirt": "👕", 
    "pantolon": "👖", "pants": "👖", "elbise": "👗", "dress": "👗", "ayakkabı": "👟", "shoe": "👟", 
    "şapka": "🧢", "hat": "🧢", "taç": "👑", "crown": "👑", "yüzük": "💍", "ring": "💍",

    // Nature & Sky
    "güneş": "☀️", "sun": "☀️", "ay": "🌙", "moon": "🌙", "yıldız": "⭐", "star": "⭐", 
    "bulut": "☁️", "cloud": "☁️", "yağmur": "🌧️", "rain": "🌧️", "kar": "❄️", "snow": "❄️", 
    "şimşek": "⚡", "lightning": "⚡", "ateş": "🔥", "fire": "🔥", "su": "💧", "water": "💧", 
    "ağaç": "🌳", "tree": "🌳", "çiçek": "🌸", "flower": "🌸", "yaprak": "🍃", "leaf": "🍃",
    "gökkuşağı": "🌈", "rainbow": "🌈", "dünya": "🌍", "earth": "🌍",

    // Shapes & Colors (as icons)
    "kalp": "❤️", "heart": "❤️", "kare": "🟥", "square": "🟥", "daire": "🔴", "circle": "🔴", 
    "üçgen": "🔺", "triangle": "🔺", "elmas": "♦️", "diamond": "♦️", 
    "mavi": "💙", "blue": "💙", "yeşil": "💚", "green": "💚", "sarı": "💛", "yellow": "💛", 
    "mor": "💜", "purple": "💜", "siyah": "🖤", "black": "🖤", "beyaz": "🤍", "white": "🤍"
};

export const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';
export const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
export const EMOJIS = Object.keys(EMOJI_MAP); // Note: This gets keys which are words now, not emojis. 
// Fix for EMOJIS constant to return actual emoji values for random picking
export const EMOJI_VALUES = Array.from(new Set(Object.values(EMOJI_MAP))); 

export const COLORS: { name: string; css: string }[] = TR_VOCAB.colors_detailed;
export const HOMONYMS: string[] = TR_VOCAB.homonyms;
export const ITEM_CATEGORIES = ['animals', 'fruits_veggies', 'jobs', 'school', 'items_household', 'vehicles'];
export const CATEGORY_NAMES: Record<string, string> = {
    'animals': 'Hayvanlar', 'fruits_veggies': 'Meyve & Sebze', 'jobs': 'Meslekler',
    'school': 'Okul', 'items_household': 'Ev Eşyaları', 'vehicles': 'Araçlar'
};
export const VISUALLY_SIMILAR_CHARS: Record<string, string[]> = {
    'b': ['d', 'p', 'q'], 'd': ['b', 'p', 'q'], 'p': ['b', 'd', 'q'], 'q': ['p', 'b', 'd'],
    'm': ['n', 'u'], 'n': ['m', 'u'], 'u': ['n', 'ü'], 'ü': ['u', 'ö'],
    'o': ['ö', 'c'], 'ö': ['o', 'u'], 's': ['ş'], 'ş': ['s'], 'z': ['2', '7']
};
export const CONNECT_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

// Helper Functions
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
    const parts = [];
    let i = 0;
    while (i < text.length) {
        const len = (Math.random() > 0.5 && i + 3 <= text.length) ? 3 : 2;
        parts.push(text.substring(i, Math.min(i + len, text.length)));
        i += len;
    }
    return parts;
};

// --- DIFFICULTY & CONFIGURATION SETTINGS ---
export const getDifficultySettings = (difficulty: string) => {
    if (difficulty === 'Başlangıç') {
        return { 
            gridSize: 6,
            wordLength: {min: 2, max: 4}, 
            directions: [0, 1],
            numberRange: {min: 1, max: 10}, 
            sudokuSize: 4, 
            pyramidRows: 3, 
            mazeComplexity: 5, 
            operations: ['+'] 
        };
    }
    if (difficulty === 'Orta') {
        return { 
            gridSize: 10,
            wordLength: {min: 4, max: 7}, 
            directions: [0, 1, 2],
            numberRange: {min: 1, max: 50}, 
            sudokuSize: 6, 
            pyramidRows: 4, 
            mazeComplexity: 10, 
            operations: ['+', '-'] 
        };
    }
    if (difficulty === 'Zor') {
        return { 
            gridSize: 15,
            wordLength: {min: 6, max: 10}, 
            directions: [0, 1, 2, 3, 4, 5],
            numberRange: {min: 10, max: 100}, 
            sudokuSize: 9, 
            pyramidRows: 5, 
            mazeComplexity: 15, 
            operations: ['+', '-', '*'] 
        };
    }
    return { 
        gridSize: 20,
        wordLength: {min: 10, max: 15}, 
        directions: [0, 1, 2, 3, 4, 5, 6, 7],
        numberRange: {min: 100, max: 1000}, 
        sudokuSize: 9, 
        pyramidRows: 6, 
        mazeComplexity: 25, 
        operations: ['+', '-', '*', '/'] 
    };
};

export const getWordsForDifficulty = (difficulty: string, topic?: string): string[] => {
    let pool: string[] = [];
    
    if (difficulty === 'Başlangıç') {
        pool = TR_VOCAB.easy_words;
    } else if (difficulty === 'Orta') {
        pool = TR_VOCAB.medium_words;
    } else if (difficulty === 'Zor') {
        pool = TR_VOCAB.hard_words;
    } else {
        pool = TR_VOCAB.expert_words;
    }

    if (topic && topic !== 'Rastgele' && topic in TR_VOCAB) {
        const topicWords = (TR_VOCAB[topic] as string[]) || [];
        pool = [...getRandomItems(pool, 10), ...getRandomItems(topicWords, 10)];
    }

    return [...new Set(pool)];
};

export const generateCrosswordLayout = (words: string[]) => {
    return { 
        gridObj: {}, 
        placements: words.map((w, i) => ({ 
            word: w, 
            row: i * 2, 
            col: i % 2 === 0 ? 0 : 2, 
            dir: i % 2 === 0 ? 'across' : 'down' as 'across'|'down' 
        })) 
    };
};

// Helper to find visual for rebus/resfebe
const findEmojiForDescription = (desc: string): string | null => {
    const lowerDesc = desc.toLocaleLowerCase('tr');
    // Direct match
    if (EMOJI_MAP[lowerDesc]) return EMOJI_MAP[lowerDesc];
    // Contains match
    for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
        if (lowerDesc.includes(key)) return emoji;
    }
    return null;
};

export const wordToRebus = (word: string) => {
    const sylls = simpleSyllabify(word);
    return sylls.map(s => {
        const visual = findEmojiForDescription(s);
        return visual 
            ? { type: 'image' as const, value: s, imagePrompt: visual } // Use visual as imagePrompt
            : { type: 'text' as const, value: s };
    });
} 

export const generateSmartConnectGrid = (dim: number, count: number) => {
    const res = [];
    for(let i=0; i<count; i++) {
        res.push({pairIndex: i, x: 0, y: i*2, isStart: true});
        res.push({pairIndex: i, x: 5, y: i*2, isStart: false});
    }
    return res;
};
export const generateMaze = (r: number, c: number) => Array(r).fill(Array(c).fill(0));
export const generateLatinSquare = (n: number) => Array(n).fill(Array(n).fill(1));
export const generateRandomPattern = (dim: number, den: number) => [];
export const generateSudokuGrid = (n: number, d: string) => Array(n).fill(Array(n).fill(null));
