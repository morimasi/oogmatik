'use client';
import React, { useState, useEffect } from 'react';
import { TextPassage } from '../../../../modules/turkce-super-studyo/components/organisms/TextPassage';
import { MCQQuestion } from '../../../../modules/turkce-super-studyo/components/organisms/questions/MCQQuestion';
import { DragDropQuestion } from '../../../../modules/turkce-super-studyo/components/organisms/questions/DragDropQuestion';
import { TrueFalseQuestion } from '../../../../modules/turkce-super-studyo/components/organisms/questions/TrueFalseQuestion';
import { BookOpen, Sparkles, RefreshCw, Loader2, ChevronDown } from 'lucide-react';
import { generateFullStudioActivity } from '../../../../modules/turkce-super-studyo/ai/magicGenerator';
import { simplifyText } from '../../../../modules/turkce-super-studyo/ai/textSimplifier';
import {
    TextPassage as TextPassageType,
    Question,
} from '../../../../modules/turkce-super-studyo/types/schemas';
import { motion, AnimatePresence } from 'framer-motion';

const TOPICS = ['Doğa', 'Uzay', 'Hayvanlar', 'Arkadaşlık', 'Mevsimler', 'Teknoloji'];

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
        instruction: 'Bu hikayedeki güvercinin kanatları neye benzetilmiştir?',
        difficulty: 'KOLAY',
        targetSkill: 'ANA_FIKIR',
        learningOutcomes: ['T.2.3.1'],
        feedback: {
            correct: 'Harika! Metni çok iyi okudun.',
            incorrect: "İpucu: Metinde 'gün ışığı' ile ilgili bir benzetme var.",
        },
        options: [
            { id: 'opt-a', text: 'Altın', isCorrect: false },
            { id: 'opt-b', text: 'Gümüş', isCorrect: true },
            { id: 'opt-c', text: 'Bronz', isCorrect: false },
        ],
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

    const handleGenerate = async () => {
        setIsGenerating(true);
        setCurrentQuestionIdx(0);
        setScore(0);
        try {
            const { passage: newPassage, questions: newQuestions } = await generateFullStudioActivity(
                topic,
                gradeLevel
            );
            setPassage(newPassage);
            setQuestions(newQuestions);
        } catch {
            // Fallback already shown
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSimplify = async () => {
        setIsSimplifying(true);
        try {
            const simplified = await simplifyText({
                originalText: passage.content,
                targetGradeLevel: gradeLevel,
            });
            setPassage((prev) => ({ ...prev, content: simplified }));
        } finally {
            setIsSimplifying(false);
        }
    };

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) setScore((s) => s + 1);
        setTimeout(() => {
            setCurrentQuestionIdx((i) => Math.min(i + 1, questions.length - 1));
        }, 1200);
    };

    const currentQuestion = questions[currentQuestionIdx];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <BookOpen className="text-indigo-500" />
                        Metin & Paragraf Stüdyosu
                    </h1>
                    <p className="text-gray-600 font-medium mt-1">
                        Disleksi dostu okuma metni ve anlama soruları.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Konu seçimi */}
                    <select
                        value={topic}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTopic(e.target.value)}
                        className="bg-white border-2 border-indigo-100 text-gray-800 text-sm rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-indigo-400"
                    >
                        {TOPICS.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>

                    {/* Sınıf seviyesi */}
                    <select
                        value={gradeLevel}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setGradeLevel(Number(e.target.value) as 1 | 2 | 3 | 4)
                        }
                        className="bg-white border-2 border-indigo-100 text-gray-800 text-sm rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-indigo-400"
                    >
                        {[1, 2, 3, 4].map((g) => (
                            <option key={g} value={g}>
                                {g}. Sınıf
                            </option>
                        ))}
                    </select>

                    {/* Sadeleştir */}
                    <motion.button
                        onClick={handleSimplify}
                        disabled={isSimplifying || isGenerating}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border-2 border-teal-200 rounded-xl font-bold text-sm hover:bg-teal-100 transition-colors disabled:opacity-50"
                    >
                        {isSimplifying ? <Loader2 size={15} className="animate-spin" /> : <ChevronDown size={15} />}
                        Sadeleştir
                    </motion.button>

                    {/* AI Üret */}
                    <motion.button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <Sparkles size={15} />
                        )}
                        AI ile Üret
                    </motion.button>
                </div>
            </div>

            {/* Skor */}
            {questions.length > 0 && (
                <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                    <span>
                        Soru {Math.min(currentQuestionIdx + 1, questions.length)} / {questions.length}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-2 bg-indigo-500 rounded-full"
                            animate={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-indigo-600">
                        {score}/{questions.length} doğru
                    </span>
                </div>
            )}

            {/* Metin */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={passage.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    {isGenerating ? (
                        <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center justify-center min-h-[200px] border-2 border-gray-100 shadow-sm text-indigo-500 gap-4">
                            <Loader2 size={40} className="animate-spin" />
                            <p className="text-lg font-bold">Gemini AI metin üretiyor...</p>
                        </div>
                    ) : (
                        <TextPassage passage={passage} enableRuler={false} />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Soru */}
            {!isGenerating && currentQuestion && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {currentQuestion.type === 'MCQ' && (
                            <MCQQuestion question={currentQuestion as any} onAnswer={handleAnswer} />
                        )}
                        {currentQuestion.type === 'DRAG_DROP' && (
                            <DragDropQuestion question={currentQuestion as any} onAnswer={handleAnswer} />
                        )}
                        {currentQuestion.type === 'TRUE_FALSE' && (
                            <TrueFalseQuestion question={currentQuestion as any} onAnswer={handleAnswer} />
                        )}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Tamamlandı */}
            {!isGenerating && currentQuestionIdx >= questions.length && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-8 text-center"
                >
                    <h2 className="text-3xl font-extrabold text-indigo-800 mb-2">
                        Tebrikler! 🎉
                    </h2>
                    <p className="text-xl font-bold text-indigo-600">
                        {score}/{questions.length} soruyu doğru yanıtladın!
                    </p>
                    <motion.button
                        onClick={handleGenerate}
                        whileHover={{ scale: 1.03 }}
                        className="mt-6 px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw size={18} />
                        Yeni Metin Üret
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
}
