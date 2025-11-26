
import { GeneratorOptions, NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, RealLifeProblemData, VisualMathType } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';
import { generateOfflineRealLifeMathProblems } from './mathLogic';
import { generateOfflineVisualOddOneOut } from './perceptualSkills';

// --- 1. Number Sense ---
export const generateOfflineNumberSense = async (options: GeneratorOptions): Promise<NumberSenseData[]> => {
    const { worksheetCount, range, difficulty } = options;
    
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

// --- 2. Arithmetic Fluency ---
export const generateOfflineArithmeticFluency = async (options: GeneratorOptions): Promise<VisualArithmeticData[]> => {
    const { worksheetCount, operation } = options;
    const limit = 20; 
    
    return Array.from({ length: worksheetCount }, () => {
        const problems = Array.from({ length: 6 }, () => {
            let n1 = getRandomInt(1, 10);
            let n2 = getRandomInt(1, 10);
            let op = (!operation || operation === 'mixed') ? (Math.random() > 0.5 ? '+' : '-') : (operation === 'subtraction' ? '-' : '+');
            
            if (op === '+') {
                if (n1 + n2 > limit) n2 = limit - n1;
            } else {
                if (n1 < n2) [n1, n2] = [n2, n1];
            }
            
            return {
                num1: n1,
                num2: n2,
                operator: op as '+' | '-' | 'x' | '÷',
                answer: op === '+' ? n1 + n2 : n1 - n2,
                visualType: 'ten-frame' as const, 
                imagePrompt: 'Matematik İşlemi'
            };
        });

        return {
            title: 'Görsel İşlem (10\'luk Çerçeve)',
            instruction: 'Noktaları sayarak işlemleri yap.',
            pedagogicalNote: 'Görsel destekli toplama/çıkarma.',
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

// --- 9. Fractions ---
export const generateOfflineFractionsDecimals = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Kesirleri Eşleştir',
        instruction: 'Şeklin boyalı kısmı hangi kesri gösteriyor?',
        pedagogicalNote: 'Görsel kesir modelleri (Area Model).',
        imagePrompt: 'Kesir',
        layout: 'visual',
        pairs: [
            { item1: '1/2', item2: 'Yarım', type: 'fraction', imagePrompt1: 'Yarım' },
            { item1: '1/4', item2: 'Çeyrek', type: 'fraction', imagePrompt1: 'Çeyrek' },
            { item1: '3/4', item2: 'Üç Çeyrek', type: 'fraction', imagePrompt1: 'Üç Çeyrek' },
            { item1: '2/3', item2: 'İki Bölü Üç', type: 'fraction', imagePrompt1: 'İki Bölü Üç' }
        ]
    }));
};

// --- 8. Estimation ---
export const generateOfflineEstimationSkills = async (options: GeneratorOptions): Promise<EstimationData[]> => {
    const { worksheetCount } = options;
    
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
