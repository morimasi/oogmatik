import React, { useState, useEffect, useRef } from 'react';
import { SubTestResult } from '../../../types';

interface PlanningTestProps {
    onComplete: (result: SubTestResult) => void;
}

type BallColor = 'red' | 'blue' | 'yellow';

interface PegState {
    maxCapacity: number;
    balls: BallColor[];
}

interface LevelTask {
    id: number;
    title: string;
    description: string;
    targetMoves: number; // Optimal hamle sayısı
    maxAllowedMoves: number; // Disleksi/DEHB dostu esnek tavan
    initialPegs: { maxCapacity: number; balls: BallColor[] }[];
    targetPegs: { maxCapacity: number; balls: BallColor[] }[];
    pegCapacities: [number, number, number]; // [3, 2, 1] standard Tower of London
}

// Renk stilleri ve Türkçe etiketler
const COLOR_CONFIG: Record<BallColor, { bg: string; border: string; label: string; shadow: string }> = {
    red: {
        bg: 'bg-rose-500',
        border: 'border-rose-400',
        label: 'Kırmızı',
        shadow: 'shadow-rose-500/40'
    },
    blue: {
        bg: 'bg-blue-500',
        border: 'border-blue-400',
        label: 'Mavi',
        shadow: 'shadow-blue-500/40'
    },
    yellow: {
        bg: 'bg-amber-400',
        border: 'border-amber-300',
        label: 'Sarı',
        shadow: 'shadow-amber-400/40'
    }
};

// Pedagojik olarak ZPD (Yakınsak Gelişim Alanı) uyumlu 4 progresif seviye
// Çubuk kapasiteleri: Çubuk 1: 3 top | Çubuk 2: 2 top | Çubuk 3: 1 top (Standard Tower of London)
const LEVELS: LevelTask[] = [
    {
        id: 1,
        title: 'Seviye 1: Isınma & İlk Adım',
        description: 'Mavi topu 2. çubuğa taşıyarak hedefteki dizilimi oluştur.',
        targetMoves: 2,
        maxAllowedMoves: 6,
        pegCapacities: [3, 2, 1],
        // Başlangıç: Çubuk 1'de [red, blue] (altta red, üstte blue), Çubuk 2 boş, Çubuk 3'te [yellow]
        initialPegs: [
            { maxCapacity: 3, balls: ['red', 'blue'] },
            { maxCapacity: 2, balls: [] },
            { maxCapacity: 1, balls: ['yellow'] }
        ],
        // Hedef: Çubuk 1'de [red], Çubuk 2'de [blue], Çubuk 3'te [yellow]
        targetPegs: [
            { maxCapacity: 3, balls: ['red'] },
            { maxCapacity: 2, balls: ['blue'] },
            { maxCapacity: 1, balls: ['yellow'] }
        ]
    },
    {
        id: 2,
        title: 'Seviye 2: İki Aşamalı Planlama',
        description: 'Topların yerini değiştirirken kapasiteleri gözet ve hedefi yakala.',
        targetMoves: 3,
        maxAllowedMoves: 8,
        pegCapacities: [3, 2, 1],
        // Başlangıç: Çubuk 1: [red, blue, yellow], Çubuk 2: [], Çubuk 3: []
        initialPegs: [
            { maxCapacity: 3, balls: ['red', 'blue', 'yellow'] },
            { maxCapacity: 2, balls: [] },
            { maxCapacity: 1, balls: [] }
        ],
        // Hedef: Çubuk 1: [red], Çubuk 2: [blue, yellow], Çubuk 3: []
        targetPegs: [
            { maxCapacity: 3, balls: ['red'] },
            { maxCapacity: 2, balls: ['blue', 'yellow'] },
            { maxCapacity: 1, balls: [] }
        ]
    },
    {
        id: 3,
        title: 'Seviye 3: Stratejik Alt Hedefler',
        description: 'Kırmızı topu en alta yerleştirmek için diğer topları geçici çubuklara aktar.',
        targetMoves: 4,
        maxAllowedMoves: 10,
        pegCapacities: [3, 2, 1],
        // Başlangıç: Çubuk 1: [blue, red], Çubuk 2: [yellow], Çubuk 3: []
        initialPegs: [
            { maxCapacity: 3, balls: ['blue', 'red'] },
            { maxCapacity: 2, balls: ['yellow'] },
            { maxCapacity: 1, balls: [] }
        ],
        // Hedef: Çubuk 1: [red, yellow], Çubuk 2: [], Çubuk 3: [blue]
        targetPegs: [
            { maxCapacity: 3, balls: ['red', 'yellow'] },
            { maxCapacity: 2, balls: [] },
            { maxCapacity: 1, balls: ['blue'] }
        ]
    },
    {
        id: 4,
        title: 'Seviye 4: İleri Düzey Yönetici İşlev',
        description: 'En az hamleyle tüm topları hedef konfigürasyona ulaştır.',
        targetMoves: 5,
        maxAllowedMoves: 12,
        pegCapacities: [3, 2, 1],
        // Başlangıç: Çubuk 1: [yellow], Çubuk 2: [blue, red], Çubuk 3: []
        initialPegs: [
            { maxCapacity: 3, balls: ['yellow'] },
            { maxCapacity: 2, balls: ['blue', 'red'] },
            { maxCapacity: 1, balls: [] }
        ],
        // Hedef: Çubuk 1: [red, blue], Çubuk 2: [], Çubuk 3: [yellow]
        targetPegs: [
            { maxCapacity: 3, balls: ['red', 'blue'] },
            { maxCapacity: 2, balls: [] },
            { maxCapacity: 1, balls: ['yellow'] }
        ]
    }
];

export const PlanningTest: React.FC<PlanningTestProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'play' | 'feedback' | 'done'>('intro');
    const [levelIdx, setLevelIdx] = useState(0);
    const [pegs, setPegs] = useState<PegState[]>([]);
    const [selectedPegIdx, setSelectedPegIdx] = useState<number | null>(null);
    const [moves, setMoves] = useState(0);
    const [scores, setScores] = useState<number[]>([]);
    const [feedbackMessage, setFeedbackMessage] = useState<string>('');

    const levelStartTimeRef = useRef<number>(0);
    const firstMoveTimeRef = useRef<number>(0);
    const reactionTimesRef = useRef<number[]>([]);
    const totalMovesHistoryRef = useRef<number[]>([]);

    const currentLevel = LEVELS[levelIdx] || LEVELS[0];

    // Seviye başlatma
    const initLevel = (index: number) => {
        const lvl = LEVELS[index] || LEVELS[0];
        setPegs(JSON.parse(JSON.stringify(lvl.initialPegs)));
        setSelectedPegIdx(null);
        setMoves(0);
        setPhase('play');
        levelStartTimeRef.current = Date.now();
        firstMoveTimeRef.current = 0;
    };

    const handleStart = () => {
        setLevelIdx(0);
        setScores([]);
        reactionTimesRef.current = [];
        totalMovesHistoryRef.current = [];
        initLevel(0);
    };

    // Mevcut durum hedefle eşleşti mi kontrolü
    const isLevelSolved = (currentPegs: PegState[], targetPegs: PegState[]) => {
        if (currentPegs.length !== targetPegs.length) return false;
        for (let i = 0; i < currentPegs.length; i++) {
            const curBalls = currentPegs[i].balls;
            const tgtBalls = targetPegs[i].balls;
            if (curBalls.length !== tgtBalls.length) return false;
            for (let j = 0; j < curBalls.length; j++) {
                if (curBalls[j] !== tgtBalls[j]) return false;
            }
        }
        return true;
    };

    // Çubuğa tıklama işlemi
    const handlePegClick = (pegIdx: number) => {
        if (phase !== 'play') return;

        // 1. Durum: Hiçbir top seçili değilse, tıklanan çubuğun en üstteki topunu seç
        if (selectedPegIdx === null) {
            if (pegs[pegIdx].balls.length > 0) {
                setSelectedPegIdx(pegIdx);
            }
            return;
        }

        // 2. Durum: Aynı çubuğa tekrar tıklandıysa seçimi kaldır
        if (selectedPegIdx === pegIdx) {
            setSelectedPegIdx(null);
            return;
        }

        // 3. Durum: Farklı bir çubuğa taşımaya çalışıyor
        const sourcePeg = pegs[selectedPegIdx];
        const targetPeg = pegs[pegIdx];

        // Kapasite kontrolü (Kule kuralı)
        if (targetPeg.balls.length >= targetPeg.maxCapacity) {
            // Hedef çubuk dolu, seçimi iptal et veya o çubuğa odaklan
            if (targetPeg.balls.length > 0) {
                setSelectedPegIdx(pegIdx);
            } else {
                setSelectedPegIdx(null);
            }
            return;
        }

        // İlk hamle tepki süresini kaydet (Planlama Süresi / Latency)
        if (firstMoveTimeRef.current === 0) {
            const rt = Date.now() - levelStartTimeRef.current;
            firstMoveTimeRef.current = rt;
            reactionTimesRef.current.push(rt);
        }

        // Topu taşı
        const newPegs = JSON.parse(JSON.stringify(pegs)) as PegState[];
        const movingBall = newPegs[selectedPegIdx].balls.pop();
        if (movingBall) {
            newPegs[pegIdx].balls.push(movingBall);
        }

        const nextMoves = moves + 1;
        setPegs(newPegs);
        setSelectedPegIdx(null);
        setMoves(nextMoves);

        // Hedef kontrolü
        if (isLevelSolved(newPegs, currentLevel.targetPegs)) {
            // Başarı puanı hesaplama:
            // Optimal hamlede çözüldüyse tam puan (100)
            // Fazladan her hamle için küçük kesinti, minimum 40 taban
            const deltaMoves = Math.max(0, nextMoves - currentLevel.targetMoves);
            const levelScore = Math.max(40, Math.round(100 - deltaMoves * 15));
            
            const updatedScores = [...scores, levelScore];
            setScores(updatedScores);
            totalMovesHistoryRef.current.push(nextMoves);

            if (nextMoves === currentLevel.targetMoves) {
                setFeedbackMessage('Mükemmel! En az hamleyle harika bir plan yaptın!');
            } else {
                setFeedbackMessage('Tebrikler! Hedefe başarıyla ulaştın!');
            }

            setPhase('feedback');

            setTimeout(() => {
                if (levelIdx + 1 < LEVELS.length) {
                    const nextIdx = levelIdx + 1;
                    setLevelIdx(nextIdx);
                    initLevel(nextIdx);
                } else {
                    finishTest(updatedScores);
                }
            }, 1800);
        }
    };

    // Mevcut seviyeyi sıfırla (Çocuğa güvenli deneme hakkı)
    const handleResetLevel = () => {
        initLevel(levelIdx);
    };

    const finishTest = (finalScores: number[]) => {
        setPhase('done');
        const avgScore = finalScores.length > 0
            ? Math.round(finalScores.reduce((a, b) => a + b, 0) / finalScores.length)
            : 75;

        const avgRT = reactionTimesRef.current.length > 0
            ? Math.round(reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length)
            : 1800;

        onComplete({
            testId: 'planning',
            name: 'Planlama (Londra Kulesi)',
            score: avgScore,
            rawScore: avgScore,
            totalItems: LEVELS.length,
            avgReactionTime: avgRT,
            accuracy: avgScore,
            status: 'completed',
            timestamp: Date.now()
        });
    };

    // ─── Giriş Ekranı ─────────────────────────────────────────────
    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none relative overflow-hidden p-6 font-['Lexend']">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-pink-50/70 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-15 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-15 translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <i className="fa-solid fa-shapes text-5xl text-white animate-pulse"></i>
                    </div>
                </div>

                <div className="relative z-10 text-center max-w-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                        Nöropsikolojik Yönetici İşlev Testi
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white mt-3 mb-3">
                        Planlama Testi (Kule Oyunu)
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-medium">
                        Renkli topları çubuklar arasında taşıyarak, <span className="font-black text-indigo-600 dark:text-indigo-400">hedef modeldeki</span> dizilimi en az hamleyle oluştur!
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md text-xs font-bold">
                    <div className="flex items-center gap-2.5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm p-3 rounded-2xl border border-[var(--border-color)] shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-arrows-up-down"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] uppercase tracking-wider text-zinc-400">Kural 1</p>
                            <p className="text-zinc-800 dark:text-zinc-200 text-[11px]">Sadece en üstteki top alınabilir</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm p-3 rounded-2xl border border-[var(--border-color)] shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-layer-group"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] uppercase tracking-wider text-zinc-400">Kural 2</p>
                            <p className="text-zinc-800 dark:text-zinc-200 text-[11px]">Çubukların top sınırı vardır (3, 2, 1)</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm p-3 rounded-2xl border border-[var(--border-color)] shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-lightbulb"></i>
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] uppercase tracking-wider text-zinc-400">Strateji</p>
                            <p className="text-zinc-800 dark:text-zinc-200 text-[11px]">Önce zihninde planla, sonra taşı</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <button
                        onClick={handleStart}
                        className="group px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-3xl shadow-2xl shadow-indigo-500/30 transition-all duration-300 flex items-center gap-3 transform hover:scale-105 active:scale-95 cursor-pointer text-base sm:text-lg"
                    >
                        <i className="fa-solid fa-play group-hover:rotate-12 transition-transform"></i>
                        <span>Teste Başla</span>
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'done') return null;

    // ─── Çubuk Görselleştirme Yardımcısı ──────────────────────────
    const renderPeg = (
        peg: PegState,
        pegIdx: number,
        isInteractive: boolean,
        isSelected: boolean
    ) => {
        const isTargetFull = selectedPegIdx !== null && selectedPegIdx !== pegIdx && peg.balls.length >= peg.maxCapacity;

        return (
            <div
                key={pegIdx}
                onClick={() => isInteractive && handlePegClick(pegIdx)}
                className={`flex flex-col items-center justify-end relative transition-all duration-300 ${
                    isInteractive ? 'cursor-pointer group' : ''
                } ${isSelected ? 'scale-105' : ''}`}
                style={{ width: isInteractive ? '100px' : '65px', height: isInteractive ? '190px' : '130px' }}
            >
                {/* Seçim İndikatörü */}
                {isSelected && (
                    <div className="absolute -top-7 text-indigo-500 text-sm font-black animate-bounce flex flex-col items-center">
                        <i className="fa-solid fa-arrow-down"></i>
                    </div>
                )}

                {/* Dikey Çubuk Direği */}
                <div
                    className={`w-3.5 sm:w-4 rounded-t-full transition-colors absolute bottom-3 z-0 ${
                        isSelected
                            ? 'bg-indigo-500 shadow-md shadow-indigo-500/50'
                            : isTargetFull
                            ? 'bg-zinc-300 dark:bg-zinc-700'
                            : 'bg-zinc-300 dark:bg-zinc-600 group-hover:bg-indigo-300'
                    }`}
                    style={{
                        height: isInteractive
                            ? `${peg.maxCapacity * 48 + 18}px`
                            : `${peg.maxCapacity * 32 + 12}px`
                    }}
                />

                {/* Toplar (Aşağıdan Yukarıya Dizilir) */}
                <div className="flex flex-col-reverse items-center justify-end gap-1.5 z-10 mb-3 w-full">
                    {peg.balls.map((color, ballIdx) => {
                        const isTopBall = ballIdx === peg.balls.length - 1;
                        const isBeingCarried = isSelected && isTopBall;

                        return (
                            <div
                                key={ballIdx}
                                className={`
                                    rounded-full flex items-center justify-center font-bold text-white transition-all duration-200 border-2 select-none
                                    ${COLOR_CONFIG[color].bg}
                                    ${COLOR_CONFIG[color].border}
                                    ${COLOR_CONFIG[color].shadow}
                                    ${isInteractive ? 'w-12 h-12 text-sm shadow-md' : 'w-8 h-8 text-[10px] shadow-xs'}
                                    ${isBeingCarried ? 'scale-115 -translate-y-2 ring-4 ring-indigo-400 animate-pulse' : ''}
                                `}
                            >
                                <span className="opacity-90">{COLOR_CONFIG[color].label[0]}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Çubuk Tabanı */}
                <div
                    className={`h-3 w-full rounded-full transition-colors z-20 ${
                        isSelected
                            ? 'bg-indigo-600 shadow-sm'
                            : 'bg-zinc-400 dark:bg-zinc-600'
                    }`}
                />

                {/* Kapasite Etiketi */}
                <span className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 mt-1">
                    {peg.balls.length}/{peg.maxCapacity} Top
                </span>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-4xl mx-auto select-none gap-4 sm:gap-6 relative p-3 sm:p-6 overflow-hidden font-['Lexend']">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-pink-50/40 dark:from-indigo-950/10 dark:via-purple-950/10 dark:to-pink-950/10" />

            <div className="relative z-10 w-full flex flex-col items-center gap-4">
                {/* Üst Bilgi Barı */}
                <div className="w-full flex flex-wrap justify-between items-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 rounded-3xl border border-[var(--border-color)] shadow-xl gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl shadow-md shrink-0">
                            <i className="fa-solid fa-shapes"></i>
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                {currentLevel.title}
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                Hedefteki dizilimi oluştur
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Seviye</p>
                            <p className="text-base sm:text-lg font-black text-zinc-800 dark:text-white">
                                {currentLevel.id} / {LEVELS.length}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Hedef Hamle</p>
                            <p className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                                {currentLevel.targetMoves}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-purple-400">Senin Hamlen</p>
                            <p className={`text-base sm:text-lg font-black ${
                                moves <= currentLevel.targetMoves ? 'text-emerald-500' : 'text-amber-500'
                            }`}>
                                {moves}
                            </p>
                        </div>
                        <button
                            onClick={handleResetLevel}
                            title="Bu seviyeyi baştan dene"
                            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <i className="fa-solid fa-rotate-left"></i>
                            <span className="hidden sm:inline">Baştan Al</span>
                        </button>
                    </div>
                </div>

                {/* Ana Oyun & Hedef Panelleri */}
                <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* HEDEF MODEL (Sol/Üst Küçük Panel) */}
                    <div className="md:col-span-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-3xl p-4 border border-dashed border-indigo-200 dark:border-indigo-900/60 shadow-lg flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                HEDEF DİZİLİM
                            </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 text-center mb-3">Topları tam bu konfigürasyona getir</p>

                        <div className="flex justify-around items-end w-full px-2">
                            {currentLevel.targetPegs.map((peg, idx) => renderPeg(peg, idx, false, false))}
                        </div>
                    </div>

                    {/* AKTİF ÇALIŞMA ALANI (Büyük İnteraktif Kule) */}
                    <div className="md:col-span-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-[var(--border-color)] shadow-2xl flex flex-col items-center relative">
                        <div className="flex justify-between items-center w-full mb-3 px-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                                <i className="fa-solid fa-hand-pointer text-indigo-500"></i>
                                Topu seçmek için çubuğa tıkla, sonra hedef çubuğa bas
                            </span>
                            {selectedPegIdx !== null && (
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                    Çubuk {selectedPegIdx + 1} seçildi
                                </span>
                            )}
                        </div>

                        {phase === 'play' && (
                            <div className="flex justify-around items-end w-full px-4 py-4 min-h-[210px]">
                                {pegs.map((peg, idx) => renderPeg(peg, idx, true, selectedPegIdx === idx))}
                            </div>
                        )}

                        {phase === 'feedback' && (
                            <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300 z-30 p-6">
                                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl mb-3 shadow-xl shadow-emerald-500/30">
                                    <i className="fa-solid fa-check animate-bounce"></i>
                                </div>
                                <h4 className="text-xl sm:text-2xl font-black text-zinc-800 dark:text-zinc-100 text-center">
                                    {feedbackMessage}
                                </h4>
                                <p className="text-xs text-zinc-500 mt-1">Sonraki seviyeye geçiliyor...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alt Pedagojik İpucu */}
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-[var(--border-color)]">
                    <i className="fa-solid fa-circle-info text-indigo-500"></i>
                    <span>Topu eline almadan önce tüm hamleleri zihninde sırayla canlandır.</span>
                </div>
            </div>
        </div>
    );
};
