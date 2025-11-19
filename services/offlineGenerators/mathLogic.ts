import { GeneratorOptions, MathPuzzleData, NumberCapsuleData, NumberPatternData, NumberPyramidData, OddEvenSudokuData, Sudoku6x6ShadedData, DivisionPyramidData, MultiplicationPyramidData, KendokuData, OperationSquareFillInData, OperationSquareMultDivData, OperationSquareSubtractionData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, FutoshikiData, FutoshikiLengthData, VisualNumberPatternData, LogicGridPuzzleData, RomanNumeralStarHuntData, RomanNumeralConnectData, RomanNumeralMultiplicationData, RoundingConnectData, ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, EMOJIS, generateSudokuGrid } from './helpers';
import { PROVERBS } from '../../data/sentences';

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
            else if (op === '/') { if (val2 === 0) val2 = 1; const product = val1 * val2; problemStr = `❓ ${op} ${currentObjects[idx2]} = ${currentObjects[idx1]}`; question = `Eğer ${currentObjects[idx2]}=${val2} ve ${currentObjects[idx1]}=${val1} ise ❓ kaçtır?`; answer = product; }
            return { problem: problemStr, question, answer: answer.toString() };
        });
        results.push({ title: `Matematik Bulmacası (${difficulty})`, puzzles });
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
        results.push({ title: 'Sayı Örüntüsü', patterns });
    }
    return results;
};


export const generateOfflineFutoshiki = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Futoşiki', prompt: 'Büyüktür/küçüktür sembollerine göre sayıları yerleştirin.', puzzles: [] });
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
                const newRow = [];
                for (let c = 0; c < prevRow.length - 1; c++) {
                    newRow.push(prevRow[c] + prevRow[c + 1]);
                }
                fullPyramid.push(newRow);
            }

            const puzzlePyramid: (number | null)[][] = fullPyramid.map(row => [...row]);
            let emptyCount = 3 + (difficulty === 'Orta' ? 2 : difficulty === 'Zor' ? 4 : difficulty === 'Uzman' ? 6 : 0);
            
            for (let k = 0; k < emptyCount; k++) {
                const r = getRandomInt(0, puzzlePyramid.length - 1);
                if(puzzlePyramid[r]?.length > 0) {
                   const c = getRandomInt(0, puzzlePyramid[r].length - 1);
                   if (puzzlePyramid.flat().filter(cell => cell !== null).length > 2) {
                       puzzlePyramid[r][c] = null;
                   }
                }
            }
            return { title: `Piramit ${index + 1}`, rows: puzzlePyramid.reverse() };
        });
        results.push({ title: 'Sihirli Piramit (Toplama)', prompt: 'Her sayı, altındaki iki sayının toplamıdır. Boşlukları doldurun.', pyramids });
    }
    return results;
}
export const generateOfflineNumberCapsule = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kapsül Oyunu', prompt: 'Tek ve çift sayılarla toplama yaparak kapsülleri doldurun.', puzzles: [] });
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
        results.push({title: 'Tek-Çift Sudoku', prompt: 'Gri kutulara çift sayı, beyazlara tek sayı gelmelidir.', puzzles});
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
export const generateOfflineRomanNumeralConnect = async (options: GeneratorOptions): Promise<RomanNumeralConnectData[]> => {
    return Array(options.worksheetCount).fill({ title: 'ABC Bağlama (Romen Rakamlı)', prompt: 'Aynı Romen rakamlarını yolları kesişmeyecek şekilde birleştirin.', puzzles: [] });
}
export const generateOfflineRomanNumeralStarHunt = async (options: GeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Yıldız Avı (Romen Rakamlı)', prompt: 'Romen rakamlarını ipucu olarak kullanarak yıldızları bulun.', grid: [[]], starCount: 0 });
}
export const generateOfflineRoundingConnect = async (options: GeneratorOptions): Promise<RoundingConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlamaca (Yuvarlama)', prompt: 'Aynı değere yuvarlanan sayıları birbirine bağlayın.', example: '', numbers: [] });
}
export const generateOfflineRomanNumeralMultiplication = async (options: GeneratorOptions): Promise<RomanNumeralMultiplicationData[]> => {
     return Array(options.worksheetCount).fill({ title: 'İşlem Karesi (Romen Rakamlı)', prompt: 'Çarpma işlemi yaparak işlem karesindeki boşlukları doldurun.', puzzles: [] });
}
export const generateOfflineArithmeticConnect = async (options: GeneratorOptions): Promise<ArithmeticConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlamaca (İşlemler)', prompt: 'Aynı sonucu veren işlemleri birbirine bağlayın.', example: '', expressions: [] });
}
export const generateOfflineRomanArabicMatchConnect = async (options: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlama (Romen Rakamı)', prompt: 'Romen rakamlarını normal sayılarla eşleştirin.', gridDim: 6, points: [] });
}
export const generateOfflineKendoku = async (options: GeneratorOptions): Promise<KendokuData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Kendoku', prompt: 'İşlem ipuçlarını kullanarak mantık bulmacasını çözün.', puzzles: [] });
}
export const generateOfflineDivisionPyramid = async (options: GeneratorOptions): Promise<DivisionPyramidData[]> => {
    const res = await generateOfflineNumberPyramid(options);
    return res.map(p => ({
        title: 'Sihirli Piramit (Bölme)',
        prompt: 'Her sayı, üstündeki iki sayının bölümüdür. Boşlukları doldurun.',
        pyramids: p.pyramids.map(py => ({rows: py.rows}))
    }))
}
export const generateOfflineMultiplicationPyramid = async (options: GeneratorOptions): Promise<MultiplicationPyramidData[]> => {
    const res = await generateOfflineNumberPyramid(options);
    return res.map(p => ({
        title: 'Sihirli Piramit (Çarpma)',
        prompt: 'Her sayı, altındaki iki sayının çarpımıdır. Boşlukları doldurun.',
        pyramids: p.pyramids.map(py => ({rows: py.rows}))
    }))
}
export const generateOfflineOperationSquareSubtraction = async (options: GeneratorOptions): Promise<OperationSquareSubtractionData[]> => {
     return Array(options.worksheetCount).fill({ title: 'İşlem Karesi (Çıkarma)', prompt: 'Çıkarma işlemleri yaparak işlem karesini tamamlayın.', puzzles: [] });
}
export const generateOfflineOperationSquareFillIn = async (options: GeneratorOptions): Promise<OperationSquareFillInData[]> => {
     return Array(options.worksheetCount).fill({ title: 'İşlem Karesi (Yerleştirme)', prompt: 'Verilen sayıları işlem karesine doğru şekilde yerleştirin.', puzzles: [] });
}
export const generateOfflineMultiplicationWheel = async (options: GeneratorOptions): Promise<MultiplicationWheelData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Çarpım Çarkı', prompt: 'Sayıları yerleştirerek çarpım çarkını tamamlayın.', puzzles: [] });
}
export const generateOfflineTargetNumber = async (options: GeneratorOptions): Promise<TargetNumberData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Hedef Sayı', prompt: 'Verilen sayılarla dört işlem yaparak hedef sayıya ulaşın.', puzzles: [] });
}
export const generateOfflineOperationSquareMultDiv = async (options: GeneratorOptions): Promise<OperationSquareMultDivData[]> => {
     return Array(options.worksheetCount).fill({ title: 'İşlem Karesi (Çarpma/Bölme)', prompt: 'Çarpma ve bölme işlemleri yaparak işlem karesini tamamlayın.', puzzles: [] });
}
export const generateOfflineShapeSudoku = async (options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Şekilli Sudoku', prompt: 'Her satır, sütun ve bölgede şekilleri tekrar etmeden yerleştirin.', puzzles: [] });
}
export const generateOfflineWeightConnect = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlama (Ağırlık)', prompt: 'Birbirine eşit olan ağırlıkları çizgilerle birleştirin.', gridDim: 6, points: [] });
}

export const generateOfflineFutoshikiLength = async (options: GeneratorOptions): Promise<FutoshikiLengthData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Futoşiki (Uzunluk)', prompt: 'Uzunluk ölçü birimlerini büyüktür/küçüktür işaretlerine göre yerleştirin.', puzzles: [] });
}

export const generateOfflineLengthConnect = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlama (Uzunluk)', prompt: 'Birbirine eşit olan uzunluk ölçülerini birleştirin.', gridDim: 6, points: [] });
}
export const generateOfflineVisualNumberPattern = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Görsel Sayı Örüntüsü', prompt: 'Görsel dizideki kuralı bulup eksik sayıyı tamamlayın.', puzzles: [] });
}
export const generateOfflineLogicGridPuzzle = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Zekâ Sorusu (Mantık Tablosu)', prompt: 'Verilen ipuçlarını kullanarak mantık tablosunu doldurun.', clues: [], people: [], categories: [] });
}
