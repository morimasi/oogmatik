import React, { useState, useRef } from 'react';
import { SubTestResult } from '../../../types';

interface VisualSearchTestProps {
    onComplete: (result: SubTestResult) => void;
}

interface LevelConfig {
    level: number;
    gridSize: number;
    targetChar: string;
    distractorChars: string[];
    targetCount: number;
    title: string;
}

const LEVEL_CONFIGS: LevelConfig[] = [
    { level: 1, gridSize: 5, targetChar: 'b', distractorChars: ['d', 'p', 'q'], targetCount: 4, title: 'b Harfini Bul' },
    { level: 2, gridSize: 6, targetChar: 'E', distractorChars: ['F', 'B', 'P', '3'], targetCount: 5, title: 'E Harfini Bul' },
    { level: 3, gridSize: 8, targetChar: 'M', distractorChars: ['N', 'W', 'V', 'U'], targetCount: 6, title: 'M Harfini Bul' },
    { level: 4, gridSize: 10, targetChar: '6', distractorChars: ['9', '8', '0', '5'], targetCount: 8, title: '6 Sayısını Bul' }
];

// Fisher-Yates (Knuth) Shuffle Algoritması - Tam Güvenilir Karıştırma
function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

interface GridCell {
    id: string;
    char: string;
    isTarget: boolean;
    isFound: boolean;
    isError: boolean;
}

export const VisualSearchTest: React.FC<VisualSearchTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'play' | 'feedback' | 'done'>('intro');
    const [levelIdx, setLevelIdx] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [grid, setGrid] = useState<GridCell[]>([]);
    const [foundCount, setFoundCount] = useState(0);
    const [errors, setErrors] = useState(0);

    const totalCorrect = useRef(0);
    const totalErrors = useRef(0);
    const totalReactionTime = useRef(0);
    const startTime = useRef(0);
    const levelStartTime = useRef(0);

    const config = LEVEL_CONFIGS[levelIdx] || LEVEL_CONFIGS[0];

    const handleShowHint = () => {
        if (phase !== 'play') return;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000);
    };

    const generateGrid = (currentLevelIdx: number) => {
        const currentConfig = LEVEL_CONFIGS[currentLevelIdx] || LEVEL_CONFIGS[0];
        const totalCells = currentConfig.gridSize * currentConfig.gridSize;
        const newGrid: GridCell[] = [];

        // Çeldiricilerin içinde yanlışlıkla hedef harf varsa temizle
        const safeDistractors = currentConfig.distractorChars.filter(c => c !== currentConfig.targetChar);
        if (safeDistractors.length === 0) safeDistractors.push('X');

        // 1. Kesin olarak targetCount adet HEDEF harf ekle
        for (let i = 0; i < currentConfig.targetCount; i++) {
            newGrid.push({
                id: `target_${i}_${Date.now()}`,
                char: currentConfig.targetChar,
                isTarget: true,
                isFound: false,
                isError: false
            });
        }

        // 2. Kalan hücreleri ÇELDİRİCİ harflerle doldur (asla hedef içermez)
        const remaining = totalCells - currentConfig.targetCount;
        for (let i = 0; i < remaining; i++) {
            const randomDistractor = safeDistractors[Math.floor(Math.random() * safeDistractors.length)];
            newGrid.push({
                id: `dist_${i}_${Date.now()}`,
                char: randomDistractor,
                isTarget: false,
                isFound: false,
                isError: false
            });
        }

        // 3. Fisher-Yates ile kusursuz karıştır
        const shuffledGrid = shuffleArray(newGrid);

        setGrid(shuffledGrid);
        setFoundCount(0);
        setErrors(0);
    };

    const startLevel = (nextLevelIdx: number) => {
        generateGrid(nextLevelIdx);
        levelStartTime.current = Date.now();
        setPhase('play');
    };

    const handleStart = () => {
        startTime.current = Date.now();
        setLevelIdx(0);
        totalCorrect.current = 0;
        totalErrors.current = 0;
        totalReactionTime.current = 0;
        startLevel(0);
    };

    const handleClick = (cellIndex: number) => {
        if (phase !== 'play') return;

        const cell = grid[cellIndex];
        if (cell.isFound || cell.isError) return; // Zaten tıklandıysa etkileşimi engelle

        const newGrid = [...grid];

        // Kesin Karşılaştırma: hem isTarget hem de char eşleşmesi doğrulanır
        if (cell.isTarget || cell.char === config.targetChar) {
            newGrid[cellIndex].isFound = true;
            const newFound = foundCount + 1;
            setFoundCount(newFound);
            totalCorrect.current += 1;
            setGrid(newGrid);

            // Tüm hedefler bulundu mu?
            if (newFound >= config.targetCount) {
                totalReactionTime.current += (Date.now() - levelStartTime.current);
                setPhase('feedback');
                setTimeout(() => {
                    if (levelIdx + 1 < LEVEL_CONFIGS.length) {
                        const next = levelIdx + 1;
                        setLevelIdx(next);
                        startLevel(next);
                    } else {
                        finish();
                    }
                }, 1400);
            }
        } else {
            // Hatalı tıklama (Çeldiriciye basıldı)
            newGrid[cellIndex].isError = true;
            setErrors(prev => prev + 1);
            totalErrors.current += 1;
            setGrid(newGrid);

            // Çok fazla hata yapılırsa seviye sonlandırılır
            if (errors + 1 >= 5) {
                totalReactionTime.current += (Date.now() - levelStartTime.current);
                setPhase('feedback');
                setTimeout(() => {
                    if (levelIdx + 1 < LEVEL_CONFIGS.length) {
                        const next = levelIdx + 1;
                        setLevelIdx(next);
                        startLevel(next);
                    } else {
                        finish();
                    }
                }, 1400);
            }
        }
    };

    const finish = () => {
        setPhase('done');
        const maxScore = LEVEL_CONFIGS.reduce((acc, curr) => acc + curr.targetCount, 0);

        let finalScore = totalCorrect.current - Math.floor(totalErrors.current / 2);
        if (finalScore < 0) finalScore = 0;

        const accuracy = maxScore > 0 ? (finalScore / maxScore) * 100 : 0;
        const avgReactionTime = Math.round(totalReactionTime.current / LEVEL_CONFIGS.length);

        onComplete({
            testId: 'visual_search',
            name: 'Görsel Arama',
            score: Math.round(accuracy),
            rawScore: totalCorrect.current,
            totalItems: maxScore,
            avgReactionTime: avgReactionTime,
            accuracy: Math.round(accuracy),
            status: 'completed',
            timestamp: Date.now()
        });
    };

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none relative overflow-hidden p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-15 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl opacity-15 translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-2xl shadow-amber-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <i className="fa-solid fa-magnifying-glass text-5xl text-white animate-pulse"></i>
                    </div>
                </div>

                <div className="relative z-10 text-center max-w-md">
                    <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Görsel Arama Testi
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-300 text-base leading-relaxed font-medium">
                        Izgara içinde belirtilen <span className="font-black text-amber-600 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-lg">Hedef Karakteri</span> bulun ve tıklayın. Benzer çeldiricilere dikkat edin!
                    </p>
                </div>

                <div className="relative z-10 flex gap-4 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-amber-200/50 shadow-sm">
                        <i className="fa-solid fa-eye text-amber-500"></i>
                        <span>Tarama Hızı</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-amber-200/50 shadow-sm">
                        <i className="fa-solid fa-bullseye text-orange-500"></i>
                        <span>Seçici Odak</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <button
                        onClick={handleStart}
                        className="group px-10 py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black rounded-3xl shadow-2xl shadow-amber-500/30 transition-all duration-300 flex items-center gap-4 transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <i className="fa-solid fa-play text-xl group-hover:rotate-12 transition-transform"></i>
                        <span className="text-lg">Teste Başla</span>
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'done') return null;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-3xl mx-auto select-none gap-5 relative p-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-yellow-50/80 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20" />

            {/* İpucu Kutusu */}
            {showHint && phase === 'play' && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
                        <i className="fa-solid fa-lightbulb text-yellow-300 text-lg animate-bounce"></i>
                        <span className="text-xs font-bold">
                            Izgarada tam {config.targetCount} adet "{config.targetChar}" var!
                        </span>
                    </div>
                </div>
            )}

            <div className="relative z-10 w-full flex flex-col items-center gap-5">
                {/* Üst Panel */}
                <div className="w-full flex justify-between items-center bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-amber-200/50 dark:border-zinc-700 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                            <span className="text-white font-black text-3xl font-mono">{config.targetChar}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">ARANAN HEDEF</p>
                            <p className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100">
                                "{config.targetChar}" Bul ({foundCount} / {config.targetCount})
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Hatalar</p>
                            <p className="text-xl font-black text-red-500">{errors}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Seviye</p>
                            <p className="text-xl font-black text-zinc-800 dark:text-white">{config.level} / {LEVEL_CONFIGS.length}</p>
                        </div>
                        <button
                            onClick={handleShowHint}
                            disabled={phase !== 'play'}
                            className="px-3 py-2 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 text-amber-700 dark:text-amber-300 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                            <i className="fa-solid fa-lightbulb"></i>
                            <span className="hidden sm:inline">İpucu</span>
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {phase === 'play' && (
                    <div
                        className="grid gap-2 p-5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-amber-200/40 dark:border-zinc-800 animate-in zoom-in-95 duration-300 max-h-[60vh] overflow-auto"
                        style={{ gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))` }}
                    >
                        {grid.map((cell, idx) => (
                            <button
                                key={`${cell.id}_${idx}`}
                                onClick={() => handleClick(idx)}
                                className={`
                                    w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-xl text-base sm:text-lg md:text-xl font-black font-mono transition-all duration-200 transform cursor-pointer select-none
                                    ${cell.isFound
                                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white scale-90 shadow-inner opacity-60'
                                        : cell.isError
                                            ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white animate-pulse shadow-md'
                                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-95 border-2 border-zinc-200 dark:border-zinc-700 hover:border-amber-400 hover:shadow-md'
                                    }
                                `}
                            >
                                {cell.char}
                            </button>
                        ))}
                    </div>
                )}

                {/* Feedback */}
                {phase === 'feedback' && (
                    <div className="flex flex-col items-center justify-center py-12 animate-in slide-in-from-bottom-4">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 shadow-xl ${errors >= 5 ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white' : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white'}`}>
                            <i className={`fa-solid ${errors >= 5 ? 'fa-xmark' : 'fa-check'} animate-bounce`}></i>
                        </div>
                        <h3 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 mb-1">
                            {errors >= 5 ? 'Seviye Tamamlanamadı' : 'Tebrikler! Tüm Hedefler Bulundu'}
                        </h3>
                        <p className="text-zinc-500 font-bold text-sm">Sonraki seviyeye geçiliyor...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
