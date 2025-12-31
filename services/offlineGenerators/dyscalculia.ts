
import { GeneratorOptions, NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, RealLifeProblemData, VisualMathType } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';
import { generateOfflineRealLifeMathProblems } from './mathLogic';
import { generateOfflineVisualOddOneOut } from './perceptualSkills';

// --- 1. Number Sense (Visual & Line) ---
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
        
        // Mark target as -1 to indicate missing in frontend if needed, or keep original and use 'target' prop
        const displayValues = [...sequence];
        
        exercises.push({ 
            type: 'missing', 
            values: displayValues, 
            target: target, 
            visualType: 'number-line-advanced',
            step: step
        });

        // 2. Ten Frame Comparison OR Base-10 Blocks (Enhanced)
        if (max <= 20) {
            const c1 = getRandomInt(1, 10);
            let c2 = getRandomInt(1, 10);
            while(c1===c2) c2 = getRandomInt(1, 10);
            exercises.push({ type: 'comparison', values: [c1, c2], target: Math.max(c1, c2), visualType: 'ten-frame' });
        } else {
            // For larger numbers, use Base-10 Blocks
             const c1 = getRandomInt(10, 50);
             let c2 = getRandomInt(10, 50);
             exercises.push({ type: 'comparison', values: [c1, c2], target: Math.max(c1, c2), visualType: 'blocks' });
        }
        
        // 3. Object Counting (Simple)
        const countTarget = getRandomInt(1, 10);
        exercises.push({
             type: 'ordering', // Reusing type for counting
             values: [countTarget],
             target: countTarget,
             visualType: 'objects'
        });

        return {
            title: `Sayı Hissi ve Tahmin (${difficulty})`,
            instruction: 'Sayı doğrusundaki eksik sayıyı bul ve görsellerdeki miktarları karşılaştır.',
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
    else if (numberRange === '1-50') limit = 50;
    
    // Map operation text to symbol
    let op: '+' | '-' | 'x' = '+';
    // Fixed type-unsafe comparison for subtraction
    if (operationType === 'sub') op = '-';
    // Fixed type-unsafe comparison for multiplication
    if (operationType === 'mult') op = 'x';
    
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

// ... (Rest of the file remains unchanged)
export const generateOfflineNumberGrouping = async (options: GeneratorOptions): Promise<VisualArithmeticData[]> => {
    const { worksheetCount, groupSize, groupCount, visualType } = options;
    const targetGroupCount = groupCount || 3;
    const targetItemsPerGroup = groupSize || 4;
    return Array.from({ length: worksheetCount }, () => {
        const problems = Array.from({ length: 3 }, () => {
            const gCount = Math.max(2, targetGroupCount + getRandomInt(-1, 1)); 
            const iCount = Math.max(2, targetItemsPerGroup + getRandomInt(-1, 1));
            return {
                num1: gCount, num2: iCount, operator: 'group' as const, answer: gCount * iCount,
                visualType: (visualType || 'objects') as VisualMathType, imagePrompt: 'Nesne Grupları'
            };
        });
        return {
            title: 'Sayı Gruplama ve Tekrarlı Toplama', instruction: 'Grupları incele: Kaç grup var? Her grupta kaç nesne var? Toplam kaç eder?',
            pedagogicalNote: 'Çarpma işlemine hazırlık.', imagePrompt: 'Gruplama', layout: 'visual', problems
        };
    });
};

export const generateOfflineSpatialReasoning = async (options: GeneratorOptions): Promise<SpatialGridData[]> => {
    const { gridSize, concept, difficulty, worksheetCount } = options;
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
            instruction = "Şekilde toplam kaç tane birim küp olduğunu bulun.";
            note = "3 boyutlu düşünme, derinlik algısı.";
            const dim = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 4 : 5);
            const maxH = difficulty === 'Başlangıç' ? 3 : 5;
            const grid = Array.from({length: dim}, () => Array.from({length: dim}, () => 0));
            for(let x=0; x<dim; x++) { for(let y=0; y<dim; y++) { if (Math.random() > 0.3) { grid[x][y] = getRandomInt(1, maxH); } } }
            grid[Math.floor(dim/2)][Math.floor(dim/2)] = Math.max(1, grid[Math.floor(dim/2)][Math.floor(dim/2)]);
            cubeData = grid;
            tasks.push({ type: 'count-cubes', grid: [], instruction: 'Toplam Küp Sayısı:', target: {r: 0, c: 0} });
        } else if (type === 'copy') {
            title = `Desen Kopyalama (${difficulty})`;
            instruction = "Soldaki deseni sağdaki boş ızgaraya çizin.";
            note = "Görsel-motor kopyalama.";
            const density = difficulty === 'Başlangıç' ? 0.3 : 0.5;
            const grid = Array.from({length: size}, () => Array(size).fill(null));
            for(let r=0; r<size; r++) { for(let c=0; c<size; c++) { if (Math.random() < density) { grid[r][c] = 'filled'; } } }
            tasks.push({ type: 'copy', grid, instruction: '', target: {r:0, c:0} });
        } else { 
            title = `Yön Takibi (${difficulty})`;
            instruction = "Yönergeleri takip ederek hedefe ulaşın.";
            note = "Yön kavramları.";
            const grid = Array.from({length: size}, () => Array(size).fill(null));
            const startR = getRandomInt(0, size-1);
            const startC = getRandomInt(0, size-1);
            grid[startR][startC] = 'S'; 
            let currR = startR; let currC = startC;
            const steps = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 5 : 8);
            const instructions = [];
            for(let k=0; k<steps; k++) {
                const moves = [];
                if (currR > 0) moves.push({dr: -1, dc: 0, txt: 'Yukarı'});
                if (currR < size-1) moves.push({dr: 1, dc: 0, txt: 'Aşağı'});
                if (currC > 0) moves.push({dr: 0, dc: -1, txt: 'Sol'});
                if (currC < size-1) moves.push({dr: 0, dc: 1, txt: 'Sağ'});
                if (moves.length > 0) { const move = getRandomItems(moves, 1)[0]; currR += move.dr; currC += move.dc; instructions.push(move.txt); }
            }
            grid[currR][currC] = 'E';
            tasks.push({ type: 'path', grid, instruction: `Yönergeler: ${instructions.join(' -> ')}`, target: {r: currR, c: currC} });
        }
        return { title, instruction, pedagogicalNote: note, imagePrompt: type === 'count-cubes' ? 'Küp' : 'Desen', layout: 'grid', gridSize: size, cubeData: cubeData, tasks };
    });
};

export const generateOfflineSpatialAwarenessDiscovery = async (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts, concept: 'path'});
export const generateOfflinePositionalConcepts = async (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts, concept: 'copy'});
export const generateOfflineDirectionalConcepts = async (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts, concept: 'direction'});

export const generateOfflineMathLanguage = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Matematik Dili', instruction: 'Sembolleri eşleştir.', pedagogicalNote: 'Sembol okuryazarlığı.', imagePrompt: 'Sembol', layout: 'list',
        pairs: [{ item1: 'ARTI', item2: '+', type: 'symbol', imagePrompt1: 'Artı' }, { item1: 'EKSİ', item2: '-', type: 'symbol', imagePrompt1: 'Eksi' }]
    }));
};
export const generateOfflineTimeMeasurementGeometry = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const pairs = [];
        for(let i=0; i<4; i++) {
            const h = getRandomInt(1, 12);
            pairs.push({ item1: `${h}:00`, item2: `Saat ${h}`, type: 'time', imagePrompt1: `CLOCK:${h}:0` });
        }
        return { title: 'Zamanı Oku', instruction: 'Eşleştir.', pedagogicalNote: 'Saat okuma.', imagePrompt: 'Time', layout: 'visual', pairs };
    });
};
export const generateOfflineFractionsDecimals = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const pairs = [];
        for(let i=0; i<4; i++) {
            const num = 1; const den = getRandomItems([2,4,8], 1)[0];
            pairs.push({ item1: `PIE:${num}:${den}`, item2: `${num}/${den}`, type: 'fraction', imagePrompt1: `PIE:${num}:${den}` });
        }
        return { title: 'Kesirler', instruction: 'Eşleştir.', pedagogicalNote: 'Parça-bütün.', imagePrompt: 'Pie', layout: 'visual', pairs };
    });
};
export const generateOfflineEstimationSkills = async (options: GeneratorOptions): Promise<EstimationData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const items = [];
        for(let i=0; i<2; i++) {
            const target = getRandomInt(15, 40);
            items.push({ count: target, visualType: 'estimation-jar', options: shuffle([target, target-10, target+10]), imagePrompt: 'Jar' });
        }
        return { title: 'Tahmin Et', instruction: 'Kaç tane var?', pedagogicalNote: 'Tahmin.', imagePrompt: 'Estimation', layout: 'visual', items };
    });
};
export const generateOfflineVisualNumberRepresentation = generateOfflineNumberSense;
export const generateOfflineAppliedMathStory = async (opts: GeneratorOptions) => generateOfflineRealLifeMathProblems({...opts, difficulty: 'Başlangıç'});
export const generateOfflineProblemSolvingStrategies = generateOfflineAppliedMathStory;
export const generateOfflineVisualDiscriminationMath = generateOfflineVisualOddOneOut;
