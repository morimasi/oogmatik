'use client';
import React, { useState } from 'react';
import { FillBlankQuestion as FillBlankQuestionType } from '../../../types/schemas';
import { DyslexicText } from '../../atoms/DyslexicText';
import { HintButton } from '../../molecules/HintButton';
import { CheckCircle2, XCircle } from 'lucide-react';

interface FillBlankQuestionProps {
  question: FillBlankQuestionType;
  onAnswer?: (isCorrect: boolean, answers: Record<string, string>) => void;
}

export const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({ question, onAnswer }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const handleInputChange = (id: string, value: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    let allCorrect = true;
    const newResults: Record<string, boolean> = {};

    question.blanks.forEach((blank) => {
      const userAnswer = (answers[blank.id] || '').trim().toLowerCase();
      const correctAnswer = blank.correctValue.trim().toLowerCase();
      const acceptedValues = blank.acceptedValues?.map((v) => v.trim().toLowerCase()) || [];

      const isBlankCorrect = userAnswer === correctAnswer || acceptedValues.includes(userAnswer);
      newResults[blank.id] = isBlankCorrect;

      if (!isBlankCorrect) allCorrect = false;
    });

    setResults(newResults);
    setIsSubmitted(true);
    if (onAnswer) {
      onAnswer(allCorrect, answers);
    }
  };

  // Split template by regex to inject inputs
  const renderTemplate = () => {
    const parts = question.template.split(/(\{blank_\d+\})/g);

    return parts.map((part, index) => {
      const match = part.match(/^\{blank_(\d+)\}$/);
      if (match) {
        const blankId = `blank_${match[1]}`;
        const isBlankCorrect = results[blankId];
        let inputClass =
          'mx-2 px-3 py-1 border-b-4 bg-gray-50 text-indigo-700 font-bold focus:outline-none focus:border-indigo-500 transition-colors w-32 text-center rounded-t-xl';

        if (isSubmitted) {
          if (isBlankCorrect) {
            inputClass =
              'mx-2 px-3 py-1 border-b-4 bg-green-50 border-green-500 text-green-700 font-bold w-32 text-center rounded-t-xl';
          } else {
            inputClass =
              'mx-2 px-3 py-1 border-b-4 bg-red-50 border-red-500 text-red-700 font-bold w-32 text-center rounded-t-xl';
          }
        }

        return (
          <span key={index} className="inline-block relative">
            <input
              type="text"
              value={answers[blankId] || ''}
              onChange={(e) => handleInputChange(blankId, e.target.value)}
              disabled={isSubmitted}
              className={inputClass}
              aria-label={`Boşluk ${match[1]}`}
            />
            {isSubmitted && isBlankCorrect && (
              <CheckCircle2 size={18} className="absolute -top-3 -right-2 text-green-500" />
            )}
            {isSubmitted && !isBlankCorrect && (
              <XCircle size={18} className="absolute -top-3 -right-2 text-red-500" />
            )}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const isAllCorrect = Object.values(results).every((v) => v === true);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-indigo-50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold mb-3">
            Boşluk Doldurma
          </span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            <DyslexicText text={question.instruction} />
          </h3>
        </div>
        <HintButton hint={question.feedback.incorrect} />
      </div>

      {question.wordBank && question.wordBank.length > 0 && (
        <div className="mb-8 p-4 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-200">
          <p className="text-sm text-amber-800 font-bold mb-3 uppercase tracking-wider">
            Kelime Havuzu:
          </p>
          <div className="flex flex-wrap gap-3">
            {question.wordBank.map((word, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-white border-2 border-amber-300 text-amber-900 font-bold rounded-xl shadow-sm text-lg select-all"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-2xl leading-loose font-medium text-gray-800 mb-10 py-6 px-4 bg-gray-50 rounded-2xl border border-gray-100">
        {renderTemplate()}
      </div>

      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== question.blanks.length}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          Cevabı Kontrol Et
        </button>
      ) : (
        <div
          className={`p-5 rounded-2xl border-2 flex gap-4 items-start ${isAllCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
        >
          {isAllCorrect ? (
            <CheckCircle2 size={32} className="text-green-600 shrink-0" />
          ) : (
            <XCircle size={32} className="text-red-600 shrink-0" />
          )}
          <div>
            <h4
              className={`text-xl font-bold mb-1 ${isAllCorrect ? 'text-green-800' : 'text-red-800'}`}
            >
              {isAllCorrect ? 'Mükemmel!' : 'Bazı Boşluklar Hatalı'}
            </h4>
            <p
              className={`text-lg font-medium ${isAllCorrect ? 'text-green-700' : 'text-red-700'}`}
            >
              {isAllCorrect ? question.feedback.correct : question.feedback.incorrect}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
