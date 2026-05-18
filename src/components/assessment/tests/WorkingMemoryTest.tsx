
import React, { useState, useEffect } from 'react';
import { SubTestResult } from '../../../types';

interface WorkingMemoryTestProps {
    onComplete: (result: SubTestResult) => void;
}

export const WorkingMemoryTest: React.FC<WorkingMemoryTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'show' | 'input' | 'feedback'>('intro');
    const [level, setLevel] = useState(1);
    const [sequence, setSequence] = useState<number[]>([]);
    const [userInput, setUserInput] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [startTime, setStartTime] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const [lastWasCorrect, setLastWasCorrect] = useState<boolean | null>(null);
    const maxScoreRef = React.useRef(0);

    const generateSequence = (length: number) => {
        const seq: number[] = [];
        for (let i = 0; i < length; i++) {
            seq.push(Math.floor(Math.random() * 9) + 1);
        }
        return seq;
    };

    const startLevel = () => {
        const seqLength = 3 + Math.floor(level / 2);
        maxScoreRef.current += level * 10;
        const newSequence = generateSequence(seqLength);
        setSequence(newSequence);
        setUserInput([]);
        setPhase('show');
        setTimeout(() => {
            setPhase('input');
            setStartTime(Date.now());
        }, seqLength * 800);
    };

    const handleNumberClick = (num: number) => {
        if (phase !== 'input') return;
        const newInput = [...userInput, num];
        setUserInput(newInput);

        if (newInput.length === 1) {
            setReactionTimes(prev => [...prev, Date.now() - startTime]);
        }

        if (newInput.length === sequence.length) {
            const isCorrect = newInput.every((n, i) => n === sequence[i]);
            setLastWasCorrect(isCorrect);
            setPhase('feedback');

            setTimeout(() => {
                if (isCorrect) {
                    setScore(prev => prev + level * 10);
                    setLevel(prev => prev + 1);
                } else {
                    setLives(prev => prev - 1);
                }
            }, 1500);
        }
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
            testId: 'working_memory',
            name: 'Çalışma Belleği',
            score: normalized,
            rawScore: score,
            totalItems: level - 1,
            avgReactionTime: Math.round(avgRT),
            accuracy: normalized,
            status: 'completed',
            timestamp: Date.now()
        });
    };

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full select-none gap-8 animate-in fade-in">
                <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-brain text-4xl text-emerald-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">Çalışma Belleği</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Ekranda gösterilen sayı dizisini hatırla ve tersten yaz.
                        Her seviyede dizi uzunluğu artar.
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
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    <i className="fa-solid fa-play"></i> Teste Başla
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full select-none relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
                <div className="mb-8 text-center">
                    <h3 className="text-3xl font-black text-zinc-800 dark:text-white mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Sayıları Hatırla</h3>
                    <div className="flex gap-8 justify-center items-center">
                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            <i className="fa-solid fa-layer-group text-emerald-500"></i>
                            <span>Seviye {level}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            <i className="fa-solid fa-star text-yellow-500"></i>
                            <span>{score} puan</span>
                        </div>
                        <div className="flex gap-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <i key={i} className={`fa-solid fa-heart text-lg ${i < lives ? 'text-red-500' : 'text-zinc-300'}`}></i>
                            ))}
                        </div>
                    </div>
                </div>

                {phase === 'show' && (
                    <div className="flex gap-4 justify-center items-center mb-8">
                        {sequence.map((num, i) => (
                            <div key={i} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-emerald-500/30 animate-pulse">
                                {num}
                            </div>
                        ))}
                    </div>
                )}

                {phase === 'input' && (
                    <>
                        <div className="flex gap-3 justify-center items-center mb-8 h-20">
                            {userInput.map((num, i) => (
                                <div key={i} className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-300 to-teal-300 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                                    {num}
                                </div>
                            ))}
                            {Array.from({ length: sequence.length - userInput.length }).map((_, i) => (
                                <div key={i} className="w-14 h-14 rounded-xl bg-white/50 dark:bg-zinc-700/50 border-2 border-dashed border-zinc-300 dark:border-zinc-600"></div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleNumberClick(num)}
                                    className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 text-2xl font-black text-zinc-700 dark:text-zinc-200 shadow-xl transition-all active:scale-95 border-2 border-zinc-200 dark:border-zinc-600"
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {phase === 'feedback' && (
                    <div className="text-center">
                        <div className={`text-4xl font-black mb-4 ${lastWasCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                            {lastWasCorrect ? 'Harika! Doğru!' : 'Hatalı!'}
                        </div>
                        <div className="flex gap-3 justify-center">
                            <div className="text-sm text-zinc-500">Doğru dizi:</div>
                            {sequence.map((num, i) => (
                                <div key={i} className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xl font-black text-zinc-700 dark:text-zinc-200">
                                    {num}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
