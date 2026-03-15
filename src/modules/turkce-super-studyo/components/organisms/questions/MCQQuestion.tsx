'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MCQQuestion as MCQQuestionType } from '../../../types/schemas';
import { CheckCircle2, XCircle } from 'lucide-react';
import { DyslexicText } from '../../atoms/DyslexicText';
import { HintButton } from '../../molecules/HintButton';

interface MCQQuestionProps {
  question: MCQQuestionType;
  onAnswer?: (isCorrect: boolean, selectedOptionId: string) => void;
}

export const MCQQuestion: React.FC<MCQQuestionProps> = ({ question, onAnswer }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOptionClick = (id: string) => {
    if (isSubmitted) return;
    setSelectedId(id);
  };

  const handleSubmit = () => {
    if (!selectedId) return;
    setIsSubmitted(true);
    const isCorrect = question.options.find((opt) => opt.id === selectedId)?.isCorrect || false;
    if (onAnswer) {
      onAnswer(isCorrect, selectedId);
    }
  };

  const isCorrect = isSubmitted && question.options.find((opt) => opt.id === selectedId)?.isCorrect;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-white rounded-3xl p-6 shadow-sm border-2 border-indigo-50"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold mb-3">
            Çoktan Seçmeli
          </span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            <DyslexicText text={question.instruction} />
          </h3>
        </div>
        <HintButton hint={question.feedback.incorrect} />
      </div>

      <div className="space-y-4 mb-8">
        {question.options.map((option, idx) => {
          const isSelected = selectedId === option.id;
          let optionStateClass = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50';

          if (isSelected && !isSubmitted) {
            optionStateClass = 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200';
          } else if (isSubmitted) {
            if (option.isCorrect) {
              optionStateClass = 'border-green-500 bg-green-50 text-green-900';
            } else if (isSelected && !option.isCorrect) {
              optionStateClass = 'border-red-500 bg-red-50 text-red-900 opacity-70';
            } else {
              optionStateClass = 'border-gray-200 opacity-50';
            }
          }

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, type: 'spring', stiffness: 400, damping: 25 }}
              whileHover={!isSubmitted ? { scale: 1.01, x: 4 } : {}}
              whileTap={!isSubmitted ? { scale: 0.98 } : {}}
              onClick={() => handleOptionClick(option.id)}
              disabled={isSubmitted}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-colors flex items-center justify-between group ${optionStateClass}`}
              aria-pressed={isSelected}
            >
              <span className="text-xl font-medium flex-1">
                <DyslexicText text={option.text} />
              </span>

              <div className="ml-4 shrink-0">
                {!isSubmitted && (
                  <motion.div
                    animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </motion.div>
                )}
                {isSubmitted && option.isCorrect && (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    <CheckCircle2 size={28} className="text-green-500" />
                  </motion.div>
                )}
                {isSubmitted && isSelected && !option.isCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, x: [0, -4, 4, -4, 4, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <XCircle size={28} className="text-red-500" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <motion.button
          onClick={handleSubmit}
          disabled={!selectedId}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
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
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CheckCircle2 size={32} className="text-green-600 shrink-0" />
            </motion.div>
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
