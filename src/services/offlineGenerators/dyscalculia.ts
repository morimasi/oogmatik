
import { GeneratorOptions, NumberSenseData, VisualArithmeticData, MathMemoryCardsData, _MathMemoryCard, MoneyCountingData, ClockReadingData } from '../../types';
import { getRandomInt, shuffle, _getRandomItems } from './helpers';

/**
 * Saat Okuma Yerel Üretici (Hızlı Mod)
 */
export const generateOfflineClockReading = async (options: GeneratorOptions): Promise<ClockReadingData[]> => {
    const { worksheetCount, difficulty, variant = 'analog-to-digital' } = options;
    const results: ClockReadingData[] = [];

    for (let p = 0; p < worksheetCount; p++) {
        const clocks = Array.from({ length: 6 }, () => {
            const hour = getRandomInt(1, 12);
            let minute = 0;

            if (difficulty === 'Başlangıç') {
                minute = Math.random() > 0.5 ? 0 : 30;
            } else if (difficulty === 'Orta') {
                minute = [0, 15, 30, 45][getRandomInt(0, 3)];
            } else {
                minute = getRandomInt(0, 11) * 5;
            }

            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const hourWords = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz", "On", "On Bir", "On İki"];
            let verbalTime = `Saat ${hourWords[hour]}`;
            if (minute === 30) verbalTime += " buçuk";
            else if (minute !== 0) verbalTime += ` ${minute} geçiyor`;

            return {
                hour,
                minute,
                timeString,
                verbalTime,
                options: shuffle([timeString, `${(hour % 12) + 1}:15`, `${hour}:45`, `${hour - 1}:30`]).slice(0, 4)
            };
        });

        results.push({
            title: "Saat Okuma Atölyesi",
            instruction: (variant as any) === 'analog-to-digital'
                ? "Analog saatlerde gösterilen zamanı altındaki dijital kutucuklara yazın."
                : "Verilen dijital zamana göre saatin akrep ve yelkovanını çizin.",
            pedagogicalNote: "Zaman algısı, analog-dijital dönüşüm ve ritmik sayma becerilerini destekler.",
            variant: (variant as any),
            clocks,
            settings: {
                showNumbers: true,
                showTicks: true,
                showHands: (variant as any) === 'analog-to-digital',
                showOptions: difficulty === 'Başlangıç',
                difficulty
            }
        });
    }
    return results;
};

export const generateOfflineNumberSense = async (options: GeneratorOptions): Promise<NumberSenseData[]> => {
    const { worksheetCount, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
        const exercises: any[] = [];
        const _max = difficulty === 'Başlangıç' ? 10 : 20;
        const start = getRandomInt(0, 5);
        exercises.push({ type: 'missing', values: [start, start + 1, start + 2, start + 3], target: start + 2, visualType: 'number-line-advanced' });
        return { title: `Sayı Hissi (${difficulty})`, instruction: 'Eksiği bul.', exercises };
    });
};

export const generateOfflineMoneyCounting = async (options: GeneratorOptions): Promise<MoneyCountingData[]> => {
    const { worksheetCount, difficulty } = options;
    const results: MoneyCountingData[] = [];
    const notes = [200, 100, 50, 20, 10, 5];
    const coins = [1, 0.5, 0.25, 0.1, 0.05];

    for (let p = 0; p < worksheetCount; p++) {
        const puzzles = Array.from({ length: 4 }, () => {
            const selectedNotes: { value: number; count: number }[] = [];
            const selectedCoins: { value: number; count: number }[] = [];
            let total = 0;
            const noteCount = difficulty === 'Başlangıç' ? 2 : (difficulty === 'Orta' ? 3 : 5);
            for (let i = 0; i < noteCount; i++) {
                const val = notes[getRandomInt(0, difficulty === 'Başlangıç' ? 3 : 5)];
                const count = getRandomInt(1, 3);
                selectedNotes.push({ value: val, count });
                total += val * count;
            }
            if (difficulty !== 'Başlangıç') {
                for (let i = 0; i < 2; i++) {
                    const val = coins[getRandomInt(0, 2)];
                    const count = getRandomInt(1, 4);
                    selectedCoins.push({ value: val, count });
                    total += val * count;
                }
            }
            const formattedTotal = total.toFixed(2);
            return {
                notes: selectedNotes,
                coins: selectedCoins,
                question: "Cüzdandaki toplam para miktarını bulun.",
                options: shuffle([`${total} TL`, `${(total + 10).toFixed(2)} TL`, `${(total - 5).toFixed(2)} TL`]),
                answer: `${formattedTotal} TL`
            };
        });
        results.push({
            title: "Paralarımız ve Hesaplamalar",
            instruction: "Görsellerdeki kağıt ve madeni paraları toplayarak toplam miktarı bulun.",
            pedagogicalNote: "Finansal okuryazarlık, ondalık sayılarla toplama ve günlük yaşam matematiği.",
            puzzles
        });
    }
    return results;
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
