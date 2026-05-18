
import React, { useState, useEffect } from 'react';
import { SubTestResult } from '../../../types';

interface PlanningTestProps {
    onComplete: (result: SubTestResult) => void;
}

type Tile = { id: number; value: number; row: number; col: number };

export const PlanningTest: React.FC<PlanningTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'play' | 'feedback'>('intro');
    const [level, setLevel] = useState(1);
    const [moves, setMoves] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [startTime, setStartTime] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const [tiles, setTiles] = useState<Tile[]>([]);
    const maxScoreRef = React.useRef(0);

    const generatePuzzle = (size: number) => {
        const total = size * size;
        const values = Array.from({ length: total - 1 }, (_, i) => i + 1);
        values.push(0);
        let shuffled = [...values];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const newTiles: Tile[] = [];
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const idx = row * size + col;
                newTiles.push({
                    id: idx,
                    value: shuffled[idx],
                    row,
                    col
                });
            }
        }
        return newTiles;
    };

    const isSolved = (currentTiles: Tile[], size: number) => {
        for (let i = 0; i < currentTiles.length - 1; i++) {
            if (currentTiles[i].value !== i + 1) return false;
        }
        return currentTiles[currentTiles.length - 1].value === 0;
    };

    const handleTileClick = (clickedTile: Tile) => {
        if (phase !== 'play') return;
        
        const emptyTile = tiles.find(t => t.value === 0);
        if (!emptyTile) return;

        const isAdjacent = 
            (Math.abs(clickedTile.row - emptyTile.row) === 1 && clickedTile.col === emptyTile.col) ||
            (Math.abs(clickedTile.col - emptyTile.col) === 1 && clickedTile.row === emptyTile.row);

        if (!isAdjacent) return;

        const newTiles = tiles.map(t => {
            if (t.id === clickedTile.id) return { ...t, row: emptyTile.row, col: emptyTile.col };
            if (t.id === emptyTile.id) return { ...t, row: clickedTile.row, col: clickedTile.col };
            return t;
        });

        setTiles(newTiles);
        setMoves(prev => prev + 1);

        if (moves === 0) {
            setReactionTimes(prev => [...prev, Date.now() - startTime]);
        }

        const size = level < 3 ? 3 : 4;
        if (isSolved(newTiles, size)) {
            const levelScore = Math.max(0, (level * 20) - moves);
            setScore(prev => prev + levelScore);
            maxScoreRef.current += level * 20;
            setPhase('feedback');
            
            setTimeout(() => {
                setLevel(prev => prev + 1);
            }, 2000);
        }
    };

    const startLevel = () => {
        const size = level < 3 ? 3 : 4;
        const newTiles = generatePuzzle(size);
        setTiles(newTiles);
        setMoves(0);
        setPhase('play');
        setStartTime(Date.now());
    };

    useEffect(() => {
        if (phase === 'intro') return;
        if (lives <= 0) {
            finishTest();
            return;
        }
        startLevel();
    }, [level, lives]);

    const finishTest = () => {
        const avgRT = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
        const maxTheoreticalScore = Math.max(maxScoreRef.current, 1);
        const normalized = Math.min(100, Math.round((score / maxTheoreticalScore) * 100));

        onComplete({
            testId: 'planning',
            name: 'Planlama',
            score: normalized,
            rawScore: score,
            totalItems: level - 1,
            avgReactionTime: Math.round(avgRT),
            accuracy: normalized,
            status: 'completed',
            timestamp: Date.now()
        });
    };

    const size = level < 3 ? 3 : 4;

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full select-none gap-8 animate-in fade-in">
                <div className="w-20 h-20 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-chess-board text-4xl text-purple-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">Planlama</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Kareleri kaydırarak sayıları sıralı hale getir.
                        Boş kareyi kullanarak komşu kareleri hareket ettirin.
                    </p>
                </div>
                <button
                    onClick={() => {
                        maxScoreRef.current = 0;
                        setLevel(1);
                        setLives(3);
                        setScore(0);
                        startLevel();
                    }}
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    <i className="fa-solid fa-play"></i> Teste Başla
                </button>
            </div>
        );
    }

    const sortedTiles = [...tiles].sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
    });

    return (
        <div className="flex flex-col items-center justify-center w-full h-full select-none relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-fuchsia-900/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
                <div className="mb-8 text-center">
                    <h3 className="text-3xl font-black text-zinc-800 dark:text-white mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Kareleri Sırala</h3>
                    <div className="flex gap-8 justify-center items-center">
                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            <i className="fa-solid fa-layer-group text-purple-500"></i>
                            <span>Seviye {level}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            <i className="fa-solid fa-star text-yellow-500"></i>
                            <span>{score} puan</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            <i className="fa-solid fa-mouse-pointer text-violet-500"></i>
                            <span>{moves} hamle</span>
                        </div>
                        <div className="flex gap-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <i key={i} className={`fa-solid fa-heart text-lg ${i < lives ? 'text-red-500' : 'text-zinc-300'}`}></i>
                            ))}
                        </div>
                    </div>
                </div>

                <div
                    className="grid gap-2 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md p-4 rounded-3xl border border-white/30 shadow-2xl"
                    style={{
                        gridTemplateColumns: `repeat(${size}, 1fr)`,
                        width: `${size * 80}px`,
                    }}
                >
                    {sortedTiles.map((tile) => (
                        <div
                            key={tile.id}
                            onClick={() => handleTileClick(tile)}
                            className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black transition-all duration-300 ${
                                tile.value === 0 
                                    ? 'bg-transparent' 
                                    : 'bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-lg hover:scale-105 cursor-pointer'
                            }`}
                        >
                            {tile.value !== 0 && tile.value}
                        </div>
                    ))}
                </div>

                {phase === 'feedback' && (
                    <div className="mt-8 text-center">
                        <div className="text-4xl font-black text-emerald-500">Harika! Çözüldü!</div>
                    </div>
                )}
            </div>
        </div>
    );
};
