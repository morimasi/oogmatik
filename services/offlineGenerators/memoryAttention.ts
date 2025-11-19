import { GeneratorOptions, WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData, ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData, StarHuntData } from '../../types';
// FIX: Import TR_VOCAB from helpers to ensure consistent module resolution and correct type inference.
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, EMOJIS, COLORS, TR_VOCAB } from './helpers';


export const generateOfflineWordMemory = async (options: GeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, memorizeRatio } = options;
    const results: WordMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const memorizeCount = Math.floor(itemCount * ((memorizeRatio || 50) / 100));
        const allWords = getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount);
        results.push({
            title: 'Kelime Hafıza (Hızlı Mod)',
            memorizeTitle: 'Bunları Aklında Tut',
            testTitle: 'Aklında Tuttuklarını İşaretle',
            wordsToMemorize: allWords.slice(0, memorizeCount),
            testWords: shuffle(allWords)
        });
    }
    return results;
};


export const generateOfflineVisualMemory = async (options: GeneratorOptions): Promise<VisualMemoryData[]> => {
    const { itemCount, worksheetCount, memorizeRatio } = options;
    const results: VisualMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const memorizeCount = Math.floor(itemCount * ((memorizeRatio || 50) / 100));
        const allItems = getRandomItems(EMOJIS, itemCount);
        results.push({
            title: 'Görsel Hafıza (Hızlı Mod)',
            memorizeTitle: 'Bunları Aklında Tut',
            testTitle: 'Aklında Tuttuklarını İşaretle',
            itemsToMemorize: allItems.slice(0, memorizeCount),
            testItems: shuffle(allItems)
        });
    }
    return results;
};


export const generateOfflineNumberSearch = async (options: GeneratorOptions): Promise<NumberSearchData[]> => {
    const { worksheetCount, difficulty, itemCount } = options;
    const results: NumberSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        let rangeEnd = itemCount || 50;
        let range = { start: 1, end: 20 };
        if (difficulty === 'Orta') range = { start: 1, end: rangeEnd > 50 ? 50 : rangeEnd };
        if (difficulty === 'Zor' || difficulty === 'Uzman') range = { start: 1, end: rangeEnd > 100 ? 100 : rangeEnd };
        const numbersToFind = Array.from({ length: range.end - range.start + 1 }, (_, k) => k + range.start);
        const distractors = Array.from({ length: 150 - numbersToFind.length }, () => getRandomInt(1, range.end + 20));
        results.push({ title: `Sayı Avı (${difficulty})`, numbers: shuffle([...numbersToFind, ...distractors]), range: range });
    }
    return results;
};


export const generateOfflineFindTheDuplicateInRow = async (options: GeneratorOptions): Promise<FindDuplicateData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: FindDuplicateData[] = [];
    const charPool = (difficulty === 'Zor' || difficulty === 'Uzman') ? ['b', 'd', 'p', 'q', 'm', 'n'] : turkishAlphabet.split('');
    const cols = options.cols || (difficulty === 'Başlangıç' ? 10 : difficulty === 'Orta' ? 15 : 20);

    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount }, () => {
            const rowChars = getRandomItems(charPool, cols - 1);
            const duplicateChar = getRandomItems(rowChars, 1)[0];
            const insertPos = getRandomInt(0, cols - 2);
            rowChars.splice(insertPos, 0, duplicateChar);
            return shuffle(rowChars);
        });
        results.push({ title: 'İkiliyi Bul', rows });
    }
    return results;
};


export const generateOfflineLetterGridTest = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize, difficulty, worksheetCount, targetLetters } = options;
    const letters = targetLetters || 'b,d,p,q';
    const targetLettersArray = letters.split(',').map(l => l.trim().toLowerCase());
    const results: LetterGridTestData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 15;
        const grid: string[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));

        const targetCount = Math.floor(size * size * 0.2); // 20% target letters
        for (let k = 0; k < targetCount; k++) {
            const r = getRandomInt(0, size - 1);
            const c = getRandomInt(0, size - 1);
            grid[r][c] = getRandomItems(targetLettersArray, 1)[0];
        }

        results.push({
            title: `Harf Izgara Testi (${difficulty})`,
            grid: grid,
            targetLetters: targetLettersArray
        });
    }
    return results;
};


export const generateOfflineBurdonTest = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    return generateOfflineLetterGridTest({ ...options, gridSize: options.gridSize || 20, targetLetters: options.targetLetters || 'a,b,d,g' });
};


export const generateOfflineFindLetterPair = async (options: GeneratorOptions): Promise<FindLetterPairData[]> => {
    const { gridSize, difficulty, worksheetCount, targetPair } = options;
    const results: FindLetterPairData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 15;
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));
        const pair = targetPair || ((difficulty === 'Zor' || difficulty === 'Uzman') ? 'bd' : 'ak');
        for (let k = 0; k < 5; k++) {
            const r = getRandomInt(0, size - 1);
            const c = getRandomInt(0, size - 2);
            grid[r][c] = pair[0];
            grid[r][c + 1] = pair[1];
        }
        results.push({ title: 'Harf İkilisini Bul', grid, targetPair: pair });
    }
    return results;
};


export const generateOfflineTargetSearch = async (options: GeneratorOptions): Promise<TargetSearchData[]> => {
    const { gridSize, difficulty, worksheetCount, targetChar, distractorChar } = options;
    const results: TargetSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 20;
        const target = targetChar || 'd', distractor = distractorChar || 'b';
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => distractor));
        for (let k = 0; k < 20; k++) {
            grid[getRandomInt(0, size - 1)][getRandomInt(0, size - 1)] = target;
        }
        results.push({ title: 'Dikkatli Göz', grid, target, distractor });
    }
    return results;
};

export const generateOfflineColorWheelMemory = async (options: GeneratorOptions): Promise<ColorWheelMemoryData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: ColorWheelMemoryData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const items = getRandomItems(EMOJIS, itemCount).map((emoji, index) => ({
            name: `${getRandomItems(getWordsForDifficulty('Başlangıç'), 1)[0]} ${emoji}`,
            color: COLORS[index % COLORS.length].css
        }));
        results.push({
            title: 'Renk Çemberi',
            memorizeTitle: 'Ezberle',
            testTitle: 'Hatırla ve Eşleştir',
            items
        });
    }
    return results;
}

export const generateOfflineImageComprehension = async (options: GeneratorOptions): Promise<ImageComprehensionData[]> => {
    const { worksheetCount } = options;
    const results: ImageComprehensionData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const scene = "Parkta oynayan çocuklar 🤸, uçan bir uçurtma 🪁 ve dondurma yiyen bir aile 👨‍👩‍👧‍👦 var.";
        results.push({
            title: "Resme Dikkat (Hızlı Mod)",
            memorizeTitle: "Resmi İncele",
            testTitle: "Soruları Cevapla",
            sceneDescription: scene,
            imageBase64: "", // No image in fast mode
            questions: ["Uçurtma ne renk olabilir?", "Kaç çocuk oyun oynuyor?", "Aile ne yiyor olabilir?"]
        });
    }
    return results;
};

export const generateOfflineCharacterMemory = async (options: GeneratorOptions): Promise<CharacterMemoryData[]> => {
    const {itemCount, worksheetCount, memorizeRatio} = options;
    const results: CharacterMemoryData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const memorizeCount = Math.floor(itemCount * ((memorizeRatio || 50) / 100));
        const allItems = getRandomItems(EMOJIS, itemCount).map(emoji => {
            // FIX: The type of TR_VOCAB properties is sometimes inferred as 'unknown' due to module resolution issues.
            // Casting the result to 'string' to resolve the type error.
            const adjective: string = (getRandomItems(TR_VOCAB.adjectives as string[], 1)[0] || '') as string;
            // FIX: The type of `TR_VOCAB.animals` is sometimes inferred as 'unknown'. Using `(TR_VOCAB as any)` was incorrect and resulted in a type error.
            // Aligned with the working pattern for 'adjective' by casting the array to string[] before passing to `getRandomItems`.
            const animal: string = (getRandomItems(TR_VOCAB.animals as string[], 1)[0] || '') as string;
            return {
                description: `${adjective} ${animal} ${emoji}`.trim()
            };
        });
        results.push({
            title: 'Karakter Hafıza (Hızlı Mod)',
            memorizeTitle: 'Karakterleri Ezberle',
            testTitle: 'Doğru Karakterleri İşaretle',
            charactersToMemorize: allItems.slice(0, memorizeCount),
            testCharacters: shuffle(allItems)
        });
    }
    return results;
}

export const generateOfflineStroopTest = async (options: GeneratorOptions): Promise<StroopTestData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: StroopTestData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const items = Array.from({ length: itemCount }).map(() => {
            const color1 = getRandomItems(COLORS, 1)[0];
            const color2 = getRandomItems(COLORS.filter(c => c.name !== color1.name), 1)[0];
            return { text: color1.name, color: color2.css };
        });
        results.push({ title: 'Stroop Testi', items });
    }
    return results;
};

export const generateOfflineChaoticNumberSearch = async (options: GeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: ChaoticNumberSearchData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const range = {start: 1, end: itemCount || 50};
        const targetNumbers = Array.from({length: range.end}, (_,k) => k+1);
        const distractorNumbers = Array.from({length: 50}, () => getRandomInt(range.end+1, range.end+20));
        const numbers = shuffle([...targetNumbers, ...distractorNumbers]).map(value => ({
            value,
            x: getRandomInt(5, 95),
            y: getRandomInt(5, 95),
            size: getRandomInt(1, 3),
            rotation: getRandomInt(-45, 45),
            color: getRandomItems(COLORS, 1)[0].css
        }));
        results.push({
            title: 'Sayıları Bulma',
            prompt: `Karışık sayılar arasından ${range.start}'den ${range.end}'e kadar olanları boyayın.`,
            numbers,
            range
        })
    }
    return results;
}

export const generateOfflineStarHunt = async (options: GeneratorOptions): Promise<StarHuntData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Yıldız Avı (Geometrik Cisimler)', prompt: 'Yıldız sayısına göre doğru geometrik cismi bulun.', grid: [[]] });
}