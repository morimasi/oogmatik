
import { GeneratorOptions, NumberPatternData, NumberPyramidData, OddEvenSudokuData, KendokuData, BasicOperationsData, MoneyCountingData, MathMemoryCardsData, ClockReadingData, RealLifeProblemData, MathPuzzleData, NumberLogicRiddleData } from '../../types';
import { shuffle, getRandomInt, getRandomItems, turkishAlphabet, generateSudokuGrid, generateLatinSquare, TR_VOCAB } from './helpers';

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
        if (parseInt(s1[i] || '0') < parseInt(s2[i] || '0')) return true;
    }
    return false;
};

// BASIC OPERATIONS (Offline Enhanced)
export const generateOfflineBasicOperations = async (options: GeneratorOptions): Promise<BasicOperationsData[]> => {
    const { selectedOperations, allowCarry, allowBorrow, allowRemainder, useThirdNumber, worksheetCount, itemCount, num1Digits = 2, num2Digits = 1 } = options;
    const results: BasicOperationsData[] = [];
    
    const count = itemCount || 25;
    const ops = (selectedOperations && selectedOperations.length > 0) ? selectedOperations : ['add', 'sub'];

    for(let i=0; i<worksheetCount; i++) {
        const operationsList: any[] = [];
        let attempts = 0;
        
        while(operationsList.length < count && attempts < 1000) {
            attempts++;
            const opType = ops[getRandomInt(0, ops.length - 1)];
            let n1 = getRandomInt(Math.pow(10, num1Digits-1), Math.pow(10, num1Digits)-1);
            let n2 = getRandomInt(Math.pow(10, num2Digits-1), Math.pow(10, num2Digits)-1);
            let n3 = useThirdNumber ? getRandomInt(1, Math.pow(10, num2Digits)-1) : undefined;
            
            let symbol = '+';
            let valid = false;
            let ans = 0;

            if (opType === 'add') {
                symbol = '+';
                const isCarry = hasCarry(n1, n2) || (n3 !== undefined && hasCarry(n1 + n2, n3));
                if (allowCarry || !isCarry) {
                    ans = n1 + n2 + (n3 || 0);
                    valid = true;
                }
            } else if (opType === 'sub') {
                symbol = '-';
                if (n1 < n2) [n1, n2] = [n2, n1];
                const isBorrow = hasBorrow(n1, n2);
                if (allowBorrow || !isBorrow) {
                    ans = n1 - n2;
                    valid = true;
                }
            } else if (opType === 'mult') {
                symbol = 'x';
                ans = n1 * n2;
                valid = true;
            } else if (opType === 'div') {
                symbol = '÷';
                if (n2 === 0) n2 = 1;
                if (!allowRemainder) {
                    n1 = n2 * getRandomInt(1, 10);
                    ans = n1 / n2;
                } else {
                    ans = Math.floor(n1 / n2);
                }
                valid = true;
            }

            if (valid) operationsList.push({ num1: n1, num2: n2, num3: n3, operator: symbol, answer: ans });
        }

        results.push({
            title: 'Dört İşlem Alıştırması',
            instruction: 'Aşağıdaki işlemleri dikkatlice yapınız.',
            pedagogicalNote: 'İşlem akıcılığı ve sayısal odaklanma.',
            operations: operationsList
        });
    }
    return results;
};

// MATH PUZZLE (Offline)
export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { worksheetCount, itemCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: itemCount || 6 }, () => {
            const n1 = getRandomInt(1, 10);
            const n2 = getRandomInt(1, 10);
            return {
                problem: `${n1} + ${n2} = ?`,
                question: "Soru işareti yerine hangi sayı gelmelidir?",
                answer: (n1 + n2).toString(),
                objects: [
                    { name: "Elma", imagePrompt: "apple" },
                    { name: "Armut", imagePrompt: "pear" }
                ]
            };
        });
        return {
            title: "Matematik Bulmacaları",
            instruction: "Görsellerin temsil ettiği sayıları bularak işlemleri tamamla.",
            pedagogicalNote: "Sembolik düşünme ve temel aritmetik.",
            puzzles
        };
    });
};

// NUMBER PATTERN (Offline)
export const generateOfflineNumberPattern = async (options: GeneratorOptions): Promise<NumberPatternData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const patterns = Array.from({ length: itemCount || 8 }, () => {
            const start = getRandomInt(1, 20);
            const step = difficulty === 'Başlangıç' ? getRandomInt(1, 3) : getRandomInt(2, 5);
            const seq = [start, start + step, start + 2 * step, start + 3 * step];
            return {
                sequence: `${seq.join(', ')}, ?`,
                answer: (start + 4 * step).toString()
            };
        });
        return {
            title: "Sayı Örüntüleri",
            instruction: "Sayılar arasındaki kuralı keşfet ve boşluğu doldur.",
            pedagogicalNote: "Sıralı düşünme ve kural bulma.",
            patterns
        };
    });
};

// NUMBER LOGIC RIDDLES (Professional Multi-Page Offline)
export const generateOfflineNumberLogicRiddles = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { worksheetCount, numberRange, difficulty, codeLength, useThirdNumber, itemCount } = options;
    
    // Total puzzles to generate
    const totalCount = itemCount || (worksheetCount * 4);
    const puzzlesPerPage = 4;
    const [minRange, maxRange] = (numberRange || '1-50').split('-').map(Number);
    const pages: NumberLogicRiddleData[] = [];

    let currentPuzzleCount = 0;
    while (currentPuzzleCount < totalCount) {
        const puzzles = [];
        let runningTotal = 0;
        
        // Puzzles for this specific page
        for (let i = 0; i < puzzlesPerPage && currentPuzzleCount < totalCount; i++) {
            const n = getRandomInt(minRange, maxRange);
            const hints = [];
            
            // Generate Hints based on difficulty
            if (n % 2 === 0) hints.push("Ben bir çift sayıyım.");
            else hints.push("Ben bir tek sayıyım.");

            if (n > (maxRange / 2)) hints.push(`${Math.floor(maxRange/2)}'den büyüğüm.`);
            else hints.push(`${Math.floor(maxRange/2)}'den küçüğüm.`);

            if (difficulty === 'Zor' || difficulty === 'Uzman') {
                const sumDigits = n.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
                hints.push(`Rakamlarım toplamı ${sumDigits}'dir.`);
                if (n % 5 === 0) hints.push("5 ile kalansız bölünürüm.");
            } else if (difficulty === 'Orta') {
                hints.push(`${n-getRandomInt(1,5)} ile ${n+getRandomInt(1,5)} arasındayım.`);
            }

            // Create 5 boxes for the visual grid
            const boxes = Array.from({ length: 5 }, () => {
                return [getRandomInt(minRange, maxRange), getRandomInt(minRange, maxRange)];
            });
            // Ensure correct answer is in one random box
            boxes[getRandomInt(0, 4)][0] = n;

            // Multiple choice options
            const distractors = new Set<number>();
            while(distractors.size < 3) {
                const d = getRandomInt(minRange, maxRange);
                if (d !== n) distractors.add(d);
            }
            const allOptions = shuffle([n.toString(), ...Array.from(distractors).map(d => d.toString())]);
            const correctLetter = ['A', 'B', 'C', 'D'][allOptions.indexOf(n.toString())];

            puzzles.push({
                riddle: hints.slice(0, codeLength || 3).join(' '),
                boxes,
                options: allOptions,
                answer: `${correctLetter} - ${n}`,
                answerValue: n
            });
            
            runningTotal += n;
            currentPuzzleCount++;
        }

        pages.push({
            title: "Sayısal Mantık Bilmeceleri",
            instruction: "Bilmeceleri çöz, doğru şıkkı bul ve tüm cevapların toplamıyla büyük hedefe ulaş!",
            pedagogicalNote: "Çalışma belleği, sayı hissi ve mantıksal çıkarım becerilerini geliştirir.",
            sumTarget: runningTotal,
            sumMessage: useThirdNumber 
                ? `Bu sayfadaki bilmecelerin doğru cevaplarını topladığında sonuç ${runningTotal} olmalıdır.`
                : "Bilmeceleri çözerek sayıların gizemli dünyasını keşfet.",
            puzzles
        });
    }

    return pages;
};

// NUMBER PYRAMID (Enhanced)
export const generateOfflineNumberPyramid = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { pyramidType = 'add', worksheetCount, difficulty } = options;
    const results: NumberPyramidData[] = [];
    const rowsCount = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 4 : 5);

    for (let i = 0; i < worksheetCount; i++) {
        const pyramids = Array.from({length: 2}, () => {
            const base = Array.from({length: rowsCount}, () => getRandomInt(1, pyramidType === 'mult' ? 5 : 15));
            const fullPyramid = [base];
            let current = base;
            for(let r=0; r<rowsCount-1; r++) {
                const nextRow = [];
                for(let c=0; c<current.length-1; c++) {
                    if (pyramidType === 'add') nextRow.push(current[c] + current[c+1]);
                    else if (pyramidType === 'sub') nextRow.push(Math.abs(current[c] - current[c+1]));
                    else nextRow.push(current[c] * current[c+1]);
                }
                fullPyramid.unshift(nextRow);
                current = nextRow;
            }
            // Hide some cells
            const grid = fullPyramid.map(row => row.map(val => Math.random() > 0.4 ? val : null));
            return { rows: grid };
        });
        results.push({ title: 'Sayı Piramidi', instruction: 'Alttaki iki sayının ilişkisini kurarak piramidi tamamla.', pyramids });
    }
    return results;
};

// SUDOKU (Using proper Latin Square logic from helpers)
export const generateOfflineOddEvenSudoku = async (options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const { gridSize = 6, difficulty, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const grid = generateSudokuGrid(gridSize, difficulty);
        const shadedCells: {row:number, col:number}[] = [];
        for(let r=0; r<gridSize; r++) {
            for(let c=0; c<gridSize; c++) {
                if (grid[r][c] !== null && grid[r][c]! % 2 === 0) shadedCells.push({row:r, col:c});
            }
        }
        return {
            title: 'Tek-Çift Sudoku',
            instruction: 'Gölgeli hücrelere çift, beyaz hücrelere tek sayılar gelmelidir.',
            puzzles: [{ grid, shadedCells, numbersToUse: `1-${gridSize}` }]
        };
    });
};

// KENDOKU (Basic algorithm)
export const generateOfflineKendoku = async (options: GeneratorOptions): Promise<KendokuData[]> => {
    const { gridSize = 4, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const size = gridSize;
        const grid = generateLatinSquare(size);
        const cages = [];
        for(let c=0; c<size; c++) {
            for(let r=0; r<size; r+=2) {
                if(r+1 < size) {
                    const v1 = grid[r][c];
                    const v2 = grid[r+1][c];
                    cages.push({
                        cells: [{row:r, col:c}, {row:r+1, col:c}],
                        operation: '+',
                        target: v1 + v2
                    });
                } else {
                    cages.push({ cells: [{row:r, col:c}], target: grid[r][c] });
                }
            }
        }
        return {
            title: 'Kendoku',
            instruction: 'Kutucuklardaki işlemleri yaparak tabloyu doldur.',
            puzzles: [{ size, grid: grid.map(row => row.map(() => null)), cages }]
        };
    });
};

// CLOCK READING
export const generateOfflineClockReading = async (options: GeneratorOptions): Promise<ClockReadingData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const clocks = Array.from({ length: itemCount || 8 }, () => {
            let hour = getRandomInt(1, 12);
            let minute = 0;
            if (difficulty === 'Orta') minute = getRandomItems([0, 15, 30, 45], 1)[0];
            else if (difficulty === 'Zor' || difficulty === 'Uzman') minute = getRandomInt(0, 59);
            
            const displayHour = hour.toString().padStart(2, '0');
            const displayMin = minute.toString().padStart(2, '0');
            
            return {
                hour, minute,
                displayType: 'analog' as const,
                question: 'Saati oku.',
                correctAnswer: `${displayHour}:${displayMin}`
            };
        });
        return {
            title: 'Saat Okuma Alıştırması',
            instruction: 'Analog saatlerin gösterdiği zamanı altına yazın.',
            pedagogicalNote: 'Zaman kavramı ve analog/dijital dönüşümü.',
            clocks
        };
    });
};

// MONEY COUNTING
export const generateOfflineMoneyCounting = async (options: GeneratorOptions): Promise<MoneyCountingData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: itemCount || 4 }, () => {
            const coins = [{ value: 1, count: getRandomInt(1, 5) }];
            const notes = difficulty !== 'Başlangıç' ? [{ value: 5, count: getRandomInt(1, 2) }] : [];
            const total = coins.reduce((a,b) => a + (b.value * b.count), 0) + notes.reduce((a,b) => a + (b.value * b.count), 0);
            
            return {
                totalAmount: total,
                coins,
                notes,
                question: 'Toplam para miktarını bulun.',
                options: shuffle([total, total + 1, total - 1, total + 5]),
                correctAnswer: total
            };
        });
        return {
            title: 'Paralarımız',
            instruction: 'Kutulardaki paraları toplayın ve doğru seçeneği işaretleyin.',
            pedagogicalNote: 'Miktar korunumu ve ekonomik okuryazarlık.',
            puzzles
        };
    });
};

// MATH MEMORY CARDS
export const generateOfflineMathMemoryCards = async (options: GeneratorOptions): Promise<MathMemoryCardsData[]> => {
    const { itemCount } = options;
    const pairs = Array.from({ length: itemCount || 6 }, () => {
        const n1 = getRandomInt(1, 10);
        const n2 = getRandomInt(1, 10);
        return {
            card1: { type: 'operation' as const, value: `${n1} + ${n2}` },
            card2: { type: 'number' as const, value: (n1 + n2).toString() }
        };
    });
    return [{
        title: 'Matematik Hafıza Kartları',
        instruction: 'İşlemler ile doğru sonuçları eşleştirin.',
        pedagogicalNote: 'İşlem hızı ve çalışma belleği.',
        pairs
    }];
};

// REAL LIFE PROBLEMS
export const generateOfflineRealLifeMathProblems = async (options: GeneratorOptions): Promise<RealLifeProblemData[]> => {
    const { worksheetCount, itemCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: "Günlük Yaşam Problemleri",
        instruction: "Problemleri dikkatlice oku ve çözümlerini yap.",
        pedagogicalNote: "Matematiksel muhakeme ve günlük yaşam problemleri.",
        problems: Array.from({ length: itemCount || 4 }, () => ({
            text: "Ali'nin 5 elması vardı, Ayşe ona 3 elma daha verdi. Ali'nin toplam kaç elması oldu?",
            solution: "5 + 3 = 8",
            operationHint: "Toplama İşlemi"
        }))
    }));
};
