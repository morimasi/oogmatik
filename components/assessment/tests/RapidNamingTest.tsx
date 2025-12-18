
import React, { useState, useEffect } from 'react';
import { SubTestResult } from '../../../types';
import { shuffle } from '../../../services/offlineGenerators/helpers';

interface RapidNamingTestProps {
    onComplete: (result: SubTestResult) => void;
}

export const RapidNamingTest: React.FC<RapidNamingTestProps> = ({ onComplete }) => {
    // 4x5 grid = 20 items
    const [items, setItems] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [errors, setErrors] = useState(0);

    const objects = ['🍎', '🚗', '⭐', '🔑', '🐟']; // Apple, Car, Star, Key, Fish

    useEffect(() => {
        const grid = [];
        for (let i = 0; i < 20; i++) {
            grid.push(objects[Math.floor(Math.random() * objects.length)]);
        }
        setItems(grid);
        setStartTime(Date.now());
    }, []);

    const handleSelect = (selectedObj: string) => {
        const target = items[currentIndex];
        
        if (selectedObj === target) {
            if (currentIndex === items.length - 1) {
                finish();
            } else {
                setCurrentIndex(prev => prev + 1);
            }
        } else {
            setErrors(prev => prev + 1);
            // Visual shake effect could be added here
        }
    };

    const finish = () => {
        const totalTime = Date.now() - startTime;
        const avgSpeed = totalTime / 20; // ms per item
        
        // Scoring: Standard RAN speed for kids ~1-1.5 sec per item
        let score = 100;
        if (avgSpeed > 1000) score -= ((avgSpeed - 1000) / 50); // Penalty for slowness
        score -= (errors * 5); // Penalty for errors
        
        onComplete({
            testId: 'processing_speed',
            name: 'Hızlı İsimlendirme',
            score: Math.max(0, Math.round(score)),
            rawScore: totalTime, // Total ms
            totalItems: 20,
            avgReactionTime: Math.round(avgSpeed),
            accuracy: Math.round(((20 - errors) / 20) * 100),
            status: 'completed',
            timestamp: Date.now()
        });
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="mb-8 text-center max-w-lg">
                <h3 className="text-xl font-bold text-zinc-800 dark:text-white mb-2">Hızlı İsimlendirme</h3>
                <p className="text-zinc-500">Mavi ile işaretli nesnenin aynısını aşağıdan seç.</p>
            </div>

            {/* The Grid */}
            <div className="grid grid-cols-5 gap-4 mb-10 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                {items.map((item, idx) => (
                    <div 
                        key={idx} 
                        className={`w-16 h-16 flex items-center justify-center text-4xl bg-white rounded-xl shadow-sm border-4 transition-all duration-200 ${
                            idx === currentIndex 
                            ? 'border-indigo-500 scale-110 shadow-lg z-10' 
                            : (idx < currentIndex ? 'opacity-30 border-transparent grayscale' : 'border-transparent')
                        }`}
                    >
                        {item}
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                {objects.map((obj, i) => (
                    <button
                        key={i}
                        onClick={() => handleSelect(obj)}
                        className="w-20 h-20 bg-white border-2 border-zinc-200 rounded-2xl text-5xl flex items-center justify-center shadow-lg hover:bg-zinc-50 active:scale-95 transition-transform"
                    >
                        {obj}
                    </button>
                ))}
            </div>
        </div>
    );
};
