
import { GeneratorOptions, NumberPathLogicData, NumberLogicRiddleData, MathPuzzleData } from '../../types';
import { shuffle, getRandomInt, getRandomItems } from './helpers';

/**
 * Matematik Bulmacaları (Meyve Denklemleri) Yerel Üretici
 */
export const generateOfflineMathPuzzle = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
    const { worksheetCount = 1 } = options;
    const itemCount = (options.itemCount || 6) as number;
    const operationType = (options.operationType || 'mixed') as string;
    const numberRange = (options.numberRange || '1-20') as string;
    const puzzleType = (options.puzzleType || 'visual') as string;
    const wc = worksheetCount as number || 1;
    const ic = itemCount as number || 6;

    const pages: MathPuzzleData[] = [];

    const objects = [
        { name: 'Elma', prompt: 'apple' }, { name: 'Armut', prompt: 'pear' },
        { name: 'Muz', prompt: 'banana' }, { name: 'Çilek', prompt: 'strawberry' },
        { name: 'Karpuz', prompt: 'watermelon' }, { name: 'Portakal', prompt: 'orange' },
        { name: 'Üzüm', prompt: 'grape' }, { name: 'Kiraz', prompt: 'cherry' },
        { name: 'Limon', prompt: 'lemon' }, { name: 'Şeftali', prompt: 'peach' }
    ];

    let [rangeMin, rangeMax] = numberRange.split('-').map(Number);
    if (isNaN(rangeMin)) rangeMin = 1;
    if (isNaN(rangeMax)) rangeMax = 20;

    const pickValues = (opType: string) => {
        let a: number, b: number, c: number;
        switch (opType) {
            case 'add':
                a = getRandomInt(rangeMin, rangeMax / 2);
                b = getRandomInt(rangeMin, rangeMax / 2);
                c = getRandomInt(rangeMin, rangeMax / 2);
                break;
            case 'mult':
                a = getRandomInt(2, Math.min(10, rangeMax / 2));
                b = getRandomInt(2, Math.min(10, rangeMax / 2));
                c = getRandomInt(2, Math.min(10, rangeMax / 2));
                break;
            case 'expert':
                a = getRandomInt(rangeMin, rangeMax);
                b = getRandomInt(rangeMin, rangeMax);
                c = getRandomInt(rangeMin, rangeMax);
                break;
            default:
                a = getRandomInt(rangeMin, rangeMax / 2);
                b = getRandomInt(rangeMin, rangeMax / 2);
                c = getRandomInt(rangeMin, rangeMax / 2);
        }
        return { a: Math.max(a, 1), b: Math.max(b, 1), c: Math.max(c, 1) };
    };

    const makeObjects = (objs: typeof objects, vals: { a: number; b: number; c: number }) => [
        { name: objs[0].name, value: vals.a, imagePrompt: objs[0].prompt },
        { name: objs[1].name, value: vals.b, imagePrompt: objs[1].prompt },
        { name: objs[2].name, value: vals.c, imagePrompt: objs[2].prompt }
    ];

    const makeAddEquations = (objs: typeof objects, vals: { a: number; b: number; c: number }) => [
        {
            leftSide: [{ objectName: objs[0].name, multiplier: 2 }],
            operator: '+',
            rightSide: vals.a * 2
        },
        {
            leftSide: [{ objectName: objs[1].name, multiplier: 3 }],
            operator: '+',
            rightSide: vals.b * 3
        },
        {
            leftSide: [
                { objectName: objs[0].name, multiplier: 1 },
                { objectName: objs[1].name, multiplier: 1 },
                { objectName: objs[2].name, multiplier: 1 }
            ],
            operator: '+',
            rightSide: vals.a + vals.b + vals.c
        }
    ];

    const makeMixedEquations = (objs: typeof objects, vals: { a: number; b: number; c: number }) => {
        const eqs: any[] = [];
        const { a, b, c } = vals;
        const useAdd = Math.random() > 0.5;

        eqs.push({
            leftSide: [{ objectName: objs[0].name, multiplier: 2 }],
            operator: '+',
            rightSide: a * 2
        });

        if (useAdd) {
            eqs.push({
                leftSide: [
                    { objectName: objs[0].name, multiplier: 1 },
                    { objectName: objs[1].name, multiplier: 2 }
                ],
                operator: '+',
                rightSide: a + b * 2
            });
            const [bigger, smaller] = b >= c ? [objs[1].name, objs[2].name] : [objs[2].name, objs[1].name];
            const diff = Math.abs(b - c);
            eqs.push({
                leftSide: [
                    { objectName: bigger, multiplier: 1 },
                    { objectName: smaller, multiplier: 1 }
                ],
                operator: '-',
                rightSide: diff
            });
        } else {
            eqs.push({
                leftSide: [
                    { objectName: objs[0].name, multiplier: 1 },
                    { objectName: objs[1].name, multiplier: 1 }
                ],
                operator: '+',
                rightSide: a + b
            });
            eqs.push({
                leftSide: [
                    { objectName: objs[1].name, multiplier: 1 },
                    { objectName: objs[2].name, multiplier: 1 }
                ],
                operator: '+',
                rightSide: b + c
            });
        }
        return eqs;
    };

    const makeFinalQuestion = (objs: typeof objects, vals: { a: number; b: number; c: number }, opType: string): { question: string; answer: number } => {
        const { a, b, c } = vals;
        const patterns: { question: string; answer: number }[] = [
            { question: `${objs[0].name} + ${objs[1].name} + ${objs[2].name} = ?`, answer: a + b + c },
            { question: `${objs[0].name} + ${objs[1].name} - ${objs[2].name} = ?`, answer: Math.max(a + b - c, 1) },
            { question: `${objs[0].name} × 2 + ${objs[1].name} = ?`, answer: a * 2 + b },
            { question: `${objs[0].name} + ${objs[1].name} × 2 = ?`, answer: a + b * 2 }
        ];

        if (opType === 'add') return patterns[0];
        if (opType === 'mult') return { question: `${objs[0].name} × ${objs[1].name} = ?`, answer: a * b };

        return patterns[getRandomInt(0, patterns.length - 1)];
    };

    for (let p = 0; p < wc; p++) {
        const puzzles = [];
        for (let i = 0; i < ic; i++) {
            const selectedObjs = getRandomItems(objects, 3);
            const vals = pickValues(operationType);
            const eqs = operationType === 'add' ? makeAddEquations(selectedObjs, vals)
                : makeMixedEquations(selectedObjs, vals);
            const { question, answer } = makeFinalQuestion(selectedObjs, vals, operationType);
            const puzzleObjects = makeObjects(selectedObjs, vals);

            puzzles.push({
                id: `puzzle-${i}`,
                objects: puzzleObjects,
                equations: eqs,
                finalQuestion: question,
                answer: answer.toString()
            });
        }

        pages.push({
            title: "Matematiksel Mantık Bulmacası",
            instruction: "Tablodaki nesnelerin sayısal değerlerini denklemleri çözerek bul ve son işlemi tamamla!",
            puzzles
        });
    }
    return pages;
};

/**
 * Sayısal Mantık Bilmeceleri (Gizemli Sayılar) Yerel Üretici
 */
export const generateOfflineNumberLogicRiddles = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const customSettings = (options as any).numberLogicRiddles || {};
    const {
        worksheetCount = 1,
        numberRange = '1-50',
        itemCount = customSettings.itemCount || 6,
        gridSize = customSettings.gridSize || 3,
        _difficulty
    } = options as Record<string, unknown>;

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
            while (selectedHints.length < ((gridSize as number) || 3)) {
                selectedHints.push({ text: `Ben ${target} sayısına yakın bir yerdeyim.`, icon: 'fa-location-dot', type: 'arithmetic' as any });
            }

            const distractors = new Set<string>();
            while (distractors.size < 3) {
                const d = getRandomInt(min, max);
                if (d !== target) distractors.add(String(d));
            }

            puzzles.push({
                id: `puzzle-${i}`,
                riddle: selectedHints.map(h => h.text).join(' '),
                riddleParts: selectedHints as any,
                boxes: Array.from({ length: 5 }, () => [getRandomInt(min, max), getRandomInt(min, max)]),
                visualDistraction: customSettings.showVisualDistraction !== false ? Array.from({ length: 8 }, () => getRandomInt(min, max)) : [],
                options: shuffle([String(target), ...Array.from(distractors)]),
                answer: String(target),
                answerValue: target
            });
        }

        pages.push({
            title: "Sayı Dedektifi: Gizemli Sayılar",
            instruction: "İpuçlarını incele, tüm şartları sağlayan tek sayıyı bul!",
            sumTarget: total,
            puzzles,
            settings: {
                difficulty: options.difficulty,
                itemCount: itemCount as number,
                gridSize: gridSize as number,
                showIcons: customSettings.showIcons !== false,
                showVisualDistraction: customSettings.showVisualDistraction !== false,
                aestheticMode: customSettings.aestheticMode || 'standard'
            }
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
            legend,
            chains
        });
    }
    return pages;
};
