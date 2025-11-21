

import { GeneratorOptions, MathPuzzleData, NumberCapsuleData, NumberPatternData, NumberPyramidData, OddEvenSudokuData, Sudoku6x6ShadedData, DivisionPyramidData, MultiplicationPyramidData, KendokuData, OperationSquareFillInData, OperationSquareMultDivData, OperationSquareSubtractionData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, FutoshikiData, FutoshikiLengthData, VisualNumberPatternData, LogicGridPuzzleData, RomanNumeralStarHuntData, RomanNumeralConnectData, RomanNumeralMultiplicationData, RoundingConnectData, ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, OddOneOutData, ShapeType, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData, ShapeNumberPatternData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, EMOJIS, generateSudokuGrid, generateLatinSquare, TR_VOCAB, SHAPE_TYPES, ITEM_CATEGORIES, generateSmartConnectGrid, CONNECT_COLORS, generateMaze, getDifficultySettings } from './helpers';

// --- ROMAN NUMERAL HELPERS ---
const toRoman = (num: number): string => {
    if (num <= 0 || num > 3999) return '';
    const map: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let result = '';
    for (const key in map) {
        while (num >= map[key]) {
            result += key;
            num -= map[key];
        }
    }
    return result;
};

export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { itemCount, worksheetCount, difficulty, operations, numberRange } = options;
    const settings = getDifficultySettings(difficulty);
    const objects = EMOJIS.slice(0, 15);
    
    let valueMin = settings.numberRange.min;
    let valueMax = settings.numberRange.max;
    
    // Custom override if user provided specific range manually
    if (numberRange) {
        const parts = numberRange.split('-');
        if (parts.length === 2) {
            valueMin = parseInt(parts[0]);
            valueMax = parseInt(parts[1]);
        }
    }

    let ops = settings.operations;
    // Override if manually selected
    if (operations === 'add') ops = ['+'];
    else if (operations === 'addsub') ops = ['+', '-'];
    else if (operations === 'mult') ops = ['+', '-', '*'];
    else if (operations === 'all') ops = ['+', '-', '*', '/'];

    const results: MathPuzzleData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const currentObjects = getRandomItems(objects, 3);
        const values = currentObjects.map(() => getRandomInt(valueMin, valueMax));
        
        const puzzles = Array.from({ length: itemCount || 6 }).map(() => {
            const op = getRandomItems(ops, 1)[0];
            const [idx1, idx2] = [getRandomInt(0, 2), getRandomInt(0, 2)];
            
            let val1 = values[idx1];
            let val2 = values[idx2];
            let problemStr = `${currentObjects[idx1]} ${op} ${currentObjects[idx2]} = ?`;
            let question = `İpucu: ${currentObjects[0]}=${values[0]}, ${currentObjects[1]}=${values[1]}, ${currentObjects[2]}=${values[2]}`;
            let answer = 0;

            if (op === '+') { answer = val1 + val2; } 
            else if (op === '-') { 
                if (val1 < val2) { [val1, val2] = [val2, val1]; problemStr = `${currentObjects[idx2]} ${op} ${currentObjects[idx1]} = ?`; } 
                answer = val1 - val2; 
            } 
            else if (op === '*') { answer = val1 * val2; } 
            else if (op === '/') { 
                if (val2 === 0) val2 = 1; 
                const product = val1 * val2; 
                problemStr = `${product} ${op} ${currentObjects[idx2]} = ?`; 
                question = `İpucu: ${currentObjects[idx2]}=${val2}. (Bölünen sayı ${product})`; 
                answer = val1; 
            }
            return { problem: problemStr, question, answer: answer.toString() };
        });
        results.push({ 
            title: `Matematik Bulmacası (${difficulty})`, 
            instruction: "Sembollerin sayısal değerlerini bulun ve işlemi çözün.",
            pedagogicalNote: "Cebirsel düşünme ve sembolik işlem yapma becerisi.",
            puzzles 
        });
    }
    return results;
};

export const generateOfflineNumberPattern = async (options: GeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, worksheetCount, difficulty, patternType } = options;
    const results: NumberPatternData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const patterns = Array.from({ length: itemCount || 8 }).map(() => {
            let start = getRandomInt(1, 10);
            let sequence = [start];
            let answer = 0;
            const type = patternType || (difficulty === 'Başlangıç' ? 'arithmetic' : 'complex');

            if (type === 'arithmetic' || difficulty === 'Başlangıç') {
                const step = getRandomInt(2, 5);
                for (let k = 0; k < 4; k++) sequence.push(sequence[k] + step);
                answer = sequence[4] + step;
            } else if (type === 'geometric' || difficulty === 'Orta') {
                 const step = getRandomInt(2, 3);
                 for (let k = 0; k < 4; k++) sequence.push(sequence[k] * step);
                 answer = sequence[4] * step;
            } else {
                const step1 = getRandomInt(2, 3);
                const step2 = getRandomInt(1, 3);
                for (let k = 0; k < 4; k++) sequence.push(sequence[k] * step1 + step2);
                answer = sequence[4] * step1 + step2;
            }
            return { sequence: `${sequence.slice(0, 5).join(', ')}, ?`, answer: answer.toString() };
        });
        results.push({ title: 'Sayı Örüntüsü (Hızlı Mod)', instruction: "Örüntü kuralını bul ve '?' yerine gelecek sayıyı yaz.", pedagogicalNote: "Matematiksel tümevarım ve ilişkilendirme becerisi.", patterns });
    }
    return results;
};

export const generateOfflineFutoshiki = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount } = options;
    const settings = getDifficultySettings(difficulty);
    const size = Math.min(6, Math.max(4, settings.sudokuSize - 2)); 
    
    const results: FutoshikiData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const latinSquare = generateLatinSquare(size);
        const constraints: { row1: number; col1: number; row2: number; col2: number; symbol: '>' | '<' }[] = [];
        
        const constraintCount = Math.floor(size * size * 0.6);
        for (let k = 0; k < constraintCount; k++) {
            const r = getRandomInt(0, size - 1);
            const c = getRandomInt(0, size - 1);
            const dir = Math.random() > 0.5 ? 'right' : 'down';
            
            if (dir === 'right' && c < size - 1) {
                const val1 = latinSquare[r][c];
                const val2 = latinSquare[r][c+1];
                constraints.push({ row1: r, col1: c, row2: r, col2: c+1, symbol: val1 > val2 ? '>' : '<' });
            } else if (dir === 'down' && r < size - 1) {
                const val1 = latinSquare[r][c];
                const val2 = latinSquare[r+1][c];
                constraints.push({ row1: r, col1: c, row2: r+1, col2: c, symbol: val1 > val2 ? '>' : '<' });
            }
        }

        const revealRate = difficulty === 'Başlangıç' ? 0.5 : (difficulty === 'Orta' ? 0.3 : 0.2);
        const maskedGrid: (number | null)[][] = latinSquare.map(row => row.map(n => Math.random() < revealRate ? n : null));

        results.push({ 
            title: `Futoşiki (${difficulty})`, 
            prompt: 'Büyüktür/küçüktür sembollerine göre sayıları yerleştirin.', 
            instruction: "Her satır ve sütunda rakamlar bir kez bulunmalı. > ve < işaretlerine dikkat et.",
            pedagogicalNote: "Mantıksal çıkarım ve sayısal ilişki analizi.",
            puzzles: [{ size, numbers: maskedGrid, constraints }] 
        });
    }
    return results;
}

export const generateOfflineNumberPyramid = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const settings = getDifficultySettings(difficulty);
    const results: NumberPyramidData[] = [];
    
    for (let i = 0; i < worksheetCount; i++) {
        const pyramids = Array.from({ length: itemCount || 2 }).map(() => {
            const rowsCount = settings.pyramidRows || 3;

            const fullPyramid: number[][] = [];
            const baseRow = Array.from({ length: rowsCount }, () => getRandomInt(1, 10));
            fullPyramid.push(baseRow);
            
            for (let r = 1; r < rowsCount; r++) {
                const prevRow = fullPyramid[r - 1];
                const newRow: number[] = [];
                for (let c = 0; c < prevRow.length - 1; c++) {
                    newRow.push(prevRow[c] + prevRow[c + 1]);
                }
                fullPyramid.push(newRow);
            }

            const visualPyramid = fullPyramid.reverse();
            const puzzlePyramid: (number | null)[][] = visualPyramid.map(row => [...row]);
            
            for(let r=0; r<rowsCount; r++) {
                for(let c=0; c<puzzlePyramid[r].length; c++) {
                    if (Math.random() > 0.4) puzzlePyramid[r][c] = null;
                }
            }
             if (puzzlePyramid[rowsCount - 1].every(v => v === null)) {
                puzzlePyramid[rowsCount - 1][0] = visualPyramid[rowsCount - 1][0];
            }

            return { title: `Piramit`, rows: puzzlePyramid };
        });
        results.push({ title: `Sihirli Piramit (${difficulty})`, prompt: 'Her sayı, altındaki iki sayının toplamıdır.', instruction: "Piramidin tepesine doğru toplama yaparak boşlukları doldur.", pedagogicalNote: "İşlem akıcılığı ve parça-bütün ilişkisi.", pyramids });
    }
    return results;
}

export const generateOfflineNumberCapsule = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
     const {worksheetCount} = options;
     return Array(worksheetCount).fill({ 
         title: 'Kapsül Oyunu (Hızlı Mod)', 
         prompt: 'Kapsülleri doldurun.',
         instruction: "Her kapsülün içindeki sayıların toplamı hedef sayıya eşit olmalıdır.",
         pedagogicalNote: "Toplama ve mantıksal eleme becerisi.",
         puzzles: [{
             title: 'Bulmaca 1',
             numbersToUse: '1-9 arası',
             grid: [[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]],
             capsules: [
                 { cells: [{row:0, col:0}, {row:0,col:1}], sum: 10},
                 { cells: [{row:1, col:0}, {row:2,col:0}], sum: 8},
                 { cells: [{row:0, col:2}, {row:1,col:2}, {row:1,col:1}], sum: 15}
             ]
         }] 
    });
}

export const generateOfflineOddEvenSudoku = async (options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const {itemCount, worksheetCount, difficulty} = options;
    const settings = getDifficultySettings(difficulty);
    const size = 6; 
    
    const results: OddEvenSudokuData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const puzzles = Array.from({length: itemCount || 2}).map(() => {
            const grid = generateSudokuGrid(size, difficulty);
            const constrainedCells = [];
            for(let r=0; r<size; r++) for(let c=0; c<size; c++){
                if(grid[r][c] === null && Math.random() > 0.5) constrainedCells.push({row:r, col: c});
            }
            return {
                title: 'Bulmaca',
                numbersToUse: '1-6',
                grid,
                constrainedCells
            }
        });
        results.push({title: 'Tek-Çift Sudoku (Hızlı Mod)', prompt: 'Gri kutulara çift sayı gelmelidir.', instruction: "Sudoku kurallarına ek olarak, gri kutulara sadece çift sayı yazabilirsin.", pedagogicalNote: "Kategorizasyon ve mantıksal kısıtlama yönetimi.", puzzles});
    }
    return results;
}

export const generateOfflineSudoku6x6Shaded = async (options: GeneratorOptions): Promise<Sudoku6x6ShadedData[]> => {
    const res = await generateOfflineOddEvenSudoku(options);
    return res.map(r => ({
        ...r, 
        title: '6x6 Gölgeli Sudoku (Hızlı Mod)', 
        puzzles: r.puzzles.map(p => ({grid: p.grid, shadedCells: p.constrainedCells}))
    }));
}

export const generateOfflineRomanNumeralStarHunt = async (options: GeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
    const { worksheetCount, difficulty } = options;
    const size = difficulty === 'Başlangıç' ? 5 : 6;
    const starsPerRegion = difficulty === 'Başlangıç' ? 1 : 2;

    const results: RomanNumeralStarHuntData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        // Use Latin Square to guarantee no row/col conflicts for stars
        const latin = generateLatinSquare(size);
        const solution = latin.map(row => row.map(val => val === 1 ? 1 : 0));

        const rowCounts = solution.map(row => toRoman(row.reduce((a,b) => a+b, 0)));
        const colCounts = Array.from({length: size}, (_, c) => toRoman(solution.reduce((a, row) => a + row[c], 0)));

        const grid: (string | null)[][] = Array.from({ length: size + 1 }, () => Array(size + 1).fill(null));
        
        // Fill headers
        for(let r=0; r<size; r++) grid[r+1][0] = rowCounts[r];
        for(let c=0; c<size; c++) grid[0][c+1] = colCounts[c];

        results.push({
            title: 'Yıldız Avı (Romen Rakamlı) (Hızlı Mod)',
            prompt: 'Her satır ve sütunda belirtilen sayıda yıldız olmalı.',
            instruction: "Tablonun kenarındaki Romen rakamları, o satır/sütundaki yıldız sayısını gösterir.",
            pedagogicalNote: "Mantıksal eleme ve uzamsal akıl yürütme.",
            grid,
            starCount: starsPerRegion
        });
    }
    return results;
}

export const generateOfflineRomanNumeralMultiplication = async (options: GeneratorOptions): Promise<RomanNumeralMultiplicationData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: RomanNumeralMultiplicationData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const puzzles = Array.from({ length: itemCount || 4 }, () => {
            const n1 = getRandomInt(1, 10);
            const n2 = getRandomInt(1, 10);
            const n3 = getRandomInt(1, 10);
            const n4 = getRandomInt(1, 10);
            return {
                row1: toRoman(n1), row2: toRoman(n2),
                col1: toRoman(n3), col2: toRoman(n4),
                results: {
                    r1c1: Math.random() > 0.5 ? toRoman(n1 * n3) : null,
                    r1c2: Math.random() > 0.5 ? toRoman(n1 * n4) : null,
                    r2c1: Math.random() > 0.5 ? toRoman(n2 * n3) : null,
                    r2c2: Math.random() > 0.5 ? toRoman(n2 * n4) : null,
                }
            };
        });
        results.push({
            title: 'İşlem Karesi (Romen Rakamlı) (Hızlı Mod)',
            prompt: 'Çarpma işlemi yaparak işlem karesindeki boşlukları doldurun.',
            instruction: "Satır ve sütun başlıklarını çarpıp sonuçları ilgili kutulara yazın.",
            pedagogicalNote: "Romen rakamları ile çarpma işlemi pratiği.",
            puzzles
        });
    }
    return results;
}

export const generateOfflineKendoku = async (options: GeneratorOptions): Promise<KendokuData[]> => {
    const { difficulty, worksheetCount } = options;
    const size = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 4 : 5);
    const results: KendokuData[] = [];

    for(let i=0; i<worksheetCount; i++) {
        const latinSquare = generateLatinSquare(size);
        const visited = Array.from({length: size}, () => Array(size).fill(false));
        const cages: { cells: { row: number; col: number }[]; operation: '+' | '−' | '×' | '÷'; target: number; }[] = [];

        for(let r=0; r<size; r++) {
            for(let c=0; c<size; c++) {
                if(visited[r][c]) continue;

                const cageCells = [{row: r, col: c}];
                visited[r][c] = true;
                const cageSizeTarget = getRandomInt(1, 3);
                
                if(cageSizeTarget > 1) {
                    const neighbors = [{row: r+1, col: c}, {row: r, col: c+1}].filter(n => n.row < size && n.col < size && !visited[n.row][n.col]);
                    if(neighbors.length > 0) {
                        const next = getRandomItems(neighbors, 1)[0];
                        visited[next.row][next.col] = true;
                        cageCells.push(next);
                    }
                }

                const values = cageCells.map(cell => latinSquare[cell.row][cell.col]);
                const op = getRandomItems(['+', '×', '-', '÷'], 1)[0];
                let target = 0;
                let finalOp: any = op;

                if (cageCells.length === 1) {
                    target = values[0];
                    finalOp = '';
                } else {
                    if (op === '+') target = values.reduce((a,b) => a+b, 0);
                    else if (op === '×') target = values.reduce((a,b) => a*b, 1);
                    else if (op === '-') {
                        if(values.length === 2) target = Math.abs(values[0] - values[1]);
                        else { target = values.reduce((a,b) => a+b, 0); finalOp = '+'; }
                    }
                    else if (op === '÷') {
                        if(values.length === 2) {
                             const max = Math.max(...values);
                             const min = Math.min(...values);
                             if(max % min === 0) target = max / min;
                             else { target = values.reduce((a,b) => a+b, 0); finalOp = '+'; }
                        } else { target = values.reduce((a,b) => a+b, 0); finalOp = '+'; }
                    }
                }
                
                cages.push({ cells: cageCells, operation: finalOp, target });
            }
        }
        
        const displayGrid = Array.from({length: size}, () => Array(size).fill(null));

        results.push({
            title: 'Kendoku (Hızlı Mod)',
            prompt: 'İşlem ipuçlarını kullanarak mantık bulmacasını çözün.',
            instruction: "Kafeslerin sol üstündeki sayı ve işleme göre kutuları doldur. Her satır ve sütunda rakamlar bir kez kullanılmalı.",
            pedagogicalNote: "Aritmetik işlem yeteneği ve problem çözme stratejileri.",
            puzzles: [{ size, grid: displayGrid, cages }]
        });
    }
    return results;
}

// ... (Re-export others and update generateOfflineShapeSudoku similarly)

export const generateOfflineShapeSudoku = async (options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
    const {itemCount, worksheetCount, difficulty} = options;
    const settings = getDifficultySettings(difficulty);
    const size = settings.sudokuSize;
    
    return Array.from({length: worksheetCount}, () => {
        const grid = generateSudokuGrid(size, difficulty);
        const shapes = getRandomItems(SHAPE_TYPES, size);
        const shapeGrid = grid.map(row => row.map(cell => cell === null ? null : shapes[(cell-1) % shapes.length]));
        
        return {
            title: `Şekilli Sudoku (${difficulty})`,
            prompt: 'Şekilleri tekrar etmeyecek şekilde yerleştirin.',
            instruction: `Her satır, sütun ve bölgede her şekil bir kez kullanılmalıdır.`,
            pedagogicalNote: "Sayılar yerine semboller kullanarak Sudoku mantığını öğretir.",
            puzzles: [{grid: shapeGrid, shapesToUse: shapes.map(s => ({shape: s, label: s}))}]
        }
    });
}

export const generateOfflineFutoshikiLength = async (options: GeneratorOptions): Promise<FutoshikiLengthData[]> => {
    const res = await generateOfflineFutoshiki(options);
    const unitMap: Record<number, string> = { 1: '10cm', 2: '25cm', 3: '50cm', 4: '1m', 5: '2m', 6: '5m', 7: '10m', 8: '20m', 9: '50m' };
    const transformedPuzzles = res[0].puzzles.map(p => ({
        ...p,
        units: p.numbers.map(row => row.map(num => num === null ? null : unitMap[num] || `${num}m`))
    }));
    return [{ ...res[0], title: 'Futoşiki (Uzunluk) (Hızlı Mod)', prompt: 'Uzunlukları büyüktür/küçüktür işaretlerine göre sırala.', instruction: 'Her satır ve sütunda her uzunluk bir kez kullanılmalı.', puzzles: transformedPuzzles }];
}

// ... (Keep other exports)
export const generateOfflineDivisionPyramid = async (options: GeneratorOptions) => generateOfflineNumberPyramid(options) as any; 
export const generateOfflineMultiplicationPyramid = async (options: GeneratorOptions) => generateOfflineNumberPyramid(options) as any;
export const generateOfflineOperationSquareSubtraction = async (options: GeneratorOptions) => generateOfflineOperationSquareFillIn(options) as any;
export const generateOfflineOperationSquareFillIn = async (options: GeneratorOptions): Promise<OperationSquareFillInData[]> => {
     const { worksheetCount } = options;
     const results: OperationSquareFillInData[] = [];
     for(let i=0; i<worksheetCount; i++) {
         const nums = shuffle([1,2,3,4,5,6,7,8,9]);
         const n1=nums[0], n2=nums[1], n3=nums[2], n4=nums[3];
         const cleanGrid: (string|null)[][] = [
             [null, '+', null, '=', (n1+n2).toString()],
             ['+', null, '+', null, null],
             [null, '+', null, '=', (n3+n4).toString()],
             ['=', null, '=', null, null],
             [(n1+n3).toString(), null, (n2+n4).toString(), null, null]
         ];
         results.push({
             title: 'İşlem Karesi (Yerleştirme) (Hızlı Mod)',
             prompt: 'Verilen sayıları yerleştir.',
             instruction: "Sonuçları tutturmak için kutulara uygun sayıları yaz.",
             pedagogicalNote: "Denklem çözme ve aritmetik akıl yürütme.",
             puzzles: [{grid: cleanGrid, numbersToUse: [n1, n2, n3, n4], results: []}]
         });
     }
     return results;
}
export const generateOfflineMultiplicationWheel = async (options: GeneratorOptions): Promise<MultiplicationWheelData[]> => {
     const { itemCount, worksheetCount } = options;
     const results: MultiplicationWheelData[] = [];
     for(let i=0; i<worksheetCount; i++) {
         const puzzles = Array.from({length: itemCount || 6}).map(() => {
             const center = getRandomInt(2, 9);
             const outer = Array.from({length: 8}, () => getRandomInt(1, 10));
             const outerMasked: (number|null)[] = outer.map(n => Math.random() > 0.4 ? n : null);
             return { outerNumbers: outerMasked, innerResult: center };
         });
         results.push({title: 'Çarpım Çarkı (Hızlı Mod)', prompt: 'Merkezdeki sayıyla çarpıp dışarı yazın.', puzzles});
     }
     return results;
}
export const generateOfflineTargetNumber = async (options: GeneratorOptions): Promise<TargetNumberData[]> => {
     const {itemCount, worksheetCount} = options;
     return Array.from({length: worksheetCount}, () => ({ 
         title: 'Hedef Sayı (Hızlı Mod)', 
         prompt: 'Verilen sayılarla dört işlem yaparak hedef sayıya ulaşın.',
         puzzles: Array.from({length: itemCount || 4}, () => {
             const n1 = getRandomInt(1, 9);
             const n2 = getRandomInt(1, 9);
             const n3 = getRandomInt(1, 9);
             const n4 = getRandomInt(1, 9);
             return {target: n1 * n2 + n3 - n4, givenNumbers: [n1, n2, n3, n4]};
         }) 
    }));
}
export const generateOfflineOperationSquareMultDiv = async (options: GeneratorOptions): Promise<OperationSquareMultDivData[]> => {
    const { worksheetCount } = options;
    const results: OperationSquareMultDivData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const n1 = getRandomInt(2, 5);
        const n2 = getRandomInt(2, 5);
        const n3 = getRandomInt(2, 5);
        const n4 = getRandomInt(2, 5);
        const grid: (string|null)[][] = [
            [null, '×', n2.toString(), '=', (n1*n2).toString()],
            ['÷', null, '÷', null, null],
            [n3.toString(), '×', null, '=', (n3*n4).toString()],
            ['=', null, '=', null, null],
            [(n1/n3 * 100).toFixed(0), null, (n2/n4 * 100).toFixed(0), null, null]
        ];
        results.push({ title: 'İşlem Karesi (Çarpma/Bölme) (Hızlı Mod)', prompt: 'İşlemleri yaparak boşlukları doldurun.', puzzles: [{ grid }] });
    }
    return results;
}
export const generateOfflineVisualNumberPattern = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: VisualNumberPatternData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const puzzles = Array.from({length: itemCount || 3}, () => {
            const start = getRandomInt(1, 5);
            const step = getRandomInt(2, 4);
            const items = Array.from({length: 4}, (_, k) => ({
                number: start + k * step,
                color: ['#3B82F6', '#EF4444', '#10B981'][k % 3],
                size: 1 + (k % 2) * 0.5
            }));
            return { items, rule: `Sayılar ${step} artıyor.`, answer: start + 4 * step };
        });
        results.push({ title: 'Görsel Sayı Örüntüsü (Hızlı Mod)', prompt: 'Görsel dizideki kuralı bulup eksik sayıyı tamamlayın.', instruction: "Sayı, renk ve boyut değişimindeki kuralı bulup bir sonraki adımı tahmin et.", pedagogicalNote: "Çoklu değişkenli örüntü tanıma becerisi.", puzzles });
    }
    return results;
}
export const generateOfflineLogicGridPuzzle = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    const { worksheetCount } = options;
    const peoplePool = ['Ali', 'Ayşe', 'Can', 'Duru', 'Ece', 'Mert'];
    const petPool = ['Kedi', 'Köpek', 'Kuş', 'Balık', 'Tavşan', 'Kaplumbağa'];
    const colorPool = ['Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Mor', 'Turuncu'];

    const results: LogicGridPuzzleData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const people = getRandomItems(peoplePool, 3);
        const pets = getRandomItems(petPool, 3);
        const colors = getRandomItems(colorPool, 3);
        
        const clues = [
            `${people[0]}, ${pets[0]} besliyor.`,
            `${colors[0]} rengini seven kişi ${people[0]}.`,
            `${people[1]} ${colors[1]} rengini sever ama ${pets[2]} beslemez.`,
            `${pets[2]} sahibi ${colors[2]} rengini seviyor.`,
            `${people[2]} ${pets[0]} sahibi değildir.`
        ];

        results.push({ 
            title: 'Mantık Tablosu (Hızlı Mod)', 
            prompt: 'Verilen ipuçlarını kullanarak kimin hangi hayvana sahip olduğunu ve hangi rengi sevdiğini bulun.',
            instruction: "Tabloda 'Evet' için ✔, 'Hayır' için ✘ işareti koyarak ilerle.",
            pedagogicalNote: "Sistematik düşünme, eleme ve çıkarım yapma becerileri.",
            clues: shuffle(clues).slice(0, 4), 
            people: people, 
            categories: [
                { title: 'Evcil Hayvan', items: pets.map(p => ({name: p, imageDescription: p})) },
                { title: 'Favori Renk', items: colors.map(c => ({name: c, imageDescription: c})) }
            ]
        });
    }
    return results;
}
export const generateOfflineOddOneOut = async (options: GeneratorOptions): Promise<OddOneOutData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const results: OddOneOutData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const groups = Array.from({ length: itemCount || 5 }).map(() => {
            const mainCatKey = topic && topic !== 'Rastgele' && ITEM_CATEGORIES.includes(topic.toLowerCase()) ? topic.toLowerCase() : getRandomItems(ITEM_CATEGORIES, 1)[0];
            const oddCatKey = getRandomItems(ITEM_CATEGORIES.filter(c => c !== mainCatKey), 1)[0];
            const vocab = TR_VOCAB as any;
            const mainWords = getRandomItems(vocab[mainCatKey] || [], 3);
            const oddWord = getRandomItems(vocab[oddCatKey] || [], 1)[0];
            const words = [...mainWords, oddWord].filter(Boolean) as string[];
            return { words: shuffle(words) };
        });
        results.push({ title: 'Farkı Fark Et (Anlamsal) (Hızlı Mod)', instruction: "Her grupta, anlamsal olarak diğerlerinden farklı olan kelimeyi bulun.", pedagogicalNote: "Kategorik düşünme ve semantik ayrım becerisi.", groups });
    }
    return results;
};
export const generateOfflineThematicOddOneOut = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const res = await generateOfflineOddOneOut({ ...options, itemCount: (itemCount || 5) * worksheetCount, worksheetCount: 1});
    return [{
        title: `Tematik Farkı Bul (${topic || 'Rastgele'}) (Hızlı Mod)`,
        prompt: "Her satırda temaya uymayan kelimeyi bul.",
        theme: topic || 'Genel',
        rows: res[0].groups.map(g => ({words: g.words.map(w => ({ text: w })), oddWord: ''})),
        sentencePrompt: 'Farklı kelimelerle birer cümle kur.'
    }];
};
export const generateOfflineThematicOddOneOutSentence = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const res = await generateOfflineOddOneOut({ ...options, itemCount: (itemCount || 5) * worksheetCount, worksheetCount: 1});
    return [{
        title: `Tematik Farklı Kelimeyle Cümle Kurma (Hızlı Mod)`,
        prompt: "Her satırda temaya uymayan kelimeyi bul ve o kelimeyle bir cümle kur.",
        rows: res[0].groups.map(g => ({words: g.words, oddWord: ''})),
        sentencePrompt: 'Farklı kelimelerle kurduğun cümleleri aşağıya yaz.'
    }];
};
export const generateOfflineColumnOddOneOutSentence = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    const {itemCount, worksheetCount} = options;
    const res = await generateOfflineOddOneOut({ ...options, itemCount: (itemCount || 4) * worksheetCount, worksheetCount: 1});
    return [{
        title: 'Sütunlarda Farklı Olan (Hızlı Mod)',
        prompt: 'Her sütunda farklı olanı bul.',
        columns: res[0].groups.map(g => ({words: g.words, oddWord: ''})),
        sentencePrompt: 'Farklı kelimelerle cümle kur.'
    }];
};
export const generateOfflinePunctuationMaze = async (options: GeneratorOptions): Promise<PunctuationMazeData[]> => {
    const { worksheetCount, difficulty } = options;
    const settings = getDifficultySettings(difficulty);
    const rows = settings.mazeComplexity, cols = settings.mazeComplexity;
    
    return Array.from({length: worksheetCount}, () => {
        const maze = generateMaze(Math.floor(rows/2), Math.floor(cols/2));
        const rules = [];
        for(let r=0; r<maze.length; r++) {
            for(let c=0; c<maze[r].length; c++) {
                const isPath = maze[r][c] === 0;
                const text = isPath ? "Doğru Kural" : "Yanlış Kural"; 
                if (rules.length < 10) rules.push({ id: rules.length+1, text, isCorrect: isPath });
            }
        }
        return {
            title: 'Noktalama Labirenti (Hızlı Mod)',
            prompt: 'Doğru kuralları takip ederek çıkışa ulaş.',
            punctuationMark: '.',
            rules: shuffle([
                {id: 1, text: 'Cümlenin sonuna konur.', isCorrect: true},
                {id: 2, text: 'Soru cümlelerinde kullanılır.', isCorrect: false},
                {id: 3, text: 'Sıra sayılarından sonra konur.', isCorrect: true},
                {id: 4, text: 'Seslenme bildiren kelimeden sonra kullanılır.', isCorrect: false},
                {id: 5, text: 'Tarihlerin yazılışında gün, ay ve yılı ayırır.', isCorrect: true},
                {id: 6, text: 'Sevinç, şaşkınlık gibi duyguları anlatır.', isCorrect: false}
            ])
        };
    });
};
export const generateOfflinePunctuationPhoneNumber = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
    return Array.from({length: options.worksheetCount}, () => {
        const targetNum = getRandomInt(1000000, 9999999).toString();
        const clues = targetNum.split('').map((digit, i) => ({ id: i+1, text: `${i+1}. rakam: ${digit}`}));
        return {
            title: 'Gizli Telefon Numarası (Hızlı Mod)',
            prompt: 'İpuçlarını çöz ve numarayı bul.',
            instruction: 'Her ipucu bir rakama karşılık geliyor.',
            clues: clues,
            solution: [{punctuationMark: '#', number: parseInt(targetNum)}]
        };
    });
};
export const generateOfflineShapeNumberPattern = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    const {itemCount, worksheetCount} = options;
    return Array.from({length: worksheetCount}, () => ({
        title: 'Şekilli Sayı Örüntüsü (Hızlı Mod)',
        instruction: "Şekillerin köşelerindeki sayıları toplayıp '?' yerine gelecek sayıyı yazın.",
        pedagogicalNote: "Görsel ve sayısal örüntüleri birleştirerek problem çözme.",
        patterns: Array.from({length: itemCount || 3}, () => {
            const left = getRandomInt(1, 10);
            const right = getRandomInt(1, 10);
            const top = left + right;
            return {
                shapes: [
                    { type: 'triangle', numbers: [left, right, top] },
                    { type: 'triangle', numbers: [left+2, right+2, top+4] },
                    { type: 'triangle', numbers: [left+5, right+5, '?'] }
                ]
            };
        })
    }))
};
export const generateOfflineRoundingConnect = async (options: GeneratorOptions): Promise<RoundingConnectData[]> => {
    const { itemCount, worksheetCount, gridSize } = options;
    const results: RoundingConnectData[] = [];
    const dim = gridSize || 6;
    const pairCount = Math.floor((itemCount || 6) / 2);
    
    for (let i = 0; i < worksheetCount; i++) {
        const placements = generateSmartConnectGrid(dim, pairCount);
        const numbers: RoundingConnectData['numbers'] = [];

        for (let j = 0; j < pairCount; j++) {
            const base = getRandomInt(1, 9) * 10;
            const p1 = placements.find(p => p.pairIndex === j && p.isStart)!;
            const valToRound = base + getRandomInt(1, 4); 
            numbers.push({ value: valToRound, group: j, x: p1.x, y: p1.y });
            const p2 = placements.find(p => p.pairIndex === j && !p.isStart)!;
            numbers.push({ value: base, group: j, x: p2.x, y: p2.y });
        }
        
        results.push({
            title: 'Sayı Yuvarlama Bağlamaca (Hızlı Mod)',
            prompt: 'Sayıları en yakın onluğa yuvarlayarak eşleştirin.',
            instruction: "Sayıları en yakın onluk değerleriyle çizgilerle birleştirin.",
            pedagogicalNote: "Sayı yuvarlama pratiği ve mantıksal eşleştirme.",
            example: 'Örn: 23 → 20, 48 → 50',
            numbers
        });
    }
    return results;
};
export const generateOfflineArithmeticConnect = async (options: GeneratorOptions): Promise<ArithmeticConnectData[]> => {
    const { itemCount, worksheetCount, gridSize } = options;
    const results: ArithmeticConnectData[] = [];
    const dim = gridSize || 6;
    const pairCount = Math.floor((itemCount || 6) / 2);

    for (let i = 0; i < worksheetCount; i++) {
        const placements = generateSmartConnectGrid(dim, pairCount);
        const expressions: ArithmeticConnectData['expressions'] = [];
        
        for (let j = 0; j < pairCount; j++) {
             const target = getRandomInt(5, 15);
             const n1 = getRandomInt(1, target-1);
             const p1 = placements.find(p => p.pairIndex === j && p.isStart)!;
             expressions.push({ text: `${n1} + ${target-n1}`, value: target, group: j, x: p1.x, y: p1.y });
             
             const p2 = placements.find(p => p.pairIndex === j && !p.isStart)!;
             if (Math.random() > 0.5) {
                 const n2 = target + getRandomInt(1, 5);
                 expressions.push({ text: `${n2} - ${n2-target}`, value: target, group: j, x: p2.x, y: p2.y });
             } else {
                 expressions.push({ text: `${target}`, value: target, group: j, x: p2.x, y: p2.y });
             }
        }

        results.push({
            title: 'İşlem Bağlamaca (Hızlı Mod)',
            prompt: 'Aynı sonucu veren işlemleri eşleştirin.',
            instruction: "Sonuçları aynı olan işlemleri veya sayıları çizgilerle birleştirin.",
            pedagogicalNote: "Zihinden işlem yapma ve denklik kavramı.",
            example: 'Örn: 5+3 = 8',
            expressions
        });
    }
    return results;
};
export const generateOfflineRomanArabicMatchConnect = async (options: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: RomanArabicMatchConnectData[] = [];
    const dim = gridSize || 6;
    const pairCount = Math.floor((itemCount || 6) / 2);

    for(let i=0; i<worksheetCount; i++) {
        const placements = generateSmartConnectGrid(dim, pairCount);
        const points: RomanArabicMatchConnectData['points'] = [];
        const numbers = getRandomItems([1,2,3,4,5,6,7,8,9,10,11,12,15,20,50,100], pairCount);

        for(let j=0; j<pairCount; j++) {
            const n = numbers[j];
            const p1 = placements.find(p => p.pairIndex === j && p.isStart)!;
            points.push({ label: n.toString(), pairId: n, x: p1.x, y: p1.y });
            const p2 = placements.find(p => p.pairIndex === j && !p.isStart)!;
            points.push({ label: toRoman(n), pairId: n, x: p2.x, y: p2.y });
        }
        results.push({ title: 'Romen - Arap Rakamı Eşleştirme', prompt: 'Eşdeğer rakamları birleştir.', gridDim: dim, points });
    }
    return results;
}
export const generateOfflineRomanNumeralConnect = async (options: GeneratorOptions): Promise<RomanNumeralConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: RomanNumeralConnectData[] = [];
    const dim = gridSize || 6;
    const pairCount = Math.floor((itemCount || 6) / 2);

    for(let i=0; i<worksheetCount; i++){
        const placements = generateSmartConnectGrid(dim, pairCount);
        const points: RomanNumeralConnectData['puzzles'][0]['points'] = [];
        const numbers = getRandomItems([1,2,3,4,5,6,7,8,9,10,50,100], pairCount);

        for(let j=0; j<pairCount; j++) {
             const roman = toRoman(numbers[j]);
             const p1 = placements.find(p => p.pairIndex === j && p.isStart)!;
             points.push({ label: roman, x: p1.x, y: p1.y });
             const p2 = placements.find(p => p.pairIndex === j && !p.isStart)!;
             points.push({ label: roman, x: p2.x, y: p2.y });
        }
        results.push({
            title: 'Romen Rakamı Bağlama (Hızlı Mod)',
            prompt: 'Aynı Romen rakamlarını birleştirin.',
            instruction: "Aynı Romen rakamlarını birbirine bağlayın.",
            pedagogicalNote: "Romen rakamlarını tanıma ve uzamsal planlama.",
            puzzles: [{title: 'Bulmaca', gridDim: dim, points}]
        });
    }
    return results;
}
export const generateOfflineWeightConnect = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: WeightConnectData[] = [];
    const dim = gridSize || 6;
    const pairCount = Math.floor((itemCount || 6) / 2);
    const pairsPool = [ {l1: '1 kg', l2: '1000 g', img: '⚖️'}, {l1: '2000 g', l2: '2 kg', img: '🏋️'} ];

    for(let i=0; i<worksheetCount; i++) {
        const placements = generateSmartConnectGrid(dim, pairCount);
        const points: WeightConnectData['points'] = [];
        const selectedPairs = getRandomItems(pairsPool, pairCount);

        for(let j=0; j<pairCount; j++) {
            const pair = selectedPairs[j % selectedPairs.length];
            const p1 = placements.find(p => p.pairIndex === j && p.isStart)!;
            points.push({ label: pair.l1, pairId: j, x: p1.x, y: p1.y });
            const p2 = placements.find(p => p.pairIndex === j && !p.isStart)!;
            points.push({ label: pair.l2, pairId: j, x: p2.x, y: p2.y, imagePrompt: pair.img });
        }
        results.push({ title: 'Ağırlık Eşleştirme (Hızlı Mod)', prompt: 'Eşit ağırlıkları birleştir.', instruction: 'Birbiriyle eşit olan ağırlık değerlerini çizgilerle birleştirin.', pedagogicalNote: 'Ölçü birimleri dönüşümü ve görsel eşleştirme.', gridDim: dim, points });
    }
    return results;
}
export const generateOfflineLengthConnect = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    const results: LengthConnectData[] = [];
    const dim = gridSize || 6;
    const pairCount = Math.floor((itemCount || 6) / 2);
    const pairsPool = [ {l1: '1 m', l2: '100 cm', img: '📏'}, {l1: '200 cm', l2: '2 m', img: '🚪'} ];

    for(let i=0; i<worksheetCount; i++) {
        const placements = generateSmartConnectGrid(dim, pairCount);
        const points: LengthConnectData['points'] = [];
        const selectedPairs = getRandomItems(pairsPool, pairCount);

        for(let j=0; j<pairCount; j++) {
            const pair = selectedPairs[j % selectedPairs.length];
            const p1 = placements.find(p => p.pairIndex === j && p.isStart)!;
            points.push({ label: pair.l1, pairId: j, x: p1.x, y: p1.y });
            const p2 = placements.find(p => p.pairIndex === j && !p.isStart)!;
            points.push({ label: pair.l2, pairId: j, x: p2.x, y: p2.y, imagePrompt: pair.img });
        }
        results.push({ title: 'Uzunluk Eşleştirme (Hızlı Mod)', prompt: 'Eşit uzunlukları birleştir.', instruction: 'Birbiriyle eşit olan uzunluk ölçülerini eşleştirin.', pedagogicalNote: 'Uzunluk ölçüleri dönüşümü ve görsel algı.', gridDim: dim, points });
    }
    return results;
}
