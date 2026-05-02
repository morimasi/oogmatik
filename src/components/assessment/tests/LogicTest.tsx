
import React, { useState, useRef } from 'react';
import { SubTestResult } from '../../../types';

interface LogicTestProps {
    onComplete: (result: SubTestResult) => void;
}

interface LogicQuestion {
    id: number;
    grid: string[][];
    options: string[];
    answer: string;
    rule: string;
    difficulty: 'easy' | 'medium' | 'hard';
    hint?: string;
}

// Genişletilmiş soru bankası
const questions: LogicQuestion[] = [
    {
        id: 1,
        grid: [['⬛', '⬛', '⬛'], ['⬛', '⬛', '⬛'], ['⬛', '⬛', '?']],
        options: ['⬜', '⬛', '🔴'],
        answer: '⬛',
        rule: 'Desen Tekrarı',
        difficulty: 'easy',
        hint: 'Tüm kareler aynı renk'
    },
    {
        id: 2,
        grid: [['⬆️', '➡️'], ['⬇️', '?']],
        options: ['⬅️', '↗️', '⬆️'],
        answer: '⬅️',
        rule: 'Saat Yönünde Döndürme',
        difficulty: 'medium',
        hint: 'Oklar saat yönünde döner'
    },
    {
        id: 3,
        grid: [['1', '2'], ['3', '?']],
        options: ['4', '5', '1'],
        answer: '4',
        rule: 'Sıralama',
        difficulty: 'easy',
        hint: 'Sayılar sırayla artıyor'
    },
    {
        id: 4,
        grid: [['🔴', '🔵'], ['🔵', '?']],
        options: ['🔴', '🔵', '🟢'],
        answer: '🔴',
        rule: 'Diyagonal Desen',
        difficulty: 'medium',
        hint: 'Köşegen boyunca renk eşleşiyor'
    },
    {
        id: 5,
        grid: [['🔷', '🔷', '🔷'], ['🔷', '🔶', '🔷'], ['🔷', '🔷', '?']],
        options: ['🔷', '🔶', '⬛'],
        answer: '🔷',
        rule: 'Simetri',
        difficulty: 'medium',
        hint: 'Merkez farklı, köşeler aynı'
    },
    {
        id: 6,
        grid: [['2', '4', '8'], ['3', '6', '12'], ['4', '8', '?']],
        options: ['14', '16', '12'],
        answer: '16',
        rule: 'İkiye Katlama',
        difficulty: 'hard',
        hint: 'Her satırda sayılar ikiye katlanıyor'
    },
    {
        id: 7,
        grid: [['🌑', '🌒', '🌓'], ['🌔', '🌕', '🌖'], ['🌗', '🌘', '?']],
        options: ['🌑', '🌕', '🌙'],
        answer: '🌑',
        rule: 'Döngüsel Sıra',
        difficulty: 'hard',
        hint: 'Ay evreleri döngüsel devam eder'
    },
    {
        id: 8,
        grid: [['🔺', '🔺', '🔻'], ['🔺', '🔻', '🔻'], ['🔻', '🔻', '?']],
        options: ['🔺', '🔻', '🔷'],
        answer: '🔻',
        rule: 'Azalan Desen',
        difficulty: 'hard',
        hint: 'Yukarı üçgenler satır satır azalıyor'
    }
];

export const LogicTest: React.FC<LogicTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'running'>('intro');
    const [qIndex, setQIndex] = useState(0);
    // FIX: Race condition önlemi — score'u ref ile takip et
    const scoreRef = useRef(0);
    const [scoreDisplay, setScoreDisplay] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const startTimeRef = useRef(Date.now());
    const reactionTimes = useRef<number[]>([]);
    const questionStartTime = useRef(Date.now());

    const handleShowHint = () => {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000); // 3 saniye sonra kaybolur
    };

    const handleAnswer = (val: string) => {
        if (showFeedback) return;

        const rt = Date.now() - questionStartTime.current;
        reactionTimes.current.push(rt);

        setSelectedAnswer(val);
        setShowFeedback(true);

        // FIX: newScore'u doğrudan hesapla ve argüman olarak ilet
        const isCorrect = val === questions[qIndex].answer;
        const newScore = isCorrect ? scoreRef.current + 1 : scoreRef.current;
        if (isCorrect) {
            scoreRef.current = newScore;
            setScoreDisplay(newScore);
        }

        setTimeout(() => {
            setShowFeedback(false);
            setShowHint(false); // Soru değiştiğinde ipucu sıfırlansın
            setSelectedAnswer(null);

            if (qIndex < questions.length - 1) {
                setQIndex(q => q + 1);
                questionStartTime.current = Date.now();
            } else {
                // FIX: scoreRef.current kullan — state'in commit olmasını bekleme
                finishWithScore(newScore);
            }
        }, 1000);
    };

    const finishWithScore = (finalScore: number) => {
        const _totalTime = Date.now() - startTimeRef.current;
        const avgRT = reactionTimes.current.length > 0
            ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
            : 0;
        const accuracy = (finalScore / questions.length) * 100;

        onComplete({
            testId: 'logical_reasoning',
            name: 'Mantıksal Muhakeme',
            score: Math.round(accuracy),
            rawScore: finalScore,
            totalItems: questions.length,
            avgReactionTime: Math.round(avgRT),
            accuracy: Math.round(accuracy),
            status: 'completed',
            timestamp: Date.now()
        });
    };

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none">
                <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-brain text-4xl text-amber-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">Mantıksal Muhakeme</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Matristeki <span className="font-bold text-amber-600">deseni</span> bul ve soru işaretinin yerine
                        gelmesi gereken şekli seç. {questions.length} soru var.
                    </p>
                </div>
                <div className="flex gap-4 text-xs text-zinc-400">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">Kolay × 2</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold">Orta × 3</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold">Zor × 3</span>
                </div>
                <button
                    onClick={() => { startTimeRef.current = Date.now(); questionStartTime.current = Date.now(); scoreRef.current = 0; setPhase('running'); }}
                    className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    <i className="fa-solid fa-play"></i> Teste Başla
                </button>
            </div>
        );
    }

    const currentQ = questions[qIndex];
    const gridCols = currentQ.grid[0].length;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-xl mx-auto select-none relative">
            {/* Başlık */}
            <div className="text-center mb-6 w-full">
                <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        Soru {qIndex + 1} / {questions.length}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${currentQ.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            currentQ.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                        }`}>
                        {currentQ.difficulty === 'easy' ? 'Kolay' : currentQ.difficulty === 'medium' ? 'Orta' : 'Zor'}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${((qIndex) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Matrix Grid */}
            <div
                className="grid gap-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-6 rounded-3xl shadow-xl mb-10"
                style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
            >
                {currentQ.grid.flat().map((item, i) => (
                    <div
                        key={i}
                        className={`w-20 h-20 flex items-center justify-center text-4xl rounded-xl transition-all
                            ${item === '?' ? 'bg-gradient-to-br from-indigo-400 to-indigo-500 text-white shadow-lg' : 'bg-white dark:bg-zinc-800 shadow-md'}`}
                    >
                        {item === '?' ? (
                            <span className="text-3xl font-black text-white">?</span>
                        ) : item}
                    </div>
                ))}
            </div>

            {/* Seçenekler */}
            <div className="flex gap-5 mb-4">
                {currentQ.options.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = opt === currentQ.answer;
                    let borderColor = "border-zinc-200 dark:border-zinc-700";
                    if (showFeedback && isSelected) {
                        borderColor = isCorrect ? "border-green-500" : "border-red-500";
                    }
                    return (
                        <button
                            key={i}
                            onClick={() => handleAnswer(opt)}
                            disabled={showFeedback}
                            className={`w-24 h-24 rounded-2xl text-4xl shadow-md transition-all active:scale-95 disabled:cursor-not-allowed flex items-center justify-center relative
                                ${showFeedback && isSelected
                                    ? isCorrect 
                                        ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg' 
                                        : 'bg-gradient-to-br from-red-400 to-red-500 text-white shadow-lg'
                                    : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 hover:from-amber-200 hover:to-orange-200 shadow-lg'
                                }`}
                        >
                            {showFeedback && isSelected ? (
                                <span className="text-white font-bold">{opt}</span>
                            ) : (
                                <span className="text-amber-700 dark:text-amber-300 font-bold">{opt}</span>
                            )}
                            {showFeedback && isSelected && (
                                <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
                                    <i className={`fa-solid ${isCorrect ? 'fa-check' : 'fa-times'}`}></i>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* İpucu Kutusu */}
            {showHint && currentQ.hint && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg border-2 border-amber-600 max-w-xs">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-lightbulb text-yellow-200"></i>
                            <span className="text-sm font-bold">{currentQ.hint}</span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-amber-600"></div>
                    </div>
                </div>
            )}

            {/* İpucu Butonu ve Skor göstergesi */}
            <div className="flex items-center gap-4 text-sm text-zinc-400">
                <button
                    onClick={handleShowHint}
                    disabled={showHint || showFeedback}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                    <i className="fa-solid fa-lightbulb"></i>
                    İpucu
                </button>
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-check-circle text-green-500"></i>
                    <span>{scoreDisplay} / {qIndex} doğru</span>
                </div>
            </div>
        </div>
    );
};
