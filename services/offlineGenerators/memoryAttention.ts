
import { GeneratorOptions, WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData, ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData, WordMemoryItem } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, EMOJIS, COLORS, TR_VOCAB, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

export const generateOfflineWordMemory = async (options: GeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, memorizeRatio } = options;
    const results: WordMemoryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const count = itemCount || 12;
        // Increase ratio slightly for better UX in dual page
        const memorizeCount = Math.max(4, Math.floor(count * 0.6)); 
        
        let pool = getWordsForDifficulty(difficulty, topic || 'Rastgele');
        if (pool.length < count * 2) pool = [...pool, ...getWordsForDifficulty(difficulty, 'Rastgele')];
        
        pool = shuffle(pool);
        
        // Select targets to memorize
        const targets = pool.slice(0, memorizeCount);
        // Select distractors for the test phase
        const distractors = pool.slice(memorizeCount, memorizeCount + (count - memorizeCount));
        
        // Test list includes targets + distractors, shuffled
        const testList = shuffle([...targets, ...distractors]);
        
        results.push({
            title: 'Kelime Hafıza',
            instruction: "1. Aşama: Kelimeleri ezberle. 2. Aşama: Test kısmında hatırladıklarını işaretle.",
            pedagogicalNote: "Kısa süreli işitsel-sözel bellek kapasitesini ölçer.",
            memorizeTitle: 'Bunları Aklında Tut',
            testTitle: 'Aklında Tuttuklarını İşaretle',
            imagePrompt: 'Hafıza',
            wordsToMemorize: targets.map(text => ({ text })),
            testWords: testList.map(text => ({ text }))
        });
    }
    return results;
};


export const generateOfflineVisualMemory = async (options: GeneratorOptions): Promise<VisualMemoryData[]> => {
    const { itemCount, worksheetCount, memorizeRatio } = options;
    const results: VisualMemoryData[] = [];
    
    const allEmojis = Object.keys(EMOJI_MAP);
    
    for (let i = 0; i < worksheetCount; i++) {
        const count = itemCount || 12;
        const memorizeCount = Math.max(4, Math.floor(count * 0.6));
        
        const pool = shuffle(allEmojis);
        const targets = pool.slice(0, memorizeCount);
        const distractors = pool.slice(memorizeCount, count); // Total needed
        
        const itemsToMemorize = targets.map(emoji => ({
            description: `${EMOJI_MAP[emoji]} ${emoji}`,
            imagePrompt: emoji 
        }));
        
        const testItems = shuffle([...targets, ...distractors]).map(emoji => ({
            description: `${EMOJI_MAP[emoji]} ${emoji}`,
            imagePrompt: emoji
        }));
        
        results.push({
            title: 'Görsel Hafıza',
            instruction: "Görselleri dikkatlice incele. Sayfayı çevirince sadece gördüklerini bul.",
            pedagogicalNote: "Görsel tanıma belleği ve detaylara dikkat becerisini geliştirir.",
            memorizeTitle: 'Bunları Aklında Tut',
            testTitle: 'Aklında Tuttuklarını İşaretle',
            imagePrompt: 'Görsel Hafıza',
            itemsToMemorize,
            testItems
        });
    }
    return results;
};


export const generateOfflineNumberSearch = async (options: GeneratorOptions): Promise<NumberSearchData[]> => {
    const { worksheetCount, difficulty, itemCount } = options;
    const results: NumberSearchData[] = [];
    const count = itemCount || 30; // Increased to 30

    for (let i = 0; i < worksheetCount; i++) {
        let range = { start: 1, end: count };
        if (difficulty === 'Orta') range = { start: 10, end: 10 + count };
        if (difficulty === 'Zor') range = { start: 100, end: 100 + count };

        const targetNumbers = Array.from({ length: count }, (_, k) => k + range.start);
        const distractors = Array.from({ length: count * 3 }, () => {
             const base = getRandomInt(range.start, range.end + 20);
             return base;
        });

        results.push({ 
            title: `Sayı Avı (${difficulty})`, 
            instruction: `${range.start}'den ${range.end}'e kadar olan sayıları sırasıyla bulup daire içine al.`,
            pedagogicalNote: "Sıralı dikkat, görsel tarama ve takip becerisi.",
            imagePrompt: 'Sayılar',
            numbers: shuffle([...targetNumbers, ...distractors]), 
            range: range 
        });
    }
    return results;
};


export const generateOfflineFindTheDuplicateInRow = async (options: GeneratorOptions): Promise<FindDuplicateData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: FindDuplicateData[] = [];
    const cols = difficulty === 'Başlangıç' ? 10 : (difficulty === 'Orta' ? 15 : 20);

    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount || 16 }, () => { // Increased to 16
            let pool = turkishAlphabet.split('');
            if (difficulty === 'Zor') pool = ['b','d','p','q','m','n','u','ü']; 
            
            const rowChars = Array.from({length: cols}, () => getRandomItems(pool, 1)[0]);
            const target = getRandomItems(pool, 1)[0];
            
            // Ensure unique pair
            const idx1 = getRandomInt(0, Math.floor(cols/2));
            const idx2 = getRandomInt(Math.floor(cols/2) + 1, cols - 1);
            
            // Cleanup accidental duplicates of target first
            for(let k=0; k<cols; k++) if(rowChars[k] === target) rowChars[k] = getRandomItems(pool.filter(c=>c!==target),1)[0];
            
            rowChars[idx1] = target;
            rowChars[idx2] = target;
            
            return rowChars;
        });
        
        results.push({ 
            title: 'İkiliyi Bul', 
            instruction: "Her satırda iki kez yazılmış olan karakteri bulun.",
            pedagogicalNote: "Odaklanmış dikkat ve görsel ayrım.",
            imagePrompt: 'Dikkat',
            rows 
        });
    }
    return results;
};


export const generateOfflineLetterGridTest = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize, difficulty, worksheetCount } = options;
    const results: LetterGridTestData[] = [];
    
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 20; // Increased default grid size
        const targets = ['a', 'b', 'd', 'g'];
        const pool = turkishAlphabet.split('');
        
        const grid: string[][] = [];
        // Generate dense grid
        for(let r=0; r<size; r++){
            const row: string[] = [];
            for(let c=0; c<25; c++){ // Wide rows for print
                if (Math.random() < 0.25) {
                    row.push(getRandomItems(targets, 1)[0]);
                } else {
                    row.push(getRandomItems(pool.filter(x => !targets.includes(x)), 1)[0]);
                }
            }
            grid.push(row);
        }

        results.push({
            title: `Harf Izgara Testi`,
            instruction: `Satırları soldan sağa tarayarak "${targets.join(', ')}" harflerini bul ve üzerini çiz.`,
            pedagogicalNote: "Seçici dikkat ve sürdürülebilir dikkat becerisi.",
            imagePrompt: 'Harfler',
            grid: grid,
            targetLetters: targets
        });
    }
    return results;
};


export const generateOfflineBurdonTest = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    // Specialized high density grid
    const res = await generateOfflineLetterGridTest({ ...options, gridSize: 20, targetLetters: 'a,b,d,g' });
    return res.map(d => ({
        ...d, 
        title: 'BURDON DİKKAT TESTİ',
        instruction: 'Her satırı soldan sağa doğru inceleyin. "a", "b", "d" ve "g" harflerini gördüğünüzde üzerini çizin.',
        pedagogicalNote: 'Dikkat yoğunluğu ve kalitesini ölçen standart nöropsikolojik test.',
        imagePrompt: 'Test'
    }));
};

// Fix: Removed duplicate generateOfflineFindLetterPair as it is now centrally managed in newActivities.ts

export const generateOfflineTargetSearch = async (options: GeneratorOptions): Promise<TargetSearchData[]> => {
    const { gridSize, difficulty, worksheetCount, targetChar, distractorChar, itemCount } = options;
    const results: TargetSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 15;
        const target = targetChar || 'd';
        const distractor = distractorChar || 'b';
        
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => Math.random() > 0.3 ? distractor : target));
        
        results.push({ 
            title: 'Hedef Avı', 
            instruction: `Sadece "${target}" karakterlerini bul. Çeldirici "${distractor}" karakterlerine dikkat et.`,
            pedagogicalNote: "Zorlu zemin üzerinde şekil ayırt etme (Figure-Ground Perception).",
            imagePrompt: 'Hedef',
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
            name: `${EMOJI_MAP[emoji]}`,
            color: COLORS[index % COLORS.length].css,
            imagePrompt: emoji
        }));
        results.push({
            title: 'Renk Çemberi Hafızası',
            instruction: "Renk çemberindeki nesnelerin yerini ve rengini ezberle.",
            pedagogicalNote: "Görsel-mekansal hafıza ve renk eşleştirme.",
            memorizeTitle: 'Ezberle',
            testTitle: 'Hatırla ve Yerleştir',
            imagePrompt: 'Renk',
            items
        });
    }
    return results;
};

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
        }
    ];

    const results: ImageComprehensionData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const selectedScene = getRandomItems(scenes, 1)[0];
        results.push({
            title: "Resme Dikkat",
            instruction: "1. Aşama: Metni oku ve sahneyi zihninde canlandır.",
            pedagogicalNote: "Sözel bilgiyi görselleştirebilme ve detay hatırlama.",
            memorizeTitle: "Metni Oku ve Canlandır",
            testTitle: "Soruları Cevapla",
            sceneDescription: selectedScene.scene,
            imagePrompt: 'Resim',
            imageBase64: "", 
            questions: selectedScene.questions
        });
    }
    return results;
};


export const generateOfflineCharacterMemory = async (options: GeneratorOptions): Promise<CharacterMemoryData[]> => {
    const {itemCount, worksheetCount, memorizeRatio} = options;
    const adjectives = ['Mutlu', 'Üzgün', 'Hızlı', 'Yavaş', 'Büyük', 'Küçük', 'Renkli', 'Komik'];
    const results: CharacterMemoryData[] = [];
    const peopleEmojis = ['👮', '👩‍⚕️', '👨‍🍳', '👩‍🚀', '🧙‍♂️', '🧛‍♀️', '🧜‍♂️', '🧚‍♀️', '🧞‍♂️', '🦹‍♀️'];

    for(let i=0; i<worksheetCount; i++){
        const count = itemCount || 8;
        const memorizeCount = Math.max(4, Math.floor(count * 0.6));
        
        const pool = shuffle(peopleEmojis);
        const targets = pool.slice(0, memorizeCount);
        const distractors = pool.slice(memorizeCount, count);
        
        const itemsToMemorize = targets.map(emoji => ({
            description: `${getRandomItems(adjectives, 1)[0]} Karakter`,
            imagePrompt: emoji 
        }));
        
        const testItems = shuffle([...targets, ...distractors]).map(emoji => ({
            description: '?',
            imagePrompt: emoji
        }));
        
        results.push({
            title: 'Karakter Hafıza',
            instruction: "Karakterleri ve özelliklerini ezberle.",
            pedagogicalNote: "Yüz tanıma ve ilişkilendirme hafızası.",
            memorizeTitle: 'Karakterleri Ezberle',
            testTitle: 'Tanıdık Karakterleri İşaretle',
            imagePrompt: 'Karakter',
            charactersToMemorize: itemsToMemorize,
            testCharacters: testItems
        });
    }
    return results;
};

// IMPROVED STROOP TEST GENERATOR (A4 FILLER)
export const generateOfflineStroopTest = async (options: GeneratorOptions): Promise<StroopTestData[]> => {
    const { worksheetCount } = options;
    const results: StroopTestData[] = [];
    
    // Expanded color map for variety
    const colorMap = [
        { name: 'KIRMIZI', css: '#ef4444' }, 
        { name: 'MAVİ', css: '#3b82f6' }, 
        { name: 'YEŞİL', css: '#22c55e' }, 
        { name: 'SARI', css: '#facc15' }, // Slightly darker yellow for visibility
        { name: 'MOR', hex: '#a855f7' },
        { name: 'SİYAH', css: '#000000' },
        { name: 'TURUNCU', css: '#f97316' },
        { name: 'PEMBE', css: '#ec4899' }
    ];

    // Standard A4 Grid calculation: 
    // 4 Columns x 12 Rows = 48 Items looks standard and professional.
    const TOTAL_ITEMS = 48;

    for (let i = 0; i < worksheetCount; i++) {
        const items = Array.from({ length: TOTAL_ITEMS }).map(() => {
            const textObj = getRandomItems(colorMap, 1)[0];
            // Ensure conflict (interference)
            // Filter out the matching color to guarantee mismatched ink
            const conflictPool = colorMap.filter(c => c.name !== textObj.name);
            const colorObj = getRandomItems(conflictPool, 1)[0];
            
            return { text: textObj.name, color: colorObj.css };
        });
        
        results.push({ 
            title: 'STROOP TESTİ (Renk Söyleme)', 
            instruction: "DİKKAT: Yazılan kelimeyi okumayın! Kelimenin yazıldığı RENGİ yüksek sesle söyleyin.",
            pedagogicalNote: "Dürtü kontrolü (inhibisyon), seçici dikkat and bilişsel esneklik değerlendirmesi.",
            imagePrompt: 'Renkler',
            items 
        });
    }
    return results;
};


export const generateOfflineChaoticNumberSearch = async (options: GeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
    const {itemCount, worksheetCount, difficulty} = options;
    const results: ChaoticNumberSearchData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const count = itemCount || 40;
        const range = {start: 1, end: count};
        
        const targets = Array.from({length: count}, (_,k) => k+1);
        const distractorsCount = difficulty === 'Zor' ? count : Math.floor(count/2);
        const distractors = Array.from({length: distractorsCount}, () => getRandomInt(count+1, 99));
        
        const allNumbers = shuffle([...targets, ...distractors]);
        
        const numbers = allNumbers.map(value => ({
            value,
            x: getRandomInt(5, 90), // Percent bounds
            y: getRandomInt(10, 90), // Percent bounds (leave top space for targets)
            size: getRandomInt(10, 25) / 10, // 1.0 to 2.5 REM
            rotation: getRandomInt(-180, 180),
            color: 'black'
        }));
        
        results.push({
            title: 'Kaotik Sayı Avı',
            instruction: `1'den ${count}'a kadar olan sayıları sırasıyla bul ve daire içine al.`,
            pedagogicalNote: "Karmaşık görsel zeminde sıralı takip, şekil-zemin ayrımı and görsel esneklik.",
            imagePrompt: 'Kaos',
            prompt: '',
            numbers,
            range
        })
    }
    return results;
};
