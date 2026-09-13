import React, { useState, useEffect } from 'react';
import { SubTestResult } from '../../../types';

interface VerbalComprehensionTestProps {
    onComplete: (result: SubTestResult) => void;
    studentAge?: number;
}

interface Question {
    word: string;
    options: string[];
    correct: string;
}

const QUESTIONS_BANK: Question[] = [
    { word: 'büyük', options: ['küçük', 'uzun', 'kısa', 'geniş'], correct: 'küçük' },
    { word: 'sıcak', options: ['soğuk', 'ılık', 'güzel', 'kötü'], correct: 'soğuk' },
    { word: 'hızlı', options: ['yavaş', 'uzun', 'kısa', 'yüksek'], correct: 'yavaş' },
    { word: 'mutlu', options: ['üzgün', 'korkmuş', 'öfkeli', 'şaşkın'], correct: 'üzgün' },
    { word: 'açık', options: ['kapalı', 'karanlık', 'aydınlık', 'güzel'], correct: 'kapalı' },
    { word: 'yukarı', options: ['aşağı', 'sağ', 'sol', 'ön'], correct: 'aşağı' },
    { word: 'doğru', options: ['yanlış', 'iyi', 'kötü', 'güzel'], correct: 'yanlış' },
    { word: 'eski', options: ['yeni', 'modern', 'klasik', 'antika'], correct: 'yeni' },
    { word: 'güçlü', options: ['zayıf', 'hızlı', 'yavaş', 'uzun'], correct: 'zayıf' },
    { word: 'doluluk', options: ['boşluk', 'kalabalık', 'azlık', 'çokluk'], correct: 'boşluk' },
    { word: 'sert', options: ['katı', 'yumuşak', 'sıcak', 'dayanıklı'], correct: 'yumuşak' },
    { word: 'ince', options: ['küçük', 'dar', 'kalın', 'hafif'], correct: 'kalın' },
    { word: 'kolay', options: ['basit', 'ağır', 'karmaşık', 'zor'], correct: 'zor' },
    { word: 'tembel', options: ['yavaş', 'çalışkan', 'güçsüz', 'sakin'], correct: 'çalışkan' },
    { word: 'karanlık', options: ['loş', 'aydınlık', 'parlak', 'koyu'], correct: 'aydınlık' },
    { word: 'dar', options: ['küçük', 'kısa', 'geniş', 'rahat'], correct: 'geniş' },
    { word: 'fakir', options: ['cimri', 'güçlü', 'zengin', 'büyük'], correct: 'zengin' },
    { word: 'sakin', options: ['huzurlu', 'sessiz', 'gürültülü', 'rahat'], correct: 'gürültülü' },
    { word: 'yaşlı', options: ['yeni', 'eski', 'taze', 'genç'], correct: 'genç' },
    { word: 'kaba', options: ['sert', 'nazik', 'küstah', 'yumuşak'], correct: 'nazik' },
    { word: 'derin', options: ['yüksek', 'alçak', 'sığ', 'geniş'], correct: 'sığ' },
    { word: 'berrak', options: ['temiz', 'bulanık', 'duru', 'parlak'], correct: 'bulanık' },
    { word: 'cesur', options: ['korkak', 'atak', 'güçlü', 'hırslı'], correct: 'korkak' },
    { word: 'cömert', options: ['bonkör', 'cimri', 'eli açık', 'yardımsever'], correct: 'cimri' },
];

export const VerbalComprehensionTest: React.FC<VerbalComprehensionTestProps> = ({ onComplete, studentAge = 7 }) => {
    const [phase, setPhase] = useState<'intro' | 'question' | 'feedback'>('intro');
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [startTime, setStartTime] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const maxScoreRef = React.useRef(0);

    const shuffleOptions = (opts: string[]): string[] => {
        const copy = [...opts];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const generateQuestion = () => {
        maxScoreRef.current += level * 10;
        const availablePool = QUESTIONS_BANK.slice(0, Math.min(QUESTIONS_BANK.length, level * 3 + 3));
        const idx = Math.floor(Math.random() * availablePool.length);
        const q = availablePool[idx];
        
        const optionCount = studentAge <= 7 ? 3 : 4;
        const shuffled = shuffleOptions(q.options);
        const filteredOptions = shuffled.includes(q.correct) 
          ? shuffled.slice(0, optionCount) 
          : [q.correct, ...shuffled.slice(0, optionCount - 1)];

        setCurrentQuestion({ ...q, options: shuffleOptions(filteredOptions) });
        setSelectedAnswer(null);
        setPhase('question');
        setStartTime(Date.now());
    };

    const handleAnswer = (answer: string) => {
        if (!currentQuestion || phase !== 'question') return;
        setSelectedAnswer(answer);
        setReactionTimes(prev => [...prev, Date.now() - startTime]);
        setPhase('feedback');
    };

    useEffect(() => {
        if (phase === 'intro') return;
        if (lives <= 0) {
            finishTest();
            return;
        }
        if (phase === 'feedback') {
            const isCorrect = selectedAnswer === currentQuestion?.correct;
            if (isCorrect) {
                setScore(prev => prev + level * 10);
                setLevel(prev => prev + 1);
            } else {
                setLives(prev => prev - 1);
            }

            const timer = setTimeout(() => {
                generateQuestion();
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [phase, lives]);

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
            <div className="flex flex-col items-center justify-center w-full h-full select-none gap-6 p-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <i className="fa-solid fa-book-open text-3xl text-indigo-500"></i>
                </div>
                <div className="max-w-md">
                    <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Sözel Kavrama</h3>
                    <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                        Verilen kelimenin zıt (karşıt) anlamlısını bulun.
                    </p>
                </div>
                <button
                    onClick={() => {
                        maxScoreRef.current = 0;
                        setLevel(1);
                        setLives(3);
                        setScore(0);
                        setReactionTimes([]);
                        generateQuestion();
                    }}
                    className="px-8 py-3.5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                    <i className="fa-solid fa-play"></i> Teste Başla
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-between w-full h-full p-4 select-none relative overflow-y-auto">
            {/* Header Status */}
            <div className="w-full bg-[var(--bg-paper)] p-3 rounded-2xl border border-[var(--border-color)] flex items-center justify-between shadow-sm mb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        Soru {level}
                    </span>
                    <span className="text-xs font-black text-[var(--accent-color)]">
                        {score} Puan
                    </span>
                </div>
                <div className="flex gap-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <i key={i} className={`fa-solid fa-heart text-sm ${i < lives ? 'text-rose-500' : 'text-zinc-300 dark:text-zinc-700'}`}></i>
                    ))}
                </div>
            </div>

            {/* Question Display */}
            {phase === 'question' && currentQuestion && (
                <div className="flex-1 flex flex-col items-center justify-center w-full my-auto space-y-6">
                    <div className="text-center">
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Zıt Anlamlısını Bul</p>
                        <div className="px-8 py-4 bg-[var(--bg-paper)] rounded-2xl shadow-md border-2 border-[var(--accent-color)]/30 text-2xl font-black text-[var(--text-primary)]">
                            "{currentQuestion.word}"
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className="p-4 bg-[var(--bg-paper)] hover:bg-[var(--surface-glass)] text-[var(--text-primary)] font-bold text-sm rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all active:scale-95 text-center"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Feedback Display */}
            {phase === 'feedback' && currentQuestion && (
                <div className="flex-1 flex flex-col items-center justify-center my-auto text-center space-y-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${selectedAnswer === currentQuestion.correct ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        <i className={`fa-solid ${selectedAnswer === currentQuestion.correct ? 'fa-check' : 'fa-xmark'}`}></i>
                    </div>
                    <p className={`text-base font-black ${selectedAnswer === currentQuestion.correct ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {selectedAnswer === currentQuestion.correct ? 'Tebrikler, Doğru!' : 'Hatalı Yanıt'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] font-medium">
                        "{currentQuestion.word}" zıt anlamlısı: <span className="font-bold text-[var(--text-primary)]">{currentQuestion.correct}</span>
                    </p>
                </div>
            )}
        </div>
    );
};
