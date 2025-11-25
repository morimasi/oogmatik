
import { GeneratorOptions, NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, RealLifeProblemData } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';
import { generateOfflineRealLifeMathProblems } from './mathLogic';
import { generateOfflineVisualOddOneOut } from './perceptualSkills';

// --- 1. Number Sense ---
export const generateOfflineNumberSense = async (options: GeneratorOptions): Promise<NumberSenseData[]> => {
    const { worksheetCount, range } = options;
    const max = range === '1-100' ? 20 : (range === '1-20' ? 20 : 10); // Limit visual max for ten-frames
    
    return Array.from({ length: worksheetCount }, () => {
        const exercises: NumberSenseData['exercises'] = [];
        
        // 1. Missing Number
        const start = getRandomInt(1, max - 3);
        const sequence = [start, start+1, start+2, start+3];
        const hiddenIdx = getRandomInt(1, 2);
        const missingVal = sequence[hiddenIdx];
        sequence[hiddenIdx] = -1; 
        exercises.push({ type: 'missing', values: sequence, target: missingVal, visualType: 'number-line' });

        // 2. Ten Frame Comparison
        const c1 = getRandomInt(1, 10); // Keep within single frame for clarity initially
        let c2 = getRandomInt(1, 10);
        while(c1===c2) c2 = getRandomInt(1, 10);
        exercises.push({ type: 'comparison', values: [c1, c2], target: Math.max(c1, c2), visualType: 'ten-frame' });

        return {
            title: 'Sayı Hissi ve Miktar (10\'luk Çerçeve)',
            instruction: 'Eksik sayıları yaz ve çok olan grubu daire içine al.',
            pedagogicalNote: '10\'luk çerçeve (Ten Frame) kullanımı sayı hissini somutlaştırır.',
            imagePrompt: 'Ten frame math tool',
            layout: 'visual',
            exercises
        };
    });
};

// --- 2. Arithmetic Fluency ---
export const generateOfflineArithmeticFluency = async (options: GeneratorOptions): Promise<VisualArithmeticData[]> => {
    const { worksheetCount, operation } = options;
    const limit = 20; // Visual tools limit
    
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
                imagePrompt: ''
            };
        });

        return {
            title: 'Görsel İşlem (10\'luk Çerçeve)',
            instruction: 'Noktaları sayarak işlemleri yap.',
            pedagogicalNote: 'Görsel destekli toplama/çıkarma.',
            imagePrompt: 'Math addition worksheet',
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
            // Use Domino patterns for grouping recognition
            const val = getRandomInt(1, 6);
            return {
                num1: val,
                num2: val,
                operator: 'group' as const,
                answer: val,
                visualType: 'domino' as const,
                imagePrompt: ''
            };
        });

        return {
            title: 'Sayı Gruplama (Domino)',
            instruction: 'Dominodaki noktaları say ve kutuya yaz.',
            pedagogicalNote: 'Hızlı sayı tanıma (Subitizing).',
            imagePrompt: 'Domino pieces',
            layout: 'visual',
            problems
        };
    });
};

// --- 7. Spatial Reasoning ---
export const generateOfflineSpatialReasoning = async (options: GeneratorOptions): Promise<SpatialGridData[]> => {
    const { worksheetCount, gridSize } = options;
    const size = gridSize || 4;
    
    return Array.from({ length: worksheetCount }, () => {
        const tasks: SpatialGridData['tasks'] = [];
        
        // Generate Pattern Copy Tasks
        for(let i=0; i<2; i++) {
            const grid = Array.from({length: size}, () => Array(size).fill(null));
            // Create a random pattern
            for(let k=0; k<Math.floor(size*size/3); k++) {
                grid[getRandomInt(0, size-1)][getRandomInt(0, size-1)] = 'filled';
            }
            
            tasks.push({ 
                type: 'copy', 
                grid, 
                instruction: 'Soldaki deseni sağdaki boş kareye aynen çiz.', 
                target: {r:0, c:0} 
            });
        }

        return {
            title: 'Deseni Kopyala',
            instruction: 'Noktaların yerlerine dikkat et.',
            pedagogicalNote: 'Görsel-uzamsal kopyalama ve konumlandırma.',
            imagePrompt: 'Grid pattern copy task',
            layout: 'grid',
            gridSize: size,
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
        imagePrompt: 'Math symbols',
        layout: 'list',
        pairs: [
            { item1: 'ARTI', item2: '+', type: 'symbol', imagePrompt1: '' },
            { item1: 'EKSİ', item2: '-', type: 'symbol', imagePrompt1: '' },
            { item1: 'EŞİTTİR', item2: '=', type: 'symbol', imagePrompt1: '' },
            { item1: 'BÜYÜKTÜR', item2: '>', type: 'symbol', imagePrompt1: '' }
        ]
    }));
};

// --- 6. Time/Measure ---
export const generateOfflineTimeMeasurementGeometry = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Zamanı Oku',
        instruction: 'Saatleri doğru zamanla eşleştir.',
        pedagogicalNote: 'Analog saat okuma becerisi.',
        imagePrompt: 'Analog Clocks',
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
        imagePrompt: 'Fraction bars',
        layout: 'visual',
        pairs: [
            { item1: '1/2', item2: 'Yarım', type: 'fraction', imagePrompt1: '' },
            { item1: '1/4', item2: 'Çeyrek', type: 'fraction', imagePrompt1: '' },
            { item1: '3/4', item2: 'Üç Çeyrek', type: 'fraction', imagePrompt1: '' },
            { item1: '2/3', item2: 'İki Bölü Üç', type: 'fraction', imagePrompt1: '' }
        ]
    }));
};

// --- 8. Estimation ---
export const generateOfflineEstimationSkills = async (options: GeneratorOptions): Promise<EstimationData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Tahmin Et',
        instruction: 'Saymadan tahmin et: Hangisi daha yakın?',
        pedagogicalNote: 'Miktar tahmini ve büyüklük algısı.',
        imagePrompt: 'Scattered items',
        layout: 'visual',
        items: [
            { count: 18, visualType: 'dots', options: [5, 20, 50], imagePrompt: '' },
            { count: 8, visualType: 'dots', options: [10, 30, 100], imagePrompt: '' },
            { count: 35, visualType: 'dots', options: [10, 35, 80], imagePrompt: '' }
        ]
    }));
};

// --- 10. Visual Number Rep ---
export const generateOfflineVisualNumberRepresentation = generateOfflineNumberSense;

// --- 12. Applied Story ---
export const generateOfflineAppliedMathStory = async (opts: GeneratorOptions) => generateOfflineRealLifeMathProblems({...opts, difficulty: 'Başlangıç'});
export const generateOfflineProblemSolvingStrategies = generateOfflineAppliedMathStory;

// --- 16. Visual Discrim ---
export const generateOfflineVisualDiscriminationMath = generateOfflineVisualOddOneOut;
