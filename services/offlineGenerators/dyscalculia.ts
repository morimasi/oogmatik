
import { GeneratorOptions, NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, RealLifeProblemData, VisualMathType } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';
import { generateOfflineRealLifeMathProblems } from './mathLogic';
import { generateOfflineVisualOddOneOut } from './perceptualSkills';

// --- 1. Number Sense ---
export const generateOfflineNumberSense = async (options: GeneratorOptions): Promise<NumberSenseData[]> => {
    const { worksheetCount, numberRange, difficulty } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const exercises: NumberSenseData['exercises'] = [];
        
        // Determine parameters based on difficulty
        const max = difficulty === 'Başlangıç' ? 10 : (difficulty === 'Orta' ? 20 : 100);
        const step = difficulty === 'Başlangıç' ? 1 : (difficulty === 'Orta' ? 2 : 5);
        
        // 1. Advanced Number Line Task
        const start = getRandomInt(0, max - (step * 5));
        const sequence = Array.from({length: 6}, (_, i) => start + i * step);
        const hiddenIdx = getRandomInt(1, 4);
        const target = sequence[hiddenIdx];
        
        exercises.push({ 
            type: 'missing', 
            values: sequence, 
            target: target, 
            visualType: 'number-line-advanced',
            step: step
        });

        // 2. Ten Frame Comparison (Standard)
        if (max <= 20) {
            const c1 = getRandomInt(1, 10);
            let c2 = getRandomInt(1, 10);
            while(c1===c2) c2 = getRandomInt(1, 10);
            exercises.push({ type: 'comparison', values: [c1, c2], target: Math.max(c1, c2), visualType: 'ten-frame' });
        }

        return {
            title: `Sayı Hissi ve Tahmin (${difficulty})`,
            instruction: 'Sayı doğrusundaki eksik sayıyı bul ve kavanozdaki nesneleri tahmin et.',
            pedagogicalNote: 'Sayısal aralıklar, ritmik sayma ve görsel miktar tahmini.',
            imagePrompt: 'Sayı Doğrusu',
            layout: 'visual',
            exercises
        };
    });
};

// --- 2. Arithmetic Fluency & Visual Arithmetic (UPDATED) ---
export const generateOfflineArithmeticFluency = async (options: GeneratorOptions): Promise<VisualArithmeticData[]> => {
    const { worksheetCount, operationType, visualStyle, numberRange } = options;
    
    // Define range
    let limit = 10;
    if (numberRange === '1-20') limit = 20;
    
    // Map operation text to symbol
    let op: '+' | '-' | 'x' = '+';
    if (operationType === 'subtraction') op = '-';
    if (operationType === 'multiplication') op = 'x';
    
    // Visual Style: 'objects' | 'ten-frame' | 'number-bond' | 'dice'
    const style = visualStyle || 'objects';

    return Array.from({ length: worksheetCount }, () => {
        const problems = Array.from({ length: 6 }, () => {
            let n1 = 0, n2 = 0, ans = 0;
            
            if (op === '+') {
                n1 = getRandomInt(1, limit / 2);
                n2 = getRandomInt(1, limit / 2);
                ans = n1 + n2;
            } else if (op === '-') {
                n1 = getRandomInt(Math.floor(limit/2), limit);
                n2 = getRandomInt(1, n1);
                ans = n1 - n2;
            } else if (op === 'x') {
                n1 = getRandomInt(1, 5);
                n2 = getRandomInt(1, 5);
                ans = n1 * n2;
            }

            return {
                num1: n1,
                num2: n2,
                operator: op,
                answer: ans,
                visualType: style as VisualMathType,
                imagePrompt: 'Matematik İşlemi'
            };
        });

        const titles: Record<string, string> = {
            'ten-frame': '10\'luk Çerçeve ile İşlemler',
            'number-bond': 'Sayı Bağları (Parça-Bütün)',
            'dice': 'Domino Aritmetiği',
            'objects': 'Görsel Aritmetik'
        };

        return {
            title: titles[style] || 'Görsel Aritmetik',
            instruction: style === 'number-bond' 
                ? (op === '+' ? 'Parçaları toplayarak bütünü bulun.' : 'Bütünden parçayı çıkararak diğer parçayı bulun.')
                : 'Görselleri kullanarak işlemi yapın.',
            pedagogicalNote: 'Somutlaştırma (CRA) modeli ile matematiksel işlem becerisi.',
            imagePrompt: 'Matematik İşlemi',
            layout: 'visual',
            problems
        };
    });
};
export const generateOfflineVisualArithmetic = generateOfflineArithmeticFluency;

// --- 3. Number Grouping ---
export const generateOfflineNumberGrouping = async (options: GeneratorOptions): Promise<VisualArithmeticData[]> => {
    const { worksheetCount, groupSize, groupCount, visualType } = options;
    
    const targetGroupCount = groupCount || 3;
    const targetItemsPerGroup = groupSize || 4;
    
    return Array.from({ length: worksheetCount }, () => {
        const problems = Array.from({ length: 3 }, () => {
            const gCount = Math.max(2, targetGroupCount + getRandomInt(-1, 1)); 
            const iCount = Math.max(2, targetItemsPerGroup + getRandomInt(-1, 1));
            
            return {
                num1: gCount, // Number of groups
                num2: iCount, // Items per group
                operator: 'group' as const,
                answer: gCount * iCount,
                visualType: (visualType || 'objects') as VisualMathType,
                imagePrompt: 'Nesne Grupları'
            };
        });

        return {
            title: 'Sayı Gruplama ve Tekrarlı Toplama',
            instruction: 'Grupları incele: Kaç grup var? Her grupta kaç nesne var? Toplam kaç eder?',
            pedagogicalNote: 'Çarpma işlemine hazırlık: Eşit grupları tanıma ve tekrarlı toplama mantığı.',
            imagePrompt: 'Gruplama',
            layout: 'visual',
            problems
        };
    });
};

// --- 7. Spatial Reasoning (UPDATED) ---
export const generateOfflineSpatialReasoning = async (options: GeneratorOptions): Promise<SpatialGridData[]> => {
    const { worksheetCount, gridSize, concept, difficulty } = options;
    const size = gridSize || 4;
    const type = concept || 'count-cubes';
    
    return Array.from({ length: worksheetCount }, () => {
        const tasks: SpatialGridData['tasks'] = [];
        let title = "Uzamsal Akıl Yürütme";
        let instruction = "";
        let note = "";
        let cubeData = undefined;

        if (type === 'count-cubes') {
            title = `3D Küp Sayma (${difficulty})`;
            instruction = "Şekilde toplam kaç tane birim küp olduğunu bulun (Görünmeyenleri de sayın!).";
            note = "3 boyutlu düşünme, derinlik algısı ve zihinsel canlandırma.";
            
            // Generate 3D grid data: 2D array where value is stack height
            // 3x3, 4x4 based on difficulty
            const dim = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 4 : 5);
            const maxH = difficulty === 'Başlangıç' ? 3 : 5;
            
            const grid = Array.from({length: dim}, () => Array.from({length: dim}, () => 0));
            
            // Randomize heights but ensure no floating cubes (gravity)
            // Simple stack logic: just random heights 0-maxH
            for(let x=0; x<dim; x++) {
                for(let y=0; y<dim; y++) {
                    // Higher chance of being non-zero in center
                    if (Math.random() > 0.3) {
                        grid[x][y] = getRandomInt(1, maxH);
                    }
                }
            }
            // Ensure at least one cube
            grid[Math.floor(dim/2)][Math.floor(dim/2)] = Math.max(1, grid[Math.floor(dim/2)][Math.floor(dim/2)]);
            
            cubeData = grid;
            
            tasks.push({
                type: 'count-cubes',
                grid: [], // Not used for cubes
                instruction: 'Toplam Küp Sayısı:',
                target: {r: 0, c: 0}
            });

        } else if (type === 'copy') {
            title = `Desen Kopyalama (${difficulty})`;
            instruction = "Soldaki ızgaradaki deseni sağdaki boş ızgaraya birebir aynı olacak şekilde çizin.";
            note = "Görsel-motor kopyalama ve konumsal bellek.";
            
            const density = difficulty === 'Başlangıç' ? 0.3 : 0.5;
            const grid = Array.from({length: size}, () => Array(size).fill(null));
            
            for(let r=0; r<size; r++) {
                for(let c=0; c<size; c++) {
                    if (Math.random() < density) {
                        grid[r][c] = 'filled';
                    }
                }
            }
            
            tasks.push({ type: 'copy', grid, instruction: '', target: {r:0, c:0} });

        } else { // Path / Direction
            title = `Yön Takibi (${difficulty})`;
            instruction = "Başlangıç noktasından yönergeleri takip ederek hedefe ulaşın.";
            note = "Yön kavramları (Sağ, Sol, Yukarı, Aşağı) ve ardışık işlem.";
            
            const grid = Array.from({length: size}, () => Array(size).fill(null));
            const startR = getRandomInt(0, size-1);
            const startC = getRandomInt(0, size-1);
            grid[startR][startC] = 'S'; // Start
            
            // Generate path
            let currR = startR;
            let currC = startC;
            const steps = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 5 : 8);
            const instructions = [];
            
            for(let k=0; k<steps; k++) {
                const moves = [];
                if (currR > 0) moves.push({dr: -1, dc: 0, txt: 'Yukarı'});
                if (currR < size-1) moves.push({dr: 1, dc: 0, txt: 'Aşağı'});
                if (currC > 0) moves.push({dr: 0, dc: -1, txt: 'Sol'});
                if (currC < size-1) moves.push({dr: 0, dc: 1, txt: 'Sağ'});
                
                if (moves.length > 0) {
                    const move = getRandomItems(moves, 1)[0];
                    currR += move.dr;
                    currC += move.dc;
                    instructions.push(move.txt);
                }
            }
            
            grid[currR][currC] = 'E'; // End (Hidden in display usually)
            
            tasks.push({
                type: 'path',
                grid,
                instruction: `Yönergeler: ${instructions.join(' -> ')}`,
                target: {r: currR, c: currC}
            });
        }

        return {
            title,
            instruction,
            pedagogicalNote: note,
            imagePrompt: type === 'count-cubes' ? 'Küp' : 'Desen',
            layout: 'grid',
            gridSize: size,
            cubeData: cubeData,
            tasks
        };
    });
};
export const generateOfflineSpatialAwarenessDiscovery = (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts, concept: 'path'});
export const generateOfflinePositionalConcepts = (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts, concept: 'copy'});
export const generateOfflineDirectionalConcepts = (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts, concept: 'path'});

// --- 5. Math Language ---
export const generateOfflineMathLanguage = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Matematik Dili',
        instruction: 'Kelimeleri doğru sembollerle eşleştir.',
        pedagogicalNote: 'Sembol okuryazarlığı.',
        imagePrompt: 'Matematik Sembolleri',
        layout: 'list',
        pairs: [
            { item1: 'ARTI', item2: '+', type: 'symbol', imagePrompt1: 'Artı' },
            { item1: 'EKSİ', item2: '-', type: 'symbol', imagePrompt1: 'Eksi' },
            { item1: 'EŞİTTİR', item2: '=', type: 'symbol', imagePrompt1: 'Eşittir' },
            { item1: 'BÜYÜKTÜR', item2: '>', type: 'symbol', imagePrompt1: 'Büyüktür' }
        ]
    }));
};

// --- 6. Time/Measure/Geometry ---
export const generateOfflineTimeMeasurementGeometry = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    const { worksheetCount, subType, difficulty } = options;
    const cat = subType || 'time'; // 'time', 'money', 'measurement', 'geometry'
    
    return Array.from({ length: worksheetCount }, () => {
        let title = "";
        let instruction = "";
        let note = "";
        let pairs: ConceptMatchData['pairs'] = [];
        
        if (cat === 'time') {
            title = `Zamanı Oku (${difficulty})`;
            instruction = "Saatleri doğru zamanla eşleştir.";
            note = "Analog saat okuma becerisi.";
            
            for (let i = 0; i < 4; i++) {
                let h, m;
                if (difficulty === 'Başlangıç') {
                    h = getRandomInt(1, 12);
                    m = Math.random() > 0.5 ? 0 : 30;
                } else if (difficulty === 'Orta') {
                    h = getRandomInt(1, 12);
                    m = getRandomInt(0, 3) * 15; // 0, 15, 30, 45
                } else {
                    h = getRandomInt(1, 12);
                    m = getRandomInt(0, 11) * 5;
                }
                
                const timeStr = `${h}:${m.toString().padStart(2, '0')}`;
                let textStr = "";
                if (m === 0) textStr = `Saat ${h}`;
                else if (m === 30) textStr = `Saat ${h} buçuk`;
                else if (m === 15) textStr = `${h} çeyrek geçiyor`;
                else if (m === 45) textStr = `${h+1} çeyrek var`;
                else textStr = `${h} ${m} geçiyor`;

                pairs.push({ item1: timeStr, item2: textStr, type: 'time', imagePrompt1: `CLOCK:${h}:${m}` });
            }
        } else if (cat === 'money') {
            title = `Paralarımız (${difficulty})`;
            instruction = "Paraları toplam değerleriyle eşleştir.";
            note = "Para tanıma ve toplama.";
            
            for(let i=0; i<4; i++) {
                let val = 0;
                if (difficulty === 'Başlangıç') {
                    // Simple coins: 1, 2, 5, 10 TL (using 1TL coins mostly)
                    val = getRandomInt(1, 5);
                } else {
                    // Mixed coins including cents
                    val = getRandomInt(1, 10) + (Math.random() > 0.5 ? 0.5 : 0);
                }
                pairs.push({ item1: `MONEY:${val}`, item2: `${val} TL`, type: 'measurement', imagePrompt1: `MONEY:${val}` });
            }
        } else if (cat === 'measurement') {
            title = `Ölçme (${difficulty})`;
            instruction = "Nesnenin uzunluğunu cetvelde oku.";
            note = "Standart olmayan ve standart ölçme birimleri.";
            
            for(let i=0; i<4; i++) {
                const len = getRandomInt(2, 10);
                pairs.push({ item1: `RULER:${len}`, item2: `${len} cm`, type: 'measurement', imagePrompt1: `RULER:${len}` });
            }
        } else { // Geometry
            title = `Geometrik Şekiller (${difficulty})`;
            instruction = "Şekli ismiyle eşleştir.";
            note = "Şekil tanıma.";
            const shapes = ['Üçgen', 'Kare', 'Dikdörtgen', 'Daire', 'Beşgen', 'Altıgen'];
            const selectedShapes = getRandomItems(shapes, 4);
            pairs = selectedShapes.map(s => ({
                item1: `SHAPE:${s}`, item2: s, type: 'geometry', imagePrompt1: `SHAPE:${s}`
            }));
        }

        return {
            title,
            instruction,
            pedagogicalNote: note,
            imagePrompt: cat,
            layout: 'visual',
            pairs
        };
    });
};

// --- 9. Fractions & Decimals (UPDATED) ---
export const generateOfflineFractionsDecimals = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    const { worksheetCount, visualStyle, conceptType, difficulty } = options;
    // conceptType: 'fraction', 'decimal', 'percentage'
    // visualStyle: 'pie', 'bar', 'grid' (grid is good for decimals)
    
    const activeConcept = conceptType || 'fraction';
    const activeStyle = visualStyle || 'pie';
    
    return Array.from({ length: worksheetCount }, () => {
        let pairs: ConceptMatchData['pairs'] = [];
        
        for(let i=0; i<4; i++) {
            let num = 1, den = 2;
            
            if (difficulty === 'Başlangıç') {
                // Halves, Quarters, Eighths
                den = getRandomItems([2, 4, 8], 1)[0];
                num = getRandomInt(1, den - 1);
            } else if (difficulty === 'Orta') {
                // Thirds, Fifths, Tenths
                den = getRandomItems([3, 5, 6, 10], 1)[0];
                num = getRandomInt(1, den - 1);
            } else {
                // Decimals focus
                den = getRandomItems([10, 100], 1)[0];
                num = getRandomInt(1, den - 1);
            }

            // Force denominator for decimals/percentages
            if (activeConcept === 'decimal' || activeConcept === 'percentage') {
                if (den !== 10 && den !== 100) den = 100; // Standardize to 100 for easier conversion visual
            }

            let label = "";
            if (activeConcept === 'fraction') {
                label = `${num}/${den}`;
            } else if (activeConcept === 'decimal') {
                label = (num / den).toFixed(den === 10 ? 1 : 2);
            } else if (activeConcept === 'percentage') {
                label = `%${Math.round((num/den)*100)}`;
            }

            // ImagePrompt format for frontend renderer: "STYLE:NUM:DEN"
            // e.g. "PIE:3:4", "GRID:45:100", "BAR:2:5"
            const visualCode = `${activeStyle.toUpperCase()}:${num}:${den}`;

            pairs.push({
                item1: visualCode, // Visual representation code
                item2: label,      // Text representation
                type: 'fraction',
                imagePrompt1: visualCode // Used by renderer
            });
        }

        return {
            title: activeConcept === 'decimal' ? 'Ondalık Gösterim' : (activeConcept === 'percentage' ? 'Yüzdeler' : 'Kesirleri Görselleştirme'),
            instruction: 'Görsel modelin ifade ettiği değeri bulun.',
            pedagogicalNote: 'Parça-bütün ilişkisi ve sayısal gösterimler arası geçiş.',
            imagePrompt: 'Matematik',
            layout: 'visual',
            pairs
        };
    });
};

// --- 8. Estimation ---
export const generateOfflineEstimationSkills = async (options: GeneratorOptions): Promise<EstimationData[]> => {
    const { numberRange, worksheetCount } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const items: EstimationData['items'] = [];
        
        for(let i=0; i<2; i++) {
            const target = getRandomInt(15, 40);
            const close = target + getRandomInt(-3, 3);
            const far1 = target - getRandomInt(10, 15);
            const far2 = target + getRandomInt(10, 20);
            
            items.push({
                count: target,
                visualType: 'estimation-jar',
                options: shuffle([close, Math.max(5, far1), far2]),
                imagePrompt: 'Kavanoz'
            });
        }

        return {
            title: 'Tahmin Kavanozu',
            instruction: 'Kavanozdaki nesne sayısını tahmin et (Saymadan!)',
            pedagogicalNote: 'Miktar algısı ve referans alarak tahmin yürütme.',
            imagePrompt: 'Kavanoz',
            layout: 'visual',
            items
        };
    });
};

// --- 10. Visual Number Rep ---
export const generateOfflineVisualNumberRepresentation = generateOfflineNumberSense;

// --- 12. Applied Story ---
export const generateOfflineAppliedMathStory = async (opts: GeneratorOptions) => generateOfflineRealLifeMathProblems({...opts, difficulty: 'Başlangıç'});
export const generateOfflineProblemSolvingStrategies = generateOfflineAppliedMathStory;

// --- 16. Visual Discrim ---
export const generateOfflineVisualDiscriminationMath = generateOfflineVisualOddOneOut;
