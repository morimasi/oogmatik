import React, { useState, useEffect, useRef } from 'react';
import { SubTestResult } from '../../../types';

interface PlanningTestProps {
    onComplete: (result: SubTestResult) => void;
}

type Tile = { id: number; value: number; row: number; col: number };

interface LevelConfig {
    level: number;
    size: number;
    scrambleSteps: number;
    title: string;
}

const LEVEL_CONFIGS: LevelConfig[] = [
    { level: 1, size: 2, scrambleSteps: 4, title: '2x2 Isınma' },
    { level: 2, size: 3, scrambleSteps: 8, title: '3x3 Kolay' },
    { level: 3, size: 3, scrambleSteps: 14, title: '3x3 Orta' },
    { level: 4, size: 4, scrambleSteps: 20, title: '4x4 Uzman' }
];

export const PlanningTest: React.FC<PlanningTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'play' | 'feedback' | 'done'>('intro');
    const [levelIdx, setLevelIdx] = useState(0);
    const [moves, setMoves] = useState(0);
    const [score, setScore] = useState(0);
    const [tiles, setTiles] = useState<Tile[]>([]);
    
    const startTimeRef = useRef(0);
    const levelStartTimeRef = useRef(0);
    const reactionTimesRef = useRef<number[]>([]);
    const totalMovesRef = useRef(0);

    const currentConfig = LEVEL_CONFIGS[levelIdx] || LEVEL_CONFIGS[0];

    // %100 Çözülebilir Bulmaca Üreteci (Geriye Yürütme Algoritması)
    const generatePuzzle = (size: number, steps: number) => {
        const total = size * size;
        
        // 1. Çözülmüş durum karoları oluştur
        const currentTiles: Tile[] = [];
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const idx = r * size + c;
                const value = idx === total - 1 ? 0 : idx + 1;
                currentTiles.push({ id: idx, value, row: r, col: c });
            }
        }

        // 2. Rastgele geçerli hamlelerle geriye karıştır (Çözülebilirliği garanti eder)
        let emptyIndex = currentTiles.findIndex(t => t.value === 0);
        let lastMovedValue = -1;

        for (let step = 0; step < steps; step++) {
            const emptyTile = currentTiles[emptyIndex];
            
            // Komşu karoları bul
            const neighbors = currentTiles.filter(t => {
                if (t.value === lastMovedValue) return false; // Geri-ileri yapıp takılmayı önle
                const isAdjacent =
                    (Math.abs(t.row - emptyTile.row) === 1 && t.col === emptyTile.col) ||
                    (Math.abs(t.col - emptyTile.col) === 1 && t.row === emptyTile.row);
                return isAdjacent;
            });

            if (neighbors.length > 0) {
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Konumları değiştir
                const r = randomNeighbor.row;
                const c = randomNeighbor.col;
                randomNeighbor.row = emptyTile.row;
                randomNeighbor.col = emptyTile.col;
                emptyTile.row = r;
                emptyTile.col = c;

                lastMovedValue = randomNeighbor.value;
            }
        }

        return currentTiles;
    };

    // Kusursuz Çözüm Kontrolü
    const checkIsSolved = (currentTiles: Tile[], size: number) => {
        // Karoları matris sırasına göre diz (row, col)
        const sorted = [...currentTiles].sort((a, b) => {
            if (a.row !== b.row) return a.row - b.row;
            return a.col - b.col;
        });

        const total = size * size;
        for (let i = 0; i < total - 1; i++) {
            if (sorted[i].value !== i + 1) return false;
        }
        return sorted[total - 1].value === 0;
    };

    const startLevel = (idx: number) => {
        const config = LEVEL_CONFIGS[idx] || LEVEL_CONFIGS[0];
        const newTiles = generatePuzzle(config.size, config.scrambleSteps);
        setTiles(newTiles);
        setMoves(0);
        setPhase('play');
        levelStartTimeRef.current = Date.now();
    };

    const handleStart = () => {
        startTimeRef.current = Date.now();
        setLevelIdx(0);
        setScore(0);
        reactionTimesRef.current = [];
        totalMovesRef.current = 0;
        startLevel(0);
    };

    const handleTileClick = (clickedTile: Tile) => {
        if (phase !== 'play' || clickedTile.value === 0) return;

        const emptyTile = tiles.find(t => t.value === 0);
        if (!emptyTile) return;

        // Komşuluk kontrolü
        const isAdjacent =
            (Math.abs(clickedTile.row - emptyTile.row) === 1 && clickedTile.col === emptyTile.col) ||
            (Math.abs(clickedTile.col - emptyTile.col) === 1 && clickedTile.row === emptyTile.row);

        if (!isAdjacent) return; // Komşu değilse hareket etme

        // Karoları yer değiştir
        const newTiles = tiles.map(t => {
            if (t.id === clickedTile.id) return { ...t, row: emptyTile.row, col: emptyTile.col };
            if (t.id === emptyTile.id) return { ...t, row: clickedTile.row, col: clickedTile.col };
            return t;
        });

        const newMoves = moves + 1;
        setTiles(newTiles);
        setMoves(newMoves);
        totalMovesRef.current += 1;

        if (moves === 0) {
            reactionTimesRef.current.push(Date.now() - levelStartTimeRef.current);
        }

        // Çözüm Kontrolü
        if (checkIsSolved(newTiles, currentConfig.size)) {
            const levelTime = (Date.now() - levelStartTimeRef.current) / 1000;
            // Puan hesaplama: Taban puan 25, hızlı çözüme ve az hamleye bonus
            const bonus = Math.max(0, Math.round(30 - newMoves - levelTime));
            const levelPoints = 25 + bonus;

            setScore(prev => prev + levelPoints);
            setPhase('feedback');

            setTimeout(() => {
                if (levelIdx + 1 < LEVEL_CONFIGS.length) {
                    const nextIdx = levelIdx + 1;
                    setLevelIdx(nextIdx);
                    startLevel(nextIdx);
                } else {
                    finishTest();
                }
            }, 1500);
        }
    };

    const finishTest = () => {
        setPhase('done');
        const avgRT = reactionTimesRef.current.length > 0 
            ? reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length 
            : 2000;
        
        // Maksimum alınabilecek puan ortalama 100 civarı
        const normalizedScore = Math.min(100, Math.max(20, Math.round((score / 120) * 100)));

        onComplete({
            testId: 'planning',
            name: 'Planlama',
            score: normalizedScore,
            rawScore: score,
            totalItems: LEVEL_CONFIGS.length,
            avgReactionTime: Math.round(avgRT),
            accuracy: normalizedScore,
            status: 'completed',
            timestamp: Date.now()
        });
    };

    // Karoları matris görünümü için row ve col'a göre sırala
    const sortedTiles = [...tiles].sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
    });

    const emptyTile = tiles.find(t => t.value === 0);

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none relative overflow-hidden p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-950/30 dark:via-violet-950/30 dark:to-fuchsia-950/30" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-15 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-400 rounded-full blur-3xl opacity-15 translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-violet-600 shadow-2xl shadow-purple-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <i className="fa-solid fa-chess-board text-5xl text-white animate-pulse"></i>
                    </div>
                </div>

                <div className="relative z-10 text-center max-w-md">
                    <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                        Planlama Testi
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-300 text-base leading-relaxed font-medium">
                        Kareleri boşluğu kullanarak kaydırın ve sayıları <span className="font-black text-purple-600 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-lg">1'den başlayarak küçükten büyüğe</span> sıralayın!
                    </p>
                </div>

                <div className="relative z-10 flex gap-4 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-purple-200/50 shadow-sm">
                        <i className="fa-solid fa-diagram-project text-purple-500"></i>
                        <span>Strateji</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-purple-200/50 shadow-sm">
                        <i className="fa-solid fa-list-ol text-violet-500"></i>
                        <span>Sıralama</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <button
                        onClick={handleStart}
                        className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-black rounded-3xl shadow-2xl shadow-purple-500/30 transition-all duration-300 flex items-center gap-4 transform hover:scale-105 active:scale-95 cursor-pointer"
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
        <div className="flex flex-col items-center justify-center w-full h-full max-w-3xl mx-auto select-none gap-6 relative p-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-violet-50/50 to-fuchsia-50/80 dark:from-purple-950/20 dark:via-violet-950/20 dark:to-fuchsia-950/20" />

            <div className="relative z-10 w-full flex flex-col items-center gap-6">
                {/* Üst Bilgi Barı */}
                <div className="w-full flex justify-between items-center bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-purple-200/50 dark:border-zinc-700 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-md">
                            <i className="fa-solid fa-arrow-down-1-9"></i>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">GÖREV</p>
                            <p className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-100">
                                Kareleri Sırala (1, 2, 3...)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 sm:gap-8">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Seviye</p>
                            <p className="text-xl font-black text-zinc-800 dark:text-white">{currentConfig.level} / {LEVEL_CONFIGS.length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Hamle</p>
                            <p className="text-xl font-black text-purple-600 dark:text-purple-400">{moves}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Puan</p>
                            <p className="text-xl font-black text-emerald-500">{score}</p>
                        </div>
                    </div>
                </div>

                {/* Bulmaca Izgarası */}
                {phase === 'play' && (
                    <div
                        className="grid gap-2.5 p-5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-purple-200/50 dark:border-zinc-800 animate-in zoom-in-95 duration-300"
                        style={{
                            gridTemplateColumns: `repeat(${currentConfig.size}, minmax(0, 1fr))`,
                            width: `${Math.min(360, currentConfig.size * 90)}px`,
                            height: `${Math.min(360, currentConfig.size * 90)}px`,
                        }}
                    >
                        {sortedTiles.map((tile) => {
                            const isMovable = emptyTile && (
                                (Math.abs(tile.row - emptyTile.row) === 1 && tile.col === emptyTile.col) ||
                                (Math.abs(tile.col - emptyTile.col) === 1 && tile.row === emptyTile.row)
                            );

                            return (
                                <button
                                    key={tile.id}
                                    onClick={() => handleTileClick(tile)}
                                    disabled={tile.value === 0 || !isMovable}
                                    className={`
                                        w-full h-full flex items-center justify-center rounded-2xl text-xl sm:text-2xl font-black font-mono transition-all duration-200 select-none
                                        ${tile.value === 0
                                            ? 'bg-transparent border-2 border-dashed border-purple-200/40 dark:border-zinc-800'
                                            : isMovable
                                                ? 'bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-purple-300/30 dark:ring-purple-900/40'
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 opacity-90 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {tile.value !== 0 && tile.value}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Geri Bildirim */}
                {phase === 'feedback' && (
                    <div className="flex flex-col items-center justify-center py-10 animate-in slide-in-from-bottom-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center text-4xl mb-4 shadow-xl">
                            <i className="fa-solid fa-check animate-bounce"></i>
                        </div>
                        <h3 className="text-3xl font-black text-zinc-800 dark:text-zinc-100 mb-1">
                            Harika! Doğru Sıraladın
                        </h3>
                        <p className="text-zinc-500 font-bold text-sm">Sonraki seviye yükleniyor...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
