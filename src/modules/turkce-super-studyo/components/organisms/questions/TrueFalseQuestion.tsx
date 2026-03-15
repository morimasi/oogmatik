'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { DyslexicText } from '../../atoms/DyslexicText';
import { HintButton } from '../../molecules/HintButton';
import { BaseQuestion } from '../../../types/schemas';

interface TrueFalseQuestionType extends BaseQuestion {
    type: 'TRUE_FALSE';
    statement: string;
    isTrue: boolean;
}

interface TrueFalseQuestionProps {
    question: TrueFalseQuestionType;
    onAnswer?: (isCorrect: boolean) => void;
}

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({ question, onAnswer }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSelect = (value: boolean) => {
        if (isSubmitted) return;
        setSelectedAnswer(value);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;
        setIsSubmitted(true);
        const correct = selectedAnswer === question.isTrue;
        if (onAnswer) onAnswer(correct);
    };

    const isCorrect = isSubmitted && selectedAnswer === question.isTrue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-white rounded-3xl p-6 shadow-sm border-2 border-emerald-50"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold mb-3">
                        Doğru / Yanlış
                    </span>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        <DyslexicText text={question.instruction} />
                    </h3>
                </div>
                <HintButton hint={question.feedback.incorrect} />
            </div>

            {/* Statement */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 border-2 border-gray-100">
                <p className="text-xl font-medium text-gray-800 leading-relaxed">
                    <DyslexicText text={question.statement} />
                </p>
            </div>

            {/* True/False Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                    { value: true, label: 'Doğru', icon: <ThumbsUp size={24} />, color: 'green' },
                    { value: false, label: 'Yanlış', icon: <ThumbsDown size={24} />, color: 'red' },
                ].map((option) => {
                    const isSelected = selectedAnswer === option.value;
                    let btnClass = 'border-gray-200 hover:border-gray-400 text-gray-600';

                    if (isSelected && !isSubmitted) {
                        btnClass =
                            option.value === true
                                ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200'
                                : 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200';
                    } else if (isSubmitted) {
                        if (option.value === question.isTrue) {
                            btnClass = 'border-green-500 bg-green-50 text-green-700';
                        } else if (isSelected && option.value !== question.isTrue) {
                            btnClass = 'border-red-500 bg-red-50 text-red-700 opacity-60';
                        } else {
                            btnClass = 'border-gray-200 opacity-40';
                        }
                    }

                    return (
                        <motion.button
                            key={option.label}
                            whileHover={!isSubmitted ? { scale: 1.03 } : {}}
                            whileTap={!isSubmitted ? { scale: 0.97 } : {}}
                            onClick={() => handleSelect(option.value)}
                            disabled={isSubmitted}
                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-colors font-bold text-xl ${btnClass}`}
                        >
                            {option.icon}
                            {option.label}
                        </motion.button>
                    );
                })}
            </div>

            {!isSubmitted ? (
                <motion.button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-xl font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    Cevabı Kontrol Et
                </motion.button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`p-5 rounded-2xl border-2 flex gap-4 items-start ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                >
                    {isCorrect ? (
                        <CheckCircle2 size={32} className="text-green-600 shrink-0" />
                    ) : (
                        <XCircle size={32} className="text-red-600 shrink-0" />
                    )}
                    <div>
                        <h4
                            className={`text-xl font-bold mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                        >
                            {isCorrect ? 'Harika! Doğru Bildin 🎉' : 'Biraz Daha Düşünelim'}
                        </h4>
                        <p className={`text-lg font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {isCorrect ? question.feedback.correct : question.feedback.incorrect}
                        </p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export type { TrueFalseQuestionType };
