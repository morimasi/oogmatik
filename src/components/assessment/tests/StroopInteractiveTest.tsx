
import React, { useState, useEffect, useRef } from 'react';
import { SubTestResult } from '../../../types';

interface StroopInteractiveTestProps {
    onComplete: (result: SubTestResult) => void;
}

interface TrialResult {
    isCongruent: boolean;
    isCorrect: boolean;
    reactionTime: number;
}

const TOTAL_TRIALS = 16;

const colors = [
    { name: 'KIRMIZI', hex: '#ef4444', pattern: 'bg-red-500' },
    { name: 'MAVİ', hex: '#3b82f6', pattern: 'bg-blue-500' },
    { name: 'YEŞİL', hex: '#22c55e', pattern: 'bg-green-500' },
    { name: 'SARI', hex: '#eab308', pattern: 'bg-yellow-500' }
];

export const StroopInteractiveTest: React.FC<StroopInteractiveTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro');
    // FIX: trial sayacını ayrı bir ref'le takip ederek stale closure sorununu önle
    const trialCountRef = useRef(0);
    const [trialDisplay, setTrialDisplay] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [currentStimulus, setCurrentStimulus] = useState<{
        text: string;
        color: string;
        targetColorName: string;
        isCongruent: boolean;
    } | null>(null);
    const [startTime, setStartTime] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const trialResults = useRef<TrialResult[]>([]);

    const handleShowHint = () => {
        if (phase !== 'running' || isAnimating) return;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000);
    };

    const generateNextStimulus = () => {
        const textObj = colors[Math.floor(Math.random() * colors.length)];
        let colorObj = textObj;
        const isCongruent = Math.random() >= 0.65; // %35 congruent, %65 incongruent

        if (!isCongruent) {
            const others = colors.filter(c => c.name !== textObj.name);
            colorObj = others[Math.floor(Math.random() * others.length)];
        }

        setCurrentStimulus({
            text: textObj.name,
            color: colorObj.hex,
            targetColorName: colorObj.name,
            isCongruent
        });
        setStartTime(Date.now());
        setIsAnimating(false);
    };

    // FIX: useEffect ile trialCount takibi — stale closure'ı önler
    useEffect(() => {
        if (phase !== 'running') return;
        if (trialCountRef.current >= TOTAL_TRIALS) {
            finishTest();
            return;
        }
        generateNextStimulus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trialDisplay, phase]);

    const handleResponse = (selectedColorName: string) => {
        if (!currentStimulus || isAnimating) return;
        setIsAnimating(true);

        const rt = Date.now() - startTime;
        const isCorrect = selectedColorName === currentStimulus.targetColorName;

        trialResults.current.push({
            isCongruent: currentStimulus.isCongruent,
            isCorrect,
            reactionTime: rt
        });

        trialCountRef.current += 1;

        setTimeout(() => {
            setTrialDisplay(prev => prev + 1); // useEffect'i tetikler
        }, 150);
    };

    const finishTest = () => {
        const results = trialResults.current;
        const correct = results.filter(r => r.isCorrect).length;
        const accuracy = (correct / TOTAL_TRIALS) * 100;
        const avgRT = results.reduce((s, r) => s + r.reactionTime, 0) / results.length;

        // Stroop Interference Effect: incongruent RT - congruent RT
        const congruentResults = results.filter(r => r.isCongruent);
        const incongruentResults = results.filter(r => !r.isCongruent);
        const congruentRT = congruentResults.length > 0
            ? congruentResults.reduce((s, r) => s + r.reactionTime, 0) / congruentResults.length
            : avgRT;
        const incongruentRT = incongruentResults.length > 0
            ? incongruentResults.reduce((s, r) => s + r.reactionTime, 0) / incongruentResults.length
            : avgRT;
        const interferenceEffect = incongruentRT - congruentRT;

        // Gelişmiş skor algoritması:
        // Temel: Doğruluk %50 ağırlık
        // Hız bonusu: Düşük RT için +bonus
        // Interference malus: Yüksek interference → impulsive kontrol güçlüğü
        let score = accuracy;
        if (avgRT < 700) score += 15;
        else if (avgRT < 900) score += 8;
        else if (avgRT < 1200) score += 3;
        else if (avgRT > 1800) score -= 10;

        // Interference cezası (yüksek interference = dürtü kontrolü güçlüğü)
        if (interferenceEffect > 400) score -= 15;
        else if (interferenceEffect > 250) score -= 8;
        else if (interferenceEffect > 150) score -= 3;

        setPhase('done');

        onComplete({
            testId: 'selective_attention',
            name: 'Stroop - Seçici Dikkat',
            score: Math.max(0, Math.min(100, Math.round(score))),
            rawScore: correct,
            totalItems: TOTAL_TRIALS,
            avgReactionTime: Math.round(avgRT),
            accuracy: Math.round(accuracy),
            status: 'completed',
            timestamp: Date.now()
        });
    };

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none relative overflow-hidden">
                {/* Premium Gradient Arka Plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <i className="fa-solid fa-traffic-light text-5xl text-white"></i>
                    </div>
                </div>
                
                <div className="relative z-10 text-center max-w-md">
                    <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Stroop Dikkat Testi</h3>
                    <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed font-medium">
                        Kelimeyi değil, <span className="font-black text-purple-600 bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded-lg">yazının rengini</span> seç.
                        Yanıltıcı olacak — dikkatini koru!
                    </p>
                </div>
                
                <div className="relative z-10 p-8 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl shadow-purple-500/10 text-center">
                    <p className="text-6xl font-black mb-4" style={{ color: '#22c55e' }}>MAVİ</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">→ Doğru cevap: <span className="font-black text-green-600 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-lg">YEŞİL</span> (yazının rengi)</p>
                </div>
                
                <div className="relative z-10">
                    <button
                        onClick={() => { trialCountRef.current = 0; trialResults.current = []; setPhase('running'); }}
                        className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black rounded-3xl shadow-2xl shadow-purple-500/30 transition-all duration-300 flex items-center gap-4 transform hover:scale-105 active:scale-95"
                    >
                        <i className="fa-solid fa-play text-xl group-hover:rotate-12 transition-transform"></i>
                        <span className="text-lg">Teste Başla</span>
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'done') return null;

    if (!currentStimulus) return (
        <div className="flex items-center justify-center w-full h-full">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const progress = (trialCountRef.current / TOTAL_TRIALS) * 100;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-2xl mx-auto select-none relative">
            {/* Premium Gradient Arka Plan */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
            
            {/* İpucu Kutusu */}
            {showHint && currentStimulus && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-purple-500/30 max-w-sm backdrop-blur-sm border border-white/20">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-lightbulb text-yellow-300 text-xl animate-pulse"></i>
                            <span className="text-sm font-bold">
                                {currentStimulus.isCongruent 
                                    ? 'Bu kolay! Kelime ve renk uyumlu.' 
                                    : 'Dikkat! Kelime ve renk farklı — sadece rengi seç!'}
                            </span>
                        </div>
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-10 border-l-transparent border-r-10 border-r-transparent border-t-10 border-t-purple-600"></div>
                    </div>
                </div>
            )}
            
            <div className="relative z-10 w-full">
                {/* Başlık & İlerleme */}
                <div className="mb-12 text-center w-full px-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                            Yazının rengini seç
                        </h3>
                        <button
                            onClick={handleShowHint}
                            disabled={isAnimating || showHint}
                            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                        >
                            <i className="fa-solid fa-lightbulb"></i>
                            İpucu
                        </button>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-3">
                        <span>{trialCountRef.current} / {TOTAL_TRIALS}</span>
                        <span className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">
                            {Math.round((trialCountRef.current / TOTAL_TRIALS) * 100)}%
                        </span>
                    </div>
                    <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Stimulus */}
                <div className={`mb-20 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl opacity-20 animate-pulse"></div>
                        <h1
                            className="relative text-9xl font-black tracking-widest drop-shadow-2xl"
                            style={{ color: currentStimulus.color }}
                        >
                            {currentStimulus.text}
                        </h1>
                    </div>
                </div>

                {/* Seçenekler */}
                <div className="grid grid-cols-2 gap-6 w-full px-4">
                    {colors.map((c, i) => (
                        <button
                            key={i}
                            onClick={() => handleResponse(c.name)}
                            disabled={isAnimating}
                            className="group py-6 rounded-3xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border-2 border-zinc-200 dark:border-zinc-700
                                       hover:border-zinc-400 dark:hover:border-zinc-500 hover:shadow-xl
                                       shadow-lg text-xl font-black text-zinc-700 dark:text-zinc-200
                                       transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50
                                       flex items-center justify-center gap-4 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <div
                                className="w-6 h-6 rounded-full border-2 border-white/40 shadow-lg flex-shrink-0 ring-4 ring-white/20"
                                style={{ backgroundColor: c.hex }}
                            />
                            <span className="relative z-10">{c.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
