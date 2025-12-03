
import { 
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, CoordinateCipherData, WordConnectData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeCountingData, ShapeType,
    GeneratorOptions
} from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, turkishAlphabet, SHAPE_TYPES, TR_VOCAB, COLORS, generateSmartConnectGrid, CONNECT_COLORS, ITEM_CATEGORIES, CATEGORY_NAMES, EMOJI_MAP, generateRandomPattern, generateLatinSquare, generateMaze, getDifficultySettings, generateSymmetricPattern, generateConnectedPath } from './helpers';

// --- HELPER: PROCEDURAL SYMMETRIC GRID GENERATOR ---
// ... (Helper moved to helpers.ts for sharing, but kept in mind for usage)

const dotArtShapes: Record<string, { dots: { cx: number; cy: number }[]; name: string; }> = {
    'heart': {
        name: 'Kalp',
        dots: [
            { cx: 50, cy: 90 }, { cx: 40, cy: 80 }, { cx: 60, cy: 80 }, { cx: 30, cy: 70 }, { cx: 70, cy: 70 },
            { cx: 20, cy: 60 }, { cx: 80, cy: 60 }, { cx: 20, cy: 50 }, { cx: 80, cy: 50 }, { cx: 30, cy: 40 },
            { cx: 70, cy: 40 }, { cx: 40, cy: 30 }, { cx: 60, cy: 30 }, { cx: 50, cy: 40 }
        ]
    },
    'house': {
        name: 'Ev',
        dots: [
            { cx: 20, cy: 80 }, { cx: 30, cy: 80 }, { cx: 40, cy: 80 }, { cx: 50, cy: 80 }, { cx: 60, cy: 80 }, { cx: 70, cy: 80 }, { cx: 80, cy: 80 },
            { cx: 20, cy: 70 }, { cx: 80, cy: 70 }, { cx: 20, cy: 60 }, { cx: 80, cy: 60 }, { cx: 20, cy: 50 }, { cx: 80, cy: 50 },
            { cx: 50, cy: 20 }, { cx: 40, cy: 30 }, { cx: 60, cy: 30 }, { cx: 30, cy: 40 }, { cx: 70, cy: 40 },
            { cx: 40, cy: 60 }, { cx: 50, cy: 60 }, { cx: 60, cy: 60 }, 
        ]
    },
    'star': {
        name: 'Yıldız',
        dots: [
            { cx: 50, cy: 10 }, { cx: 60, cy: 40 }, { cx: 90, cy: 40 }, { cx: 65, cy: 60 },
            { cx: 75, cy: 90 }, { cx: 50, cy: 70 }, { cx: 25, cy: 90 }, { cx: 35, cy: 60 },
            { cx: 10, cy: 40 }, { cx: 40, cy: 40 }
        ]
    }
};

const matchstickPatterns = [
    { name: 'House', lines: [{x1:1, y1:3, x2:3, y2:1}, {x1:3, y1:1, x2:5, y2:3}, {x1:1, y1:3, x2:1, y2:5}, {x1:1,y1:5, x2:5, y2:5}] },
    { name: 'Boat', lines: [{x1:0, y1:4, x2:6, y2:4}, {x1:1, y1:4, x2:2, y2:3}, {x1:5,y1:4, x2:4, y2:3}, {x1:2,y1:3, x2:4, y2:3}] },
    { name: 'Fish', lines: [{x1:1, y1:3, x2:3, y2:1}, {x1:1, y1:3, x2:3, y2:5}, {x1:3,y1:1, x2:3,y2:5}] }
];

export const generateOfflineFindTheDifference = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: FindTheDifferenceData[] = [];
    const pool = [...TR_VOCAB.confusing_words.flat(), ...getWordsForDifficulty(difficulty, topic)];
    
    // Symbol Matrix Mode for Hard/Expert
    const symbolPairs = [
        ['O', '0'], ['l', '1'], ['6', '9'], ['E', 'F'], ['B', '8'], ['Z', '2'], ['S', '5'],
        ['😐', '😑'], ['🙂', '🙃'], ['⭐', '🌟'], ['⭕', '🔴'], ['⬛', '◼️'], ['⬆️', '⬇️'], ['🔲', '🔳']
    ];

    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount || 5 }).map(() => {
            const correctIndex = getRandomInt(0, 3);
            let items = [];
            
            // Logic: 
            // 1. Text Mode (Standard)
            // 2. Symbol Mode (High visual attention)
            
            if (difficulty === 'Zor' || difficulty === 'Uzman') {
                const pair = getRandomItems(symbolPairs, 1)[0];
                const base = pair[0];
                const diff = pair[1];
                
                // Create a string of repeated symbols for intensity
                const repeatCount = difficulty === 'Uzman' ? 8 : 5;
                const baseStr = Array(repeatCount).fill(base).join(' ');
                const diffStr = Array(repeatCount).fill(base).join(' ').replace(base, diff); // Replace one
                
                items = Array(4).fill(baseStr);
                items[correctIndex] = diffStr;
                
                return {
                    items,
                    correctIndex,
                    visualDistractionLevel: 'high' as const
                };
            } else {
                // Word Mode
                const baseWord = getRandomItems(pool, 1)[0];
                let differentWord = '';
                const chars = baseWord.split('');
                
                if (chars.length > 2) {
                    const pos = getRandomInt(1, chars.length - 2); 
                    // Visual replacement logic
                    const char = chars[pos];
                    const replacements: Record<string, string> = {'b':'d', 'd':'b', 'p':'q', 'q':'p', 'm':'n', 'n':'m', 'u':'ü', 'o':'ö', 'a':'e'};
                    chars[pos] = replacements[char] || turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)];
                    differentWord = chars.join('');
                } else {
                    differentWord = baseWord.split('').reverse().join('');
                }
                
                items = Array(4).fill(baseWord);
                items[correctIndex] = differentWord;
                
                return { 
                    items, 
                    correctIndex, 
                    visualDistractionLevel: 'medium' as const
                };
            }
        });
        results.push({ 
            title: `Farkı Bul (${difficulty === 'Uzman' ? 'Sembol Dikkat' : 'Kelime'})`, 
            instruction: "Her satırda, diğerlerinden farklı olan grubu bulun.",
            pedagogicalNote: "Görsel ayrım, detaylara dikkat ve şekil-zemin algısı.",
            imagePrompt: 'Find the Difference',
            rows 
        });
    }
    return results;
};

export const generateOfflineWordComparison = async (options: GeneratorOptions): Promise<WordComparisonData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const results: WordComparisonData[] = [];
    const masterPool = shuffle(getWordsForDifficulty(difficulty, topic));

    for (let i = 0; i < worksheetCount; i++) {
        // Ensure varied words per sheet
        const start = (i * 15) % Math.max(1, masterPool.length - 15);
        const poolSubset = masterPool.slice(start, start + 20);
        
        const commonWords = getRandomItems(poolSubset, 10);
        const diffPool = poolSubset.filter(w => !commonWords.includes(w));
        
        const list1_diff = getRandomItems(diffPool, 3);
        const list2_diff = getRandomItems(diffPool.filter(w => !list1_diff.includes(w)), 3);
        
        results.push({
            title: 'Kelime Karşılaştırma',
            instruction: "İki kutuyu karşılaştırın ve sadece bir kutuda olup diğerinde olmayan kelimeleri bulun.",
            pedagogicalNote: "Görsel tarama ve kısa süreli bellek kullanımını destekler.",
            imagePrompt: 'Comparison List',
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
        // Complexity increases shape depth
        const shapeCount = difficulty === 'Başlangıç' ? 2 : (difficulty === 'Orta' ? 3 : 4);
        
        // Generate unique composite shapes
        // Each item will be a set of shapes (e.g. Circle, Square, Star) + Colors
        const baseShapes = Array.from({ length: itemCount || 5 }, (_, k) => ({
            id: k + 1,
            shapes: getRandomItems(SHAPE_TYPES, shapeCount),
            color: getRandomItems(COLORS, 1)[0].css
        }));
        
        const leftColumn = baseShapes.map(s => ({
            id: s.id,
            shapes: s.shapes,
            color: s.color
        }));
        
        // Right column needs to match but shuffled
        const rightColumn = shuffle(baseShapes).map((item, index) => ({ 
            id: String.fromCharCode(65 + index), 
            shapes: item.shapes, 
            color: item.color 
        }));
        
        results.push({ 
            title: 'Şekil Eşleştirme (Kompozit)', 
            instruction: "Sol sütundaki şekil gruplarını sağ sütundaki eşleriyle çizgilerle birleştirin.",
            pedagogicalNote: "Çoklu görsel bileşenleri bir bütün olarak algılama (Gestalt) ve eşleştirme.",
            imagePrompt: 'Matching Shapes',
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
        const groups = getRandomItems(TR_VOCAB.confusing_words, itemCount || 5).map(pair => ({ 
            words: pair as [string, string],
            distractors: [pair[0] + 'a', pair[1].split('').reverse().join('')]
        }));
        results.push({ 
            title: 'Aynısını Bul', 
            instruction: "Verilen örneğin aynısı olan kelimeyi seçenekler arasından bulun.",
            pedagogicalNote: "Benzer uyaranlar arasından doğru olanı seçme (şekil-zemin) becerisi.",
            imagePrompt: 'Word Matching',
            groups 
        });
    }
    return results;
};

export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const {itemCount, worksheetCount, gridSize, difficulty} = options;
    const results: GridDrawingData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const dim = gridSize || 8;
        const complexity = difficulty === 'Başlangıç' ? 1 : (difficulty === 'Orta' ? 2 : 4);
        
        const drawings = Array.from({length: itemCount || 2}).map(() => {
            return { 
                // Use enhanced connected path generator for cleaner drawings
                lines: generateConnectedPath(dim, complexity),
                complexityLevel: difficulty
            };
        });
        results.push({ 
            title: 'Kare Çizim (Teknik Kopyalama)', 
            instruction: "Soldaki deseni referans noktalarını kullanarak sağdaki boş ızgaraya aynen çizin.",
            pedagogicalNote: "El-göz koordinasyonu, uzamsal konumlandırma ve kopyalama becerisini geliştirir.",
            imagePrompt: 'Grid Drawing',
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
        const cipherKey = getRandomItems(SHAPE_TYPES, 10).map((shape, index) => ({ 
            shape, 
            letter: turkishAlphabet[index],
            color: '#000'
        }));
        
        const availableLetters = cipherKey.map(k => k.letter);
        const simpleWords = ['baba', 'baca', 'aba', 'caba', 'ede', 'fece', 'defa'].filter(w => w.split('').every(l => availableLetters.includes(l)));
        
        const wordsToUse = simpleWords.length >= (itemCount || 5) ? getRandomItems(simpleWords, itemCount || 5) : Array.from({length: itemCount || 5}, () => 
            Array.from({length: 4}, () => getRandomItems(availableLetters, 1)[0]).join('')
        );

        const wordsToSolve = wordsToUse.map(word => {
            const shapeSequence = word.split('').map(letter => cipherKey.find(item => item.letter === letter)!.shape);
            return { shapeSequence, wordLength: word.length, answer: word };
        });

        results.push({ 
            title: 'Şekil Şifresi', 
            instruction: "Anahtar tablosunu kullanarak şekillerle yazılmış şifreli kelimeleri çözün.",
            pedagogicalNote: "Sembolik kodlama ve kod çözme becerisi, okuma-yazma temelli bilişsel süreçleri destekler.",
            imagePrompt: 'Symbol Code',
            cipherKey, 
            wordsToSolve 
        });
    }
    return results;
};

export const generateOfflineBlockPainting = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    const { worksheetCount, difficulty } = options;
    const results: BlockPaintingData[] = [];
    
    // Larger grids for more detail
    const size = difficulty === 'Başlangıç' ? 6 : (difficulty === 'Orta' ? 8 : 12);
    
    for (let i = 0; i < worksheetCount; i++) {
        // Generate Procedural Symmetric Pattern (Mandala-like)
        const density = difficulty === 'Başlangıç' ? 0.3 : 0.4;
        const pattern = generateSymmetricPattern(size, size, density);

        results.push({
            title: `Simetrik Blok Boyama (${difficulty})`,
            instruction: "Soldaki örneğe dikkatlice bak. Sağdaki boş kareleri, simetri ve desen kurallarına uyarak aynı şekilde boya.",
            pedagogicalNote: "Görsel bütünleme, parça-bütün ilişkisi ve konumsal kopyalama becerisi.",
            imagePrompt: 'Pixel Art Block',
            grid: {rows: size, cols: size},
            targetPattern: pattern,
            shapes: [
                { id: 1, color: '#3B82F6', pattern: [[1]], count: pattern.flat().filter(x => x===1).length },
            ]
        });
    }
    return results;
};

export const generateOfflineVisualOddOneOut = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const results: VisualOddOneOutData[] = [];
    
    for(let i=0; i<worksheetCount; i++) {
        const rows = Array.from({length: itemCount || 5}).map(() => {
            const correctIndex = getRandomInt(0, 3);
            
            // Logic: Rotation vs Reflection (True IQ Test Style)
            // Generate a random base shape "signature"
            // For simplicity in offline mode, we use boolean segments array but interpret it as shape features
            const baseSegments = Array.from({length: 9}, () => Math.random() > 0.5);
            
            // Standard items are rotations of base
            // Odd item is a mirrored version or modified
            
            const oddOne = [...baseSegments];
            // Modify structure for odd one
            if (Math.random() > 0.5) {
                // Invert a few bits to change structure slightly
                oddOne[0] = !oddOne[0];
                oddOne[4] = !oddOne[4];
                oddOne[8] = !oddOne[8];
            } else {
                // Mirror (Reverse array approximates reflection for simple grid shapes)
                oddOne.reverse();
            }

            const items = Array(4).fill(null).map((_, idx) => {
                if (idx === correctIndex) return { segments: oddOne, rotation: 0 };
                // Others are just rotated visually (frontend handles rotation prop)
                return { segments: baseSegments, rotation: (idx * 90) % 360 };
            });
            
            return { 
                items, 
                correctIndex, 
                reason: "Diğerleri aynı şeklin döndürülmüş halidir, bu ise yapısal olarak farklıdır (aynalanmıştır)." 
            };
        });

        results.push({
            title: 'Görsel Farklı Olanı Bul (Döndürme Mantığı)',
            instruction: "Şekiller zihinsel olarak döndürüldüğünde hangisi diğerleriyle eşleşmez?",
            pedagogicalNote: "Görsel sınıflandırma, zihinsel döndürme ve mantıksal çıkarım (Mental Rotation).",
            imagePrompt: 'Geometric Shapes Rotation',
            rows
        });
    }
    return results;
}

export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const {itemCount, worksheetCount, gridSize, difficulty} = options;
    const results: SymmetryDrawingData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const dim = gridSize || 12;
        const dotCount = difficulty === 'Başlangıç' ? 4 : (difficulty === 'Orta' ? 6 : 8);
        const dots = Array.from({length: dotCount}).map(() => ({x: getRandomInt(0, (dim/2) - 1), y: getRandomInt(0, dim-1), color: '#000'}));
        results.push({
            title: 'Simetri Tamamlama',
            instruction: "Kırmızı çizgiye göre şeklin yansımasını (ayna görüntüsünü) çizin.",
            pedagogicalNote: "Uzamsal algı ve simetri kavramını pekiştirir.",
            imagePrompt: 'Symmetry Grid',
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
        const rows = Array.from({length:itemCount || 8}).map(() => {
            const base = getRandomItems(["X89K", "M2N4", "A7B3", "K9L1", "7UP5", "B8D8", "S5S2"], 1)[0];
            const diff = base.substring(0, 2) + (base.charAt(2) === '9' ? '8' : '9') + base.substring(3);
            const items = shuffle([base, base, base, diff]);
            return {items, correctIndex: items.indexOf(diff)};
        });
        results.push({
            title: 'Farklı Diziyi Bul',
            instruction: "Her satırda diğerlerinden farklı olan karakter dizisini bulun.",
            pedagogicalNote: "Dikkat süresi ve görsel tarama hızını artırır.",
            imagePrompt: 'String Pattern',
            rows
        });
    }
    return results;
};

export const generateOfflineDotPainting = async (options: GeneratorOptions): Promise<DotPaintingData[]> => {
    const { worksheetCount, itemCount } = options;
    const results: DotPaintingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const shapeKey = getRandomItems(Object.keys(dotArtShapes), 1)[0];
        const shape = dotArtShapes[shapeKey];
        const color = getRandomItems(COLORS, 1)[0].css;
        const shapeDots = shape.dots.map(d => ({ ...d, color }));

        results.push({
            title: 'Nokta Boyama (Koordinat Resim)',
            instruction: "Verilen renkteki noktaları boyayarak gizli resmi ortaya çıkar.",
            pedagogicalNote: "İnce motor becerileri ve görsel bütünleme.",
            imagePrompt: `Dot Art ${shape.name}`,
            prompt1: 'Sadece renkli noktaları takip et.',
            prompt2: `Gizli Şekil: ${shape.name}`,
            svgViewBox: '0 0 100 100',
            gridPaths: [], 
            dots: shapeDots,
            hiddenImageName: shape.name
        });
    }
    return results;
}

export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const {itemCount, worksheetCount, gridSize, targetLetters} = options;
    const results: AbcConnectData[] = [];
    const dim = gridSize || 6;
    
    let letters = ['A','B','C','D','E','F','G','H','J'];
    if (targetLetters) {
        const customLetters = targetLetters.split(/[\s,]+/).map(s => s.trim().toUpperCase()).filter(s => s.length === 1);
        if (customLetters.length > 0) {
            letters = customLetters;
        }
    }

    const count = Math.min(letters.length, Math.floor((itemCount || 6) / 2));
    const actualLetters = letters.slice(0, count);

    for(let i=0; i<worksheetCount; i++){
        const placements = generateSmartConnectGrid(dim, count);
        
        const points = placements.map(p => ({
            label: actualLetters[p.pairIndex % actualLetters.length],
            x: p.x,
            y: p.y,
            color: CONNECT_COLORS[p.pairIndex % CONNECT_COLORS.length]
        }));

        results.push({
            title: 'Nokta Birleştirme (Flow)',
            instruction: "Aynı harfleri, çizgiler birbirini kesmeyecek şekilde birleştirin. Tüm kareler dolmalıdır.",
            pedagogicalNote: "Planlama ve uzamsal akıl yürütme.",
            imagePrompt: 'Connect Dots Flow',
            puzzles: [{id: 1, gridDim: dim, points}]
        });
    }
    return results;
}

export const generateOfflineCoordinateCipher = async (options: GeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { gridSize, worksheetCount } = options;
    const results: CoordinateCipherData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const size = gridSize || 6;
        const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => getRandomItems(turkishAlphabet.split(''), 1)[0]));
        const message = getRandomItems(["OKU", "YAZ", "BUL", "ÇİZ"], 1)[0];
        const cipherCoordinates: string[] = [];
        
        for(let k=0; k<message.length; k++) {
            const r = k;
            const c = k + 1; // Slight offset
            if(r < size && c < size) {
                grid[r][c] = message[k].toUpperCase();
                cipherCoordinates.push(`${String.fromCharCode(65 + r)}${c+1}`);
            }
        }

        results.push({ 
            title: 'Koordinat Şifreleme', 
            instruction: "Verilen koordinatlardaki harfleri bularak şifreyi çözün.",
            pedagogicalNote: "Matris mantığı ve kod çözme.",
            imagePrompt: 'Coordinate Grid Code',
            grid, 
            wordsToFind: [], 
            cipherCoordinates, 
            decodedMessage: message 
        });
    }
    return results;
};

export const generateOfflineWordConnect = async (options: GeneratorOptions): Promise<WordConnectData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: WordConnectData[] = [];
    
    let pairsPool: {word: string, match: string}[] = [];
    
    if (difficulty === 'Başlangıç') {
        pairsPool = [
            {word: 'Güneş', match: 'Sıcak'}, {word: 'Kar', match: 'Soğuk'}, {word: 'Arı', match: 'Bal'},
            {word: 'İnek', match: 'Süt'}, {word: 'Tavuk', match: 'Yumurta'}, {word: 'Fırça', match: 'Boya'},
            {word: 'Kalem', match: 'Kağıt'}, {word: 'Çekiç', match: 'Çivi'}, {word: 'Gemi', match: 'Deniz'}
        ];
    } else {
        const pool = Math.random() > 0.5 ? TR_VOCAB.synonyms : TR_VOCAB.antonyms;
        pairsPool = pool.map(p => ({word: p.word, match: (p as any).synonym || (p as any).antonym}));
    }

    pairsPool = shuffle(pairsPool);

    for(let i = 0; i < worksheetCount; i++) {
        const count = itemCount || 6;
        const start = (i * count) % pairsPool.length;
        const selectedPairs = pairsPool.slice(start, start + count);
        
        const points: any[] = [];
        const colors = getRandomItems(CONNECT_COLORS, count);
        const rightSideIndices = shuffle(Array.from({length: count}, (_, k) => k));

        selectedPairs.forEach((pair, idx) => {
            const leftIcon = EMOJI_MAP[pair.word] || pair.word.charAt(0);
            const rightIcon = EMOJI_MAP[pair.match] || pair.match.charAt(0);

            // FIX: Pass the exact word as the prompt to ensure correct image generation
            points.push({ 
                word: pair.word, 
                pairId: idx, 
                x: 0, 
                y: idx, 
                color: colors[idx % colors.length],
                imagePrompt: pair.word 
            });
            
            points.push({ 
                word: pair.match, 
                pairId: idx, 
                x: 1, 
                y: rightSideIndices[idx], 
                color: colors[idx % colors.length],
                imagePrompt: pair.match 
            });
        });
        
        results.push({
            title: "Kelime Bağlama (Hızlı Mod)",
            instruction: "Sol sütundaki kelimeleri sağ sütundaki eşleriyle (ilişkili olanlar) birleştir.",
            pedagogicalNote: "Anlamsal ilişkilendirme ve kelime dağarcığı.",
            imagePrompt: 'Connect Matching Items',
            gridDim: 1,
            points
        });
    }
    return results;
};

export const generateOfflineProfessionConnect = async (options: GeneratorOptions): Promise<ProfessionConnectData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: ProfessionConnectData[] = [];
    const masterProfessions = shuffle(TR_VOCAB.jobs);

    for(let i=0; i<worksheetCount; i++){
        const count = itemCount || 5;
        const start = (i * count) % masterProfessions.length;
        const professions = masterProfessions.slice(start, start + count);
        
        const points = professions.flatMap((p: string, idx) => ([
            { label: p, imageDescription: p, imagePrompt: p, x: 0, y: idx * 2, pairId: idx },
            { label: '', imageDescription: `${p} Aracı`, imagePrompt: `${p} tools`, x: 5, y: idx * 2, pairId: idx }
        ]));
        results.push({ 
            title: 'Meslek Eşleştirme', 
            instruction: "Meslekleri kullandıkları araçlarla eşleştirin.",
            pedagogicalNote: "İlişkilendirme ve sosyal bilgiler.",
            imagePrompt: 'Professions',
            gridDim: 6, 
            points 
        });
    }
    return results;
}

export const generateOfflineMatchstickSymmetry = async (options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
    const { worksheetCount } = options;
    const results: MatchstickSymmetryData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const pattern = getRandomItems(matchstickPatterns, 1)[0];
        results.push({
            title: 'Kibrit Simetrisi',
            instruction: "Verilen şeklin simetriğini çizin.",
            pedagogicalNote: "Görsel kopyalama ve simetri.",
            imagePrompt: 'Matchstick Puzzle',
            puzzles: [{
                id: 1,
                axis: 'vertical',
                lines: pattern.lines.map(l => ({ ...l, color: 'black' }))
            }]
        });
    }
    return results;
}

export const generateOfflineVisualOddOneOutThemed = async (options: GeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const results: VisualOddOneOutThemedData[] = [];
    const shuffledCats = shuffle([...ITEM_CATEGORIES]);

    for (let i = 0; i < worksheetCount; i++) {
        const rows: VisualOddOneOutThemedData['rows'] = [];
        
        for (let j = 0; j < (itemCount || 5); j++) {
            let mainCatKey = shuffledCats[j % shuffledCats.length];
            const oddCatKey = getRandomItems(ITEM_CATEGORIES.filter(c => c !== mainCatKey), 1)[0];

            const vocab = TR_VOCAB as any;
            const mainItems: string[] = getRandomItems((vocab[mainCatKey] || []) as string[], 3);
            const oddItem: string | undefined = getRandomItems((vocab[oddCatKey] || []) as string[], 1)[0];

            if (!oddItem || mainItems.length < 3) { j--; continue; }

            // Pass item name as imagePrompt for correct generation
            const items = shuffle([
                ...mainItems.map(desc => ({ description: desc, imagePrompt: desc, isOdd: false })),
                { description: oddItem, imagePrompt: oddItem, isOdd: true }
            ]);

            rows.push({ theme: CATEGORY_NAMES[mainCatKey] || mainCatKey, items });
        }
        
        results.push({
            title: 'Tematik Farklı Olanı Bul',
            instruction: "Her grupta, konuyla ilgisiz olanı bulun.",
            pedagogicalNote: "Kategorizasyon ve mantıksal çıkarım.",
            imagePrompt: 'Odd One Out Objects',
            rows
        });
    }
    return results;
};

export const generateOfflinePunctuationColoring = async (options: GeneratorOptions): Promise<PunctuationColoringData[]> => {
    const { itemCount, worksheetCount } = options;
    const punctuationSentences = [
        { text: 'Okula gittim', correctMark: '.' }, { text: 'Nereye gidiyorsun', correctMark: '?' },
        { text: 'Eyvah, geç kaldım', correctMark: '!' }, { text: 'Kedi, köpek ve kuş besliyorum', correctMark: '.' },
        { text: 'Yaşasın tatil', correctMark: '!' }, { text: 'Ödevini yaptın mı', correctMark: '?' }
    ];
    
    return Array.from({ length: worksheetCount }, (_, pageIdx) => {
        const sentences = getRandomItems(punctuationSentences, itemCount || 4).map((s, i) => ({
            ...s,
            color: COLORS[i % COLORS.length].css
        }));

        return {
            title: 'Noktalama Boyama',
            instruction: "Cümlenin sonuna gelecek işarete göre kutuyu boya.",
            pedagogicalNote: "Dilbilgisi kuralları.",
            imagePrompt: 'Punctuation Marks',
            sentences
        };
    });
}

export const generateOfflineSynonymAntonymColoring = async (options: GeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
    const { worksheetCount } = options;
    const results: SynonymAntonymColoringData[] = [];
    for(let i=0; i < worksheetCount; i++) {
        const synonymPair = getRandomItems(TR_VOCAB.synonyms, 1)[0];
        const antonymPair = getRandomItems(TR_VOCAB.antonyms, 1)[0];
        const color1 = getRandomItems(COLORS, 1)[0].css;
        const color2 = getRandomItems(COLORS.filter(c => c.css !== color1), 1)[0].css;

        const colorKey = [
            { text: `"${synonymPair.word}" kelimesinin eş anlamlısı`, color: color1 },
            { text: `"${antonymPair.word}" kelimesinin zıt anlamlısı`, color: color2 },
        ];

        const wordsOnImage = shuffle([
            { word: synonymPair.synonym, x: 20, y: 30 },
            { word: antonymPair.antonym, x: 70, y: 60 }
        ]);

        results.push({
            title: 'Eş/Zıt Anlamlı Boyama',
            instruction: "Kelimelerin ilişkisine göre boyama yap.",
            pedagogicalNote: "Kelime anlamı ilişkileri.",
            imagePrompt: 'Painting Palette',
            colorKey,
            wordsOnImage
        });
    }
    return results;
};

export const generateOfflineStarHunt = async (options: GeneratorOptions): Promise<StarHuntData[]> => {
    const { worksheetCount, gridSize, difficulty } = options;
    const size = gridSize || (difficulty === 'Orta' ? 6 : (difficulty === 'Zor' ? 8 : 5));
    
    return Array.from({ length: worksheetCount }, () => {
        const latin = generateLatinSquare(size); 
        const grid: (ShapeType | 'star' | 'question' | null)[][] = latin.map(row => 
            row.map(val => val === 1 ? 'star' : null)
        );

        return {
            title: 'Yıldız Avı (Hızlı Mod)',
            instruction: "Her satır ve sütunda 1 yıldız olacak şekilde yerleştirin. Yıldızlar birbirine değmemelidir.",
            pedagogicalNote: "Mantıksal çıkarım ve kısıtlama yönetimi.",
            imagePrompt: 'Star Puzzle',
            grid: grid,
            targetCount: size
        };
    });
}

export const generateOfflineShapeCounting = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { worksheetCount, difficulty } = options;
    const shapeCountingFigures = {
        easy: {
            svgPaths: [ {d: "M 10 90 L 50 10 L 90 90 Z", fill: '#bfdbfe'}, {d: "M 30 90 L 50 50 L 70 90 Z", fill: '#bbf7d0'} ],
            correctCount: 2
        },
        medium: {
            svgPaths: [ { d: "M 50 10 L 90 80 L 10 80 Z", fill: '#f4f4f5' }, { d: "M 50 10 L 70 45 L 30 45 Z", fill: '#fde047' }, { d: "M 30 45 L 50 80 L 10 80 Z", fill: '#fde047' }, { d: "M 70 45 L 90 80 L 50 80 Z", fill: '#fde047' } ],
            correctCount: 5 
        },
        hard: {
            svgPaths: [ { d: "M 50 5 L 61 40 L 98 40 L 68 62 L 79 96 L 50 75 L 21 96 L 32 62 L 2 40 L 39 40 Z", fill: '#bfdbfe' }, { d: "M 50 75 L 32 62 L 68 62 Z", fill: 'rgba(0,0,0,0.1)'}, { d: "M 39 40 L 50 5 L 61 40 Z", fill: 'rgba(0,0,0,0.1)'} ],
            correctCount: 10 
        }
    };

    return Array.from({ length: worksheetCount }, () => {
        let figure;
        if (difficulty === 'Başlangıç') figure = shapeCountingFigures.easy;
        else if (difficulty === 'Orta') figure = shapeCountingFigures.medium;
        else figure = shapeCountingFigures.hard;

        return {
            title: 'Üçgen Sayma',
            instruction: "Şeklin içinde kaç tane üçgen olduğunu sayın.",
            pedagogicalNote: "Görsel ayrıştırma ve sayma.",
            imagePrompt: 'Triangle Geometry Puzzle',
            figures: [{
                svgPaths: figure.svgPaths,
                targetShape: 'triangle',
                correctCount: figure.correctCount
            }]
        };
    });
};
