
import { GeneratorOptions, NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, RealLifeProblemData } from '../../types';
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
    const { worksheetCount } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const problems = Array.from({ length: 4 }, () => {
            const val = getRandomInt(1, 6);
            return {
                num1: val,
                num2: val,
                operator: 'group' as const,
                answer: val,
                visualType: 'domino' as const,
                imagePrompt: 'Domino'
            };
        });

        return {
            title: 'Sayı Gruplama (Domino)',
            instruction: 'Dominodaki noktaları say ve kutuya yaz.',
            pedagogicalNote: 'Hızlı sayı tanıma (Subitizing).',
            imagePrompt: 'Domino',
            layout: 'visual',
            problems
        };
    });
};

// --- 7. Spatial Reasoning (Updated with Cubes) ---
export const generateOfflineSpatialReasoning = async (options: GeneratorOptions): Promise<SpatialGridData[]> => {
    const { worksheetCount, gridSize } = options;
    const size = gridSize || 4;
    
    return Array.from({ length: worksheetCount }, () => {
        const tasks: SpatialGridData['tasks'] = [];
        
        // 1. Cube Counting Task
        // Generate random 3x3 height map (0 to 3)
        const cubeGrid = Array.from({length: 3}, () => Array.from({length: 3}, () => getRandomInt(0, 3)));
        tasks.push({
            type: 'count-cubes',
            grid: [], // Unused for cubes
            instruction: 'Yandaki şekilde toplam kaç küp var? (Görünmeyenleri de say)',
            target: {r: 0, c: 0}
        });

        // 2. Pattern Copy Task
        const grid = Array.from({length: size}, () => Array(size).fill(null));
        for(let k=0; k<Math.floor(size*size/3); k++) {
            grid[getRandomInt(0, size-1)][getRandomInt(0, size-1)] = 'filled';
        }
        tasks.push({ 
            type: 'copy', 
            grid, 
            instruction: 'Soldaki deseni sağdaki boş kareye aynen çiz.', 
            target: {r:0, c:0} 
        });

        return {
            title: 'Uzamsal Algı ve Küpler',
            instruction: 'Şekilleri incele ve istenenleri yap.',
            pedagogicalNote: '3 boyutlu düşünme, zihinsel döndürme ve görsel kopyalama.',
            imagePrompt: 'Küp',
            layout: 'grid',
            gridSize: size,
            cubeData: cubeGrid,
            tasks
        };
    });
};
export const generateOfflineSpatialAwarenessDiscovery = (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts});
export const generateOfflinePositionalConcepts = (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts});
export const generateOfflineDirectionalConcepts = (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts});

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

// --- 6. Time/Measure ---
export const generateOfflineTimeMeasurementGeometry = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Zamanı Oku',
        instruction: 'Saatleri doğru zamanla eşleştir.',
        pedagogicalNote: 'Analog saat okuma becerisi.',
        imagePrompt: 'Saat',
        layout: 'visual',
        pairs: [
            { item1: '3:00', item2: 'Saat Üç', type: 'time', imagePrompt1: '3:00' },
            { item1: '6:00', item2: 'Saat Altı', type: 'time', imagePrompt1: '6:00' },
            { item1: '9:30', item2: 'Dokuz Buçuk', type: 'time', imagePrompt1: '9:30' },
            { item1: '12:00', item2: 'On İki', type: 'time', imagePrompt1: '12:00' }
        ]
    }));
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

// --- 8. Estimation (Updated with Jar) ---
export const generateOfflineEstimationSkills = async (options: GeneratorOptions): Promise<EstimationData[]> => {
    const { worksheetCount } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const items: EstimationData['items'] = [];
        
        // Generate 2 Estimation Tasks
        for(let i=0; i<2; i++) {
            const target = getRandomInt(15, 40);
            // Generate options: one close, two far
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
