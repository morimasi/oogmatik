
import { GeneratorOptions, MathPuzzleData, NumberPatternData, NumberPyramidData, ShapeSudokuData, FutoshikiData, LogicGridPuzzleData, BasicOperationsData, RealLifeProblemData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, EMOJIS, generateSudokuGrid, generateLatinSquare, SHAPE_TYPES, getDifficultySettings } from './helpers';

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

export const generateOfflineBasicOperations = async (options: GeneratorOptions): Promise<BasicOperationsData[]> => {
    const { selectedOperations, num1Digits, num2Digits, allowCarry, allowBorrow, allowRemainder, useThirdNumber, worksheetCount, itemCount } = options;
    
    const count = itemCount || 12;
    const results: BasicOperationsData[] = [];
    const d1 = num1Digits || 2;
    const d2 = num2Digits || 1;
    const ops = (selectedOperations && selectedOperations.length > 0) ? selectedOperations : ['addition'];

    for(let i=0; i<worksheetCount; i++) {
        const operationsList: BasicOperationsData['operations'] = [];
        let attempts = 0;
        let opIndex = 0;

        while(operationsList.length < count && attempts < 2000) {
            attempts++;
            const currentOp = ops[opIndex % ops.length];
            
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
                    const min3 = Math.pow(10, Math.max(1, d2 - 1));
                    const max3 = Math.pow(10, d2) - 1;
                    num3 = getRandomInt(min3, max3);
                }
                const isCarry = hasCarry(num1, num2) || (hasThird && (hasCarry(num1+num2, num3)));
                valid = allowCarry ? true : !isCarry;
                if (valid) answer = num1 + num2 + num3;
            } 
            else if (currentOp === 'subtraction') {
                operator = '-';
                num1 = getRandomInt(min1, max1);
                num2 = getRandomInt(min2, max2);
                if (num2 >= num1) {
                    if (d1 === d2) {
                        if(num2 > num1) [num1, num2] = [num2, num1];
                        else if(num1 === num2) num1 += 1;
                    } else {
                        num2 = getRandomInt(min2, Math.min(max2, num1 - 1));
                    }
                }
                const isBorrow = hasBorrow(num1, num2);
                valid = allowBorrow ? true : !isBorrow; 
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
                num2 = getRandomInt(min2, max2);
                if (num2 === 0) num2 = 1; 

                if (allowRemainder) {
                    num1 = getRandomInt(min1, max1);
                    answer = Math.floor(num1 / num2);
                    remainder = num1 % num2;
                    valid = remainder > 0;
                } else {
                    const minQuotient = Math.ceil(min1 / num2);
                    const maxQuotient = Math.floor(max1 / num2);
                    if (maxQuotient >= minQuotient) {
                        answer = getRandomInt(minQuotient, maxQuotient);
                        num1 = answer * num2;
                        remainder = 0;
                        valid = true;
                    } else {
                        valid = false; 
                    }
                }
            }

            if (valid) {
                operationsList.push({ 
                    num1, num2, num3: num3 > 0 ? num3 : undefined, operator, answer, remainder: remainder > 0 ? remainder : undefined 
                });
                opIndex++;
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
    
    const names = ["Ali", "Ayşe", "Mehmet", "Zeynep", "Can", "Elif", "Mert", "Duru"];
    const items = ["elma", "kalem", "ceviz", "kitap", "bilye", "lira", "şeker", "kurabiye"];
    
    const getTemplate = (op: string, diff: string) => {
        const templates = [];
        if (op === 'addition' || op === 'mixed') {
            templates.push(
                (n1: number, n2: number, name: string, item: string) => ({ text: `${name}'nin ${n1} tane ${item}sı vardı. Arkadaşı ona ${n2} tane daha verdi. ${name}'nin toplam kaç ${item}sı oldu?`, ans: n1 + n2, hint: "Toplama" }),
                (n1: number, n2: number, name: string, item: string) => ({ text: `Bir manav sabah ${n1} kilo, öğleden sonra ${n2} kilo ${item} sattı. Manav toplam kaç kilo ${item} satmıştır?`, ans: n1 + n2, hint: "Toplama" })
            );
        }
        if (op === 'subtraction' || op === 'mixed') {
            templates.push(
                (n1: number, n2: number, name: string, item: string) => ({ text: `${name} ${n1} sayfalık kitabın ${n2} sayfasını okudu. Geriye okuması gereken kaç sayfa kaldı?`, ans: n1 - n2, hint: "Çıkarma" }),
                (n1: number, n2: number, name: string, item: string) => ({ text: `Otobüste ${n1} yolcu vardı. Durakta ${n2} yolcu indi. Otobüste kaç yolcu kaldı?`, ans: n1 - n2, hint: "Çıkarma" })
            );
        }
        if (op === 'multiplication' || op === 'mixed') {
            templates.push(
                (n1: number, n2: number, name: string, item: string) => ({ text: `Her birinde ${n2} tane ${item} olan ${n1} kutu var. Toplam kaç ${item} vardır?`, ans: n1 * n2, hint: "Çarpma" }),
                (n1: number, n2: number, name: string, item: string) => ({ text: `Bir apartmanda ${n1} kat, her katta ${n2} pencere var. Bu apartmanda toplam kaç pencere vardır?`, ans: n1 * n2, hint: "Çarpma" })
            );
        }
        if (op === 'division' || op === 'mixed') {
            templates.push(
                (n1: number, n2: number, name: string, item: string) => ({ text: `${name}, ${n1} tane ${item}sını ${n2} arkadaşına eşit olarak paylaştırdı. Her arkadaşına kaç ${item} düşer?`, ans: n1 / n2, hint: "Bölme" }),
                (n1: number, n2: number, name: string, item: string) => ({ text: `${n1} litre süt, ${n2} litrelik şişelere dolduruluyor. Kaç şişe gerekir?`, ans: n1 / n2, hint: "Bölme" })
            );
        }
        return templates;
    };

    for(let i=0; i<worksheetCount; i++) {
        const problems: RealLifeProblemData['problems'] = [];
        const count = itemCount || 4;
        const effectiveOp = (!operationType || operationType === 'mixed') ? 'mixed' : operationType;

        for(let j=0; j<count; j++) {
            let currentOp = effectiveOp;
            if (effectiveOp === 'mixed') {
                currentOp = ['addition', 'subtraction', 'multiplication', 'division'][j % 4];
            }

            const templateFuncs = getTemplate(currentOp, difficulty || 'Orta');
            const selectedFunc = getRandomItems(templateFuncs, 1)[0];
            
            const name = getRandomItems(names, 1)[0];
            const item = getRandomItems(items, 1)[0];
            
            let n1 = 0, n2 = 0;
            if (currentOp === 'addition') { n1 = getRandomInt(10, 100); n2 = getRandomInt(5, 50); }
            else if (currentOp === 'subtraction') { n1 = getRandomInt(20, 100); n2 = getRandomInt(5, n1-5); }
            else if (currentOp === 'multiplication') { n1 = getRandomInt(2, 10); n2 = getRandomInt(2, 10); }
            else if (currentOp === 'division') { n2 = getRandomInt(2, 9); const mult = getRandomInt(2, 12); n1 = n2 * mult; }

            const problemData = selectedFunc(n1, n2, name, item);

            problems.push({
                text: problemData.text,
                solution: `${problemData.ans}`,
                operationHint: problemData.hint,
                imagePrompt: '' 
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
