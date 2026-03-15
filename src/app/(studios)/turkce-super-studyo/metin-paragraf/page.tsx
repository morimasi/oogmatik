'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { TextPassage } from '../../../../modules/turkce-super-studyo/components/organisms/TextPassage';
import { QuestionRenderer } from '../../../../modules/turkce-super-studyo/components/organisms/questions/QuestionRenderer';
import { BookOpen, Sparkles, RefreshCw, Loader2, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { generateFullStudioActivity } from '../../../../modules/turkce-super-studyo/ai/magicGenerator';
import { simplifyText } from '../../../../modules/turkce-super-studyo/ai/textSimplifier';
import {
    TextPassage as TextPassageType,
    Question,
} from '../../../../modules/turkce-super-studyo/types/schemas';
import { motion, AnimatePresence } from 'framer-motion';

const TOPICS = ['Doğa', 'Uzay', 'Hayvanlar', 'Arkadaşlık', 'Mevsimler', 'Teknoloji', 'Spor', 'Müzik'];

const FALLBACK_PASSAGE: TextPassageType = {
    id: 'tp-fallback',
    title: 'Gümüş Kanatlı Güvercin',
    content:
        'Bir zamanlar gökyüzünün en yükseklerinde süzülen, kanatları gün ışığında gümüş gibi parlayan bir güvercin varmış. Bu güvercin, sadece bulutların ötesindeki bahçeleri bilirmiş. Bir gün yere inmeye karar vermiş ve küçük bir çocuğun penceresine konmuş.',
    metadata: {
        gradeLevel: 2,
        difficulty: 'KOLAY',
        theme: 'HIKAYE',
        wordCount: 42,
        readabilityScore: 85,
        estimatedReadingTimeMs: 60000,
    },
    learningOutcomes: ['T.2.3.1'],
};

const FALLBACK_QUESTIONS: Question[] = [
    {
        id: 'q-fallback-1',
        textId: 'tp-fallback',
        type: 'MCQ',
        instruction: 'Bu hikayedeki güvercinin kanatları nasıl tanımlanmıştır?',
        difficulty: 'KOLAY',
        targetSkill: 'ANA_FIKIR',
        learningOutcomes: ['T.2.3.1'],
        feedback: { correct: 'Harika! Metni çok iyi okudun.', incorrect: "İpucu: 'gün ışığı' ile ilgili bir benzetme var." },
        options: [
            { id: 'opt-a', text: 'Altın gibi parlayan', isCorrect: false },
            { id: 'opt-b', text: 'Gümüş gibi parlayan', isCorrect: true },
            { id: 'opt-c', text: 'Bronz renkli', isCorrect: false },
        ],
    },
    {
        id: 'q-fallback-2',
        textId: 'tp-fallback',
        type: 'TRUE_FALSE',
        instruction: 'Aşağıdaki cümle doğru mu?',
        difficulty: 'KOLAY',
        targetSkill: 'ANA_FIKIR',
        learningOutcomes: ['T.2.3.2'],
        feedback: { correct: 'Tebrikler doğru bildin!', incorrect: 'Tekrar oku.' },
        statement: 'Güvercin bir çocuğun penceresine konmuştur.',
        isTrue: true,
    },
];

export default function MetinParagrafPage() {
    const [passage, setPassage] = useState<TextPassageType>(FALLBACK_PASSAGE);
    const [questions, setQuestions] = useState<Question[]>(FALLBACK_QUESTIONS);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSimplifying, setIsSimplifying] = useState(false);
    const [topic, setTopic] = useState('Doğa');
    const [gradeLevel, setGradeLevel] = useState<1 | 2 | 3 | 4>(2);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [showRuler, setShowRuler] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // FAZ E — E2: useMemo okunabilirlik skoru gösterimi
    const readabilityLabel = useMemo(() => {
        const r = passage.metadata.readabilityScore;
        if (r >= 90) return { text: '1. Sınıf Seviyesi', color: 'text-green-700 bg-green-50' };
        if (r >= 70) return { text: '2. Sınıf Seviyesi', color: 'text-teal-700 bg-teal-50' };
        if (r >= 50) return { text: '3. Sınıf Seviyesi', color: 'text-amber-700 bg-amber-50' };
        return { text: '4.+ Sınıf Seviyesi', color: 'text-red-700 bg-red-50' };
    }, [passage.metadata.readabilityScore]);

    const handleGenerate = useCallback(async () => {
        setIsGenerating(true);
        setCurrentQuestionIdx(0);
        setScore(0);
        setIsComplete(false);
        try {
            const { passage: newPassage, questions: newQuestions } = await generateFullStudioActivity(topic, gradeLevel);
            setPassage(newPassage);
            setQuestions(newQuestions.length > 0 ? newQuestions : FALLBACK_QUESTIONS);
        } catch {
            // fallback zaten state'te
        } finally {
            setIsGenerating(false);
        }
    }, [topic, gradeLevel]);

    const handleSimplify = useCallback(async () => {
        setIsSimplifying(true);
        try {
            const simplified = await simplifyText({ originalText: passage.content, targetGradeLevel: gradeLevel });
            setPassage((prev) => ({ ...prev, content: simplified }));
        } finally {
            setIsSimplifying(false);
        }
    }, [passage.content, gradeLevel]);

    // A3 Fix: handleAnswer idx artık doğru çalışıyor
    const handleAnswer = useCallback((isCorrect: boolean) => {
        if (isCorrect) setScore((s) => s + 1);
        setTimeout(() => {
            setCurrentQuestionIdx((i) => {
                const next = i + 1;
                if (next >= questions.length) setIsComplete(true);
                return next;
            });
        }, 1400);
    }, [questions.length]);

    const currentQuestion = questions[currentQuestionIdx];
    const progress = questions.length > 0 ? (currentQuestionIdx / questions.length) * 100 : 0;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <BookOpen className="text-indigo-500" />
                        Metin & Paragraf Stüdyosu
                    </h1>
                    <p className="text-gray-600 font-medium mt-1">Disleksi dostu okuma + AI soru üretimi.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <select value={topic} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTopic(e.target.value)}
                        className="bg-white border-2 border-indigo-100 text-gray-800 text-sm rounded-xl px-3 py-2 font-bold focus:outline-none">
                        {TOPICS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <select value={gradeLevel} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGradeLevel(Number(e.target.value) as 1 | 2 | 3 | 4)}
                        className="bg-white border-2 border-indigo-100 text-gray-800 text-sm rounded-xl px-3 py-2 font-bold focus:outline-none">
                        {[1, 2, 3, 4].map((g) => <option key={g} value={g}>{g}. Sınıf</option>)}
                    </select>
                    <motion.button onClick={() => setShowRuler(v => !v)} whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-xl border-2 transition-colors ${showRuler ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`} title="Okuma Cetveli">
                        {showRuler ? <EyeOff size={16} /> : <Eye size={16} />}
                    </motion.button>
                    <motion.button onClick={handleSimplify} disabled={isSimplifying || isGenerating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="px-3 py-2 bg-teal-50 text-teal-700 border-2 border-teal-200 rounded-xl font-bold text-sm hover:bg-teal-100 disabled:opacity-50 flex items-center gap-1">
                        {isSimplifying ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />} Sadeleştir
                    </motion.button>
                    <motion.button onClick={handleGenerate} disabled={isGenerating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md disabled:opacity-50 flex items-center gap-1">
                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI Üret
                    </motion.button>
                </div>
            </div>

            {/* Okunabilirlik + Progress */}
            {questions.length > 0 && (
                <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${readabilityLabel.color}`}>{readabilityLabel.text}</span>
                    <span>Soru {Math.min(currentQuestionIdx + 1, questions.length)}/{questions.length}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div className="h-2 bg-indigo-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                    </div>
                    <span className="text-indigo-600">{score}/{questions.length} ✓</span>
                </div>
            )}

            {/* Metin */}
            <AnimatePresence mode="wait">
                <motion.div key={passage.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {isGenerating ? (
                        <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center justify-center min-h-[200px] border-2 border-gray-100 shadow-sm text-indigo-500 gap-4">
                            <Loader2 size={40} className="animate-spin" />
                            <p className="text-lg font-bold">Gemini AI metin üretiyor...</p>
                        </div>
                    ) : (
                        // C1: enableRuler aktif (kullanıcı toggle ile kontrol ediyor)
                        <TextPassage passage={passage} enableRuler={showRuler} />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Soru — QuestionRenderer (A1) */}
            {!isGenerating && !isComplete && currentQuestion && (
                <AnimatePresence mode="wait">
                    <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <QuestionRenderer question={currentQuestion} onAnswer={handleAnswer} />
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Tamamlandı — A3 fix: isComplete state kontrolü */}
            {!isGenerating && isComplete && (
                <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-8 text-center">
                    <h2 className="text-3xl font-extrabold text-indigo-800 mb-2">Tebrikler! 🎉</h2>
                    <p className="text-xl font-bold text-indigo-600 mb-6">{score}/{questions.length} soruyu doğru yanıtladın!</p>
                    <motion.button onClick={handleGenerate} whileHover={{ scale: 1.03 }}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 flex items-center gap-2 mx-auto">
                        <RefreshCw size={18} /> Yeni Metin Üret
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
}
