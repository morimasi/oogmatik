
import { GeneratorOptions, MathPuzzleData, NumberCapsuleData, NumberPatternData, NumberPyramidData, OddEvenSudokuData, KendokuData, OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, FutoshikiData, VisualNumberPatternData, LogicGridPuzzleData, RomanNumeralStarHuntData, RomanNumeralConnectData, RomanNumeralMultiplicationData, RoundingConnectData, ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, OddOneOutData, ShapeType, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData, ShapeNumberPatternData, BasicOperationsData, RealLifeProblemData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, EMOJIS, generateSudokuGrid, generateLatinSquare, TR_VOCAB, SHAPE_TYPES, ITEM_CATEGORIES, generateSmartConnectGrid, CONNECT_COLORS, generateMaze, getDifficultySettings, generateMazePath, CATEGORY_NAMES } from './helpers';

// Helper for Carry/Borrow logic check
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

const hasBorrow = (n1: number, n2: number): boolean => {
    const s1 = n1.toString().split('').reverse();
    const s2 = n2.toString().split('').reverse();
    for (let i = 0; i < s2.length; i++) {
        if (parseInt(s1[i]) < parseInt(s2[i])) return true;
    }
    return false;
};

// BASIC OPERATIONS
export const generateOfflineBasicOperations = async (options: GeneratorOptions): Promise<BasicOperationsData[]> => {
    const { selectedOperations, operationType, numberRange, allowCarry, allowBorrow, allowRemainder, useThirdNumber, worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 25; 
    const results: BasicOperationsData[] = [];
    
    // Difficulty Overrides (If user selected Difficulty but not granular ranges)
    let minVal = 1, maxVal = 20;
    
    if (difficulty === 'Başlangıç') { minVal = 1; maxVal = 10; }
    else if (difficulty === 'Orta') { minVal = 1; maxVal = 50; }
    else if (difficulty === 'Zor') { minVal = 10; maxVal = 100; }
    else if (difficulty === 'Uzman') { minVal = 100; maxVal = 1000; }
    
    // Explicit overrides
    if (numberRange) {
        const parts = numberRange.split('-');
        if (parts.length === 2) {
            minVal = parseInt(parts[0]);
            maxVal = parseInt(parts[1]);
        } else if (numberRange === '100-1000') {
            minVal = 100; maxVal = 999;
        }
    }
    
    let ops = ['+'];
    if (operationType === 'mixed' && selectedOperations && selectedOperations.length > 0) {
        ops = selectedOperations.map(o => o === 'add' ? '+' : o === 'sub' ? '-' : o === 'mult' ? 'x' : o === 'div' ? '÷' : o).filter(o => ['+','-','x','÷'].includes(o));
    } else if (operationType) {
        if(operationType === 'add') ops = ['+'];
        if(operationType === 'sub') ops = ['-'];
        if(operationType === 'mult') ops = ['x'];
        if(operationType === 'div') ops = ['÷'];
    }
    if (ops.length === 0) ops = ['+'];

    for(let i=0; i<worksheetCount; i++) {
        const operationsList: BasicOperationsData['operations'] = [];
        let attempts = 0;
        
        while(operationsList.length < count && attempts < 5000) {
            attempts++;
            const currentOp = ops[getRandomInt(0, ops.length - 1)];
            let num1 = 0, num2 = 0, num3 = 0, answer = 0, remainder = 0;
            let valid = false;

            if (currentOp === '+') {
                num1 = getRandomInt(minVal, maxVal);
                num2 = getRandomInt(1, maxVal);
                
                // Third number logic based on difficulty or explicit option
                const shouldHaveThird = useThirdNumber || (difficulty === 'Uzman' && Math.random() > 0.5);
                if (shouldHaveThird) num3 = getRandomInt(1, maxVal);

                // Carry logic based on difficulty
                const isCarry = hasCarry(num1, num2) || (shouldHaveThird && (hasCarry(num1+num2, num3)));
                const allowC = allowCarry !== undefined ? allowCarry : (difficulty !== 'Başlangıç'); // Only beginner forces no carry
                valid = allowC ? true : !isCarry;
                
                if (valid) answer = num1 + num2 + num3;
            } 
            else if (currentOp === '-') {
                num1 = getRandomInt(minVal, maxVal);
                num2 = getRandomInt(1, num1);
                
                const isBorrow = hasBorrow(num1, num2);
                const allowB = allowBorrow !== undefined ? allowBorrow : (difficulty !== 'Başlangıç');
                valid = allowB ? true : !isBorrow; 
                
                if (valid) answer = num1 - num2;
            }
            else if (currentOp === 'x') {
                const multiplierLimit = difficulty === 'Başlangıç' ? 5 : (difficulty === 'Orta' ? 10 : maxVal);
                const m1 = getRandomInt(1, multiplierLimit); 
                const m2 = getRandomInt(1, multiplierLimit);
                num1 = m1; num2 = m2;
                answer = num1 * num2;
                valid = true; 
            }
            else if (currentOp === '÷') {
                const divisor = getRandomInt(2, difficulty === 'Başlangıç' ? 5 : 9);
                const allowR = allowRemainder !== undefined ? allowRemainder : (difficulty === 'Zor' || difficulty === 'Uzman');
                
                if (allowR && Math.random() > 0.5) {
                    const dividend = getRandomInt(minVal, maxVal);
                    num1 = dividend; num2 = divisor;
                    answer = Math.floor(num1 / num2);
                    remainder = num1 % num2;
                    valid = true;
                } else {
                    const quotient = getRandomInt(2, Math.floor(maxVal/divisor));
                    num1 = quotient * divisor;
                    num2 = divisor;
                    answer = quotient;
                    remainder = 0;
                    valid = true;
                }
            }

            if (valid) {
                operationsList.push({ 
                    num1, num2, num3: num3 > 0 ? num3 : undefined, operator: currentOp, answer, remainder: remainder > 0 ? remainder : undefined 
                });
            }
        }

        results.push({
            title: `İşlem Akıcılığı (${difficulty})`,
            instruction: 'Soruları dikkatlice çözün.',
            pedagogicalNote: 'İşlem pratiği.',
            imagePrompt: 'Math operations symbols',
            isVertical: true,
            operations: operationsList
        });
    }
    return results;
};

export const generateOfflineRealLifeMathProblems = async (options: GeneratorOptions): Promise<RealLifeProblemData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const results: RealLifeProblemData[] = [];
    const names = ["Ali", "Ayşe", "Can", "Elif", "Mert", "Zeynep", "Efe", "Ada"];
    const items = ["elma", "kalem", "ceviz", "kitap", "bilye", "şeker", "balon"];
    
    // Scale numbers by difficulty
    const getNum = () => {
        if (difficulty === 'Başlangıç') return getRandomInt(1, 10);
        if (difficulty === 'Orta') return getRandomInt(10, 50);
        return getRandomInt(50, 200);
    };

    const templates = [
        (n1: number, n2: number, name: string) => ({ text: `${name}'nin ${n1} lirası vardı. Babası ${n2} lira daha verdi. Toplam kaç lirası oldu?`, ans: n1 + n2 }),
        (n1: number, n2: number, name: string, item: string) => ({ text: `${name} ${n1} tane ${item} topladı. ${n2} tanesini arkadaşına verdi. Geriye kaç ${item} kaldı?`, ans: n1 - n2 }),
        (n1: number, n2: number, name: string, item: string) => ({ text: `Bir kutuda ${n1} paket ${item} var. Her pakette ${n2} tane varsa toplam kaç ${item} vardır?`, ans: n1 * n2 }),
        (n1: number, n2: number, name: string, item: string) => ({ text: `${name}, ${n1} tane ${item}sını ${n2} tabağa eşit paylaştırdı. Her tabakta kaç ${item} olur?`, ans: Math.floor(n1/n2) }),
    ];

    for(let i=0; i<worksheetCount; i++) {
        const problems = [];
        for(let j=0; j<(itemCount || 6); j++) {
            const func = templates[j % templates.length];
            const name = getRandomItems(names, 1)[0];
            const item = getRandomItems(items, 1)[0];
            const n1 = getNum();
            const n2 = difficulty === 'Başlangıç' ? getRandomInt(1, 5) : getRandomInt(2, 9); 
            
            // Adjust for subtraction/division safety
            const safeN1 = Math.max(n1, n2 * 2);
            
            const data = func(safeN1, n2, name, item);
            problems.push({ text: data.text, solution: `${data.ans}`, operationHint: "", imagePrompt: 'Math Problem' });
        }
        results.push({ title: `Problem Çözme (${difficulty})`, instruction: 'Problemleri dikkatle oku ve çöz.', pedagogicalNote: 'Matematiksel okuryazarlık.', imagePrompt: 'Thinking', problems });
    }
    return results;
};

export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { itemCount, worksheetCount } = options;
    const results: MathPuzzleData[] = [];
    const objects = ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓"];

    for (let i = 0; i < worksheetCount; i++) {
        const puzzles = Array.from({ length: itemCount || 9 }).map(() => {
            const val = getRandomInt(2, 9);
            const obj = getRandomItems(objects, 1)[0];
            return { problem: `${obj} + ${obj} = ?`, question: `İpucu: ${obj} = ${val}`, answer: (val+val).toString(), objects: [{name: obj, imagePrompt: 'fruit'}] };
        });
        results.push({ title: 'Sembollü İşlemler', instruction: "Sembollerin değerini yerine koy ve işlemi yap.", pedagogicalNote: "Cebirsel düşünme temeli.", imagePrompt: 'Symbols', puzzles });
    }
    return results;
};

export const generateOfflineNumberPattern = async (options: GeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: `Sayı Örüntüleri (${difficulty})`, instruction: 'Kuralı bul ve soru işareti yerine gelecek sayıyı yaz.', pedagogicalNote: 'İlişkisel düşünme.', imagePrompt: 'Pattern',
        patterns: Array.from({length: itemCount || 10}, () => {
            const start = getRandomInt(1, 10);
            const step = getRandomInt(2, difficulty === 'Başlangıç' ? 5 : 12);
            return { sequence: `${start}, ${start+step}, ${start+step*2}, ?`, answer: (start+step*3).toString() };
        })
    }));
};

// --- NEWLY IMPLEMENTED GENERATORS ---

export const generateOfflineFutoshiki = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { worksheetCount, difficulty } = options;
    const size = difficulty === 'Başlangıç' ? 4 : (difficulty === 'Orta' ? 5 : 6);
    return Array.from({ length: worksheetCount }, () => {
        const grid = generateLatinSquare(size);
        const constraints = [];
        for(let r=0; r<size; r++) {
            for(let c=0; c<size; c++) {
                if(c < size-1 && Math.random() > 0.7) constraints.push({row1: r, col1: c, row2: r, col2: c+1, symbol: grid[r][c] > grid[r][c+1] ? '>' : '<'});
                if(r < size-1 && Math.random() > 0.7) constraints.push({row1: r, col1: c, row2: r+1, col2: c, symbol: grid[r][c] > grid[r+1][c] ? '>' : '<'});
            }
        }
        const puzzleGrid = grid.map(row => row.map(v => Math.random() > 0.5 ? v : null));
        return {
            title: 'Futoşiki', instruction: 'Sayıları yerleştir ve büyüktür/küçüktür işaretlerine dikkat et.', pedagogicalNote: 'Mantıksal sıralama ve eşitsizlik kavramı.', imagePrompt: 'Futoshiki',
            puzzles: [{size, numbers: puzzleGrid, constraints}]
        };
    });
};

export const generateOfflineNumberPyramid = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { worksheetCount } = options;
    const rows = 4;
    return Array.from({ length: worksheetCount }, () => {
        // Generate 2 pyramids per page
        const pyramids = Array.from({length: 2}, () => {
            const base = Array.from({length: rows}, () => getRandomInt(1, 10));
            const pyramid = [base];
            let current = base;
            for(let i=0; i<rows-1; i++) {
                const nextRow = [];
                for(let j=0; j<current.length-1; j++) nextRow.push(current[j] + current[j+1]);
                pyramid.unshift(nextRow);
                current = nextRow;
            }
            return {rows: pyramid.map(row => row.map(v => Math.random() > 0.4 ? v : null))};
        });

        return {
            title: 'Sayı Piramidi', instruction: 'Alttaki iki sayının toplamı üsttekini verir.', pedagogicalNote: 'Toplama işlemi ilişkileri.', imagePrompt: 'Pyramid',
            pyramids
        };
    });
};

export const generateOfflineNumberCapsule = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const grid = Array.from({length: 3}, () => Array.from({length: 3}, () => getRandomInt(1,9)));
        const capsules = [{cells: [{row:0, col:0}, {row:0, col:1}], sum: grid[0][0]! + grid[0][1]!}];
        return {
            title: 'Sayı Kapsülü', instruction: 'Kapsül toplamlarını sağlayacak şekilde sayıları yerleştir.', pedagogicalNote: 'Kombinasyon ve toplama.', imagePrompt: 'Capsule',
            puzzles: [{grid: grid.map(r=>r.map(c=>Math.random()>0.5?c:null)), capsules, numbersToUse: '1-9'}]
        };
    });
};

export const generateOfflineOddEvenSudoku = async (options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const { worksheetCount } = options;
    const size = 6;
    return Array.from({ length: worksheetCount }, () => {
        const grid = generateSudokuGrid(size, 'Orta');
        const shadedCells = [];
        for(let r=0; r<size; r++) for(let c=0; c<size; c++) if(grid[r]![c]! % 2 !== 0) shadedCells.push({row:r, col:c});
        return {
            title: 'Tek-Çift Sudoku', instruction: 'Gölgeli yerlere tek sayılar gelmeli. Her satır ve sütunda rakamlar bir kez kullanılmalı.', pedagogicalNote: 'Kısıtlama mantığı ve tek-çift kavramı.', imagePrompt: 'Sudoku',
            puzzles: [{grid, shadedCells, numbersToUse: '1-6'}]
        };
    });
};

export const generateOfflineRomanNumeralStarHunt = async (options: GeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Yıldız Avı (Romen)', instruction: 'Gizli yıldızları bul.', pedagogicalNote: 'Dikkat ve sembol tanıma.', imagePrompt: 'Star',
        grid: [['I','V'],['X','L'],['C','D']], starCount: 3
    }));
};

export const generateOfflineRomanNumeralMultiplication = async (options: GeneratorOptions): Promise<RomanNumeralMultiplicationData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Romen Çarpımı', instruction: 'Çarpım tablosunu Romen rakamlarıyla doldur.', pedagogicalNote: 'Romen rakamları ve çarpma.', imagePrompt: 'Roman Math',
        puzzles: [{row1:'I', row2:'V', col1:'X', col2:'L', results:{r1c1:'X', r1c2:'L', r2c1:'L', r2c2:'CL'}}]
    }));
};

export const generateOfflineKendoku = async (options: GeneratorOptions): Promise<KendokuData[]> => {
    const { worksheetCount } = options;
    const size = 4;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Kendoku', instruction: 'İşlem kurallarına uyarak tabloyu doldur.', pedagogicalNote: 'İşlem mantığı ve problem çözme.', imagePrompt: 'Kendoku',
        puzzles: [{size, grid: generateSudokuGrid(size, 'Orta'), cages: [{cells:[{row:0,col:0},{row:0,col:1}], operation:'+', target:5}]}]
    }));
};

export const generateOfflineOperationSquareFillIn = async (options: GeneratorOptions): Promise<OperationSquareFillInData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'İşlem Karesi', instruction: 'Boşlukları uygun sayılarla doldur.', pedagogicalNote: 'Eşitlik kavramı.', imagePrompt: 'Math Grid',
        puzzles: [{grid:[['5','+','?','=','8']], numbersToUse:[3], results:[8]}]
    }));
};

export const generateOfflineMultiplicationWheel = async (options: GeneratorOptions): Promise<MultiplicationWheelData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Çarpım Çarkı', instruction: 'Merkezdeki sayıyı dış halkadakilerle çarp.', pedagogicalNote: 'Çarpma pratiği.', imagePrompt: 'Wheel',
        puzzles: [{outerNumbers:[1,2,3,4,5,6,7,8], innerResult: 5}, {outerNumbers:[2,3,4,5,6,7,8,9], innerResult: 3}]
    }));
};

export const generateOfflineTargetNumber = async (options: GeneratorOptions): Promise<TargetNumberData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Hedef Sayı', instruction: 'Verilen sayıları kullanarak hedef sayıya ulaş.', pedagogicalNote: 'İşlem esnekliği.', imagePrompt: 'Target',
        puzzles: [{target: 24, givenNumbers: [4,6,2,8]}, {target: 36, givenNumbers: [9,2,2,1]}]
    }));
};

export const generateOfflineShapeSudoku = async (options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
    const { worksheetCount } = options;
    const size = 4;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Şekilli Sudoku', instruction: 'Şekilleri her satır ve sütunda bir kez olacak şekilde yerleştir.', pedagogicalNote: 'Görsel mantık.', imagePrompt: 'Shape Sudoku',
        puzzles: [{grid: generateLatinSquare(size).map(r=>r.map(c=>c.toString())), shapesToUse: [{shape:'circle', label:'1'}]}]
    }));
};

export const generateOfflineVisualNumberPattern = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Görsel Sayı Örüntüsü', instruction: 'Örüntü kuralını bul.', pedagogicalNote: 'Örüntü tanıma.', imagePrompt: 'Visual Pattern',
        puzzles: [{items:[{number:1, color:'red', size:1}], rule:'+1', answer:2}]
    }));
};

export const generateOfflineLogicGridPuzzle = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Mantık Tablosu', instruction: 'İpuçlarını kullanarak tabloyu doldur.', pedagogicalNote: 'Dedektif mantığı ve çıkarım.', imagePrompt: 'Logic Grid',
        clues: ['Ali kırmızı sever.', 'Ayşe yeşil sever.'], people: ['Ali','Ayşe'], categories: [{title:'Renk', items:[{name:'Kırmızı', imageDescription:'Red', imagePrompt:'Red'}]}]
    }));
};

export const generateOfflineOddOneOut = async (options: GeneratorOptions): Promise<OddOneOutData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Farklı Olanı Bul', instruction: 'Gruptaki farklı olanı işaretle.', pedagogicalNote: 'Sınıflandırma ve kategori bilgisi.', imagePrompt: 'Odd One',
        groups: [{words: ['Elma', 'Armut', 'Masa', 'Muz']}, {words: ['Kedi', 'Köpek', 'Kuş', 'Araba']}]
    }));
};

export const generateOfflineThematicOddOneOut = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Tematik Farklı Bul', instruction: 'Temaya uymayanı bul.', pedagogicalNote: 'Kategori bilgisi.', imagePrompt: 'Theme',
        theme: 'Meyveler', rows: [{words:[{text:'Elma'},{text:'Armut'},{text:'Muz'}], oddWord:'Araba'}], sentencePrompt: 'Neden farklı?'
    }));
};

export const generateOfflineThematicOddOneOutSentence = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Cümle Farkı', instruction: 'Anlamı bozan kelimeyi bul.', pedagogicalNote: 'Anlamsal bütünlük.', imagePrompt: 'Sentence',
        rows: [{words:['Ali','Veli','Koştu'], oddWord:'Masa'}], sentencePrompt: 'Cümle kur.'
    }));
};

export const generateOfflineColumnOddOneOutSentence = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Sütun Farkı', instruction: 'Sütundaki farklı kelimeyi bul.', pedagogicalNote: 'Sınıflandırma.', imagePrompt: 'Column',
        columns: [{words:['Kedi','Köpek','Aslan'], oddWord:'Kalem'}], sentencePrompt: 'Yaz.'
    }));
};

export const generateOfflinePunctuationMaze = async (options: GeneratorOptions): Promise<PunctuationMazeData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Noktalama Labirenti', instruction: 'Doğru noktalama işaretlerini takip ederek çıkışı bul.', pedagogicalNote: 'Dilbilgisi.', imagePrompt: 'Maze',
        punctuationMark: '.', rules: [{id:1, text:'Cümle sonu.', isCorrect:true, isPath:true}]
    }));
};

export const generateOfflinePunctuationPhoneNumber = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Noktalama Telefonu', instruction: 'Şifreyi çöz ve numarayı bul.', pedagogicalNote: 'Kodlama.', imagePrompt: 'Phone',
        clues: [{id:1, text:'Nokta sayısı'}], solution: [{punctuationMark:'.', number:3}]
    }));
};

export const generateOfflineShapeNumberPattern = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Şekilli Örüntü', instruction: 'Şekillerdeki sayı kuralını bul.', pedagogicalNote: 'Örüntü ve şekil ilişkisi.', imagePrompt: 'Shape Pattern',
        patterns: [{shapes: [{type:'triangle', numbers:[1,2,3]}]}]
    }));
};

export const generateOfflineRoundingConnect = async (options: GeneratorOptions): Promise<RoundingConnectData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Yuvarlama Eşleşmesi', instruction: 'Sayıları en yakın onluğa yuvarlayarak eşleştir.', pedagogicalNote: 'Tahmin ve yuvarlama.', imagePrompt: 'Rounding',
        numbers: [{value: 12, group:10, x:0, y:0}, {value: 10, group:10, x:1, y:0}, {value: 28, group:30, x:0, y:1}, {value: 30, group:30, x:1, y:1}]
    }));
};

export const generateOfflineArithmeticConnect = async (options: GeneratorOptions): Promise<ArithmeticConnectData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'İşlem Eşleştirme', instruction: 'Aynı sonucu veren işlemleri eşleştir.', pedagogicalNote: 'İşlem becerisi.', imagePrompt: 'Match Math',
        expressions: [{text:'2+3', value:5, group:5, x:0, y:0}, {text:'4+1', value:5, group:5, x:1, y:0}]
    }));
};

export const generateOfflineRomanArabicMatchConnect = async (options: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Romen-Arap Eşleşmesi', instruction: 'Romen rakamlarını Arap rakamlarıyla eşleştir.', pedagogicalNote: 'Sayı sistemleri.', imagePrompt: 'Roman Arabic',
        gridDim: 1, points: [{label:'I', pairId:1, x:0, y:0}, {label:'1', pairId:1, x:1, y:0}, {label:'V', pairId:5, x:0, y:1}, {label:'5', pairId:5, x:1, y:1}]
    }));
};

export const generateOfflineRomanNumeralConnect = async (options: GeneratorOptions): Promise<RomanNumeralConnectData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Romen Rakamı Bağla', instruction: 'Romen rakamlarını sırasıyla birleştir.', pedagogicalNote: 'Sıralama.', imagePrompt: 'Connect Roman',
        gridDim: 1, puzzles: [{gridDim: 5, points: [{label:'I', x:0, y:0}, {label:'II', x:1, y:0}, {label:'III', x:2, y:0}]}]
    }));
};

export const generateOfflineWeightConnect = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Ağırlık Eşleştirme', instruction: 'Eşit ağırlıkları bul ve eşleştir.', pedagogicalNote: 'Ölçme birimleri.', imagePrompt: 'Weight',
        gridDim: 1, points: [{label:'1kg', pairId:1, x:0, y:0}, {label:'1000g', pairId:1, x:1, y:0}]
    }));
};

export const generateOfflineLengthConnect = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Uzunluk Eşleştirme', instruction: 'Eşit uzunlukları bul ve eşleştir.', pedagogicalNote: 'Ölçme birimleri.', imagePrompt: 'Length',
        gridDim: 1, points: [{label:'1m', pairId:1, x:0, y:0}, {label:'100cm', pairId:1, x:1, y:0}]
    }));
};
