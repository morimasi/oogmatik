
import { GeneratorOptions, NumberSenseData, VisualArithmeticData, MathMemoryCardsData, MathMemoryCard, MoneyCountingData, ClockReadingData } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';

/**
 * Saat Okuma Yerel Üretici (Hızlı Mod)
 */
export const generateOfflineClockReading = async (options: GeneratorOptions): Promise<ClockReadingData[]> => {
    const { worksheetCount, difficulty } = options;
    const pages: ClockReadingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const clocks = [];
        const count = difficulty === 'Başlangıç' ? 6 : 9;

        for (let i = 0; i < count; i++) {
            const hour = getRandomInt(1, 12);
            const minute = (difficulty === 'Başlangıç') ? (Math.random() > 0.5 ? 0 : 30) : getRandomInt(0, 59);
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            const distractors = new Set<string>();
            while(distractors.size < 3) {
                const h = getRandomInt(1, 12);
                const m = getRandomInt(0, 59);
                const d = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                if (d !== timeString) distractors.add(d);
            }

            clocks.push({
                hour,
                minute,
                timeString,
                options: shuffle([timeString, ...Array.from(distractors)]),
                problemText: difficulty === 'Zor' ? "15 dakika sonra saat kaç olur?" : undefined
            });
        }

        pages.push({
            title: "Saat Okuma Atölyesi",
            instruction: "Analog saatlerde gösterilen zamanı dijital olarak bulun veya doğru şıkkı işaretleyin.",
            pedagogicalNote: "Zaman algısı, analog-dijital dönüşüm ve ritmik sayma becerilerini destekler.",
            clocks,
            settings: {
                showNumbers: true,
                showTicks: true,
                showHands: true
            }
        });
    }
    return pages;
};

export const generateOfflineNumberSense = async (options: GeneratorOptions): Promise<NumberSenseData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const exercises: any[] = [];
        const max = difficulty === 'Başlangıç' ? 10 : 20;
        const start = getRandomInt(0, 5);
        exercises.push({ type: 'missing', values: [start, start+1, start+2, start+3], target: start+2, visualType: 'number-line-advanced' });
        return { title: `Sayı Hissi (${difficulty})`, instruction: 'Eksiği bul.', exercises };
    });
};

export const generateOfflineMoneyCounting = async (options: GeneratorOptions): Promise<MoneyCountingData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: "Paralarımız",
        instruction: "Toplamı hesapla.",
        puzzles: [{ notes: [{value: 5, count: 2}], coins: [{value: 1, count: 3}], question: "Kaç TL?", options: ["13", "10", "15"], answer: "13" }]
    }));
};

export const generateOfflineVisualArithmetic = async (options: GeneratorOptions): Promise<VisualArithmeticData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: 'Görsel Aritmetik',
        instruction: 'İşlemleri tamamla.',
        problems: [{ num1: 5, num2: 3, operator: '+', answer: 8, visualType: 'ten-frame' }]
    }));
};

export const generateOfflineMathMemoryCards = async (options: GeneratorOptions): Promise<MathMemoryCardsData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: "Matematik Hafıza Kartları",
        instruction: "Eşlerini bul.",
        cards: [{ id: '1', pairId: 'p1', type: 'operation', content: '2+2', numValue: 4 }, { id: '2', pairId: 'p1', type: 'number', content: '4', numValue: 4 }]
    }));
};
