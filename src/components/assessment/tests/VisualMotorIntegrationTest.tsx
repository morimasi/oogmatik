import React, { useState, useEffect } from 'react';
import { SubTestResult } from '../../../types';

interface VisualMotorIntegrationTestProps {
    onComplete: (result: SubTestResult) => void;
    studentAge?: number;
}

type Shape = 'circle' | 'square' | 'triangle' | 'star' | 'hexagon' | 'pentagon';

interface Question {
    target: Shape;
    options: Shape[];
}

export const VisualMotorIntegrationTest: React.FC<VisualMotorIntegrationTestProps> = ({ onComplete, studentAge = 7 }) => {
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
        const availableShapesCount = Math.min(shapes.length, Math.max(3, Math.floor(currentLevel / 2) + 2));
        const activeShapes = shapes.slice(0, availableShapesCount);
        const target = activeShapes[Math.floor(Math.random() * activeShapes.length)];
        
        const isYounger = studentAge <= 7;
        const optionCount = isYounger ? Math.min(3, activeShapes.length) : Math.min(4, activeShapes.length);
        const otherShapes = activeShapes.filter(s => s !== target);
        const distractors: Shape[] = [];

        while (distractors.length < optionCount - 1 && otherShapes.length > 0) {
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
        const rt = Date.now() - startTime;
        setReactionTimes(prev => [...prev, rt]);
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
            const timer = setTimeout(() => {
                startLevel();
            }, 1200);
            return () => clearTimeout(timer);
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
        const strokeWidth = 4;

        switch (shape) {
            case 'circle':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            case 'square':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <rect x="15" y="15" width="70" height="70" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            case 'triangle':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <polygon points="50,10 90,90 10,90" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            case 'star':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            case 'hexagon':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <polygon points="50,5 93,30 93,70 50,95 7,70 7,30" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            case 'pentagon':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <polygon points="50,5 97,38 79,95 21,95 3,38" fill="none" stroke={color} strokeWidth={strokeWidth} />
                    </svg>
                );
            default:
                return null;
        }
    };

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full select-none gap-6 p-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <i className="fa-solid fa-shapes text-3xl text-orange-500"></i>
                </div>
                <div className="max-w-md">
                    <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Görsel-Motor Entegrasyon</h3>
                    <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                        Gösterilen hedef şeklin tam eşleşenini seçenekler arasından bularak tıklayın.
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
                        Seviye {level}
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

            {/* Target Display Area */}
            {phase === 'question' && currentQuestion && (
                <div className="flex-1 flex flex-col items-center justify-center w-full my-auto space-y-6">
                    <div className="text-center">
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Hedef Şekli Bul</p>
                        <div className="w-28 h-28 mx-auto bg-[var(--bg-paper)] rounded-2xl shadow-md border-2 border-[var(--accent-color)]/30 flex items-center justify-center p-2">
                            <ShapeIcon shape={currentQuestion.target} size={80} color="var(--accent-color)" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className="flex flex-col items-center gap-2 p-3 bg-[var(--bg-paper)] hover:bg-[var(--surface-glass)] rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all active:scale-95"
                            >
                                <ShapeIcon shape={option} size={52} color="var(--text-primary)" />
                                <span className="text-[10px] font-bold text-[var(--text-secondary)]">{shapeNames[option]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Feedback Display */}
            {phase === 'feedback' && currentQuestion && (
                <div className="flex-1 flex flex-col items-center justify-center my-auto text-center space-y-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${selectedOption === currentQuestion.target ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        <i className={`fa-solid ${selectedOption === currentQuestion.target ? 'fa-check' : 'fa-xmark'}`}></i>
                    </div>
                    <p className={`text-base font-black ${selectedOption === currentQuestion.target ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {selectedOption === currentQuestion.target ? 'Doğru Eşleşme!' : 'Hatalı Eşleşme'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] font-medium">
                        Hedef: <span className="font-bold text-[var(--text-primary)]">{shapeNames[currentQuestion.target]}</span>
                    </p>
                </div>
            )}
        </div>
    );
};
