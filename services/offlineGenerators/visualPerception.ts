
import { 
    FindTheDifferenceData, ShapeMatchingData, GridDrawingData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, AbcConnectData, ShapeCountingData,
    GeneratorOptions
} from '../../types';
import { getRandomInt, getRandomItems, turkishAlphabet, SHAPE_TYPES, TR_VOCAB, COLORS, generateSmartConnectGrid, CONNECT_COLORS, generateRandomPattern } from './helpers';

export const generateOfflineFindTheDifference = async (options: GeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount, worksheetCount, difficulty } = options;
    const results: FindTheDifferenceData[] = [];
    // Use confusing words as base for difference finding
    const pool = TR_VOCAB.confusing_words.flat();
    
    for (let i = 0; i < worksheetCount; i++) {
        const rows = Array.from({ length: itemCount || 5 }).map(() => {
            const baseWord = getRandomItems(pool, 1)[0];
            const correctIndex = getRandomInt(0, 3);
            let differentWord = '';
            const chars = baseWord.split('');

            if (difficulty === 'Başlangıç' && chars.length > 1) { 
                [chars[0], chars[chars.length - 1]] = [chars[chars.length - 1], chars[0]]; 
                differentWord = chars.join(''); 
            } else if (difficulty === 'Orta' && chars.length > 2) { 
                const pos = getRandomInt(1, chars.length - 2); 
                chars[pos] = turkishAlphabet[getRandomInt(0, turkishAlphabet.length - 1)]; 
                differentWord = chars.join(''); 
            } else { 
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
            title: `Farklı Olanı Bul (Hızlı Mod)`, 
            instruction: "Her satırda, diğerlerinden farklı yazılmış veya görünen kelimeyi bulup işaretleyin.",
            pedagogicalNote: "Bu etkinlik görsel ayrım ve detaylara dikkat becerisini güçlendirir.",
            rows 
        });
    }
    return results;
};

export const generateOfflineShapeMatching = async (options: GeneratorOptions): Promise<ShapeMatchingData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const results: ShapeMatchingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const shapeCount = difficulty === 'Başlangıç' ? 2 : (difficulty === 'Orta' ? 3 : 4);
        const leftColumn = Array.from({ length: itemCount || 5 }, (_, k) => ({ 
            id: k + 1, 
            shapes: getRandomItems(SHAPE_TYPES, shapeCount),
            color: getRandomItems(COLORS, 1)[0].css
        }));
        const rightColumn = getRandomItems(leftColumn, leftColumn.length).map((item, index) => ({ 
            id: String.fromCharCode(65 + index), 
            shapes: item.shapes,
            color: item.color 
        }));
        
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

export const generateOfflineGridDrawing = async (options: GeneratorOptions): Promise<GridDrawingData[]> => {
    const {itemCount, worksheetCount, gridSize, difficulty} = options;
    const results: GridDrawingData[] = [];
    for(let i=0; i < worksheetCount; i++){
        const dim = gridSize || 6;
        const density = difficulty === 'Başlangıç' ? 1 : (difficulty === 'Orta' ? 2 : 3);
        
        const drawings = Array.from({length: itemCount || 2}).map(() => {
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

export const generateOfflineBlockPainting = async (options: GeneratorOptions): Promise<BlockPaintingData[]> => {
    const { worksheetCount } = options;
    const results: BlockPaintingData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const pattern: number[][] = [];
        for(let r=0; r<8; r++) {
            const row: number[] = [];
            for(let c=0; c<4; c++) row.push(Math.random() > 0.5 ? 1 : 0);
            pattern.push([...row, ...row.slice().reverse()]);
        }

        results.push({
            title: 'Blok Boyama (Piksel Sanatı)',
            instruction: "Verilen renkli blokları kullanarak deseni oluşturun veya desene göre kareleri boyayın.",
            pedagogicalNote: "Görsel bütünleme ve parça-bütün ilişkisi kurma becerisi.",
            grid: {rows: 8, cols: 8},
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
            
            if (difficulty === 'Zor' || difficulty === 'Uzman') {
                 const baseSegments = [true, true, false, true, false, true, true, false, false];
                 const rotate90 = (segs: boolean[]) => [segs[6], segs[3], segs[0], segs[7], segs[4], segs[1], segs[8], segs[5], segs[2]];
                 const r0 = baseSegments;
                 const r90 = rotate90(r0);
                 const r180 = rotate90(r90);
                 const r270 = rotate90(r180);
                 const rotations = [r0, r90, r180, r270];
                 const oddOne = [...r0];
                 oddOne[4] = !oddOne[4]; 
                 const items = Array(4).fill(null).map((_, idx) => {
                     if (idx === correctIndex) return { segments: oddOne, rotation: 0 };
                     return { segments: rotations[idx % 4], rotation: 0 };
                 });
                 return { items, correctIndex, reason: "Diğerleri aynı şeklin döndürülmüş hali, bu farklı." };
            } else {
                const standard = [true, true, true, true, true, true, true, true, true];
                for(let k=0; k<3; k++) standard[getRandomInt(0,8)] = false;
                const odd = [...standard];
                const flipIdx = getRandomInt(0, 8);
                odd[flipIdx] = !odd[flipIdx];
                const items = Array(4).fill(null).map((_, idx) => ({ segments: idx === correctIndex ? odd : standard }));
                return { items, correctIndex, reason: "Diğerlerinden farklı çizgiye sahip." };
            }
        });

        results.push({
            title: 'Görsel Farklı Olanı Bul',
            instruction: difficulty === 'Uzman' ? "Şekiller döndürülmüş olabilir. Yapısal olarak farklı olanı bul." : "Her satırda kuralı bozan şekli bul.",
            pedagogicalNote: "Görsel sınıflandırma, zihinsel döndürme ve mantıksal çıkarım.",
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
        const dotCount = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 5 : 7);
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

export const generateOfflineAbcConnect = async (options: GeneratorOptions): Promise<AbcConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: AbcConnectData[] = [];
    const dim = gridSize || 6;
    const count = Math.floor((itemCount || 6) / 2);

    for(let i=0; i<worksheetCount; i++){
        const letters = ['A','B','C','D','E','F','G','H','J'].slice(0, count);
        const placements = generateSmartConnectGrid(dim, count);
        
        const points = placements.map(p => ({
            label: letters[p.pairIndex],
            x: p.x,
            y: p.y,
            color: CONNECT_COLORS[p.pairIndex % CONNECT_COLORS.length]
        }));

        results.push({
            title: 'Nokta Birleştirme (Hızlı Mod)',
            instruction: "Aynı harfleri, çizgiler birbirini kesmeyecek şekilde birleştirin. Tüm kareler dolmalıdır.",
            pedagogicalNote: "Planlama ve uzamsal akıl yürütme.",
            puzzles: [{id: 1, gridDim: dim, points}]
        });
    }
    return results;
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
            pedagogicalNote: "Görsel ayrıştırma, parça-bütün ilişkisi ve sistematik sayma becerisi.",
            figures: [{
                svgPaths: figure.svgPaths,
                targetShape: 'triangle',
                correctCount: figure.correctCount
            }]
        };
    });
};
