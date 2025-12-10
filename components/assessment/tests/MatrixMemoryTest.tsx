
import React, { useState, useEffect } from 'react';
import { SubTestResult } from '../../../types';

interface MatrixMemoryTestProps {
    onComplete: (result: SubTestResult) => void;
}

export const MatrixMemoryTest: React.FC<MatrixMemoryTestProps> = ({ onComplete }) => {
    const [level, setLevel] = useState(1);
    const [phase, setPhase] = useState<'preview' | 'recall' | 'feedback'>('preview');
    const [gridSize, setGridSize] = useState(3);
    const [targetCells, setTargetCells] = useState<number[]>([]);
    const [selectedCells, setSelectedCells] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [startTime, setStartTime] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);

    // Generate Level
    useEffect(() => {
        if (lives <= 0) {
            finishTest();
            return;
        }

        const size = level < 3 ? 3 : (level < 6 ? 4 : 5);
        setGridSize(size);
        
        // Increase items to remember
        const count = Math.min(size*size-1, 2 + Math.floor(level / 2));
        
        const cells = new Set<number>();
        while(cells.size < count) {
            cells.add(Math.floor(Math.random() * (size * size)));
        }
        setTargetCells(Array.from(cells));
        setSelectedCells([]);
        setPhase('preview');

        // Show time decreases as levels go up
        const showTime = Math.max(1000, 2000 - (level * 100)); 
        const timer = setTimeout(() => {
            setPhase('recall');
            setStartTime(Date.now());
        }, showTime);

        return () => clearTimeout(timer);
    }, [level, lives]);

    const handleCellClick = (index: number) => {
        if (phase !== 'recall') return;

        const newSelected = [...selectedCells, index];
        setSelectedCells(newSelected);

        // Calculate Reaction Time for first click
        if (newSelected.length === 1) {
             setReactionTimes(prev => [...prev, Date.now() - startTime]);
        }

        // Check if finished selection
        if (newSelected.length === targetCells.length) {
            setPhase('feedback');
            // Validate
            const correctCount = newSelected.filter(c => targetCells.includes(c)).length;
            const isCorrect = correctCount === targetCells.length;

            setTimeout(() => {
                if (isCorrect) {
                    setScore(prev => prev + (level * 10));
                    setLevel(prev => prev + 1);
                } else {
                    setLives(prev => prev - 1);
                    // Retry same level or downgrade logic could go here
                }
            }, 1000);
        }
    };

    const finishTest = () => {
        const avgRT = reactionTimes.length > 0 ? reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length : 0;
        // Normalize score 0-100 (Max theoretical ~300)
        const normalized = Math.min(100, Math.round((score / 200) * 100)); 

        onComplete({
            testId: 'visual_spatial_memory',
            name: 'Görsel Bellek',
            score: normalized,
            rawScore: score,
            totalItems: level,
            avgReactionTime: avgRT,
            accuracy: normalized, // Simplified mapping
            status: 'completed',
            timestamp: Date.now()
        });
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full select-none">
            <div className="mb-8 text-center">
                <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-2">Desenleri Hatırla</h3>
                <div className="flex gap-4 justify-center text-sm font-bold text-zinc-500">
                    <span>Seviye: {level}</span>
                    <span>Puan: {score}</span>
                    <span className="text-red-500">Can: {"❤️".repeat(lives)}</span>
                </div>
            </div>

            <div 
                className="grid gap-2 bg-zinc-200 p-2 rounded-xl"
                style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    width: `${gridSize * 80}px`,
                    height: `${gridSize * 80}px`
                }}
            >
                {Array.from({length: gridSize * gridSize}).map((_, i) => {
                    let bgClass = "bg-white hover:bg-zinc-50";
                    if (phase === 'preview' && targetCells.includes(i)) {
                        bgClass = "bg-indigo-500 scale-95 transition-transform";
                    }
                    if (phase === 'recall' && selectedCells.includes(i)) {
                        bgClass = "bg-indigo-300";
                    }
                    if (phase === 'feedback') {
                         if (targetCells.includes(i)) bgClass = "bg-green-500"; // Correct target
                         if (selectedCells.includes(i) && !targetCells.includes(i)) bgClass = "bg-red-500"; // Wrong selection
                    }

                    return (
                        <div 
                            key={i}
                            onClick={() => handleCellClick(i)}
                            className={`rounded-lg cursor-pointer transition-all duration-200 border-2 border-zinc-300 ${bgClass}`}
                        ></div>
                    );
                })}
            </div>
            
            <div className="mt-8 text-xl font-bold text-zinc-400 h-8">
                {phase === 'preview' ? "Dikkatlice İzle..." : (phase === 'recall' ? "Şimdi Dokun!" : "Kontrol Ediliyor...")}
            </div>
        </div>
    );
};
