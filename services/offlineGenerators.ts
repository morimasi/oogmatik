import { WordSearchData, AnagramData, MathPuzzleData, FindTheDifferenceData, ProverbFillData, WorksheetData } from '../types';

// Önbellekleme mekanizması
let wordlistCache: Record<string, string[]> | null = null;
let proverbsCache: string[] | null = null;

async function loadData(): Promise<{ wordlist: Record<string, string[]>, proverbs: string[] }> {
    if (wordlistCache && proverbsCache) {
        return { wordlist: wordlistCache, proverbs: proverbsCache };
    }

    const [wordlistResponse, proverbsResponse] = await Promise.all([
        fetch('/data/tr_wordlist.json'),
        fetch('/data/proverbs.json')
    ]);

    if (!wordlistResponse.ok || !proverbsResponse.ok) {
        throw new Error('Çevrimdışı mod için gerekli veri dosyaları yüklenemedi.');
    }

    wordlistCache = await wordlistResponse.json();
    proverbsCache = await proverbsResponse.json();

    if (!wordlistCache || !proverbsCache) {
        throw new Error('Çevrimdışı veri dosyaları ayrıştırılamadı.');
    }

    return { wordlist: wordlistCache, proverbs: proverbsCache };
}


// --- Yardımcı Fonksiyonlar ---

const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const getRandomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomItems = <T>(arr: T[], count: number): T[] => {
    return shuffle(arr).slice(0, count);
};

const turkishAlphabet = 'abcçdefgğhıijklmnoöprsştuüvyz';

// --- Üretici Seçenekleri Arayüzü ---

export interface OfflineGeneratorOptions {
    topic: string;
    itemCount: number;
    gridSize: number;
    worksheetCount: number;
    difficulty: 'Kolay' | 'Orta' | 'Zor';
}

// --- Üretici Fonksiyonları ---

export const generateOfflineWordSearch = async (options: OfflineGeneratorOptions): Promise<WordSearchData[]> => {
    const { topic, itemCount, gridSize, worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: WordSearchData[] = [];

    const availableWords = wordlist[topic] || wordlist.Rastgele;

    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(availableWords.filter(w => w.length <= gridSize), itemCount);
        const grid: string[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
        
        words.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 50) {
                const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                if (direction === 'horizontal') {
                    const row = getRandomInt(0, gridSize - 1);
                    const col = getRandomInt(0, gridSize - word.length);
                    let canPlace = true;
                    for (let k = 0; k < word.length; k++) {
                        if (grid[row][col + k] !== '' && grid[row][col + k] !== word[k]) {
                            canPlace = false;
                            break;
                        }
                    }
                    if (canPlace) {
                        for (let k = 0; k < word.length; k++) {
                            grid[row][col + k] = word[k];
                        }
                        placed = true;
                    }
                } else { // vertical
                    const row = getRandomInt(0, gridSize - word.length);
                    const col = getRandomInt(0, gridSize - 1);
                     let canPlace = true;
                    for (let k = 0; k < word.length; k++) {
                        if (grid[row + k][col] !== '' && grid[row + k][col] !== word[k]) {
                            canPlace = false;
                            break;
                        }
                    }
                    if (canPlace) {
                        for (let k = 0; k < word.length; k++) {
                            grid[row + k][col] = word[k];
                        }
                        placed = true;
                    }
                }
                attempts++;
            }
        });

        // Boş hücreleri doldur
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === '') {
                    grid[r][c] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
                }
            }
        }
        
        results.push({
            title: `${topic} Kelime Bulmaca`,
            words,
            grid,
        });
    }

    return results;
};


export const generateOfflineAnagrams = async (options: OfflineGeneratorOptions): Promise<(AnagramData[])[]> => {
    const { topic, itemCount, worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: (AnagramData[])[] = [];
    const availableWords = wordlist[topic] || wordlist.Rastgele;

    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(availableWords, itemCount);
        const anagrams: AnagramData[] = words.map(word => {
            let scrambled = shuffle(word.split('')).join('');
            while (scrambled === word) {
                 scrambled = shuffle(word.split('')).join('');
            }
            return { word, scrambled };
        });
        results.push(anagrams);
    }
    return results;
};


export const generateOfflineMathPuzzles = async (options: OfflineGeneratorOptions): Promise<MathPuzzleData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: MathPuzzleData[] = [];
    const objects = ['🍎', '🍌', '🍓', '🍇'];

    for (let i = 0; i < worksheetCount; i++) {
        const puzzles = [];
        const values = objects.map(() => getRandomInt(1, 10));
        
        for (let j = 0; j < itemCount; j++) {
            const op = Math.random() > 0.5 ? '+' : '-';
            const idx1 = getRandomInt(0, objects.length - 1);
            let idx2 = getRandomInt(0, objects.length - 1);
            while (op === '-' && values[idx1] < values[idx2]) {
                 idx2 = getRandomInt(0, objects.length - 1);
            }
            const answer = op === '+' ? values[idx1] + values[idx2] : values[idx1] - values[idx2];

            puzzles.push({
                problem: `${objects[idx1]} ${op} ${objects[idx2]} = ?`,
                question: `(İpucu: ${objects[idx1]}=${values[idx1]}, ${objects[idx2]}=${values[idx2]})`,
                answer: answer.toString(),
            });
        }

        results.push({
            title: 'Meyveli Matematik',
            puzzles
        });
    }
    return results;
};

export const generateOfflineFindTheDifference = async (options: OfflineGeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount, worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: FindTheDifferenceData[] = [];
    const availableWords = wordlist[topic] || wordlist.Rastgele;

    for (let i = 0; i < worksheetCount; i++) {
        const words = getRandomItems(availableWords.filter(w => w.length > 3), itemCount);
        const rows = words.map(word => {
            const diffIndex = getRandomInt(0, 3);
            const items = [];
            for (let k = 0; k < 4; k++) {
                if (k === diffIndex) {
                    const chars = word.split('');
                    const pos1 = getRandomInt(0, chars.length - 2);
                    const pos2 = pos1 + 1;
                    [chars[pos1], chars[pos2]] = [chars[pos2], chars[pos1]]; // bitişik harfleri değiştir
                    items.push(chars.join(''));
                } else {
                    items.push(word);
                }
            }
            return { items, correctIndex: diffIndex };
        });
        results.push({
            title: 'Farklı Kelimeyi Bul',
            rows
        });
    }
    return results;
};

export const generateOfflineProverbFill = async (options: OfflineGeneratorOptions): Promise<ProverbFillData[]> => {
    const { itemCount, worksheetCount } = options;
    const { proverbs } = await loadData();
    const results: ProverbFillData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const selectedProverbs = getRandomItems(proverbs, itemCount);
        const proverbPuzzles = selectedProverbs.map(proverb => {
            const words = proverb.split(' ');
            if (words.length < 3) return { start: proverb, end: '' };
            const missingIndex = getRandomInt(1, words.length - 2);
            const start = words.slice(0, missingIndex).join(' ');
            const end = words.slice(missingIndex + 1).join(' ');
            return { start, end };
        });

        results.push({
            title: 'Atasözünü Tamamla',
            proverbs: proverbPuzzles,
        });
    }
    return results;
};
