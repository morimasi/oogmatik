
import { GeneratorOptions, VisualMemoryData, LetterGridTestData, StroopTestData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, turkishAlphabet, EMOJI_MAP, COLORS, VISUALLY_SIMILAR_CHARS } from './helpers';

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
