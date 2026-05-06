
import { GeneratorOptions, MoneyCountingData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

export const generateOfflineMoneyCounting = async (options: GeneratorOptions): Promise<MoneyCountingData[]> => {
    const { worksheetCount, difficulty, itemCount = 8, variant = 'Karışık', numberRange = '1-100' } = options;
    const results: MoneyCountingData[] = [];

    // Parse max amount
    let maxTotal = 100;
    if (numberRange === '1-20') maxTotal = 20;
    else if (numberRange === '1-500') maxTotal = 500;

    const allNotes = [200, 100, 50, 20, 10, 5];
    const allCoins = [1, 0.5, 0.25, 0.1, 0.05];

    for (let p = 0; p < worksheetCount; p++) {
        const puzzles = Array.from({ length: itemCount }, () => {
            const selectedNotes: { value: number; count: number }[] = [];
            const selectedCoins: { value: number; count: number }[] = [];
            let total = 0;

            const useNotes = variant === 'Sadece Kağıt' || variant === 'Karışık';
            const useCoins = variant === 'Sadece Madeni' || variant === 'Karışık';

            // Filter available notes/coins to not exceed maxTotal quickly
            const availableNotes = allNotes.filter(n => n <= maxTotal);
            
            if (useNotes) {
                const noteCount = difficulty === 'Başlangıç' ? 1 : (difficulty === 'Orta' ? 2 : 3);
                for (let i = 0; i < noteCount; i++) {
                    if (availableNotes.length === 0) break;
                    const val = availableNotes[getRandomInt(0, availableNotes.length - 1)];
                    const count = getRandomInt(1, 2); // Less count per note for compact UI
                    selectedNotes.push({ value: val, count });
                    total += val * count;
                }
            }

            if (useCoins && (total < maxTotal || !useNotes)) {
                const coinGroupCount = difficulty === 'Başlangıç' ? 1 : (difficulty === 'Orta' ? 2 : 3);
                for (let i = 0; i < coinGroupCount; i++) {
                    const val = allCoins[getRandomInt(0, allCoins.length - 1)];
                    const count = getRandomInt(1, 3);
                    selectedCoins.push({ value: val, count });
                    total += val * count;
                }
            }

            // Fallback if empty
            if (selectedNotes.length === 0 && selectedCoins.length === 0) {
                selectedNotes.push({ value: 10, count: 1 });
                total = 10;
            }

            const formattedTotal = total.toFixed(2);
            
            // Distractors logic
            let distractors = new Set<string>();
            while (distractors.size < 3) {
                const modifier = getRandomInt(1, 3) * (Math.random() > 0.5 ? 1 : -1) * (useCoins ? 0.5 : 5);
                let d = total + modifier;
                if (d <= 0) d = total + 5;
                if (d !== total) distractors.add(`${d.toFixed(2)} TL`);
            }

            return {
                notes: selectedNotes,
                coins: selectedCoins,
                question: "Cüzdandaki toplam para ne kadar?",
                options: shuffle([
                    `${formattedTotal} TL`,
                    ...Array.from(distractors)
                ]),
                answer: `${formattedTotal} TL`
            };
        });

        results.push({
            title: "Paralarımız Atölyesi",
            instruction: "Cüzdandaki madeni ve kağıt paraları sayarak toplam miktarı bulun.",
            pedagogicalNote: "Günlük yaşam becerilerini destekler, zihinden toplama ve ondalık sayıları kavramaya yardımcı olur.",
            puzzles
        });
    }
    return results;
};
