
import React, { useState, useEffect } from 'react';
import { SubTestResult } from '../../../types';

interface VerbalComprehensionTestProps {
    onComplete: (result: SubTestResult) => void;
}

interface Question {
    word: string;
    options: string[];
    correct: string;
}

export const VerbalComprehensionTest: React.FC<VerbalComprehensionTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'question' | 'feedback'>('intro');
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [startTime, setStartTime] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [lastWasCorrect, setLastWasCorrect] = useState<boolean | null>(null);
    const maxScoreRef = React.useRef(0);

    const questions: Question[] = [
        { word: 'büyük', options: ['küçük', 'uzun', 'kısa', 'geniş'], correct: 'küçük' },
        { word: 'sıcak', options: ['soğuk', 'ılık', 'güzel', 'kötü'], correct: 'soğuk' },
        { word: 'hızlı', options: ['yavaş', 'uzun', 'kısa', 'yüksek'], correct: 'yavaş' },
        { word: 'mutlu', options: ['üzgün', 'korkmuş', 'öfkeli', 'şaşkın'], correct: 'üzgün' },
        { word: 'açık', options: ['kapalı', 'karanlık', 'aydınlık', 'güzel'], correct: 'kapalı' },
        { word: 'yukarı', options: ['aşağı', 'sağ', 'sol', 'ön'], correct: 'aşağı' },
        { word: 'doğru', options: ['yanlış', 'iyi', 'kötü', 'güzel'], correct: 'yanlış' },
        { word: 'eski', options: ['yeni', 'modern', 'eski', 'klasik'], correct: 'yeni' },
        { word: 'güçlü', options: ['zayıf', 'hızlı', 'yavaş', 'uzun'], correct: 'zayıf' },
        { word: 'doluluk', options: ['boşluk', 'kalabalık', 'az', 'çok'], correct: 'boşluk' }
    ];

    const generateQuestion = () => {
        maxScoreRef.current += level * 10;
        const idx = Math.floor(Math.random() * questions.length);
        const q = questions[idx];
        setCurrentQuestion(q);
        setPhase('question');
        setStartTime(Date.now());
    };

    const handleAnswer = (answer: string) => {
        if (!currentQuestion || phase !== 'question') return;
        const isCorrect = answer === currentQuestion.correct;
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
        generateQuestion();
    }, [level, lives]);

    const finishTest = () => {
        const avgRT = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
        const maxTheoreticalScore = Math.max(maxScoreRef.current, 1);
        const normalized = Math.min(100, Math.round((score / maxTheoreticalScore) * 100));

        onComplete({
            testId: 'verbal_comprehension',
            name: 'Sözel Kavrama',
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
                <div className="w-20 h-20 rounded-2xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-book text-4xl text-rose-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">Sözel Kavrama</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Verilen kelimenin zıt anlamlısını bul.
                        Her seviyede sorular zorlaşır.
                    </p>
                </div>
                <button
                    onClick={() => {
                        maxScoreRef.current = 0;
                        setLevel(1);
                        setLives(3);
                        setScore(0);
                        generateQuestion();
                    }}
                    className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    <i className="fa-solid fa-play"></i> Teste Başla
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full select-none relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-fuchsia-900/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
                <div className="mb-8 text-center">
                    <h3 className="text-3xl font-black text-zinc-800 dark:text-white mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Zıt Anlamlıyı Bul</h3>
                    <div className="flex gap-8 justify-center items-center">
                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            <i className="fa-solid fa-layer-group text-rose-500"></i>
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

                {phase === 'question' && currentQuestion && (
                    <>
                        <div className="text-center mb-8">
                            <p className="text-4xl font-black text-zinc-800 dark:text-white mb-2">{currentQuestion.word}</p>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400">Bu kelimenin zıt anlamlısı hangisi?</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {currentQuestion.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(opt)}
                                    className="w-40 h-20 rounded-2xl bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 text-lg font-bold text-zinc-700 dark:text-zinc-200 shadow-xl transition-all active:scale-95 border-2 border-zinc-200 dark:border-zinc-600"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {phase === 'feedback' && currentQuestion && (
                    <div className="text-center">
                        <div className={`text-4xl font-black mb-4 ${lastWasCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                            {lastWasCorrect ? 'Harika! Doğru!' : 'Hatalı!'}
                        </div>
                        <div className="text-lg text-zinc-600 dark:text-zinc-400">
                            Doğru cevap: <span className="font-bold text-rose-600">{currentQuestion.correct}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
