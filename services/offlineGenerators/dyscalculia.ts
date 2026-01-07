
import { GeneratorOptions, NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, RealLifeProblemData, VisualMathType, MathMemoryCardsData, MathMemoryCard } from '../../types';
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

export const generateOfflineMathMemoryCards = async (options: GeneratorOptions): Promise<MathMemoryCardsData[]> => {
    const { worksheetCount, difficulty, itemCount, variant, selectedOperations, visualStyle } = options;
    const count = itemCount || 16;
    const pairCount = Math.floor(count / 2);
    
    return Array.from({ length: worksheetCount }, () => {
        const cards: MathMemoryCard[] = [];
        const limit = difficulty === 'Başlangıç' ? 10 : (difficulty === 'Orta' ? 20 : 100);

        for (let i = 0; i < pairCount; i++) {
            const pairId = `pair-${i}-${Date.now()}`;
            const op = (selectedOperations && selectedOperations.length > 0) 
                ? selectedOperations[getRandomInt(0, selectedOperations.length - 1)]
                : 'add';
            
            let n1 = 0, n2 = 0, ans = 0, symbol = '+';
            
            if (op === 'add') { n1 = getRandomInt(1, limit/2); n2 = getRandomInt(1, limit/2); ans = n1 + n2; symbol = '+'; }
            else if (op === 'sub') { n1 = getRandomInt(Math.floor(limit/2), limit); n2 = getRandomInt(1, n1); ans = n1 - n2; symbol = '-'; }
            else if (op === 'mult') { n1 = getRandomInt(1, 10); n2 = getRandomInt(1, 5); ans = n1 * n2; symbol = 'x'; }
            else { n2 = getRandomInt(2, 5); ans = getRandomInt(1, 10); n1 = ans * n2; symbol = '÷'; }

            if (variant === 'op-res' || (variant === 'mixed' && Math.random() > 0.5)) {
                cards.push({ id: `c-${i}a`, pairId, type: 'operation', content: `${n1} ${symbol} ${n2}`, numValue: ans });
                cards.push({ id: `c-${i}b`, pairId, type: 'number', content: ans.toString(), numValue: ans });
            } else if (variant === 'vis-num') {
                const style = visualStyle === 'mixed' ? getRandomItems(['ten-frame', 'dice', 'blocks'] as any[], 1)[0] : (visualStyle || 'ten-frame');
                cards.push({ id: `c-${i}a`, pairId, type: 'visual', content: ans.toString(), visualType: style as any, numValue: ans });
                cards.push({ id: `c-${i}b`, pairId, type: 'number', content: ans.toString(), numValue: ans });
            } else {
                // Equivalent equations
                cards.push({ id: `c-${i}a`, pairId, type: 'operation', content: `${n1} ${symbol} ${n2}`, numValue: ans });
                cards.push({ id: `c-${i}b`, pairId, type: 'operation', content: `${ans} x 1`, numValue: ans });
            }
        }

        return {
            title: "Matematik Hafıza Atölyesi",
            instruction: "Kartları noktalı çizgilerden kesin ve ters çevirerek eşlerini bulmaya çalışın.",
            pedagogicalNote: "Görsel-uzamsal bellek ve temel aritmetik işlemler arasında kalıcı bağlar kurar.",
            cards: shuffle(cards),
            settings: { gridCols: 4, cardCount: count, difficulty, variant: variant as any || 'op-res' }
        };
    });
};

// ... rest remains same ...
