
import { GeneratorOptions, WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData, ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, EMOJIS, COLORS, TR_VOCAB, VISUALLY_SIMILAR_CHARS } from './helpers';


export const generateOfflineWordMemory = async (options: GeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, memorizeRatio } = options;
    const results: WordMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const memorizeCount = Math.floor(itemCount * ((memorizeRatio || 50) / 100));
        
        // Categorical selection for better pedagogical value
        // If random, try to pick a category
        let finalPool: string[] = [];
        if (!topic || topic === 'Rastgele') {
            const categories = ['animals', 'fruits_veggies', 'items_household', 'school'];
            const randomCat = getRandomItems(categories, 1)[0];
            finalPool = getWordsForDifficulty(difficulty, randomCat);
        } else {
            finalPool = getWordsForDifficulty(difficulty, topic);
        }

        // Ensure we have enough items
        if (finalPool.length < itemCount) {
            finalPool = [...finalPool, ...getWordsForDifficulty(difficulty, 'Rastgele')];
        }
        
        const allWords = getRandomItems(finalPool, itemCount);
        
        results.push({
            title: 'Kelime Hafıza (Hızlı Mod)',
            instruction: "İlk sayfadaki kelimeleri ezberle. İkinci sayfada sadece ezberlediklerini işaretle.",
            pedagogicalNote: "Kısa süreli işitsel-sözel bellek kapasitesini ölçer.",
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
            instruction: "Görselleri dikkatlice incele. Sayfayı çevirince sadece gördüklerini bul.",
            pedagogicalNote: "Görsel tanıma belleği ve detaylara dikkat becerisini geliştirir.",
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
        
        if (difficulty === 'Orta') range = { start: 1, end: 50 };
        if (difficulty === 'Zor') range = { start: 100, end: 150 };
        if (difficulty === 'Uzman') range = { start: 1000, end: 1100 };

        const numbersToFind = Array.from({ length: range.end - range.start + 1 }, (_, k) => k + range.start);
        
        // Add visual distractors (numbers with similar digits)
        const distractors = Array.from({ length: 150 - numbersToFind.length }, () => {
             const base = getRandomInt(range.start, range.end);
             // Reverse digits or change one digit for distraction
             const reversed = parseInt(base.toString().split('').reverse().join(''));
             return Math.random() > 0.5 ? reversed : getRandomInt(1, range.end + 50);
        });

        results.push({ 
            title: `Sayı Avı (${difficulty})`, 
            instruction: `${range.start}'den ${range.end}'e kadar olan sayıları sırasıyla bulup daire içine al.`,
            pedagogicalNote: "Sıralı dikkat, görsel tarama ve takip becerisi.",
            numbers: shuffle([...numbersToFind, ...distractors]), 
            range: range 
        });
    }
    return results;
};


export const generateOfflineFindTheDuplicateInRow = async (options: GeneratorOptions): Promise<FindDuplicateData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: FindDuplicateData[] = [];
    
    const cols = options.cols || (difficulty === 'Başlangıç' ? 8 : difficulty === 'Orta' ? 12 : 15);

    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount }, () => {
            // Choose a "base" type for the row to make it harder
            const type = getRandomInt(0, 2); // 0: numbers, 1: letters, 2: symbols
            let pool: string[] = [];
            
            if (type === 0) pool = ['1','2','3','4','5','6','7','8','9','0'];
            else if (type === 1) pool = turkishAlphabet.split('');
            else pool = ['@', '#', '$', '%', '&', '*', '?', '!', '+', '='];

            // Filter pool for visual similarity if difficult
            if (difficulty === 'Zor' || difficulty === 'Uzman') {
                 if (type === 1) pool = ['b', 'd', 'p', 'q']; 
                 else if (type === 0) pool = ['6', '9', '0', '8'];
            }

            // Ensure pool has enough items
            if(pool.length < cols) pool = [...pool, ...pool]; // Duplicate pool if needed

            const rowChars = getRandomItems(pool, cols - 1);
            const duplicateChar = getRandomItems(rowChars, 1)[0];
            const insertPos = getRandomInt(0, cols - 2);
            
            const finalRow = [...rowChars];
            finalRow.splice(insertPos, 0, duplicateChar);
            return finalRow;
        });
        
        results.push({ 
            title: 'İkiliyi Bul', 
            instruction: "Her satırda iki kez yazılmış olan karakteri bul.",
            pedagogicalNote: "Odaklanmış dikkat ve görsel ayrım.",
            rows 
        });
    }
    return results;
};


export const generateOfflineLetterGridTest = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize, difficulty, worksheetCount, targetLetters } = options;
    // If no target letters provided, pick visually confusing ones based on difficulty
    let targets: string[] = [];
    if (targetLetters) {
        targets = targetLetters.split(',').map(l => l.trim().toLowerCase());
    } else {
        if (difficulty === 'Başlangıç') targets = ['a', 'e'];
        else if (difficulty === 'Orta') targets = ['m', 'n'];
        else targets = ['b', 'd'];
    }

    const results: LetterGridTestData[] = [];
    
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 15;
        
        // Build a pool of distractors. 
        // If targets are 'b', 'd', distractors should be 'p', 'q', 'h' etc.
        let distractorPool: string[] = [];
        targets.forEach(t => {
             if (VISUALLY_SIMILAR_CHARS[t]) {
                 distractorPool.push(...VISUALLY_SIMILAR_CHARS[t]);
             }
        });
        // Add some randoms to dilute
        distractorPool.push(...getRandomItems(turkishAlphabet.split(''), 5));
        
        const grid: string[][] = [];
        for(let r=0; r<size; r++){
            const row: string[] = [];
            for(let c=0; c<size; c++){
                const isTarget = Math.random() < 0.2; // 20% chance of target
                if (isTarget) {
                    row.push(getRandomItems(targets, 1)[0]);
                } else {
                    row.push(getRandomItems(distractorPool, 1)[0]);
                }
            }
            grid.push(row);
        }

        results.push({
            title: `Harf Izgara Testi (${difficulty})`,
            instruction: `Aşağıdaki tabloda sadece "${targets.join(', ')}" harflerini bul ve işaretle.`,
            pedagogicalNote: "Seçici dikkat ve sürdürülebilir dikkat becerisi.",
            grid: grid,
            targetLetters: targets
        });
    }
    return results;
};


export const generateOfflineBurdonTest = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    const res = await generateOfflineLetterGridTest({ ...options, gridSize: options.gridSize || 20, targetLetters: 'a,b,d,g' });
    return res.map(d => ({
        ...d, 
        title: 'Burdon Dikkat Testi',
        instruction: 'Sırasıyla her satırı tara ve "a, b, d, g" harflerini bulup çiz.',
        pedagogicalNote: 'Standart dikkat ölçüm testi. Hız ve doğruluk önemlidir.'
    }));
};


export const generateOfflineFindLetterPair = async (options: GeneratorOptions): Promise<FindLetterPairData[]> => {
    const { gridSize, difficulty, worksheetCount, targetPair } = options;
    const results: FindLetterPairData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 15;
        // Default pair logic
        const pair = (targetPair as string) || ((difficulty === 'Zor' || difficulty === 'Uzman') ? 'bd' : 'ak');
        
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));
        
        // Place pairs horizontally
        const pairCount = 5 + getRandomInt(0, 3);
        for (let k = 0; k < pairCount; k++) {
            const r = getRandomInt(0, size - 1);
            const c = getRandomInt(0, size - 2);
            grid[r][c] = pair[0];
            grid[r][c + 1] = pair[1];
        }

        results.push({ 
            title: 'Harf İkilisini Bul', 
            instruction: `Tabloda yan yana gelmiş "${pair}" ikililerini bul ve daire içine al.`,
            pedagogicalNote: "Görsel tarama ve desen tanıma.",
            grid, 
            targetPair: pair 
        });
    }
    return results;
};


export const generateOfflineTargetSearch = async (options: GeneratorOptions): Promise<TargetSearchData[]> => {
    const { gridSize, difficulty, worksheetCount, targetChar, distractorChar } = options;
    const results: TargetSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 20;
        const target = targetChar || 'd';
        // Smart distractor choice if not provided
        const distractor = distractorChar || (VISUALLY_SIMILAR_CHARS[target] ? VISUALLY_SIMILAR_CHARS[target][0] : 'b');
        
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => distractor));
        const targetCount = getRandomInt(15, 25);
        
        for (let k = 0; k < targetCount; k++) {
            grid[getRandomInt(0, size - 1)][getRandomInt(0, size - 1)] = target;
        }
        results.push({ 
            title: 'Dikkatli Göz', 
            instruction: `Sadece "${target}" karakterlerini bul. Çeldirici "${distractor}" karakterlerine dikkat et.`,
            pedagogicalNote: "Zorlu zemin üzerinde şekil ayırt etme (Figure-Ground Perception).",
            grid, 
            target, 
            distractor 
        });
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
            instruction: "Renk çemberindeki nesnelerin yerini ve rengini ezberle.",
            pedagogicalNote: "Görsel-mekansal hafıza ve renk eşleştirme.",
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
        const scene = "Parkta oynayan çocuklar 🤸, uçan bir kırmızı uçurtma 🪁 ve bankta dondurma yiyen bir aile 👨‍👩‍👧‍👦 var. Güneş parlıyor ☀️ ve yerde sarı yapraklar 🍂 var.";
        results.push({
            title: "Resme Dikkat (Hızlı Mod)",
            instruction: "Metni/Resmi zihninde canlandır ve detayları hatırla.",
            pedagogicalNote: "Sözel bilgiyi görselleştirebilme ve detay hatırlama.",
            memorizeTitle: "Metni Oku ve Canlandır",
            testTitle: "Soruları Cevapla",
            sceneDescription: scene,
            imageBase64: "", // No image in fast mode
            questions: ["Uçurtma ne renkti?", "Aile ne yiyordu?", "Yerdeki yapraklar ne renkti?"]
        });
    }
    return results;
};

export const generateOfflineCharacterMemory = async (options: GeneratorOptions): Promise<CharacterMemoryData[]> => {
    const {itemCount, worksheetCount, memorizeRatio} = options;
    const results: CharacterMemoryData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const memorizeCount = Math.floor(itemCount * ((memorizeRatio || 50) / 100));
        const allItems = getRandomItems(EMOJIS, itemCount).map((emoji: string) => {
            const vocab = TR_VOCAB as any;
            const adjectives = (vocab.adjectives || []) as string[];
            const animals = (vocab.animals || []) as string[];

            const adjective: string = getRandomItems(adjectives, 1)[0] || '';
            const animal: string = getRandomItems(animals, 1)[0] || '';
            return {
                description: `${adjective} ${animal} ${emoji}`.trim()
            };
        });
        results.push({
            title: 'Karakter Hafıza (Hızlı Mod)',
            instruction: "Karakterlerin özelliklerini (sıfatlarını) ezberle.",
            pedagogicalNote: "Sıfat-isim tamlamalarıyla ilişkilendirilmiş hafıza çalışması.",
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
    
    // Colors with their display names and CSS values
    const colors = [
        { name: 'KIRMIZI', css: 'red' },
        { name: 'MAVİ', css: 'blue' },
        { name: 'YEŞİL', css: 'green' },
        { name: 'SARI', css: 'orange' }, // Yellow is hard to read, using orange/gold visually
        { name: 'SİYAH', css: 'black' },
        { name: 'MOR', css: 'purple' }
    ];

    for (let i = 0; i < worksheetCount; i++) {
        const items = Array.from({ length: itemCount }).map(() => {
            // Pick a text (e.g., "RED")
            const textObj = getRandomItems(colors, 1)[0];
            // Pick a color that is NOT the text's color (Conflict)
            const conflictColors = colors.filter(c => c.name !== textObj.name);
            const colorObj = getRandomItems(conflictColors, 1)[0];
            
            return { text: textObj.name, color: colorObj.css };
        });
        
        results.push({ 
            title: 'Stroop Testi (Renk Okuma)', 
            instruction: "Kelimeyi okuma! Kelimenin yazıldığı RENGİ söyle. Hızlı olmaya çalış.",
            pedagogicalNote: "Dürtü kontrolü (inhibisyon), seçici dikkat ve bilişsel esneklik sağlar.",
            items 
        });
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
            title: 'Kaotik Sayı Bulma',
            instruction: `${range.start}'den ${range.end}'e kadar olan sayıları sırasıyla bul ve işaretle.`,
            pedagogicalNote: "Karmaşık görsel zeminde sıralı takip ve dikkat.",
            prompt: `Karışık sayılar arasından ${range.start}'den ${range.end}'e kadar olanları boyayın.`,
            numbers,
            range
        })
    }
    return results;
}
