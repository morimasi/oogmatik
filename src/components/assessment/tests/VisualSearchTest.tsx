
import React, { useState, useEffect, useRef } from 'react';
import { SubTestResult } from '../../../types';

interface VisualSearchTestProps {
    onComplete: (result: SubTestResult) => void;
}

const LEVEL_CONFIGS = [
    { level: 1, gridSize: 5, targetChar: 'b', distractorChars: ['d', 'p', 'q'], targetCount: 4 },
    { level: 2, gridSize: 7, targetChar: 'E', distractorChars: ['F', 'B', 'P'], targetCount: 6 },
    { level: 3, gridSize: 9, targetChar: 'M', distractorChars: ['N', 'W', 'V'], targetCount: 8 },
    { level: 4, gridSize: 12, targetChar: '6', distractorChars: ['9', '8', '0'], targetCount: 10 }
];

export const VisualSearchTest: React.FC<VisualSearchTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'play' | 'feedback' | 'done'>('intro');
    const [levelIdx, setLevelIdx] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [grid, setGrid] = useState<{ id: string; char: string; isTarget: boolean; isFound: boolean; isError: boolean }[]>([]);
    const [foundCount, setFoundCount] = useState(0);
    const [errors, setErrors] = useState(0);

    const totalCorrect = useRef(0);
    const totalErrors = useRef(0);
    const totalReactionTime = useRef(0);
    const startTime = useRef(0);
    const levelStartTime = useRef(0);

    const handleShowHint = () => {
        if (phase !== 'play') return;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 2500);
    };

    const config = LEVEL_CONFIGS[levelIdx];

    const generateGrid = () => {
        const totalCells = config.gridSize * config.gridSize;
        const newGrid = [];

        // Önce hedefleri ekle
        for (let i = 0; i < config.targetCount; i++) {
            newGrid.push({ id: `t_${i}`, char: config.targetChar, isTarget: true, isFound: false, isError: false });
        }

        // Kalanları çeldiricilerle doldur
        const remaining = totalCells - config.targetCount;
        for (let i = 0; i < remaining; i++) {
            const dist = config.distractorChars[Math.floor(Math.random() * config.distractorChars.length)];
            newGrid.push({ id: `d_${i}`, char: dist, isTarget: false, isFound: false, isError: false });
        }

        // Karıştır
        newGrid.sort(() => Math.random() - 0.5);
        setGrid(newGrid);
        setFoundCount(0);
        setErrors(0);
    };

    const startLevel = () => {
        generateGrid();
        levelStartTime.current = Date.now();
        setPhase('play');
    };

    const handleStart = () => {
        startTime.current = Date.now();
        startLevel();
    };

    const handleClick = (cellIndex: number) => {
        if (phase !== 'play') return;

        const cell = grid[cellIndex];
        if (cell.isFound || cell.isError) return; // Zaten tıklandıysa geç

        const newGrid = [...grid];
        if (cell.isTarget) {
            newGrid[cellIndex].isFound = true;
            const newFound = foundCount + 1;
            setFoundCount(newFound);
            totalCorrect.current += 1;

            setGrid(newGrid);

            if (newFound >= config.targetCount) {
                // Seviye bitti
                totalReactionTime.current += (Date.now() - levelStartTime.current);
                setPhase('feedback');
                setTimeout(() => {
                    if (levelIdx + 1 < LEVEL_CONFIGS.length) {
                        setLevelIdx(levelIdx + 1);
                        startLevel();
                    } else {
                        finish();
                    }
                }, 1500);
            }
        } else {
            // Hatalı tıklama
            newGrid[cellIndex].isError = true;
            setErrors(prev => prev + 1);
            totalErrors.current += 1;
            setGrid(newGrid);

            // Çok fazla hata yaparsa (örneğin 5), cezalandır ve bir sonraki seviyeye geç
            if (errors + 1 >= 5) {
                totalReactionTime.current += (Date.now() - levelStartTime.current);
                setPhase('feedback');
                setTimeout(() => {
                    if (levelIdx + 1 < LEVEL_CONFIGS.length) {
                        setLevelIdx(levelIdx + 1);
                        startLevel();
                    } else {
                        finish();
                    }
                }, 1500);
            }
        }
    };

    const finish = () => {
        setPhase('done');
        const maxScore = LEVEL_CONFIGS.reduce((acc, curr) => acc + curr.targetCount, 0);

        // Hata cezası: Hatalar doğrudan doğruları düşürür (min 0)
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
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none relative overflow-hidden">
                {/* Premium Gradient Arka Plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-2xl shadow-amber-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <i className="fa-solid fa-magnifying-glass text-5xl text-white"></i>
                    </div>
                </div>
                
                <div className="relative z-10 text-center max-w-md">
                    <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Görsel Arama Testi</h3>
                    <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed font-medium">
                        Karmaşık harfler arasında <span className="font-black text-amber-600 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-lg">hedef harfi</span> olabildiğince hızlı bul ve işaretle.
                        Dikkatli ol, yanlış harflere tıklama!
                    </p>
                </div>
                
                <div className="relative z-10 flex gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                        <i className="fa-solid fa-eye text-amber-400"></i>
                        <span className="font-medium">Tarama</span>
                    </div>
                    <div className="text-zinc-300 text-xl">→</div>
                    <div className="flex items-center gap-2 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                        <i className="fa-solid fa-bolt text-amber-400"></i>
                        <span className="font-medium">Hız</span>
                    </div>
                    <div className="text-zinc-300 text-xl">→</div>
                    <div className="flex items-center gap-2 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                        <i className="fa-solid fa-bullseye text-amber-400"></i>
                        <span className="font-medium">Odak</span>
                    </div>
                </div>
                
                <div className="relative z-10">
                    <button
                        onClick={handleStart}
                        className="group px-10 py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black rounded-3xl shadow-2xl shadow-amber-500/30 transition-all duration-300 flex items-center gap-4 transform hover:scale-105 active:scale-95"
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
        <div className="flex flex-col items-center justify-center w-full h-full max-w-2xl mx-auto select-none gap-6 relative overflow-hidden">
            {/* Premium Gradient Arka Plan */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
            
            {/* İpucu Kutusu */}
            {showHint && phase === 'play' && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-amber-500/30 max-w-sm backdrop-blur-sm border border-white/20">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-lightbulb text-yellow-300 text-xl animate-pulse"></i>
                            <span className="text-sm font-bold">
                                {config.targetCount} adet "{config.targetChar}" harfi bul. Diğerlerine tıklama!
                            </span>
                        </div>
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-10 border-l-transparent border-r-10 border-r-transparent border-t-10 border-t-amber-600"></div>
                    </div>
                </div>
            )}
            
            <div className="relative z-10 w-full">
                {/* Üst Bilgi Çubuğu */}
                <div className="w-full flex justify-between items-center bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-white font-black text-3xl">{config.targetChar}</span>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">HEDEF HARF</p>
                            <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Bunu Bul ({foundCount}/{config.targetCount})</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-red-400">Hatalar</p>
                            <p className="text-2xl font-black text-red-500">{errors}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-amber-400">Seviye</p>
                            <p className="text-2xl font-black text-zinc-800 dark:text-white">{config.level} / {LEVEL_CONFIGS.length}</p>
                        </div>
                        <button
                            onClick={handleShowHint}
                            disabled={phase !== 'play'}
                            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                        >
                            <i className="fa-solid fa-lightbulb"></i>
                            İpucu
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {phase === 'play' && (
                    <div
                        className="grid gap-2 p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/30 animate-in zoom-in-95 duration-500"
                        style={{ gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))` }}
                    >
                        {grid.map((cell, idx) => (
                            <button
                                key={`${cell.id}_${idx}`}
                                onClick={() => handleClick(idx)}
                                className={`
                                    w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl text-lg sm:text-xl md:text-2xl font-black transition-all duration-300 transform
                                    ${cell.isFound
                                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white scale-90 opacity-50 shadow-lg'
                                        : cell.isError
                                            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white animate-shake shadow-lg'
                                            : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 hover:from-amber-200 hover:to-orange-200 active:scale-95 shadow-lg'
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
                    <div className="flex flex-col items-center justify-center py-16 animate-in slide-in-from-bottom-4">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 shadow-2xl ${errors >= 5 ? 'bg-gradient-to-br from-red-400 to-red-500 text-white' : 'bg-gradient-to-br from-emerald-400 to-green-500 text-white'}`}>
                            <i className={`fa-solid ${errors >= 5 ? 'fa-xmark' : 'fa-check'} animate-bounce`}></i>
                        </div>
                        <h3 className="text-3xl font-black text-zinc-800 dark:text-zinc-100 mb-2">
                            {errors >= 5 ? 'Çok Sayıda Hata!' : 'Mükemmel Tarama!'}
                        </h3>
                        <p className="text-zinc-500 font-bold text-lg">Sonraki seviye yükleniyor...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
