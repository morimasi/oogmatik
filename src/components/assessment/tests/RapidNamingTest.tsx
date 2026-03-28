
import React, { useState, _useEffect, useRef } from 'react';
import { SubTestResult } from '../../../types';

interface RapidNamingTestProps {
    onComplete: (result: SubTestResult) => void;
}

// İkonlar: emoji yerine FontAwesome ikonları + isim etiketi
const OBJECTS = [
    { emoji: '🍎', name: 'ELMA', icon: 'fa-apple-whole', color: 'text-red-500' },
    { emoji: '🚗', name: 'ARABA', icon: 'fa-car', color: 'text-blue-500' },
    { emoji: '⭐', name: 'YILDIZ', icon: 'fa-star', color: 'text-yellow-500' },
    { emoji: '🔑', name: 'ANAHTAR', icon: 'fa-key', color: 'text-zinc-500' },
    { emoji: '🐟', name: 'BALIK', icon: 'fa-fish', color: 'text-cyan-500' }
];

const GRID_SIZE = 20;

export const RapidNamingTest = ({ onComplete }: RapidNamingTestProps) => {
    const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro');
    const [items, setItems] = useState<typeof OBJECTS[0][]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errors, setErrors] = useState(0);
    const [wrongFlash, setWrongFlash] = useState(false);
    const startTimeRef = useRef(0);
    const itemTimesRef = useRef<number[]>([]);
    const lastItemTimeRef = useRef(0);

    const startTest = () => {
        // Karıştırılmış grid oluştur (her nesne eşit dağılımda)
        const grid: typeof OBJECTS[0][] = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            grid.push(OBJECTS[Math.floor(Math.random() * OBJECTS.length)]);
        }
        // Arka arkaya aynı nesne olmamasını sağla
        for (let i = 1; i < grid.length; i++) {
            if (grid[i].name === grid[i - 1].name) {
                const others = OBJECTS.filter(o => o.name !== grid[i - 1].name);
                grid[i] = others[Math.floor(Math.random() * others.length)];
            }
        }
        setItems(grid);
        setCurrentIndex(0);
        setErrors(0);
        itemTimesRef.current = [];
        startTimeRef.current = Date.now();
        lastItemTimeRef.current = Date.now();
        setPhase('running');
    };

    const handleSelect = (selectedName: string) => {
        const target = items[currentIndex];
        const now = Date.now();
        const itemRT = now - lastItemTimeRef.current;

        if (selectedName === target.name) {
            itemTimesRef.current.push(itemRT);
            lastItemTimeRef.current = now;

            if (currentIndex === items.length - 1) {
                finish(errors);
            } else {
                setCurrentIndex(prev => prev + 1);
            }
        } else {
            setErrors(prev => {
                const newErrors = prev + 1;
                return newErrors;
            });
            setWrongFlash(true);
            setTimeout(() => setWrongFlash(false), 400);
        }
    };

    const finish = (finalErrors: number) => {
        const totalTime = Date.now() - startTimeRef.current;
        const avgSpeed = totalTime / GRID_SIZE;

        // Standart RAN hızı: çocuklar için ~800-1200ms/nesne
        let score = 100;
        if (avgSpeed > 1200) score -= ((avgSpeed - 1200) / 50);
        else if (avgSpeed < 700) score += 10; // Olağanüstü hız bonusu
        score -= (finalErrors * 5);

        setPhase('done');
        onComplete({
            testId: 'processing_speed',
            name: 'Hızlı İsimlendirme (RAN)',
            score: Math.max(0, Math.round(score)),
            rawScore: totalTime,
            totalItems: GRID_SIZE,
            avgReactionTime: Math.round(avgSpeed),
            accuracy: Math.round(((GRID_SIZE - finalErrors) / GRID_SIZE) * 100),
            status: 'completed',
            timestamp: Date.now()
        });
    };

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none">
                <div className="w-20 h-20 rounded-2xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-stopwatch text-4xl text-cyan-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">Hızlı İsimlendirme (RAN)</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Sıradaki nesneyi <span className="font-bold text-cyan-600">olabildiğince hızlı</span> tanımla.
                        Yanlış seçersen ekran kırmızı yanıp söner — tekrar dene!
                    </p>
                </div>
                <div className="flex gap-4">
                    {OBJECTS.map((obj, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-3xl shadow-sm">
                                {obj.emoji}
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400">{obj.name}</span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={startTest}
                    className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    <i className="fa-solid fa-play"></i> Teste Başla
                </button>
            </div>
        );
    }

    if (phase === 'done') return null;

    return (
        <div className={`flex flex-col items-center justify-center w-full h-full transition-all ${wrongFlash ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
            <div className="mb-6 text-center">
                <h3 className="text-lg font-black text-zinc-700 dark:text-zinc-200 mb-1">Hızlı İsimlendirme</h3>
                <div className="flex items-center gap-4 justify-center text-xs text-zinc-400">
                    <span>{currentIndex} / {GRID_SIZE} tamamlandı</span>
                    {errors > 0 && <span className="text-red-400 font-bold">{errors} hata</span>}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-2 mb-8 p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className={`w-14 h-14 flex items-center justify-center text-3xl rounded-xl border-2 transition-all duration-150
                            ${idx === currentIndex
                                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 scale-110 shadow-lg z-10 shadow-cyan-500/20'
                                : idx < currentIndex
                                    ? 'border-transparent opacity-20 grayscale scale-90'
                                    : 'border-transparent bg-white dark:bg-zinc-700 opacity-80'
                            }`}
                    >
                        {item.emoji}
                    </div>
                ))}
            </div>

            {/* Kontroller */}
            <div className="flex gap-3 flex-wrap justify-center px-4">
                {OBJECTS.map((obj, i) => (
                    <button
                        key={i}
                        onClick={() => handleSelect(obj.name)}
                        className={`flex flex-col items-center gap-2 px-5 py-4 bg-white dark:bg-zinc-800
                            border-2 rounded-2xl shadow-md
                            hover:border-cyan-500 hover:shadow-cyan-500/20 hover:shadow-lg
                            active:scale-95 transition-all
                            ${wrongFlash ? 'border-red-200 dark:border-red-900' : 'border-zinc-200 dark:border-zinc-700'}`}
                    >
                        <span className="text-3xl">{obj.emoji}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${obj.color}`}>{obj.name}</span>
                    </button>
                ))}
            </div>

            {/* İlerleme çubuğu */}
            <div className="mt-6 w-64 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-200"
                    style={{ width: `${(currentIndex / GRID_SIZE) * 100}%` }}
                />
            </div>
        </div>
    );
};
