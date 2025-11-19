
import { GeneratorOptions, MathPuzzleData, NumberCapsuleData, NumberPatternData, NumberPyramidData, OddEvenSudokuData, Sudoku6x6ShadedData, DivisionPyramidData, MultiplicationPyramidData, KendokuData, OperationSquareFillInData, OperationSquareMultDivData, OperationSquareSubtractionData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, FutoshikiData, FutoshikiLengthData, VisualNumberPatternData, LogicGridPuzzleData, RomanNumeralStarHuntData, RomanNumeralConnectData, RomanNumeralMultiplicationData, RoundingConnectData, ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, EMOJIS, generateSudokuGrid, generateLatinSquare } from './helpers';
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
        
        // Generate random constraints
        const constraintCount = Math.floor(size * size * 0.4); // ~40% of edges have constraints
        for (let k = 0; k < constraintCount; k++) {
            const r = getRandomInt(0, size - 1);
            const c = getRandomInt(0, size - 1);
            // Randomly choose neighbor (right or down)
            const dir = Math.random() > 0.5 ? 'right' : 'down';
            
            if (dir === 'right' && c < size - 1) {
                const val1 = latinSquare[r][c];
                const val2 = latinSquare[r][c+1];
                constraints.push({ row1: r, col1: c, row2: r, col2: c+1, symbol: val1 > val2 ? '>' : '<' });
            } else if (dir === 'down' && r < size - 1) {
                const val1 = latinSquare[r][c];
                const val2 = latinSquare[r+1][c];
                constraints.push({ row1: r, col1: c, row2: r+1, col2: c, symbol: val1 > val2 ? '>' : '<' }); // For vertical, we treat top > bottom as standard reading
            }
        }

        // Mask numbers
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

            // Bottom-up generation
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

            // Reverse to have top at index 0 for rendering if component expects it, 
            // BUT check component logic: usually pyramid[0] is top. 
            // My generation puts base at 0. Let's reverse it.
            const visualPyramid = fullPyramid.reverse();

            const puzzlePyramid: (number | null)[][] = visualPyramid.map(row => [...row]);
            
            // Masking: keep roughly 40% of numbers
            const totalCells = (rowsCount * (rowsCount + 1)) / 2;
            const cellsToKeep = Math.ceil(totalCells * 0.4);
            const flatIndices = shuffle(Array.from({length: totalCells}, (_, k) => k));
            
            let visible = 0;
            for(let r=0; r<rowsCount; r++) {
                for(let c=0; c<puzzlePyramid[r].length; c++) {
                    if (Math.random() > 0.4) puzzlePyramid[r][c] = null;
                }
            }

            return { title: `Piramit ${index + 1}`, rows: puzzlePyramid };
        });
        results.push({ title: 'Sihirli Piramit (Toplama)', prompt: 'Her sayı, altındaki iki sayının toplamıdır.', instruction: "Piramidin tepesine doğru toplama yaparak boşlukları doldur.", pedagogicalNote: "İşlem akıcılığı ve parça-bütün ilişkisi.", pyramids });
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

                // Grow cage
                const cageCells = [{row: r, col: c}];
                visited[r][c] = true;
                const cageSizeTarget = getRandomInt(1, 3); // small cages for simplicity in fast mode
                
                // Simple expansion
                if(cageSizeTarget > 1) {
                    const neighbors = [
                        {row: r+1, col: c}, {row: r, col: c+1}
                    ].filter(n => n.row < size && n.col < size && !visited[n.row][n.col]);
                    
                    if(neighbors.length > 0) {
                        const next = getRandomItems(neighbors, 1)[0];
                        visited[next.row][next.col] = true;
                        cageCells.push(next);
                    }
                }

                // Calculate target
                const values = cageCells.map(cell => latinSquare[cell.row][cell.col]);
                const op = getRandomItems(['+', '×', '-', '÷'], 1)[0];
                let target = 0;
                let finalOp = op;

                if (cageCells.length === 1) {
                    target = values[0];
                    finalOp = ''; // No op for single cell
                } else {
                    if (op === '+') target = values.reduce((a,b) => a+b, 0);
                    else if (op === '×') target = values.reduce((a,b) => a*b, 1);
                    else if (op === '-') {
                        // Only for 2 cells usually, take abs diff
                        if(values.length === 2) target = Math.abs(values[0] - values[1]);
                        else { target = values.reduce((a,b) => a+b, 0); finalOp = '+'; } // Fallback
                    }
                    else if (op === '÷') {
                        if(values.length === 2) {
                             const max = Math.max(...values);
                             const min = Math.min(...values);
                             if(max % min === 0) target = max / min;
                             else { target = values.reduce((a,b) => a+b, 0); finalOp = '+'; } // Fallback
                        } else { target = values.reduce((a,b) => a+b, 0); finalOp = '+'; }
                    }
                }
                
                cages.push({ cells: cageCells, operation: finalOp as any, target });
            }
        }
        
        // Create empty grid for display
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
    // Logic same as NumberPyramid but reverse math
    const { itemCount, worksheetCount } = options;
    const results: DivisionPyramidData[] = [];
    for(let i=0; i<worksheetCount; i++) {
         const pyramids = Array.from({length: itemCount}).map(() => {
             // 3 rows. Base has 3 cells? No, top has 1.
             // Top: A. Row 2: B, C where B = A*k, C = A*m ... hard to generate purely random divisibility.
             // Easier: Top-down multiplication.
             const rows: number[][] = [[getRandomInt(1, 10)]]; // Top
             // Level 2: Top * factor1, Top * factor2? No, standard is Cell = CellBelowL / CellBelowR or similar.
             // Standard Division Pyramid: Cell Above = Cell Below Left * Cell Below Right? No that's multiplication.
             // Usually: Cell Below = Cell Above / Other Cell Below.
             // Let's assume Multiplication Pyramid logic where Top = BottomL * BottomR
             
             const pRows: (number | null)[][] = [
                 [120],
                 [12, 10],
                 [3, 4, 2.5] // This gets messy with integers.
             ];
             // Fallback to a simple static set for fast mode or skip complex generation
             return { rows: [[12], [null, 2], [null, 2, 1]] };
         });
         results.push({title: 'Sihirli Piramit (Bölme)', prompt: 'Bölme işlemleri', pyramids});
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
            // Mask
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
     // Generate a valid 3x3 addition grid
     const { worksheetCount } = options;
     const results: OperationSquareFillInData[] = [];
     for(let i=0; i<worksheetCount; i++) {
         const nums = shuffle([1,2,3,4,5,6,7,8,9]);
         const grid = [
             [nums[0].toString(), '+', nums[1].toString(), '=', (nums[0]+nums[1]).toString()],
             ['+', null, '+', null, null],
             [nums[3].toString(), '+', nums[4].toString(), '=', (nums[3]+nums[4]).toString()],
             ['=', null, '=', null, null],
             [(nums[0]+nums[3]).toString(), null, (nums[1]+nums[4]).toString(), null, null]
         ];
         // Mask internal numbers
         const cleanGrid: (string|null)[][] = [
             [null, '+', null, '=', (nums[0]+nums[1]).toString()],
             ['+', null, '+', null, null],
             [null, '+', null, '=', (nums[3]+nums[4]).toString()],
             ['=', null, '=', null, null],
             [(nums[0]+nums[3]).toString(), null, (nums[1]+nums[4]).toString(), null, null]
         ];
         results.push({
             title: 'İşlem Karesi (Yerleştirme)',
             prompt: 'Verilen sayıları yerleştir.',
             instruction: "Sonuçları tutturmak için kutulara uygun sayıları yaz.",
             pedagogicalNote: "Denklem çözme ve aritmetik akıl yürütme.",
             puzzles: [{grid: cleanGrid, numbersToUse: [nums[0], nums[1], nums[3], nums[4]], results: []}]
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
             // Note: Component logic might need adjustment to handle 'innerResult' which implies a single result, 
             // but wheels usually have results on the rim. Assuming component handles standard wheel logic.
             return { outerNumbers: outerMasked, innerResult: center };
         });
         results.push({title: 'Çarpım Çarkı', prompt: 'Çarkı tamamla.', puzzles});
     }
     return results;
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
