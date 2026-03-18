
import { GeneratorOptions, NumberPathLogicData, NumberLogicRiddleData, MathPuzzleData } from '../../types';
import { shuffle, getRandomInt, getRandomItems } from './helpers';

/**
 * Matematik Bulmacaları (Meyve Denklemleri) Yerel Üretici
 */
export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { worksheetCount, difficulty, itemCount = 2 } = options;
    const pages: MathPuzzleData[] = [];

    const objects = [
        { name: 'Elma', prompt: 'apple' }, { name: 'Armut', prompt: 'pear' }, 
        { name: 'Muz', prompt: 'banana' }, { name: 'Çilek', prompt: 'strawberry' },
        { name: 'Karpuz', prompt: 'watermelon' }, { name: 'Portakal', prompt: 'orange' }
    ];

    for (let p = 0; p < worksheetCount; p++) {
        const puzzles = [];
        for (let i = 0; i < itemCount; i++) {
            const selectedObjs = getRandomItems(objects, 3);
            const val1 = getRandomInt(2, 10);
            const val2 = getRandomInt(2, 10);
            const val3 = getRandomInt(2, 10);

            puzzles.push({
                id: `puzzle-${i}`,
                objects: [
                    { name: selectedObjs[0].name, value: val1, imagePrompt: selectedObjs[0].prompt },
                    { name: selectedObjs[1].name, value: val2, imagePrompt: selectedObjs[1].prompt },
                    { name: selectedObjs[2].name, value: val3, imagePrompt: selectedObjs[2].prompt }
                ],
                equations: [
                    {
                        leftSide: [{ objectName: selectedObjs[0].name, multiplier: 2 }],
                        operator: '+',
                        rightSide: val1 * 2
                    },
                    {
                        leftSide: [
                            { objectName: selectedObjs[0].name, multiplier: 1 },
                            { objectName: selectedObjs[1].name, multiplier: 1 }
                        ],
                        operator: '+',
                        rightSide: val1 + val2
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
                finalQuestion: `${selectedObjs[0].name} + ${selectedObjs[2].name} = ?`,
                answer: (val1 + val3).toString()
            });
        }

        pages.push({
            title: "Matematiksel Gizem",
            instruction: "Nesnelerin değerlerini denklemlerden bul ve son işlemi çöz!",
            pedagogicalNote: "CRA modeli (Somut-Temsili-Soyut) ile cebirsel düşünme becerisini destekler.",
            puzzles
        });
    }
    return pages;
};

/**
 * Sayısal Mantık Bilmeceleri (Gizemli Sayılar) Yerel Üretici
 */
export const generateOfflineNumberLogicRiddles = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { worksheetCount, numberRange = '1-50', itemCount = 6, gridSize = 3, difficulty } = options;
    const pages: NumberLogicRiddleData[] = [];

    let [min, max] = numberRange.split('-').map(Number);
    if (isNaN(min)) min = 1; if (isNaN(max)) max = 50;

    for (let p = 0; p < worksheetCount; p++) {
        const puzzles = [];
        let total = 0;

        for (let i = 0; i < itemCount; i++) {
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

            let selectedHints = shuffle(pool).slice(0, gridSize);
            while(selectedHints.length < gridSize) {
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
            pedagogicalNote: "Mantıksal eleme ve sayı hissi becerilerini geliştirir.",
            sumTarget: total,
            puzzles
        });
    }
    return pages;
};

export const generateOfflineNumberPathLogic = async (options: GeneratorOptions): Promise<NumberPathLogicData[]> => {
    // ... Mevcut fonksiyon korunuyor
    const { worksheetCount, codeLength = 3, itemCount = 6 } = options;
    const pages: NumberPathLogicData[] = [];
    const SYMBOLS = ['circle', 'square', 'triangle', 'hexagon'];
    const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
    for (let p = 0; p < worksheetCount; p++) {
        const legend = SYMBOLS.map((s, i) => ({ symbol: s, operation: i % 2 === 0 ? '+' : '-', value: getRandomInt(1, 5), color: COLORS[i] }));
        const chains = Array.from({ length: itemCount }, () => {
            const startNumber = getRandomInt(5, 20);
            const steps = [];
            let currentVal = startNumber;
            for (let s = 0; s < codeLength; s++) {
                const leg = legend[getRandomInt(0, legend.length - 1)];
                const stepVal = leg.operation === '+' ? currentVal + leg.value : currentVal - leg.value;
                steps.push({ symbol: leg.symbol, expectedValue: stepVal < 0 ? currentVal + 2 : stepVal });
                currentVal = stepVal < 0 ? currentVal + 2 : stepVal;
            }
            return { startNumber, steps };
        });
        pages.push({ title: "Sembolik İşlem Zinciri", instruction: "Zinciri tamamla.", legend, chains });
    }
    return pages;
};
