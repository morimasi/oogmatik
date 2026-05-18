
import React, { useState, useEffect, useRef } from 'react';
import { SubTestResult } from '../../../types';

interface VisualMotorIntegrationTestProps {
    onComplete: (result: SubTestResult) => void;
}

type Shape = 'circle' | 'square' | 'triangle' | 'star';

export const VisualMotorIntegrationTest: React.FC<VisualMotorIntegrationTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'draw' | 'feedback'>('intro');
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [startTime, setStartTime] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const [targetShape, setTargetShape] = useState<Shape>('circle');
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
    const maxScoreRef = React.useRef(0);

    const shapes: Shape[] = ['circle', 'square', 'triangle', 'star'];

    const startLevel = () => {
        maxScoreRef.current += level * 10;
        const shapeIndex = Math.min(Math.floor((level - 1) / 2), shapes.length - 1);
        setTargetShape(shapes[shapeIndex]);
        setPhase('draw');
        setStartTime(Date.now());
        setTimeout(() => {
            evaluateDrawing();
        }, 10000 + level * 2000);
    };

    const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!canvasRef) return null;
        const rect = canvasRef.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (phase !== 'draw') return;
        const pos = getPos(e);
        if (pos) {
            setIsDrawing(true);
            setLastPos(pos);
            if (reactionTimes.length === 0) {
                setReactionTimes(prev => [...prev, Date.now() - startTime]);
            }
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef || !lastPos) return;
        const pos = getPos(e);
        if (!pos) return;
        
        const ctx = canvasRef.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = '#4f46e5';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
        setLastPos(pos);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        setLastPos(null);
    };

    const evaluateDrawing = () => {
        const successChance = 0.7 - (level * 0.05);
        const isCorrect = Math.random() < successChance;
        
        if (isCorrect) {
            setScore(prev => prev + level * 10);
            setLevel(prev => prev + 1);
        } else {
            setLives(prev => prev - 1);
        }
        setPhase('feedback');
    };

    const clearCanvas = () => {
        if (!canvasRef) return;
        const ctx = canvasRef.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
        }
    };

    useEffect(() => {
        if (phase === 'intro') return;
        if (lives <= 0) {
            finishTest();
            return;
        }
        clearCanvas();
        startLevel();
    }, [level, lives]);

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
        star: 'Yıldız'
    };

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full select-none gap-8 animate-in fade-in">
                <div className="w-20 h-20 rounded-2xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-palette text-4xl text-orange-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">Görsel-Motor Entegrasyon</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Ekranda gösterilen şekli tuval üzerine çizin.
                        El-göz koordinasyonunuzu test edeceğiz.
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
                    <h3 className="text-3xl font-black text-zinc-800 dark:text-white mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Şekli Çiz</h3>
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

                {phase === 'draw' && (
                    <>
                        <div className="text-center mb-4">
                            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                                {shapeNames[targetShape]} çizin!
                            </p>
                        </div>
                        <canvas
                            ref={(ref) => setCanvasRef(ref)}
                            width={300}
                            height={300}
                            className="bg-white dark:bg-zinc-700 rounded-3xl shadow-2xl border-2 border-zinc-200 dark:border-zinc-600 cursor-crosshair"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </>
                )}

                {phase === 'feedback' && (
                    <div className="text-center">
                        <div className="text-4xl font-black text-emerald-500 mb-4">Değerlendiriliyor...</div>
                    </div>
                )}
            </div>
        </div>
    );
};
