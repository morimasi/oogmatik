
import React, { useState, useEffect, useRef } from 'react';
import { SubTestResult } from '../../../types';
import type { CognitiveProfileMetrics } from '../services/cognitiveAdaptiveService';
import { useAdaptiveContent } from '../services/useAdaptiveContent';
import { generatePhonologicalSequences, type PhonologicalSequence, type SequenceType } from '../services/adaptiveTestContent';
import type { AIGeneratedTestItems } from '../../../services/aiAssessmentGenerator';

interface PhonologicalLoopTestProps {
    onComplete: (result: SubTestResult) => void;
    studentProfile?: CognitiveProfileMetrics;
}

const FALLBACK_PROFILE: CognitiveProfileMetrics = {
    studentName: 'Öğrenci',
    age: 8,
    grade: '2. Sınıf',
    diagnosis: [],
    strengths: [],
    weaknesses: [],
};

const SEQUENCE_TYPES: SequenceType[] = ['syllable', 'word', 'digit', 'reverse', 'letter', 'mixed'];

/** AI çıktısını güvenli biçimde PhonologicalSequence[] tipine dönüştürür. */
const mapAiToSequences = (ai: AIGeneratedTestItems): PhonologicalSequence[] | null => {
    try {
        const sequences: PhonologicalSequence[] = [];
        ai.items.forEach((raw: any, idx: number) => {
            if (!raw || !Array.isArray(raw.items) || raw.items.length < 2) return;
            const type: SequenceType = SEQUENCE_TYPES.includes(raw.type) ? raw.type : 'word';
            sequences.push({
                items: raw.items.map(String),
                level: typeof raw.level === 'number' ? raw.level : idx + 1,
                type,
            });
        });
        return sequences.length >= 4 ? sequences : null;
    } catch {
        return null;
    }
};


type AnswerStatus = {
    item: string;
    isCorrect: boolean;
    userInput: string;
};

export const PhonologicalLoopTest: React.FC<PhonologicalLoopTestProps> = ({ onComplete, studentProfile }) => {
    const profile = studentProfile ?? FALLBACK_PROFILE;
    const { items: sequences, meta, loading, regenerate } = useAdaptiveContent<PhonologicalSequence[]>({
        domain: 'phonological_loop',
        profile,
        buildLocal: (params, rng) => generatePhonologicalSequences(params, rng),
        mapAi: (ai) => mapAiToSequences(ai),
    });

    const [phase, setPhase] = useState<'intro' | 'show' | 'recall' | 'feedback' | 'done'>('intro');
    const [seqIndex, setSeqIndex] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [showItemIndex, setShowItemIndex] = useState(-1);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [feedbackResults, setFeedbackResults] = useState<AnswerStatus[]>([]);
    const [lives, setLives] = useState(3);
    const totalCorrect = useRef(0);
    const totalItems = useRef(0);
    const reactionTimes = useRef<number[]>([]);
    const recallStartTime = useRef(0);

    const currentSeq = sequences[seqIndex];

    const handleShowHint = () => {
        if (phase !== 'recall') return;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 2500); // 2.5 saniye sonra kaybolur
    };

    const startShowSequence = () => {
        setSelectedItems([]);
        setShowItemIndex(0);
        setPhase('show');
        setShowHint(false); // Yeni dizide ipucu sıfırlansın
    };

    // Sırayı göster — her öğeyi 800ms göster
    useEffect(() => {
        if (phase !== 'show') return;
        if (showItemIndex < 0) return;

        if (showItemIndex >= currentSeq.items.length) {
            // Tüm öğeler gösterildi — geri çağırma moduna geç
            const t = setTimeout(() => {
                setShowItemIndex(-1);
                recallStartTime.current = Date.now();
                setPhase('recall');
            }, 600);
            return () => clearTimeout(t);
        }

        const t = setTimeout(() => {
            setShowItemIndex(prev => prev + 1);
        }, 850);
        return () => clearTimeout(t);
    }, [phase, showItemIndex, currentSeq]);

    const handleOptionClick = (item: string) => {
        if (phase !== 'recall') return;

        const newSelected = [...selectedItems, item];
        setSelectedItems(newSelected);

        if (newSelected.length === 1) {
            reactionTimes.current.push(Date.now() - recallStartTime.current);
        }

        // Tam seçim yapıldı mı?
        if (newSelected.length === currentSeq.items.length) {
            // Reverse tipte: beklenen sıra ters
            const expectedOrder = currentSeq.type === 'reverse'
                ? [...currentSeq.items].reverse()
                : currentSeq.items;
            // Değerlendirme
            const results: AnswerStatus[] = expectedOrder.map((expected, idx) => ({
                item: expected,
                isCorrect: newSelected[idx] === expected,
                userInput: newSelected[idx]
            }));
            const correctInSeq = results.filter(r => r.isCorrect).length;
            totalCorrect.current += correctInSeq;
            totalItems.current += currentSeq.items.length;

            setFeedbackResults(results);
            setPhase('feedback');

            const allCorrect = correctInSeq === currentSeq.items.length;
            if (!allCorrect) {
                setLives(prev => prev - 1);
            }

            setTimeout(() => {
                const nextIdx = seqIndex + 1;
                if (nextIdx >= sequences.length || (lives - (allCorrect ? 0 : 1)) <= 0) {
                    finish();
                } else {
                    setSeqIndex(nextIdx);
                    setFeedbackResults([]);
                    setSelectedItems([]);
                    startShowSequence();
                }
            }, 1800);
        }
    };

    const finish = () => {
        setPhase('done');
        const accuracy = totalItems.current > 0
            ? (totalCorrect.current / totalItems.current) * 100
            : 0;
        const avgRT = reactionTimes.current.length > 0
            ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
            : 0;

        onComplete({
            testId: 'phonological_loop',
            name: 'Fonolojik Döngü',
            score: Math.round(accuracy),
            rawScore: totalCorrect.current,
            totalItems: totalItems.current,
            avgReactionTime: Math.round(avgRT),
            accuracy: Math.round(accuracy),
            status: 'completed',
            timestamp: Date.now()
        });
    };

    // Mevcut dizi için seçenek butonları (karıştırılmış)
    const options = React.useMemo(() => {
        return [...currentSeq.items].sort(() => Math.random() - 0.5);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seqIndex, sequences]);

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-8 animate-in fade-in select-none">
                <div className="w-20 h-20 rounded-2xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                    <i className="fa-solid fa-volume-high text-4xl text-rose-500"></i>
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-3">Fonolojik Döngü</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Ekranda beliren <span className="font-bold text-rose-600">hece/kelime dizisini</span> sırayla hatırla
                        ve aynı sırada seç. Her turda dizi uzar!
                    </p>
                </div>
                <div className="flex gap-3 text-xs text-zinc-500">
                    <div className="flex items-center gap-1"><i className="fa-solid fa-circle-dot text-rose-400"></i> Gör</div>
                    <div className="text-zinc-300">→</div>
                    <div className="flex items-center gap-1"><i className="fa-solid fa-brain text-rose-400"></i> Hafızala</div>
                    <div className="text-zinc-300">→</div>
                    <div className="flex items-center gap-1"><i className="fa-solid fa-hand-pointer text-rose-400"></i> Aynı Sırayla Seç</div>
                </div>
                <p className="text-xs font-bold text-rose-500">
                    <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
                    {meta.source === 'ai' ? 'AI destekli' : 'Profile göre ölçeklenmiş'} · {meta.difficultyLabel}
                </p>
                <button
                    onClick={async () => {
                        totalCorrect.current = 0; totalItems.current = 0; reactionTimes.current = [];
                        setSeqIndex(0); setLives(3); setFeedbackResults([]); setSelectedItems([]);
                        await regenerate();
                        startShowSequence();
                    }}
                    disabled={loading}
                    className="px-8 py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
                >
                    {loading
                        ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Diziler Hazırlanıyor...</>
                        : <><i className="fa-solid fa-play"></i> Teste Başla</>}
                </button>
            </div>
        );
    }

    if (phase === 'done') return null;

    const levelLabel = currentSeq.type === 'syllable' ? 'Heceler' : currentSeq.type === 'word' ? 'Kelimeler' : currentSeq.type === 'reverse' ? '⬅ Ters Sıra' : currentSeq.type === 'letter' ? 'Harfler' : currentSeq.type === 'mixed' ? 'Karışık' : 'Rakamlar';

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-lg mx-auto select-none gap-6 relative">
            {/* İpucu Kutusu */}
            {showHint && phase === 'recall' && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-rose-500 text-white px-4 py-3 rounded-xl shadow-lg border-2 border-rose-600 max-w-xs">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-lightbulb text-yellow-200"></i>
                            <span className="text-sm font-bold">
                                {currentSeq.type === 'reverse' 
                                    ? 'Öğeleri TERSTEN sırayla seçmelisin!' 
                                    : 'Öğeleri GÖRDÜĞÜN sırayla seçmelisin!'}
                            </span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-rose-600"></div>
                    </div>
                </div>
            )}

            {/* Başlık */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        Seviye {currentSeq.level} — {levelLabel}
                    </span>
                    <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <i key={i} className={`fa-solid fa-heart text-xs ${i < lives ? 'text-rose-500' : 'text-zinc-300'}`} />
                        ))}
                    </div>
                </div>

                {/* İlerleme */}
                <div className="w-48 h-1.5 bg-zinc-200 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${(seqIndex / Math.max(1, sequences.length)) * 100}%` }} />
                </div>
            </div>

            {/* Göster Aşaması */}
            {phase === 'show' && (
                <div className="flex flex-col items-center gap-8">
                    <p className="text-sm text-zinc-400 font-bold">Sırayla ezberle...</p>
                    <div className="flex gap-4">
                        {currentSeq.items.map((item, idx) => (
                            <div
                                key={idx}
                                className={`min-w-[64px] h-16 px-4 rounded-2xl flex items-center justify-center text-2xl font-black border-2 transition-all duration-300
                                    ${idx === showItemIndex
                                        ? 'bg-rose-500 text-white border-rose-500 scale-110 shadow-xl shadow-rose-500/30'
                                        : idx < showItemIndex
                                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-400 border-rose-200 dark:border-rose-800'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-transparent border-zinc-200 dark:border-zinc-700'
                                    }`}
                            >
                                {idx <= showItemIndex ? item : '?'}
                            </div>
                        ))}
                    </div>
                    <div className="w-6 h-6 border-4 border-rose-500 border-t-transparent rounded-full animate-spin opacity-60" />
                </div>
            )}

            {/* Geri Çağırma Aşaması */}
            {phase === 'recall' && (
                <div className="flex flex-col items-center gap-6 w-full">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-rose-500 font-black uppercase tracking-widest">
                            <i className="fa-solid fa-hand-pointer mr-2"></i>
                            {currentSeq.type === 'reverse' ? 'TERS sırayla seç! ⬅' : 'Aynı sırayla seç!'}
                        </p>
                        <button
                            onClick={handleShowHint}
                            disabled={showHint}
                            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                            <i className="fa-solid fa-lightbulb"></i>
                            İpucu
                        </button>
                    </div>

                    {/* Seçilen kutular */}
                    <div className="flex gap-3">
                        {currentSeq.items.map((_, idx) => (
                            <div
                                key={idx}
                                className={`min-w-[60px] h-14 px-3 rounded-xl flex items-center justify-center text-lg font-black border-2 transition-all
                                    ${idx < selectedItems.length
                                        ? 'bg-rose-100 dark:bg-rose-900/30 border-rose-400 text-rose-600'
                                        : idx === selectedItems.length
                                            ? 'border-rose-400 border-dashed bg-rose-50 dark:bg-rose-900/10 animate-pulse'
                                            : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800'
                                    }`}
                            >
                                {idx < selectedItems.length ? selectedItems[idx] : ''}
                            </div>
                        ))}
                    </div>

                    {/* Seçenek butonları */}
                    <div className="flex gap-3 flex-wrap justify-center">
                        {options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleOptionClick(opt)}
                                className="px-6 py-3 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700
                                           hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20
                                           rounded-2xl text-xl font-black text-zinc-700 dark:text-zinc-200
                                           transition-all active:scale-95 shadow-md"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Geri Bildirim Aşaması */}
            {phase === 'feedback' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-3">
                        {feedbackResults.map((res, idx) => (
                            <div
                                key={idx}
                                className={`min-w-[64px] h-16 px-4 rounded-2xl flex items-center justify-center text-xl font-black border-2 transition-all
                                    ${res.isCorrect
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-red-500 text-white border-red-500'
                                    }`}
                            >
                                {res.item}
                            </div>
                        ))}
                    </div>
                    <p className={`text-sm font-bold ${feedbackResults.every(r => r.isCorrect) ? 'text-green-500' : 'text-red-500'}`}>
                        {feedbackResults.every(r => r.isCorrect)
                            ? '🎉 Mükemmel! Hepsini doğru sıraladın.'
                            : `${feedbackResults.filter(r => r.isCorrect).length}/${feedbackResults.length} doğru sıraladın.`
                        }
                    </p>
                </div>
            )}
        </div>
    );
};
