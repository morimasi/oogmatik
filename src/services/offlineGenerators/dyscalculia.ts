
import { GeneratorOptions, NumberSenseData, VisualArithmeticData, MathMemoryCardsData, MathMemoryCard, MoneyCountingData, ClockReadingData } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';

/**
 * Saat Okuma Yerel Üretici (Hızlı Mod)
 */
export const generateOfflineClockReading = async (options: GeneratorOptions): Promise<ClockReadingData[]> => {
    // Moved to clockReading.ts to avoid duplication.
    // Ensure we delegate to that function or remove the duplicate entirely if unused.
    const { generateOfflineClockReading: realGenerator } = await import('./clockReading');
    return realGenerator(options);
};
        });

        results.push({
            title: "Saat Okuma Atölyesi",
            instruction: (variant as any) === 'analog-to-digital'
                ? "Analog saatlerde gösterilen zamanı altındaki dijital kutucuklara yazın."
                : "Verilen dijital zamana göre saatin akrep ve yelkovanını çizin.",
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
    // Moved to financialMath.ts
    const { generateOfflineMoneyCounting: realGenerator } = await import('./financialMath');
    return realGenerator(options);
};
        });
        results.push({
            title: "Paralarımız ve Hesaplamalar",
            instruction: "Görsellerdeki kağıt ve madeni paraları toplayarak toplam miktarı bulun.",
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
    const { worksheetCount, difficulty } = options;
    const pages: MathMemoryCardsData[] = [];
    
    for (let p = 0; p < worksheetCount; p++) {
        const cards: MathMemoryCard[] = [];
        const pairCount = difficulty === 'Başlangıç' ? 12 : 16; // 24 or 32 cards
        
        const usedNumbers = new Set<number>();
        
        for (let i = 0; i < pairCount; i++) {
            let target = getRandomInt(5, 20);
            while(usedNumbers.has(target)) {
                target = getRandomInt(5, 30);
            }
            usedNumbers.add(target);
            
            const pairId = `p${i}`;
            const types = ['operation', 'visual', 'text'];
            const rightType = types[getRandomInt(0, types.length - 1)];
            
            cards.push({ id: `c${i}a`, pairId, type: 'number', content: String(target), numValue: target });
            
            if (rightType === 'operation') {
                const addend = getRandomInt(1, target - 1);
                cards.push({ id: `c${i}b`, pairId, type: 'operation', content: `${addend} + ${target - addend}`, numValue: target });
            } else if (rightType === 'visual') {
                const vTypes = ['ten-frame', 'dice', 'blocks'];
                cards.push({ id: `c${i}b`, pairId, type: 'visual', content: '', numValue: target, visualType: vTypes[getRandomInt(0, vTypes.length - 1)] as any });
            } else if (rightType === 'text') {
                const words = ['Sıfır','Bir','İki','Üç','Dört','Beş','Altı','Yedi','Sekiz','Dokuz','On',
                'On Bir','On İki','On Üç','On Dört','On Beş','On Altı','On Yedi','On Sekiz','On Dokuz','Yirmi',
                'Yirmi Bir', 'Yirmi İki', 'Yirmi Üç', 'Yirmi Dört', 'Yirmi Beş', 'Yirmi Altı', 'Yirmi Yedi', 'Yirmi Sekiz', 'Yirmi Dokuz', 'Otuz'];
                cards.push({ id: `c${i}b`, pairId, type: 'text', content: words[target] || String(target), numValue: target });
            }
        }
        
        pages.push({
            title: "Gelişmiş Matematik Hafıza Kartları",
            instruction: "Kartları dış çerçevelerinden kesin. Ters çevirip eşlerini bularak hafıza oyununu oynayın.",
            pedagogicalNote: "Çoklu temsil (sayı, görsel, işlem, metin) eşleştirmesi matematiksel esnekliği ve çalışma belleğini güçlendirir.",
            settings: { showNumbers: true, difficulty },
            cards: shuffle(cards)
        });
    }
    return pages;
};
