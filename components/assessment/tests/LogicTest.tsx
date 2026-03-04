
import React, { useState } from 'react';
import { SubTestResult } from '../../../types';

interface LogicTestProps {
    onComplete: (result: SubTestResult) => void;
}

export const LogicTest: React.FC<LogicTestProps> = ({ onComplete }) => {
    // Simulated Matrix Reasoning Questions
    // In a real app, these would be SVG based complex patterns.
    const questions = [
        { 
            q: [['⬛', '⬛'], ['⬛', '?']], 
            opts: ['⬜', '⬛', '🔴'], 
            ans: '⬛', 
            rule: 'Pattern Repetition' 
        },
        { 
            q: [['⬆️', '➡️'], ['⬇️', '?']], 
            opts: ['⬅️', '↗️', '⬆️'], 
            ans: '⬅️', 
            rule: 'Rotation Clockwise' 
        },
        { 
            q: [['1', '2'], ['3', '?']], 
            opts: ['4', '5', '1'], 
            ans: '4', 
            rule: 'Sequence' 
        },
        { 
            q: [['🔴', '🔵'], ['🔵', '?']], 
            opts: ['🔴', '🔵', '🟢'], 
            ans: '🔴', 
            rule: 'Alternating Colors' 
        }
    ];

    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());

    const handleAnswer = (val: string) => {
        if (val === questions[qIndex].ans) {
            setScore(s => s + 1);
        }

        if (qIndex < questions.length - 1) {
            setQIndex(q => q + 1);
        } else {
            finish();
        }
    };

    const finish = () => {
        const accuracy = (score / questions.length) * 100;
        onComplete({
            testId: 'logical_reasoning',
            name: 'Mantık Testi',
            score: Math.round(accuracy),
            rawScore: score,
            totalItems: questions.length,
            avgReactionTime: (Date.now() - startTime) / questions.length,
            accuracy: Math.round(accuracy),
            status: 'completed',
            timestamp: Date.now()
        });
    };

    const currentQ = questions[qIndex];

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-xl mx-auto">
            <h3 className="text-xl font-bold mb-8 text-zinc-500">Mantığı Tamamla ({qIndex + 1}/{questions.length})</h3>
            
            {/* Matrix Display */}
            <div className="grid grid-cols-2 gap-4 bg-white p-8 rounded-3xl shadow-xl mb-12 border-4 border-zinc-200">
                {currentQ.q.flat().map((item, i) => (
                    <div key={i} className="w-24 h-24 flex items-center justify-center text-5xl bg-zinc-100 rounded-xl border border-zinc-200">
                        {item}
                    </div>
                ))}
            </div>

            {/* Options */}
            <div className="flex gap-6">
                {currentQ.opts.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        className="w-24 h-24 bg-white hover:bg-indigo-50 border-4 border-zinc-200 hover:border-indigo-500 rounded-2xl text-4xl shadow-md transition-all active:scale-95"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};
