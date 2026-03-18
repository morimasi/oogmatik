
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
    const [currentStimulus, setCurrentStimulus] = useState<{
        text: string;
        color: string;
        targetColorName: string;
        isCongruent: boolean;
    } | null>(null);
    const [startTime, setStartTime] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const trialResults = useRef<TrialResult[]>([]);

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
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none">
                <div className="w-20 h-20 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-traffic-light text-4xl text-purple-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">Stroop Dikkat Testi</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Kelimeyi değil, <span className="font-bold text-purple-600">yazının rengini</span> seç.
                        Yanıltıcı olacak — dikkatini koru!
                    </p>
                </div>
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-center">
                    <p className="text-5xl font-black mb-3" style={{ color: '#22c55e' }}>MAVİ</p>
                    <p className="text-xs text-zinc-500">→ Doğru cevap: <span className="font-bold text-green-600">YEŞİL</span> (yazının rengi)</p>
                </div>
                <button
                    onClick={() => { trialCountRef.current = 0; trialResults.current = []; setPhase('running'); }}
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    <i className="fa-solid fa-play"></i> Teste Başla
                </button>
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
        <div className="flex flex-col items-center justify-center w-full h-full max-w-2xl mx-auto select-none">
            {/* Başlık & İlerleme */}
            <div className="mb-10 text-center w-full px-8">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Yazının rengini seç — {trialCountRef.current} / {TOTAL_TRIALS}
                </h3>
                <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Stimulus */}
            <div className={`mb-16 transition-all duration-100 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <h1
                    className="text-8xl font-black tracking-widest"
                    style={{ color: currentStimulus.color }}
                >
                    {currentStimulus.text}
                </h1>
            </div>

            {/* Seçenekler */}
            <div className="grid grid-cols-2 gap-4 w-full px-4">
                {colors.map((c, i) => (
                    <button
                        key={i}
                        onClick={() => handleResponse(c.name)}
                        disabled={isAnimating}
                        className="py-5 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700
                                   hover:border-zinc-400 dark:hover:border-zinc-500
                                   shadow-md text-lg font-black text-zinc-700 dark:text-zinc-200
                                   transition-all transform active:scale-95 disabled:opacity-50
                                   flex items-center justify-center gap-3"
                    >
                        <div
                            className="w-5 h-5 rounded-full border-2 border-white/20 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
