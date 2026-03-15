'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import { DyslexicText } from '../../atoms/DyslexicText';
import { HintButton } from '../../molecules/HintButton';
import { BaseQuestion } from '../../../types/schemas';

interface OpenEndedQuestionType extends BaseQuestion {
    type: 'OPEN_ENDED';
    sampleAnswer: string;
    minLength?: number;
}

interface OpenEndedQuestionProps {
    question: OpenEndedQuestionType;
    onAnswer?: (answer: string) => void;
}

export const OpenEndedQuestion: React.FC<OpenEndedQuestionProps> = ({ question, onAnswer }) => {
    const [answer, setAnswer] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const minLength = question.minLength || 10;

    const handleSubmit = () => {
        if (answer.trim().length < minLength) return;
        setIsSubmitted(true);
        if (onAnswer) onAnswer(answer);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-white rounded-3xl p-6 shadow-sm border-2 border-violet-50"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <span className="inline-block px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-bold mb-3">
                        Açık Uçlu Soru
                    </span>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        <DyslexicText text={question.instruction} />
                    </h3>
                </div>
                <HintButton hint={question.feedback.incorrect} />
            </div>

            {/* Answer Textarea */}
            <div className="mb-6">
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={isSubmitted}
                    placeholder="Cevabını buraya yaz..."
                    rows={5}
                    className="w-full p-5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all resize-none text-xl text-gray-700 font-medium disabled:opacity-60 disabled:bg-gray-100"
                    style={{
                        fontFamily: 'var(--dyslexia-font-family)',
                        lineHeight: 'var(--dyslexia-line-height, 1.75)',
                    }}
                />
                <div className="flex justify-between items-center mt-2 px-1">
                    <span
                        className={`text-sm font-bold ${answer.trim().length >= minLength ? 'text-green-600' : 'text-gray-400'}`}
                    >
                        {answer.trim().length} / {minLength}+ karakter
                    </span>
                    {answer.trim().length >= minLength && !isSubmitted && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-sm font-bold text-green-600 flex items-center gap-1"
                        >
                            <CheckCircle2 size={14} />
                            Yeterli uzunluk
                        </motion.span>
                    )}
                </div>
            </div>

            {!isSubmitted ? (
                <motion.button
                    onClick={handleSubmit}
                    disabled={answer.trim().length < minLength}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl bg-violet-600 text-white text-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-3"
                >
                    <Send size={22} />
                    Cevabı Gönder
                </motion.button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="space-y-4"
                >
                    <div className="p-5 rounded-2xl border-2 bg-green-50 border-green-200">
                        <h4 className="text-xl font-bold text-green-800 mb-2">Cevabın Kaydedildi 🎉</h4>
                        <p className="text-lg font-medium text-green-700">{question.feedback.correct}</p>
                    </div>

                    <div className="p-5 rounded-2xl border-2 bg-violet-50 border-violet-200">
                        <h4 className="text-lg font-bold text-violet-800 mb-2">Örnek Cevap</h4>
                        <p className="text-lg font-medium text-violet-700 leading-relaxed">
                            {question.sampleAnswer}
                        </p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export type { OpenEndedQuestionType };
