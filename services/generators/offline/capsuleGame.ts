import { NumberCapsuleData } from '../../types/math';

export const generateCapsuleGameActivity = (difficulty: string = 'Makul', count: number = 2): NumberCapsuleData[] => {
    let size = 3;
    if (difficulty === 'Makul') size = 4;
    if (difficulty === 'Zor' || difficulty === 'Çok Zor') size = 5;

    const activities: NumberCapsuleData[] = [];

    for (let c = 0; c < count; c++) {
        // 1. Matris grid oluştur ve sayılarla doldur
        const puzzleGrid: (number | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
        const solutionGrid: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

        // Sadece tek veya sadece çift sayılar stratejisi
        const useOdds = Math.random() > 0.5;
        const baseNumbers = useOdds ? [1, 3, 5, 7, 9] : [2, 4, 6, 8, 10];

        // Matrisi rasgele doldur
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                solutionGrid[i][j] = baseNumbers[Math.floor(Math.random() * baseNumbers.length)];
            }
        }

        // 2. Kapsülleri oluştur (bitişik 1x2 veya 1x3 hücreler)
        const capsules: { id: string, target: number, cells: { x: number, y: number }[] }[] = [];
        const usedCells = new Set<string>();
        let capsId = 1;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (usedCells.has(`${i},${j}`)) continue;

                const cellsInCapsule = [{ x: j, y: i }]; // Note: x is col, y is row
                usedCells.add(`${i},${j}`);

                // Yön seç (sağ veya aşağı)
                const goRight = Math.random() > 0.5;

                if (goRight && j + 1 < size && !usedCells.has(`${i},${j + 1}`)) {
                    cellsInCapsule.push({ x: j + 1, y: i });
                    usedCells.add(`${i},${j + 1}`);
                    // 1x3 şansı
                    if (Math.random() > 0.7 && j + 2 < size && !usedCells.has(`${i},${j + 2}`)) {
                        cellsInCapsule.push({ x: j + 2, y: i });
                        usedCells.add(`${i},${j + 2}`);
                    }
                } else if (!goRight && i + 1 < size && !usedCells.has(`${i + 1},${j}`)) {
                    cellsInCapsule.push({ x: j, y: i + 1 });
                    usedCells.add(`${i + 1},${j}`);
                    // 3x1 şansı
                    if (Math.random() > 0.7 && i + 2 < size && !usedCells.has(`${i + 2},${j}`)) {
                        cellsInCapsule.push({ x: j, y: i + 2 });
                        usedCells.add(`${i + 2},${j}`);
                    }
                }

                // Kapsül içindeki hücrelerin toplamını bul (hedef)
                let target = 0;
                cellsInCapsule.forEach(c => {
                    target += solutionGrid[c.y][c.x];
                });

                capsules.push({
                    id: `capsule_${capsId++}`,
                    target,
                    cells: cellsInCapsule
                });
            }
        }

        // 3. Satır ve Sütun hedeflerini hesapla
        const rowTargets = [];
        const colTargets = [];
        for (let i = 0; i < size; i++) {
            let rSum = 0;
            let cSum = 0;
            for (let j = 0; j < size; j++) {
                rSum += solutionGrid[i][j];
                cSum += solutionGrid[j][i];
            }
            rowTargets.push(rSum);
            colTargets.push(cSum);
        }

        // Arayüzde öğrenci solutionGrid'i bulmaya çalışacak, boş gridi siliyoruz (puzzleGrid zaten null dolu)
        activities.push({
            title: `Kapsül Oyunu (${size}x${size})`,
            instruction: `Yukarıda verilen ${useOdds ? 'TEK' : 'ÇİFT'} sayıları birer kez kullanarak, sütun/satır ardındaki hedeflere ve kapsül içlerindeki toplamlara ulaşın.`,
            grid: puzzleGrid, // Empty starting grid
            capsules,
            rowTargets,
            colTargets
        });
    }

    return activities;
};
