
import { GeneratorOptions, NumberPathLogicData, NumberLogicRiddleData, MathPuzzleData } from '../../types';
import { shuffle, getRandomInt, getRandomItems } from './helpers';

/**
 * Matematik Bulmacaları (Meyve Denklemleri) Yerel Üretici
 */
export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { worksheetCount, _difficulty, itemCount = 2 } = options as Record<string, unknown>;
    const pages: MathPuzzleData[] = [];

    const wc = worksheetCount as number || 0;
    const ic = itemCount as number || 2;

    const objects = [
        { name: 'Elma', prompt: 'apple' }, { name: 'Armut', prompt: 'pear' }, 
        { name: 'Muz', prompt: 'banana' }, { name: 'Çilek', prompt: 'strawberry' },
        { name: 'Karpuz', prompt: 'watermelon' }, { name: 'Portakal', prompt: 'orange' }
    ];

    for (let p = 0; p < wc; p++) {
        const puzzles = [];
        for (let i = 0; i < ic; i++) {
            const selectedObjs = getRandomItems(objects, 3);
            
            // Generate values that ensure positive results and interesting puzzles
            const val1 = getRandomInt(5, 15);
            const val2 = getRandomInt(2, val1 - 1); // Ensure val1 > val2 for subtraction
            const val3 = getRandomInt(1, 10);

            puzzles.push({
                id: `puzzle-${i}`,
                objects: [
                    { name: selectedObjs[0].name, value: val1, imagePrompt: selectedObjs[0].prompt },
                    { name: selectedObjs[1].name, value: val2, imagePrompt: selectedObjs[1].prompt },
                    { name: selectedObjs[2].name, value: val3, imagePrompt: selectedObjs[2].prompt }
                ],
                equations: [
                    {
                        leftSide: [{ objectName: selectedObjs[0].name, multiplier: 3 }],
                        operator: '+',
                        rightSide: val1 * 3
                    },
                    {
                        leftSide: [
                            { objectName: selectedObjs[0].name, multiplier: 1 },
                            { objectName: selectedObjs[1].name, multiplier: 2 }
                        ],
                        operator: '+',
                        rightSide: val1 + (val2 * 2)
                    },
                    {
                        leftSide: [
                            { objectName: selectedObjs[1].name, multiplier: 1 },
                            { objectName: selectedObjs[2].name, multiplier: 1 }
                        ],
                        operator: '-',
                        rightSide: val2 - val3
                    }
                ],
                // More complex final question using combinations of discovered values
                finalQuestion: `${selectedObjs[0].name} + ${selectedObjs[1].name} - ${selectedObjs[2].name} = ?`,
                answer: ((val1 + val2) - val3).toString()
            });
        }

        pages.push({
            title: "Matematiksel Mantık Bulmacası",
            instruction: "Tablodaki nesnelerin sayısal değerlerini denklemleri çözerek bul ve son işlemi tamamla!",
            pedagogicalNote: "Bu çalışma, cebirsel düşüncenin temelini oluşturan sembolik temsil ve denklem çözme becerilerini geliştirir.",
            puzzles
        });
    }
    return pages;
};

/**
 * Sayısal Mantık Bilmeceleri (Gizemli Sayılar) Yerel Üretici
 */
export const generateOfflineNumberLogicRiddles = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { worksheetCount, numberRange = '1-50', itemCount = 6, gridSize = 3, _difficulty } = options as Record<string, unknown>;
    const pages: NumberLogicRiddleData[] = [];

    let [min, max] = (numberRange as string).split('-').map(Number);
    if (isNaN(min)) min = 1; if (isNaN(max)) max = 50;

    for (let p = 0; p < ((worksheetCount as number) || 0); p++) {
        const puzzles = [];
        let total = 0;

        for (let i = 0; i < ((itemCount as number) || 0); i++) {
            const target = getRandomInt(min, max);
            total += target;
            
            const tens = Math.floor(target / 10);
            const units = target % 10;
            const sum = tens + units;
            
            const pool = [
                { text: `Ben bir ${target % 2 === 0 ? 'ÇİFT' : 'TEK'} sayıyım.`, icon: 'fa-binary', type: 'parity' },
                { text: `Rakamlarımın toplamı ${sum}'dir.`, icon: 'fa-plus', type: 'digits' },
                { text: target > 25 ? "25'ten büyüğüm." : "25'ten küçüğüm.", icon: 'fa-arrows-left-right', type: 'comparison' },
                { text: `Onlar basamağım ${tens % 2 === 0 ? 'ÇİFT' : 'TEK'} bir rakamdır.`, icon: 'fa-input-numeric', type: 'digits' },
                { text: `Birler basamağım ${units % 2 === 0 ? 'ÇİFT' : 'TEK'} bir rakamdır.`, icon: 'fa-fingerprint', type: 'digits' },
                { text: `${target % 5 === 0 ? "5'in katıyım." : "5'e tam bölünmem."}`, icon: 'fa-divide', type: 'arithmetic' },
                { text: `Rakamlarımın çarpımı ${tens * units}'dir.`, icon: 'fa-xmark', type: 'arithmetic' },
                { text: `Birler basamağım ${units}'dir.`, icon: 'fa-hashtag', type: 'digits' }
            ];

            const selectedHints = shuffle(pool).slice(0, (gridSize as number) || 3);
            while(selectedHints.length < ((gridSize as number) || 3)) {
                selectedHints.push({ text: `Ben ${target} sayısına yakın bir yerdeyim.`, icon: 'fa-location-dot', type: 'arithmetic' as any });
            }

            const distractors = new Set<string>();
            while(distractors.size < 3) {
                const d = getRandomInt(min, max);
                if (d !== target) distractors.add(String(d));
            }

            puzzles.push({
                id: `puzzle-${i}`,
                riddle: selectedHints.map(h => h.text).join(' '),
                riddleParts: selectedHints as any,
                boxes: Array.from({length: 5}, () => [getRandomInt(min, max), getRandomInt(min, max)]),
                visualDistraction: Array.from({length: 6}, () => getRandomInt(min, max)),
                options: shuffle([String(target), ...Array.from(distractors)]),
                answer: String(target),
                answerValue: target
            });
        }

        pages.push({
            title: "Sayı Dedektifi: Gizemli Sayılar",
            instruction: "İpuçlarını incele, tüm şartları sağlayan tek sayıyı bul!",
            sumTarget: total,
            puzzles
        });
    }
    return pages;
};

export const generateOfflineNumberPathLogic = async (options: GeneratorOptions): Promise<NumberPathLogicData[]> => {
    const { worksheetCount, _difficulty, codeLength = 4, itemCount = 14 } = options as Record<string, unknown>;
    const pages: NumberPathLogicData[] = [];
    const SYMBOLS = ['circle', 'square', 'triangle', 'hexagon', 'star'];
    const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    for (let p = 0; p < ((worksheetCount as number) || 0); p++) {
        const legend = SYMBOLS.map((s, i) => {
            const operations = ['+', '-', '+', '*'];
            const op = operations[i % operations.length];
            const value = op === '*' ? getRandomInt(2, 4) : getRandomInt(2, 8);
            return { symbol: s, operation: op, value, color: COLORS[i] };
        });
        const chains = Array.from({ length: (itemCount as number) || 14 }, () => {
            const startNumber = getRandomInt(2, 10);
            const steps = [];
            let currentVal = startNumber;
            const stepsCount = getRandomInt(3, 5);
            for (let s = 0; s < stepsCount; s++) {
                const leg = legend[getRandomInt(0, legend.length - 1)];
                let stepVal = currentVal;
                if (leg.operation === '+') stepVal += leg.value;
                else if (leg.operation === '-') stepVal -= leg.value;
                else if (leg.operation === '*') stepVal *= leg.value;
                
                if (stepVal < 0) {
                    stepVal = currentVal + leg.value;
                    steps.push({ symbol: leg.symbol, expectedValue: stepVal, fallbackOperation: '+' });
                } else {
                    steps.push({ symbol: leg.symbol, expectedValue: stepVal });
                }
                currentVal = stepVal;
            }
            return { startNumber, steps };
        });
        pages.push({ 
            title: "Ultra Sembolik İşlem Zinciri", 
            instruction: "Sembollerin kurallarını keşfet ve işlem zincirlerini adım adım çözerek sonuca ulaş.", 
            pedagogicalNote: "Çok adımlı sembolik işlemler, çalışma belleğini ve ardışık işlem becerilerini güçlendirir. Zenginleştirilmiş kombinasyonlar zihinsel esnekliği artırır.",
            legend, 
            chains 
        });
    }
    return pages;
};
