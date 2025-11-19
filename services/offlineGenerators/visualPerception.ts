import { GeneratorOptions, FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, RomanNumeralConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, WordConnectData, CoordinateCipherData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, OddOneOutData, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData, ShapeCountingData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, SHAPE_TYPES, TR_VOCAB } from './helpers';

export const generateOfflineFindTheDifference = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: FindTheDifferenceData[] = [];
    const pool = [...TR_VOCAB.confusing_words.flat(), ...getWordsForDifficulty(difficulty, topic)];
    
    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount }).map(() => {
            const baseWord = getRandomItems(pool, 1)[0];
            const correctIndex = getRandomInt(0, 3);
            let differentWord = '';
            const chars = baseWord.split('');

            if (difficulty === 'Başlangıç' && chars.length > 1) { [chars[0], chars[chars.length - 1]] = [chars[chars.length - 1], chars[0]]; differentWord = chars.join(''); } 
            else if (difficulty === 'Orta' && chars.length > 2) { const pos = getRandomInt(1, chars.length - 2); chars[pos] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)]; differentWord = chars.join(''); } 
            else { 
                if (baseWord.includes('b')) differentWord = baseWord.replace('b', 'd');
                else if (baseWord.includes('d')) differentWord = baseWord.replace('d', 'b');
                else if (baseWord.includes('p')) differentWord = baseWord.replace('p', 'q');
                else if (baseWord.includes('q')) differentWord = baseWord.replace('q', 'p');
                else if (chars.length > 1) { const pos = getRandomInt(0, chars.length - 1); chars[pos] = getRandomItems(turkishAlphabet.split('').filter(c => c !== chars[pos]), 1)[0]; differentWord = chars.join(''); } 
                else { differentWord = baseWord + 'a'; }
            }
            if (!differentWord || differentWord === baseWord) differentWord = baseWord + 'x';

            const items = Array(4).fill(baseWord);
            items[correctIndex] = differentWord;
            return { items, correctIndex };
        });
        results.push({ title: `Farklı Olanı Bul (${difficulty})`, rows });
    }
    return results;
};

export const generateOfflineWordComparison = async (options: GeneratorOptions): Promise<WordComparisonData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const results: WordComparisonData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const wordPool = getWordsForDifficulty(difficulty, topic);
        const commonWords = getRandomItems(wordPool, 10);
        const list1_diff = getRandomItems(wordPool.filter(w => !commonWords.includes(w)), 3);
        const list2_diff = getRandomItems(wordPool.filter(w => !commonWords.includes(w) && !list1_diff.includes(w)), 3);
        results.push({
            title: 'Kelime Karşılaştırma',
            box1Title: 'Kutu 1',
            box2Title: 'Kutu 2',
            wordList1: shuffle([...commonWords, ...list1_diff]),
            wordList2: shuffle([...commonWords, ...list2_diff])
        });
    }
    return results;
};


export const generateOfflineShapeMatching = async (options: GeneratorOptions): Promise<ShapeMatchingData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: ShapeMatchingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const shapeCount = difficulty === 'Başlangıç' ? 2 : (difficulty === 'Orta' ? 3 : 4);
        const leftColumn = Array.from({ length: itemCount }, (_, k) => ({ id: k + 1, shapes: getRandomItems(SHAPE_TYPES, shapeCount) }));
        const rightColumn = shuffle(leftColumn.map((item, index) => ({ ...item, id: String.fromCharCode(65 + index) })));
        results.push({ title: 'Şekil Eşleştirme', leftColumn, rightColumn });
    }
    return results;
};


export const generateOfflineFindIdenticalWord = async (options: GeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: FindIdenticalWordData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const groups = getRandomItems(TR_VOCAB.confusing_words, itemCount).map(pair => ({ words: pair as [string, string] }));
        results.push({ title: 'Aynısını Bul', groups });
    }
    return results;
};

export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: GridDrawingData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const drawings: GridDrawingData['drawings'] = Array.from({length: itemCount}).map(() => {
            return { lines: [[ [getRandomInt(0, gridSize-1),getRandomInt(0, gridSize-1)],[getRandomInt(0, gridSize-1),getRandomInt(0, gridSize-1)] ]] };
        });
        results.push({ title: 'Ayna Çizimi', gridDim: gridSize || 8, drawings });
    }
    return results;
};

export const generateOfflineSymbolCipher = async (options: GeneratorOptions): Promise<SymbolCipherData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: SymbolCipherData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const cipherKey = getRandomItems(SHAPE_TYPES, 8).map((shape, index) => ({ shape, letter: turkishAlphabet[index] }));
        const words = getRandomItems(getWordsForDifficulty(difficulty), itemCount);
        const wordsToSolve = words.map(word => {
            const shapeSequence: any[] = [];
            for (const letter of word) {
                const keyItem = cipherKey.find(item => item.letter === letter);
                if (keyItem) shapeSequence.push(keyItem.shape);
            }
            return { shapeSequence, wordLength: word.length };
        }).filter(w => w.shapeSequence.length > 0);
        results.push({ title: 'Şifre Çözme', cipherKey, wordsToSolve });
    }
    return results;
};


export const generateOfflineBlockPainting = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    return [{
        title: 'Blok Boyama',
        prompt: 'Verilen blokları kullanarak deseni doğru renklere boyayın.',
        grid: {rows: 8, cols: 8},
        shapes: [
            { color: '#FF0000', pattern: [[1,1],[1,1]] }, // Square
            { color: '#00FF00', pattern: [[1,1,1,1]] }, // Line
            { color: '#0000FF', pattern: [[0,1,0],[1,1,1]] } // T-shape
        ]
    }];
}

export const generateOfflineVisualOddOneOut = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    return [{
        title: 'Sözcük Avı (Farklı Şekil)',
        prompt: 'Her satırda diğerlerinden farklı olan şekli bulun.',
        rows: [{ items: [
            { segments: [true,true,true,false,true,true,true] },
            { segments: [true,true,true,false,true,true,true] },
            { segments: [true,false,true,false,true,true,true] }, // different
            { segments: [true,true,true,false,true,true,true] },
        ]}]
    }]
}

export const generateOfflineShapeCounting = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    return [{
        title: 'Kaç Tane Üçgen Var?',
        prompt: 'Karmaşık şekillerin içine gizlenmiş üçgenleri sayın.',
        figures: [{ svgPaths: [ {d: 'M 10 80 L 50 10 L 90 80 Z', fill: '#ffcccc'}, {d: 'M 10 30 L 90 30 L 50 80 Z', fill: '#ccccff'} ]}]
    }];
}

export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const {itemCount, worksheetCount, gridSize, difficulty} = options;
    const results: SymmetryDrawingData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const dim = gridSize || 8;
        const dotCount = difficulty === 'Başlangıç' ? 3 : difficulty === 'Orta' ? 5 : difficulty === 'Zor' ? 7 : 9;
        const dots = Array.from({length: dotCount}).map(() => ({x: getRandomInt(0, dim/2 - 1), y: getRandomInt(0, dim-1)}));
        results.push({
            title: 'Noktalarla Dans (Simetri)',
            prompt: 'Verilen desenin simetri eksenine göre yansımasını çizin.',
            gridDim: dim,
            dots,
            axis: 'vertical'
        });
    }
    return results;
}

export const generateOfflineFindDifferentString = async (options: GeneratorOptions): Promise<FindDifferentStringData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: FindDifferentStringData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const rows = Array.from({length:itemCount}).map(() => {
            const base = "VWN";
            const diff = "VNW";
            const items = shuffle([base, base, base, diff]);
            return {items};
        });
        results.push({
            title: 'Farklı Olanı Bulma',
            prompt: 'Aşağıdaki sütunlarda yer alan harf sıralamasında VWN’den farklı olan harf grubunu işaretleyelim.',
            rows
        });
    }
    return results;
};

export const generateOfflineDotPainting = async (options: GeneratorOptions): Promise<DotPaintingData[]> => {
    return [{
        title: 'Nokta Boyama',
        prompt1: 'Noktaların bulunduğu alanları boyayarak gizli şekli ortaya çıkaralım.',
        prompt2: 'Örnek: Ev',
        svgViewBox: '0 0 100 100',
        gridPaths: [],
        dots: [{cx: 50, cy: 50, color: 'red'}, {cx: 60, cy: 50, color: 'red'}]
    }];
}

export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: AbcConnectData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const dim = gridSize || 6;
        const letters = ['A','B','C','D'];
        const points = letters.flatMap(l => ([
            {letter: l, x: getRandomInt(0, dim-1), y: getRandomInt(0, dim-1)},
            {letter: l, x: getRandomInt(0, dim-1), y: getRandomInt(0, dim-1)}
        ]));
        results.push({
            title: 'ABC Bağlama',
            prompt: 'Aynı harfleri birleştirin.',
            puzzles: [{id: 1, gridDim: dim, points}]
        });
    }
    return results;
}

export const generateOfflineWordConnect = async (options: GeneratorOptions): Promise<WordConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: WordConnectData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const pairs = getRandomItems(TR_VOCAB.synonyms, itemCount/2);
// FIX: Added explicit type for 'p' to resolve type inference issue.
        const points = pairs.flatMap((p: { word: string; synonym: string; }, idx) => ([
            {word: p.word, pairId: idx, x: getRandomInt(1,4), y: getRandomInt(1,9)},
            {word: p.synonym, pairId: idx, x: getRandomInt(6,9), y: getRandomInt(1,9)},
        ]));
        results.push({title: 'Kelime Bağlama', prompt: 'Anlamca ilişkili kelimeleri çizgilerle birleştirin.', gridDim: gridSize || 10, points: shuffle(points)});
    }
    return results;
}

export const generateOfflineCoordinateCipher = async (options: GeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { gridSize, itemCount, worksheetCount } = options;
    const results: CoordinateCipherData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 8;
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));
        const wordsToFind = getRandomItems(getWordsForDifficulty('Orta'), itemCount);
        const password = getRandomItems(getWordsForDifficulty('Başlangıç'), 1)[0] || 'şifre';
        const cipherCoordinates: string[] = [];
        for(let char of password) {
            const r = getRandomInt(0, size - 1);
            const c = getRandomInt(0, size - 1);
            grid[r][c] = char;
            cipherCoordinates.push(`${String.fromCharCode(65 + r)}${c+1}`);
        }
        results.push({ title: 'Gizemli Bulmaca', grid, wordsToFind, cipherCoordinates });
    }
    return results;
};

export const generateOfflineProfessionConnect = async (options: GeneratorOptions): Promise<ProfessionConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: ProfessionConnectData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const professions = getRandomItems(TR_VOCAB.jobs, itemCount);
        const points = professions.map(p => ({
            label: p,
            imageDescription: p,
            x: getRandomInt(0, (gridSize || 10)-1),
            y: getRandomInt(0, (gridSize || 10)-1)
        }));
        results.push({ title: 'Kelime Bağlama (Meslekler)', prompt: 'Meslekleri ilgili görsellerle eşleştirin.', gridDim: gridSize || 10, points });
    }
    return results;
}
export const generateOfflineMatchstickSymmetry = async (options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
     const puzzles = [{number: 3, lines: [{x1:1, y1:1, x2:2, y2:1}]}]; // Simplified
     return Array(options.worksheetCount).fill({ title: 'Kibrit İşlemleri (Simetri)', prompt: 'Kibritlerle yapılmış şeklin simetriğini çizin.', puzzles });
}
export const generateOfflineVisualOddOneOutThemed = async (options: GeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const {itemCount, worksheetCount, theme} = options;
    const results: VisualOddOneOutThemedData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const rows = Array.from({length: itemCount}).map(() => {
            const themeToUse = theme || 'Hayvanlar';
            const otherTheme = theme === 'Hayvanlar' ? 'Meyveler' : 'Hayvanlar';
            const items = [...getRandomItems((TR_VOCAB as any)[themeToUse], 3), getRandomItems((TR_VOCAB as any)[otherTheme], 1)[0]];
            return {
                theme: themeToUse,
                // FIX: Explicitly typed 'item' to resolve 'unknown' type from complex type inference on TR_VOCAB.
                items: shuffle(items).map((item: string) => ({description: item})),
                oddOneOutIndex: 0 // Placeholder, UI should handle this
            }
        });
        results.push({ title: 'Farklı Özelliği Bulma (Tematik)', prompt: 'Her meslek grubunda, konuyla ilgisiz olan görseli bulun.', rows});
    }
    return results;
}
export const generateOfflinePunctuationColoring = async (options: GeneratorOptions): Promise<PunctuationColoringData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Görsel Boyama (Noktalama)',
        prompt: 'Cümlelere uygun noktalama işaretlerini bularak resmi boyayın.',
        sentences: [
            {text: 'Eyvah, kedi ağaca çıktı', color: '#FF0000', correctMark: '!'},
            {text: 'Okula geldin mi', color: '#0000FF', correctMark: '?'},
        ]
    });
}
export const generateOfflineSynonymAntonymColoring = async (options: GeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
     const pair = getRandomItems(TR_VOCAB.antonyms, 1)[0];
     return Array(options.worksheetCount).fill({
         title: 'Görsel Boyama (Eş/Zıt Anlamlı)', prompt: 'Doğru eş/zıt anlamlı kelimeyi bularak resmi boyayın.',
         colorKey: [{text: `${pair.word}'in zıt anlamlısı`, color: '#FF0000'}],
         wordsOnImage: [{word: pair.antonym, x: 50, y: 50}]
     });
}

export const generateOfflineOddOneOut = async (options: GeneratorOptions): Promise<OddOneOutData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: OddOneOutData[] = [];
    const categories = Object.keys(TR_VOCAB).filter(k => Array.isArray((TR_VOCAB as any)[k]) && typeof (TR_VOCAB as any)[k][0] === 'string');
     for(let i=0; i < worksheetCount; i++){
        const groups = Array.from({length: itemCount}).map(() => {
            const [cat1, cat2] = getRandomItems(categories, 2);
            const goodWords = getRandomItems((TR_VOCAB as any)[cat1] as string[], 3);
            const badWord = getRandomItems((TR_VOCAB as any)[cat2] as string[], 1);
            return { words: shuffle([...goodWords, ...badWord]) };
        });
        results.push({title: 'Farklı Olanı Bul', groups})
     }
    return results;
}

export const generateOfflineThematicOddOneOut = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    const { itemCount, worksheetCount, theme } = options;
    const results: ThematicOddOneOutData[] = [];
    const validCategories = Object.keys(TR_VOCAB).filter(k => Array.isArray((TR_VOCAB as any)[k]) && typeof (TR_VOCAB as any)[k][0] === 'string' && !k.endsWith('_words') && !k.includes('confusing'));

    for (let i = 0; i < worksheetCount; i++) {
        const actualTheme = (theme && theme !== 'Rastgele' && validCategories.includes(theme.toLowerCase())) ? theme.toLowerCase() : getRandomItems(validCategories, 1)[0];
        const otherCategory = getRandomItems(validCategories.filter(c => c !== actualTheme), 1)[0];

        const rows = Array.from({ length: itemCount }).map(() => {
            const themeWords = getRandomItems((TR_VOCAB as any)[actualTheme] as string[], 3);
            const oddWord = getRandomItems((TR_VOCAB as any)[otherCategory] as string[], 1)[0];
            return { words: shuffle([...themeWords, oddWord]), oddWord };
        });

        results.push({
            title: `Tematik Farklı Olanı Bul`,
            prompt: `Her satırda '${actualTheme}' temasına uymayan kelimeyi bulun.`,
            theme: actualTheme,
            rows,
            sentencePrompt: "Bulduğun farklı kelimelerle bir cümle yaz."
        });
    }
    return results;
};

export const generateOfflineThematicOddOneOutSentence = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    const res = await generateOfflineThematicOddOneOut(options);
    return res.map(r => ({...r, title: 'Şifre Bul (Farklı Kelime)'}))
}

export const generateOfflineColumnOddOneOutSentence = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
     const {worksheetCount} = options;
     const results: ColumnOddOneOutSentenceData[] = [];
     for(let i=0; i<worksheetCount; i++){
         results.push({
             title: 'Farklı Özelliği Bulma (Sütun)', prompt: 'Her sütunda farklı olan kelimeyi bulup cümle kurun.',
             columns: Array(3).fill(0).map(() => ({words: ['kedi', 'köpek', 'masa'], oddWord: 'masa'})),
             sentencePrompt: 'Farklı kelimelerle cümle kur.'
         });
     }
     return results;
}

export const generateOfflinePunctuationMaze = async (options: GeneratorOptions): Promise<PunctuationMazeData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Labirent (Noktalama)', prompt: 'Doğru kuralı bularak labirentte doğru yolu bulun.', punctuationMark: '.', rules: [] });
}

export const generateOfflinePunctuationPhoneNumber = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Bul Bakalım (Telefon Numarası)', prompt: 'Noktalama ipuçlarını çözerek gizli telefon numarasını bulun.', instruction: '', clues: [], solution: [] });
}