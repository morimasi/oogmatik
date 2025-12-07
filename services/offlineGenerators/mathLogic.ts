
import { GeneratorOptions, MathPuzzleData, NumberCapsuleData, NumberPatternData, NumberPyramidData, OddEvenSudokuData, KendokuData, OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, FutoshikiData, VisualNumberPatternData, LogicGridPuzzleData, RomanNumeralStarHuntData, RomanNumeralConnectData, RomanNumeralMultiplicationData, RoundingConnectData, ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, OddOneOutData, ShapeType, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData, ShapeNumberPatternData, BasicOperationsData, RealLifeProblemData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, EMOJIS, generateSudokuGrid, generateLatinSquare, TR_VOCAB, SHAPE_TYPES, ITEM_CATEGORIES, generateSmartConnectGrid, CONNECT_COLORS, generateMaze, getDifficultySettings, generateMazePath } from './helpers';

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

// BASIC OPERATIONS: Designed with Cognitive Load Theory & Scaffolding
export const generateOfflineBasicOperations = async (options: GeneratorOptions): Promise<BasicOperationsData[]> => {
    const { selectedOperations, operationType, numberRange, allowCarry, allowBorrow, allowRemainder, useThirdNumber, worksheetCount, itemCount } = options;
    const count = itemCount || 20;
    const results: BasicOperationsData[] = [];
    
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
        
        // SCAFFOLDING STRATEGY:
        // First 20% -> Simple (Warm up, reduced range, no carry/borrow)
        // Middle 60% -> Target Level (Standard rules)
        // Last 20% -> Challenge (Upper bound range, maybe carry/borrow if allowed)
        
        while(operationsList.length < count && attempts < 5000) {
            attempts++;
            const idx = operationsList.length;
            
            // Progressive Difficulty Logic
            let currentMin = minVal;
            let currentMax = maxVal;
            let currentAllowCarry = allowCarry;
            let currentAllowBorrow = allowBorrow;

            if (idx < count * 0.2) {
                // Easy Mode (Warm up)
                currentMax = Math.max(10, Math.floor(maxVal * 0.6));
                currentAllowCarry = false;
                currentAllowBorrow = false;
            } else if (idx >= count * 0.8) {
                // Challenge Mode
                currentMin = Math.floor(maxVal * 0.5); // Force larger numbers
            }

            const currentOp = ops[getRandomInt(0, ops.length - 1)];
            
            let num1 = 0, num2 = 0, num3 = 0, answer = 0, remainder = 0;
            let valid = false;

            if (currentOp === '+') {
                const hasThird = useThirdNumber && idx > count * 0.5; // Introduce 3 numbers later
                num1 = getRandomInt(currentMin, currentMax);
                num2 = getRandomInt(1, currentMax);
                if (hasThird) num3 = getRandomInt(1, currentMax);
                
                const isCarry = hasCarry(num1, num2) || (hasThird && (hasCarry(num1+num2, num3)));
                valid = currentAllowCarry ? true : !isCarry;
                if (valid) answer = num1 + num2 + num3;
            } 
            else if (currentOp === '-') {
                num1 = getRandomInt(currentMin, currentMax);
                num2 = getRandomInt(1, num1); // Ensure positive result
                
                const isBorrow = hasBorrow(num1, num2);
                valid = currentAllowBorrow ? true : !isBorrow; 
                if (valid) answer = num1 - num2;
            }
            else if (currentOp === 'x') {
                const m1 = getRandomInt(2, Math.min(12, currentMax)); 
                const m2 = getRandomInt(2, Math.min(12, currentMax));
                num1 = m1; num2 = m2;
                answer = num1 * num2;
                valid = true; 
            }
            else if (currentOp === '÷') {
                const divisor = getRandomInt(2, 9);
                if (allowRemainder && idx > count * 0.8) { // Only remainder in challenge section
                    const dividend = getRandomInt(currentMin, currentMax);
                    num1 = dividend; num2 = divisor;
                    answer = Math.floor(num1 / num2);
                    remainder = num1 % num2;
                    valid = true;
                } else {
                    const quotient = getRandomInt(2, Math.floor(currentMax/divisor));
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
            title: 'İşlem Akıcılığı',
            instruction: 'Isınma sorularıyla başla, zorlaşan sorularla devam et.',
            pedagogicalNote: 'İskele yöntemi (scaffolding) ile kademeli zorlaşan işlem pratiği. Başarı duygusunu pekiştirir.',
            imagePrompt: 'Math operations symbols',
            isVertical: true,
            operations: operationsList
        });
    }
    return results;
};

// REAL LIFE PROBLEMS
export const generateOfflineRealLifeMathProblems = async (options: GeneratorOptions): Promise<RealLifeProblemData[]> => {
    const { worksheetCount, itemCount } = options;
    const results: RealLifeProblemData[] = [];
    const names = ["Ali", "Ayşe", "Can", "Elif", "Mert", "Duru"];
    const items = ["elma", "kalem", "ceviz", "kitap", "bilye"];
    
    const logicTemplates = [
        (n1: number, n2: number, name: string) => ({ text: `${name}'nin ${n1} lirası vardı. Babası ona ${n2} lira daha verdi. ${name}'nin toplam kaç lirası oldu?`, ans: n1 + n2, hint: "Toplama (Birleştirme)", keywords: `Saving money piggy bank` }),
        (n1: number, n2: number, name: string, item: string) => ({ text: `${name} ${n1} tane ${item} topladı. Bunların ${n2} tanesini arkadaşına verdi. Geriye kaç ${item} kaldı?`, ans: n1 - n2, hint: "Çıkarma (Ayırma)", keywords: `Sharing ${item}` }),
        (n1: number, n2: number, name: string, item: string) => ({ text: `Bir kutuda ${n1} paket ${item} var. Her pakette ${n2} tane olduğuna göre toplam kaç ${item} vardır?`, ans: n1 * n2, hint: "Çarpma (Tekrarlı Toplama)", keywords: `Boxes of ${item}` }),
        (n1: number, n2: number, name: string, item: string) => ({ text: `${name}, ${n1} tane ${item}sını ${n2} tabağa eşit olarak paylaştırdı. Her tabakta kaç ${item} olur?`, ans: Math.floor(n1/n2), hint: "Bölme (Paylaştırma)", keywords: `Plates of ${item}` })
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
            const n2 = getRandomInt(2, 5); 
            const validN1 = (j % 4 === 1) ? Math.max(n1, n2 + 5) : (j % 4 === 3 ? n2 * getRandomInt(2,10) : n1);
            
            const problemData = selectedFunc(validN1, n2, name, item);
            problems.push({ 
                text: problemData.text, 
                solution: `${problemData.ans}`, 
                operationHint: "", 
                imagePrompt: problemData.keywords
            });
        }
        results.push({
            title: 'Problem Çözme',
            instruction: 'Problemi oku, anla, planla ve çöz.',
            pedagogicalNote: 'Matematiksel okuryazarlık ve modelleme becerisi.',
            imagePrompt: 'Student Thinking',
            problems
        });
    }
    return results;
};

// MATH PUZZLE: Algebraic Thinking
export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { itemCount, worksheetCount, difficulty } = options;
    const results: MathPuzzleData[] = [];
    const objectsPool = ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓"]; 

    for (let i = 0; i < worksheetCount; i++) {
        const puzzles = Array.from({ length: itemCount || 6 }).map(() => {
            const val = getRandomInt(2, 9);
            const obj = getRandomItems(objectsPool, 1)[0];
            const ans = val + val;
            
            return { 
                problem: `${obj} + ${obj} = ?`, 
                question: `İpucu: ${obj} = ${val}`, 
                answer: ans.toString(),
                objects: [{name: obj, imagePrompt: 'fruit'}]
            };
        });
        results.push({ 
            title: 'Sembollü İşlemler', 
            instruction: "Sembollerin değerini yerine koyarak sonucu bul.", 
            pedagogicalNote: "Cebirsel düşünmeye hazırlık ve sembolik temsil.", 
            imagePrompt: 'Math Symbols', 
            puzzles 
        });
    }
    return results;
};

export const generateOfflineNumberPattern = async (options: GeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Sayı Örüntüleri',
        instruction: 'Kuralı bul ve devam ettir.',
        pedagogicalNote: 'İlişkisel düşünme ve tahmin yürütme.',
        imagePrompt: 'Pattern',
        patterns: Array.from({length: itemCount || 5}, () => {
            const start = getRandomInt(1, 10);
            const step = getRandomInt(2, 5);
            const seq = [start, start+step, start+step*2, start+step*3];
            return { sequence: `${seq.join(', ')}, ?`, answer: (start+step*4).toString() };
        })
    }));
};

// Placeholders for remaining functions
export const generateOfflineFutoshiki = async (o: GeneratorOptions): Promise<FutoshikiData[]> => [];
export const generateOfflineNumberPyramid = async (o: GeneratorOptions): Promise<NumberPyramidData[]> => [];
export const generateOfflineNumberCapsule = async (o: GeneratorOptions): Promise<NumberCapsuleData[]> => [];
export const generateOfflineOddEvenSudoku = async (o: GeneratorOptions): Promise<OddEvenSudokuData[]> => [];
export const generateOfflineRomanNumeralStarHunt = async (o: GeneratorOptions): Promise<RomanNumeralStarHuntData[]> => [];
export const generateOfflineRomanNumeralMultiplication = async (o: GeneratorOptions): Promise<RomanNumeralMultiplicationData[]> => [];
export const generateOfflineKendoku = async (o: GeneratorOptions): Promise<KendokuData[]> => [];
export const generateOfflineOperationSquareFillIn = async (o: GeneratorOptions): Promise<OperationSquareFillInData[]> => [];
export const generateOfflineMultiplicationWheel = async (o: GeneratorOptions): Promise<MultiplicationWheelData[]> => [];
export const generateOfflineTargetNumber = async (o: GeneratorOptions): Promise<TargetNumberData[]> => [];
export const generateOfflineShapeSudoku = async (o: GeneratorOptions): Promise<ShapeSudokuData[]> => [];
export const generateOfflineVisualNumberPattern = async (o: GeneratorOptions): Promise<VisualNumberPatternData[]> => [];
export const generateOfflineLogicGridPuzzle = async (o: GeneratorOptions): Promise<LogicGridPuzzleData[]> => [];
export const generateOfflineOddOneOut = async (o: GeneratorOptions): Promise<OddOneOutData[]> => [];
export const generateOfflineThematicOddOneOut = async (o: GeneratorOptions): Promise<ThematicOddOneOutData[]> => [];
export const generateOfflineThematicOddOneOutSentence = async (o: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => [];
export const generateOfflineColumnOddOneOutSentence = async (o: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => [];
export const generateOfflinePunctuationMaze = async (o: GeneratorOptions): Promise<PunctuationMazeData[]> => [];
export const generateOfflinePunctuationPhoneNumber = async (o: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => [];
export const generateOfflineShapeNumberPattern = async (o: GeneratorOptions): Promise<ShapeNumberPatternData[]> => [];
export const generateOfflineRoundingConnect = async (o: GeneratorOptions): Promise<RoundingConnectData[]> => [];
export const generateOfflineArithmeticConnect = async (o: GeneratorOptions): Promise<ArithmeticConnectData[]> => [];
export const generateOfflineRomanArabicMatchConnect = async (o: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => [];
export const generateOfflineRomanNumeralConnect = async (o: GeneratorOptions): Promise<RomanNumeralConnectData[]> => [];
export const generateOfflineWeightConnect = async (o: GeneratorOptions): Promise<WeightConnectData[]> => [];
export const generateOfflineLengthConnect = async (o: GeneratorOptions): Promise<LengthConnectData[]> => [];
