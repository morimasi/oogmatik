import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineTextEditor } from '../../../components/organisms/spelling/InlineTextEditor';
import { SpellingCorrectQuestion as SpellingCorrectQuestionType } from '../../../types/schemas';
import { SpellCheck } from 'lucide-react';

interface Props {
    question: SpellingCorrectQuestionType;
    onAnswer: (isCorrect: boolean) => void;
}

export function SpellingCorrectQuestion({ question, onAnswer }: Props) {
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const handleComplete = (correctCount: number) => {
        const totalErrors = question.errors.length;
        const allCorrect = correctCount === totalErrors;
        setScore(correctCount);
        setCompleted(true);
        setTimeout(() => onAnswer(allCorrect), 1500);
    };

    return (
        <div className="space-y-4">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <SpellCheck size={13} />
                    Yazım Düzeltme
                </span>
                <span
                    className={`px-2 py-1 text-xs font-bold rounded-full ${question.difficulty === 'KOLAY'
                            ? 'bg-green-100 text-green-700'
                            : question.difficulty === 'ORTA'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                >
                    {question.difficulty}
                </span>
            </div>

            {/* InlineTextEditor — uses the real component API */}
            <InlineTextEditor
                instruction={question.instruction}
                textParts={question.textParts}
                errors={question.errors}
                onComplete={handleComplete}
            />

            {/* Result feedback */}
            <AnimatePresence>
                {completed && score !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl text-center font-bold text-lg ${score === question.errors.length
                                ? 'bg-green-50 text-green-800 border-2 border-green-200'
                                : 'bg-orange-50 text-orange-800 border-2 border-orange-200'
                            }`}
                    >
                        {score === question.errors.length
                            ? '🎉 ' + question.feedback.correct
                            : `💡 ${question.errors.length} hatadan ${score} tanesini düzelttiniz. ${question.feedback.incorrect}`}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
