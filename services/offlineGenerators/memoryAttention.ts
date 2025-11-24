


import { GeneratorOptions, WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData, ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData, WordMemoryItem } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, EMOJIS, COLORS, TR_VOCAB, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

export const generateOfflineWordMemory = async (options: GeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, memorizeRatio } = options;
    const results: WordMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        // Ensure itemCount defaults to a reasonable number if not provided
        const count = itemCount || 12;
        const memorizeCount = Math.floor(count * ((memorizeRatio || 50) / 100));
        
        let finalPool: string[] = [];
        if (difficulty === 'Zor' || difficulty === 'Uzman') {
            // For hard levels, use words from the same category to increase confusion
            const categories = ['animals', 'fruits_veggies', 'jobs', 'vehicles'];
            const randomCat = topic && topic !== 'Rastgele' ? topic.toLowerCase() : getRandomItems(categories, 1)[0];
            finalPool = getWordsForDifficulty(difficulty, randomCat);
        } else {
            // For easy levels, use words from very different categories or a general pool
            finalPool = getWordsForDifficulty(difficulty, topic || 'Rastgele');
        }

        // Ensure we have enough items
        if (finalPool.length < count) {
            finalPool = [...finalPool, ...getWordsForDifficulty(difficulty, 'Rastgele')];
        }
        
        const allWords = getRandomItems(finalPool, count);
        
        results.push({
            title: 'Kelime Hafıza (Hızlı Mod)',
            instruction: "İlk sayfadaki kelimeleri ezberle. İkinci sayfada sadece ezberlediklerini işaretle.",
            pedagogicalNote: "Kısa süreli işitsel-sözel bellek kapasitesini ölçer.",
            memorizeTitle: 'Bunları Aklında Tut',
            testTitle: 'Aklında Tuttuklarını İşaretle',
            wordsToMemorize: allWords.slice(0, memorizeCount).map(word => ({ text: word })),
            testWords: shuffle(allWords).map(word => ({ text: word }))
        });
    }
    return results;
};


export const generateOfflineVisualMemory = async (options: GeneratorOptions): Promise<VisualMemoryData[]> => {
    const { itemCount, worksheetCount, memorizeRatio } = options;
    const results: VisualMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const count = itemCount || 12;
        const memorizeCount = Math.floor(count * ((memorizeRatio || 50) / 100));
        const allEmojis = getRandomItems(Object.keys(EMOJI_MAP), count);
        const allItems = allEmojis.map(emoji => ({
            description: `${EMOJI_MAP[emoji]} ${emoji}`
        }));
        
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
    const count = itemCount || 50;

    for (let i = 0; i < worksheetCount; i++) {
        let range = { start: 1, end: 20 };
        
        if (difficulty === 'Orta') range = { start: 1, end: count };
        if (difficulty === 'Zor') range = { start: 100, end: 100 + count };
        if (difficulty === 'Uzman') range = { start: 1000, end: 1000 + count };

        const numbersToFind = Array.from({ length: range.end - range.start + 1 }, (_, k) => k + range.start);
        
        const distractors = Array.from({ length: 150 - numbersToFind.length }, () => {
             const base = getRandomInt(range.start, range.end);
             if (difficulty === 'Zor' || difficulty === 'Uzman') {
                const s = base.toString();
                if (s.includes('6')) return parseInt(s.replace('6', '9'));
                if (s.includes('1')) return parseInt(s.replace('1', '7'));
             }
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
        const rows = Array.from({ length: itemCount || 10 }, () => {
            let pool: string[] = [];
            
            if (difficulty === 'Zor' || difficulty === 'Uzman') {
                 const baseChar = getRandomItems(['b', 'd', 'p', 'q', 'm', 'n'], 1)[0];
                 pool = [baseChar, ...VISUALLY_SIMILAR_CHARS[baseChar]];
            } else if (difficulty === 'Orta') {
                pool = ['o','ö','u','ü','c','ç', 's', 'ş'];
            } else {
                pool = turkishAlphabet.split('');
            }
            
            if(pool.length < cols) pool = [...pool, ...pool, ...turkishAlphabet.split('')];

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
    let targets: string[] = [];
    if (targetLetters) {
        targets = targetLetters.split(/[\s,]+/).map(l => l.trim().toLowerCase()).filter(l => l.length === 1);
    } 
    
    if (targets.length === 0) {
        if (difficulty === 'Başlangıç') targets = ['a', 'e', 'o'];
        else if (difficulty === 'Orta') targets = ['m', 'n', 's', 'ş'];
        else targets = ['b', 'd', 'p', 'q'];
    }

    const results: LetterGridTestData[] = [];
    
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 15;
        
        let distractorPool: string[] = [];
        targets.forEach(t => {
             if (VISUALLY_SIMILAR_CHARS[t]) {
                 distractorPool.push(...VISUALLY_SIMILAR_CHARS[t]);
             }
        });
        distractorPool = [...new Set(distractorPool)]; 
        if (distractorPool.length === 0) {
            distractorPool = getRandomItems(turkishAlphabet.split('').filter(c => !targets.includes(c)), 5);
        }
        
        const grid: string[][] = [];
        for(let r=0; r<size; r++){
            const row: string[] = [];
            for(let c=0; c<size; c++){
                const isTarget = Math.random() < 0.25; 
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
    const { gridSize, difficulty, worksheetCount, targetPair, itemCount } = options;
    const results: FindLetterPairData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 15;
        const pairInput = (targetPair as string)?.replace(/[\s,]/g, '');
        const pair = (pairInput && pairInput.length >= 2) ? pairInput.substring(0, 2) : ((difficulty === 'Zor' || difficulty === 'Uzman') ? 'bd' : 'ak');
        
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));
        
        const pairCount = itemCount || (5 + getRandomInt(0, 3));
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
    const { gridSize, difficulty, worksheetCount, targetChar, distractorChar, itemCount } = options;
    const results: TargetSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 20;
        const target = targetChar || (difficulty === 'Başlangıç' ? 'X' : 'd');
        const distractor = distractorChar || (difficulty === 'Başlangıç' ? 'O' : 'b');
        
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => distractor));
        const targetCount = itemCount || getRandomInt(15, 25);
        
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
        const count = itemCount || 8;
        const emojis = getRandomItems(Object.keys(EMOJI_MAP), count);
        const items = emojis.map((emoji, index) => ({
            name: `${EMOJI_MAP[emoji]} ${emoji}`,
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
    const scenes = [
        {
            scene: "Güneşli bir günde parkta çocuklar oynuyor. Kırmızı bir top, sarı bir kaydırak ve yeşil bir salıncak var. Bir köpek de çocukların yanında koşuyor.",
            questions: ["Top ne renkti?", "Parkta hangi oyuncaklar vardı?", "Çocukların yanında hangi hayvan vardı?"]
        },
        {
            scene: "Mutfak masasının üzerinde bir vazo içinde üç tane mavi çiçek var. Masada ayrıca bir elma ve iki tane portakal duruyor. Pencereden içeri güneş sızıyor.",
            questions: ["Vazoda kaç tane çiçek var?", "Masadaki meyveler nelerdir?", "Çiçekler ne renkti?"]
        },
        {
            scene: "Kumsalda büyük bir şemsiyenin altında oturan bir aile var. Çocuklar kumdan kale yapıyor. Denizde yelkenli bir tekne yüzüyor.",
            questions: ["Aile nerede oturuyor?", "Çocuklar ne yapıyor?", "Denizde ne yüzüyor?"]
        }
    ];

    const results: ImageComprehensionData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const selectedScene = getRandomItems(scenes, 1)[0];
        results.push({
            title: "Resme Dikkat (Hızlı Mod)",
            instruction: "Metni oku, zihninde canlandır ve detayları hatırla.",
            pedagogicalNote: "Sözel bilgiyi görselleştirebilme ve detay hatırlama.",
            memorizeTitle: "Metni Oku ve Canlandır",
            testTitle: "Soruları Cevapla",
            sceneDescription: selectedScene.scene,
            imageBase64: "", // No image in fast mode
            questions: selectedScene.questions
        });
    }
    return results;
};


export const generateOfflineCharacterMemory = async (options: GeneratorOptions): Promise<CharacterMemoryData[]> => {
    const {itemCount, worksheetCount, memorizeRatio} = options;
    const adjectives = ['Mutlu', 'Üzgün', 'Hızlı', 'Yavaş', 'Büyük', 'Küçük', 'Renkli', 'Komik', 'Kızgın', 'Şaşkın'];
    const results: CharacterMemoryData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const count = itemCount || 8;
        const memorizeCount = Math.floor(count * ((memorizeRatio || 50) / 100));
        const allEmojis = getRandomItems(Object.keys(EMOJI_MAP), count);
        const allItems = allEmojis.map(emoji => ({
            description: `${getRandomItems(adjectives, 1)[0]} ${EMOJI_MAP[emoji]} ${emoji}`
        }));
        
        results.push({
            title: 'Karakter Hafıza (Hızlı Mod)',
            instruction: "Karakterleri ve özelliklerini ezberle.",
            pedagogicalNote: "Sıfat-isim tamlamalarıyla ilişkilendirilmiş hafıza çalışması.",
            memorizeTitle: 'Karakterleri Ezberle',
            testTitle: 'Doğru Karakterleri İşaretle',
            charactersToMemorize: allItems.slice(0, memorizeCount),
            testCharacters: shuffle(allItems)
        });
    }
    return results;
};

export const generateOfflineStroopTest = async (options: GeneratorOptions): Promise<StroopTestData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: StroopTestData[] = [];
    const colors = COLORS.filter(c => c.css !== '#f0f0f0' && c.css !== 'silver' && c.css !== 'beige');

    for (let i = 0; i < worksheetCount; i++) {
        const items = Array.from({ length: itemCount || 20 }).map(() => {
            const textObj = getRandomItems(colors, 1)[0];
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
    const {itemCount, worksheetCount, difficulty} = options;
    const results: ChaoticNumberSearchData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const count = itemCount || 50;
        const range = {start: 1, end: count};
        const targetNumbers = Array.from({length: range.end}, (_,k) => k+1);
        
        let distractorCount = count;
        if(difficulty === 'Zor') distractorCount = Math.floor(count * 1.5);
        if(difficulty === 'Uzman') distractorCount = count * 2;
        
        const distractorNumbers = Array.from({length: distractorCount}, () => getRandomInt(range.end+1, range.end + count));
        
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
};
