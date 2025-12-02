
import { GeneratorOptions, MathPuzzleData, NumberCapsuleData, NumberPatternData, NumberPyramidData, OddEvenSudokuData, KendokuData, OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, FutoshikiData, VisualNumberPatternData, LogicGridPuzzleData, RomanNumeralStarHuntData, RomanNumeralConnectData, RomanNumeralMultiplicationData, RoundingConnectData, ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, OddOneOutData, ShapeType, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData, ShapeNumberPatternData, BasicOperationsData, RealLifeProblemData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, EMOJIS, generateSudokuGrid, generateLatinSquare, TR_VOCAB, SHAPE_TYPES, ITEM_CATEGORIES, generateSmartConnectGrid, CONNECT_COLORS, generateMaze, getDifficultySettings, generateMazePath } from './helpers';

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

// --- HELPER FUNCTIONS FOR MATH LOGIC ---

// Checks if addition involves carrying
const hasCarry = (n1: number, n2: number): boolean => {
    const s1 = n1.toString().split('').reverse();
    const s2 = n2.toString().split('').reverse();
    const len = Math.max(s1.length, s2.length);
    let carry = 0;
    for (let i = 0; i < len; i++) {
        const d1 = parseInt(s1[i] || '0');
        const d2 = parseInt(s2[i] || '0');
        if (d1 + d2 + carry >= 10) return true;
        carry = Math.floor((d1 + d2 + carry) / 10);
    }
    return false;
};

// Checks if subtraction involves borrowing
const hasBorrow = (n1: number, n2: number): boolean => {
    const s1 = n1.toString().split('').reverse();
    const s2 = n2.toString().split('').reverse();
    for (let i = 0; i < s2.length; i++) {
        if (parseInt(s1[i]) < parseInt(s2[i])) return true;
    }
    return false;
};

// --- SVG GENERATOR FOR MAZE HEADER ---
const generateSimpleMazeSVG = () => {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="100" height="100" fill="white"/>
      <rect width="100" height="100" fill="url(#gridPattern)"/>
      <path d="M 10 10 L 40 10 L 40 40 L 70 40 L 70 10 L 90 10 L 90 90 L 60 90 L 60 60 L 30 60 L 30 90 L 10 90" fill="none" stroke="#60a5fa" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 2"/>
      <circle cx="10" cy="10" r="4" fill="#22c55e" stroke="white" stroke-width="1"/>
      <circle cx="10" cy="90" r="4" fill="#ef4444" stroke="white" stroke-width="1"/>
    </svg>`;
};

export const generateOfflineBasicOperations = async (options: GeneratorOptions): Promise<BasicOperationsData[]> => {
    const { selectedOperations, operationType, numberRange, allowCarry, allowBorrow, allowRemainder, useThirdNumber, worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 20;
    const results: BasicOperationsData[] = [];
    
    // Parse Range if string provided (e.g., "1-20")
    let minVal = 1, maxVal = 20;
    if (numberRange) {
        const parts = numberRange.split('-');
        if (parts.length === 2) {
            minVal = parseInt(parts[0]);
            maxVal = parseInt(parts[1]);
        } else if (numberRange === '100-1000') {
            minVal = 100; maxVal = 999;
        }
    }
    
    // Operations logic
    let ops = ['+'];
    if (operationType === 'mixed' && selectedOperations && selectedOperations.length > 0) {
        ops = selectedOperations.map(o => o === 'add' ? '+' : o === 'sub' ? '-' : o === 'mult' ? 'x' : o === 'div' ? '÷' : o).filter(o => ['+','-','x','÷'].includes(o));
    } else if (operationType) {
        if(operationType === 'add') ops = ['+'];
        if(operationType === 'sub') ops = ['-'];
        if(operationType === 'mult') ops = ['x'];
        if(operationType === 'div') ops = ['÷'];
    }
    if (ops.length === 0) ops = ['+']; // Fallback

    for(let i=0; i<worksheetCount; i++) {
        const operationsList: BasicOperationsData['operations'] = [];
        let attempts = 0;
        
        // Randomize starting op for variety
        let opIndex = getRandomInt(0, ops.length - 1);

        while(operationsList.length < count && attempts < 3000) {
            attempts++;
            
            // If mixed, ensure we don't just cycle 1,2,3,4 but pick somewhat randomly to avoid patterns
            if (ops.length > 1) {
                opIndex = getRandomInt(0, ops.length - 1);
            } else {
                opIndex = 0;
            }
            
            const currentOp = ops[opIndex];
            
            // Adjust ranges based on max value for cleaner problems
            // Add some jitter to ranges per problem to vary difficulty slightly
            const rangeMax = Math.max(minVal + 5, maxVal - getRandomInt(0, 5));
            const rangeMin = minVal;
            
            let num1 = 0, num2 = 0, num3 = 0, answer = 0, remainder = 0;
            let operator: any = '+';
            let valid = false;

            if (currentOp === '+') {
                operator = '+';
                const hasThird = useThirdNumber; 
                // Ensure sum doesn't exceed reasonable limits relative to range
                num1 = getRandomInt(rangeMin, rangeMax);
                num2 = getRandomInt(1, rangeMax);
                if (hasThird) num3 = getRandomInt(1, rangeMax);
                
                const isCarry = hasCarry(num1, num2) || (hasThird && (hasCarry(num1+num2, num3)));
                // Only enforce carry restriction if strictly disallowed (allowCarry is false)
                valid = allowCarry ? true : !isCarry;
                if (valid) answer = num1 + num2 + num3;
            } 
            else if (currentOp === '-') {
                operator = '-';
                num1 = getRandomInt(rangeMin, rangeMax);
                num2 = getRandomInt(1, num1); // Ensure n2 <= n1
                
                const isBorrow = hasBorrow(num1, num2);
                valid = allowBorrow ? true : !isBorrow; 
                if (valid) answer = num1 - num2;
            }
            else if (currentOp === 'x') {
                operator = 'x';
                // Simplify mult range
                const m1 = getRandomInt(1, Math.min(12, rangeMax));
                const m2 = getRandomInt(1, Math.min(12, rangeMax));
                num1 = m1; num2 = m2;
                answer = num1 * num2;
                valid = true; 
            }
            else if (currentOp === '÷') {
                operator = '÷';
                const divisor = getRandomInt(2, 9);
                if (allowRemainder) {
                    const dividend = getRandomInt(rangeMin, rangeMax);
                    num1 = dividend; num2 = divisor;
                    answer = Math.floor(num1 / num2);
                    remainder = num1 % num2;
                    valid = true;
                } else {
                    // Create exact division
                    const quotient = getRandomInt(2, Math.floor(rangeMax/divisor));
                    num1 = quotient * divisor;
                    num2 = divisor;
                    answer = quotient;
                    remainder = 0;
                    valid = true;
                }
            }

            if (valid) {
                operationsList.push({ 
                    num1, num2, num3: num3 > 0 ? num3 : undefined, operator, answer, remainder: remainder > 0 ? remainder : undefined 
                });
            }
        }

        results.push({
            title: 'Dört İşlem Alıştırmaları',
            instruction: 'Aşağıdaki işlemleri dikkatlice yapın.',
            pedagogicalNote: 'İşlem akıcılığı, eldeli/eldesiz toplama ve onluk bozma becerilerini geliştirir.',
            imagePrompt: 'İşlem',
            isVertical: true,
            operations: operationsList
        });
    }
    return results;
};

export const generateOfflineRealLifeMathProblems = async (options: GeneratorOptions): Promise<RealLifeProblemData[]> => {
    const { worksheetCount, itemCount } = options;
    const results: RealLifeProblemData[] = [];
    const names = ["Ali", "Ayşe", "Mehmet", "Zeynep", "Can", "Elif", "Mert", "Duru", "Kerem", "Defne"];
    const items = ["elma", "kalem", "ceviz", "kitap", "bilye", "lira", "şeker", "kurabiye", "balon", "top"];
    const logicTemplates = [
        (n1: number, n2: number, name: string) => ({ text: `${name} ${n1} yaşındadır. Babasının yaşı, ${name}'nin yaşının 3 katından 4 fazladır. Babası kaç yaşındadır?`, ans: (n1 * 3) + 4, hint: "Çarpma ve Toplama" }),
        (n1: number, n2: number, name: string, item: string) => ({ text: `${name}'nin ${n1} lirası vardı. Tanesi ${n2} lira olan ${item}lardan 2 tane aldı. Geriye kaç lirası kaldı?`, ans: n1 - (n2 * 2), hint: "Çarpma ve Çıkarma" }),
        (n1: number, n2: number, name: string, item: string) => ({ text: `${name}, ${n1 * n2} tane ${item}sını ${n2} arkadaşına eşit olarak paylaştırdı. Her birine kaç ${item} düşer?`, ans: n1, hint: "Bölme" }),
        (n1: number, n2: number, name: string, item: string) => ({ text: `${name} sabah ${n1} tane, öğleden sonra ${n2} tane ${item} topladı. Akşam ${Math.floor(n1/2)} tanesini yedi. Geriye kaç ${item} kaldı?`, ans: n1 + n2 - Math.floor(n1/2), hint: "Toplama ve Çıkarma" })
    ];

    for(let i=0; i<worksheetCount; i++) {
        const problems: RealLifeProblemData['problems'] = [];
        const count = itemCount || 4;
        
        const templates = shuffle(logicTemplates);
        
        for(let j=0; j<count; j++) {
            const selectedFunc = templates[j % templates.length];
            const name = getRandomItems(names, 1)[0];
            const item = getRandomItems(items, 1)[0];
            const n1 = getRandomInt(10, 50); 
            const n2 = getRandomInt(2, 9); 
            const validN1 = (j % logicTemplates.length === 1) ? Math.max(n1, (n2 * 2) + 10) : n1;
            const problemData = selectedFunc(validN1, n2, name, item);
            problems.push({ text: problemData.text, solution: `${problemData.ans}`, operationHint: "", imagePrompt: j % 2 === 0 ? 'Düşünen Çocuk' : 'Matematik Problemi' });
        }
        results.push({
            title: 'Problem Çözme Stratejileri',
            instruction: 'Problemleri 4 adımda (Anlama, Planlama, Çözme, Kontrol) çözün.',
            pedagogicalNote: 'Polya\'nın problem çözme basamaklarını kullanarak analitik düşünme becerisi.',
            imagePrompt: 'Strateji',
            problems
        });
    }
    return results;
};

export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { itemCount, worksheetCount, difficulty, operations, numberRange } = options;
    const objectsPool = shuffle(EMOJIS.slice(0, 30)); // Shuffle pool
    
    let valueMin = 1, valueMax = 10;
    if (numberRange) {
        const parts = numberRange.split('-');
        if (parts.length === 2) {
            valueMin = parseInt(parts[0]);
            valueMax = parseInt(parts[1]);
        }
    } else {
        if(difficulty === 'Orta') valueMax = 20;
        if(difficulty === 'Zor') valueMax = 50;
    }

    let ops: string[] = ['+'];
    if (operations === 'all' || operations === 'mixed') ops = ['+', '-', '*', '/'];
    else if (operations === 'addsub') ops = ['+', '-'];
    else if (operations === 'multdiv') ops = ['*', '/'];
    else if (operations === 'add') ops = ['+'];
    else if (operations === 'mult') ops = ['*'];
    else if (Array.isArray(operations)) {
         ops = operations.map(o => o === 'add' ? '+' : o === 'sub' ? '-' : o === 'mult' ? '*' : o === 'div' ? '/' : o);
    }

    const results: MathPuzzleData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const startIndex = (i * 3) % (objectsPool.length - 3);
        const currentObjects = objectsPool.slice(startIndex, startIndex + 3);
        
        const values = currentObjects.map(() => getRandomInt(valueMin, valueMax));
        const puzzles = Array.from({ length: itemCount || 6 }).map(() => {
            const op = getRandomItems(ops, 1)[0];
            const [idx1, idx2] = [getRandomInt(0, 2), getRandomInt(0, 2)];
            let val1 = values[idx1], val2 = values[idx2];
            let problemStr = `${currentObjects[idx1]} ${op} ${currentObjects[idx2]} = ?`;
            let question = `İpucu: ${currentObjects[0]}=${values[0]}, ${currentObjects[1]}=${values[1]}, ${currentObjects[2]}=${values[2]}`;
            let answer = 0;
            
            if (op === '+') { answer = val1 + val2; } 
            else if (op === '-') { 
                if (val1 < val2) { [val1, val2] = [val2, val1]; problemStr = `${currentObjects[idx2]} ${op} ${currentObjects[idx1]} = ?`; } 
                answer = val1 - val2; 
            } 
            else if (op === '*') { answer = val1 * val2; } 
            else if (op === '/' || op === '÷') { 
                if (val2 === 0) val2 = 1; 
                const product = val1 * val2; 
                problemStr = `${product} ${op} ${currentObjects[idx2]} = ?`; 
                question = `İpucu: ${currentObjects[idx2]}=${val2}. (Bölünen sayı ${product})`; 
                answer = val1; 
            }
            return { problem: problemStr, question, answer: answer.toString() };
        });
        results.push({ title: `Matematik Bulmacası (${difficulty})`, instruction: "Sembollerin sayısal değerlerini bulun ve işlemi çözün.", pedagogicalNote: "Cebirsel düşünme ve sembolik işlem yapma becerisi.", imagePrompt: 'Bulmaca', puzzles });
    }
    return results;
};

export const generateOfflineNumberPattern = async (options: GeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, worksheetCount, difficulty, patternType } = options;
    const results: NumberPatternData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const patterns = Array.from({ length: itemCount || 8 }).map(() => {
            let start = getRandomInt(1, 10 + i * 2); 
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
        results.push({ title: 'Sayı Örüntüsü (Hızlı Mod)', instruction: "Örüntü kuralını bul ve '?' yerine gelecek sayıyı yaz.", pedagogicalNote: "Matematiksel tümevarım ve ilişkilendirme becerisi.", imagePrompt: 'Örüntü', patterns });
    }
    return results;
};

export const generateOfflineFutoshiki = async (options: GeneratorOptions) => {
    const { difficulty, worksheetCount, itemCount, contentType } = options;
    const settings = getDifficultySettings(difficulty);
    const size = Math.min(6, Math.max(4, settings.sudokuSize - 2)); 
    const isLength = contentType === 'length';
    const results: FutoshikiData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const puzzles = Array.from({length: itemCount || 2}).map(() => {
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
            let units: (string | null)[][] | undefined = undefined;
            if (isLength) {
                const unitMap: Record<number, string> = { 1: '10cm', 2: '25cm', 3: '50cm', 4: '1m', 5: '2m', 6: '5m', 7: '10m', 8: '20m', 9: '50m' };
                units = maskedGrid.map(row => row.map(num => num === null ? null : unitMap[num] || `${num}m`));
            }
            return { size, numbers: maskedGrid, constraints, units };
        });
        results.push({ title: `Futoşiki (${difficulty})`, instruction: "Her satır ve sütunda öğeler bir kez bulunmalı. > ve < işaretlerine dikkat et.", pedagogicalNote: "Mantıksal çıkarım ve sayısal ilişki analizi.", imagePrompt: 'Mantık', puzzles });
    }
    return results;
}

export const generateOfflineNumberPyramid = async (options: GeneratorOptions) => {
    const { itemCount, worksheetCount, difficulty, pyramidType } = options;
    const settings = getDifficultySettings(difficulty);
    const results: NumberPyramidData[] = [];
    const op = pyramidType || 'addition';
    for (let i = 0; i < worksheetCount; i++) {
        const pyramids = Array.from({ length: itemCount || 2 }).map(() => {
            const rowsCount = settings.pyramidRows || 3;
            const fullPyramid: number[][] = [];
            const baseRow = Array.from({ length: rowsCount }, () => getRandomInt(1, op === 'multiplication' ? 5 : 10));
            fullPyramid.push(baseRow);
            for (let r = 1; r < rowsCount; r++) {
                const prevRow = fullPyramid[r - 1];
                const newRow: number[] = [];
                for (let c = 0; c < prevRow.length - 1; c++) {
                    if (op === 'multiplication') newRow.push(prevRow[c] * prevRow[c + 1]);
                    else newRow.push(prevRow[c] + prevRow[c + 1]);
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
        let instr = "Piramidin tepesine doğru toplama yaparak boşlukları doldur.";
        if (op === 'multiplication') instr = "Altındaki iki sayıyı çarpıp üstteki kutuya yaz.";
        if (op === 'division') instr = "Üstteki sayı, alttaki iki sayının çarpımıdır (veya bölme ilişkisi kur).";
        results.push({ title: `İşlem Piramidi (${difficulty})`, instruction: instr, pedagogicalNote: "İşlem akıcılığı ve parça-bütün ilişkisi.", imagePrompt: 'Piramit', pyramids });
    }
    return results;
}

export const generateOfflineNumberCapsule = async (options: GeneratorOptions) => {
     const {worksheetCount, itemCount} = options;
     return Array.from({length: worksheetCount}, () => ({ 
         title: 'Kapsül Oyunu (Hızlı Mod)', 
         prompt: 'Kapsülleri doldurun.',
         instruction: "Her kapsülün içindeki sayıların toplamı hedef sayıya eşit olmalıdır.",
         pedagogicalNote: "Toplama ve mantıksal eleme becerisi.",
         imagePrompt: 'Kapsül',
         puzzles: Array.from({length: itemCount || 2}).map((_, idx) => ({
             title: `Bulmaca ${idx+1}`,
             numbersToUse: '1-9 arası',
             grid: [[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]],
             capsules: [ { cells: [{row:0, col:0}, {row:0,col:1}], sum: 10}, { cells: [{row:1, col:0}, {row:2,col:0}], sum: 8}, { cells: [{row:0, col:2}, {row:1,col:2}, {row:1,col:1}], sum: 15} ]
         }))
    }));
}

export const generateOfflineOddEvenSudoku = async (options: GeneratorOptions) => {
    const {itemCount, worksheetCount, difficulty, variant} = options;
    const size = 6; 
    const results: OddEvenSudokuData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const puzzles = Array.from({length: itemCount || 2}).map(() => {
            const grid = generateSudokuGrid(size, difficulty);
            const constrainedCells = [];
            const shadedCells = [];
            for(let r=0; r<size; r++) for(let c=0; c<size; c++){
                if(grid[r][c] === null && Math.random() > 0.5) {
                    if (variant === 'shaded') shadedCells.push({row:r, col: c});
                    else constrainedCells.push({row:r, col: c});
                }
            }
            return { title: 'Bulmaca', numbersToUse: '1-6', grid, constrainedCells: variant === 'shaded' ? undefined : constrainedCells, shadedCells: variant === 'shaded' ? shadedCells : undefined }
        });
        const instr = variant === 'shaded' ? "Gölgeli alanlara sadece çift sayı yazabilirsin." : "Gri kutulara çift sayı gelmelidir.";
        results.push({title: 'Sudoku Varyasyonu (Hızlı Mod)', instruction: instr, pedagogicalNote: "Kategorizasyon ve mantıksal kısıtlama yönetimi.", imagePrompt: 'Sudoku', puzzles});
    }
    return results;
}

export const generateOfflineRomanNumeralStarHunt = async (options: GeneratorOptions) => {
    const { worksheetCount, difficulty, itemCount } = options;
    const size = difficulty === 'Başlangıç' ? 5 : 6;
    const starsPerRegion = difficulty === 'Başlangıç' ? 1 : 2;
    const results: RomanNumeralStarHuntData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const latin = generateLatinSquare(size);
        const solution = latin.map(row => row.map(val => val === 1 ? 1 : 0));
        const rowCounts = solution.map(row => toRoman(row.reduce((a,b) => a+b, 0)));
        const colCounts = Array.from({length: size}, (_, c) => toRoman(solution.reduce((a, row) => a + row[c], 0)));
        const grid: (string | null)[][] = Array.from({ length: size + 1 }, () => Array(size + 1).fill(null));
        for(let r=0; r<size; r++) grid[r+1][0] = rowCounts[r];
        for(let c=0; c<size; c++) grid[0][c+1] = colCounts[c];
        results.push({ title: 'Yıldız Avı (Romen Rakamlı) (Hızlı Mod)', prompt: 'Her satır ve sütunda belirtilen sayıda yıldız olmalı.', instruction: "Tablonun kenarındaki Romen rakamları, o satır/sütundaki yıldız sayısını gösterir.", pedagogicalNote: "Mantıksal eleme ve uzamsal akıl yürütme.", imagePrompt: 'Yıldız', grid, starCount: starsPerRegion });
    }
    return results;
}

export const generateOfflineRomanNumeralMultiplication = async (options: GeneratorOptions) => {
    const { itemCount, worksheetCount } = options;
    const results: RomanNumeralMultiplicationData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const puzzles = Array.from({ length: itemCount || 4 }, () => {
            const n1 = getRandomInt(1, 10);
            const n2 = getRandomInt(1, 10);
            const n3 = getRandomInt(1, 10);
            const n4 = getRandomInt(1, 10);
            return {
                row1: toRoman(n1), row2: toRoman(n2), col1: toRoman(n3), col2: toRoman(n4),
                results: { r1c1: Math.random() > 0.5 ? toRoman(n1 * n3) : null, r1c2: Math.random() > 0.5 ? toRoman(n1 * n4) : null, r2c1: Math.random() > 0.5 ? toRoman(n2 * n3) : null, r2c2: Math.random() > 0.5 ? toRoman(n2 * n4) : null }
            };
        });
        results.push({ title: 'İşlem Karesi (Romen Rakamlı) (Hızlı Mod)', instruction: "Satır ve sütun başlıklarını çarpıp sonuçları ilgili kutulara yazın.", pedagogicalNote: "Romen rakamları ile çarpma işlemi pratiği.", imagePrompt: 'Romen Rakamı', puzzles });
    }
    return results;
}

export const generateOfflineKendoku = async (options: GeneratorOptions) => {
    const { difficulty, worksheetCount, itemCount } = options;
    const size = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 4 : 5);
    const results: KendokuData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const puzzles = Array.from({length: itemCount || 2}).map(() => {
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
                    if (cageCells.length === 1) { target = values[0]; finalOp = ''; } else { if (op === '+') target = values.reduce((a,b) => a+b, 0); else if (op === '×') target = values.reduce((a,b) => a*b, 1); else if (op === '-') { if(values.length === 2) target = Math.abs(values[0] - values[1]); else { target = values.reduce((a,b) => a+b, 0); finalOp = '+'; } } else if (op === '÷') { if(values.length === 2) { const max = Math.max(...values); const min = Math.min(...values); if(max % min === 0) target = max / min; else { target = values.reduce((a,b) => a+b, 0); finalOp = '+'; } } else { target = values.reduce((a,b) => a+b, 0); finalOp = '+'; } } }
                    cages.push({ cells: cageCells, operation: finalOp, target });
                }
            }
            return { size, grid: Array.from({length: size}, () => Array(size).fill(null)), cages };
        });
        results.push({ title: 'Kendoku (Hızlı Mod)', instruction: "Kafeslerin sol üstündeki sayı ve işleme göre kutuları doldur. Her satır ve sütunda rakamlar bir kez kullanılmalı.", pedagogicalNote: "Aritmetik işlem yeteneği ve problem çözme stratejileri.", imagePrompt: 'Mantık', puzzles });
    }
    return results;
}

export const generateOfflineShapeSudoku = async (options: GeneratorOptions) => {
    const {itemCount, worksheetCount, difficulty} = options;
    const settings = getDifficultySettings(difficulty);
    const size = settings.sudokuSize;
    return Array.from({length: worksheetCount}, () => {
        const puzzles = Array.from({length: itemCount || 2}).map(() => {
            const grid = generateSudokuGrid(size, difficulty);
            const shapes = getRandomItems(SHAPE_TYPES, size);
            const shapeGrid = grid.map(row => row.map(cell => cell === null ? null : shapes[(cell-1) % shapes.length]));
            return {grid: shapeGrid, shapesToUse: shapes.map(s => ({shape: s, label: s}))};
        });
        return { title: `Şekilli Sudoku (${difficulty})`, prompt: 'Şekilleri tekrar etmeyecek şekilde yerleştirin.', instruction: `Her satır, sütun ve bölgede her şekil bir kez kullanılmalıdır.`, pedagogicalNote: "Sayılar yerine semboller kullanarak Sudoku mantığını öğretir.", imagePrompt: 'Sudoku', puzzles }
    });
}

export const generateOfflineOperationSquareFillIn = async (options: GeneratorOptions) => {
     const { worksheetCount, itemCount, operationType } = options;
     const results: OperationSquareFillInData[] = [];
     for(let i=0; i<worksheetCount; i++) {
         const puzzles = Array.from({length: itemCount || 4}).map(() => {
             const nums = shuffle([1,2,3,4,5,6,7,8,9]);
             const n1=nums[0], n2=nums[1], n3=nums[2], n4=nums[3];
             let grid: (string|null)[][] = [];
             if (operationType === 'multdiv') {
                 grid = [ [null, '×', null, '=', (n1*n2).toString()], ['÷', null, '÷', null, null], [null, '×', null, '=', (n3*n4).toString()], ['=', null, '=', null, null], [Math.round(n1/n3).toString(), null, Math.round(n2/n4).toString(), null, null] ];
             } else {
                 grid = [ [null, '+', null, '=', (n1+n2).toString()], ['+', null, '+', null, null], [null, '+', null, '=', (n3+n4).toString()], ['=', null, '=', null, null], [(n1+n3).toString(), null, (n2+n4).toString(), null, null] ];
             }
             return {grid, numbersToUse: [n1, n2, n3, n4], results: []};
         });
         results.push({ title: 'İşlem Karesi (Hızlı Mod)', instruction: "Sonuçları tutturmak için kutulara uygun sayıları yaz.", pedagogicalNote: "Denklem çözme ve aritmetik akıl yürütme.", imagePrompt: 'İşlem', puzzles });
     }
     return results;
}

export const generateOfflineMultiplicationWheel = async (options: GeneratorOptions) => {
     const { itemCount, worksheetCount } = options;
     const results: MultiplicationWheelData[] = [];
     for(let i=0; i<worksheetCount; i++) {
         const puzzles = Array.from({length: itemCount || 6}).map(() => {
             const center = getRandomInt(2, 9);
             const outer = Array.from({length: 8}, () => getRandomInt(1, 10));
             const outerMasked: (number|null)[] = outer.map(n => Math.random() > 0.4 ? n : null);
             return { outerNumbers: outerMasked, innerResult: center };
         });
         results.push({title: 'Çarpım Çarkı (Hızlı Mod)', imagePrompt: 'Çark', instruction: '', pedagogicalNote: '', puzzles});
     }
     return results;
}
export const generateOfflineTargetNumber = async (options: GeneratorOptions) => {
     const {itemCount, worksheetCount} = options;
     return Array.from({length: worksheetCount}, () => ({ title: 'Hedef Sayı (Hızlı Mod)', prompt: 'Verilen sayılarla dört işlem yaparak hedef sayıya ulaşın.', instruction: 'Sayıları kullanarak hedef sayıya ulaşın.', pedagogicalNote: 'Aritmetik işlem becerisi.', imagePrompt: 'Hedef', puzzles: Array.from({length: itemCount || 4}, () => { const n1 = getRandomInt(1, 9); const n2 = getRandomInt(1, 9); const n3 = getRandomInt(1, 9); const n4 = getRandomInt(1, 9); return {target: n1 * n2 + n3 - n4, givenNumbers: [n1, n2, n3, n4]}; }) }));
}

export const generateOfflineVisualNumberPattern = async (options: GeneratorOptions) => {
    const {itemCount, worksheetCount} = options;
    const results: VisualNumberPatternData[] = [];
    for(let i=0; i<worksheetCount; i++) {
        const puzzles = Array.from({length: itemCount || 3}, () => {
            const start = getRandomInt(1, 5);
            const step = getRandomInt(2, 4);
            const items = Array.from({length: 4}, (_, k) => ({ number: start + k * step, color: ['#3B82F6', '#EF4444', '#10B981'][k % 3], size: 1 + (k % 2) * 0.5 }));
            return { items, rule: `Sayılar ${step} artıyor.`, answer: start + 4 * step };
        });
        results.push({ title: 'Görsel Sayı Örüntüsü (Hızlı Mod)', instruction: "Sayı, renk ve boyut değişimindeki kuralı bulup bir sonraki adımı tahmin et.", pedagogicalNote: "Çoklu değişkenli örüntü tanıma becerisi.", imagePrompt: 'Örüntü', puzzles });
    }
    return results;
}
export const generateOfflineLogicGridPuzzle = async (options: GeneratorOptions) => {
    const { worksheetCount } = options;
    const peoplePool = ['Ali', 'Ayşe', 'Can', 'Duru', 'Ece', 'Mert'];
    const petPool = ['Kedi', 'Köpek', 'Kuş', 'Balık', 'Tavşan', 'Kaplumbağa'];
    const colorPool = ['Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Mor', 'Turuncu'];
    const results: LogicGridPuzzleData[] = [];
    for(let i=0; i<worksheetCount; i++){
        const people = getRandomItems(peoplePool, 3);
        const pets = getRandomItems(petPool, 3);
        const colors = getRandomItems(colorPool, 3);
        const clues = [ `${people[0]}, ${pets[0]} besliyor.`, `${colors[0]} rengini seven kişi ${people[0]}.`, `${people[1]} ${colors[1]} rengini sever ama ${pets[2]} beslemez.`, `${pets[2]} sahibi ${colors[2]} rengini seviyor.`, `${people[2]} ${pets[0]} sahibi değildir.` ];
        results.push({ title: 'Mantık Tablosu (Hızlı Mod)', instruction: "Tabloda 'Evet' için ✔, 'Hayır' için ✘ işareti koyarak ilerle.", pedagogicalNote: "Sistematik düşünme, eleme ve çıkarım yapma becerileri.", imagePrompt: 'Mantık', clues: shuffle(clues).slice(0, 4), people: people, categories: [ { title: 'Evcil Hayvan', items: pets.map(p => ({name: p, imageDescription: p, imagePrompt: p})) }, { title: 'Favori Renk', items: colors.map(c => ({name: c, imageDescription: c, imagePrompt: c})) } ] });
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
        results.push({ title: 'Farkı Fark Et (Anlamsal) (Hızlı Mod)', instruction: "Her grupta, anlamsal olarak diğerlerinden farklı olan kelimeyi bulun.", pedagogicalNote: "Kategorik düşünme ve semantik ayrım becerisi.", imagePrompt: 'Fark', groups });
    }
    return results;
};
export const generateOfflineThematicOddOneOut = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const res = await generateOfflineOddOneOut({ ...options, itemCount: (itemCount || 5) * worksheetCount, worksheetCount: 1});
    return [{ title: `Tematik Farkı Bul (${topic || 'Rastgele'}) (Hızlı Mod)`, prompt: "Her satırda temaya uymayan kelimeyi bul.", theme: topic || 'Genel', rows: res[0].groups.map(g => ({words: g.words.map(w => ({ text: w, imagePrompt: 'Nesne' })), oddWord: ''})), sentencePrompt: 'Farklı kelimelerle birer cümle kur.', instruction: 'Temaya uymayanı bul.', pedagogicalNote: 'Kategorizasyon.', imagePrompt: 'Tema' }];
};
export const generateOfflineThematicOddOneOutSentence = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const res = await generateOfflineOddOneOut({ ...options, itemCount: (itemCount || 5) * worksheetCount, worksheetCount: 1});
    return [{ title: `Tematik Farklı Kelimeyle Cümle Kurma (Hızlı Mod)`, prompt: "Her satırda temaya uymayan kelimeyi bul ve o kelimeyle bir cümle kur.", rows: res[0].groups.map(g => ({words: g.words, oddWord: ''})), sentencePrompt: 'Farklı kelimelerle kurduğun cümleleri aşağıya yaz.', instruction: 'Farklı olanı bul ve cümle kur.', pedagogicalNote: 'Sözdizimi ve kategorizasyon.', imagePrompt: 'Cümle' }];
};
export const generateOfflineColumnOddOneOutSentence = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    const {itemCount, worksheetCount} = options;
    const res = await generateOfflineOddOneOut({ ...options, itemCount: (itemCount || 4) * worksheetCount, worksheetCount: 1});
    return [{ title: 'Sütunlarda Farklı Olan (Hızlı Mod)', prompt: 'Her sütunda farklı olanı bul.', columns: res[0].groups.map(g => ({words: g.words, oddWord: ''})), sentencePrompt: 'Farklı kelimelerle cümle kur.', instruction: 'Sütunlardaki farklı kelimeyi bul.', pedagogicalNote: 'Sınıflandırma.', imagePrompt: 'Sütun' }];
};

// --- UPDATED PUNCTUATION MAZE GENERATOR ---
export const generateOfflinePunctuationMaze = async (options: GeneratorOptions): Promise<PunctuationMazeData[]> => {
    const { worksheetCount } = options;
    
    // Correct/Incorrect rules for Comma (Virgül)
    const correctRules = [
        "Elma, armut, muz",
        "Pazardan süt, yumurta aldım.",
        "Ali, bugün okula gelmedi.",
        "Evet, seninle geliyorum.",
        "Bahçe kapısı açıldı, içeri girdik.",
        "Sevgili Kardeşim,",
        "Akşam oldu, eve döndük.",
        "Genç, doktoru aradı.",
        "Çalışkan, dürüst biridir.",
        "Kitap, kalem ve defter"
    ];
    
    const incorrectRules = [
        "Ahmet topu, attı.",
        "Ben, geldim.",
        "Çok, hızlı koştu.",
        "Okula, gidiyorum.",
        "Hava, çok güzel.",
        "Babam, eve geldi.",
        "Seni, seviyorum.",
        "Mavi, gökyüzü.",
        "Hızlı, araba.",
        "Güzel, çiçek."
    ];

    return Array.from({length: worksheetCount}, () => {
        // Generate a 5x5 grid based path using the new helper
        const rows = 5;
        const cols = 5;
        const { grid, pathIds, distractorIds } = generateMazePath(rows, cols);
        
        const finalRules: {id: number, text: string, isCorrect: boolean, isPath: boolean}[] = [];
        
        // Map path IDs to correct rules and distractors to incorrect
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const cellId = grid[r][c]; // 1..25
                const isPath = pathIds.includes(cellId);
                const text = isPath 
                    ? getRandomItems(correctRules, 1)[0] 
                    : getRandomItems(incorrectRules, 1)[0];
                
                finalRules.push({
                    id: cellId,
                    text: text,
                    isCorrect: isPath,
                    isPath: isPath
                });
            }
        }
        
        // Sort rules by ID for display list
        finalRules.sort((a, b) => a.id - b.id);

        return {
            title: 'Noktalama Labirenti (Virgül)',
            prompt: 'Virgülün doğru kullanıldığı kuralları takip ederek labirentten çık.',
            punctuationMark: ',',
            grid: grid, // Store layout
            rules: finalRules, 
            instruction: 'Başlangıçtan başlayarak, sadece virgülün DOĞRU kullanıldığı kutuları takip et ve çıkışa ulaş.',
            pedagogicalNote: "Bu etkinlik, öğrencinin 'Virgül' noktalama işaretinin kullanım kuralları hakkındaki bilgisini pekiştirirken, aynı zamanda mantıksal çıkarım, analitik düşünme ve problem çözme becerilerini geliştirir. Labirent formatı, soyut kuralları görsel-uzamsal bir bağlamda ele almayı teşvik ederek öğrenmeyi daha ilgi çekici ve kalıcı hale getirir. Öğrencinin dikkatini ve odaklanma yeteneğini artırır.",
            imagePrompt: generateSimpleMazeSVG() // Using SVG Generator for visual header
        };
    });
};

export const generateOfflinePunctuationPhoneNumber = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
    return Array.from({length: options.worksheetCount}, () => {
        const targetNum = getRandomInt(1000000, 9999999).toString();
        const clues = targetNum.split('').map((digit, i) => ({ id: i+1, text: `${i+1}. rakam: ${digit}`}));
        return { title: 'Gizli Telefon Numarası (Hızlı Mod)', prompt: 'İpuçlarını çöz ve numarayı bul.', instruction: 'Her ipucu bir rakama karşılık geliyor.', clues: clues, solution: [{punctuationMark: '#', number: parseInt(targetNum)}], pedagogicalNote: 'Mantıksal takip.', imagePrompt: 'Telefon' };
    });
};
export const generateOfflineShapeNumberPattern = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    const {itemCount, worksheetCount} = options;
    return Array.from({length: worksheetCount}, () => ({ title: 'Şekilli Sayı Örüntüsü (Hızlı Mod)', instruction: "Şekillerin köşelerindeki sayıları toplayıp '?' yerine gelecek sayıyı yazın.", pedagogicalNote: "Görsel ve sayısal örüntüleri birleştirerek problem çözme.", imagePrompt: 'Örüntü', patterns: Array.from({length: itemCount || 3}, () => { const left = getRandomInt(1, 10); const right = getRandomInt(1, 10); const top = left + right; return { shapes: [ { type: 'triangle', numbers: [left, right, top] }, { type: 'triangle', numbers: [left+2, right+2, top+4] }, { type: 'triangle', numbers: [left+5, right+5, '?'] } ] }; }) }))
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
        results.push({ title: 'Sayı Yuvarlama Bağlamaca (Hızlı Mod)', prompt: 'Sayıları en yakın onluğa yuvarlayarak eşleştirin.', instruction: "Sayıları en yakın onluk değerleriyle çizgilerle birleştirin.", pedagogicalNote: "Sayı yuvarlama pratiği ve mantıksal eşleştirme.", example: 'Örn: 23 → 20, 48 → 50', imagePrompt: 'Yuvarlama', numbers });
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
             if (Math.random() > 0.5) { const n2 = target + getRandomInt(1, 5); expressions.push({ text: `${n2} - ${n2-target}`, value: target, group: j, x: p2.x, y: p2.y }); } else { expressions.push({ text: `${target}`, value: target, group: j, x: p2.x, y: p2.y }); }
        }
        results.push({ title: 'İşlem Bağlamaca (Hızlı Mod)', prompt: 'Aynı sonucu veren işlemleri eşleştirin.', instruction: "Sonuçları aynı olan işlemleri veya sayıları çizgilerle birleştirin.", pedagogicalNote: "Zihinden işlem yapma ve denklik kavramı.", example: 'Örn: 5+3 = 8', imagePrompt: 'Eşleştirme', expressions });
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
        results.push({ title: 'Romen - Arap Rakamı Eşleştirme', prompt: 'Eşdeğer rakamları birleştir.', instruction: '', pedagogicalNote: '', imagePrompt: 'Romen Rakamı', gridDim: dim, points });
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
        results.push({ title: 'Romen Rakamı Bağlama (Hızlı Mod)', instruction: "Aynı Romen rakamlarını birbirine bağlayın.", pedagogicalNote: "Romen rakamlarını tanıma ve uzamsal planlama.", imagePrompt: 'Romen Rakamı', puzzles: [{title: 'Bulmaca', gridDim: dim, points}] });
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
        results.push({ title: 'Ağırlık Eşleştirme (Hızlı Mod)', prompt: 'Eşit ağırlıkları birleştir.', instruction: 'Birbiriyle eşit olan ağırlık değerlerini çizgilerle birleştirin.', pedagogicalNote: 'Ölçü birimleri dönüşümü ve görsel eşleştirme.', imagePrompt: 'Terazi', gridDim: dim, points });
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
        results.push({ title: 'Uzunluk Eşleştirme (Hızlı Mod)', prompt: 'Eşit uzunlukları birleştir.', instruction: 'Birbiriyle eşit olan uzunluk ölçülerini eşleştirin.', pedagogicalNote: 'Uzunluk ölçüleri dönüşümü ve görsel algı.', imagePrompt: 'Cetvel', gridDim: dim, points });
    }
    return results;
}
