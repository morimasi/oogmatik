
import { GeneratorOptions, MathPuzzleData, NumberCapsuleData, NumberPatternData, NumberPyramidData, OddEvenSudokuData, KendokuData, OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, FutoshikiData, VisualNumberPatternData, LogicGridPuzzleData, RomanNumeralStarHuntData, RomanNumeralConnectData, RomanNumeralMultiplicationData, RoundingConnectData, ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, OddOneOutData, ShapeType, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData, ShapeNumberPatternData, BasicOperationsData, RealLifeProblemData } from '../../types';
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

export const generateOfflineBasicOperations = async (options: GeneratorOptions): Promise<BasicOperationsData[]> => {
    const { selectedOperations, num1Digits, num2Digits, allowCarry, allowBorrow, allowRemainder, useThirdNumber, worksheetCount, itemCount } = options;
    
    // Default to 25 items (5x5 grid) to fit A4 perfectly if not specified
    const count = itemCount || 25;
    const results: BasicOperationsData[] = [];
    
    // Defaults
    const d1 = num1Digits || 2;
    const d2 = num2Digits || 1;
    
    // Determine available operations
    const ops = (selectedOperations && selectedOperations.length > 0) ? selectedOperations : ['addition'];

    for(let i=0; i<worksheetCount; i++) {
        const operationsList: BasicOperationsData['operations'] = [];
        
        let attempts = 0;
        // Cycle through selected operations evenly
        let opIndex = 0;

        while(operationsList.length < count && attempts < 2000) {
            attempts++;
            const currentOp = ops[opIndex % ops.length];
            
            // Digit ranges
            const min1 = Math.pow(10, d1 - 1);
            const max1 = Math.pow(10, d1) - 1;
            
            const min2 = Math.pow(10, d2 - 1);
            const max2 = Math.pow(10, d2) - 1;
            
            let num1 = 0, num2 = 0, num3 = 0, answer = 0, remainder = 0;
            let operator: any = '+';
            let valid = false;

            if (currentOp === 'addition') {
                operator = '+';
                const hasThird = useThirdNumber && d1 < 4; 
                
                num1 = getRandomInt(min1, max1);
                num2 = getRandomInt(min2, max2);
                
                if (hasThird) {
                    // Use d2 for the third number generally
                    const min3 = Math.pow(10, Math.max(1, d2 - 1));
                    const max3 = Math.pow(10, d2) - 1;
                    num3 = getRandomInt(min3, max3);
                }

                const isCarry = hasCarry(num1, num2) || (hasThird && (hasCarry(num1+num2, num3)));
                
                if (allowCarry) {
                    valid = true; 
                } else {
                    valid = !isCarry;
                }

                if (valid) answer = num1 + num2 + num3;
            } 
            else if (currentOp === 'subtraction') {
                operator = '-';
                num1 = getRandomInt(min1, max1);
                num2 = getRandomInt(min2, max2);
                
                // Ensure num1 is greater
                if (num2 >= num1) {
                    // If digits are equal, swap or regenerate
                    if (d1 === d2) {
                        // Just ensure num1 > num2, if not swap, but swapping might violate digit rules if bounds differ slightly?
                        // Actually if d1=d2, ranges are same. Swap is safe.
                        if(num2 > num1) [num1, num2] = [num2, num1];
                        else if(num1 === num2) num1 += 1; // Hack to make it greater
                    } else {
                        // Regenerate num2 to be smaller
                        num2 = getRandomInt(min2, Math.min(max2, num1 - 1));
                    }
                }
                
                const isBorrow = hasBorrow(num1, num2);
                
                if (allowBorrow) {
                    valid = true; 
                } else {
                    valid = !isBorrow; 
                }
                
                if (valid) answer = num1 - num2;
            }
            else if (currentOp === 'multiplication') {
                operator = 'x';
                num1 = getRandomInt(min1, max1);
                num2 = getRandomInt(min2, max2);
                answer = num1 * num2;
                valid = true; 
            }
            else if (currentOp === 'division') {
                operator = '÷';
                // Standard Logic: user defines dividend (num1) digits and divisor (num2) digits.
                // We need to find num1 (d1 digits) and num2 (d2 digits).
                
                num2 = getRandomInt(min2, max2);
                if (num2 === 0) num2 = 1; // Safety

                if (allowRemainder) {
                    // Generate num1 directly in range
                    num1 = getRandomInt(min1, max1);
                    answer = Math.floor(num1 / num2);
                    remainder = num1 % num2;
                    // Valid if remainder exists (as requested) OR if we just allow it
                    valid = remainder > 0;
                } else {
                    // No remainder required
                    // Find a multiplier X such that num2 * X has d1 digits.
                    const minQuotient = Math.ceil(min1 / num2);
                    const maxQuotient = Math.floor(max1 / num2);
                    
                    if (maxQuotient >= minQuotient) {
                        answer = getRandomInt(minQuotient, maxQuotient);
                        num1 = answer * num2;
                        remainder = 0;
                        valid = true;
                    } else {
                        // Impossible constraints (e.g. 2 digit divided by 3 digit)
                        valid = false; 
                    }
                }
            }

            if (valid) {
                operationsList.push({ 
                    num1, 
                    num2, 
                    num3: num3 > 0 ? num3 : undefined, 
                    operator, 
                    answer, 
                    remainder: remainder > 0 ? remainder : undefined 
                });
                opIndex++; // Move to next operation type for balanced distribution
            }
        }

        results.push({
            title: 'Dört İşlem Alıştırmaları',
            instruction: 'Aşağıdaki işlemleri dikkatlice yapın.',
            pedagogicalNote: 'İşlem akıcılığı, eldeli/eldesiz toplama ve onluk bozma becerilerini geliştirir.',
            imagePrompt: '',
            isVertical: true,
            operations: operationsList
        });
    }
    return results;
};

export const generateOfflineRealLifeMathProblems = async (options: GeneratorOptions): Promise<RealLifeProblemData[]> => {
    const { worksheetCount, itemCount, operationType, difficulty } = options;
    const results: RealLifeProblemData[] = [];
    
    // Dynamic Templates based on difficulty and operation
    const names = ["Ali", "Ayşe", "Mehmet", "Zeynep", "Can", "Elif", "Mert", "Duru"];
    const items = ["elma", "kalem", "ceviz", "kitap", "bilye", "lira", "şeker", "kurabiye"];
    
    const getTemplate = (op: string, diff: string) => {
        const templates = [];
        
        if (op === 'addition' || op === 'mixed') {
            templates.push(
                (n1: number, n2: number, name: string, item: string) => ({
                    text: `${name}'nin ${n1} tane ${item}sı vardı. Arkadaşı ona ${n2} tane daha verdi. ${name}'nin toplam kaç ${item}sı oldu?`,
                    ans: n1 + n2, hint: "Toplama"
                }),
                (n1: number, n2: number, name: string, item: string) => ({
                    text: `Bir manav sabah ${n1} kilo, öğleden sonra ${n2} kilo ${item} sattı. Manav toplam kaç kilo ${item} satmıştır?`,
                    ans: n1 + n2, hint: "Toplama"
                })
            );
        }
        
        if (op === 'subtraction' || op === 'mixed') {
            templates.push(
                (n1: number, n2: number, name: string, item: string) => ({
                    text: `${name} ${n1} sayfalık kitabın ${n2} sayfasını okudu. Geriye okuması gereken kaç sayfa kaldı?`,
                    ans: n1 - n2, hint: "Çıkarma"
                }),
                (n1: number, n2: number, name: string, item: string) => ({
                    text: `Otobüste ${n1} yolcu vardı. Durakta ${n2} yolcu indi. Otobüste kaç yolcu kaldı?`,
                    ans: n1 - n2, hint: "Çıkarma"
                })
            );
        }

        if (op === 'multiplication' || op === 'mixed') {
            templates.push(
                (n1: number, n2: number, name: string, item: string) => ({
                    text: `Her birinde ${n2} tane ${item} olan ${n1} kutu var. Toplam kaç ${item} vardır?`,
                    ans: n1 * n2, hint: "Çarpma"
                }),
                (n1: number, n2: number, name: string, item: string) => ({
                    text: `Bir apartmanda ${n1} kat, her katta ${n2} pencere var. Bu apartmanda toplam kaç pencere vardır?`,
                    ans: n1 * n2, hint: "Çarpma"
                })
            );
        }

        if (op === 'division' || op === 'mixed') {
            templates.push(
                (n1: number, n2: number, name: string, item: string) => ({
                    text: `${name}, ${n1} tane ${item}sını ${n2} arkadaşına eşit olarak paylaştırdı. Her arkadaşına kaç ${item} düşer?`,
                    ans: n1 / n2, hint: "Bölme"
                }),
                (n1: number, n2: number, name: string, item: string) => ({
                    text: `${n1} litre süt, ${n2} litrelik şişelere dolduruluyor. Kaç şişe gerekir?`,
                    ans: n1 / n2, hint: "Bölme"
                })
            );
        }
        return templates;
    };

    for(let i=0; i<worksheetCount; i++) {
        const problems: RealLifeProblemData['problems'] = [];
        const count = itemCount || 4;
        const effectiveOp = (!operationType || operationType === 'mixed') ? 'mixed' : operationType;

        for(let j=0; j<count; j++) {
            // Pick operation for this specific question if mixed
            let currentOp = effectiveOp;
            if (effectiveOp === 'mixed') {
                currentOp = ['addition', 'subtraction', 'multiplication', 'division'][j % 4];
            }

            const templateFuncs = getTemplate(currentOp, difficulty || 'Orta');
            const selectedFunc = getRandomItems(templateFuncs, 1)[0];
            
            const name = getRandomItems(names, 1)[0];
            const item = getRandomItems(items, 1)[0];
            
            let n1 = 0, n2 = 0;
            
            // Number logic based on operation to ensure logical results
            if (currentOp === 'addition') { n1 = getRandomInt(10, 100); n2 = getRandomInt(5, 50); }
            else if (currentOp === 'subtraction') { n1 = getRandomInt(20, 100); n2 = getRandomInt(5, n1-5); }
            else if (currentOp === 'multiplication') { n1 = getRandomInt(2, 10); n2 = getRandomInt(2, 10); }
            else if (currentOp === 'division') { n2 = getRandomInt(2, 9); const mult = getRandomInt(2, 12); n1 = n2 * mult; }

            const problemData = selectedFunc(n1, n2, name, item);

            problems.push({
                text: problemData.text,
                solution: `${problemData.ans}`,
                operationHint: problemData.hint,
                imagePrompt: '' // AI mode will fill this, offline mode leaves empty
            });
        }

        results.push({
            title: 'Gerçek Hayat Problemleri',
            instruction: 'Soruları dikkatlice oku ve çözümlerini yaz.',
            pedagogicalNote: 'Matematiksel modelleme ve okuduğunu anlama.',
            imagePrompt: '',
            problems
        });
    }
    return results;
};

export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { itemCount, worksheetCount, difficulty, operations, numberRange } = options;
    const settings = getDifficultySettings(difficulty);
    const objects = EMOJIS.slice(0, 15);
    
    let valueMin = settings.numberRange.min;
    let valueMax = settings.numberRange.max;
    
    if (numberRange) {
        const parts = numberRange.split('-');
        if (parts.length === 2) {
            valueMin = parseInt(parts[0]);
            valueMax = parseInt(parts[1]);
        }
    }

    let ops = settings.operations;
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
            imagePrompt: '',
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
        results.push({ title: 'Sayı Örüntüsü (Hızlı Mod)', instruction: "Örüntü kuralını bul ve '?' yerine gelecek sayıyı yaz.", pedagogicalNote: "Matematiksel tümevarım ve ilişkilendirme becerisi.", imagePrompt: '', patterns });
    }
    return results;
};

export const generateOfflineFutoshiki = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
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
            
            // If Length mode, populate units
            let units: (string | null)[][] | undefined = undefined;
            if (isLength) {
                const unitMap: Record<number, string> = { 1: '10cm', 2: '25cm', 3: '50cm', 4: '1m', 5: '2m', 6: '5m', 7: '10m', 8: '20m', 9: '50m' };
                units = maskedGrid.map(row => row.map(num => num === null ? null : unitMap[num] || `${num}m`));
            }

            return { size, numbers: maskedGrid, constraints, units };
        });

        results.push({ 
            title: `Futoşiki (${difficulty})`, 
            prompt: isLength ? 'Uzunlukları büyüktür/küçüktür sembollerine göre sıralayın.' : 'Büyüktür/küçüktür sembollerine göre sayıları yerleştirin.', 
            instruction: "Her satır ve sütunda öğeler bir kez bulunmalı. > ve < işaretlerine dikkat et.",
            pedagogicalNote: "Mantıksal çıkarım ve sayısal ilişki analizi.",
            imagePrompt: '',
            puzzles 
        });
    }
    return results;
}

export const generateOfflineNumberPyramid = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
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

        results.push({ title: `İşlem Piramidi (${difficulty})`, prompt: 'İşlemleri tamamla.', instruction: instr, pedagogicalNote: "İşlem akıcılığı ve parça-bütün ilişkisi.", imagePrompt: '', pyramids });
    }
    return results;
}

export const generateOfflineNumberCapsule = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
     const {worksheetCount, itemCount} = options;
     return Array.from({length: worksheetCount}, () => ({ 
         title: 'Kapsül Oyunu (Hızlı Mod)', 
         prompt: 'Kapsülleri doldurun.',
         instruction: "Her kapsülün içindeki sayıların toplamı hedef sayıya eşit olmalıdır.",
         pedagogicalNote: "Toplama ve mantıksal eleme becerisi.",
         imagePrompt: '',
         puzzles: Array.from({length: itemCount || 2}).map((_, idx) => ({
             title: `Bulmaca ${idx+1}`,
             numbersToUse: '1-9 arası',
             grid: [[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]],
             capsules: [
                 { cells: [{row:0, col:0}, {row:0,col:1}], sum: 10},
                 { cells: [{row:1, col:0}, {row:2,col:0}], sum: 8},
                 { cells: [{row:0, col:2}, {row:1,col:2}, {row:1,col:1}], sum: 15}
             ]
         }))
    }));
}

export const generateOfflineOddEvenSudoku = async (options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
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
            return {
                title: 'Bulmaca',
                numbersToUse: '1-6',
                grid,
                constrainedCells: variant === 'shaded' ? undefined : constrainedCells,
                shadedCells: variant === 'shaded' ? shadedCells : undefined
            }
        });
        
        const instr = variant === 'shaded' ? "Gölgeli alanlara sadece çift sayı yazabilirsin." : "Gri kutulara çift sayı gelmelidir.";
        results.push({title: 'Sudoku Varyasyonu (Hızlı Mod)', prompt: 'Kurallara uygun doldur.', instruction: instr, pedagogicalNote: "Kategorizasyon ve mantıksal kısıtlama yönetimi.", imagePrompt: '', puzzles});
    }
    return results;
}

export const generateOfflineRomanNumeralStarHunt = async (options: GeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
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
        
        // Fill headers
        for(let r=0; r<size; r++) grid[r+1][0] = rowCounts[r];
        for(let c=0; c<size; c++) grid[0][c+1] = colCounts[c];

        results.push({
            title: 'Yıldız Avı (Romen Rakamlı) (Hızlı Mod)',
            prompt: 'Her satır ve sütunda belirtilen sayıda yıldız olmalı.',
            instruction: "Tablonun kenarındaki Romen rakamları, o satır/sütundaki yıldız sayısını gösterir.",
            pedagogicalNote: "Mantıksal eleme ve uzamsal akıl yürütme.",
            imagePrompt: '',
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
            imagePrompt: '',
            puzzles
        });
    }
    return results;
}

export const generateOfflineKendoku = async (options: GeneratorOptions): Promise<KendokuData[]> => {
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
            return { size, grid: Array.from({length: size}, () => Array(size).fill(null)), cages };
        });

        results.push({
            title: 'Kendoku (Hızlı Mod)',
            prompt: 'İşlem ipuçlarını kullanarak mantık bulmacasını çözün.',
            instruction: "Kafeslerin sol üstündeki sayı ve işleme göre kutuları doldur. Her satır ve sütunda rakamlar bir kez kullanılmalı.",
            pedagogicalNote: "Aritmetik işlem yeteneği ve problem çözme stratejileri.",
            imagePrompt: '',
            puzzles
        });
    }
    return results;
}

export const generateOfflineShapeSudoku = async (options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
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
        
        return {
            title: `Şekilli Sudoku (${difficulty})`,
            prompt: 'Şekilleri tekrar etmeyecek şekilde yerleştirin.',
            instruction: `Her satır, sütun ve bölgede her şekil bir kez kullanılmalıdır.`,
            pedagogicalNote: "Sayılar yerine semboller kullanarak Sudoku mantığını öğretir.",
            imagePrompt: '',
            puzzles
        }
    });
}

export const generateOfflineOperationSquareFillIn = async (options: GeneratorOptions): Promise<OperationSquareFillInData[]> => {
     const { worksheetCount, itemCount, operationType } = options;
     const results: OperationSquareFillInData[] = [];
     
     for(let i=0; i<worksheetCount; i++) {
         const puzzles = Array.from({length: itemCount || 4}).map(() => {
             const nums = shuffle([1,2,3,4,5,6,7,8,9]);
             const n1=nums[0], n2=nums[1], n3=nums[2], n4=nums[3];
             let grid: (string|null)[][] = [];
             
             if (operationType === 'multdiv') {
                 grid = [
                     [null, '×', null, '=', (n1*n2).toString()],
                     ['÷', null, '÷', null, null],
                     [null, '×', null, '=', (n3*n4).toString()],
                     ['=', null, '=', null, null],
                     [Math.round(n1/n3).toString(), null, Math.round(n2/n4).toString(), null, null]
                 ];
             } else {
                 grid = [
                     [null, '+', null, '=', (n1+n2).toString()],
                     ['+', null, '+', null, null],
                     [null, '+', null, '=', (n3+n4).toString()],
                     ['=', null, '=', null, null],
                     [(n1+n3).toString(), null, (n2+n4).toString(), null, null]
                 ];
             }
             return {grid, numbersToUse: [n1, n2, n3, n4], results: []};
         });
         results.push({
             title: 'İşlem Karesi (Hızlı Mod)',
             prompt: 'Verilen sayıları yerleştir.',
             instruction: "Sonuçları tutturmak için kutulara uygun sayıları yaz.",
             pedagogicalNote: "Denklem çözme ve aritmetik akıl yürütme.",
             imagePrompt: '',
             puzzles
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
         results.push({title: 'Çarpım Çarkı (Hızlı Mod)', prompt: 'Merkezdeki sayıyla çarpıp dışarı yazın.', imagePrompt: '', instruction: '', pedagogicalNote: '', puzzles});
     }
     return results;
}
export const generateOfflineTargetNumber = async (options: GeneratorOptions): Promise<TargetNumberData[]> => {
     const {itemCount, worksheetCount} = options;
     return Array.from({length: worksheetCount}, () => ({ 
         title: 'Hedef Sayı (Hızlı Mod)', 
         prompt: 'Verilen sayılarla dört işlem yaparak hedef sayıya ulaşın.',
         instruction: 'Sayıları kullanarak hedef sayıya ulaşın.',
         pedagogicalNote: 'Aritmetik işlem becerisi.',
         imagePrompt: '',
         puzzles: Array.from({length: itemCount || 4}, () => {
             const n1 = getRandomInt(1, 9);
             const n2 = getRandomInt(1, 9);
             const n3 = getRandomInt(1, 9);
             const n4 = getRandomInt(1, 9);
             return {target: n1 * n2 + n3 - n4, givenNumbers: [n1, n2, n3, n4]};
         }) 
    }));
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
        results.push({ title: 'Görsel Sayı Örüntüsü (Hızlı Mod)', prompt: 'Görsel dizideki kuralı bulup eksik sayıyı tamamlayın.', instruction: "Sayı, renk ve boyut değişimindeki kuralı bulup bir sonraki adımı tahmin et.", pedagogicalNote: "Çoklu değişkenli örüntü tanıma becerisi.", imagePrompt: '', puzzles });
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
            imagePrompt: '',
            clues: shuffle(clues).slice(0, 4), 
            people: people, 
            categories: [
                { title: 'Evcil Hayvan', items: pets.map(p => ({name: p, imageDescription: p, imagePrompt: ''})) },
                { title: 'Favori Renk', items: colors.map(c => ({name: c, imageDescription: c, imagePrompt: ''})) }
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
        results.push({ title: 'Farkı Fark Et (Anlamsal) (Hızlı Mod)', instruction: "Her grupta, anlamsal olarak diğerlerinden farklı olan kelimeyi bulun.", pedagogicalNote: "Kategorik düşünme ve semantik ayrım becerisi.", imagePrompt: '', groups });
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
        rows: res[0].groups.map(g => ({words: g.words.map(w => ({ text: w, imagePrompt: '' })), oddWord: ''})),
        sentencePrompt: 'Farklı kelimelerle birer cümle kur.',
        instruction: 'Temaya uymayanı bul.',
        pedagogicalNote: 'Kategorizasyon.',
        imagePrompt: ''
    }];
};
export const generateOfflineThematicOddOneOutSentence = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const res = await generateOfflineOddOneOut({ ...options, itemCount: (itemCount || 5) * worksheetCount, worksheetCount: 1});
    return [{
        title: `Tematik Farklı Kelimeyle Cümle Kurma (Hızlı Mod)`,
        prompt: "Her satırda temaya uymayan kelimeyi bul ve o kelimeyle bir cümle kur.",
        rows: res[0].groups.map(g => ({words: g.words, oddWord: ''})),
        sentencePrompt: 'Farklı kelimelerle kurduğun cümleleri aşağıya yaz.',
        instruction: 'Farklı olanı bul ve cümle kur.',
        pedagogicalNote: 'Sözdizimi ve kategorizasyon.',
        imagePrompt: ''
    }];
};
export const generateOfflineColumnOddOneOutSentence = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    const {itemCount, worksheetCount} = options;
    const res = await generateOfflineOddOneOut({ ...options, itemCount: (itemCount || 4) * worksheetCount, worksheetCount: 1});
    return [{
        title: 'Sütunlarda Farklı Olan (Hızlı Mod)',
        prompt: 'Her sütunda farklı olanı bul.',
        columns: res[0].groups.map(g => ({words: g.words, oddWord: ''})),
        sentencePrompt: 'Farklı kelimelerle cümle kur.',
        instruction: 'Sütunlardaki farklı kelimeyi bul.',
        pedagogicalNote: 'Sınıflandırma.',
        imagePrompt: ''
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
            ]),
            instruction: 'Labirenti çöz.',
            pedagogicalNote: 'Noktalama kuralları.',
            imagePrompt: ''
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
            solution: [{punctuationMark: '#', number: parseInt(targetNum)}],
            pedagogicalNote: 'Mantıksal takip.',
            imagePrompt: ''
        };
    });
};
export const generateOfflineShapeNumberPattern = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    const {itemCount, worksheetCount} = options;
    return Array.from({length: worksheetCount}, () => ({
        title: 'Şekilli Sayı Örüntüsü (Hızlı Mod)',
        instruction: "Şekillerin köşelerindeki sayıları toplayıp '?' yerine gelecek sayıyı yazın.",
        pedagogicalNote: "Görsel ve sayısal örüntüleri birleştirerek problem çözme.",
        imagePrompt: '',
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
            imagePrompt: '',
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
            imagePrompt: '',
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
        results.push({ title: 'Romen - Arap Rakamı Eşleştirme', prompt: 'Eşdeğer rakamları birleştir.', instruction: '', pedagogicalNote: '', imagePrompt: '', gridDim: dim, points });
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
            imagePrompt: '',
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
        results.push({ title: 'Ağırlık Eşleştirme (Hızlı Mod)', prompt: 'Eşit ağırlıkları birleştir.', instruction: 'Birbiriyle eşit olan ağırlık değerlerini çizgilerle birleştirin.', pedagogicalNote: 'Ölçü birimleri dönüşümü ve görsel eşleştirme.', imagePrompt: '', gridDim: dim, points });
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
        results.push({ title: 'Uzunluk Eşleştirme (Hızlı Mod)', prompt: 'Eşit uzunlukları birleştir.', instruction: 'Birbiriyle eşit olan uzunluk ölçülerini eşleştirin.', pedagogicalNote: 'Uzunluk ölçüleri dönüşümü ve görsel algı.', imagePrompt: '', gridDim: dim, points });
    }
    return results;
}
