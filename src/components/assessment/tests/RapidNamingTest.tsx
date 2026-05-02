
import React, { useState, useEffect, useRef } from 'react';
import { SubTestResult } from '../../../types';

interface RapidNamingTestProps {
    onComplete: (result: SubTestResult) => void;
}

// Premium FontAwesome ikonları + isim etiketi
const OBJECTS = [
    { emoji: '🍎', name: 'ELMA', icon: 'fa-apple-whole', color: 'text-red-500', bgGradient: 'from-red-400 to-red-600' },
    { emoji: '🚗', name: 'ARABA', icon: 'fa-car', color: 'text-blue-500', bgGradient: 'from-blue-400 to-blue-600' },
    { emoji: '⭐', name: 'YILDIZ', icon: 'fa-star', color: 'text-yellow-500', bgGradient: 'from-yellow-400 to-yellow-600' },
    { emoji: '🔑', name: 'ANAHTAR', icon: 'fa-key', color: 'text-zinc-500', bgGradient: 'from-zinc-400 to-zinc-600' },
    { emoji: '🐟', name: 'BALIK', icon: 'fa-fish', color: 'text-cyan-500', bgGradient: 'from-cyan-400 to-cyan-600' }
];

const GRID_SIZE = 20;

export const RapidNamingTest = ({ onComplete }: RapidNamingTestProps) => {
    const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro');
    const [items, setItems] = useState<typeof OBJECTS[0][]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errors, setErrors] = useState(0);
    const [wrongFlash, setWrongFlash] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const startTimeRef = useRef(0);
    const itemTimesRef = useRef<number[]>([]);
    const lastItemTimeRef = useRef(0);

    const handleShowHint = () => {
        if (phase !== 'running') return;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 2000);
    };

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
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none relative overflow-hidden">
                {/* Premium Gradient Arka Plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-indigo-900/20" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-2xl shadow-cyan-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <i className="fa-solid fa-stopwatch text-5xl text-white"></i>
                    </div>
                </div>
                
                <div className="relative z-10 text-center max-w-md">
                    <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Hızlı İsimlendirme (RAN)</h3>
                    <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed font-medium">
                        Sıradaki nesneyi <span className="font-black text-cyan-600 bg-cyan-100 dark:bg-cyan-900/50 px-2 py-1 rounded-lg">olabildiğince hızlı</span> tanımla.
                        Yanlış seçersen ekran kırmızı yanıp söner — tekrar dene!
                    </p>
                </div>
                
                <div className="relative z-10 flex gap-6">
                    {OBJECTS.map((obj, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 group">
                            <div className="w-20 h-20 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-4xl shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                                <span className="group-hover:scale-110 transition-transform duration-300">{obj.emoji}</span>
                            </div>
                            <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">{obj.name}</span>
                        </div>
                    ))}
                </div>
                
                <div className="relative z-10">
                    <button
                        onClick={startTest}
                        className="group px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-3xl shadow-2xl shadow-cyan-500/30 transition-all duration-300 flex items-center gap-4 transform hover:scale-105 active:scale-95"
                    >
                        <i className="fa-solid fa-play text-xl group-hover:rotate-12 transition-transform"></i>
                        <span className="text-lg">Teste Başla</span>
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'done') return null;

    return (
        <div className={`flex flex-col items-center justify-center w-full h-full transition-all relative overflow-hidden ${wrongFlash ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
            {/* Premium Gradient Arka Plan */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-indigo-900/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
            
            {/* İpucu Kutusu */}
            {showHint && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-cyan-500/30 max-w-sm backdrop-blur-sm border border-white/20">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-lightbulb text-yellow-300 text-xl animate-pulse"></i>
                            <span className="text-sm font-bold">
                                Hızlı ol! İlk gördüğün nesneyi hemen seç.
                            </span>
                        </div>
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-10 border-l-transparent border-r-10 border-r-transparent border-t-10 border-t-cyan-600"></div>
                    </div>
                </div>
            )}
            
            <div className="relative z-10 w-full max-w-4xl">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-black text-zinc-700 dark:text-zinc-200">Hızlı İsimlendirme</h3>
                        <button
                            onClick={handleShowHint}
                            disabled={showHint}
                            className="px-4 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                        >
                            <i className="fa-solid fa-lightbulb"></i>
                            İpucu
                        </button>
                    </div>
                    <div className="flex items-center justify-center gap-8 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{currentIndex}</span>
                            <span className="text-zinc-400">/</span>
                            <span>{GRID_SIZE}</span>
                            <span className="text-xs bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-full">tamamlandı</span>
                        </div>
                        {errors > 0 && (
                            <div className="flex items-center gap-2 text-red-400">
                                <i className="fa-solid fa-exclamation-triangle"></i>
                                <span>{errors} hata</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-5 gap-3 mb-10 p-6 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 backdrop-blur-md rounded-3xl shadow-2xl">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className={`relative group transition-all duration-300 ${idx === currentIndex
                                ? 'scale-110 z-20'
                                : idx < currentIndex
                                    ? 'scale-90 opacity-30 grayscale'
                                    : 'scale-100 opacity-80 hover:scale-105'
                            }`}
                        >
                            <div className={`w-16 h-16 flex items-center justify-center text-4xl rounded-2xl transition-all duration-300 ${idx === currentIndex
                                ? `bg-gradient-to-br ${item.bgGradient} shadow-2xl shadow-${item.color.split('-')[1]}-500/50 animate-pulse`
                                : idx < currentIndex
                                    ? 'bg-zinc-200 dark:bg-zinc-700'
                                    : 'bg-white dark:bg-zinc-800 shadow-lg'
                            }`}>
                                <span className={`${idx === currentIndex ? 'text-white drop-shadow-lg' : ''} ${idx === currentIndex ? 'animate-bounce' : ''}`}>
                                    {item.emoji}
                                </span>
                            </div>
                            {idx === currentIndex && (
                                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Kontroller */}
                <div className="flex gap-4 flex-wrap justify-center px-4">
                    {OBJECTS.map((obj, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(obj.name)}
                            className={`group flex flex-col items-center gap-3 px-6 py-5 rounded-3xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95
                                ${wrongFlash 
                                    ? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30' 
                                    : 'bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 hover:from-cyan-200 hover:to-blue-200'}`}
                        >
                            <div className="relative">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 ${wrongFlash ? 'animate-shake' : 'group-hover:scale-110'}`}>
                                    <span>{obj.emoji}</span>
                                </div>
                                {wrongFlash && (
                                    <div className="absolute -inset-1 bg-red-400 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <i className={`fa-solid ${obj.icon} ${obj.color} text-lg`}></i>
                                <span className={`text-xs font-black uppercase tracking-wider ${obj.color}`}>{obj.name}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* İlerleme çubuğu */}
                <div className="mt-8 w-80 h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${(currentIndex / GRID_SIZE) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
