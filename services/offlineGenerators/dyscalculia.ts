
import { GeneratorOptions, NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, RealLifeProblemData } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';
import { generateOfflineRealLifeMathProblems } from './mathLogic';
import { generateOfflineVisualOddOneOut } from './perceptualSkills';

// --- 1. Number Sense ---
export const generateOfflineNumberSense = async (options: GeneratorOptions): Promise<NumberSenseData[]> => {
    const { worksheetCount, range } = options;
    const max = range === '1-100' ? 100 : (range === '1-20' ? 20 : 10);
    
    return Array.from({ length: worksheetCount }, () => {
        const exercises: NumberSenseData['exercises'] = [];
        
        // 1. Number Line Missing
        const start = getRandomInt(1, max - 5);
        const sequence = [start, start+1, start+2, start+3, start+4];
        const hiddenIdx = getRandomInt(1, 3);
        const missingVal = sequence[hiddenIdx];
        sequence[hiddenIdx] = -1; // Marker for missing
        exercises.push({ type: 'missing', values: sequence, target: missingVal, visualType: 'number-line' });

        // 2. Comparison
        const c1 = getRandomInt(1, max);
        let c2 = getRandomInt(1, max);
        while(c1===c2) c2 = getRandomInt(1, max);
        exercises.push({ type: 'comparison', values: [c1, c2], target: Math.max(c1, c2), visualType: 'objects' });

        return {
            title: 'Sayı Hissi Alıştırmaları (Hızlı Mod)',
            instruction: 'Eksik sayıları tamamla veya çok olanı işaretle.',
            pedagogicalNote: 'Temel sayı kavramı ve sıralama becerisi.',
            imagePrompt: 'Renkli sayı blokları ve sayı doğrusu',
            layout: 'visual',
            exercises
        };
    });
};

// --- 2. Arithmetic Fluency & Visual Arithmetic ---
export const generateOfflineArithmeticFluency = async (options: GeneratorOptions): Promise<VisualArithmeticData[]> => {
    const { worksheetCount, operation, maxSum } = options;
    const limit = maxSum || 10;
    
    return Array.from({ length: worksheetCount }, () => {
        const problems = Array.from({ length: 6 }, () => {
            let n1 = getRandomInt(1, limit);
            let n2 = getRandomInt(1, limit);
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
                visualType: 'dots' as const, 
                imagePrompt: 'Yıldız'
            };
        });

        return {
            title: 'Görsel Aritmetik (Hızlı Mod)',
            instruction: 'İşlemleri görsellerden yararlanarak yap.',
            pedagogicalNote: 'Somutlaştırma yoluyla işlem becerisi.',
            imagePrompt: 'Matematik sembolleri',
            layout: 'visual',
            problems
        };
    });
};
export const generateOfflineVisualArithmetic = generateOfflineArithmeticFluency;

// --- 3. Number Grouping ---
export const generateOfflineNumberGrouping = async (options: GeneratorOptions): Promise<VisualArithmeticData[]> => {
    const { worksheetCount, groupSize } = options;
    const size = parseInt(String(groupSize || 10));
    
    return Array.from({ length: worksheetCount }, () => {
        const problems = Array.from({ length: 4 }, () => {
            const groups = getRandomInt(2, 5);
            const total = groups * size;
            return {
                num1: total,
                num2: size,
                operator: 'group' as const,
                answer: groups,
                visualType: 'objects' as const,
                imagePrompt: 'Elma'
            };
        });

        return {
            title: 'Sayı Gruplama (Hızlı Mod)',
            instruction: `${size}'li gruplar oluştur ve kaç grup olduğunu yaz.`,
            pedagogicalNote: 'Basamak değeri ve çarpma temeli.',
            imagePrompt: 'Gruplanmış nesneler',
            layout: 'visual',
            problems
        };
    });
};

// --- 7. Spatial Reasoning & Concepts ---
export const generateOfflineSpatialReasoning = async (options: GeneratorOptions): Promise<SpatialGridData[]> => {
    const { worksheetCount, gridSize, concept } = options;
    const size = gridSize || 4;
    
    return Array.from({ length: worksheetCount }, () => {
        const tasks: SpatialGridData['tasks'] = [];
        
        for(let i=0; i<4; i++) {
            const grid = Array.from({length: size}, () => Array(size).fill(null));
            const r = getRandomInt(0, size-1);
            const c = getRandomInt(0, size-1);
            
            let instr = '';
            let type: 'position' | 'direction' | 'copy' | 'path' = 'position';
            
            if (concept === 'direction') {
                grid[r][c] = 'start';
                instr = 'Sağa git, sonra aşağı in.';
                type = 'direction';
            } else {
                grid[r][c] = 'X';
                instr = 'X işaretinin yerini bul.';
                type = 'position';
            }
            
            tasks.push({ type, grid, instruction: instr, target: {r, c} });
        }

        return {
            title: 'Uzamsal Algı (Hızlı Mod)',
            instruction: 'Yönergeleri takip et.',
            pedagogicalNote: 'Yön ve konum farkındalığı.',
            imagePrompt: 'Labirent ve yön okları',
            layout: 'grid',
            gridSize: size,
            tasks
        };
    });
};
export const generateOfflineSpatialAwarenessDiscovery = (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts, concept: 'direction'});
export const generateOfflinePositionalConcepts = (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts, concept: 'position'});
export const generateOfflineDirectionalConcepts = (opts: GeneratorOptions) => generateOfflineSpatialReasoning({...opts, concept: 'direction'});

// --- 5. Math Language ---
export const generateOfflineMathLanguage = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Matematik Dili (Hızlı Mod)',
        instruction: 'Sembolleri anlamlarıyla eşleştir.',
        pedagogicalNote: 'Sembol tanıma.',
        imagePrompt: 'Matematik sembolleri (+ - =)',
        layout: 'list',
        pairs: [
            { item1: '+', item2: 'Topla', type: 'symbol', imagePrompt1: '' },
            { item1: '-', item2: 'Çıkar', type: 'symbol', imagePrompt1: '' },
            { item1: '=', item2: 'Eşittir', type: 'symbol', imagePrompt1: '' },
            { item1: 'x', item2: 'Çarp', type: 'symbol', imagePrompt1: '' }
        ]
    }));
};

// --- 6. Time/Measure ---
export const generateOfflineTimeMeasurementGeometry = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Zaman ve Şekiller (Hızlı Mod)',
        instruction: 'Saatleri okunuşlarıyla eşleştir.',
        pedagogicalNote: 'Zaman kavramı.',
        imagePrompt: 'Saatler',
        layout: 'visual',
        pairs: [
            { item1: '3:00', item2: 'Saat Üç', type: 'time', imagePrompt1: 'Saat' },
            { item1: '12:30', item2: 'On iki buçuk', type: 'time', imagePrompt1: 'Saat' }
        ]
    }));
};

// --- 9. Fractions ---
export const generateOfflineFractionsDecimals = async (options: GeneratorOptions): Promise<ConceptMatchData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Kesirler (Hızlı Mod)',
        instruction: 'Şeklin boyalı kısmını kesirle eşleştir.',
        pedagogicalNote: 'Parça-bütün ilişkisi.',
        imagePrompt: 'Pasta grafiği',
        layout: 'visual',
        pairs: [
            { item1: '1/2', item2: 'Yarım', type: 'fraction', imagePrompt1: 'pie-1-2' },
            { item1: '1/4', item2: 'Çeyrek', type: 'fraction', imagePrompt1: 'pie-1-4' }
        ]
    }));
};

// --- 8. Estimation ---
export const generateOfflineEstimationSkills = async (options: GeneratorOptions): Promise<EstimationData[]> => {
    return Array.from({ length: options.worksheetCount }, () => ({
        title: 'Tahmin Et (Hızlı Mod)',
        instruction: 'Saymadan tahmin et.',
        pedagogicalNote: 'Yaklaşık değer algısı.',
        imagePrompt: 'Kavanozda şekerler',
        layout: 'visual',
        items: [
            { count: 12, visualType: 'dots', options: [5, 12, 30], imagePrompt: '' },
            { count: 25, visualType: 'dots', options: [10, 25, 60], imagePrompt: '' }
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
