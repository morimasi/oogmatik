import { 
    WordSearchData, AnagramData, MathPuzzleData, FindTheDifferenceData, ProverbFillData, WorksheetData,
    SpellingCheckData, OddOneOutData, WordComparisonData, WordsInStoryData, ProverbSearchData, ReverseWordData, FindDuplicateData, WordGroupingData, WordLadderData, WordFormationData, FindIdenticalWordData, LetterBridgeData, FindLetterPairData, MiniWordGridData
} from '../types';

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
    targetPair?: string;
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

export const generateOfflineSpellingCheck = async (options: OfflineGeneratorOptions): Promise<SpellingCheckData[]> => {
    const { topic, itemCount, worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: SpellingCheckData[] = [];
    const availableWords = wordlist[topic] || wordlist.Rastgele;

    for (let i = 0; i < worksheetCount; i++) {
        const selectedWords = getRandomItems(availableWords.filter(w => w.length > 4), itemCount);
        const checks = selectedWords.map(correct => {
            const chars = correct.split('');
            
            // Mistake 1: swap adjacent letters
            const swapIndex = getRandomInt(0, chars.length - 2);
            const swappedChars = [...chars];
            [swappedChars[swapIndex], swappedChars[swapIndex + 1]] = [swappedChars[swapIndex + 1], swappedChars[swapIndex]];
            const mistake1 = swappedChars.join('');

            // Mistake 2: change one letter
            const changeIndex = getRandomInt(0, chars.length - 1);
            const changedChars = [...chars];
            let newChar = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
            while(newChar === changedChars[changeIndex]) {
                 newChar = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
            }
            changedChars[changeIndex] = newChar;
            const mistake2 = changedChars.join('');

            const options = shuffle([correct, mistake1, mistake2]);
            return { correct, options };
        });

        results.push({
            title: 'Doğru Yazılışı Bul',
            checks
        });
    }

    return results;
};

export const generateOfflineOddOneOut = async (options: OfflineGeneratorOptions): Promise<OddOneOutData[]> => {
    const { itemCount, worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: OddOneOutData[] = [];
    const categories = Object.keys(wordlist);

    for (let i = 0; i < worksheetCount; i++) {
        const groups = [];
        for (let j = 0; j < itemCount; j++) {
            let mainCatIndex = getRandomInt(0, categories.length - 1);
            let outlierCatIndex = getRandomInt(0, categories.length - 1);
            while (mainCatIndex === outlierCatIndex) {
                 outlierCatIndex = getRandomInt(0, categories.length - 1);
            }
            const mainCategory = categories[mainCatIndex];
            const outlierCategory = categories[outlierCatIndex];

            const mainWords = getRandomItems(wordlist[mainCategory], 3);
            const outlierWord = getRandomItems(wordlist[outlierCategory], 1);

            const words = shuffle([...mainWords, ...outlierWord]);
            groups.push({ words });
        }
        results.push({
            title: 'Anlamsal Olarak Farklı Olanı Bul',
            groups
        });
    }

    return results;
};

export const generateOfflineWordComparison = async (options: OfflineGeneratorOptions): Promise<WordComparisonData[]> => {
    const { topic, itemCount, worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: WordComparisonData[] = [];
    const availableWords = wordlist[topic] || wordlist.Rastgele;

    for (let i = 0; i < worksheetCount; i++) {
        const wordPool = getRandomItems(availableWords, itemCount + 4);
        const commonWords = wordPool.slice(0, itemCount - 2);
        const list1Only = [wordPool[itemCount-2], wordPool[itemCount-1]];
        const list2Only = [wordPool[itemCount], wordPool[itemCount+1]];

        const wordList1 = shuffle([...commonWords, ...list1Only]);
        const wordList2 = shuffle([...commonWords, ...list2Only]);

        results.push({
            title: 'Kelime Karşılaştırma',
            box1Title: 'Kutu 1',
            box2Title: 'Kutu 2',
            wordList1,
            wordList2
        });
    }
    return results;
};

export const generateOfflineWordsInStory = async (options: OfflineGeneratorOptions): Promise<WordsInStoryData[]> => {
    const { itemCount, worksheetCount } = options;
    const { wordlist, proverbs } = await loadData();
    const results: WordsInStoryData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const storyProverbs = getRandomItems(proverbs, 3);
        const story = storyProverbs.join(' ');
        const storyWords = Array.from(new Set(story.toLowerCase().replace(/[.,]/g, '').split(' ')));

        const inStoryCount = Math.floor(itemCount / 2);
        const notInStoryCount = itemCount - inStoryCount;

        const wordsInStory = getRandomItems(storyWords, inStoryCount);
        const allWords = Object.values(wordlist).flat();
        const wordsNotInStory = getRandomItems(allWords.filter(w => !storyWords.includes(w)), notInStoryCount);

        const wordList = shuffle([
            ...wordsInStory.map(word => ({ word, isInStory: true })),
            ...wordsNotInStory.map(word => ({ word, isInStory: false }))
        ]);

        results.push({
            title: 'Metindeki Kelimeler',
            story,
            wordList
        });
    }
    return results;
};

export const generateOfflineProverbSearch = async (options: OfflineGeneratorOptions): Promise<ProverbSearchData[]> => {
    const { gridSize, worksheetCount } = options;
    const { proverbs } = await loadData();
    const results: ProverbSearchData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const proverb = getRandomItems(proverbs, 1)[0];
        const word = proverb.replace(/[.,\s]/g, '').toLowerCase();
        
        const grid: string[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
        
        if (word.length <= gridSize) {
             const row = getRandomInt(0, gridSize - 1);
             const col = getRandomInt(0, gridSize - word.length);
             for (let k = 0; k < word.length; k++) {
                 grid[row][col + k] = word[k];
             }
        }

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === '') {
                    grid[r][c] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
                }
            }
        }
        
        results.push({
            title: `Atasözü Avı`,
            proverb,
            grid,
        });
    }

    return results;
};

export const generateOfflineReverseWord = async (options: OfflineGeneratorOptions): Promise<ReverseWordData[]> => {
    const { topic, itemCount, worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: ReverseWordData[] = [];
    const availableWords = wordlist[topic] || wordlist.Rastgele;

    for(let i=0; i < worksheetCount; i++) {
        const words = getRandomItems(availableWords, itemCount);
        results.push({
            title: 'Kelimeleri Ters Çevir',
            words
        });
    }
    return results;
};


export const generateOfflineFindDuplicateInRow = async (options: OfflineGeneratorOptions): Promise<FindDuplicateData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: FindDuplicateData[] = [];
    const chars = (turkishAlphabet + '0123456789').split('');

    for (let i = 0; i < worksheetCount; i++) {
        const rows = [];
        for (let j = 0; j < itemCount; j++) {
            const rowChars = getRandomItems(chars, 14);
            const duplicateChar = rowChars[getRandomInt(0, rowChars.length - 1)];
            const insertIndex = getRandomInt(0, rowChars.length);
            rowChars.splice(insertIndex, 0, duplicateChar);
            rows.push(shuffle(rowChars));
        }
        results.push({
            title: 'Satırda Tekrar Edeni Bul',
            rows
        });
    }
    return results;
};

export const generateOfflineWordGrouping = async (options: OfflineGeneratorOptions): Promise<WordGroupingData[]> => {
    const { worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: WordGroupingData[] = [];
    const allCategories = Object.keys(wordlist).filter(k => k !== 'Rastgele');

    for (let i = 0; i < worksheetCount; i++) {
        const categoryNames = getRandomItems(allCategories, 3);
        const words = [];
        for (const catName of categoryNames) {
            words.push(...getRandomItems(wordlist[catName], 5));
        }
        
        results.push({
            title: 'Kelime Gruplama',
            words: shuffle(words),
            categoryNames
        });
    }
    return results;
};

export const generateOfflineWordLadder = async (options: OfflineGeneratorOptions): Promise<WordLadderData[]> => {
    const { itemCount, worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: WordLadderData[] = [];
    const fourLetterWords = Object.values(wordlist).flat().filter(w => w.length === 4);

    for (let i = 0; i < worksheetCount; i++) {
        const ladders = [];
        for (let j = 0; j < Math.floor(itemCount / 2); j++) {
            const pair = getRandomItems(fourLetterWords, 2);
            if (pair.length === 2) {
                ladders.push({
                    startWord: pair[0],
                    endWord: pair[1],
                    steps: 3
                });
            }
        }
        results.push({
            title: 'Kelime Merdiveni',
            ladders
        });
    }
    return results;
};

export const generateOfflineWordFormation = async (options: OfflineGeneratorOptions): Promise<WordFormationData[]> => {
    const { itemCount, worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: WordFormationData[] = [];
    const longWords = Object.values(wordlist).flat().filter(w => w.length >= 7 && w.length <= 9);

    for (let i = 0; i < worksheetCount; i++) {
        const sets = [];
        const selectedWords = getRandomItems(longWords, Math.floor(itemCount / 2));
        for (const word of selectedWords) {
            sets.push({
                letters: shuffle(word.split('')),
                jokerCount: getRandomInt(1, 2)
            });
        }
        results.push({
            title: 'Harflerden Kelime Türetme',
            sets
        });
    }
    return results;
};

export const generateOfflineFindIdenticalWord = async (options: OfflineGeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { itemCount, worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: FindIdenticalWordData[] = [];
    const availableWords = Object.values(wordlist).flat().filter(w => w.length > 4);

    for (let i = 0; i < worksheetCount; i++) {
        const groups = [];
        for (let j = 0; j < itemCount * 2; j++) {
            const word = getRandomItems(availableWords, 1)[0];
            let pair: [string, string];
            
            if (Math.random() > 0.5) {
                pair = [word, word];
            } else {
                const chars = word.split('');
                const changeIndex = getRandomInt(0, chars.length - 1);
                let newChar = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
                while(newChar === chars[changeIndex]) {
                    newChar = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
                }
                chars[changeIndex] = newChar;
                const modifiedWord = chars.join('');
                pair = [word, modifiedWord];
            }
            groups.push({ words: pair });
        }
        results.push({
            title: 'Aynısını Bul',
            groups: shuffle(groups)
        });
    }
    return results;
};

export const generateOfflineLetterBridge = async (options: OfflineGeneratorOptions): Promise<LetterBridgeData[]> => {
    const { itemCount, worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: LetterBridgeData[] = [];
    const availableWords = Object.values(wordlist).flat();

    for(let i = 0; i < worksheetCount; i++) {
        const pairs = [];
        for (let j = 0; j < itemCount; j++) {
            const selectedWords = getRandomItems(availableWords, 2);
            if (selectedWords.length === 2) {
                pairs.push({
                    word1: selectedWords[0],
                    word2: selectedWords[1]
                });
            }
        }
        results.push({
            title: 'Harf Köprüsü',
            pairs
        });
    }
    return results;
};

export const generateOfflineFindLetterPair = async (options: OfflineGeneratorOptions): Promise<FindLetterPairData[]> => {
    const { gridSize, worksheetCount, targetPair = 'tr' } = options;
    const results: FindLetterPairData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const grid: string[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
        
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                grid[r][c] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
            }
        }
        
        const pairCount = Math.floor(gridSize / 2);
        for (let p = 0; p < pairCount; p++) {
            const row = getRandomInt(0, gridSize - 1);
            const col = getRandomInt(0, gridSize - 2);
            grid[row][col] = targetPair[0];
            grid[row][col+1] = targetPair[1];
        }

        results.push({
            title: `Harf İkilisi Bul (${targetPair.toUpperCase()})`,
            grid,
            targetPair
        });
    }
    return results;
};

export const generateOfflineMiniWordGrid = async (options: OfflineGeneratorOptions): Promise<MiniWordGridData[]> => {
    const { worksheetCount } = options;
    const { wordlist } = await loadData();
    const results: MiniWordGridData[] = [];
    const fourLetterWords = Object.values(wordlist).flat().filter(w => w.length === 4);

    for (let i = 0; i < worksheetCount; i++) {
        const puzzles = [];
        for (let j = 0; j < 4; j++) {
            const grid: string[][] = Array.from({ length: 4 }, () => Array(4).fill(''));
            const word = getRandomItems(fourLetterWords, 1)[0];
            
            let start: { row: number, col: number };
            const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';

            if (direction === 'horizontal') {
                const row = getRandomInt(0, 3);
                const col = 0;
                for (let k = 0; k < 4; k++) {
                    grid[row][col + k] = word[k];
                }
                start = { row, col };
            } else { // vertical
                const row = 0;
                const col = getRandomInt(0, 3);
                for (let k = 0; k < 4; k++) {
                    grid[row + k][col] = word[k];
                }
                start = { row, col };
            }

            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (grid[r][c] === '') {
                        grid[r][c] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
                    }
                }
            }
            puzzles.push({ grid, start });
        }
        
        results.push({
            title: 'Mini Kelime Bulmaca',
            prompt: 'Renkli harften başlayarak kelimeleri bulun.',
            puzzles
        });
    }
    return results;
};