import React, { useState, useEffect } from 'react';
import { SubTestResult } from '../../../types';
import { generateAIAssessmentContent, AIGeneratedTestItems } from '../../../services/aiAssessmentGenerator';
import { CognitiveProfileMetrics } from '../services/cognitiveAdaptiveService';

interface VerbalComprehensionTestProps {
    onComplete: (result: SubTestResult) => void;
    studentAge?: number;
    studentProfile?: CognitiveProfileMetrics;
}

interface Question {
    word: string;
    options: string[];
    correct: string;
}

const DEFAULT_QUESTIONS: Question[] = [
    { word: 'büyük', options: ['küçük', 'uzun', 'kısa', 'geniş'], correct: 'küçük' },
    { word: 'sıcak', options: ['soğuk', 'ılık', 'güzel', 'kötü'], correct: 'soğuk' },
    { word: 'hızlı', options: ['yavaş', 'uzun', 'kısa', 'yüksek'], correct: 'yavaş' },
    { word: 'mutlu', options: ['üzgün', 'korkmuş', 'öfkeli', 'şaşkın'], correct: 'üzgün' },
    { word: 'açık', options: ['kapalı', 'karanlık', 'aydınlık', 'güzel'], correct: 'kapalı' },
    { word: 'yukarı', options: ['aşağı', 'sağ', 'sol', 'ön'], correct: 'aşağı' },
];

export const VerbalComprehensionTest: React.FC<VerbalComprehensionTestProps> = ({
    onComplete,
    studentAge = 7,
    studentProfile
}) => {
    const [phase, setPhase] = useState<'intro' | 'loading' | 'question' | 'feedback'>('intro');
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [startTime, setStartTime] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [aiMeta, setAiMeta] = useState<{ label?: string; guidance?: string }>({});
    const maxScoreRef = React.useRef(0);

    const shuffleOptions = (opts: string[]): string[] => {
        const copy = [...opts];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const handleStart = async () => {
        if (studentProfile) {
            setPhase('loading');
            const aiData = await generateAIAssessmentContent('verbal_comprehension', studentProfile);
            if (aiData && aiData.items && aiData.items.length > 0) {
                setQuestions(aiData.items);
                setAiMeta({
                    label: aiData.adaptiveDifficultyLabel,
                    guidance: aiData.pedagogicalGuidance
                });
            }
        }
        startLevel(1);
    };

    const startLevel = (nextLevel: number) => {
        maxScoreRef.current += nextLevel * 10;
        const qIdx = (nextLevel - 1) % questions.length;
        const q = questions[qIdx];
        if (q) {
            setCurrentQuestion({
                ...q,
                options: shuffleOptions(q.options)
            });
        }
        setSelectedAnswer(null);
        setPhase('question');
        setStartTime(Date.now());
    };

    const handleAnswerClick = (option: string) => {
        if (phase !== 'question' || !currentQuestion) return;

        setSelectedAnswer(option);
        const reactionTime = Date.now() - startTime;
        setReactionTimes(prev => [...prev, reactionTime]);

        const isCorrect = option === currentQuestion.correct;
        setPhase('feedback');

        setTimeout(() => {
            if (isCorrect) {
                setScore(prev => prev + level * 10);
                if (level < questions.length && lives > 0) {
                    const nxt = level + 1;
                    setLevel(nxt);
                    startLevel(nxt);
                } else {
                    finishTest(score + level * 10, level);
                }
            } else {
                const nextLives = lives - 1;
                setLives(nextLives);
                if (nextLives <= 0 || level >= questions.length) {
                    finishTest(score, level);
                } else {
                    const nxt = level + 1;
                    setLevel(nxt);
                    startLevel(nxt);
                }
            }
        }, 1200);
    };

    const finishTest = (finalScore: number, totalPlayed: number) => {
        const avgRT = reactionTimes.length > 0
            ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
            : 1500;

        const maxScore = Math.max(10, totalPlayed * 10);
        const normalized = Math.min(100, Math.round((finalScore / maxScore) * 100));

        onComplete({
            testId: 'verbal_comprehension',
            name: 'Sözel Kavrama (AI Adaptif)',
            score: normalized,
            rawScore: finalScore,
            totalItems: totalPlayed,
            avgReactionTime: avgRT,
            accuracy: normalized,
            status: 'completed',
            timestamp: Date.now()
        });
    };

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none p-6 font-['Lexend']">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl text-white text-3xl">
                    <i className="fa-solid fa-comments"></i>
                </div>

                <div className="text-center max-w-md">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-full">
                        AI Destekli Dinamik Soru Motoru
                    </span>
                    <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-3 mb-2">
                        Sözel Kavrama Testi
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed font-medium">
                        Verilen kelimenin <span className="font-black text-emerald-600">karşıt (zıt) anlamlısını</span> seçin.
                    </p>
                </div>

                <button
                    onClick={handleStart}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    Teste Başla
                </button>
            </div>
        );
    }

    if (phase === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-4 text-center animate-in fade-in font-['Lexend']">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <h4 className="font-black text-base text-zinc-800 dark:text-zinc-100">
                    Gemini 2.5 Flash Kişiselleştirilmiş Soruları Üretiyor...
                </h4>
                <p className="text-xs text-zinc-500 max-w-xs">
                    Öğrenci profili ve tanı geçmişine özel nöropsikolojik kelime seti hazırlanıyor.
                </p>
            </div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-2xl mx-auto p-4 select-none font-['Lexend'] gap-6">
            {/* Header */}
            <div className="w-full flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                        {level}
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-emerald-600">SÖZEL DİL</span>
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Zıt Anlamlısını Bul</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <i key={i} className={`fa-solid fa-heart text-xs ${i <= lives ? 'text-rose-500' : 'text-zinc-300 dark:text-zinc-700'}`}></i>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Meta Bilgi Kartı */}
            {aiMeta.label && (
                <div className="w-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300">
                    <p className="font-black">🤖 AI Zorluk Uyarısı: {aiMeta.label}</p>
                    {aiMeta.guidance && <p className="text-[11px] opacity-90 mt-0.5">{aiMeta.guidance}</p>}
                </div>
            )}

            {/* Hedef Kelime */}
            <div className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-center text-white shadow-xl">
                <span className="text-xs font-black uppercase tracking-widest opacity-80 block mb-1">HEDEF KELİME</span>
                <h2 className="text-4xl font-black tracking-tight">{currentQuestion.word}</h2>
            </div>

            {/* Seçenekler */}
            <div className="grid grid-cols-2 gap-4 w-full">
                {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = opt === currentQuestion.correct;
                    let btnStyle = 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:border-emerald-400';

                    if (phase === 'feedback') {
                        if (isCorrect) btnStyle = 'bg-emerald-500 text-white border-emerald-500 shadow-lg scale-105';
                        else if (isSelected) btnStyle = 'bg-rose-500 text-white border-rose-500';
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswerClick(opt)}
                            disabled={phase === 'feedback'}
                            className={`p-5 rounded-2xl border-2 text-lg font-black transition-all shadow-sm flex items-center justify-center cursor-pointer ${btnStyle}`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
