
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
    const [grid, setGrid] = useState<{ id: string; char: string; isTarget: boolean; isFound: boolean; isError: boolean }[]>([]);
    const [foundCount, setFoundCount] = useState(0);
    const [errors, setErrors] = useState(0);

    const totalCorrect = useRef(0);
    const totalErrors = useRef(0);
    const totalReactionTime = useRef(0);
    const startTime = useRef(0);
    const levelStartTime = useRef(0);

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
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none">
                <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-magnifying-glass text-4xl text-amber-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">Görsel Arama Testi</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Karmaşık harfler arasında <span className="font-bold text-amber-600">hedef harfi</span> olabildiğince hızlı bul ve işaretle.
                        Dikkatli ol, yanlış harflere tıklama!
                    </p>
                </div>
                <div className="flex gap-3 text-xs text-zinc-500">
                    <div className="flex items-center gap-1"><i className="fa-solid fa-eye text-amber-400"></i> Tarama</div>
                    <div className="text-zinc-300">→</div>
                    <div className="flex items-center gap-1"><i className="fa-solid fa-bolt text-amber-400"></i> Hız</div>
                    <div className="text-zinc-300">→</div>
                    <div className="flex items-center gap-1"><i className="fa-solid fa-bullseye text-amber-400"></i> Odak</div>
                </div>
                <button
                    onClick={handleStart}
                    className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    <i className="fa-solid fa-play"></i> Teste Başla
                </button>
            </div>
        );
    }

    if (phase === 'done') return null;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-2xl mx-auto select-none gap-6">
            {/* Üst Bilgi Çubuğu */}
            <div className="w-full flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                        <span className="text-amber-600 dark:text-amber-400 font-black text-2xl">{config.targetChar}</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">HEDEF HARF</p>
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Bunu Bul ({foundCount}/{config.targetCount})</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Hatalar</p>
                        <p className="text-lg font-black text-red-500">{errors}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Seviye</p>
                        <p className="text-lg font-black text-zinc-800 dark:text-white">{config.level} / {LEVEL_CONFIGS.length}</p>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {phase === 'play' && (
                <div
                    className="grid gap-1.5 p-4 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300"
                    style={{ gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))` }}
                >
                    {grid.map((cell, idx) => (
                        <button
                            key={`${cell.id}_${idx}`}
                            onClick={() => handleClick(idx)}
                            className={`
                                w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg text-lg sm:text-xl font-black transition-all
                                ${cell.isFound
                                    ? 'bg-amber-500 text-white scale-90 opacity-50'
                                    : cell.isError
                                        ? 'bg-red-500 text-white animate-shake'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 active:scale-95 border-b-2 border-zinc-200 dark:border-zinc-700'}
                            `}
                        >
                            {cell.char}
                        </button>
                    ))}
                </div>
            )}

            {/* Geri Bildirim */}
            {phase === 'feedback' && (
                <div className="flex flex-col items-center justify-center py-12 animate-in slide-in-from-bottom-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 ${errors >= 5 ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}`}>
                        <i className={`fa-solid ${errors >= 5 ? 'fa-xmark' : 'fa-check'}`}></i>
                    </div>
                    <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-100">
                        {errors >= 5 ? 'Çok Sayıda Hata!' : 'Mükemmel Tarama!'}
                    </h3>
                    <p className="text-zinc-500 font-bold mt-2">Sonraki seviye yükleniyor...</p>
                </div>
            )}
        </div>
    );
};
