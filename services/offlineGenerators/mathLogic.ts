
import { GeneratorOptions, MathPuzzleData, NumberCapsuleData, NumberPatternData, NumberPyramidData, OddEvenSudokuData, Sudoku6x6ShadedData, DivisionPyramidData, MultiplicationPyramidData, KendokuData, OperationSquareFillInData, OperationSquareMultDivData, OperationSquareSubtractionData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, FutoshikiData, FutoshikiLengthData, VisualNumberPatternData, LogicGridPuzzleData, RomanNumeralStarHuntData, RomanNumeralConnectData, RomanNumeralMultiplicationData, RoundingConnectData, ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, OddOneOutData, ShapeType, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData, ShapeNumberPatternData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, EMOJIS, generateSudokuGrid, generateLatinSquare, TR_VOCAB, SHAPE_TYPES } from './helpers';

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
        results.push({title: 'Tek-Çift Sudoku', prompt: 'Gri kutulara çift sayı, beyazlara tek sayı gelmelidir.', instruction: "Sudoku kurallarına ek olarak, gri kutulara sadece çift sayı yazabilirsin.", pedagogicalNote: "Kategorizasyon ve mantıksal kısıtlama yönetimi.", puzzles});
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
    const { itemCount, worksheetCount } = options;
    const results: DivisionPyramidData[] = [];
    for(let i=0; i<worksheetCount; i++) {
         const pyramids = Array.from({length: itemCount}).map(() => {
             const top = getRandomInt(2,5) * getRandomInt(2,5) * getRandomInt(2,5) * 10;
             const mid_L = top / getRandomInt(2,5);
             const mid_R = top / mid_L;
             const bot_L = mid_L / getRandomInt(2,3);
             const bot_M = mid_L / bot_L;
             const bot_R = mid_R / bot_M;
             
             if (Number.isInteger(bot_L) && Number.isInteger(bot_M) && Number.isInteger(bot_R)) {
                 return { rows: [[top], [mid_L, null], [bot_L, null, bot_R]] };
             }
             return { rows: [[120], [null, 10], [3, 4, null]] }; // Fallback
         });
         results.push({title: 'Sihirli Piramit (Bölme)', prompt: 'Her sayı, altındaki iki sayının bölümüdür.', pyramids});
    }
    return results;
}

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
     return Array(options.worksheetCount).fill({ title: 'İşlem Karesi (Çıkarma)', prompt: 'Çıkarma işlemleri yaparak işlem karesini tamamlayın.', puzzles: [] });
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
         puzzles: Array.from({length: itemCount}, () => ({target: 24, givenNumbers: [1,2,3,4]})) 
    }));
}
export const generateOfflineOperationSquareMultDiv = async (options: GeneratorOptions): Promise<OperationSquareMultDivData[]> => {
    const res = await generateOfflineOperationSquareSubtraction(options);
    return res.map(r => ({...r, title: 'İşlem Karesi (Çarpma/Bölme)'})) as any;
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
            puzzles: [{grid: shapeGrid, shapesToUse: shapes.map(s => ({shape: s, label: s}))}]
        }
    });
}
export const generateOfflineWeightConnect = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlama (Ağırlık)', prompt: 'Birbirine eşit olan ağırlıkları çizgilerle birleştirin.', gridDim: 6, points: [] });
}
export const generateOfflineFutoshikiLength = async (options: GeneratorOptions): Promise<FutoshikiLengthData[]> => {
     const res = await generateOfflineFutoshiki(options);
     return res.map(r => ({...r, title: 'Futoşiki (Uzunluk)'})) as any;
}
export const generateOfflineLengthConnect = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
     return Array(options.worksheetCount).fill({ title: 'ABC Bağlama (Uzunluk)', prompt: 'Birbirine eşit olan uzunluk ölçülerini birleştirin.', gridDim: 6, points: [] });
}
export const generateOfflineVisualNumberPattern = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
     return Array(options.worksheetCount).fill({ title: 'Görsel Sayı Örüntüsü', prompt: 'Görsel dizideki kuralı bulup eksik sayıyı tamamlayın.', puzzles: [] });
}
export const generateOfflineLogicGridPuzzle = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
     return Array(options.worksheetCount).fill({ 
         title: 'Zekâ Sorusu (Mantık Tablosu)', 
         prompt: 'Verilen ipuçlarını kullanarak mantık tablosunu doldurun.', 
         clues: ['Ali, kırmızı rengi sever.', 'Ayşe, kedisiyle oynar.'], 
         people: ['Ali', 'Ayşe'], 
         categories: [{title: 'Renk', items: [{name: 'Kırmızı'}, {name: 'Mavi'}]}, {title: 'Hayvan', items: [{name: 'Kedi'}, {name: 'Köpek'}]}] 
    });
}

export const generateOfflineOddOneOut = async (options: GeneratorOptions): Promise<OddOneOutData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const results: OddOneOutData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const groups = Array.from({ length: itemCount }).map(() => {
            const mainCatKey = topic && topic !== 'Rastgele' ? topic.toLowerCase() : getRandomItems(['fruits_veggies', 'animals', 'jobs', 'vehicles'], 1)[0];
            const oddCatKey = getRandomItems(['fruits_veggies', 'animals', 'jobs', 'vehicles'].filter(c => c !== mainCatKey), 1)[0];
            
            // FIX: Changed type assertion from Record<string, string[]> to any to handle TR_VOCAB's diverse property types.
            const vocab = TR_VOCAB as any;
            const mainWords = getRandomItems(vocab[mainCatKey] || [], 3);
            const oddWord = getRandomItems(vocab[oddCatKey] || [], 1)[0];
            
            return { words: shuffle([...mainWords, oddWord]) };
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

// FIX: Replaced incorrect type casting with a proper offline implementation for ThematicOddOneOut.
export const generateOfflineThematicOddOneOut = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const results: ThematicOddOneOutData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const rows: { words: string[]; oddWord: string; }[] = [];
        for (let j = 0; j < (itemCount || 5); j++) {
            const mainCatKey = topic && topic !== 'Rastgele' ? topic.toLowerCase() : getRandomItems(['fruits_veggies', 'animals', 'jobs', 'vehicles'], 1)[0];
            const oddCatKey = getRandomItems(['fruits_veggies', 'animals', 'jobs', 'vehicles'].filter(c => c !== mainCatKey), 1)[0];
            
            const vocab = TR_VOCAB as any;
            const mainWords = getRandomItems(vocab[mainCatKey] || [], 3);
            const oddWord = getRandomItems(vocab[oddCatKey] || [], 1)[0];
            
            rows.push({ words: shuffle([...mainWords, oddWord]), oddWord });
        }
        
        results.push({ 
            title: `Tematik Farkı Bul (${topic || 'Rastgele'})`,
            prompt: "Her satırda temaya uymayan kelimeyi bul.",
            theme: topic || 'Genel',
            rows,
            sentencePrompt: 'Farklı kelimelerle birer cümle kur.'
        });
    }
    return results;
};

// FIX: Replaced incorrect type casting with a proper offline implementation for ThematicOddOneOutSentence.
export const generateOfflineThematicOddOneOutSentence = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    const { itemCount, worksheetCount, topic } = options;
    const results: ThematicOddOneOutSentenceData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const rows: { words: string[]; oddWord: string; }[] = [];
        for (let j = 0; j < (itemCount || 5); j++) {
            const mainCatKey = topic && topic !== 'Rastgele' ? topic.toLowerCase() : getRandomItems(['fruits_veggies', 'animals', 'jobs', 'vehicles'], 1)[0];
            const oddCatKey = getRandomItems(['fruits_veggies', 'animals', 'jobs', 'vehicles'].filter(c => c !== mainCatKey), 1)[0];
            
            const vocab = TR_VOCAB as any;
            const mainWords = getRandomItems(vocab[mainCatKey] || [], 3);
            const oddWord = getRandomItems(vocab[oddCatKey] || [], 1)[0];
            
            rows.push({ words: shuffle([...mainWords, oddWord]), oddWord });
        }
        
        results.push({ 
            title: `Tematik Farklı Kelimeyle Cümle Kurma`,
            prompt: "Her satırda temaya uymayan kelimeyi bul ve o kelimeyle bir cümle kur.",
            rows,
            sentencePrompt: 'Farklı kelimelerle kurduğun cümleleri aşağıya yaz.'
        });
    }
    return results;
};

export const generateOfflineColumnOddOneOutSentence = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    const {itemCount, worksheetCount} = options;
    // FIX: Passed the full options object to `generateOfflineOddOneOut` to satisfy the GeneratorOptions type.
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
        patterns: Array.from({length: itemCount}, () => {
            const n1 = getRandomInt(1,10);
            const n2 = getRandomInt(1,10);
            return { shapes: [{ type: 'triangle', numbers: [n1, n2, '?']}, {type: 'triangle', numbers: [n1+1, n2+1, (n1+1)+(n2+1)]}]}
        })
    }))
};
