
import { 
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, CoordinateCipherData, WordConnectData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeCountingData, ShapeType,
    GeneratorOptions
} from '../../types';
import { shuffle, getRandomInt, getRandomItems, getWordsForDifficulty, SHAPE_TYPES, TR_VOCAB, generateConnectedPath, generateSymmetricPattern, PREDEFINED_GRID_PATTERNS } from './helpers';

// ... (Previous imports and data constants like dotArtShapes, matchstickPatterns remain unchanged) ...
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

// Helper for generating random polygon SVG paths
const createShapePath = (type: 'triangle' | 'square' | 'circle' | 'line', cx: number, cy: number, size: number, rot: number = 0): string => {
    const rad = (deg: number) => deg * Math.PI / 180;
    
    if (type === 'circle') {
        // Approximate circle with path for consistency
        const r = size / 2;
        return `M ${cx} ${cy-r} A ${r} ${r} 0 1 1 ${cx} ${cy+r} A ${r} ${r} 0 1 1 ${cx} ${cy-r} Z`;
    }
    
    let points: {x:number, y:number}[] = [];
    
    if (type === 'triangle') {
        // Equilateral triangle
        for(let i=0; i<3; i++) {
            const angle = rot + i * 120 - 90;
            points.push({
                x: cx + (size/2) * Math.cos(rad(angle)),
                y: cy + (size/2) * Math.sin(rad(angle))
            });
        }
    } else if (type === 'square') {
        for(let i=0; i<4; i++) {
            const angle = rot + i * 90 - 45;
            points.push({
                x: cx + (size/1.4) * Math.cos(rad(angle)),
                y: cy + (size/1.4) * Math.sin(rad(angle))
            });
        }
    } else if (type === 'line') {
        // Random noise line through center
        const angle = rot;
        const len = size * 1.5;
        points.push({
            x: cx + (len/2) * Math.cos(rad(angle)),
            y: cy + (len/2) * Math.sin(rad(angle))
        });
        points.push({
            x: cx - (len/2) * Math.cos(rad(angle)),
            y: cy - (len/2) * Math.sin(rad(angle))
        });
        return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }
    
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
};

// ... (Existing generators from generateOfflineFindTheDifference to generateOfflineVisualOddOneOutThemed kept as is) ...
export const generateOfflineFindTheDifference = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: FindTheDifferenceData[] = [];
    const pool = [...TR_VOCAB.confusing_words.flat(), ...getWordsForDifficulty(difficulty, topic)];
    const uniquePool = [...new Set(pool)];
    for (let i = 0; i < worksheetCount; i++) {
        const rows = [];
        const rowsCount = itemCount || 8;
        for(let r=0; r<rowsCount; r++) {
            const word = getRandomItems(uniquePool, 1)[0] || 'ELMA';
            const distractionLevel = difficulty === 'Zor' || difficulty === 'Uzman' ? 'high' : 'low';
            let variation = word + '.';
            if (word.length > 3) {
                 const mid = Math.floor(word.length / 2);
                 variation = word.substring(0, mid-1) + word[mid] + word[mid-1] + word.substring(mid+1);
            }
            const isWordDiff = Math.random() > 0.5;
            const target = isWordDiff ? variation : word;
            const items = Array.from({length: 4}, () => word);
            const correctIndex = getRandomInt(0, 3);
            items[correctIndex] = target;
            rows.push({ items, correctIndex, visualDistractionLevel: distractionLevel });
        }
        results.push({ title: 'Farklı Olanı Bul', instruction: "Sıradaki farklı kelimeyi/şekli bul ve işaretle.", pedagogicalNote: "Görsel ayrıştırma ve dikkat.", imagePrompt: 'Difference', rows });
    }
    return results;
};
export const generateOfflineWordComparison = async (options: GeneratorOptions): Promise<WordComparisonData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const words = getWordsForDifficulty(difficulty, 'Rastgele').slice(0, 10);
        const modifiedWords = words.map(w => {
            if(Math.random() > 0.5) {
                if(w.length > 2) return w.substring(0,1) + w[2] + w[1] + w.substring(3);
                return w + 'a';
            }
            return w;
        });
        const diffs = words.filter((w, i) => w !== modifiedWords[i]);
        return { title: 'Kelime Karşılaştırma', instruction: 'İki listeyi karşılaştır ve farklı olanları bul.', pedagogicalNote: 'Görsel tarama ve karşılaştırma.', imagePrompt: 'Comparison', box1Title: 'Liste A', box2Title: 'Liste B', wordList1: words, wordList2: modifiedWords, correctDifferences: diffs };
    });
};
export const generateOfflineShapeMatching = async (options: GeneratorOptions): Promise<ShapeMatchingData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const count = difficulty === 'Başlangıç' ? 4 : 5;
        const shapes: ShapeType[] = ['triangle', 'heart', 'arrow' as any, 'moon' as any, 'semi-circle' as any, 'star'];
        const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        const baseItems = Array.from({length: count}, (_, i) => ({ id: i + 1, shape: shapes[i % shapes.length], color: colors[i % colors.length] }));
        const leftColumn = baseItems.map(item => ({ id: item.id, shapes: [item.shape], color: item.color, rotation: 0, scale: 1 }));
        const rightColumn = shuffle(baseItems).map(item => {
            let rot = 0; let scale = 1;
            if (difficulty !== 'Başlangıç') {
                const rotations = [90, 180, 270];
                rot = rotations[getRandomInt(0, 2)];
                if (difficulty === 'Zor' || difficulty === 'Uzman') { scale = Math.random() > 0.5 ? 0.7 : 1.3; }
            }
            return { id: item.id, shapes: [item.shape], color: item.color, rotation: rot, scale: scale };
        });
        return { title: 'Şekil Eşleştirme', instruction: 'Şekiller dönse veya büyüse bile aynıdır. Eşlerini bul.', pedagogicalNote: 'Form sabitliği (Form Constancy) ve görsel eşleştirme.', imagePrompt: 'Shapes', leftColumn, rightColumn, complexity: difficulty === 'Başlangıç' ? 1 : 2 };
    });
};
export const generateOfflineFindIdenticalWord = async (options: GeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { worksheetCount, difficulty } = options;
    const words = getWordsForDifficulty(difficulty, 'Rastgele');
    return Array.from({ length: worksheetCount }, () => {
        const target = getRandomItems(words, 1)[0];
        const distractors = getRandomItems(words.filter(w => w !== target), 5);
        return { title: 'Aynısını Bul', instruction: 'Ortadaki kelimenin aynısını bul.', pedagogicalNote: 'Kelime tanıma.', imagePrompt: 'Target Word', groups: [{ words: [target, target], distractors }] };
    });
};
export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const { worksheetCount, gridSize, difficulty } = options;
    const dim = gridSize || 6;
    const patternKeys = Object.keys(PREDEFINED_GRID_PATTERNS);
    return Array.from({ length: worksheetCount }, () => {
        const drawings = Array.from({length: 2}, () => {
            const key = getRandomItems(patternKeys, 1)[0] as keyof typeof PREDEFINED_GRID_PATTERNS;
            let lines = PREDEFINED_GRID_PATTERNS[key];
            if (difficulty === 'Uzman') { lines = generateConnectedPath(dim, 4); }
            return { lines: lines as [number, number][][], complexityLevel: difficulty };
        });
        return { title: 'Kare Çizim (Kopyalama)', instruction: 'Soldaki deseni sağdaki kareli alana kopyala.', pedagogicalNote: 'Görsel-uzamsal kopyalama ve ince motor.', imagePrompt: 'Grid Art', gridDim: dim, drawings };
    });
};
export const generateOfflineSymbolCipher = async (options: GeneratorOptions): Promise<SymbolCipherData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const letters = ['A','B','C','D','E','K','L','M'];
        const shapes = SHAPE_TYPES.slice(0, letters.length);
        const key = letters.map((l, i) => ({ letter: l, shape: shapes[i], color: '#000' }));
        const words = ['KALEM', 'BEBEK', 'ELMA'];
        return { title: 'Şekil Şifresi', instruction: 'Şifreyi çöz.', pedagogicalNote: 'Sembolik kodlama.', imagePrompt: 'Cipher', cipherKey: key, wordsToSolve: words.map(w => ({ wordLength: w.length, answer: w, shapeSequence: w.split('').map(char => key.find(k => k.letter === char)?.shape || 'circle') })) };
    });
};
export const generateOfflineBlockPainting = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    const { worksheetCount, gridSize } = options;
    const dim = gridSize || 5;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Blok Boyama', instruction: 'Verilen deseni oluşturmak için kareleri boya.', pedagogicalNote: 'Uzamsal konumlandırma.', imagePrompt: 'Pixel Art', grid: { rows: dim, cols: dim }, targetPattern: generateSymmetricPattern(dim, dim, 0.4), shapes: [{ id: 1, color: '#3b82f6', count: 5, pattern: [] }] }));
};
export const generateOfflineVisualOddOneOut = async (options: GeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 6;
    return Array.from({ length: worksheetCount }, () => {
        const rows = Array.from({ length: count }, () => {
            const baseSegments = Array.from({ length: 9 }, () => Math.random() > 0.5);
            let reason = 'Farklı desen';
            let items: { segments: boolean[], rotation: number }[] = [];
            if (difficulty === 'Başlangıç' && Math.random() > 0.3) {
                 const inverted = baseSegments.map(b => !b);
                 items = [ { segments: baseSegments, rotation: 0 }, { segments: baseSegments, rotation: 0 }, { segments: baseSegments, rotation: 0 }, { segments: inverted, rotation: 0 } ];
                 reason = "Renkleri ters (Negatif)";
            } else {
                const oddSegments = [...baseSegments];
                const flipIdx = getRandomInt(0, 8);
                oddSegments[flipIdx] = !oddSegments[flipIdx];
                items = [ { segments: baseSegments, rotation: 0 }, { segments: baseSegments, rotation: 0 }, { segments: baseSegments, rotation: 0 }, { segments: oddSegments, rotation: 0 } ];
                reason = "Bir kare farklı";
            }
            const shuffled = shuffle(items.map((item, idx) => ({...item, originalIdx: idx})));
            const correctIndex = shuffled.findIndex(x => x.originalIdx === 3); 
            return { items: shuffled, correctIndex, reason };
        });
        return { title: 'Görsel Farkı Bul', instruction: 'Diğerlerinden farklı olan şekli bul.', pedagogicalNote: 'Görsel ayırt etme ve detay dikkati (Visual Discrimination).', imagePrompt: 'Odd Shape', rows };
    });
};
export const generateOfflineSymmetryDrawing = async (options: GeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { worksheetCount, gridSize } = options;
    const dim = gridSize || 6;
    return Array.from({ length: worksheetCount }, () => {
        const lines: {x1:number, y1:number, x2:number, y2:number}[] = [];
        const path = generateConnectedPath(Math.floor(dim/2), 1);
        path.forEach(seg => { lines.push({ x1: seg[0][0], y1: seg[0][1], x2: seg[1][0], y2: seg[1][1] }); });
        const dots = [];
        const seen = new Set();
        let cx = 1; let cy = getRandomInt(1, dim-2);
        for(let k=0; k<6; k++) {
            if(!seen.has(`${cx},${cy}`)) { dots.push({ x: cx, y: cy, color: 'black' }); seen.add(`${cx},${cy}`); }
            const move = getRandomItems([[0,1],[0,-1],[1,0],[-1,0]], 1)[0];
            cx = Math.max(0, Math.min(Math.floor(dim/2)-1, cx + move[0]));
            cy = Math.max(0, Math.min(dim-1, cy + move[1]));
        }
        return { title: 'Simetri Tamamlama', instruction: 'Kırmızı çizgiye göre şeklin yansımasını çiz.', pedagogicalNote: 'Görsel tamamlama ve simetri algısı.', imagePrompt: 'Symmetry', gridDim: dim, axis: 'vertical', isMirrorImage: true, dots };
    });
};
export const generateOfflineFindDifferentString = async (options: GeneratorOptions): Promise<FindDifferentStringData[]> => {
    const { worksheetCount, itemCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const base = "xyxyxy";
        const odd = "xyyxyx";
        const rows = Array.from({ length: itemCount || 8 }, () => ({ items: shuffle([base, base, base, odd]), correctIndex: -1 }));
        return { title: 'Farklı Diziyi Bul', instruction: 'Farklı olan harf dizisini bul.', pedagogicalNote: 'Görsel dikkat.', imagePrompt: 'String', rows };
    });
};
export const generateOfflineDotPainting = async (options: GeneratorOptions): Promise<DotPaintingData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const shape = dotArtShapes['heart'];
        return { title: 'Nokta Boyama', instruction: 'Koordinatları verilen noktaları boya ve gizli resmi bul.', prompt1: 'Gizli Resim', prompt2: 'Noktaları birleştir.', pedagogicalNote: 'Koordinat sistemi ve ince motor.', imagePrompt: 'Dot Art', svgViewBox: "0 0 100 100", gridPaths: [], dots: shape.dots.map(d => ({...d, color: '#ef4444'})), hiddenImageName: shape.name };
    });
};
export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const { worksheetCount, gridSize } = options;
    const dim = gridSize || 5;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Nokta Birleştirme', instruction: 'Aynı harfleri/sayıları yollar kesişmeden birleştir.', pedagogicalNote: 'Planlama ve uzamsal zeka.', imagePrompt: 'Flow', puzzles: [{ id: 1, gridDim: dim, points: [ {label: 'A', x: 0, y: 0, color: 'red'}, {label: 'A', x: 4, y: 1, color: 'red'}, {label: 'B', x: 0, y: 4, color: 'blue'}, {label: 'B', x: 4, y: 4, color: 'blue'} ] }] }));
};
export const generateOfflineCoordinateCipher = async (options: GeneratorOptions): Promise<CoordinateCipherData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Koordinat Şifreleme', instruction: 'Koordinatları verilen harfleri bul ve şifreyi çöz.', pedagogicalNote: 'Konumlandırma.', imagePrompt: 'Map', grid: [['A','B','C'],['D','E','F'],['G','H','I']], wordsToFind: ['EGE'], cipherCoordinates: ['B2', 'C1', 'B2'], decodedMessage: 'EGE' }));
};
export const generateOfflineWordConnect = async (options: GeneratorOptions): Promise<WordConnectData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Kelime Bağlama', instruction: 'İlişkili kelimeleri eşleştir.', pedagogicalNote: 'Semantik ilişki.', imagePrompt: 'Connect', gridDim: 2, points: [ {word: 'Doktor', pairId: 1, x: 0, y: 0, color: 'blue', imagePrompt: 'Doctor'}, {word: 'Hastane', pairId: 1, x: 1, y: 1, color: 'blue', imagePrompt: 'Hospital'}, {word: 'Öğretmen', pairId: 2, x: 0, y: 1, color: 'green', imagePrompt: 'Teacher'}, {word: 'Okul', pairId: 2, x: 1, y: 0, color: 'green', imagePrompt: 'School'} ] }));
};
export const generateOfflineProfessionConnect = async (o: GeneratorOptions) => generateOfflineWordConnect(o) as any as Promise<ProfessionConnectData[]>;
export const generateOfflineMatchstickSymmetry = async (options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Kibrit Simetrisi', instruction: 'Kırmızı çizgiye göre simetriğini oluştur.', pedagogicalNote: 'Görsel simetri.', imagePrompt: 'Matchstick', puzzles: [{ id: 1, axis: 'vertical', lines: matchstickPatterns[0].lines.map(l => ({...l, color: '#f59e0b'})) }] }));
};
export const generateOfflineVisualOddOneOutThemed = async (options: GeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const { worksheetCount, topic } = options;
    return Array.from({ length: worksheetCount }, () => ({ title: 'Tematik Farkı Bul', instruction: 'Temaya uymayanı bul.', pedagogicalNote: 'Kategorizasyon.', imagePrompt: 'Theme Odd', rows: [{ theme: topic || 'Meyveler', items: [ {description: 'Elma', imagePrompt: 'Apple', isOdd: false}, {description: 'Armut', imagePrompt: 'Pear', isOdd: false}, {description: 'Araba', imagePrompt: 'Car', isOdd: true} ] }] }));
};

// --- PHASE 3: STAR HUNT (CAMOUFLAGE MODE) ---
export const generateOfflineStarHunt = async (options: GeneratorOptions): Promise<StarHuntData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        // Difficulty Logic:
        // Easy: Clean grid, few stars, empty space.
        // Hard: Full grid, similar symbols (distractors), noise.
        
        const dim = 10;
        const target = '★';
        const easyDistractors = ['○', '□', '△', '.'];
        const hardDistractors = ['☆', '+', '*', 'x', '▲', '✶']; // Visually similar
        
        const distractors = difficulty === 'Zor' || difficulty === 'Uzman' ? hardDistractors : easyDistractors;
        const density = difficulty === 'Başlangıç' ? 0.4 : 1.0; // 1.0 means no empty space
        
        const grid = Array.from({length: dim}, () => Array.from({length: dim}, () => {
            if (Math.random() > density) return ''; // Empty space
            
            const isTarget = Math.random() > 0.85; // 15% chance of target
            if (isTarget) return target;
            
            return getRandomItems(distractors, 1)[0];
        }));
        
        const count = grid.flat().filter(c => c === target).length;
        
        return {
            title: `Yıldız Avı (${difficulty})`,
            instruction: difficulty === 'Başlangıç' ? 'Sadece içi dolu siyah yıldızları (★) bul.' : 'Gizlenmiş tüm yıldızları (★) bul. Benzer şekillere dikkat et!',
            pedagogicalNote: 'Şekil-Zemin ayrımı (Figure-Ground) ve seçici dikkat.',
            imagePrompt: 'Stars',
            grid,
            targetCount: count
        };
    });
};

// --- PHASE 3: SHAPE COUNTING (FIGURE-GROUND / OVERLAP) ---
export const generateOfflineShapeCounting = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { worksheetCount, concept, difficulty } = options;
    // Check if 3D mode is requested
    const is3D = concept === 'cubes';

    return Array.from({ length: worksheetCount }, () => {
        if (is3D) {
            // ... (Existing 3D Logic)
            const dim = 4;
            const grid = Array.from({length: dim}, () => Array.from({length: dim}, () => 0));
            let total = 0;
            for(let x=0; x<dim; x++) { for(let y=0; y<dim; y++) { if (Math.random() > 0.4) { const h = getRandomInt(1, 4); grid[x][y] = h; total += h; } } }
            if(total === 0) { grid[1][1] = 2; total = 2; }
            return { title: '3D Küp Sayma', instruction: 'Kaç tane birim küp olduğunu say.', pedagogicalNote: 'Uzamsal görselleştirme.', imagePrompt: '3D Cubes', figures: [{ targetShape: 'cube', correctCount: total, svgPaths: [], cubeData: grid } as any] };
        }
        
        // --- PHASE 3 FIGURE-GROUND LOGIC ---
        
        const numTargets = getRandomInt(3, 8);
        const numDistractors = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 8 : 15);
        const numNoiseLines = difficulty === 'Zor' || difficulty === 'Uzman' ? 10 : 0;
        
        const paths = [];
        
        // Canvas size 0-100
        const randomPos = () => getRandomInt(10, 90);
        const randomSize = () => getRandomInt(10, 20);
        
        // 1. Targets (Triangles)
        for(let i=0; i<numTargets; i++) {
            const cx = randomPos();
            const cy = randomPos();
            const size = randomSize();
            // Random rotation for hardness
            const rot = difficulty === 'Başlangıç' ? 0 : getRandomInt(0, 360);
            
            paths.push({
                d: createShapePath('triangle', cx, cy, size, rot),
                fill: 'rgba(59, 130, 246, 0.5)', // Blue transparent
                stroke: '#1e3a8a'
            });
        }
        
        // 2. Distractors (Circles, Squares)
        for(let i=0; i<numDistractors; i++) {
            const type = Math.random() > 0.5 ? 'circle' : 'square';
            const cx = randomPos();
            const cy = randomPos();
            const size = randomSize();
            const rot = getRandomInt(0, 360);
            
            // Allow overlap naturally by random placement
            paths.push({
                d: createShapePath(type, cx, cy, size, rot),
                fill: 'rgba(239, 68, 68, 0.5)', // Red transparent
                stroke: '#991b1b'
            });
        }
        
        // 3. Noise (Lines)
        for(let i=0; i<numNoiseLines; i++) {
            const cx = randomPos();
            const cy = randomPos();
            const size = randomSize() * 2; // Longer lines
            const rot = getRandomInt(0, 180);
            
            paths.push({
                d: createShapePath('line', cx, cy, size, rot),
                fill: 'none',
                stroke: 'rgba(0,0,0,0.3)'
            });
        }

        return {
            title: `Şekil Sayma - Karışık (${difficulty})`,
            instruction: 'Sadece MAVİ ÜÇGENLERİ bul ve say. Üst üste gelmiş olabilirler.',
            pedagogicalNote: 'Şekil-Zemin algısı (Figure-Ground Perception) ve görsel ayrıştırma.',
            imagePrompt: 'Overlapping Shapes',
            figures: [{
                targetShape: 'triangle',
                correctCount: numTargets,
                svgPaths: shuffle(paths) // Shuffle so targets aren't always on top/bottom
            }]
        };
    });
};

// Fallbacks
export const generateOfflinePunctuationColoring = async (o: GeneratorOptions) => generateOfflineVisualOddOneOut(o) as any as Promise<PunctuationColoringData[]>;
export const generateOfflineSynonymAntonymColoring = async (o: GeneratorOptions) => generateOfflineVisualOddOneOut(o) as any as Promise<SynonymAntonymColoringData[]>;
