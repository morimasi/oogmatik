import React, { useState, useRef, useMemo } from 'react';
import { SubTestResult } from '../../../types';
import type { DomainAdaptiveParameters } from '../services/cognitiveAdaptiveService';

interface VisualSearchTestProps {
    onComplete: (result: SubTestResult) => void;
    adaptiveParams?: DomainAdaptiveParameters;
}

interface LevelConfig {
    level: number;
    gridSize: number;
    targetChar: string;
    distractorChars: string[];
    targetCount: number;
    title: string;
}

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

// Farklı zorluk seviyelerine ve tanı dinamiklerine göre benzersiz harf havuzları
const LEVEL_PRESETS: Record<string, LevelConfig[]> = {
    // 1-2. Seviye / Disleksi & DEHB dostu sade ve ferah havuz
    easy: [
        { level: 1, gridSize: 4, targetChar: '★', distractorChars: ['▲', '●', '■'], targetCount: 3, title: 'Yıldızları Bul' },
        { level: 2, gridSize: 5, targetChar: 'A', distractorChars: ['O', 'U', 'I'], targetCount: 4, title: 'A Harfini Bul' },
        { level: 3, gridSize: 5, targetChar: 'b', distractorChars: ['d', 'p'], targetCount: 4, title: 'b Harfini Bul' },
        { level: 4, gridSize: 6, targetChar: '7', distractorChars: ['1', '4', '2'], targetCount: 5, title: '7 Sayısını Bul' }
    ],
    // 3. Seviye / Standart bilişsel tarama
    medium: [
        { level: 1, gridSize: 5, targetChar: 'b', distractorChars: ['d', 'p', 'q'], targetCount: 4, title: 'b Harfini Bul' },
        { level: 2, gridSize: 6, targetChar: 'E', distractorChars: ['F', 'B', 'P', '3'], targetCount: 5, title: 'E Harfini Bul' },
        { level: 3, gridSize: 7, targetChar: 'M', distractorChars: ['N', 'W', 'V', 'U'], targetCount: 6, title: 'M Harfini Bul' },
        { level: 4, gridSize: 8, targetChar: '6', distractorChars: ['9', '8', '0', '5'], targetCount: 7, title: '6 Sayısını Bul' }
    ],
    // 4-5. Seviye / İleri düzey & ayırt edici tarama
    hard: [
        { level: 1, gridSize: 6, targetChar: 'bd', distractorChars: ['db', 'pb', 'qp'], targetCount: 5, title: 'bd Çiftini Bul' },
        { level: 2, gridSize: 8, targetChar: 'E', distractorChars: ['F', 'B', 'P', '3', '8'], targetCount: 6, title: 'E Harfini Bul' },
        { level: 3, gridSize: 9, targetChar: 'O', distractorChars: ['Q', 'D', '0', 'C'], targetCount: 8, title: 'O Harfini Bul' },
        { level: 4, gridSize: 10, targetChar: 's', distractorChars: ['z', '5', 'e', 'c'], targetCount: 10, title: 's Harfini Bul' }
    ]
};

export const VisualSearchTest: React.FC<VisualSearchTestProps> = ({ onComplete, adaptiveParams }) => {
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

    // Öğrenci profiline göre belirlenmiş seviye yapılandırması
    const levelConfigs = useMemo(() => {
        if (!adaptiveParams) return LEVEL_PRESETS.medium;
        if (adaptiveParams.complexityScore <= 2) return LEVEL_PRESETS.easy;
        if (adaptiveParams.complexityScore >= 4) return LEVEL_PRESETS.hard;
        return LEVEL_PRESETS.medium;
    }, [adaptiveParams]);

    const config = levelConfigs[levelIdx] || levelConfigs[0];

    const handleShowHint = () => {
        if (phase !== 'play') return;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000);
    };

    const generateGrid = (currentLevelIdx: number) => {
        const currentConfig = levelConfigs[currentLevelIdx] || levelConfigs[0];
        const totalCells = currentConfig.gridSize * currentConfig.gridSize;
        const newGrid: GridCell[] = [];

        // Çeldiricilerin içinde yanlışlıkla hedef harf varsa temizle
        const safeDistractors = currentConfig.distractorChars.filter(c => c !== currentConfig.targetChar);
        if (safeDistractors.length === 0) safeDistractors.push('X');

        // 1. Kesin olarak targetCount adet HEDEF harf ekle
        for (let i = 0; i < currentConfig.targetCount; i++) {
            newGrid.push({
                id: `target_${i}_${Date.now()}_${Math.random()}`,
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
                id: `dist_${i}_${Date.now()}_${Math.random()}`,
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

    const handleCellClick = (cell: GridCell) => {
        if (phase !== 'play' || cell.isFound) return;

        const reactionTime = Date.now() - levelStartTime.current;
        totalReactionTime.current += reactionTime;

        if (cell.isTarget) {
            totalCorrect.current += 1;
            const newFoundCount = foundCount + 1;
            setFoundCount(newFoundCount);

            setGrid(prev => prev.map(c =>
                c.id === cell.id ? { ...c, isFound: true } : c
            ));

            if (newFoundCount >= config.targetCount) {
                setPhase('feedback');
                setTimeout(() => {
                    if (levelIdx + 1 < levelConfigs.length) {
                        const next = levelIdx + 1;
                        setLevelIdx(next);
                        startLevel(next);
                    } else {
                        finishTest();
                    }
                }, 1200);
            }
        } else {
            totalErrors.current += 1;
            setErrors(prev => prev + 1);

            setGrid(prev => prev.map(c =>
                c.id === cell.id ? { ...c, isError: true } : c
            ));

            setTimeout(() => {
                setGrid(prev => prev.map(c =>
                    c.id === cell.id ? { ...c, isError: false } : c
                ));
            }, 600);
        }
    };

    const finishTest = () => {
        setPhase('done');
        const totalItemsExpected = levelConfigs.reduce((acc, c) => acc + c.targetCount, 0);
        const accuracy = totalItemsExpected > 0
            ? Math.max(0, Math.min(100, Math.round(((totalCorrect.current - totalErrors.current * 0.5) / totalItemsExpected) * 100)))
            : 80;

        const avgReactionTime = (totalCorrect.current + totalErrors.current) > 0
            ? Math.round(totalReactionTime.current / (totalCorrect.current + totalErrors.current))
            : 850;

        onComplete({
            testId: 'visual_search',
            name: 'Görsel Arama',
            score: accuracy,
            rawScore: totalCorrect.current,
            totalItems: totalItemsExpected,
            avgReactionTime: avgReactionTime,
            accuracy: accuracy,
            status: 'completed',
            timestamp: Date.now()
        });
    };

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none relative overflow-hidden p-6 font-['Lexend']">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-15 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl opacity-15 translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-2xl shadow-amber-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <i className="fa-solid fa-magnifying-glass text-5xl text-white animate-pulse"></i>
                    </div>
                </div>

                <div className="relative z-10 text-center max-w-md">
                    <h3 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white mb-3">
                        Görsel Arama Testi
                    </h3>
                    {adaptiveParams && (
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-3">
                            {adaptiveParams.supportNote}
                        </span>
                    )}
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-medium">
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
                        className="group px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black rounded-3xl shadow-2xl shadow-amber-500/30 transition-all duration-300 flex items-center gap-4 transform hover:scale-105 active:scale-95 cursor-pointer text-base sm:text-lg"
                    >
                        <i className="fa-solid fa-play text-xl group-hover:rotate-12 transition-transform"></i>
                        <span>Teste Başla</span>
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'done') return null;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-3xl mx-auto select-none gap-5 relative p-4 overflow-hidden font-['Lexend']">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-yellow-50/80 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20" />

            {/* İpucu Kutusu */}
            {showHint && phase === 'play' && (
                <div className="relative z-20 w-full max-w-md bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <i className="fa-solid fa-lightbulb text-amber-500 text-lg"></i>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        İpucu: '{config.targetChar}' karakterine odaklan. Satır satır soldan sağa tarayarak ilerle!
                    </p>
                </div>
            )}

            <div className="relative z-10 w-full flex flex-col items-center gap-4">
                {/* Üst Bilgi Barı */}
                <div className="w-full flex justify-between items-center bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-amber-200/50 dark:border-zinc-700 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md">
                            {config.targetChar}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">HEDEF</p>
                            <p className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-100">
                                '{config.targetChar}' Karakterini Bul
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 sm:gap-8">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Seviye</p>
                            <p className="text-xl font-black text-zinc-800 dark:text-white">{config.level} / {levelConfigs.length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Bulunan</p>
                            <p className="text-xl font-black text-emerald-500">{foundCount} / {config.targetCount}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Hata</p>
                            <p className="text-xl font-black text-rose-500">{errors}</p>
                        </div>
                        <button
                            onClick={handleShowHint}
                            className="w-10 h-10 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 flex items-center justify-center transition-colors shadow-sm"
                            title="İpucu Al"
                        >
                            <i className="fa-solid fa-lightbulb"></i>
                        </button>
                    </div>
                </div>

                {/* Grid Alanı */}
                {phase === 'play' && (
                    <div
                        className="grid gap-2 p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-amber-200/50 dark:border-zinc-800 animate-in zoom-in-95 duration-300"
                        style={{
                            gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))`,
                            width: `${Math.min(420, config.gridSize * 50)}px`,
                            height: `${Math.min(420, config.gridSize * 50)}px`,
                        }}
                    >
                        {grid.map((cell) => (
                            <button
                                key={cell.id}
                                onClick={() => handleCellClick(cell)}
                                disabled={cell.isFound}
                                className={`
                                    w-full h-full flex items-center justify-center rounded-xl text-lg sm:text-xl font-black transition-all duration-200 select-none cursor-pointer
                                    ${cell.isFound
                                        ? 'bg-emerald-500 text-white scale-95 shadow-md shadow-emerald-500/20'
                                        : cell.isError
                                            ? 'bg-rose-500 text-white animate-shake'
                                            : 'bg-zinc-100 hover:bg-amber-50 dark:bg-zinc-800 dark:hover:bg-amber-950/30 text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:scale-105 active:scale-95 border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs'
                                    }
                                `}
                            >
                                {cell.char}
                            </button>
                        ))}
                    </div>
                )}

                {/* Geri Bildirim */}
                {phase === 'feedback' && (
                    <div className="flex flex-col items-center justify-center py-10 animate-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl mb-3 shadow-xl">
                            <i className="fa-solid fa-check animate-bounce"></i>
                        </div>
                        <h3 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 mb-1">
                            Harika! Tüm Hedefleri Buldun
                        </h3>
                        <p className="text-zinc-500 text-xs">Sonraki seviyeye geçiliyor...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
