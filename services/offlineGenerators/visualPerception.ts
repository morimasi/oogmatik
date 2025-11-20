
import { GeneratorOptions, FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, WordConnectData, CoordinateCipherData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeType } from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, SHAPE_TYPES, TR_VOCAB, COLORS } from './helpers';

// --- Helper for Grid Pattern Generation ---
const generateRandomPattern = (dim: number, density: number): number[][][] => {
    const lines: number[][][] = [];
    for (let i = 0; i < dim * density; i++) {
        const x1 = getRandomInt(0, dim);
        const y1 = getRandomInt(0, dim);
        // Try to make a connected line or close proximity
        const direction = getRandomInt(0, 3); // 0: right, 1: down, 2: diag-down, 3: diag-up
        let x2 = x1, y2 = y1;
        if (direction === 0 && x1 < dim) x2++;
        else if (direction === 1 && y1 < dim) y2++;
        else if (direction === 2 && x1 < dim && y1 < dim) { x2++; y2++; }
        else if (direction === 3 && x1 < dim && y1 > 0) { x2++; y2--; }
        
        // Avoid dots (zero length lines)
        if (x1 !== x2 || y1 !== y2) {
             lines.push([[x1, y1], [x2, y2]]);
        }
    }
    return lines;
};

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

            // Algorithm to create subtle differences
            if (difficulty === 'Başlangıç' && chars.length > 1) { 
                // Swap first/last
                [chars[0], chars[chars.length - 1]] = [chars[chars.length - 1], chars[0]]; 
                differentWord = chars.join(''); 
            } else if (difficulty === 'Orta' && chars.length > 2) { 
                // Change middle char
                const pos = getRandomInt(1, chars.length - 2); 
                chars[pos] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)]; 
                differentWord = chars.join(''); 
            } else { 
                // Visual similarity swaps
                if (baseWord.includes('b')) differentWord = baseWord.replace('b', 'd');
                else if (baseWord.includes('d')) differentWord = baseWord.replace('d', 'b');
                else if (baseWord.includes('p')) differentWord = baseWord.replace('p', 'q');
                else if (baseWord.includes('q')) differentWord = baseWord.replace('q', 'p');
                else if (baseWord.includes('m')) differentWord = baseWord.replace('m', 'n');
                else if (baseWord.includes('n')) differentWord = baseWord.replace('n', 'm');
                else if (chars.length > 1) { 
                    const pos = getRandomInt(0, chars.length - 1); 
                    chars[pos] = getRandomItems(turkishAlphabet.split('').filter(c => c !== chars[pos]), 1)[0]; 
                    differentWord = chars.join(''); 
                } else { 
                    differentWord = baseWord + '.'; 
                }
            }
            
            if (!differentWord || differentWord === baseWord) differentWord = baseWord.split('').reverse().join('');

            const items = Array(4).fill(baseWord);
            items[correctIndex] = differentWord;
            return { 
                items, 
                correctIndex, 
                visualDistractionLevel: (difficulty === 'Uzman' ? 'high' : 'medium') as 'low' | 'medium' | 'high'
            };
        });
        results.push({ 
            title: `Farklı Olanı Bul (${difficulty})`, 
            instruction: "Her satırda, diğerlerinden farklı yazılmış veya görünen kelimeyi bulup işaretleyin.",
            pedagogicalNote: "Bu etkinlik görsel ayrım ve detaylara dikkat becerisini güçlendirir.",
            rows 
        });
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
            instruction: "İki kutuyu karşılaştırın ve sadece bir kutuda olup diğerinde olmayan kelimeleri bulun.",
            pedagogicalNote: "Görsel tarama ve kısa süreli bellek kullanımını destekler.",
            box1Title: 'Liste A',
            box2Title: 'Liste B',
            wordList1: shuffle([...commonWords, ...list1_diff]),
            wordList2: shuffle([...commonWords, ...list2_diff]),
            correctDifferences: [...list1_diff, ...list2_diff]
        });
    }
    return results;
};

export const generateOfflineShapeMatching = async (options: GeneratorOptions): Promise<ShapeMatchingData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: ShapeMatchingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const shapeCount = difficulty === 'Başlangıç' ? 2 : (difficulty === 'Orta' ? 3 : 4);
        const leftColumn = Array.from({ length: itemCount }, (_, k) => ({ 
            id: k + 1, 
            shapes: getRandomItems(SHAPE_TYPES, shapeCount),
            color: getRandomItems(COLORS, 1)[0].css
        }));
        // Deep copy for right column to avoid reference issues if we modify
        const rightColumn = shuffle(leftColumn.map((item, index) => ({ 
            id: String.fromCharCode(65 + index), 
            shapes: item.shapes,
            color: item.color 
        })));
        
        results.push({ 
            title: 'Şekil Eşleştirme', 
            instruction: "Sol sütundaki şekil gruplarını sağ sütundaki eşleriyle çizgilerle birleştirin.",
            pedagogicalNote: "Görsel form algısı ve eşleştirme becerisi çalışmasıdır.",
            leftColumn, 
            rightColumn,
            complexity: shapeCount
        });
    }
    return results;
};

export const generateOfflineFindIdenticalWord = async (options: GeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: FindIdenticalWordData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const groups = getRandomItems(TR_VOCAB.confusing_words, itemCount).map(pair => ({ 
            words: pair as [string, string],
            distractors: [pair[0] + 'a', pair[1].split('').reverse().join('')]
        }));
        results.push({ 
            title: 'Aynısını Bul', 
            instruction: "Verilen örneğin aynısı olan kelimeyi seçenekler arasından bulun.",
            pedagogicalNote: "Benzer uyaranlar arasından doğru olanı seçme (şekil-zemin) becerisi.",
            groups 
        });
    }
    return results;
};

export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const {itemCount, worksheetCount, gridSize, difficulty} = options;
    const results: GridDrawingData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const dim = gridSize || 6;
        const density = difficulty === 'Başlangıç' ? 1 : (difficulty === 'Orta' ? 2 : 3);
        
        const drawings = Array.from({length: itemCount}).map(() => {
            return { 
                lines: generateRandomPattern(dim, density) as [number, number][][],
                complexityLevel: difficulty
            };
        });
        results.push({ 
            title: 'Kare Çizim / Ayna Çizimi', 
            instruction: "Soldaki deseni sağdaki boş ızgaraya birebir aynı olacak şekilde çizin.",
            pedagogicalNote: "El-göz koordinasyonu ve uzamsal konumlandırma becerisini geliştirir.",
            gridDim: dim, 
            drawings 
        });
    }
    return results;
};

export const generateOfflineSymbolCipher = async (options: GeneratorOptions): Promise<SymbolCipherData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: SymbolCipherData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        // Create a unique key for this worksheet
        const cipherKey = getRandomItems(SHAPE_TYPES, 10).map((shape, index) => ({ 
            shape, 
            letter: turkishAlphabet[index], // a, b, c, ...
            color: '#000'
        }));
        
        // Generate words using only the letters available in our key
        const availableLetters = cipherKey.map(k => k.letter);
        const simpleWords = ['baba', 'baca', 'aba', 'caba', 'ede', 'fece'].filter(w => w.split('').every(l => availableLetters.includes(l)));
        
        // If no meaningful words fit the limited key, use random combinations
        const wordsToUse = simpleWords.length >= itemCount ? getRandomItems(simpleWords, itemCount) : Array.from({length: itemCount}, () => 
            Array.from({length: 4}, () => getRandomItems(availableLetters, 1)[0]).join('')
        );

        const wordsToSolve = wordsToUse.map(word => {
            const shapeSequence: any[] = [];
            for (const letter of word) {
                const keyItem = cipherKey.find(item => item.letter === letter);
                if (keyItem) shapeSequence.push(keyItem.shape);
            }
            return { shapeSequence, wordLength: word.length, answer: word };
        });

        results.push({ 
            title: 'Şekil Şifresi', 
            instruction: "Anahtar tablosunu kullanarak şekillerle yazılmış şifreli kelimeleri çözün.",
            pedagogicalNote: "Sembolik kodlama ve kod çözme becerisi, okuma-yazma temelli bilişsel süreçleri destekler.",
            cipherKey, 
            wordsToSolve 
        });
    }
    return results;
};

export const generateOfflineBlockPainting = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    const { worksheetCount } = options;
    const results: BlockPaintingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        // Generate a symmetric pattern (invader style)
        const pattern: number[][] = [];
        for(let r=0; r<8; r++) {
            const row: number[] = [];
            for(let c=0; c<4; c++) row.push(Math.random() > 0.5 ? 1 : 0);
            // Mirror the row
            pattern.push([...row, ...row.slice().reverse()]);
        }

        results.push({
            title: 'Blok Boyama (Piksel Sanatı)',
            instruction: "Verilen renkli blokları kullanarak deseni oluşturun veya desene göre kareleri boyayın.",
            pedagogicalNote: "Görsel bütünleme ve parça-bütün ilişkisi kurma becerisi.",
            grid: {rows: 8, cols: 8},
            targetPattern: pattern,
            shapes: [
                { id: 1, color: '#3B82F6', pattern: [[1]], count: pattern.flat().filter(x => x===1).length }, // Simple 1x1 blocks for simplicity in fast mode
            ]
        });
    }
    return results;
}

export const generateOfflineVisualOddOneOut = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { worksheetCount, itemCount } = options;
    const results: VisualOddOneOutData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const rows = Array.from({length: itemCount}).map(() => {
            const correctIndex = getRandomInt(0, 3);
            // Logic: 3 items are closed shapes (square), 1 is open (U-shape) logic is simulated by segments
            const standard = [true, true, true, true, true, true, true]; // "8" shape
            const odd = [true, true, false, true, true, true, true]; // "0" shape (middle segment off)
            
            const items = Array(4).fill(null).map((_, idx) => ({
                segments: idx === correctIndex ? odd : standard
            }));
            
            return { 
                items, 
                correctIndex, 
                reason: "Diğerlerinin ortasında çizgi varken bunda yok." 
            };
        });

        results.push({
            title: 'Görsel Farklı Olanı Bul',
            instruction: "Her satırda kuralı bozan şekli bul.",
            pedagogicalNote: "Görsel sınıflandırma ve mantıksal çıkarım.",
            rows
        });
    }
    return results;
}

export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const {itemCount, worksheetCount, gridSize, difficulty} = options;
    const results: SymmetryDrawingData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const dim = gridSize || 10;
        const dotCount = difficulty === 'Başlangıç' ? 3 : difficulty === 'Orta' ? 5 : difficulty === 'Zor' ? 7 : 9;
        const dots = Array.from({length: dotCount}).map(() => ({x: getRandomInt(0, (dim/2) - 1), y: getRandomInt(0, dim-1), color: '#000'}));
        results.push({
            title: 'Simetri Tamamlama',
            instruction: "Kırmızı çizgiye göre şeklin yansımasını (ayna görüntüsünü) çizin.",
            pedagogicalNote: "Uzamsal algı ve simetri kavramını pekiştirir.",
            gridDim: dim,
            dots,
            axis: 'vertical',
            isMirrorImage: true
        });
    }
    return results;
}

export const generateOfflineFindDifferentString = async (options: GeneratorOptions): Promise<FindDifferentStringData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: FindDifferentStringData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const rows = Array.from({length:itemCount}).map(() => {
            const base = getRandomItems(["X89K", "M2N4", "A7B3", "K9L1", "7UP5"], 1)[0];
            const diff = base.substring(0, 2) + (base.charAt(2) === '9' ? '8' : '9') + base.substring(3);
            const items = shuffle([base, base, base, diff]);
            return {items, correctIndex: items.indexOf(diff)};
        });
        results.push({
            title: 'Farklı Diziyi Bul',
            instruction: "Her satırda diğerlerinden farklı olan karakter dizisini bulun.",
            pedagogicalNote: "Dikkat süresi ve görsel tarama hızını artırır.",
            rows
        });
    }
    return results;
};

export const generateOfflineDotPainting = async (options: GeneratorOptions): Promise<DotPaintingData[]> => {
    const { worksheetCount } = options;
    const results: DotPaintingData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        results.push({
            title: 'Nokta Boyama',
            instruction: "Verilen koordinatlardaki noktaları boyayarak gizli resmi ortaya çıkar.",
            pedagogicalNote: "İnce motor becerileri ve koordinat sistemi mantığını geliştirir.",
            prompt1: 'Koordinatları takip et.',
            prompt2: 'Gizli Şekil: Kare',
            svgViewBox: '0 0 100 100',
            gridPaths: [], // Simplified for fast mode
            dots: [{cx: 30, cy: 30, color: 'red'}, {cx: 70, cy: 30, color: 'red'}, {cx: 70, cy: 70, color: 'red'}, {cx: 30, cy: 70, color: 'red'}],
            hiddenImageName: 'Kare'
        });
    }
    return results;
}

export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: AbcConnectData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const dim = gridSize || 5;
        const letters = ['A','B','C','D'];
        // Simple generation: placing pairs randomly (no guarantee of non-overlapping path solution in fast mode without complex algo)
        const points = letters.flatMap(l => ([
            {label: l, x: getRandomInt(0, dim-1), y: getRandomInt(0, dim-1), color: '#000'},
            {label: l, x: getRandomInt(0, dim-1), y: getRandomInt(0, dim-1), color: '#000'}
        ]));
        results.push({
            title: 'ABC Bağlama',
            instruction: "Aynı harfleri birbirine bağlayın. Çizgiler birbirini kesmemelidir.",
            pedagogicalNote: "Planlama ve uzamsal akıl yürütme.",
            puzzles: [{id: 1, gridDim: dim, points}]
        });
    }
    return results;
}

export const generateOfflineCoordinateCipher = async (options: GeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { gridSize, itemCount, worksheetCount } = options;
    const results: CoordinateCipherData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 6;
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));
        const message = "OKU";
        const cipherCoordinates: string[] = [];
        
        for(let k=0; k<message.length; k++) {
            const r = k; // Diagonal placement for simplicity
            const c = k;
            if(r < size && c < size) {
                grid[r][c] = message[k];
                cipherCoordinates.push(`${String.fromCharCode(65 + r)}${c+1}`);
            }
        }

        results.push({ 
            title: 'Koordinat Şifreleme', 
            instruction: "Verilen koordinatlardaki harfleri bularak şifreyi çözün.",
            pedagogicalNote: "Matris mantığı ve kod çözme.",
            grid, 
            wordsToFind: [], 
            cipherCoordinates, 
            decodedMessage: message 
        });
    }
    return results;
};

export const generateOfflineProfessionConnect = async (options: GeneratorOptions): Promise<ProfessionConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: ProfessionConnectData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const professions = getRandomItems(TR_VOCAB.jobs, itemCount);
        const points = professions.flatMap((p, idx) => ([
            { label: p, imageDescription: 'Meslek Sahibi', imagePrompt: '', x: 0, y: idx * 2, pairId: idx },
            { label: '', imageDescription: `${p} Aracı`, imagePrompt: '', x: 5, y: idx * 2, pairId: idx }
        ]));
        results.push({ 
            title: 'Meslek Eşleştirme', 
            instruction: "Meslekleri kullandıkları araçlarla eşleştirin.",
            pedagogicalNote: "İlişkilendirme ve kelime dağarcığı.",
            gridDim: 6, 
            points 
        });
    }
    return results;
}

export const generateOfflineMatchstickSymmetry = async (options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
     const { worksheetCount } = options;
     const results: MatchstickSymmetryData[] = [];
     for(let i=0; i<worksheetCount; i++) {
         results.push({
             title: 'Kibrit Simetrisi',
             instruction: "Verilen şeklin simetriğini çizin.",
             pedagogicalNote: "Görsel kopyalama ve simetri.",
             puzzles: [{
                 id: 1, 
                 axis: 'vertical',
                 lines: [{x1:1, y1:1, x2:2, y2:1, color: 'black'}, {x1:2, y1:1, x2:2, y2:2, color: 'black'}]
             }]
         });
     }
     return results;
}

export const generateOfflineVisualOddOneOutThemed = async (options: GeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const {itemCount, worksheetCount, theme} = options;
    const results: VisualOddOneOutThemedData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const rows = Array.from({length: itemCount}).map(() => {
            return {
                theme: theme || 'Karışık',
                items: [
                    {description: 'Kedi', imagePrompt: '', isOdd: false},
                    {description: 'Köpek', imagePrompt: '', isOdd: false},
                    {description: 'Araba', imagePrompt: '', isOdd: true}, // Odd one
                    {description: 'Kuş', imagePrompt: '', isOdd: false}
                ]
            }
        });
        results.push({ 
            title: 'Tematik Farklı Olanı Bul', 
            instruction: "Gruba uymayan resmi bul.",
            pedagogicalNote: "Kategorizasyon ve mantıksal çıkarım.",
            rows
        });
    }
    return results;
}

export const generateOfflinePunctuationColoring = async (options: GeneratorOptions): Promise<PunctuationColoringData[]> => {
    return Array(options.worksheetCount).fill({
        title: 'Noktalama Boyama',
        instruction: "Cümlenin sonuna gelecek işarete göre kutuyu boya.",
        pedagogicalNote: "Dilbilgisi kurallarını görselleştirme.",
        sentences: [
            {text: 'Eve geldim', color: '#FF0000', correctMark: '.'},
            {text: 'Nasıl oldun', color: '#0000FF', correctMark: '?'},
        ]
    });
}

export const generateOfflineSynonymAntonymColoring = async (options: GeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
     return Array(options.worksheetCount).fill({
         title: 'Eş/Zıt Anlamlı Boyama',
         instruction: "Kelimelerin ilişkisine göre (eş/zıt) boyama yap.",
         pedagogicalNote: "Kelime anlamı ilişkilerini pekiştirme.",
         colorKey: [{text: `Siyah - Kara (Eş)`, color: '#000000'}],
         wordsOnImage: [{word: 'Siyah', x: 50, y: 50}]
     });
}

export const generateOfflineStarHunt = async (options: GeneratorOptions): Promise<StarHuntData[]> => {
     return Array(options.worksheetCount).fill({ 
         title: 'Yıldız Avı', 
         instruction: "Her satır ve sütunda 1 yıldız olacak şekilde yerleştir.",
         pedagogicalNote: "Mantıksal çıkarım ve kısıtlama yönetimi.",
         grid: [[null, null], [null, null]], 
         targetCount: 2 
     });
}

export const generateOfflineWordConnect = async (options: GeneratorOptions): Promise<WordConnectData[]> => {
    const { worksheetCount, difficulty, itemCount } = options;
    return Array.from({length: worksheetCount}, () => {
        const pairs = getRandomItems(TR_VOCAB.synonyms, Math.floor(itemCount/2));
        const points = pairs.flatMap((p, i) => ([
            {word: p.word, pairId: i, x: 0, y: i*2, color: COLORS[i % COLORS.length].css},
            {word: p.synonym, pairId: i, x: 5, y: i*2, color: COLORS[i % COLORS.length].css}
        ]));
        return {
            title: 'Kelime Bağlama',
            instruction: 'Anlamca ilişkili kelimeleri eşleştir.',
            pedagogicalNote: 'Semantik ilişkilendirme ve kelime dağarcığı.',
            gridDim: 6,
            points: shuffle(points).map((p, i) => ({...p, y: i})) // re-distribute y to avoid overlap
        }
    })
};
