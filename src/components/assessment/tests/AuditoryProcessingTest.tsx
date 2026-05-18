
import React, { useState, useEffect, useRef } from 'react';
import { SubTestResult } from '../../../types';

interface AuditoryProcessingTestProps {
    onComplete: (result: SubTestResult) => void;
}

export const AuditoryProcessingTest: React.FC<AuditoryProcessingTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'listen' | 'respond' | 'feedback'>('intro');
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [startTime, setStartTime] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const [currentWord, setCurrentWord] = useState('');
    const [options, setOptions] = useState<string[]>([]);
    const [lastWasCorrect, setLastWasCorrect] = useState<boolean | null>(null);
    const maxScoreRef = React.useRef(0);
    const audioContextRef = useRef<AudioContext | null>(null);

    const wordList = [
        'elma', 'armut', 'kiraz', 'portakal', 'muz', 'çilek', 'üzüm', 'şeftali',
        'kedi', 'köpek', 'kuş', 'balık', 'tavşan', 'fare', 'aslan', 'fil',
        'ev', 'okul', 'park', 'kütüphane', 'hastane', 'market', 'sinema', 'spor salonu'
    ];

    const playWord = (word: string) => {
        if (!('speechSynthesis' in window)) return;
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'tr-TR';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    };

    const generateLevel = () => {
        maxScoreRef.current += level * 10;
        const targetIdx = Math.floor(Math.random() * wordList.length);
        const target = wordList[targetIdx];
        setCurrentWord(target);

        const opts = [target];
        while (opts.length < 4) {
            const randomIdx = Math.floor(Math.random() * wordList.length);
            const randomWord = wordList[randomIdx];
            if (!opts.includes(randomWord)) {
                opts.push(randomWord);
            }
        }
        setOptions(opts.sort(() => Math.random() - 0.5));

        setPhase('listen');
        playWord(target);
        setTimeout(() => {
            setPhase('respond');
            setStartTime(Date.now());
        }, 1500);
    };

    const handleOptionClick = (option: string) => {
        if (phase !== 'respond') return;
        const isCorrect = option === currentWord;
        setLastWasCorrect(isCorrect);
        setPhase('feedback');
        setReactionTimes(prev => [...prev, Date.now() - startTime]);

        setTimeout(() => {
            if (isCorrect) {
                setScore(prev => prev + level * 10);
                setLevel(prev => prev + 1);
            } else {
                setLives(prev => prev - 1);
            }
        }, 1500);
    };

    useEffect(() => {
        if (phase === 'intro') return;
        if (lives <= 0) {
            finishTest();
            return;
        }
        generateLevel();
    }, [level, lives]);

    const finishTest = () => {
        const avgRT = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
        const maxTheoreticalScore = Math.max(maxScoreRef.current, 1);
        const normalized = Math.min(100, Math.round((score / maxTheoreticalScore) * 100));

        onComplete({
            testId: 'auditory_processing',
            name: 'İşitsel İşleme',
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
                <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-volume-high text-4xl text-blue-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">İşitsel İşleme</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Sesli söylenen kelimeyi dinle ve doğru seçeneği işaretle.
                        Her seviyede hız artar.
                    </p>
                </div>
                <button
                    onClick={() => {
                        maxScoreRef.current = 0;
                        setLevel(1);
                        setLives(3);
                        setScore(0);
                        generateLevel();
                    }}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    <i className="fa-solid fa-play"></i> Teste Başla
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full select-none relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-blue-900/20 dark:via-sky-900/20 dark:to-cyan-900/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
                <div className="mb-8 text-center">
                    <h3 className="text-3xl font-black text-zinc-800 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">Kelimeyi Bul</h3>
                    <div className="flex gap-8 justify-center items-center">
                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            <i className="fa-solid fa-layer-group text-blue-500"></i>
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

                {phase === 'listen' && (
                    <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-4xl animate-pulse shadow-xl shadow-blue-500/30 mb-4">
                            <i className="fa-solid fa-ear-listen"></i>
                        </div>
                        <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300">Dinliyor...</p>
                    </div>
                )}

                {phase === 'respond' && (
                    <div className="grid grid-cols-2 gap-4">
                        {options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleOptionClick(opt)}
                                className="w-40 h-20 rounded-2xl bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 text-lg font-bold text-zinc-700 dark:text-zinc-200 shadow-xl transition-all active:scale-95 border-2 border-zinc-200 dark:border-zinc-600"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {phase === 'feedback' && (
                    <div className="text-center">
                        <div className={`text-4xl font-black mb-4 ${lastWasCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                            {lastWasCorrect ? 'Harika! Doğru!' : 'Hatalı!'}
                        </div>
                        <div className="text-lg text-zinc-600 dark:text-zinc-400">
                            Doğru kelime: <span className="font-bold text-blue-600">{currentWord}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
