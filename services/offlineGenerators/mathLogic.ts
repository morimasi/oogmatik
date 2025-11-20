import { GeneratorOptions, MathPuzzleData, NumberCapsuleData, NumberPatternData, NumberPyramidData, OddEvenSudokuData, Sudoku6x6ShadedData, DivisionPyramidData, MultiplicationPyramidData, KendokuData, OperationSquareFillInData, OperationSquareMultDivData, OperationSquareSubtractionData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, FutoshikiData, FutoshikiLengthData, VisualNumberPatternData, LogicGridPuzzleData, RomanNumeralStarHuntData, RomanNumeralConnectData, RomanNumeralMultiplicationData, RoundingConnectData, ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, OddOneOutData, ShapeType, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData, ShapeNumberPatternData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, EMOJIS, generateSudokuGrid, generateLatinSquare, TR_VOCAB, SHAPE_TYPES } from './helpers';

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

const fromRoman = (roman: string): number => {
    const map: { [key: string]: number } = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let result = 0;
    for (let i = 0; i < roman.length; i++) {
        const current = map[roman[i]];
        const next = map[roman[i + 1]];
        if (next > current) {
            result += next - current;
            i++;
        } else {
            result += current;
        }
    }
    return result;
};


export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const objects = EMOJIS.slice(0, 15);
    
    let valueMin = 1, valueMax = 10, ops = ['+'];
    if (difficulty === 'Orta') { valueMin = 1; valueMax = 20; ops = ['+', '-']; } 
    else if (difficulty === 'Zor') { valueMin = 2; valueMax = 15; ops = ['+', '-', '*']; } 
    else if (difficulty === 'Uzman') { valueMin = 2; valueMax = 25; ops = ['+', '-', '*', '/']; }

    const results: MathPuzzleData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const currentObjects = getRandomItems(objects, 3);
        const values = currentObjects.map(() => getRandomInt(valueMin, valueMax));
        
        const puzzles = Array.from({ length: itemCount }).map(() => {
            const op = getRandomItems(ops, 1)[0];
            const [idx1, idx2] = [getRandomInt(0, 2), getRandomInt(0, 2)];
            
            let val1 = values[idx1];
            let val2 = values[idx2];
            let problemStr = `${currentObjects[idx1]} ${op} ${currentObjects[idx2]} = ?`;
            let question = `İpucu: ${currentObjects[0]}=${values[0]}, ${currentObjects[1]}=${values[1]}, ${currentObjects[2]}=${values[2]}`;
            let answer = 0;

            if (op === '+') { answer = val1 + val2; } 
            else if (op === '-') { if (val1 < val2) { [val1, val2] = [val2, val1]; problemStr = `${currentObjects[idx2]} ${op} ${currentObjects[idx1]} = ?`; } answer = val1 - val2; } 
            else if (op === '*') { answer = val1 * val2; } 
            else if (op === '/') { if (val2 === 0) val2 = 1; const product = val1 * val2; problemStr = `${product} ${op} ${currentObjects[idx2]} = ?`; question = `İpucu: ${currentObjects[idx2]}=${val2}`; answer = val1; }
            return { problem: problemStr, question, answer: answer.toString() };
        });
        results.push({ 
            title: `Matematik Bulmacası`, 
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
        const patterns = Array.from({ length: itemCount }).map(() => {
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
            } else { // complex
                const step1 = getRandomInt(2, 3);
                const step2 = getRandomInt(1, 3);
                for (let k = 0; k < 4; k++) sequence.push(sequence[k] * step1 + step2);
                answer = sequence[4] * step1 + step2;
            }
            return { sequence: `${sequence.slice(0, 5).join(', ')}, ?`, answer: answer.toString() };
        });
        results.push({ title: 'Sayı Örüntüsü', instruction: "Örüntü kuralını bul ve '?' yerine gelecek sayıyı yaz.", pedagogicalNote: "Matematiksel tümevarım ve ilişkilendirme becerisi.", patterns });
    }
    return results;
};

export const generateOfflineFutoshiki = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount } = options;
    const size = difficulty === 'Başlangıç' ? 4 : (difficulty === 'Orta' ? 5 : 6);
    const results: FutoshikiData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const latinSquare = generateLatinSquare(size);
        const constraints: { row1: number; col1: number; row2: number; col2: number; symbol: '>' | '<' }[] = [];
        
        const constraintCount = Math.floor(size * size * 0.4);
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

        const maskedGrid: (number | null)[][] = latinSquare.map(row => row.map(n => Math.random() > 0.6 ? n : null));

        results.push({ 
            title: 'Futoşiki', 
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
    const results: NumberPyramidData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const pyramids = Array.from({ length: itemCount }).map((_, index) => {
            let rowsCount = 4;
            if (difficulty === 'Başlangıç') rowsCount = 3;
            if (difficulty === 'Zor' || difficulty === 'Uzman') rowsCount = 5;

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
             // Ensure at least one value is visible at the bottom to start
            if (puzzlePyramid[rowsCount - 1].every(v => v === null)) {
                puzzlePyramid[rowsCount - 1][0] = visualPyramid[rowsCount - 1][0];
            }


            return { title: `Piramit ${index + 1}`, rows: puzzlePyramid };
        });
        results.push({ title: 'Sihirli Piramit (Toplama)', prompt: 'Her sayı, altındaki iki sayının toplamıdır.', instruction: "Piramidin tepesine doğru toplama yaparak boşlukları doldur.", pedagogicalNote: "İşlem akıcılığı ve parça-bütün ilişkisi.", pyramids });
    }
    return results;
}

export const generateOfflineNumberCapsule = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
     const {worksheetCount} = options;
     return Array(worksheetCount).fill({ 
         title: 'Kapsül Oyunu', 
         prompt: 'Kapsülleri doldurun.',
         instruction: "Her kapsülün (bağlı kutuların) içindeki sayıların toplamı, o kapsülün hedef sayısına eşit olmalıdır.",
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
    const results: OddEvenSudokuData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const puzzles = Array.from({length: itemCount}).map((_, idx) => {
            const grid = generateSudokuGrid(6, difficulty);
            const constrainedCells = [];
            for(let r=0; r<6; r++) for(let c=0; c<6; c++){
                if(grid[r][c] === null && Math.random() > 0.5) constrainedCells.push({row:r, col: c});
            }
            return {
                title: `Bulmaca ${idx+1}`,
                numbersToUse: '1-6',
                grid,
                constrainedCells
            }
        });
        results.push({title: 'Tek-Çift Sudoku', prompt: 'Gri kutulara çift sayı gelmelidir.', instruction: "Sudoku kurallarına ek olarak, gri kutulara sadece çift sayı yazabilirsin.", pedagogicalNote: "Kategorizasyon ve mantıksal kısıtlama yönetimi.", puzzles});
    }
    return results;
}

export const generateOfflineSudoku6x6Shaded = async (options: GeneratorOptions): Promise<Sudoku6x6ShadedData[]> => {
    const res = await generateOfflineOddEvenSudoku(options);
    return res.map(r => ({
        ...r, 
        title: '6x6 Tek-Çift Sudoku', 
        puzzles: r.puzzles.map(p => ({grid: p.grid, shadedCells: p.constrainedCells}))
    }));
}

export const generateOfflineRomanNumeralStarHunt = async (options: GeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
    const { worksheetCount, difficulty } = options;
    const size = difficulty === 'Başlangıç' ? 5 : 6;
    const starsPerRegion = difficulty === 'Başlangıç' ? 1 : 2;

    const results: RomanNumeralStarHuntData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        // For offline, use a pre-defined or simple generation logic
        const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
        
        // This simple placement is not guaranteed to be valid for adjacency.
        // A better approach for offline is a fixed, valid puzzle.
        const solution = [
            [0,1,0,0,0],
            [0,0,0,1,0],
            [1,0,0,0,0],
            [0,0,1,0,0],
            [0,0,0,0,1],
        ];

        const rowCounts = solution.map(row => toRoman(row.reduce((a,b) => a+b, 0)));
        const colCounts = Array.from({length: size}, (_, c) => toRoman(solution.reduce((a, row) => a + row[c], 0)));

        grid.forEach((row, r) => row.unshift(rowCounts[r]));
        grid.unshift([null, ...colCounts]);

        results.push({
            title: 'Yıldız Avı (Romen Rakamlı)',
            prompt: 'Her satır, sütun ve bölgede belirtilen sayıda yıldız olmalı. Yıldızlar birbirine değemez.',
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
        const puzzles = Array.from({ length: itemCount }, () => {
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
            title: 'İşlem Karesi (Romen Rakamlı)',
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
            title: 'Kendoku',
            prompt: 'İşlem ipuçlarını kullanarak mantık bulmacasını çözün.',
            instruction: "Kafeslerin sol üstündeki sayı ve işleme göre kutuları doldur. Her satır ve sütunda rakamlar bir kez kullanılmalı.",
            pedagogicalNote: "Aritmetik işlem yeteneği ve problem çözme stratejileri.",
            puzzles: [{ size, grid: displayGrid, cages }]
        });
    }
    return results;
}

export const generateOfflineDivisionPyramid = async (options: GeneratorOptions): Promise<DivisionPyramidData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: DivisionPyramidData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const pyramids = Array.from({ length: itemCount }).map(() => {
            // Build from top-down to ensure integer division
            let top: number;
            let mid_L: number, mid_R: number;
            let bot_L: number, bot_M: number, bot_R: number;
            let isValid = false;

            while (!isValid) {
                bot_M = getRandomInt(2, 5);
                bot_L = getRandomInt(2, 5) * bot_M;
                bot_R = getRandomInt(2, 5) * bot_M;
                mid_L = bot_L * bot_M;
                mid_R = bot_M * bot_R;
                top = mid_L * mid_R;

                if (top < 10000 && mid_L > 0 && mid_R > 0 && bot_L > 0 && bot_M > 0 && bot_R > 0) {
                    isValid = true;
                }
            }

            const rows: (number | null)[][] = [
                [top],
                [mid_L, mid_R],
                [bot_L, bot_M, bot_R]
            ];
            
            // Mask some values
            rows[0][0] = null;
            rows[1][getRandomInt(0, 1)] = null;
            rows[2][getRandomInt(0, 2)] = null;

            return { rows };
        });
        results.push({
            title: 'Sihirli Piramit (Bölme)',
            prompt: 'Her sayı, altındaki iki sayının çarpımıdır.',
            instruction: "Bölme ve çarpma işlemleriyle piramitteki eksik sayıları bulun.",
            pedagogicalNote: "Çarpma ve bölme arasındaki ters ilişkiyi kavrama.",
            pyramids
        });
    }
    return results;
};

export const generateOfflineMultiplicationPyramid = async (options: GeneratorOptions): Promise<MultiplicationPyramidData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: MultiplicationPyramidData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const pyramids = Array.from({length: itemCount}).map(() => {
            const base = [getRandomInt(2, 5), getRandomInt(2, 5), getRandomInt(2, 5)];
            const mid = [base[0]*base[1], base[1]*base[2]];
            const top = [mid[0]*mid[1]];
            const rows: (number|null)[][] = [top, mid, base];
            rows[1][0] = null;
            rows[2][1] = null;
            return { rows };
        });
        results.push({title: 'Sihirli Piramit (Çarpma)', prompt: 'Çarpma işlemleri', instruction: "Alt kutuları çarparak üste yaz.", pedagogicalNote: "Çarpım tablosu hakimiyeti.", pyramids});
    }
    return results;
}

export const generateOfflineOperationSquareSubtraction = async (options: GeneratorOptions): Promise<OperationSquareSubtractionData[]> => {
    const { worksheetCount } = options;
    const results: OperationSquareSubtractionData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const n1 = getRandomInt(10, 20);
        const n2 = getRandomInt(1, n1-1);
        const n3 = getRandomInt(10, 20);
        const n4 = getRandomInt(1, n3-1);
        const grid: (string|null)[][] = [
            [n1.toString(), '-', n2.toString(), '=', (n1-n2).toString()],
            ['-', null, '-', null, null],
            [n3.toString(), '-', n4.toString(), '=', (n3-n4).toString()],
            ['=', null, '=', null, null],
            [(n1-n3).toString(), null, (n2-n4).toString(), null, null]
        ];
        
        // Mask 2 values
        grid[0][0] = null;
        grid[2][2] = null;

        results.push({
             title: 'İşlem Karesi (Çıkarma)', 
             prompt: 'Çıkarma işlemleri yaparak işlem karesini tamamlayın.', 
             puzzles: [{ grid }]
        });
    }
    return results;
}

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
             title: 'İşlem Karesi (Yerleştirme)',
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
         const puzzles = Array.from({length: itemCount}).map(() => {
             const center = getRandomInt(2, 9);
             const outer = Array.from({length: 8}, () => getRandomInt(1, 10));
             const outerMasked: (number|null)[] = outer.map(n => Math.random() > 0.4 ? n : null);
             return { outerNumbers: outerMasked, innerResult: center };
         });
         results.push({title: 'Çarpım Çarkı', prompt: 'Merkezdeki sayıyla çarpıp dışarı yazın.', puzzles});
     }
     return results;
}

export const generateOfflineTargetNumber = async (options: GeneratorOptions): Promise<TargetNumberData[]> => {
     const {itemCount, worksheetCount} = options;
     return Array.from({length: worksheetCount}, () => ({ 
         title: 'Hedef Sayı', 
         prompt: 'Verilen sayılarla dört işlem yaparak hedef sayıya ulaşın.',
         puzzles: Array.from({length: itemCount}, () => {
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
            [(n1/n3 * 100).toFixed(0), null, (n2/n4 * 100).toFixed(0), null, null] // Dummy values for layout
        ];
        
        results.push({
             title: 'İşlem Karesi (Çarpma/Bölme)', 
             prompt: 'İşlemleri yaparak boşlukları doldurun.', 
             puzzles: [{ grid }]
        });
    }
    return results;
}

export const generateOfflineShapeSudoku = async (options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
    const {itemCount, worksheetCount, difficulty} = options;
    return Array.from({length: worksheetCount}, () => {
        const grid = generateSudokuGrid(4, difficulty);
        const shapes = getRandomItems(SHAPE_TYPES, 4);
        const shapeGrid = grid.map(row => row.map(cell => cell === null ? null : shapes[cell-1]));
        return {
            title: 'Şekilli Sudoku',
            prompt: 'Şekilleri tekrar etmeyecek şekilde yerleştirin.',
            instruction: "Her satır, sütun ve 2x2'lik bölgede her şekil bir kez kullanılmalıdır.",
            pedagogicalNote: "Sayılar yerine semboller kullanarak Sudoku mantığını öğretir.",
            puzzles: [{grid: shapeGrid, shapesToUse: shapes.map(s => ({shape: s, label: s}))}]
        }
    });
}

export const generateOfflineFutoshikiLength = async (options: GeneratorOptions): Promise<FutoshikiLengthData[]> => {
     const res = await generateOfflineFutoshiki(options);
     return res.map(r => ({...r, title: 'Futoşiki (Uzunluk)'})) as any;
}

export const generateOfflineVisualNumberPattern = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
    const {itemCount, worksheetCount} = options;
    const results: VisualNumberPatternData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const puzzles = Array.from({length: itemCount}, () => {
            const start = getRandomInt(1, 5);
            const step = getRandomInt(2, 4);
            const items = Array.from({length: 4}, (_, k) => ({
                number: start + k * step,
                color: ['#3B82F6', '#EF4444', '#10B981'][k % 3],
                size: 1 + (k % 2) * 0.5
            }));
            return {
                items,
                rule: `Sayılar ${step} artıyor.`,
                answer: start + 4 * step
            };
        });
        results.push({
            title: 'Görsel Sayı Örüntüsü',
            prompt: 'Görsel dizideki kuralı bulup eksik sayıyı tamamlayın.',
            instruction: "Sayı, renk ve boyut değişimindeki kuralı bulup bir sonraki adımı tahmin et.",
            pedagogicalNote: "Çoklu değişkenli örüntü tanıma becerisi.",
            puzzles
        });
    }
    return results;
}
export const generateOfflineLogicGridPuzzle = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    const { worksheetCount } = options;
    const peoplePool = ['Ali', 'Ayşe', 'Can', 'Duru'];
    const petPool = ['Kedi', 'Köpek', 'Kuş', 'Balık'];
    const colorPool = ['Kırmızı', 'Mavi', 'Yeşil', 'Sarı'];

    const results: LogicGridPuzzleData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const people = getRandomItems(peoplePool, 3);
        const pets = getRandomItems(petPool, 3);
        const colors = getRandomItems(colorPool, 3);
        
        // Solution: P1->I1, P2->I2, P3->I3
        const solution = [
            `${people[0]}'nin hayvanı ${pets[0]} ve favori rengi ${colors[0]}.`,
            `${pets[1]} sahibi ${colors[1]} rengini sevmez.`,
            `${people[2]}'nin favori rengi ${colors[2]}.`,
        ];

        results.push({ 
            title: 'Mantık Tablosu', 
            prompt: 'Verilen ipuçlarını kullanarak kimin hangi hayvana sahip olduğunu ve hangi rengi sevdiğini bulun.',
            instruction: "Tabloda 'Evet' için ✔, 'Hayır' için ✘ işareti koyarak ilerle.",
            pedagogicalNote: "Sistematik düşünme, eleme ve çıkarım yapma becerileri.",
            clues: shuffle(solution), 
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
        const groups = Array.from({ length: itemCount }).map(() => {
            const mainCatKey = topic && topic !== 'Rastgele' ? topic.toLowerCase() : getRandomItems(['fruits_veggies', 'animals', 'jobs', 'vehicles'], 1)[0];
            const oddCatKey = getRandomItems(['fruits_veggies', 'animals', 'jobs', 'vehicles'].filter(c => c !== mainCatKey), 1)[0];
            
            const vocab = TR_VOCAB as any;
            const mainWords = getRandomItems(vocab[mainCatKey] || [], 3);
            const oddWord = getRandomItems(vocab[oddCatKey] || [], 1)[0];
            
            const words = [...mainWords, oddWord].filter(Boolean) as string[];
            return { words: shuffle(words) };
        });
        results.push({ 
            title: 'Farkı Fark Et (Anlamsal)',
            instruction: "Her grupta, anlamsal olarak diğerlerinden farklı olan kelimeyi bulun.",
            pedagogicalNote: "Kategorik düşünme ve semantik ayrım becerisi.",
            groups 
        });
    }
    return results;
};

export const generateOfflineThematicOddOneOut = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const res = await generateOfflineOddOneOut({ ...options, itemCount: (itemCount || 5) * worksheetCount, worksheetCount: 1});
    return [{
        title: `Tematik Farkı Bul (${topic || 'Rastgele'})`,
        prompt: "Her satırda temaya uymayan kelimeyi bul.",
        theme: topic || 'Genel',
        rows: res[0].groups.map(g => ({words: g.words, oddWord: ''})),
        sentencePrompt: 'Farklı kelimelerle birer cümle kur.'
    }];
};

export const generateOfflineThematicOddOneOutSentence = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const res = await generateOfflineOddOneOut({ ...options, itemCount: (itemCount || 5) * worksheetCount, worksheetCount: 1});
    return [{
        title: `Tematik Farklı Kelimeyle Cümle Kurma`,
        prompt: "Her satırda temaya uymayan kelimeyi bul ve o kelimeyle bir cümle kur.",
        rows: res[0].groups.map(g => ({words: g.words, oddWord: ''})),
        sentencePrompt: 'Farklı kelimelerle kurduğun cümleleri aşağıya yaz.'
    }];
};

export const generateOfflineColumnOddOneOutSentence = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    const {itemCount, worksheetCount} = options;
    const res = await generateOfflineOddOneOut({ ...options, itemCount: (itemCount || 4) * worksheetCount, worksheetCount: 1});
    return [{
        title: 'Sütunlarda Farklı Olan',
        prompt: 'Her sütunda farklı olanı bul.',
        columns: res[0].groups.map(g => ({words: g.words, oddWord: ''})),
        sentencePrompt: 'Farklı kelimelerle cümle kur.'
    }];
};
export const generateOfflinePunctuationMaze = async (options: GeneratorOptions): Promise<PunctuationMazeData[]> => {
    return Array.from({length: options.worksheetCount}, () => ({
        title: 'Noktalama Labirenti',
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
    }));
};
export const generateOfflinePunctuationPhoneNumber = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
     return Array(options.worksheetCount).fill({
        title: 'Gizli Telefon Numarası',
        prompt: 'İpuçlarını çöz ve numarayı bul.',
        instruction: 'Her ipucu bir rakama karşılık geliyor.',
        clues: [
            {id: 1, text: 'Bir cümlede kaç tane nokta olur?'},
            {id: 2, text: 'Bir soruda kaç tane soru işareti olur?'}
        ],
        solution: [{punctuationMark: '.', number: 1}, {punctuationMark: '?', number: 1}]
    });
};
export const generateOfflineShapeNumberPattern = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    const {itemCount, worksheetCount} = options;
    return Array.from({length: worksheetCount}, () => ({
        title: 'Şekilli Sayı Örüntüsü',
        instruction: "Şekillerin içindeki sayılar arasındaki kuralı bulup '?' yerine gelecek sayıyı yazın.",
        pedagogicalNote: "Görsel ve sayısal örüntüleri birleştirerek problem çözme.",
        patterns: Array.from({length: itemCount}, () => {
            const n1 = getRandomInt(1,10);
            const n2 = getRandomInt(1,10);
            return { shapes: [{ type: 'triangle', numbers: [n1, n2, '?']}, {type: 'triangle', numbers: [n1+1, n2+1, (n1+1)+(n2+1)]}]}
        })
    }))
};

export const generateOfflineRoundingConnect = async (options: GeneratorOptions): Promise<RoundingConnectData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: RoundingConnectData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const numbers: RoundingConnectData['numbers'] = [];
        const groups: number[] = [];
        for (let j = 0; j < (itemCount || 12) / 2; j++) {
            const base = getRandomInt(1, 9) * 10;
            groups.push(base);
            numbers.push({ value: base + getRandomInt(1, 4), group: j, x: 0, y: 0 });
            numbers.push({ value: base, group: j, x: 0, y: 0 });
        }
        shuffle(numbers).forEach((n, idx) => {
            n.x = (idx % 2 === 0) ? getRandomInt(10, 30) : getRandomInt(70, 90);
            n.y = getRandomInt(10, 90);
        });
        results.push({
            title: 'Sayı Yuvarlama Bağlamaca',
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
    const { itemCount, worksheetCount } = options;
    const results: ArithmeticConnectData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const expressions: ArithmeticConnectData['expressions'] = [];
        for (let j = 0; j < (itemCount || 12) / 2; j++) {
            const n1 = getRandomInt(5, 15);
            const n2 = getRandomInt(1, n1-1);
            const result = n1 + n2;
            expressions.push({ text: `${n1} + ${n2}`, value: result, group: j, x: 0, y: 0 });
            expressions.push({ text: `${result+5} - 5`, value: result, group: j, x: 0, y: 0 });
        }
        shuffle(expressions).forEach((e, idx) => {
            e.x = (idx % 2 === 0) ? 15 : 85;
            e.y = 15 + idx * 7;
        });
        results.push({
            title: 'İşlem Bağlamaca',
            prompt: 'Aynı sonucu veren işlemleri eşleştirin.',
            instruction: "Sonuçları aynı olan işlemleri çizgilerle birleştirin.",
            pedagogicalNote: "Zihinden işlem yapma ve denklik kavramı.",
            example: 'Örn: 5+3 = 10-2',
            expressions
        });
    }
    return results;
};

export const generateOfflineRomanArabicMatchConnect = async (options: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    return Array.from({length: worksheetCount}, () => {
        const pairs = Array.from({length: itemCount / 2}, (_, i) => i+1);
        const points = pairs.flatMap(p => ([
            {label: p.toString(), pairId: p, x: 0, y: 0},
            {label: toRoman(p), pairId: p, x:0, y:0}
        ]));
        shuffle(points).forEach((p, i) => {
            p.x = (i % 2) * (gridSize-1);
            p.y = Math.floor(i / 2) * 2;
        });
        return {
            title: 'Romen - Arap Rakamı Eşleştirme',
            prompt: 'Eşdeğer rakamları birleştir.',
            gridDim: gridSize || 6,
            points
        }
    });
}
export const generateOfflineWeightConnect = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
    return Array.from({length: worksheetCount}, () => {
        const pairs = [
            {l1: '1 kg', l2: '1000 g'},
            {l1: '2000 g', l2: '2 kg'},
            {l1: 'yarım kg', l2: '500 g'},
            {l1: '1 ton', l2: '1000 kg'}
        ];
        const points = pairs.flatMap((p, i) => ([
            {label: p.l1, pairId: i, x:0, y:0},
            {label: p.l2, pairId: i, x:0, y:0}
        ]));
        shuffle(points).forEach((p, i) => {
            p.x = (i % 2) * (gridSize-1);
            p.y = i * 2;
        });
        return {
            title: 'Ağırlık Eşleştirme',
            prompt: 'Eşit ağırlıkları birleştir.',
            gridDim: gridSize || 10,
            points
        }
    });
}

export const generateOfflineLengthConnect = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
    const {itemCount, worksheetCount, gridSize} = options;
     return Array.from({length: worksheetCount}, () => {
        const pairs = [
            {l1: '1 m', l2: '100 cm'},
            {l1: '200 cm', l2: '2 m'},
            {l1: 'yarım m', l2: '50 cm'},
            {l1: '1 km', l2: '1000 m'}
        ];
        const points = pairs.flatMap((p, i) => ([
            {label: p.l1, pairId: i, x:0, y:0},
            {label: p.l2, pairId: i, x:0, y:0}
        ]));
        shuffle(points).forEach((p, i) => {
            p.x = (i % 2) * (gridSize-1);
            p.y = i * 2;
        });
        return {
            title: 'Uzunluk Eşleştirme',
            prompt: 'Eşit uzunlukları birleştir.',
            gridDim: gridSize || 10,
            points
        }
    });
}
