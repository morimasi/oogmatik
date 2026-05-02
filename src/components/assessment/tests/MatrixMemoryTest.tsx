
import React, { useState, useEffect } from 'react';
import { SubTestResult } from '../../../types';

interface MatrixMemoryTestProps {
    onComplete: (result: SubTestResult) => void;
}

export const MatrixMemoryTest: React.FC<MatrixMemoryTestProps> = ({ onComplete }) => {
    const [level, setLevel] = useState(1);
    const [phase, setPhase] = useState<'intro' | 'preview' | 'recall' | 'feedback'>('intro');
    const [gridSize, setGridSize] = useState(3);
    const [targetCells, setTargetCells] = useState<number[]>([]);
    const [selectedCells, setSelectedCells] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [startTime, setStartTime] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const [lastWasCorrect, setLastWasCorrect] = useState<boolean | null>(null);
    const [showHint, setShowHint] = useState(false);
    // Doğru max skor hesabı için birikimli max'i tutalım
    const maxScoreRef = React.useRef(0);

    const handleShowHint = () => {
        if (phase !== 'recall') return;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 2000); // 2 saniye sonra kaybolur
    };

    // Yeni seviyeyi oluştur
    const generateLevel = (currentLevel: number, currentLives: number) => {
        if (currentLives <= 0) return; // finishTest zaten çağrılacak

        const size = currentLevel < 3 ? 3 : (currentLevel < 6 ? 4 : 5);
        setGridSize(size);

        const count = Math.min(size * size - 1, 2 + Math.floor(currentLevel / 2));

        // FIX: Bu seviyenin maksimum skoru kaydet
        maxScoreRef.current += currentLevel * 10;

        const cells = new Set<number>();
        while (cells.size < count) {
            cells.add(Math.floor(Math.random() * (size * size)));
        }
        setTargetCells(Array.from(cells));
        setSelectedCells([]);
        setShowHint(false); // Yeni seviyede ipucu sıfırlansın

        // Önce preview phase'ine geç ve mavi kareleri göster
        setPhase('preview');
        
        const showTime = Math.max(1500, 3000 - (currentLevel * 200)); // Daha uzun gösterim süresi
        const timer = setTimeout(() => {
            setPhase('recall');
            setStartTime(Date.now());
        }, showTime);

        return () => clearTimeout(timer);
    };

    useEffect(() => {
        if (phase === 'intro') return;
        if (lives <= 0) {
            finishTest();
            return;
        }
        const cleanup = generateLevel(level, lives);
        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [level, lives]);

    const handleCellClick = (index: number) => {
        if (phase !== 'recall') return;
        if (selectedCells.includes(index)) return; // Çift tıklamayı engelle

        const newSelected = [...selectedCells, index];
        setSelectedCells(newSelected);

        if (newSelected.length === 1) {
            setReactionTimes(prev => [...prev, Date.now() - startTime]);
        }

        if (newSelected.length === targetCells.length) {
            setPhase('feedback');
            const correctCount = newSelected.filter(c => targetCells.includes(c)).length;
            const isCorrect = correctCount === targetCells.length;
            setLastWasCorrect(isCorrect);

            setTimeout(() => {
                if (isCorrect) {
                    setScore(prev => prev + (level * 10));
                    setLevel(prev => prev + 1);
                } else {
                    setLives(prev => {
                        const newLives = prev - 1;
                        if (newLives <= 0) {
                            // Bir sonraki render döngüsünde finishTest çağrılacak (useEffect)
                        }
                        return newLives;
                    });
                    // Aynı seviyeyi tekrar dene
                    if (lives > 1) {
                        setLevel(l => l); // state'i tetiklemek için yeni ref
                        setPhase('preview'); // useEffect yerine manual reset
                        generateLevel(level, lives - 1);
                    }
                }
            }, 1200);
        }
    };

    const finishTest = () => {
        const avgRT = reactionTimes.length > 0
            ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
            : 0;

        // FIX: Dinamik max skor normalizasyonu
        // maxScoreRef.current = birikimli olası max puan
        const maxTheoreticalScore = Math.max(maxScoreRef.current, 1);
        const normalized = Math.min(100, Math.round((score / maxTheoreticalScore) * 100));

        onComplete({
            testId: 'visual_spatial_memory',
            name: 'Görsel-Uzamsal Bellek',
            score: normalized,
            rawScore: score,
            totalItems: level - 1, // Tamamlanan seviye sayısı
            avgReactionTime: Math.round(avgRT),
            accuracy: normalized,
            status: 'completed',
            timestamp: Date.now()
        });
    };

    // Giriş ekranı
    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full select-none gap-8 animate-in fade-in">
                <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-table-cells text-4xl text-indigo-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">Görsel-Uzamsal Bellek</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Hangi kareler <span className="font-bold text-indigo-600">mavi</span> olduğunu hatırla, sonra aynı karelere dokun.
                        Her seviyede kare sayısı artar.
                    </p>
                </div>
                <div className="flex gap-6 text-sm text-zinc-500">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block"></span>Hatırlanacak</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block"></span>Doğru</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span>Yanlış</div>
                </div>
                <button
                    onClick={() => {
                        maxScoreRef.current = 0;
                        setPhase('preview');
                        generateLevel(1, 3);
                    }}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    <i className="fa-solid fa-play"></i> Teste Başla
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full select-none relative">
            {/* Premium Gradient Arka Plan */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-purple-900/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />
            
            {/* İpucu Kutusu */}
            {showHint && phase === 'recall' && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-indigo-500/30 max-w-sm backdrop-blur-sm border border-white/20">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-lightbulb text-yellow-300 text-xl animate-pulse"></i>
                            <span className="text-sm font-bold">{targetCells.length} adet mavi kareyi hatırla!</span>
                        </div>
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-10 border-l-transparent border-r-10 border-r-transparent border-t-10 border-t-indigo-600"></div>
                    </div>
                </div>
            )}

            <div className="relative z-10">
                {/* Skor Başlığı */}
                <div className="mb-8 text-center">
                    <h3 className="text-3xl font-black text-zinc-800 dark:text-white mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Desenleri Hatırla</h3>
                    <div className="flex gap-8 justify-center items-center">
                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            <i className="fa-solid fa-layer-group text-indigo-500"></i>
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

                {/* Grid */}
                <div
                    className="grid gap-3 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md p-4 rounded-3xl border border-white/30 shadow-2xl"
                    style={{
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        width: `${gridSize * 80}px`,
                        height: `${gridSize * 80}px`
                    }}
                >
                    {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                        let bgClass = "bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600";
                        let extra = "";

                        if (phase === 'preview' && targetCells.includes(i)) {
                            bgClass = "bg-gradient-to-br from-indigo-500 to-blue-500 shadow-xl shadow-indigo-500/40 animate-pulse";
                            extra = "scale-110 border-2 border-white/50";
                        }
                        if (phase === 'recall' && selectedCells.includes(i)) {
                            bgClass = "bg-gradient-to-br from-indigo-300 to-blue-300 dark:from-indigo-600 dark:to-blue-600 shadow-lg shadow-indigo-500/30";
                        }
                        if (phase === 'feedback') {
                            if (targetCells.includes(i)) bgClass = "bg-gradient-to-br from-green-400 to-green-500 shadow-xl shadow-green-500/40";
                            if (selectedCells.includes(i) && !targetCells.includes(i)) bgClass = "bg-gradient-to-br from-red-400 to-red-500 shadow-xl shadow-red-500/40 animate-shake";
                        }

                        return (
                            <div
                                key={i}
                                onClick={() => handleCellClick(i)}
                                className={`rounded-xl cursor-pointer transition-all duration-300 border-2 border-white/20 ${bgClass} ${extra} ${phase === 'recall' ? 'hover:scale-105' : ''}`}
                            />
                        );
                    })}
                </div>

            {/* Durum Mesajı ve İpucu Butonu */}
                <div className={`mt-10 h-12 flex items-center justify-center gap-6 text-lg font-bold transition-all ${phase === 'feedback' && lastWasCorrect === false ? 'text-red-500' : phase === 'feedback' && lastWasCorrect === true ? 'text-green-500' : 'text-zinc-400'}`}>
                    {phase === 'preview' && (
                        <div className="flex items-center gap-3 bg-indigo-100 dark:bg-indigo-900/50 px-6 py-3 rounded-2xl border border-indigo-200 dark:border-indigo-700">
                            <i className="fa-solid fa-eye text-indigo-500 text-xl animate-pulse"></i>
                            <span>Dikkatlice İzle...</span>
                        </div>
                    )}
                    {phase === 'recall' && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-blue-100 dark:bg-blue-900/50 px-6 py-3 rounded-2xl border border-blue-200 dark:border-blue-700">
                                <i className="fa-solid fa-hand-pointer text-blue-500 text-xl animate-bounce"></i>
                                <span>Şimdi Dokunma Sırası!</span>
                            </div>
                            <button
                                onClick={handleShowHint}
                                disabled={showHint}
                                className="px-4 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                            >
                                <i className="fa-solid fa-lightbulb"></i>
                                İpucu
                            </button>
                        </div>
                    )}
                    {phase === 'feedback' && lastWasCorrect === true && (
                        <div className="flex items-center gap-3 bg-green-100 dark:bg-green-900/50 px-6 py-3 rounded-2xl border border-green-200 dark:border-green-700">
                            <i className="fa-solid fa-check-circle text-green-500 text-xl"></i>
                            <span>Harika! Doğru!</span>
                        </div>
                    )}
                    {phase === 'feedback' && lastWasCorrect === false && (
                        <div className="flex items-center gap-3 bg-red-100 dark:bg-red-900/50 px-6 py-3 rounded-2xl border border-red-200 dark:border-red-700">
                            <i className="fa-solid fa-times-circle text-red-500 text-xl"></i>
                            <span>Hatalı, Tekrar dene!</span>
                        </div>
                    )}
                </div>

                {/* İpucu */}
                {phase === 'recall' && (
                    <div className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                        {selectedCells.length} / {targetCells.length} seçildi
                    </div>
                )}
            </div>
        </div>
    );
};
