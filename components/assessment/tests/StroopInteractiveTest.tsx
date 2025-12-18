
import React, { useState, useEffect, useRef } from 'react';
import { SubTestResult } from '../../../types';
import { shuffle } from '../../../services/offlineGenerators/helpers';

interface StroopInteractiveTestProps {
    onComplete: (result: SubTestResult) => void;
}

export const StroopInteractiveTest: React.FC<StroopInteractiveTestProps> = ({ onComplete }) => {
    const TOTAL_TRIALS = 15;
    const [trial, setTrial] = useState(0);
    const [currentStimulus, setCurrentStimulus] = useState<any>(null);
    const [startTime, setStartTime] = useState(0);
    
    // Stats
    const stats = useRef({
        correct: 0,
        rtSum: 0,
        rtCount: 0
    });

    const colors = [
        { name: 'KIRMIZI', hex: '#ef4444' },
        { name: 'MAVİ', hex: '#3b82f6' },
        { name: 'YEŞİL', hex: '#22c55e' },
        { name: 'SARI', hex: '#eab308' }
    ];

    const nextTrial = () => {
        if (trial >= TOTAL_TRIALS) {
            finish();
            return;
        }

        const textObj = colors[Math.floor(Math.random() * colors.length)];
        // Ensure conflict 70% of the time
        let colorObj = textObj;
        if (Math.random() < 0.7) {
            const others = colors.filter(c => c.name !== textObj.name);
            colorObj = others[Math.floor(Math.random() * others.length)];
        }

        setCurrentStimulus({ text: textObj.name, color: colorObj.hex, targetColorName: colorObj.name });
        setTrial(t => t + 1);
        setStartTime(Date.now());
    };

    useEffect(() => {
        nextTrial();
    }, []);

    const handleResponse = (selectedColorName: string) => {
        const rt = Date.now() - startTime;
        
        if (selectedColorName === currentStimulus.targetColorName) {
            stats.current.correct++;
        }
        
        stats.current.rtSum += rt;
        stats.current.rtCount++;
        
        nextTrial();
    };

    const finish = () => {
        const accuracy = (stats.current.correct / TOTAL_TRIALS) * 100;
        const avgRT = stats.current.rtCount > 0 ? stats.current.rtSum / stats.current.rtCount : 0;
        
        // Score Algorithm: Higher accuracy and lower RT is better
        // Base 50 + (Accuracy/2) - (RT penalty)
        // Roughly: 1000ms RT is baseline. Faster adds points.
        let score = accuracy;
        if (avgRT < 800) score += 10;
        if (avgRT < 600) score += 10;
        if (avgRT > 1500) score -= 10;

        onComplete({
            testId: 'selective_attention',
            name: 'Stroop Dikkat Testi',
            score: Math.max(0, Math.min(100, Math.round(score))),
            rawScore: stats.current.correct,
            totalItems: TOTAL_TRIALS,
            avgReactionTime: Math.round(avgRT),
            accuracy: Math.round(accuracy),
            status: 'completed',
            timestamp: Date.now()
        });
    };

    if (!currentStimulus) return null;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-2xl mx-auto">
            <div className="mb-12 text-center">
                <h3 className="text-xl font-bold text-zinc-400 mb-2">KELİMEYİ OKUMA! RENGİNİ SEÇ!</h3>
                <div className="w-64 h-2 bg-zinc-200 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(trial / TOTAL_TRIALS) * 100}%` }}></div>
                </div>
            </div>

            <div className="mb-16">
                <h1 
                    className="text-8xl font-black tracking-widest transition-colors duration-200"
                    style={{ color: currentStimulus.color }}
                >
                    {currentStimulus.text}
                </h1>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full px-8">
                {colors.map((c, i) => (
                    <button
                        key={i}
                        onClick={() => handleResponse(c.name)}
                        className="py-6 rounded-2xl bg-white border-4 border-transparent hover:border-black shadow-lg text-xl font-bold text-zinc-700 transition-all transform active:scale-95 flex items-center justify-center gap-3"
                    >
                        <div className="w-6 h-6 rounded-full border border-black/10" style={{backgroundColor: c.hex}}></div>
                        {c.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
