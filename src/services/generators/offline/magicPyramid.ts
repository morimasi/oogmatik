import { MagicPyramidData, GeneratorOptions } from '../../../types';

export const generateOfflineMagicPyramid = async (options: GeneratorOptions): Promise<MagicPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const activities: MagicPyramidData[] = [];

    let layers = 5;
    if (difficulty === 'Başlangıç') layers = 4;
    if (difficulty === 'Zor' || difficulty === 'Uzman') layers = 6;

    // A4'e sığacak şekilde, katman sayısına göre sayfa başına piramit sayısını belirliyoruz.
    const pyramidsPerSheet = layers === 6 ? 4 : 6;

    for (let c = 0; c < worksheetCount; c++) {
        const step = Math.floor(Math.random() * 4) + 2;
        const pagePyramids = [];

        for (let p = 0; p < pyramidsPerSheet; p++) {
            const apex = Math.floor(Math.random() * 5) + step;

            const grid: number[][] = [];
            const correctPath: number[] = [];
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
                    } else {
                        let distractor;
                        do {
                            distractor = val + (Math.floor(Math.random() * 5) - 2) * step;
                            if (distractor < 1) distractor = val + step;
                        } while (distractor === val);
                        rowArr.push(distractor);
                    }
                }
            }
            pagePyramids.push({
                layers,
                apex,
                step,
                grid,
                correctPath
            });
        }

        activities.push({
            title: `${step}'er Sayma Piramidi`,
            instruction: `Yukarıdan aşağıya doğru ritmik sayarak in ve doğru yolu bul.`,
            instructionPrefix: `${step}'er ritmik sayma`,
            pyramids: pagePyramids
        });
    }

    return activities;
};
