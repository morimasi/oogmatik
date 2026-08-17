import { MagicPyramidData, GeneratorOptions } from '../../../types';

export const generateOfflineMagicPyramid = async (options: GeneratorOptions): Promise<MagicPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const customSettings = (options as any).magicPyramid || {};
    const activities: MagicPyramidData[] = [];

    const mode: 'rhythmic' | 'addition' | 'multiplication' | 'prime' | 'even_odd' = customSettings.mode || 'rhythmic';
    const showHints = customSettings.showHints ?? true;
    const compactLayout = customSettings.compactLayout ?? true;

    let layers = customSettings.layers || 5;
    if (!customSettings.layers) {
        if (difficulty === 'Başlangıç') layers = 4;
        if (difficulty === 'Zor' || difficulty === 'Uzman') layers = 6;
    }

    // Ultra-compact A4 düzeni: Kâğıtta boşluk bırakmayacak şekilde tam sığdırma
    // 4 katmanlı için 6 piramit, 5 katmanlı için 6 piramit, 6-7 katmanlı için 4 piramit
    const pyramidsPerSheet = layers >= 6 ? 4 : (compactLayout ? 6 : 4);

    const isPrime = (num: number): boolean => {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;
        for (let i = 5; i * i <= num; i += 6) {
            if (num % i === 0 || num % (i + 2) === 0) return false;
        }
        return true;
    };

    for (let c = 0; c < (worksheetCount || 1); c++) {
        const step = customSettings.step || (mode === 'rhythmic' ? Math.floor(Math.random() * 4) + 2 : 1);
        const pagePyramids = [];

        for (let p = 0; p < pyramidsPerSheet; p++) {
            const grid: number[][] = [];
            const correctPath: number[] = [];
            const hints: { row: number; col: number }[] = [];
            let apex = 1;

            if (mode === 'rhythmic') {
                apex = Math.floor(Math.random() * 10) + 1;
                let currentPathIndex = 0;
                let val = apex;

                for (let row = 0; row < layers; row++) {
                    const rowArr: number[] = [];
                    grid.push(rowArr);

                    if (row > 0) {
                        const goRight = Math.random() > 0.5;
                        if (goRight) currentPathIndex++;
                        val += step;
                    }
                    correctPath.push(currentPathIndex);

                    for (let col = 0; col <= row; col++) {
                        if (col === currentPathIndex) {
                            rowArr.push(val);
                            if (showHints && (row === 0 || row === layers - 1 || Math.random() > 0.6)) {
                                hints.push({ row, col });
                            }
                        } else {
                            let distractor;
                            let attempts = 0;
                            do {
                                distractor = val + (Math.floor(Math.random() * 5) - 2) * step;
                                if (distractor < 1) distractor = val + step + attempts;
                                attempts++;
                            } while (distractor === val && attempts < 10);
                            rowArr.push(distractor);
                        }
                    }
                }
            } else if (mode === 'addition') {
                // Toplama Piramidi: Her hücre altındaki iki komşu hücrenin toplamına eşittir (Ters piramit akışı)
                apex = Math.floor(Math.random() * 15) + 5;
                let currentPathIndex = 0;
                let val = apex;

                for (let row = 0; row < layers; row++) {
                    const rowArr: number[] = [];
                    grid.push(rowArr);

                    if (row > 0) {
                        const goRight = Math.random() > 0.5;
                        if (goRight) currentPathIndex++;
                        val += (Math.floor(Math.random() * 5) + 1);
                    }
                    correctPath.push(currentPathIndex);

                    for (let col = 0; col <= row; col++) {
                        if (col === currentPathIndex) {
                            rowArr.push(val);
                            if (showHints && (row === 0 || Math.random() > 0.5)) {
                                hints.push({ row, col });
                            }
                        } else {
                            const distractor = val + Math.floor(Math.random() * 8) + 1;
                            rowArr.push(distractor);
                        }
                    }
                }
            } else if (mode === 'multiplication') {
                // Çarpma / Kat Piramidi
                apex = (Math.floor(Math.random() * 3) + 2);
                let currentPathIndex = 0;
                let val = apex;

                for (let row = 0; row < layers; row++) {
                    const rowArr: number[] = [];
                    grid.push(rowArr);

                    if (row > 0) {
                        const goRight = Math.random() > 0.5;
                        if (goRight) currentPathIndex++;
                        val *= 2; // Her adımda 2 katı
                    }
                    correctPath.push(currentPathIndex);

                    for (let col = 0; col <= row; col++) {
                        if (col === currentPathIndex) {
                            rowArr.push(val);
                            if (showHints && (row === 0 || row === layers - 1)) {
                                hints.push({ row, col });
                            }
                        } else {
                            const distractor = val + (Math.floor(Math.random() * 3) + 1) * 2;
                            rowArr.push(distractor);
                        }
                    }
                }
            } else if (mode === 'prime' || mode === 'even_odd') {
                // Asal Sayı veya Çift/Tek Labirenti
                let currentPathIndex = 0;
                let baseNum = mode === 'prime' ? 2 : (mode === 'even_odd' ? 2 : 1);

                for (let row = 0; row < layers; row++) {
                    const rowArr: number[] = [];
                    grid.push(rowArr);

                    if (row > 0) {
                        const goRight = Math.random() > 0.5;
                        if (goRight) currentPathIndex++;
                    }
                    correctPath.push(currentPathIndex);

                    for (let col = 0; col <= row; col++) {
                        if (col === currentPathIndex) {
                            let correctVal = baseNum + row * 2;
                            if (mode === 'prime') {
                                const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79];
                                correctVal = primes[row % primes.length];
                            }
                            rowArr.push(correctVal);
                            if (row === 0) apex = correctVal;
                        } else {
                            let distractor = baseNum + row * 2 + 1; // Asal olmayan/tek
                            if (mode === 'prime') {
                                const nonPrimes = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30];
                                distractor = nonPrimes[row % nonPrimes.length];
                            }
                            rowArr.push(distractor);
                        }
                    }
                }
            }

            pagePyramids.push({
                layers,
                apex,
                step,
                grid,
                correctPath,
                hints,
                operationType: mode,
            });
        }

        let title = `${step}'er Sayma Piramidi`;
        let instructionPrefix = `${step}'er ritmik sayma`;
        let instruction = "Yukarıdan aşağıya doğru ritmik sayarak in ve doğru yolu bul.";

        if (mode === 'addition') {
            title = 'Toplama Piramidi Labirenti';
            instructionPrefix = 'Toplayarak İlerle';
            instruction = 'Piramitte yukarıdan aşağıya toplayarak ilerle ve doğru çıkışı bul.';
        } else if (mode === 'multiplication') {
            title = 'Çarpma / Kat Piramidi';
            instructionPrefix = 'Katlarını Takip Et';
            instruction = 'Her katmanda katlanarak ilerleyen sayıları takip et.';
        } else if (mode === 'prime') {
            title = 'Asal Sayı Sihirli Piramidi';
            instructionPrefix = 'Asal Sayı Yolu';
            instruction = 'Sadece ASAL SAYILARDAN oluşan yolu takip ederek piramidin tabanına ulaş.';
        } else if (mode === 'even_odd') {
            title = 'Çift Sayı Piramit Labirenti';
            instructionPrefix = 'Çift Sayı Yolu';
            instruction = 'Sadece ÇİFT SAYILARI takip ederek doğru çıkışa ulaş.';
        }

        activities.push({
            title,
            instruction,
            instructionPrefix,
            pyramids: pagePyramids,
            theme: customSettings.theme || 'classic',
            mode,
            showHints,
            compactLayout,
        });
    }

    return activities;
};
