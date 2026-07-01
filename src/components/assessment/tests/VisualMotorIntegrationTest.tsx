import React, { useState, useEffect } from 'react';
import { SubTestResult } from '../../../types';

interface VisualMotorIntegrationTestProps {
    onComplete: (result: SubTestResult) => void;
}

type Shape = 'circle' | 'square' | 'triangle' | 'star' | 'hexagon' | 'pentagon';

interface Question {
    target: Shape;
    options: Shape[];
}

export const VisualMotorIntegrationTest: React.FC<VisualMotorIntegrationTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'question' | 'feedback'>('intro');
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [startTime, setStartTime] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedOption, setSelectedOption] = useState<Shape | null>(null);
    const maxScoreRef = React.useRef(0);

    const shapes: Shape[] = ['circle', 'square', 'triangle', 'star', 'hexagon', 'pentagon'];

    const generateQuestion = (currentLevel: number): Question => {
        const shapeIndex = Math.min(Math.floor((currentLevel - 1) / 2), shapes.length - 1);
        const target = shapes[shapeIndex];
        const optionCount = Math.min(4, shapeIndex + 3);
        const otherShapes = shapes.filter(s => s !== target);
        const distractorCount = optionCount - 1;
        const distractors: Shape[] = [];

        while (distractors.length < distractorCount) {
            const randomShape = otherShapes[Math.floor(Math.random() * otherShapes.length)];
            if (!distractors.includes(randomShape)) {
                distractors.push(randomShape);
            }
        }

        const options = [...distractors, target];
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        return { target, options };
    };

    const startLevel = () => {
        maxScoreRef.current += level * 10;
        setCurrentQuestion(generateQuestion(level));
        setSelectedOption(null);
        setPhase('question');
        setStartTime(Date.now());
    };

    const handleAnswer = (shape: Shape) => {
        if (phase !== 'question' || !currentQuestion) return;
        setSelectedOption(shape);
        setReactionTimes(prev => [...prev, Date.now() - startTime]);
        setPhase('feedback');
    };

    const evaluateAnswer = () => {
        if (!currentQuestion || !selectedOption) return;
        const isCorrect = selectedOption === currentQuestion.target;

        if (isCorrect) {
            setScore(prev => prev + level * 10);
            setLevel(prev => prev + 1);
        } else {
            setLives(prev => prev - 1);
        }
    };

    useEffect(() => {
        if (phase === 'intro') return;
        if (lives <= 0) {
            finishTest();
            return;
        }
        if (phase === 'feedback') {
            evaluateAnswer();
            setTimeout(() => {
                startLevel();
            }, 1500);
        }
    }, [phase, lives]);

    const finishTest = () => {
        const avgRT = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
        const maxTheoreticalScore = Math.max(maxScoreRef.current, 1);
        const normalized = Math.min(100, Math.round((score / maxTheoreticalScore) * 100));

        onComplete({
            testId: 'visual_motor_integration',
            name: 'Görsel-Motor Entegrasyon',
            score: normalized,
            rawScore: score,
            totalItems: level - 1,
            avgReactionTime: Math.round(avgRT),
            accuracy: normalized,
            status: 'completed',
            timestamp: Date.now()
        });
    };

    const shapeNames: Record<Shape, string> = {
        circle: 'Daire',
        square: 'Kare',
        triangle: 'Üçgen',
        star: 'Yıldız',
        hexagon: 'Altıgen',
        pentagon: 'Beşgen'
    };

    const ShapeIcon = ({ shape, size = 64, color = '#4f46e5' }: { shape: Shape; size?: number; color?: string }) => {
        const svgSize = size;
        const strokeWidth = 3;

        switch (shape) {
            case 'circle':
                return (
                    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            case 'square':
                return (
                    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100">
                        <rect x="15" y="15" width="70" height="70" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            case 'triangle':
                return (
                    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100">
                        <polygon points="50,10 90,90 10,90" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            case 'star':
                return (
                    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100">
                        <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            case 'hexagon':
                return (
                    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100">
                        <polygon points="50,5 93,30 93,70 50,95 7,70 7,30" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            case 'pentagon':
                return (
                    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100">
                        <polygon points="50,5 97,38 79,95 21,95 3,38" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            default:
                return null;
        }
    };

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full select-none gap-8 animate-in fade-in">
                <div className="w-20 h-20 rounded-2xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-shapes text-4xl text-orange-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">Görsel-Motor Entegrasyon</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Ekranda gösterilen şekli seçeneklerden bulun ve işaretleyin.
                        Görsel algı ve şekil tanıma becerilerinizi test edeceğiz.
                    </p>
                </div>
                <button
                    onClick={() => {
                        maxScoreRef.current = 0;
                        setLevel(1);
                        setLives(3);
                        setScore(0);
                        setReactionTimes([]);
                        startLevel();
                    }}
                    className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    <i className="fa-solid fa-play"></i> Teste Başla
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full select-none relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
                <div className="mb-6 text-center">
                    <h3 className="text-3xl font-black text-zinc-800 dark:text-white mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        {phase === 'question' ? 'Şekli Bul' : phase === 'feedback' ? (selectedOption === currentQuestion?.target ? 'Harika!' : 'Tekrar Dene!') : ''}
                    </h3>
                    <div className="flex gap-8 justify-center items-center">
                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            <i className="fa-solid fa-layer-group text-orange-500"></i>
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
                            <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-4">Hangi şekil bu?</p>
                            <div className="w-32 h-32 mx-auto bg-white rounded-3xl shadow-xl border-2 border-zinc-200 dark:border-zinc-600 flex items-center justify-center">
                                <ShapeIcon shape={currentQuestion.target} size={100} color="#4f46e5" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(option)}
                                    className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-zinc-700 rounded-2xl shadow-lg border-2 border-zinc-200 dark:border-zinc-600 hover:border-orange-500 hover:shadow-orange-500/20 transition-all active:scale-95"
                                >
                                    <ShapeIcon shape={option} size={64} color="#4f46e5" />
                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{shapeNames[option]}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {phase === 'feedback' && currentQuestion && (
                    <div className="text-center animate-in zoom-in">
                        <div className={`text-6xl mb-4 ${selectedOption === currentQuestion.target ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {selectedOption === currentQuestion.target ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-circle-xmark"></i>}
                        </div>
                        <p className={`text-2xl font-black mb-2 ${selectedOption === currentQuestion.target ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {selectedOption === currentQuestion.target ? 'Doğru!' : 'Yanlış!'}
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Doğru cevap: <span className="font-bold">{shapeNames[currentQuestion.target]}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
