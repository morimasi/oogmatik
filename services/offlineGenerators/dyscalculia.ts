
import { GeneratorOptions, NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, RealLifeProblemData, VisualMathType, MathMemoryCardsData, MathMemoryCard, MoneyCountingData } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';

// --- 1. Sayı Hissi (Visual & Line) ---
export const generateOfflineNumberSense = async (options: GeneratorOptions): Promise<NumberSenseData[]> => {
    const { worksheetCount, numberRange, difficulty } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const exercises: NumberSenseData['exercises'] = [];
        const max = difficulty === 'Başlangıç' ? 10 : (difficulty === 'Orta' ? 20 : 100);
        const step = difficulty === 'Başlangıç' ? 1 : (difficulty === 'Orta' ? 2 : 5);
        
        const start = getRandomInt(0, max - (step * 5));
        const sequence = Array.from({length: 6}, (_, i) => start + i * step);
        const hiddenIdx = getRandomInt(1, 4);
        const target = sequence[hiddenIdx];
        
        exercises.push({ 
            type: 'missing', 
            values: [...sequence], 
            target: target, 
            visualType: 'number-line-advanced',
            step: step
        });

        if (max <= 20) {
            const c1 = getRandomInt(1, 10);
            let c2 = getRandomInt(1, 10);
            while(c1===c2) c2 = getRandomInt(1, 10);
            exercises.push({ type: 'comparison', values: [c1, c2], target: Math.max(c1, c2), visualType: 'ten-frame' });
        } else {
             const c1 = getRandomInt(10, 50);
             let c2 = getRandomInt(10, 50);
             exercises.push({ type: 'comparison', values: [c1, c2], target: Math.max(c1, c2), visualType: 'blocks' });
        }
        
        return {
            title: `Sayı Hissi ve Tahmin (${difficulty})`,
            instruction: 'Sayı doğrusundaki eksik sayıyı bul ve görsellerdeki miktarları karşılaştır.',
            pedagogicalNote: 'Sayısal aralıklar, ritmik sayma ve görsel miktar tahmini becerilerini geliştirir.',
            imagePrompt: 'Number line illustration',
            layout: 'visual',
            exercises
        };
    });
};

// --- 2. Paralarımız (Money Counting) - YENİ EKLENDİ ---
export const generateOfflineMoneyCounting = async (options: GeneratorOptions): Promise<MoneyCountingData[]> => {
    const { worksheetCount, difficulty } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const puzzles = [];
        const count = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 4 : 6);

        for (let i = 0; i < count; i++) {
            const notePool = [5, 10, 20, 50];
            const coinPool = [1];
            
            const selectedNotes = getRandomItems(notePool, difficulty === 'Başlangıç' ? 1 : 2);
            const notes = selectedNotes.map(v => ({ value: v, count: getRandomInt(1, 2) }));
            const coins = [{ value: 1, count: getRandomInt(1, 5) }];

            const total = notes.reduce((acc, n) => acc + (n.value * n.count), 0) + 
                          coins.reduce((acc, c) => acc + (c.value * c.count), 0);

            const distractors = new Set<number>();
            while(distractors.size < 3) {
                const d = total + getRandomInt(-10, 10);
                if (d > 0 && d !== total) distractors.add(d);
            }

            puzzles.push({
                notes,
                coins,
                question: "Toplam miktar ne kadardır?",
                options: shuffle([total.toString(), ...Array.from(distractors).map(d => d.toString())]),
                answer: total.toString()
            });
        }

        return {
            title: "Paralarımız",
            instruction: "Görseldeki kağıt ve madeni paraların toplam değerini hesaplayıp doğru seçeneği işaretleyin.",
            pedagogicalNote: "Günlük yaşam matematiği, para tanıma ve toplama becerilerini destekler.",
            puzzles
        };
    });
};

// --- 3. Görsel Aritmetik ---
export const generateOfflineVisualArithmetic = async (options: GeneratorOptions): Promise<VisualArithmeticData[]> => {
    const { worksheetCount, operationType, visualStyle, numberRange } = options;
    let limit = numberRange === '1-20' ? 20 : (numberRange === '1-50' ? 50 : 10);
    let op = operationType === 'sub' ? '-' : (operationType === 'mult' ? 'x' : '+');
    const style = visualStyle || 'objects';

    return Array.from({ length: worksheetCount }, () => ({
        title: 'Görsel Aritmetik',
        instruction: 'Görselleri kullanarak işlemleri tamamlayın.',
        pedagogicalNote: 'Somutlaştırma (CRA) modeli ile işlem becerisini geliştirir.',
        layout: 'visual',
        problems: Array.from({ length: 6 }, () => {
            let n1 = getRandomInt(1, limit / 2), n2 = getRandomInt(1, limit / 2);
            if (op === '-') { n1 = getRandomInt(limit/2, limit); n2 = getRandomInt(1, n1); }
            return {
                num1: n1, num2: n2, operator: op, answer: op === '+' ? n1+n2 : (op === '-' ? n1-n2 : n1*n2),
                visualType: style as VisualMathType
            };
        })
    }));
};

// --- 4. Matematik Hafıza Kartları ---
export const generateOfflineMathMemoryCards = async (options: GeneratorOptions): Promise<MathMemoryCardsData[]> => {
    const { worksheetCount, difficulty, itemCount, variant, selectedOperations, visualStyle } = options;
    const count = itemCount || 16;
    const pairCount = Math.floor(count / 2);
    
    return Array.from({ length: worksheetCount }, () => {
        const cards: MathMemoryCard[] = [];
        const limit = difficulty === 'Başlangıç' ? 10 : (difficulty === 'Orta' ? 20 : 100);

        for (let i = 0; i < pairCount; i++) {
            const pairId = `pair-${i}-${Date.now()}`;
            const op = (selectedOperations && selectedOperations.length > 0) ? selectedOperations[getRandomInt(0, selectedOperations.length - 1)] : 'add';
            let n1 = getRandomInt(1, limit/2), n2 = getRandomInt(1, limit/2), ans = n1+n2, symbol = '+';
            
            if (op === 'sub') { n1 = getRandomInt(limit/2, limit); n2 = getRandomInt(1, n1); ans = n1 - n2; symbol = '-'; }
            
            cards.push({ id: `c-${i}a`, pairId, type: 'operation', content: `${n1} ${symbol} ${n2}`, numValue: ans });
            cards.push({ id: `c-${i}b`, pairId, type: 'number', content: ans.toString(), numValue: ans });
        }

        return {
            title: "Matematik Hafıza Atölyesi",
            instruction: "Kartları kesin ve eşlerini bulmaya çalışın.",
            pedagogicalNote: "Görsel bellek ve işlem akıcılığını birleştirir.",
            cards: shuffle(cards),
            settings: { gridCols: 4, cardCount: count, difficulty, variant: variant as any || 'op-res' }
        };
    });
};
